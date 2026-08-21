/**
 * Escribe la tabla de precios dentro de `api/checkout.ts`.
 *
 * Vive aparte del sincronizador porque la escritura tiene su propio cuidado
 * —las marcas, el no pisar el resto del fichero— y mezclarla con la lectura de
 * la imprenta enterraba las dos cosas.
 *
 * Va dentro del propio fichero de la función y no en un módulo al lado porque
 * las dos alternativas reventaron en producción con FUNCTION_INVOCATION_FAILED:
 * ni un `import` de JSON ni uno de un módulo hermano llegaban a la función ya
 * empaquetada. Vercel mete cada función en su propio paquete, así que lo único
 * que no se pierde por el camino es el fichero en sí.
 *
 * El servidor tiene que poder mirar el precio por su cuenta. Si viniera en la
 * petición, cualquiera compraría una sudadera por un céntimo cambiando un
 * número en el inspector.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DESDE = "// === PRECIOS · generado, no editar ===";
const HASTA = "// === FIN PRECIOS ===";

/** Cómo se llama la variante en el resguardo de Stripe. */
const etiqueta = (producto, talla) =>
  `${producto}${talla && talla !== "UNICA" ? ` · ${talla}` : ""}`;

export async function escribirPrecios(raiz) {
  const leer = async (nombre) => {
    try {
      return JSON.parse(await readFile(join(raiz, "src", "config", nombre), "utf8"));
    } catch {
      return { productos: [] };
    }
  };

  const printful = await leer("printful.json");

  const precios = {};

  for (const p of printful.productos ?? []) {
    for (const v of p.variantes ?? []) {
      precios[String(v.id)] = {
        nombre: etiqueta(p.nombre, v.talla),
        precio: v.precio,
      };
    }
  }


  const ruta = join(raiz, "api", "checkout.ts");
  const actual = await readFile(ruta, "utf8");
  const a = actual.indexOf(DESDE);
  const b = actual.indexOf(HASTA);
  // Si las marcas no están, se para en vez de escribir encima: así fue como se
  // destruyó el fichero una vez.
  if (a < 0 || b < 0 || b < a) {
    throw new Error("no encuentro las marcas de precios en api/checkout.ts; no escribo nada");
  }

  const tabla =
    `${DESDE}\ntype Articulo = { nombre: string; precio: number };\n` +
    `const PRECIOS: Record<string, Articulo> = ${JSON.stringify(precios, null, 2)};\n`;

  await writeFile(ruta, actual.slice(0, a) + tabla + actual.slice(b), "utf8");

  return Object.keys(precios).length;
}
