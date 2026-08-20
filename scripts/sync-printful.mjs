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

import { writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const SALIDA = join(RAIZ, "src", "config", "printful.json");
/**
 * La misma información, recortada, al lado de la función de cobro.
 *
 * El servidor tiene que poder mirar el precio por su cuenta: si viniera en la
 * petición, cualquiera compraría una camiseta por un céntimo cambiando un
 * número en el inspector. Y tiene que vivir dentro de `api/` porque Vercel
 * empaqueta cada función con lo que cuelga de ella y nada más.
 */
const SALIDA_API = join(RAIZ, "api", "precios.json");

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

    productos.push({
      id: detalle?.sync_product?.id ?? resumen.id,
      nombre: detalle?.sync_product?.name ?? resumen.name,
      miniatura: detalle?.sync_product?.thumbnail_url ?? resumen.thumbnail_url ?? "",
      variantes,
    });

    console.log(`  · ${resumen.name}`);
    const tallas = [...new Set(variantes.map((v) => v.talla))].join(", ");
    const gama = [...new Set(variantes.map((v) => v.color).filter(Boolean))].join(", ");
    console.log(`      ${variantes.length} variantes · tallas: ${tallas || "—"} · colores: ${gama || "—"}`);
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

  // Solo lo que el cobro necesita: qué es cada variante y cuánto vale.
  const precios = {};
  for (const p of productos) {
    for (const v of p.variantes) {
      precios[v.id] = {
        nombre: `${p.nombre}${v.talla && v.talla !== "UNICA" ? ` · ${v.talla}` : ""}`,
        precio: v.precio,
      };
    }
  }
  await writeFile(SALIDA_API, `${JSON.stringify({ precios }, null, 2)}\n`, "utf8");

  console.log(`\nEscrito en ${SALIDA}`);
  console.log(`Y la tabla de precios del cobro en ${SALIDA_API}`);
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
