/**
 * Trae de Printful lo que hay puesto a la venta.
 *
 *   npm run sync:printful
 *
 * Lee tu tienda de Printful y escribe `src/config/printful.json` con cada
 * producto, sus variantes y el id que hace falta para crear el pedido. A partir
 * de ahí la web enseña exactamente lo que existe en la imprenta: si añades una
 * talla o retiras un color, se vuelve a ejecutar esto y ya está.
 *
 * La clave **no se guarda en el proyecto**. Se lee de la variable de entorno
 * `PRINTFUL_API_KEY`, o de un `.env.local` que está en el .gitignore. Lo que sí
 * se guarda —y se puede subir sin miedo— es el JSON resultante: ahí solo hay
 * números de catálogo, nombres y precios, nada secreto.
 *
 * Cómo sacar la clave: printful.com → Settings → Developers → API tokens.
 * Con permiso de lectura de productos basta.
 *
 * Variables:
 *   PRINTFUL_API_KEY    el token (obligatorio)
 *   PRINTFUL_STORE_ID   solo si tu cuenta tiene más de una tienda
 */

import { writeFile, readFile, readdir, mkdir } from "node:fs/promises";
import { escribirPrecios } from "./lib/precios.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const SALIDA = join(RAIZ, "src", "config", "printful.json");
/** Donde van las maquetas que descargas tú, una carpeta por producto. */
const ALBUM = join(RAIZ, "public", "tienda");
const MAX_FOTOS = 12;
/**
 * Los precios también van a la función de cobro, escritos dentro de ella.
 *
 * El servidor tiene que poder mirar el precio por su cuenta: si viniera en la
 * petición, cualquiera compraría una camiseta por un céntimo cambiando un
 * número en el inspector.
 *
 * Y van dentro del propio fichero, no en uno al lado, porque probamos las dos
 * cosas y las dos reventaron en producción: ni un `import` de JSON ni uno de un
 * módulo hermano llegaban a la función empaquetada. Vercel mete cada función en
 * su propio paquete, así que lo único que no se pierde es el fichero en sí.
 */
const SALIDA_API = join(RAIZ, "api", "checkout.ts");

