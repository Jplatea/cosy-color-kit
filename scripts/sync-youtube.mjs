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
const WANT_VIDEOS = Number(arg("videos", "3"));
const WANT_SHORTS = Number(arg("shorts", "4"));

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
      return { id, title: decodeEntities(title.trim()), published };
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

  const shorts = entries.filter((_, i) => flags[i]).slice(0, WANT_SHORTS);
  const videos = entries.filter((_, i) => !flags[i]).slice(0, WANT_VIDEOS);

  const payload = {
    channelId,
    handle: HANDLE,
    syncedAt: new Date().toISOString(),
    videos: videos.map((v) => ({
      youtubeId: v.id,
      title: v.title,
      meta: relativeDate(v.published),
    })),
    shorts: shorts.map((s) => ({ youtubeId: s.id, title: s.title })),
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
