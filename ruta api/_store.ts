import { createHash } from "node:crypto";

/**
 * Almacén del contador de visitas.
 *
 * Las funciones de Vercel no guardan nada entre llamadas: cada petición
 * arranca en una máquina limpia. Por eso los contadores viven en Redis
 * (Upstash), que además ofrece incrementos atómicos, que es justo lo que
 * necesita un contador con varias visitas a la vez.
 *
 * Se habla con él por su API REST y con `fetch` a secas, sin librería: así el
 * proyecto no gana dependencias y se puede editar desde el navegador sin tocar
 * el `package-lock.json`.
 */

const BASE =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const hayAlmacen = Boolean(BASE && TOKEN);

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

/** Un comando suelto. */
export async function cmd<T = unknown>(...args: Arg[]): Promise<T> {
  const out = await pedir(BASE, args.map(String));
  if (out?.error) throw new Error(String(out.error));
  return out?.result as T;
}

/** Varios comandos en una sola ida y vuelta. */
export async function pipeline(cmds: Arg[][]): Promise<unknown[]> {
  if (!cmds.length) return [];
  const out = await pedir(`${BASE}/pipeline`, cmds.map((c) => c.map(String)));
  return (Array.isArray(out) ? out : []).map((r) => r?.result);
}

/** Redis devuelve los hashes como lista plana [campo, valor, campo, valor…]. */
export function aObjeto(plano: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!Array.isArray(plano)) return out;
  for (let i = 0; i < plano.length; i += 2) {
    out[String(plano[i])] = Number(plano[i + 1]) || 0;
  }
  return out;
}

export const K = {
  total: "cyp:total",
  days: "cyp:days",
  pages: "cyp:pages",
  countries: "cyp:countries",
  online: "cyp:online",
  seen: (hash: string) => `cyp:seen:${hash}`,
};

export const DIAS = 14;
export const VENTANA_ONLINE_MS = 5 * 60 * 1000;

export const hoy = () => new Date().toISOString().slice(0, 10);
export const diaISO = (atras: number) =>
  new Date(Date.now() - atras * 86_400_000).toISOString().slice(0, 10);

/** Solo estas secciones cuentan: evita que nadie infle claves inventadas. */
export const SECCIONES = new Set([
  "inicio", "videos", "shorts", "hablar", "vestidor", "poemas",
]);

/** Lo mínimo que se usa de la petición; evita depender de los tipos de Vercel. */
export type Peticion = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
};

export type Respuesta = {
  status: (code: number) => Respuesta;
  json: (data: unknown) => unknown;
  end: () => unknown;
  setHeader: (k: string, v: string) => unknown;
};

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
export function visitante(req: Peticion): string {
  const sal = process.env.CYP_STATS_SECRET || "culowypililarge";
  const material = `${sal}|${hoy()}|${ip(req)}|${cabecera(req, "user-agent") || ""}`;
  return createHash("sha256").update(material).digest("hex").slice(0, 16);
}

/** País del visitante. Lo pone Vercel: ni IPs ni servicios de terceros. */
export function pais(req: Peticion): string | null {
  const cc = cabecera(req, "x-vercel-ip-country");
  return cc && /^[A-Za-z]{2}$/.test(String(cc)) ? String(cc).toUpperCase() : null;
}