/** Lee `.env.local` sin depender de nada: son cuatro líneas de `CLAVE=valor`. */
async function claveDelEntorno(nombre) {
  if (process.env[nombre]) return process.env[nombre].trim();
  for (const fichero of [".env.local", ".env"]) {
    try {
      const texto = await readFile(join(RAIZ, fichero), "utf8");
      for (const linea of texto.split(/\r?\n/)) {
        const limpia = linea.trim();
        if (!limpia || limpia.startsWith("#")) continue;
        const corte = limpia.indexOf("=");
        if (corte < 0) continue;
        if (limpia.slice(0, corte).trim() !== nombre) continue;
        return limpia
          .slice(corte + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    } catch {
      /* ese fichero no existe, se prueba el siguiente */
    }
  }
  return "";
}

const CLAVE = await claveDelEntorno("PRINTFUL_API_KEY");
const TIENDA = await claveDelEntorno("PRINTFUL_STORE_ID");

if (!CLAVE) {
  console.error(`
Falta la clave de Printful.

Sácala en printful.com → Settings → Developers → API tokens y déjala en un
fichero \`.env.local\` en la raíz del proyecto:

    PRINTFUL_API_KEY=tu_token_aqui

Ese fichero está en el .gitignore, así que no se sube a ningún sitio.
`);
  process.exit(1);
}

async function printful(ruta) {
  const cabeceras = { authorization: `Bearer ${CLAVE}` };
  if (TIENDA) cabeceras["x-pf-store-id"] = TIENDA;

  const res = await fetch(`https://api.printful.com${ruta}`, { headers: cabeceras });
  const cuerpo = await res.json().catch(() => null);
  if (!res.ok) {
    const detalle = cuerpo?.error?.message || cuerpo?.result || res.statusText;
    throw new Error(`${res.status} en ${ruta}: ${detalle}`);
  }
  return cuerpo?.result;
}

/**
 * El color real de cada variante.
 *
 * El listado de la tienda da el nombre del color («Heather Dust») pero no su
 * valor, y la web dibuja las prendas: necesita el hexadecimal. Está en el
 * catálogo general, así que se pregunta una vez por variante distinta y se
 * guarda, que un producto con seis colores y seis tallas repite el mismo color
 * seis veces.
 */
const colores = new Map();

async function colorDe(catalogo) {
  if (!catalogo) return "";
  if (colores.has(catalogo)) return colores.get(catalogo);
  try {
    const r = await printful(`/products/variant/${catalogo}`);
    const hex = r?.variant?.color_code || "";
    colores.set(catalogo, hex);
    return hex;
  } catch {
    // Sin color se usa uno por defecto al dibujar; no merece parar la sincronización.
    colores.set(catalogo, "");
    return "";
  }
}

/** Los céntimos, que es como se hacen las cuentas sin decimales sueltos. */
const centimos = (precio) => Math.round(Number(precio || 0) * 100);

/**
 * El nombre de carpeta de un producto: su primera palabra, sin adornos.
 *
 * «Bolsaca para el dinerete, gafitas chulas….» → `bolsaca`. Corto a propósito:
 * esa carpeta la vas a abrir tú en el explorador para soltar fotos dentro, y
 * un nombre largo con comas no hay quien lo teclee.
 */
const ranura = (nombre) =>
  String(nombre || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")[0] || "producto";

/**
 * El identificador de un color, con **todas** sus palabras.
 *
 * Aquí no vale `ranura`, que se queda con la primera: «Heather Prism Lilac» y
 * «Heather Ice Blue» se convertían las dos en `heather` y la segunda maqueta
 * pisaba a la primera, dejando el mismo lila para los dos colores.
 *
 * Tiene que salir igual que el `idDeColor` de `src/config/tienda.ts`, porque
 * es por ahí por donde se reconocen: el fichero se llama como el color y la
 * web busca el color en el nombre del fichero.
 */
const ranuraColor = (nombre) =>
  String(nombre || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unico";

/**
 * Cómo se llama cada color en las fotos que hiciste tú.
 *
 * Tus ficheros están en castellano —`03-blanca.webp`— y Printful dice
 * «White». Sin esto se daba por buena la maqueta suya y se bajaba encima de
 * una foto tuya que ya existía y era mejor. Es la misma lista que hay en
 * `src/config/tienda.ts`, que es donde se leen al pintar la tienda.
 */
const APODOS = {
  white: /blanc|white/i,
  black: /negr|black/i,
  "bottle-green": /verde|green/i,
  yellow: /amarill|yellow/i,
  navy: /azul|navy/i,
  red: /roj|red/i,
  grey: /gris|grey|gray/i,
};

/**
 * Palabras que no distinguen nada y solo alargan el nombre de la carpeta.
 */
const VACIAS = new Set([
  "para", "de", "del", "la", "el", "los", "las", "un", "una", "que", "en", "con",
  "y", "a", "al", "tus", "tu", "su", "sus", "como", "si", "aquellos", "aquellas",
  "esos", "esas", "estan", "esta", "lo", "por", "se", "no",
]);

/**
 * El nombre de carpeta de cada producto, garantizando que no se repita.
 *
 * La primera palabra sola no basta: en cuanto hay dos productos que empiezan
 * igual —«Camisetita para ver a tus Bros» y «Camisetita para aquellos
 * criptobros»— les toca la misma carpeta, y entonces cada uno enseña las fotos
 * del otro. Pasó, y no avisa: la sincronización dice tan tranquila que los dos
 * tienen veinticuatro fotos.
 *
 * Cuando dos chocan se les añade **la última palabra con significado** de su
 * nombre, no la siguiente. La siguiente suele ser otra preposición y da
 * `camisetita-para`; la última es la que de verdad los separa, y salen
 * `camisetita-padel` y `camisetita-bancarrota`, que son nombres que uno
 * reconoce al abrir el explorador. Si aún chocan se sigue tirando hacia atrás,
 * y si el nombre es idéntico, se desempata con el id de Printful.
 */
function carpetasUnicas(nombres) {
  const palabras = nombres.map((n) =>
    String(n || "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
  );
  const carpetas = palabras.map((p) => p[0] || "producto");
  const usadas = palabras.map(() => new Set([0]));

  for (let vuelta = 0; vuelta < 6; vuelta++) {
    const cuantos = new Map();
    carpetas.forEach((c) => cuantos.set(c, (cuantos.get(c) || 0) + 1));
    const chocan = carpetas.map((c, i) => (cuantos.get(c) > 1 ? i : -1)).filter((i) => i >= 0);
    if (!chocan.length) return carpetas;

    let cambio = false;
    for (const i of chocan) {
      // De atrás hacia delante, saltando lo que no distingue.
      for (let k = palabras[i].length - 1; k >= 1; k--) {
        if (usadas[i].has(k) || VACIAS.has(palabras[i][k])) continue;
        carpetas[i] = `${carpetas[i]}-${palabras[i][k]}`;
        usadas[i].add(k);
        cambio = true;
        break;
      }
    }
    if (!cambio) break;
  }
  // Nombres tan parecidos que no hay palabra que los separe.
  const vistas = new Set();
  return carpetas.map((c, i) => {
    if (!vistas.has(c)) { vistas.add(c); return c; }
    return `${c}-${nombres.length && i}`;
  });
}

const INSTRUCCIONES = `Fotos de este producto para la tienda de la web.

Deja aquí las maquetas que descargues del generador de Printful (.jpg, .png o
.webp). Se ordenan por nombre, así que numéralas para mandar tú:

    01-portada.jpg
    02-colgado.jpg
    03-detalle.jpg

La primera es la que se ve grande; las demás salen como miniaturas debajo.
Caben doce. Después, en la raíz del proyecto:

    npm run sync:printful

Este fichero lo reescribe el script en cada sincronización; no hace falta
tocarlo.
`;

/**
 * Las fotos que hayas dejado tú en `public/tienda/<carpeta>/`.
 *
 * Printful solo devuelve por su API una maqueta por producto, aunque su
 * generador te enseñe quince. Las otras catorce se descargan de ahí y se
 * dejan en esta carpeta; la carpeta se crea sola en cada sincronización, así
 * que siempre está esperando.
 *
 * Se ordenan por nombre: numerarlas (`01-…`, `02-…`) decide en qué orden se
 * ven y, de paso, cuál hace de portada.
 */
async function fotosLocales(carpeta) {
  const dir = join(ALBUM, carpeta);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "LEEME.txt"), INSTRUCCIONES, "utf8");
  const ficheros = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
  ficheros.sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
  return ficheros.map((f) => `/tienda/${carpeta}/${encodeURIComponent(f)}`);
}

/**
 * Baja la maqueta de Printful de los colores que no tengan foto propia.
 *
 * El nombre del fichero no es decorativo: **es el dato**. La web decide qué
 * fotos enseñar al elegir un color mirando si el nombre del fichero lleva ese
 * color, así que la maqueta de «Heather Prism Lilac» tiene que aterrizar como
 * `heather-prism-lilac-printful.webp` y no con el hash que trae la URL.
 *
 * Por eso también se guarda en disco en vez de enlazar la URL de Printful:
 * enlazándola no habría nombre que mirar, y además esas direcciones caducan.
 *
 * Se convierte a webp porque sus maquetas vienen en PNG de un mega largo y
 * esta es una tienda que se ve en el móvil.
 */
async function bajarPorColor(carpeta, variantes, propias) {
  const dir = join(ALBUM, carpeta);
  const nombres = propias.map((f) => decodeURIComponent(f.split("/").pop() || "").toLowerCase());
  const tiene = (slug) => nombres.some((n) => n.includes(slug) || APODOS[slug]?.test(n));

  // Una maqueta por color, la primera que aparezca.
  const porColor = new Map();
  for (const v of variantes) {
    const color = (v.color || "").trim();
    if (!color || porColor.has(color)) continue;
    const previo = (v.files || []).find((f) => f.type === "preview")?.preview_url;
    if (previo) porColor.set(color, previo);
  }
  // Con un solo color y fotos tuyas no hay nada que distinguir. Pero si no
  // tienes ninguna, sí merece bajarla: si no, la web acaba enlazando la del
  // CDN de Printful, que es una dirección con caducidad.
  if (porColor.size < 2 && nombres.length) return 0;

  let bajadas = 0;
  for (const [color, url] of porColor) {
    const slug = ranuraColor(color);
    // ¿Ya tienes tú una foto de este color? Entonces manda la tuya.
    if (tiene(slug)) continue;
    const destino = join(dir, `${slug}-printful.webp`);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const original = Buffer.from(await r.arrayBuffer());
      await writeFile(destino, await aWebp(original));
      console.log(`      ↓ maqueta de «${color}» → ${slug}-printful.webp`);
      bajadas++;
    } catch (e) {
      console.log(`      (no pude bajar la maqueta de «${color}»: ${e.message})`);
    }
  }
  return bajadas;
}

/** PNG de Printful a webp del tamaño de la tienda. */
async function aWebp(buffer, lado = 900) {
  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  const img = await loadImage(buffer);
  const escala = Math.min(1, lado / Math.max(img.width, img.height));
  const ancho = Math.round(img.width * escala);
  const alto = Math.round(img.height * escala);
  const lienzo = createCanvas(ancho, alto);
  lienzo.getContext("2d").drawImage(img, 0, 0, ancho, alto);
  return lienzo.encode("webp", 82);
}

async function main() {
  console.log("Leyendo tu tienda de Printful…");

  const lista = await printful("/store/products");
  if (!Array.isArray(lista) || !lista.length) {
    console.log("\nNo hay ningún producto todavía. Créalo en Printful y vuelve a ejecutar esto.");
    return;
  }
  console.log(`  ${lista.length} producto(s) en la tienda\n`);

  // Las carpetas se reparten mirando la tienda entera, no producto a producto:
  // solo se sabe que dos chocan cuando se ven los dos.
  const carpetas = carpetasUnicas(lista.map((p) => p.name));

  const productos = [];
  for (const [indice, resumen] of lista.entries()) {
    const detalle = await printful(`/store/products/${resumen.id}`);
    const crudas = (detalle?.sync_variants || [])
      // Lo que Printful marca como retirado no se puede fabricar, así que no
      // tiene sentido enseñarlo en la web.
      .filter((v) => v.availability_status !== "discontinued");

    const variantes = await Promise.all(
      crudas.map(async (v) => ({
        /** Este es el id que se manda al crear el pedido. */
        id: v.id,
        /** El del catálogo general, útil para depurar. */
        catalogo: v.variant_id,
        nombre: v.name,
        talla: v.size || "UNICA",
        color: v.color || "",
        precio: centimos(v.retail_price),
        moneda: v.currency || "EUR",
        disponible: v.availability_status !== "out_of_stock",
        hex: await colorDe(v.variant_id),
      }))
    );

    /**
     * Las fotos del producto: primero las tuyas, detrás la de Printful.
     *
     * De Printful **solo vale lo que viene marcado como `type: "preview"`**.
     * Los demás ficheros de cada variante —`default`, `back`,
     * `embroidery_chest_left`…— son los de impresión: el logo a pelo, sin
     * prenda debajo. Se veía a simple vista en que la sudadera y la gorra
     * enseñaban la misma imagen, que era el bordado suelto y no la prenda.
     *
     * Y como su API devuelve una sola maqueta por producto, aunque su
     * generador te enseñe quince, las demás vistas las pones tú en
     * `public/tienda/<carpeta>/`. **Si hay alguna ahí, esa es la galería
     * entera**: la de Printful ni aparece. Es lo que hace falta para poder
     * quitar una foto de verdad — mientras la suya siguiera colándose al
     * final, borrar ficheros no servía de nada. Si quieres conservar la suya,
     * guárdala en la carpeta como una más.
     */
    const carpeta = carpetas[indice];
    let propias = await fotosLocales(carpeta);

    /*
      Un color sin foto propia se trae la suya de Printful.

      Añadir «Sage» a una camiseta cuya carpeta solo tiene fotos de la blanca
      dejaba la tienda mintiendo: elegías verde y seguías viendo una prenda
      blanca. Y la regla de «si hay fotos tuyas, las de Printful no aparecen»
      —que existe para poder borrar una foto de verdad— hacía que eso no se
      arreglara solo nunca.

      Así que la regla pasa a mirarse **por color** y no por producto. El color
      que ya tiene foto tuya sigue intocable; el que no la tiene se baja la
      maqueta de Printful una vez, al disco, con el nombre del color delante:
      es ese nombre el que después permite enseñar las fotos que tocan al
      elegir un color. Si algún día le haces fotos mejores, las metes en la
      carpeta y esta deja de traerse la suya.
    */
    const bajadas = await bajarPorColor(carpeta, crudas, propias);
    if (bajadas) propias = await fotosLocales(carpeta);

    const fotos = [...propias];
    const meter = (url) => {
      if (!url) return;
      if (!fotos.includes(url) && fotos.length < MAX_FOTOS) fotos.push(url);
    };
    if (!propias.length) {
      for (const v of crudas) {
        for (const fichero of v.files || []) {
          if (fichero.type === "preview") meter(fichero.preview_url);
        }
      }
      meter(detalle?.sync_product?.thumbnail_url ?? resumen.thumbnail_url);
    }

    productos.push({
      id: detalle?.sync_product?.id ?? resumen.id,
      nombre: detalle?.sync_product?.name ?? resumen.name,
      miniatura: fotos[0] ?? "",
      fotos,
      variantes,
    });

    console.log(`  · ${resumen.name}`);
    const tallas = [...new Set(variantes.map((v) => v.talla))].join(", ");
    const gama = [...new Set(variantes.map((v) => v.color).filter(Boolean))].join(", ");
    console.log(`      ${variantes.length} variantes · tallas: ${tallas || "—"} · colores: ${gama || "—"}`);
    console.log(
      `      ${fotos.length} foto(s)` +
        (propias.length ? ` (todas tuyas)` : " (de Printful)") +
        `  ·  public/tienda/${carpeta}/`
    );
    const precios = [...new Set(variantes.map((v) => v.precio))];
    console.log(
      `      precio: ${precios.map((p) => (p / 100).toFixed(2) + " €").join(" / ") || "sin fijar"}`
    );
  }

  const payload = {
    sincronizado: new Date().toISOString(),
    productos,
  };
  await writeFile(SALIDA, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  // Los precios de las dos imprentas van juntos: los escribe una función
  // compartida, que si no el segundo sincronizador en correr borraría las
  // variantes del primero.
  const cuenta = await escribirPrecios(RAIZ);

  console.log(`\nEscrito en ${SALIDA}`);
  console.log(`Y los precios, en api/checkout.ts (${cuenta} variantes)`);
  console.log("Aquí no hay nada secreto: son números de catálogo y precios.\n");

  const sinPrecio = productos.flatMap((p) => p.variantes).filter((v) => !v.precio);
  if (sinPrecio.length) {
    console.log(
      `Aviso: ${sinPrecio.length} variante(s) sin precio de venta en Printful. Ponles uno o la web no sabrá qué cobrar.`
    );
  }
}

main().catch((err) => {
  console.error(`\nNo se ha podido leer Printful: ${err.message}`);
  if (String(err.message).startsWith("401")) {
    console.error("La clave no vale o le faltan permisos de lectura de productos.");
  }
  process.exit(1);
});
