/**
 * Qué falta por grabar.
 *
 *   npm run voces
 *
 * Lee el guion del sitio y dice, frase por frase, qué fichero hay que dejar en
 * `src/assets/voces/` y qué tiene que decir. Lo que ya esté puesto sale
 * marcado. No hace falta ejecutar nada después de dejar el mp3: Vite recoge la
 * carpeta al compilar.
 *
 * El contenido se lee de `src/config/cyp.ts` como texto y se saca con
 * expresiones regulares. Es feo, sí, pero ese fichero es TypeScript y esto es
 * Node a secas; montar un compilador para listar catorce frases sería peor.
 * Si alguna vez deja de encontrar algo, el script lo dice en vez de callarse.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const CARPETA = join(AQUI, "..", "src", "assets", "voces");
const CONFIG = join(AQUI, "..", "src", "config", "cyp.ts");

const nombreDeFichero = (t) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const fuente = readFileSync(CONFIG, "utf8");

/** El trozo de fichero entre dos declaraciones. */
function bloque(desde, hasta) {
  const i = fuente.indexOf(desde);
  if (i < 0) return "";
  const j = hasta ? fuente.indexOf(hasta, i + desde.length) : -1;
  return fuente.slice(i, j < 0 ? undefined : j);
}

const tomas = [];
const avisos = [];

// --- Frases de la audioguía ---
const frases = bloque("export const phrases", "export const duet");
for (const m of frases.matchAll(/label:\s*"([^"]+)",\s*text:\s*"([^"]+)"/g)) {
  tomas.push({
    id: `frase-${nombreDeFichero(m[1])}`,
    // Las frases sueltas se pueden decir con cualquiera de los dos; el guion
    // las apunta con Culow, que es quien viene elegido de fábrica.
    quien: "culow",
    texto: m[2],
    seccion: "Audioguía",
  });
}
if (!frases) avisos.push("no encuentro `phrases` en cyp.ts");

// --- Diálogo a dos ---
const duo = bloque("export const duet", "export const marquee");
let n = 0;
for (const m of duo.matchAll(/who:\s*"(culow|pililarge)",\s*text:\s*"([^"]+)"/g)) {
  n += 1;
  tomas.push({ id: `duo-${n}-${m[1]}`, quien: m[1], texto: m[2], seccion: "Pista a dos voces" });
}
if (!duo) avisos.push("no encuentro `duet` en cyp.ts");

// --- Poemas ---
const poemas = bloque("export const poems", "export const phrases");
for (const m of poemas.matchAll(
  /title:\s*"([^"]+)",[\s\S]{0,400}?body:\s*"([^"]+)",[\s\S]{0,200}?voice:\s*"(culow|pililarge)"/g
)) {
  tomas.push({
    id: `poema-${nombreDeFichero(m[1])}`,
    quien: m[3],
    // Igual que `comoSeRecita` en el frontend: separador solo donde falta, o
    // el clip grabado no coincidiría con el texto que la web busca.
    texto: m[2]
      .split("\\n")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v, i, todos) => (i === todos.length - 1 || /[.,;:!?…]$/.test(v) ? v : `${v},`))
      .join(" "),
    seccion: "Textos de sala",
  });
}
if (!poemas) avisos.push("no encuentro `poems` en cyp.ts");

/**
 * Con --json escupe el guion en crudo y se calla. Lo usa el generador en
 * Python para no tener que volver a leer el TypeScript por su cuenta: el
 * guion se decide en un solo sitio.
 */
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(tomas, null, 2));
  process.exit(0);
}

const hay = new Set(
  (existsSync(CARPETA) ? readdirSync(CARPETA) : [])
    .filter((f) => /\.(mp3|m4a|ogg|wav)$/i.test(f))
    .map((f) => f.replace(/\.[^.]+$/, ""))
);

console.log("\nGUION DE VOCES\n");
console.log("Deja cada fichero en src/assets/voces/ con ese nombre exacto.");
console.log("mp3 vale; mono y 64–128 kbps sobra. No hay que ejecutar nada después.\n");

let seccion = "";
let puestas = 0;
for (const t of tomas) {
  if (t.seccion !== seccion) {
    seccion = t.seccion;
    console.log(`\n── ${seccion} ──\n`);
  }
  const grabada = hay.has(t.id);
  if (grabada) puestas += 1;
  console.log(`  ${grabada ? "✓" : "·"} ${t.id}.mp3   [${t.quien}]`);
  console.log(`      «${t.texto}»`);
}

const muestras = ["culow-muestra", "pililarge-muestra"].filter((m) => hay.has(m));
console.log(`\n\n${puestas} de ${tomas.length} grabadas.`);
if (muestras.length) console.log(`Muestras de voz puestas: ${muestras.join(", ")}.`);
if (avisos.length) console.log(`\nAvisos:\n  ${avisos.join("\n  ")}`);
console.log("");
