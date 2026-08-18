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

/** Redis devuelve los hashes como lista plana [campo, valor, campo, valor…]. */
function aObjeto(plano: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!Array.isArray(plano)) return out;
  for (let i = 0; i < plano.length; i += 2) {
    out[String(plano[i])] = Number(plano[i + 1]) || 0;
  }
  return out;
}

/** Devuelve el panel de visitas. Lo consume `src/lib/stats.ts`. */
export default async function handler(req: Peticion, res: Respuesta) {
  if (req.method !== "GET") return res.status(405).json({ error: "método no permitido" });

  // Sin almacén, el frontend lo detecta y cuenta en el navegador.
  if (!hayAlmacen) return res.status(503).json({ error: "sin almacén configurado" });

  try {
    const corte = Date.now() - VENTANA_ONLINE_MS;
    const [total, days, pages, countries, online] = await pipeline([
      ["GET", K.total],
      ["HGETALL", K.days],
      ["HGETALL", K.pages],
      ["HGETALL", K.countries],
      ["ZCOUNT", K.online, corte, "+inf"],
    ]);

    const porDia = aObjeto(days);

    // La serie trae siempre los 14 días, rellenando con cero los que falten:
    // así la gráfica no cambia de anchura según haya visitas o no.
    const serie = [];
    for (let i = DIAS - 1; i >= 0; i--) {
      const date = diaISO(i);
      serie.push({ date, count: porDia[date] ?? 0 });
    }

    res.setHeader("cache-control", "no-store");
    return res.status(200).json({
      total: Number(total ?? 0),
      today: porDia[hoy()] ?? 0,
      online: Math.max(1, Number(online ?? 0)),
      pages: aObjeto(pages),
      days: serie,
      countries: aObjeto(countries),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[stats]", err);
    return res.status(500).json({ error: "no se pudo leer el contador" });
  }
}
