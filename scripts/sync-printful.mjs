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

async function main() {
  console.log("Leyendo tu tienda de Printful…");

  const lista = await printful("/store/products");
  if (!Array.isArray(lista) || !lista.length) {
    console.log("\nNo hay ningún producto todavía. Créalo en Printful y vuelve a ejecutar esto.");
    return;
  }
  console.log(`  ${lista.length} producto(s) en la tienda\n`);

  const productos = [];
  for (const resumen of lista) {
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
    const carpeta = ranura(detalle?.sync_product?.name ?? resumen.name);
    const propias = await fotosLocales(carpeta);
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
