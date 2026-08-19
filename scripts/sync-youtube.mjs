/**
 * Trae los vídeos reales del canal y los escribe en el sitio.
 *
 *   npm run sync:youtube
 *
 * Lee el feed público del canal (el mismo que usa cualquier lector RSS),
 * separa los verticales de los vídeos largos y deja el resultado en
 * `src/config/youtube.json`. A partir de ahí las miniaturas, los títulos y
 * los enlaces salen solos: no hay que copiar ningún ID a mano.
 *
 * Se ejecuta desde tu máquina, no desde el navegador: YouTube no permite
 * leer el feed por CORS, así que esto es trabajo de build, no de runtime.
 *
 * Opciones:
 *   --handle @CulowPililarge   canal a leer (por defecto el de la web)
 *   --videos 3                 cuántos vídeos largos quedarse
 *   --shorts 4                 cuántos verticales quedarse
 *   --dry                      enseña lo que haría, sin escribir nada
 */

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import jpeg from "jpeg-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "src", "config", "youtube.json");

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const DRY = process.argv.includes("--dry");
const HANDLE = arg("handle", "@CulowPililarge");
const WANT_VIDEOS = Number(arg("videos", "6"));
const WANT_SHORTS = Number(arg("shorts", "8"));

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, "accept-language": "es-ES,es;q=0.9" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} en ${url}`);
  return res.text();
}

/** El feed va por channelId (UC…), no por handle: hay que traducirlo primero. */
async function resolveChannelId(handle) {
  const clean = handle.startsWith("@") ? handle : `@${handle}`;
  const html = await get(`https://www.youtube.com/${clean}`);
  const match =
    html.match(/"channelId":"(UC[\w-]{22})"/) ||
    html.match(/channel\/(UC[\w-]{22})/) ||
    html.match(/"externalId":"(UC[\w-]{22})"/);
  if (!match) throw new Error(`no encuentro el channelId de ${clean}`);
  return match[1];
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** El feed trae los 15 vídeos más recientes, del más nuevo al más viejo. */
async function readFeed(channelId) {
  const xml = await get(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );
  const entries = xml.split("<entry>").slice(1);
  return entries
    .map((entry) => {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      if (!id || !title) return null;
      return { id, title: limpiarTitulo(decodeEntities(title)), published };
    })
    .filter(Boolean);
}

/**
 * YouTube no dice en el feed si un vídeo es Short. La forma fiable es pedir
 * `/shorts/<id>`: si es vertical responde 200, y si no, redirige a /watch.
 */
async function isShort(id) {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${id}`, {
      method: "HEAD",
      headers: { "user-agent": UA },
      redirect: "manual",
    });
    if (res.status === 200) return true;
    if (res.status >= 300 && res.status < 400) {
      return !String(res.headers.get("location") || "").includes("/watch");
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Los títulos del canal arrastran la cola de hashtags que YouTube pide para
 * posicionar. En la web estorban: se quitan, se colapsan los espacios de más
 * y se deja el título a secas.
 */
function limpiarTitulo(raw) {
  const limpio = raw
    .replace(/#[^ #]+/g, " ")
    .replace(/  +/g, " ")
    .replace(/[ ·|,-]+$/, "")
    .trim();
  // Si el título era solo hashtags, mejor el original que una tarjeta vacía.
  return limpio.length >= 3 ? limpio : raw.trim();
}

/**
 * Dónde están los personajes dentro del fotograma.
 *
 * Estos vídeos no llenan el cuadro: casi todos son una escena en negro con los
 * muñecos en una franja central, y esa franja mide cosas muy distintas según el
 * vídeo —medidos, entre el 19 % y el 82 % de la altura—. Sin este dato, un
 * recorte fijo o deja medio marco en negro o corta a alguno por la cabeza.
 *
 * Así que se mira la miniatura de verdad: se baja a una rejilla pequeña, se
 * marca cada fila que tenga algún pixel claramente por encima del negro de
 * fondo, y se guarda la primera y la última. Con eso, la web sabe cuánto tiene
 * que acercar cada foto para que los personajes salgan enteros y no sobre
 * negro. Se decide por el pixel más claro de la fila y no por su media, porque
 * un muñeco pequeño sobre fondo negro apenas mueve la media.
 */
async function encuadre(id) {
  try {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/oardefault.jpg`, {
      headers: { "user-agent": UA },
    });
    if (!res.ok) return null;
    const { data, width, height } = jpeg.decode(
      Buffer.from(await res.arrayBuffer()),
      { useTArray: true }
    );

    const FILAS = 120;
    const COLS = 48;
    const UMBRAL = 55;
    let primera = -1;
    let ultima = -1;

    for (let fy = 0; fy < FILAS; fy++) {
      const y = Math.min(height - 1, Math.floor(((fy + 0.5) / FILAS) * height));
      let max = 0;
      for (let fx = 0; fx < COLS; fx++) {
        const x = Math.min(width - 1, Math.floor(((fx + 0.5) / COLS) * width));
        const i = (y * width + x) * 4;
        const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (v > max) max = v;
      }
      if (max > UMBRAL) {
        if (primera < 0) primera = fy;
        ultima = fy;
      }
    }

    // Un fotograma entero en negro no dice nada: mejor no guardar nada y que la
    // web use su encuadre por defecto.
    if (primera < 0) return null;

    const arriba = primera / FILAS;
    const abajo = (ultima + 1) / FILAS;
    return {
      /** Qué parte de la altura ocupan los personajes, de 0 a 1. */
      banda: Number((abajo - arriba).toFixed(3)),
      /** A qué altura está el centro de esa franja, de 0 a 1. */
      centro: Number(((arriba + abajo) / 2).toFixed(3)),
      /** Proporción de la miniatura (ancho ÷ alto), medida y no supuesta. */
      ratio: Number((width / height).toFixed(4)),
    };
  } catch {
    // Sin red o con una miniatura rara, la web tira de su encuadre por defecto.
    return null;
  }
}

