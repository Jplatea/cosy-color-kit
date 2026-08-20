/**
 * La voz de verdad de Culow y de Pililarge.
 *
 * Convierte un texto en audio con las voces clonadas de ElevenLabs y lo
 * devuelve como mp3. La clave de ElevenLabs vive aquí y no sale nunca: si
 * estuviera en el frontend, cualquiera podría leerla del navegador y gastar la
 * cuenta ajena.
 *
 * Es una petición GET y no POST a propósito. Cada frase tiene así su propia
 * URL, y eso deja que la caché del navegador y la del propio Vercel guarden el
 * audio sin que aquí haya que programar nada: la segunda vez que alguien pulsa
 * la misma frase, ElevenLabs ni se entera. Detrás hay además una tercera capa
 * en Redis, que es la que sobrevive a los despliegues.
 *
 * Sobre el gasto: generar voz cuesta dinero por carácter, y esto es un
 * endpoint público. Por eso hay tres frenos —longitud máxima, límite por
 * visitante y las cachés— y no son opcionales.
 *
 * Variables de entorno:
 *   ELEVENLABS_API_KEY          clave de la cuenta
 *   ELEVENLABS_VOICE_CULOW      id de la voz clonada de Culow
 *   ELEVENLABS_VOICE_PILILARGE  id de la voz clonada de Pililarge. Sin ella se
 *                               sale del paso con la de Culow subida de tono,
 *                               pero es un apaño: son dos voces distintas
 *   ELEVENLABS_MODEL            modelo (por defecto eleven_multilingual_v2)
 *   KV_REST_API_URL / _TOKEN    Redis, para la caché y el límite (opcional)
 *
 * Sin clave responde 503 y la web se queda con la voz del navegador.
 */

import { createHash } from "node:crypto";

const CLAVE = process.env.ELEVENLABS_API_KEY || "";
const MODELO = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

const VOCES: Record<string, string | undefined> = {
  culow: process.env.ELEVENLABS_VOICE_CULOW,
  pililarge: process.env.ELEVENLABS_VOICE_PILILARGE,
};

/**
 * Cómo habla cada uno.
 *
 * El tono y el timbre los trae la voz clonada; aquí solo se decide cuánta
 * cuerda se le deja. Y esa cuerda es exactamente lo que se comía el acento.
 *
 * **`style` va a cero, y no es negociable.** Es el mando de «exagera la
 * interpretación», y para exagerar el modelo se separa de la muestra: se
 * inventa entonaciones que no están en ella y arrastra la pronunciación hacia
 * el español neutro de la mayoría de sus datos, que es latino. Estaba en 0,5
 * para Culow y por eso sonaba a Latinoamérica por mucho que la muestra fuera
 * andaluza.
 *
 * **`similarity_boost` bien alto**, por lo mismo pero al revés: es cuánto se
 * agarra a la referencia, y el acento viaja ahí.
 *
 * Queda `stability`, que es el único margen expresivo. Muy baja se desmadra
 * —y al desmadrarse también deriva de acento—; muy alta sale un locutor de
 * telediario. Culow un poco más suelto que Pililarge, que la gracia de
 * Pililarge es lo plano que suena.
 */
const AJUSTES: Record<string, Record<string, number | boolean>> = {
  culow: { stability: 0.45, similarity_boost: 0.95, style: 0, use_speaker_boost: true },
  pililarge: { stability: 0.55, similarity_boost: 0.95, style: 0, use_speaker_boost: true },
};

/**
 * Cambia cuando cambian los ajustes de arriba, y entra en la llave de la caché.
 *
 * Sin esto, tocar `style` no servía de nada: la frase ya generada seguía
 * saliendo de Redis con el acento viejo durante los dos meses que dura la
 * caché, y uno se vuelve loco creyendo que el ajuste no hace nada.
 */
const VERSION_AJUSTES = "v2-sin-style";

const MAX_CARACTERES = 300;
/** Peticiones por visitante y hora. Generoso para jugar, corto para abusar. */
const LIMITE_HORA = 40;
const CACHE_SEGUNDOS = 60 * 60 * 24 * 60;

const BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const hayAlmacen = Boolean(BASE && TOKEN);

async function redis<T>(...comando: (string | number)[]): Promise<T | null> {
  if (!hayAlmacen) return null;
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify(comando.map(String)),
    });
    if (!res.ok) return null;
    const cuerpo = (await res.json()) as { result?: T };
    return cuerpo?.result ?? null;
  } catch {
    // La caché es un lujo, no un requisito: si Redis falla, se genera y ya.
    return null;
  }
}

type Peticion = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
  socket?: { remoteAddress?: string };
};

type Respuesta = {
  status: (code: number) => Respuesta;
  setHeader: (nombre: string, valor: string) => void;
  json: (body: unknown) => void;
  send: (body: unknown) => void;
  end: () => void;
};

