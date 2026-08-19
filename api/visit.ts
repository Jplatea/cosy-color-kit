/**
 * Vercel empaqueta cada función por separado y deja fuera los ficheros que
 * empiezan por guion bajo, así que un módulo compartido no viaja con ellas
 * (`ERR_MODULE_NOT_FOUND` al arrancar). Por eso este bloque está repetido en
 * `stats.ts` y en `visit.ts`: cada fichero tiene que bastarse solo.
 *
 * Los contadores viven en Redis (Upstash) porque cada llamada arranca en una
 * máquina limpia, sin disco donde guardar nada. Se habla con él por su API
 * REST y con `fetch` a secas, sin librería, para no añadir dependencias.
 */

const BASE =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

const hayAlmacen = Boolean(BASE && TOKEN);

type Arg = string | number;

async function pedir(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Upstash respondió ${res.status}`);
  return res.json();
}

/** Varios comandos en una sola ida y vuelta. */
async function pipeline(cmds: Arg[][]): Promise<unknown[]> {
  if (!cmds.length) return [];
  const out = await pedir(`${BASE}/pipeline`, cmds.map((c) => c.map(String)));
  return (Array.isArray(out) ? out : []).map((r: any) => r?.result);
}

const K = {
  total: "cyp:total",
  days: "cyp:days",
  pages: "cyp:pages",
  countries: "cyp:countries",
  online: "cyp:online",
  seen: (hash: string) => `cyp:seen:${hash}`,
};

const DIAS = 14;
const VENTANA_ONLINE_MS = 5 * 60 * 1000;

const hoy = () => new Date().toISOString().slice(0, 10);
const diaISO = (atras: number) =>
  new Date(Date.now() - atras * 86_400_000).toISOString().slice(0, 10);

/** Lo mínimo que se usa de la petición; evita depender de los tipos de Vercel. */
type Peticion = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
};

type Respuesta = {
  status: (code: number) => Respuesta;
  json: (data: unknown) => unknown;
  end: () => unknown;
  setHeader: (k: string, v: string) => unknown;
};

/** Un comando suelto. */
async function cmd<T = unknown>(...args: Arg[]): Promise<T> {
  const out: any = await pedir(BASE, args.map(String));
  if (out?.error) throw new Error(String(out.error));
  return out?.result as T;
}

/** Solo estas secciones cuentan: evita que nadie infle claves inventadas. */
const SECCIONES = new Set([
  "inicio", "videos", "shorts", "hablar", "vestidor", "poemas",
]);

const cabecera = (req: Peticion, nombre: string) => {
  const v = req.headers[nombre];
  return Array.isArray(v) ? v[0] : v;
};

function ip(req: Peticion): string {
  const fwd = cabecera(req, "x-forwarded-for");
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "";
}

/**
 * Identificador efímero del visitante.
 *
 * No se guarda ninguna IP: solo este hash. Y como la sal incluye el día, el
 * identificador de hoy no sirve para reconocer a nadie mañana.
 */
async function visitante(req: Peticion): Promise<string> {
  const { createHash } = await import("node:crypto");
  const sal = process.env.CYP_STATS_SECRET || "culowypililarge";
  const material = `${sal}|${hoy()}|${ip(req)}|${cabecera(req, "user-agent") || ""}`;
  return createHash("sha256").update(material).digest("hex").slice(0, 16);
}

const esCodigoPais = (v: unknown): v is string =>
  typeof v === "string" && /^[A-Za-z]{2}$/.test(v.trim());

/**
 * País del visitante. Manda la cabecera de Vercel, que la pone su red a partir
 * de la IP sin que aquí haya que tocar ninguna IP ni llamar a nadie. Si por lo
 * que sea no llega —una petición fuera del edge, una vista previa—, se acepta
 * lo que declare el navegador a partir de su idioma o su zona horaria. Va el
 * último precisamente porque es el único que el visitante puede cambiar.
 */
function pais(req: Peticion, declarado?: unknown): string | null {
  const cc = cabecera(req, "x-vercel-ip-country");
  if (esCodigoPais(cc)) return cc.trim().toUpperCase();
  return esCodigoPais(declarado) ? declarado.trim().toUpperCase() : null;
}

/** Registra una visita y las secciones que ha llegado a ver. */
export default async function handler(req: Peticion, res: Respuesta) {
  if (req.method !== "POST") return res.status(405).json({ error: "método no permitido" });
  if (!hayAlmacen) return res.status(503).json({ error: "sin almacén configurado" });

  try {
    const body: any =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const secciones: string[] = Array.isArray(body.sections) ? body.sections.slice(0, 20) : [];

    const hash = await visitante(req);
    const ahora = Date.now();

    // NX: solo entra el primero del día. Ese es el contador de únicos.
    const primeraDelDia = await cmd<string | null>(
      "SET", K.seen(hash), "1", "NX", "EX", 86_400
    );

    const tareas: Arg[][] = [
      ["ZADD", K.online, ahora, hash],
      ["ZREMRANGEBYSCORE", K.online, 0, ahora - VENTANA_ONLINE_MS],
    ];

    if (primeraDelDia) {
      tareas.push(["INCR", K.total]);
      tareas.push(["HINCRBY", K.days, hoy(), 1]);
      const cc = pais(req, body.pais);
      if (cc) tareas.push(["HINCRBY", K.countries, cc, 1]);
      // Los días que salen de la ventana se van borrando solos.
      tareas.push(["HDEL", K.days, diaISO(DIAS), diaISO(DIAS + 1), diaISO(DIAS + 2)]);
    }

    for (const id of secciones) {
      if (SECCIONES.has(id)) tareas.push(["HINCRBY", K.pages, id, 1]);
    }

    await pipeline(tareas);
    return res.status(204).end();
  } catch (err) {
    console.error("[visit]", err);
    return res.status(400).json({ error: "petición inválida" });
  }
}
