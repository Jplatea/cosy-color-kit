/**
 * Trae de Gelato lo que hay puesto a la venta.
 *
 *   npm run sync:gelato
 *
 * Lee tu tienda de Gelato y escribe `src/config/gelato.json` con cada producto,
 * sus variantes, el identificador que hace falta para fabricarlo y el precio al
 * que conviene venderlo. Igual que el de Printful, con tres diferencias que
 * conviene saber porque explican por qué este script hace más cosas:
 *
 *  · **El precio no viene con la variante.** Gelato guarda en la tienda lo que
 *    se fabrica, no lo que cuesta; hay que preguntárselo al catálogo, uno por
 *    uno y diciéndole a qué país se manda, porque cambia.
 *
 *  · **El envío tampoco.** Lo calcula por pedido, así que se le pide un
 *    presupuesto de una unidad y se coge el porte más barato. Vale la pena
 *    mirar los días que trae de vuelta: hay opciones a cuatro euros que tardan
 *    doce días, y eso decide una compra tanto como el precio.
 *
 *  · **Las fotos caducan.** Las devuelve como enlaces firmados de Amazon con
 *    fecha de caducidad dentro. Guardarlas en el JSON sería dejar la tienda
 *    llena de imágenes rotas dentro de una semana, así que se descargan a
 *    `public/tienda/` y se sirven desde aquí.
 *
 * Los precios de venta no se inventan: se calculan para dejar el margen que se
 * le pida —`npm run sync:gelato 12` para otro— sobre el coste real puesto en
 * casa del comprador.
 *
 * Variables (en `.env.local`, que está en el .gitignore):
 *   GELATO_API_KEY   obligatoria
 *   GELATO_STORE_ID  solo si tienes más de una tienda
 */

import { writeFile, readFile, mkdir, readdir, rm } from "node:fs/promises";
import { escribirPrecios } from "./lib/precios.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = join(RAIZ, "src", "config", "gelato.json");
const ALBUM = join(RAIZ, "public", "tienda");

/** Lo que se quiere ganar limpio por prenda. */
const OBJETIVO = Number(process.argv[2]) || 9;
const ENVIO_COBRADO = 4.9;
const ENVIO_GRATIS_DESDE = 60;
const COMISION = { porcentaje: 0.015, fijo: 0.25 };

/**
 * El IVA que Gelato añade a su factura.
 *
 * En el presupuesto no viene: su API contesta precios sin impuestos. Si al
 * darte de alta pusiste un NIF español, Gelato factura con inversión del sujeto
 * pasivo y no te lo cobra —lo declaras tú—; si no, te lo carga. Aquí se cuenta
 * el caso malo a propósito: si al final no te lo cobran, el margen real sale
 * mejor que el calculado, y ese es el error que conviene tener.
 */
const IVA = 0.21;

/** A dónde se simula el envío para pedir precio. */
const DESTINO = {
  country: "ES",
  firstName: "Cliente",
  lastName: "Ejemplo",
  addressLine1: "Calle Mayor 1",
  city: "Madrid",
  postCode: "28013",
  email: "hola@culowypililarge.com",
};

const eur = (n) => `${n.toFixed(2).replace(".", ",")} €`;

/** A cuánto venderlo para ganar `OBJETIVO` limpios. Ver `scripts/costes.mjs`. */
function precioPara(coste) {
  const despeja = (porte) =>
    (OBJETIVO + COMISION.fijo + coste) / (1 - COMISION.porcentaje) - porte;
  const conPorte = despeja(ENVIO_COBRADO);
  return conPorte < ENVIO_GRATIS_DESDE ? conPorte : despeja(0);
}

const redondea = (n) => Math.ceil(n * 2) / 2;

/**
 * El nombre de carpeta de un producto: su primera palabra con sustancia.
 *
 * «Tote Bag "Kit de Desahucio"…» → `gelato-tote`. Y «La Sudadera perfecta…» →
 * `gelato-sudadera`, no `la`: los artículos se saltan, que si no acabas con una
 * carpeta llamada `la` y otra llamada `el` y no sabes cuál es cuál. Esta
 * carpeta la vas a abrir tú en el explorador, así que tiene que decir algo.
 *
 * Y lleva el nombre de la imprenta delante porque en las dos hay una sudadera:
 * sin el prefijo compartían carpeta y cada producto acababa enseñando las
 * maquetas del otro.
 */