const cabecera = (req: Peticion, nombre: string) => {
  const v = req.headers[nombre];
  return Array.isArray(v) ? v[0] : v;
};

/** Identificador efímero del visitante, solo para contar. Ninguna IP se guarda. */
function visitante(req: Peticion): string {
  const reenviada = cabecera(req, "x-forwarded-for") || "";
  const ip = reenviada.split(",")[0].trim() || req.socket?.remoteAddress || "";
  const dia = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${process.env.CYP_STATS_SECRET || "culowypililarge"}|${dia}|${ip}`)
    .digest("hex")
    .slice(0, 16);
}

export default async function handler(req: Peticion, res: Respuesta) {
  if (req.method !== "GET") return res.status(405).json({ error: "método no permitido" });

  const params = new URL(req.url || "", "http://x").searchParams;
  const quien = String(params.get("v") || "").toLowerCase();
  const texto = String(params.get("t") || "").trim();

  /*
    Si falta la voz de Pililarge, se sale del paso con la de Culow subida.

    **Es un apaño, no lo deseable.** Se comprobó midiendo la envolvente
    espectral de los dos: subirle el tono a Culow no lo acerca a Pililarge, lo
    aleja. Son dos voces distintas y hay que clonar las dos. Esto solo evita que
    media web se caiga a la voz robótica del navegador mientras falte una.

    Los 6,1 semitonos son la diferencia de tono medida —174 Hz sobre 122—. El
    número no se importa de `src/lib/modulador.ts` aunque esté ahí: Vercel
    empaqueta cada función por su cuenta y de al lado no llega nada. Si se
    cambia, se cambia en los dos sitios.
  */
  const SEMITONOS_PILILARGE = 6.1;
  const propia = VOCES[quien];
  const voz = propia ?? (quien === "pililarge" ? VOCES.culow : undefined);
  const subirTono = !propia && quien === "pililarge" ? SEMITONOS_PILILARGE : 0;

  if (!CLAVE || !voz) {
    return res.status(503).json({ error: "las voces reales no están configuradas" });
  }
  if (!texto) return res.status(400).json({ error: "sin texto" });
  if (texto.length > MAX_CARACTERES) {
    return res.status(413).json({ error: `máximo ${MAX_CARACTERES} caracteres` });
  }

  // Solo desde la propia web: esto cuesta dinero por uso.
  const origen = cabecera(req, "origin");
  const propio = process.env.CYP_URL || "https://www.culowypililarge.com";
  if (origen && !origen.startsWith("http://localhost") && !propio.includes(new URL(origen).host)) {
    return res.status(403).json({ error: "origen no permitido" });
  }

  const hash = createHash("sha256")
    .update(`${voz}|${MODELO}|${VERSION_AJUSTES}|${texto}`)
    .digest("hex")
    .slice(0, 32);
  const llave = `cyp:voz:${hash}`;

  const responderAudio = (audio: Buffer) => {
    res.setHeader("content-type", "audio/mpeg");
    // Cuánto tiene que subirlo el navegador. 0 = tal cual viene.
    if (subirTono) res.setHeader("x-cyp-modular", String(subirTono));
    res.setHeader("content-length", String(audio.length));
    // Una frase siempre suena igual, así que se puede cachear para siempre.
    res.setHeader("cache-control", "public, max-age=31536000, s-maxage=31536000, immutable");
    res.status(200).send(audio);
  };

  // 1. ¿Está ya generada?
  const guardado = await redis<string>("GET", llave);
  if (guardado) return responderAudio(Buffer.from(guardado, "base64"));

  // 2. ¿Este visitante se está pasando?
  const cuenta = await redis<number>("INCR", `cyp:vozlim:${visitante(req)}`);
  if (cuenta === 1) await redis("EXPIRE", `cyp:vozlim:${visitante(req)}`, 3600);
  if (cuenta !== null && cuenta > LIMITE_HORA) {
    return res.status(429).json({ error: "demasiadas frases seguidas; prueba en un rato" });
  }

  // 3. A generar.
  try {
    const eleven = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}`, {
      method: "POST",
      headers: {
        "xi-api-key": CLAVE,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: texto,
        model_id: MODELO,
        voice_settings: (subirTono ? AJUSTES.culow : AJUSTES[quien]) || AJUSTES.culow,
      }),
    });

    if (!eleven.ok) {
      const detalle = await eleven.text();
      console.error("[voz] elevenlabs", eleven.status, detalle.slice(0, 300));
      return res.status(502).json({ error: "la voz no ha respondido" });
    }

    const audio = Buffer.from(await eleven.arrayBuffer());
    // Se guarda lo que quepa holgado; un audio enorme no merece ocupar caché.
    if (audio.length < 400_000) {
      await redis("SET", llave, audio.toString("base64"), "EX", CACHE_SEGUNDOS);
    }
    return responderAudio(audio);
  } catch (err) {
    console.error("[voz]", err);
    return res.status(500).json({ error: "no se ha podido generar la voz" });
  }
}