const relativeDate = (iso) => {
  if (!iso) return "YouTube";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 1) return "YouTube · nuevo";
  if (days < 7) return `YouTube · hace ${days} días`;
  if (days < 30) return `YouTube · hace ${Math.floor(days / 7)} sem.`;
  return `YouTube · hace ${Math.floor(days / 30)} meses`;
};

async function main() {
  console.log(`Leyendo ${HANDLE}…`);
  const channelId = await resolveChannelId(HANDLE);
  console.log(`  channelId: ${channelId}`);

  const entries = await readFeed(channelId);
  console.log(`  ${entries.length} vídeos en el feed`);
  if (!entries.length) throw new Error("el feed viene vacío");

  console.log("  separando verticales de vídeos largos…");
  const flags = await Promise.all(entries.map((e) => isShort(e.id)));

  const verticales = entries.filter((_, i) => flags[i]);
  const largos = entries.filter((_, i) => !flags[i]);

  const shorts = verticales.slice(0, WANT_SHORTS);
  /**
   * El canal puede publicar solo en vertical: entonces no hay ningún vídeo
   * largo con el que llenar la parrilla. En ese caso la parrilla se queda con
   * los verticales que no han cabido en la fila de shorts, para que las dos
   * secciones enseñen material real y ninguna repita lo de la otra.
   */
  const videos = (largos.length ? largos : verticales.slice(WANT_SHORTS)).slice(0, WANT_VIDEOS);

  console.log("  midiendo dónde salen los personajes en cada miniatura…");
  const [encuadreVideos, encuadreShorts] = await Promise.all([
    Promise.all(videos.map((v) => encuadre(v.id))),
    Promise.all(shorts.map((s) => encuadre(s.id))),
  ]);

  const payload = {
    channelId,
    handle: HANDLE,
    syncedAt: new Date().toISOString(),
    /**
     * `vertical` es lo que decide con qué miniatura y en qué formato se pinta
     * cada tarjeta. Sin este dato la web pedía siempre la miniatura 16:9, y un
     * vídeo vertical llega ahí metido dentro de un marco negro con el fondo
     * repetido a los lados: la miniatura dentro de otra miniatura.
     */
    videos: videos.map((v, i) => ({
      youtubeId: v.id,
      title: v.title,
      meta: relativeDate(v.published),
      vertical: verticales.includes(v),
      ...(encuadreVideos[i] || {}),
    })),
    shorts: shorts.map((s, i) => ({
      youtubeId: s.id,
      title: s.title,
      vertical: true,
      ...(encuadreShorts[i] || {}),
    })),
  };

  console.log(`\n  ${payload.videos.length} vídeos:`);
  payload.videos.forEach((v) => console.log(`    · ${v.title}  (${v.youtubeId})`));
  console.log(`  ${payload.shorts.length} shorts:`);
  payload.shorts.forEach((s) => console.log(`    · ${s.title}  (${s.youtubeId})`));

  if (DRY) {
    console.log("\n--dry: no se ha escrito nada.");
    return;
  }
  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`\nEscrito en ${OUT}`);
  console.log("Las miniaturas y los enlaces ya salen solos. Revisa y haz commit.");
}

main().catch((err) => {
  console.error(`\nNo se ha podido sincronizar: ${err.message}`);
  console.error(
    "Si estás detrás de un proxy o de un allowlist de red, hace falta acceso a www.youtube.com."
  );
  process.exit(1);
});