const VACIAS = new Set(["la", "el", "los", "las", "un", "una", "unos", "unas", "de", "del", "mi", "tu"]);

const ranura = (nombre) => {
  const palabras = String(nombre || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const cuerpo = palabras.find((p) => !VACIAS.has(p) && p.length > 2) || palabras[0] || "producto";
  return `gelato-${cuerpo}`;
};

/**
 * «White - XL - DTG (Direct-to-garment)» → color White, talla XL.
 *
 * Gelato mete todo en el título separado por guiones: el color primero, la
 * técnica al final, y la talla en medio cuando la prenda tiene tallas. Una
 * bolsa no las tiene y viene con dos trozos en vez de tres.
 */
function trocea(titulo) {
  const partes = String(titulo || "").split(" - ").map((s) => s.trim());
  return {
    color: partes[0] || "",
    talla: partes.length >= 3 ? partes[1] : "UNICA",
    tecnica: partes.at(-1) || "",
  };
}

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

async function gelato(url, cuerpo) {
  const res = await fetch(url, {
    method: cuerpo ? "POST" : "GET",
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} en ${url.split(".com")[1]}: ${(await res.text()).slice(0, 160)}`);
  return res.json();
}

/** Lo que Gelato cobra por fabricar esa variante, puesta en España, sin envío. */
const cacheCoste = new Map();
async function costeDe(uid) {
  if (cacheCoste.has(uid)) return cacheCoste.get(uid);
  let valor = null;
  try {
    const cuerpo = await gelato(
      `https://product.gelatoapis.com/v3/products/${encodeURIComponent(uid)}/prices?country=ES&currency=EUR`
    );
    const uno = (cuerpo?.data ?? cuerpo ?? []).find?.((x) => x.quantity === 1);
    valor = uno ? Number(uno.price) : null;
  } catch {
    valor = null;
  }
  cacheCoste.set(uid, valor);
  return valor;
}

/** El porte más barato para una unidad, con los días que tarda. */
async function porteDe(uid) {
  try {
    const cuerpo = await gelato("https://order.gelatoapis.com/v4/orders:quote", {
      orderReferenceId: "sondeo",
      customerReferenceId: "culowypililarge",
      currency: "EUR",
      recipient: DESTINO,
      products: [{ itemReferenceId: "uno", productUid: uid, quantity: 1 }],
    });
    const metodos = (cuerpo.quotes || []).flatMap((q) => q.shipmentMethods || []);
    if (!metodos.length) return null;
    const barato = metodos.reduce((a, b) => (Number(b.price) < Number(a.price) ? b : a));
    return {
      precio: Number(barato.price),
      dias: [barato.minDeliveryDays, barato.maxDeliveryDays],
      nombre: barato.name,
    };
  } catch {
    return null;
  }
}

/**
 * Baja las fotos a `public/tienda/<carpeta>/`.
 *
 * Vienen firmadas y con caducidad, así que apuntarlas en el JSON sería dejar la
 * tienda con imágenes rotas dentro de unos días. Se guardan aquí y se sirven
 * desde el propio dominio.
 */
async function bajarFotos(carpeta, imagenes) {
  const dir = join(ALBUM, carpeta);
  await mkdir(dir, { recursive: true });
  // Se limpia lo de la vuelta anterior: si en Gelato quitas una maqueta, aquí
  // también se va, y no se queda una foto de un diseño viejo colgada.
  for (const f of await readdir(dir).catch(() => [])) {
    if (/^gelato-\d+\./.test(f)) await rm(join(dir, f));
  }

  const rutas = [];
  for (const [i, img] of imagenes.slice(0, 8).entries()) {
    if (!img.fileUrl) continue;
    try {
      const res = await fetch(img.fileUrl);
      if (!res.ok) continue;
      const tipo = res.headers.get("content-type") || "";
      const ext = tipo.includes("png") ? "png" : tipo.includes("webp") ? "webp" : "jpg";
      const nombre = `gelato-${String(i + 1).padStart(2, "0")}.${ext}`;
      await writeFile(join(dir, nombre), Buffer.from(await res.arrayBuffer()));
      rutas.push(`/tienda/${carpeta}/${nombre}`);
    } catch {
      /* una foto que no baja no debe tumbar la sincronización */
    }
  }
  return rutas;
}

