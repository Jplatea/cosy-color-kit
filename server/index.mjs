/**
 * Backend de visitas de culowypililarge.com.
 *
 * Sirve las dos rutas que espera el panel del frontend:
 *
 *   GET  /api/stats  -> { total, today, online, pages, days, countries }
 *   POST /api/visit  -> { sections: string[], pais?: "ES" }   (204)
 *
 * Sin dependencias: solo Node. Los datos se guardan en un JSON al lado de
 * este fichero, así que arranca en cualquier sitio sin montar una base de
 * datos. Si el proyecto crece, `load`/`persist` son los dos únicos puntos que
 * hay que cambiar para llevarlo a Postgres o Redis.
 *
 * Privacidad — esto es deliberado, no un descuido:
 *   · No se guarda ninguna IP. Para saber si dos peticiones son del mismo
 *     visitante se usa un hash con sal que rota cada día, así que el dato deja
 *     de ser reversible al día siguiente.
 *   · Del país solo se guarda el código (ES, MX…), nunca ciudad ni coordenadas.
 *   · Por defecto NO se llama a ningún servicio de geolocalización. Se usan las
 *     cabeceras que ya añade el proveedor de hosting (Cloudflare, Vercel…).
 *     Para activar una consulta externa hay que pedirlo con CYP_GEO_URL.
 *
 * Variables de entorno:
 *   PORT              puerto (8787 por defecto)
 *   CYP_DATA          ruta del JSON de datos
 *   CYP_STATS_SECRET  sal del hash de visitante (si falta se genera y se guarda)
 *   CYP_GEO_URL       plantilla de geolocalización, con {ip}. Ej:
 *                     https://ipapi.co/{ip}/json/
 *   CYP_SERVE_DIST    "1" para servir también el build de `dist/`
 */

import { createServer } from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { readFile, writeFile, rename, mkdir, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { dirname, join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA_FILE = process.env.CYP_DATA || join(HERE, "data", "stats.json");
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 8787;

const DAYS_KEPT = 14;
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const MAX_BODY_BYTES = 4 * 1024;

/** Solo se contabilizan estas secciones: evita que nadie infle claves a mano. */
const SECTIONS = new Set(["inicio", "videos", "hablar", "vestidor", "poemas"]);

const today = () => new Date().toISOString().slice(0, 10);
const dayKey = (offset) =>
  new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);

// ---------------------------------------------------------------- estado

const empty = () => ({
  secret: randomBytes(24).toString("hex"),
  total: 0,
  days: {},
  pages: {},
  countries: {},
  /** hash de visitante -> último día en que se le contó */
  visitors: {},
});

let db = empty();
/** hash de visitante -> timestamp, solo en memoria: "ahora mismo" no se persiste. */
const online = new Map();

async function load() {
  try {
    const raw = JSON.parse(await readFile(DATA_FILE, "utf8"));
    db = { ...empty(), ...raw };
    if (process.env.CYP_STATS_SECRET) db.secret = process.env.CYP_STATS_SECRET;
  } catch {
    db = empty();
    if (process.env.CYP_STATS_SECRET) db.secret = process.env.CYP_STATS_SECRET;
    await persistNow();
  }
}

let persistTimer;
let persisting = false;

/** Escritura atómica: primero a un temporal, luego rename. */
async function persistNow() {
  if (persisting) return;
  persisting = true;
  try {
    await mkdir(dirname(DATA_FILE), { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(db), "utf8");
    await rename(tmp, DATA_FILE);
  } catch (err) {
    console.error("[stats] no se pudo guardar:", err.message);
  } finally {
    persisting = false;
  }
}

/** Agrupa escrituras: una visita por persona no merece un fsync cada vez. */
function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => void persistNow(), 2000);
  persistTimer.unref?.();
}

/** Tira los días y los visitantes que ya no caben en la ventana de 14 días. */
function prune() {
  const keep = new Set(Array.from({ length: DAYS_KEPT }, (_, i) => dayKey(i)));
  for (const day of Object.keys(db.days)) if (!keep.has(day)) delete db.days[day];

  const cutoff = dayKey(2);
  for (const [hash, day] of Object.entries(db.visitors)) {
    if (day < cutoff) delete db.visitors[hash];
  }
  const now = Date.now();
  for (const [hash, seen] of online) {
    if (now - seen > ONLINE_WINDOW_MS) online.delete(hash);
  }
}

// ---------------------------------------------------------- identificación

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "";
}

/**
 * Identificador efímero del visitante. La sal incluye el día, de modo que el
 * hash de hoy no sirve para reconocer a nadie mañana.
 */
function visitorHash(req) {
  const material = `${db.secret}|${today()}|${clientIp(req)}|${req.headers["user-agent"] || ""}`;
  return createHash("sha256").update(material).digest("hex").slice(0, 16);
}

