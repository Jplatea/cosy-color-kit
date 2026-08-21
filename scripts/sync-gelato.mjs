/**
 * Arma el catálogo de Gelato.
 *
 *   npm run sync:gelato
 *
 * Gelato no funciona como Printful y conviene tenerlo claro antes de tocar
 * nada. En Printful tú creas los productos en su panel y este proyecto los
 * lee; en Gelato **no hay panel de productos que leer**. Sus «tiendas» son
 * Shopify, Etsy y compañía, y una web propia no es ninguna de esas: si se le
 * pregunta por las tiendas de esta cuenta contesta una lista vacía, y va a
 * seguir vacía siempre.
 *
 * Su modelo es el contrario. El catálogo vive aquí, en `PRODUCTOS`: se elige
 * un artículo de su catálogo general por su identificador —que describe la
 * prenda entera, hasta la talla y el sitio del bordado— y al pedirlo se le
 * pasa la URL del diseño, alojado en esta misma web. Él lo descarga, lo borda
 * y lo manda.
 *
 * Lo que hace este script es preguntar el precio de cada talla en España y
 * escribir `src/config/gelato.json`. Los precios de venta no los inventa: los
 * calcula para dejar el margen que se le pida y avisa de lo que salga corto.
 *
 * Variables (en `.env.local`, que está en el .gitignore):
 *   GELATO_API_KEY   obligatoria
 */

import { writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = join(RAIZ, "src", "config", "gelato.json");

/** Dónde vive el diseño para que Gelato pueda descargarlo. */
const WEB = process.env.CYP_URL || "https://www.culowypililarge.com";

/** Lo que se quiere ganar limpio por prenda. */
const OBJETIVO = Number(process.argv[2]) || 9;
const ENVIO_COBRADO = 4.9;
const ENVIO_GRATIS_DESDE = 60;
const COMISION = { porcentaje: 0.015, fijo: 0.25 };

/**
 * El IVA que Gelato añade a su factura.
 *
 * En el presupuesto no viene: su API contesta precios sin impuestos. Si al
 * darte de alta pusiste un NIF español, Gelato factura con inversión del
 * sujeto pasivo y no te cobra IVA —lo declaras tú—; si no, te lo carga. Aquí
 * se cuenta el caso malo, que es el prudente: si al final no te lo cobran, el
 * margen real sale mejor que el calculado, y ese error es el que conviene.
 */
const IVA = 0.21;

/**
 * Lo que se vende, cada uno atado a un artículo del catálogo de Gelato.
 *
 * El identificador lleva la prenda dentro: tejido, corte, color, talla y
 * dónde va el bordado. `SIZE` se sustituye por cada talla. Las tallas no son
 * las que uno quiera: la camiseta bordada existe de la S a la 3XL y ahí se
 * acaba, así que pedir una XS devolvería un 400.
 */
const PRODUCTOS = [
  {
    id: "camisetita",
    nombre: "Camisetita para ver a tus Bros en el padel",
    ficha: "Algodón peinado. Corte recto, cuello reforzado. El símbolo bordado en el pecho.",
    prenda: "camiseta",
    uid: "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_SIZE_gco_white_gpr_chstl-emb_shslr-emb",
    tallas: ["s", "m", "l", "xl", "2xl", "3xl"],
    color: { id: "blanco", nombre: "Blanco", hex: "#ffffff" },
    /** Dónde va el diseño y cuál es. Los dos nombres los pone Gelato. */
    colocacion: "chest-left-embroidery",
    diseno: "/disenos/simbolo.png",
  },
];

const eur = (n) => `${n.toFixed(2).replace(".", ",")} €`;

/** A cuánto venderlo para ganar `OBJETIVO` limpios. Ver `scripts/costes.mjs`. */
function precioPara(coste) {
  const despeja = (porte) =>
    (OBJETIVO + COMISION.fijo + coste) / (1 - COMISION.porcentaje) - porte;
  const conPorte = despeja(ENVIO_COBRADO);
  return conPorte < ENVIO_GRATIS_DESDE ? conPorte : despeja(0);
}

const redondea = (n) => Math.ceil(n * 2) / 2;

async function claveDelEntorno(nombre) {
  if (process.env[nombre]) return process.env[nombre].trim();
  for (const fichero of [".env.local", ".env"]) {
    try {
      const texto = await readFile(join(RAIZ, fichero), "utf8");
      for (const linea of texto.split(/\r?\n/)) {
        const corte = linea.indexOf("=");
        if (corte < 0 || linea.trim().startsWith("#")) continue;
        if (linea.slice(0, corte).trim() !== nombre) continue;
        return linea.slice(corte + 1).trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      /* ese fichero no está */
    }
  }
  return "";
}

const CLAVE = await claveDelEntorno("GELATO_API_KEY");
if (!CLAVE) {
  console.error(`
Falta la clave de Gelato.

Sácala en gelato.com → Developers → API Keys y déjala en \`.env.local\`:

    GELATO_API_KEY=tu_clave

Ese fichero está en el .gitignore, así que no se sube a ningún sitio.
`);
  process.exit(1);
}

const cabeceras = { "X-API-KEY": CLAVE, "content-type": "application/json" };

async function precioDe(uid) {
  const res = await fetch(
    `https://product.gelatoapis.com/v3/products/${encodeURIComponent(uid)}/prices?country=ES&currency=EUR`,
    { headers: cabeceras }
  );
  if (!res.ok) return null;
  const cuerpo = await res.json();
  const uno = (cuerpo?.data ?? cuerpo ?? []).find?.((x) => x.quantity === 1);
  return uno ? Number(uno.price) : null;
}

/**
 * Lo que cuesta el envío, que Gelato calcula por pedido y no por producto.
 *
 * Se le pide presupuesto de una unidad y se coge el porte más barato. Devuelve
 * también los días, que en Gelato no son un detalle: hay opciones a cuatro
 * euros que tardan doce días.
 */
async function porteDe(uid, colocacion, diseno) {
  const res = await fetch("https://order.gelatoapis.com/v4/orders:quote", {
    method: "POST",
    headers: cabeceras,
    body: JSON.stringify({
      orderReferenceId: "sondeo",
      customerReferenceId: "culowypililarge",
      currency: "EUR",
      recipient: {
        country: "ES",
        firstName: "Cliente",
        lastName: "Ejemplo",
        addressLine1: "Calle Mayor 1",
        city: "Madrid",
        postCode: "28013",
        email: "hola@culowypililarge.com",
      },
      products: [
        {
          itemReferenceId: "uno",
          productUid: uid,
          quantity: 1,
          files: [{ type: colocacion, url: `${WEB}${diseno}` }],
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const cuerpo = await res.json();
  const metodos = (cuerpo.quotes || []).flatMap((q) => q.shipmentMethods || []);
  if (!metodos.length) return null;
  const barato = metodos.reduce((a, b) => (Number(b.price) < Number(a.price) ? b : a));
  return { precio: Number(barato.price), dias: [barato.minDeliveryDays, barato.maxDeliveryDays], nombre: barato.name };
}

async function main() {
  console.log("Preguntando a Gelato…\n");
  const productos = [];

  for (const p of PRODUCTOS) {
    console.log(`  ${p.nombre}`);
    const porte = await porteDe(p.uid.replace("SIZE", p.tallas[0]), p.colocacion, p.diseno);
    if (porte) {
      console.log(`    envío más barato: ${eur(porte.precio)} · ${porte.dias[0]}–${porte.dias[1]} días · ${porte.nombre}`);
    }

    const variantes = [];
    for (const talla of p.tallas) {
      const uid = p.uid.replace("SIZE", talla);
      const coste = await precioDe(uid);
      if (coste === null) {
        console.log(`    ${talla.toUpperCase().padEnd(5)}no existe en Gelato, se salta`);
        continue;
      }
      // Puesto en casa del comprador y con impuestos: lo que de verdad sale.
      const puesto = (coste + (porte?.precio ?? 0)) * (1 + IVA);
      const venta = redondea(precioPara(puesto));
      variantes.push({
        uid,
        talla: talla.toUpperCase(),
        coste: Math.round(coste * 100),
        puesto: Math.round(puesto * 100),
        precio: Math.round(venta * 100),
        moneda: "EUR",
        disponible: true,
      });
      console.log(
        `    ${talla.toUpperCase().padEnd(5)}cuesta ${eur(puesto).padStart(9)}   →   véndelo a ${eur(venta)}`
      );
    }

    if (!variantes.length) {
      console.log("    sin ninguna talla disponible; no se guarda");
      continue;
    }

    productos.push({
      id: p.id,
      nombre: p.nombre,
      ficha: p.ficha,
      prenda: p.prenda,
      color: p.color,
      colocacion: p.colocacion,
      diseno: p.diseno,
      envio: porte ?? null,
      variantes,
    });
  }

  await writeFile(
    SALIDA,
    `${JSON.stringify({ sincronizado: new Date().toISOString(), imprenta: "gelato", productos }, null, 2)}\n`,
    "utf8"
  );
  console.log(`\nEscrito en ${SALIDA}`);
  console.log(`
Los costes llevan el envío más barato y un ${IVA * 100} % de IVA. Si en Gelato diste
un NIF español no te cobran ese IVA —lo declaras tú— y el margen real sale
mejor que el de aquí; se cuenta el caso malo a propósito.`);
}

main().catch((err) => {
  console.error(`\nNo se ha podido leer Gelato: ${err.message}`);
  process.exit(1);
});