async function main() {
  console.log("Leyendo tu tienda de Gelato…\n");

  let tienda = await claveDelEntorno("GELATO_STORE_ID");
  if (!tienda) {
    const { stores = [] } = await gelato("https://ecommerce.gelatoapis.com/v1/stores");
    if (!stores.length) {
      console.log("No hay ninguna tienda. Créala en el panel de Gelato y vuelve a ejecutar esto.");
      return;
    }
    if (stores.length > 1) {
      console.log("Hay varias tiendas; pon GELATO_STORE_ID en .env.local con la que quieras:");
      for (const s of stores) console.log(`  ${s.id}  ${s.name}`);
      return;
    }
    tienda = stores[0].id;
    console.log(`  Tienda «${stores[0].name}»\n`);
  }

  const { products = [] } = await gelato(
    `https://ecommerce.gelatoapis.com/v1/stores/${tienda}/products?limit=100`
  );
  if (!products.length) {
    console.log("La tienda está vacía. Crea productos en Gelato y vuelve a ejecutar esto.");
    return;
  }

  const salida = [];
  for (const resumen of products) {
    const p = await gelato(
      `https://ecommerce.gelatoapis.com/v1/stores/${tienda}/products/${resumen.id}`
    );
    console.log(`  ${(p.title || "").slice(0, 62)}`);

    const crudas = (p.variants || []).filter((v) => !v.isHidden && v.productUid);
    if (!crudas.length) {
      console.log("    sin variantes utilizables; se salta\n");
      continue;
    }

    const porte = await porteDe(crudas[0].productUid);
    if (porte) {
      console.log(`    envío ${eur(porte.precio)} · ${porte.dias[0]}–${porte.dias[1]} días · ${porte.nombre}`);
    } else {
      console.log("    sin presupuesto de envío; el precio saldrá sin porte");
    }

    const variantes = [];
    for (const v of crudas) {
      const coste = await costeDe(v.productUid);
      if (coste === null) {
        console.log(`    ${(v.title || "").slice(0, 34).padEnd(36)}sin precio, se salta`);
        continue;
      }
      const { color, talla, tecnica } = trocea(v.title);
      const puesto = (coste + (porte?.precio ?? 0)) * (1 + IVA);
      const venta = redondea(precioPara(puesto));
      variantes.push({
        id: v.id,
        uid: v.productUid,
        talla,
        color,
        tecnica,
        coste: Math.round(coste * 100),
        puesto: Math.round(puesto * 100),
        precio: Math.round(venta * 100),
        moneda: "EUR",
        disponible: true,
      });
    }

    if (!variantes.length) {
      console.log("    ninguna variante con precio; no se guarda\n");
      continue;
    }

    const tallas = [...new Set(variantes.map((v) => v.talla))];
    const rango = tallas.length > 1 ? `${tallas[0]}–${tallas.at(-1)}` : tallas[0];
    const precios = [...new Set(variantes.map((v) => v.precio))].sort((a, b) => a - b);
    console.log(
      `    ${variantes.length} variantes · tallas ${rango} · cuesta ${eur(variantes[0].puesto / 100)}` +
        ` → véndelo a ${precios.map((c) => eur(c / 100)).join(" / ")}`
    );

    const carpeta = ranura(p.title);
    const fotos = await bajarFotos(carpeta, p.productImages || []);
    console.log(`    ${fotos.length} foto(s) descargadas a public/tienda/${carpeta}/\n`);

    salida.push({
      id: p.id,
      nombre: p.title,
      ficha: (p.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
      carpeta,
      fotos,
      miniatura: fotos[0] ?? "",
      envio: porte,
      variantes,
    });
  }

  await writeFile(
    SALIDA,
    `${JSON.stringify({ sincronizado: new Date().toISOString(), tienda, productos: salida }, null, 2)}\n`,
    "utf8"
  );
  const cuenta = await escribirPrecios(RAIZ);
  console.log(`Escrito en ${SALIDA}`);
  console.log(`Y los precios de las dos imprentas, en api/checkout.ts (${JSON.stringify(cuenta)})`);
  console.log(`
Los costes llevan el envío más barato y un ${IVA * 100} % de IVA. Si en Gelato diste un
NIF español no te cobran ese IVA —lo declaras tú— y el margen real sale mejor
que el de aquí; se cuenta el caso malo a propósito.`);
}

main().catch((err) => {
  console.error(`\nNo se ha podido leer Gelato: ${err.message}`);
  process.exit(1);
});
