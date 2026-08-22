/**
 * Pone al día el precio de las variantes recién añadidas en Printful.
 *
 * Cuando añades un color a un producto que ya existe, Printful le pone su
 * precio por defecto y no el tuyo. Esa cifra está pensada para el mercado
 * estadounidense sin bordado, así que en esta tienda **se vende con pérdidas
 * sin que nada avise**: la camiseta blanca a 29 € y la misma camiseta en verde
 * a 19,50 €, que cuesta 27,57 € fabricar y enviar.
 *
 * La regla es la única que se sostiene sola: **dos variantes de la misma talla
 * del mismo producto valen lo mismo**, porque cuestan lo mismo de hacer. El
 * color no cambia el coste. Así que a cada variante se le pone el precio más
 * alto que tenga alguna hermana de su talla, que es el que pusiste a mano
 * sabiendo lo que hacías.
 *
 * No inventa precios: si una talla entera está a precio de fábrica —añadiste
 * un color y una talla nueva a la vez— no hay hermana de la que copiar y se
 * dice, en vez de improvisar un número. Para eso está `npm run costes`, que sí
 * calcula a partir del coste real.
 *
 *   npm run precios          enseña lo que cambiaría y no toca nada
 *   npm run precios -- va    lo aplica
 *
 * Después hay que ejecutar `npm run sync:printful`, que es quien copia los
 * precios de Printful a la web.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APLICAR = process.argv.slice(2).some((a) => /^(va|aplica|--aplicar)$/i.test(a));

/** La clave sale del entorno o de `.env.local`, que no se sube a git. */
function clave() {
  if (process.env.PRINTFUL_API_KEY) return process.env.PRINTFUL_API_KEY;
  try {
    for (const linea of readFileSync(resolve(RAIZ, ".env.local"), "utf8").split(/\r?\n/)) {
      const par = linea.match(/^\s*PRINTFUL_API_KEY\s*=\s*(.+?)\s*$/);
      if (par) return par[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* sin fichero, se avisa abajo */
  }
  return "";
}

const CLAVE = clave();
if (!CLAVE) {
  console.error("Falta PRINTFUL_API_KEY (ponla en .env.local).");
  process.exit(1);
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Una llamada a Printful, con paciencia.
 *
 * Su API corta a los pocos golpes seguidos y responde 429. Reintentar
 * esperando cada vez más es lo que permite recorrer treinta variantes sin que
 * se caiga a mitad y deje media tienda a un precio y media a otro.
 */
async function printful(ruta, opciones = {}, intento = 0) {
  const r = await fetch(`https://api.printful.com${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${CLAVE}`,
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
  });
  if (r.status === 429 && intento < 5) {
    const descanso = 2000 * 2 ** intento;
    console.log(`    (Printful pide calma; espero ${descanso / 1000}s)`);
    await espera(descanso);
    return printful(ruta, opciones, intento + 1);
  }
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(cuerpo?.error?.message || cuerpo?.result || `HTTP ${r.status}`);
  return cuerpo.result;
}

const euros = (n) => `${n.toFixed(2).replace(".", ",")} €`;

async function main() {
  console.log(APLICAR ? "Igualando precios en Printful…\n" : "Esto es lo que cambiaría (nada se toca todavía):\n");

  const lista = await printful("/store/products");
  const pendientes = [];
  const huerfanas = [];

  for (const resumen of lista) {
    const detalle = await printful(`/store/products/${resumen.id}`);
    const variantes = (detalle?.sync_variants || []).filter(
      (v) => v.availability_status !== "discontinued"
    );

    // El precio bueno de cada talla: el más alto que alguien le haya puesto.
    const techo = new Map();
    for (const v of variantes) {
      const talla = v.size || "UNICA";
      const precio = Number(v.retail_price);
      if (!Number.isFinite(precio)) continue;
      techo.set(talla, Math.max(techo.get(talla) ?? 0, precio));
    }

    // Si *todas* las variantes de una talla están al mismo precio no hay nada
    // que copiar: o está bien puesto o está mal puesto entero, y eso no lo
    // puede saber esto. Solo se corrige cuando hay desacuerdo dentro de la talla.
    const desacuerdo = new Set();
    for (const talla of techo.keys()) {
      const suyas = variantes.filter((v) => (v.size || "UNICA") === talla);
      if (new Set(suyas.map((v) => v.retail_price)).size > 1) desacuerdo.add(talla);
    }

    const bajas = variantes.filter((v) => {
      const talla = v.size || "UNICA";
      return desacuerdo.has(talla) && Number(v.retail_price) < techo.get(talla);
    });

    // Una talla entera por debajo de sus compañeras de producto suele ser un
    // color nuevo con talla nueva: no hay hermana de la que copiar.
    const masAlto = Math.max(...techo.values());
    for (const [talla, precio] of techo) {
      if (!desacuerdo.has(talla) && precio < masAlto * 0.75) huerfanas.push({ producto: resumen.name, talla, precio });
    }

    if (bajas.length) {
      console.log(`  ${resumen.name.slice(0, 52)}`);
      for (const v of bajas) {
        const talla = v.size || "UNICA";
        const nuevo = techo.get(talla);
        console.log(
          `    ${(v.color || "—").padEnd(22)} ${(talla).padEnd(6)} ` +
            `${euros(Number(v.retail_price)).padStart(9)} → ${euros(nuevo).padStart(9)}`
        );
        pendientes.push({ id: v.id, precio: nuevo });
      }
      console.log("");
    }

    await espera(700);
  }

  if (huerfanas.length) {
    console.log("  Ojo, estas tallas están muy por debajo del resto y no tienen");
    console.log("  hermana de la que copiar. Míralas con `npm run costes`:");
    for (const h of huerfanas) console.log(`    ${h.producto.slice(0, 40)} · ${h.talla} · ${euros(h.precio)}`);
    console.log("");
  }

  if (!pendientes.length) {
    console.log("Todo cuadra: ninguna variante está por debajo de sus hermanas de talla.");
    return;
  }

  if (!APLICAR) {
    console.log(`${pendientes.length} variante(s) por corregir.`);
    console.log("Para aplicarlo:   npm run precios -- va");
    return;
  }

  let hechas = 0;
  for (const p of pendientes) {
    await printful(`/store/variants/${p.id}`, {
      method: "PUT",
      body: JSON.stringify({ retail_price: p.precio.toFixed(2) }),
    });
    hechas++;
    process.stdout.write(`\r  ${hechas}/${pendientes.length} actualizadas`);
    // Sin esta pausa Printful corta a la décima llamada.
    await espera(900);
  }

  console.log(`\n\nListo: ${hechas} variante(s) al precio de sus hermanas.`);
  console.log("Ahora  npm run sync:printful  para que la web se entere.");
}

main().catch((e) => {
  console.error("\nNo se pudo terminar:", e.message);
  process.exit(1);
});