const GEO_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-nf-geo-country",
  "cloudfront-viewer-country",
  "x-appengine-country",
  "x-country-code",
];

const geoCache = new Map();

const esCodigoPais = (v) => typeof v === "string" && /^[A-Za-z]{2}$/.test(v.trim());

/**
 * País del visitante, por orden de fiabilidad:
 *
 *  1. Cabecera del hosting (Cloudflare, Vercel, Netlify…). Es la buena: la
 *     pone la red a partir de la IP y aquí no hay que tocar la IP para nada.
 *  2. Consulta externa, solo si se configura `CYP_GEO_URL` a propósito.
 *  3. Lo que declara el propio navegador (`pais`), deducido de su idioma o su
 *     zona horaria. Es lo que hace que el mapa funcione en local y en un
 *     hosting estático sin cabeceras, sin llamar a ningún servicio ni mirar
 *     ninguna IP. Se acepta el último porque es el único que el visitante
 *     puede cambiar, así que solo entra cuando no hay nada mejor.
 */
async function countryOf(req, hash, declarado) {
  for (const header of GEO_HEADERS) {
    const value = req.headers[header];
    if (esCodigoPais(value)) return value.trim().toUpperCase();
  }

  const template = process.env.CYP_GEO_URL;
  if (!template) return esCodigoPais(declarado) ? declarado.trim().toUpperCase() : null;
  if (geoCache.has(hash)) return geoCache.get(hash);

  const ip = clientIp(req);
  const local = !ip || ip.startsWith("127.") || ip === "::1";
  if (local) return esCodigoPais(declarado) ? declarado.trim().toUpperCase() : null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(template.replace("{ip}", encodeURIComponent(ip)), {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const code = body.country_code || body.countryCode || body.country;
    const clean = typeof code === "string" && /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : null;
    const valor = clean || (esCodigoPais(declarado) ? declarado.trim().toUpperCase() : null);
    geoCache.set(hash, valor);
    return valor;
  } catch {
    const valor = esCodigoPais(declarado) ? declarado.trim().toUpperCase() : null;
    geoCache.set(hash, valor);
    return valor;
  }
}

// ------------------------------------------------------------- registro

async function recordVisit(req, sections, pais) {
  prune();

  const hash = visitorHash(req);
  online.set(hash, Date.now());

  const day = today();
  const isNewToday = db.visitors[hash] !== day;

  if (isNewToday) {
    db.visitors[hash] = day;
    db.total += 1;
    db.days[day] = (db.days[day] || 0) + 1;

    const country = await countryOf(req, hash, pais);
    if (country) db.countries[country] = (db.countries[country] || 0) + 1;
  }

  for (const id of sections) {
    if (SECTIONS.has(id)) db.pages[id] = (db.pages[id] || 0) + 1;
  }

  persist();
}

function snapshot() {
  prune();
  const days = [];
  for (let i = DAYS_KEPT - 1; i >= 0; i--) {
    const date = dayKey(i);
    days.push({ date, count: db.days[date] || 0 });
  }
  return {
    total: db.total,
    today: db.days[today()] || 0,
    online: Math.max(1, online.size),
    pages: db.pages,
    days,
    countries: db.countries,
    generatedAt: new Date().toISOString(),
  };
}

// --------------------------------------------------------------- http

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("body demasiado grande"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
};

/** Sirve el build. Opcional: en desarrollo de esto se encarga Vite. */
async function serveStatic(req, res, pathname) {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(DIST, relative);
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
  } catch {
    file = join(DIST, "index.html"); // SPA: todo lo demás cae en el index
  }
  try {
    await stat(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("No encontrado");
    return;
  }
  res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/stats" && req.method === "GET") {
    sendJson(res, 200, snapshot());
    return;
  }

  if (url.pathname === "/api/visit" && req.method === "POST") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const sections = Array.isArray(body.sections) ? body.sections.slice(0, 20) : [];
      await recordVisit(req, sections, body.pais);
      res.writeHead(204).end();
    } catch {
      sendJson(res, 400, { error: "petición inválida" });
    }
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "ruta desconocida" });
    return;
  }

  if (process.env.CYP_SERVE_DIST === "1") {
    await serveStatic(req, res, url.pathname);
    return;
  }

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Solo /api/stats y /api/visit. Para servir el sitio, CYP_SERVE_DIST=1.");
});

await load();

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    clearTimeout(persistTimer);
    void persistNow().then(() => process.exit(0));
  });
}

server.listen(PORT, () => {
  console.log(`[stats] escuchando en http://localhost:${PORT}`);
  console.log(`[stats] datos en ${DATA_FILE}`);
  if (!process.env.CYP_GEO_URL) {
    console.log("[stats] geolocalización: solo cabeceras del hosting (sin llamadas externas)");
  }
});
