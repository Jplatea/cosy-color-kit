/**
 * ¿Cuánto se gana con cada prenda?
 *
 *   npm run costes
 *
 * Pregunta a la imprenta lo que cuesta fabricar y mandar cada variante a
 * España, lo pone al lado de lo que cobra la web, y dice si el negocio sale o
 * no. No toca nada: solo consulta y escribe por pantalla.
 *
 * El coste no es el precio de la prenda en blanco, que es el número fácil de
 * mirar y el que engaña. Printful tiene un endpoint que suma lo que de verdad
 * se paga —prenda, estampado o bordado, envío, IVA— y ese es el que se usa.
 *
 * Dos gastos merecen explicación aparte:
 *
 *   · **Digitalización.** Pasar un logo a puntadas de bordado se paga una vez
 *     por diseño, no en cada pedido. Sale en la primera estimación y hunde el
 *     margen del primer pedido; a partir del segundo desaparece. Aquí se
 *     enseña el margen con y sin, porque el que importa a largo plazo es el
 *     de sin.
 *   · **La comisión de la pasarela.** No la sabe la imprenta, así que se
 *     estima con la tarifa europea de Stripe. Es una aproximación honesta,
 *     no un dato exacto.
 *
 * Si hay credenciales de otras imprentas —Gelato, Apliiq— también trae sus
 * catálogos para comparar. Son opcionales: sin ellas el informe sale solo con
 * Printful y lo dice.
 *
 * Variables (en `.env.local`, que está en el .gitignore):
 *   PRINTFUL_API_KEY   obligatoria
 *   GELATO_API_KEY     opcional
 *   APLIIQ_APP_ID      opcional
 *   APLIIQ_SECRET      opcional
 */

import { readFile } from "node:fs/promises";
import { createHmac, randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

/** A dónde se simula el envío. Cambia el IVA y el porte, así que importa. */
const DESTINO = { address1: "Calle Mayor 1", city: "Madrid", country_code: "ES", zip: "28013" };

/** Lo que la web le cobra al comprador por el envío. Está en `api/checkout.ts`. */
const ENVIO_COBRADO = 4.9;
const ENVIO_GRATIS_DESDE = 60;

/** Tarifa europea de Stripe para tarjetas del EEE. Aproximada. */
const COMISION = { porcentaje: 0.015, fijo: 0.25 };

/**
 * Lo que se quiere ganar. Dos formas de pedirlo:
 *
 *     npm run costes -- 12      doce euros limpios por prenda
 *     npm run costes -- 15%     un quince por ciento de lo cobrado
 *
 * No son lo mismo y la diferencia importa. Una cantidad fija trata igual a una
 * bolsa de veinte euros que a una de cien, lo que deja la cara con un margen
 * ridículo en proporción. Un porcentaje escala con el precio, pero en lo barato
 * puede quedarse en calderilla: el 15 % de una taza son dos euros, y dos euros
 * no pagan el rato de atender una devolución.
 */
const PEDIDO = String(process.argv[2] || "8");
const PORCENTUAL = PEDIDO.trim().endsWith("%");
const OBJETIVO = Number(PEDIDO.replace("%", "")) || 8;

/**
 * Con `va` al final, además de calcular lo escribe en Printful.
 *
 *     npm run costes -- 10%       dice lo que habría que cobrar
 *     npm run costes -- 10% va    lo pone
 *
 * Se pide a propósito una palabra de más. Esto cambia el precio de venta de la
 * tienda entera de un tirón, y no debería poder pasar por escribir mal un
 * comando. Lo que hace se ha enseñado siempre antes, en la tabla de arriba.
 */
const APLICAR = process.argv.slice(3).some((a) => /^(va|aplica|--aplicar)$/i.test(a));

/**
 * A cuánto habría que venderlo para ganar `OBJETIVO` limpios.
 *
 * Hay que despejarlo y no tantear, porque el precio se muerde la cola: subirlo
 * sube la comisión de la pasarela, que se lleva un porcentaje de lo cobrado.
 * Y hay un escalón: pasando de `ENVIO_GRATIS_DESDE` la web deja de cobrar el
 * envío, así que el precio sube pero lo cobrado no tanto. Por eso se resuelve
 * en los dos escenarios y se elige el que de verdad llega al objetivo.
 */
function precioPara(coste) {
  /*
    Con objetivo fijo se despeja directamente. Con porcentaje hay que despejar
    otra cosa: el margen deja de ser un número y pasa a depender de lo cobrado,
    que es justo lo que se busca. Sale de
        cobrado - coste - comisión = OBJETIVO% · cobrado
    agrupando los dos términos que van a porcentaje de lo cobrado.
  */
  const tajada = PORCENTUAL ? OBJETIVO / 100 : 0;
  const fijo = PORCENTUAL ? 0 : OBJETIVO;
  const despeja = (porte) =>
    (fijo + COMISION.fijo + coste) / (1 - COMISION.porcentaje - tajada) - porte;

  const conPorte = despeja(ENVIO_COBRADO);
  if (conPorte < ENVIO_GRATIS_DESDE) return conPorte;
  // Ya en el tramo de envío gratis: el comprador solo paga el precio.
  return despeja(0);
}

/** Lo que se gana con ese precio, para comprobar que el despeje cuadra. */
const margenDe = (cobrado, coste) =>
  cobrado - coste - (cobrado * COMISION.porcentaje + COMISION.fijo);

/** A números de tienda: 26,19 no se pone en un escaparate; 26,50 sí. */
const redondea = (n) => Math.ceil(n * 2) / 2;

async function delEntorno(nombre) {
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

const eur = (n) => `${n.toFixed(2).replace(".", ",")} €`;

// ─────────────────────────────────────────────────────────── Printful

async function printful(clave, ruta, cuerpo) {
  const res = await fetch(`https://api.printful.com${ruta}`, {
    method: cuerpo ? "POST" : "GET",
    headers: { authorization: `Bearer ${clave}`, "content-type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${res.status} en ${ruta}: ${json?.error?.message || res.statusText}`);
  return json?.result;
}

async function informePrintful(clave) {
  const lista = await printful(clave, "/store/products");
  console.log(`\nPRINTFUL · ${lista.length} productos, coste puesto en Madrid\n`);

  const resumen = [];
  for (const p of lista) {
    const detalle = await printful(clave, `/store/products/${p.id}`);
    const variantes = (detalle.sync_variants || []).filter(
      (v) => v.availability_status !== "discontinued"
    );
    if (!variantes.length) continue;

    console.log(`  ${detalle.sync_product.name}`);

    // Una estimación por tramo de precio: las tallas que cuestan lo mismo
    // salen igual y no merece gastar una llamada por cada una.
    const tramos = new Map();
    for (const v of variantes) {
      if (!tramos.has(v.retail_price)) tramos.set(v.retail_price, v);
    }

    for (const [precio, v] of tramos) {
      const venta = Number(precio);
      const { costs } = await printful(clave, "/orders/estimate-costs", {
        recipient: DESTINO,
        items: [{ sync_variant_id: v.id, quantity: 1 }],
      });

      const cobrado = venta + (venta >= ENVIO_GRATIS_DESDE ? 0 : ENVIO_COBRADO);
      const comision = cobrado * COMISION.porcentaje + COMISION.fijo;
      const sinDigi = costs.total - costs.digitization;
      const margen = cobrado - costs.total - comision;
      const margenRepe = cobrado - sinDigi - comision;

      const tallas = variantes.filter((x) => x.retail_price === precio).map((x) => x.size || "única");
      const sugerido = redondea(precioPara(sinDigi));
      const señal =
        margenRepe < 0 ? `  ← PIERDES DINERO · ponlo a ${eur(sugerido)}`
        : margenRepe < (PORCENTUAL ? (cobrado * OBJETIVO) / 100 - 0.5 : OBJETIVO - 2)
          ? `  ← flojo · ponlo a ${eur(sugerido)}`
        : "  ← bien";

      // La columna del coste enseña el que se repite, para que cuadre con el
      // margen de al lado. Meter ahí la digitalización descuadraba la resta y
      // hacía dudar del informe entero.
      console.log(
        `    ${(tallas[0] === tallas.at(-1) ? tallas[0] : `${tallas[0]}–${tallas.at(-1)}`).padEnd(10)}` +
          `cobras ${eur(cobrado).padStart(9)}   cuesta ${eur(sinDigi).padStart(9)}   ` +
          `comisión ${eur(comision).padStart(7)}   →  ${eur(margenRepe).padStart(9)}${señal}`
      );
      if (costs.digitization > 0) {
        console.log(
          `    ${"".padEnd(10)}(el primer pedido lleva ${eur(costs.digitization)} de digitalización` +
            ` del bordado: margen ${eur(margen)} esa vez)`
        );
      }
      resumen.push({
        producto: detalle.sync_product.name,
        tallas: tallas[0] === tallas.at(-1) ? tallas[0] : `${tallas[0]}–${tallas.at(-1)}`,
        venta,
        cobrado,
        coste: sinDigi,
        sugerido,
        margen: margenRepe,
        // Las variantes de este tramo, para poder escribirles el precio.
        // Cuestan lo mismo, así que les toca el mismo precio a todas.
        ids: variantes.filter((x) => x.retail_price === precio).map((x) => x.id),
      });
    }
  }
  return resumen;
}

// ─────────────────────────────────────────────────────────── Apliiq

/**
 * Su firma es más liosa que un `Bearer`: hay que armar una cadena con el id de
 * la aplicación, la hora, un número de un solo uso y el cuerpo en base64, y
 * firmarla con HMAC-SHA256. El secreto no viaja nunca; viaja la firma.
 */
function firmaApliiq(appId, secreto, cuerpo = "") {
  const hora = Math.floor(Date.now() / 1000);
  const nonce = randomUUID().replace(/-/g, "");
  const contenido = cuerpo ? Buffer.from(cuerpo, "utf8").toString("base64") : "";
  const firma = createHmac("sha256", secreto)
    .update(`${appId}${hora}${nonce}${contenido}`)
    .digest("base64");
  return `x-apliiq-auth ${hora}:${firma}:${appId}:${nonce}`;
}

async function informeApliiq(appId, secreto) {
  console.log("\nAPLIIQ · catálogo y precio base\n");
  const res = await fetch("https://api.apliiq.com/v1/Product", {
    headers: { authorization: firmaApliiq(appId, secreto), "content-type": "application/json" },
  });
  if (!res.ok) {
    console.log(`  No ha contestado (${res.status}). ${(await res.text()).slice(0, 200)}`);
    return;
  }
  const productos = await res.json();
  const interesan = /t-shirt|tee|hoodie|sweatshirt|cap|hat|tote/i;
  const filtrados = (Array.isArray(productos) ? productos : []).filter((p) =>
    interesan.test(`${p.Name || ""} ${p.ProductCode || ""}`)
  );
  console.log(`  ${filtrados.length} prendas comparables de ${productos.length ?? 0}\n`);
  for (const p of filtrados.slice(0, 25)) {
    console.log(`    ${String(p.Name || p.ProductCode).slice(0, 46).padEnd(48)}${p.Price} ${p.Currency_Code || "USD"}`);
  }
  console.log(`
  Ojo al comparar: ese precio es la prenda en blanco, sin estampado, sin
  envío y sin IVA. Apliiq fabrica en Estados Unidos, así que a un pedido para
  España hay que sumarle el envío internacional y los aranceles de aduana,
  que los paga quien lo recibe.`);
}

// ─────────────────────────────────────────────────────────── Gelato

/**
 * Gelato reparte su API en varios subdominios —catálogo, precios, pedidos— y
 * todos se abren con la misma llave en una cabecera. Sin firmas ni artificios.
 */
async function gelato(clave, url, cuerpo) {
  const res = await fetch(url, {
    method: cuerpo ? "POST" : "GET",
    headers: { "X-API-KEY": clave, "content-type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await res.text();
  let json = null;
  try {
    json = JSON.parse(texto);
  } catch {
    /* a veces contesta texto plano cuando algo va mal */
  }
  return { ok: res.ok, estado: res.status, json, texto };
}

/**
 * Lo que vendemos y su equivalente en Gelato, por identificador exacto.
 *
 * Antes esto buscaba por expresión regular y la camiseta acabó comparándose
 * con una sudadera: «swea**tshirt**s» contiene «tshirt». Con los
 * identificadores no hay ambigüedad posible.
 *
 * El filtro del bordado es lo que hace que la comparación valga algo. Sin él
 * salía el precio de la prenda en blanco, que es más barata en todas partes y
 * no dice nada: lo que vendemos lleva el logo bordado en el pecho, y eso en
 * Gelato es `chstl-emb`.
 */
const EQUIVALENTES = [
  {
    nuestro: "Camisetita",
    catalogo: "t-shirts",
    filtros: { GarmentPrint: ["chstl-emb_shslr-emb"], GarmentColor: ["white"], GarmentCut: ["unisex"], GarmentSize: ["M"] },
  },
  {
    nuestro: "Sudadera",
    catalogo: "hoodies",
    filtros: { GarmentColor: ["white"], GarmentCut: ["unisex"], GarmentSize: ["M"] },
  },
  { nuestro: "Gorraca", catalogo: "dad-hat", filtros: {} },
  { nuestro: "Bolsaca", catalogo: "tote-bags", filtros: {} },
];

async function informeGelato(clave) {
  console.log("\nGELATO · lo mismo que vendemos, puesto en España\n");

  for (const { nuestro, catalogo, filtros } of EQUIVALENTES) {
    const encontrados = await gelato(
      clave,
      `https://product.gelatoapis.com/v3/catalogs/${catalogo}/products:search`,
      { attributeFilters: filtros, limit: 20 }
    );
    if (!encontrados.ok) {
      console.log(`  ${nuestro.padEnd(12)} sin resultados (${encontrados.estado})`);
      continue;
    }
    const productos = encontrados.json?.products ?? encontrados.json?.data ?? [];
    if (!productos.length) {
      console.log(`  ${nuestro.padEnd(12)} el catálogo «${catalogo}» no devuelve nada con esos filtros`);
      continue;
    }

    // De todas las variantes que encajan interesa la más barata: es la que
    // marca el suelo con el que se puede competir.
    let barato = null;
    for (const prod of productos.slice(0, 8)) {
      const uid = prod.productUid || prod.uid;
      if (!uid) continue;
      const precios = await gelato(
        clave,
        `https://product.gelatoapis.com/v3/products/${encodeURIComponent(uid)}/prices?country=ES&currency=EUR`
      );
      const uno = (precios.json?.data ?? precios.json ?? []).find?.((x) => x.quantity === 1);
      if (!uno) continue;
      const valor = Number(uno.price);
      if (!barato || valor < barato.valor) barato = { valor, uid };
    }

    if (!barato) {
      console.log(`  ${nuestro.padEnd(12)} sin precio para España`);
      continue;
    }
    console.log(
      `  ${nuestro.padEnd(12)}${eur(barato.valor).padStart(9)}   ${String(barato.uid).slice(0, 58)}`
    );
  }

  console.log(`
  Eso es la prenda fabricada, sin envío ni IVA. El de Printful de arriba sí
  los lleva, así que para restar hay que comparar contra su columna de
  producto: la camiseta bordada le sale a 17,50 € allí.`);
}

// ─────────────────────────────────────────────────────────── main

async function main() {
  const clave = await delEntorno("PRINTFUL_API_KEY");
  if (!clave) {
    console.error("Falta PRINTFUL_API_KEY en .env.local");
    process.exit(1);
  }

  const resumen = await informePrintful(clave);

  const gelatoKey = await delEntorno("GELATO_API_KEY");
  if (gelatoKey) await informeGelato(gelatoKey);
  else console.log("\nGELATO · sin credenciales; añade GELATO_API_KEY para compararlo.");

  const appId = await delEntorno("APLIIQ_APP_ID");
  const secreto = await delEntorno("APLIIQ_SECRET");
  if (appId && secreto) await informeApliiq(appId, secreto);
  else console.log("APLIIQ · sin credenciales; añade APLIIQ_APP_ID y APLIIQ_SECRET para compararlo.");

  const flojos = resumen.filter((r) =>
    r.margen < (PORCENTUAL ? (r.cobrado * OBJETIVO) / 100 - 0.5 : OBJETIVO - 2)
  );
  console.log("\n────────────────────────────────────────────");
  if (!flojos.length) {
    console.log(
      PORCENTUAL ? `Todo por encima del ${OBJETIVO} %. Nada que tocar.` : `Todo por encima de ${eur(OBJETIVO - 2)} de margen. Nada que tocar.`
    );
  } else {
    console.log(
      PORCENTUAL
        ? `PARA GANAR UN ${OBJETIVO} % DE LO COBRADO\n`
        : `PARA GANAR ${eur(OBJETIVO)} POR PRENDA\n`
    );
    console.log(`  Printful → tu producto → Edit → Retail price\n`);
    for (const r of flojos) {
      const cobradoNuevo = r.sugerido + (r.sugerido >= ENVIO_GRATIS_DESDE ? 0 : ENVIO_COBRADO);
      const ganaria = margenDe(cobradoNuevo, r.coste);
      console.log(
        `  ${r.producto.slice(0, 34).padEnd(36)}${r.tallas.padEnd(10)}` +
          `${eur(r.venta).padStart(9)}  →  ${eur(r.sugerido).padStart(9)}` +
          `   ganas ${eur(ganaria).padStart(8)}  (${((100 * ganaria) / cobradoNuevo).toFixed(0)} %)`
      );
    }
    console.log(`
  Y después, aquí:   npm run sync:printful
  La web copia los precios de Printful; en el código no se tocan.`);
  }

  // Fuera del if: cuando *nada* va corto es justo cuando puede haber precios
  // por encima del objetivo esperando a que se los baje.
  await ponerPrecios(clave, resumen);

  console.log(`
Los márgenes de arriba son los de un pedido normal, sin la digitalización del
bordado, que solo se paga la primera vez por diseño. La comisión de la pasarela
está estimada con la tarifa europea de Stripe (${COMISION.porcentaje * 100} % + ${eur(COMISION.fijo)}).`);
}

/**
 * Escribe en Printful el precio calculado, cuando se ha pedido con `va`.
 *
 * Toca **todos** los tramos que no estén ya en su sitio, no solo los que van
 * cortos. Si el objetivo baja del 15 % al 10 %, la mitad de la tienda está por
 * encima y dejarla ahí sería no haber cambiado el objetivo. Las dos direcciones
 * se enseñan por separado, porque bajar un precio de escaparate es una decisión
 * distinta de arreglar una pérdida y conviene verla como tal.
 *
 * La pausa entre llamadas no es prudencia: sin ella Printful corta a la décima
 * y deja media tienda a un precio y media a otro, que es peor que no empezar.
 */
async function ponerPrecios(clave, resumen) {
  const cambios = resumen.filter((r) => r.ids?.length && r.sugerido !== r.venta);
  if (!cambios.length) return;

  const suben = cambios.filter((r) => r.sugerido > r.venta);
  const bajan = cambios.filter((r) => r.sugerido < r.venta);
  const cuantas = cambios.reduce((n, r) => n + r.ids.length, 0);

  const linea = (r) =>
    `  ${r.producto.slice(0, 34).padEnd(36)}${r.tallas.padEnd(10)}` +
    `${eur(r.venta).padStart(9)}  →  ${eur(r.sugerido).padStart(9)}`;

  if (!APLICAR) {
    if (suben.length) {
      console.log(`\n  SUBIRÍAN (van cortos del ${OBJETIVO} %)\n`);
      suben.forEach((r) => console.log(linea(r)));
    }
    if (bajan.length) {
      console.log(`\n  BAJARÍAN (hoy dan más del ${OBJETIVO} %)\n`);
      bajan.forEach((r) => console.log(linea(r)));
    }
    console.log(`\n  ${cuantas} variante(s) en total.`);
    console.log(`  Para escribirlo en Printful:   npm run costes -- ${PEDIDO} va`);
    return;
  }

  console.log(`\n────────────────────────────────────────────`);
  console.log(`ESCRIBIENDO ${cuantas} PRECIO(S) EN PRINTFUL\n`);

  let hechas = 0;
  for (const r of cambios) {
    console.log(
      `  ${r.producto.slice(0, 34).padEnd(36)}${r.tallas.padEnd(10)}` +
        `${eur(r.venta).padStart(9)}  →  ${eur(r.sugerido).padStart(9)}`
    );
    for (const id of r.ids) {
      for (let intento = 0; ; intento++) {
        try {
          const res = await fetch(`https://api.printful.com/store/variants/${id}`, {
            method: "PUT",
            headers: { authorization: `Bearer ${clave}`, "content-type": "application/json" },
            body: JSON.stringify({ retail_price: r.sugerido.toFixed(2) }),
          });
          if (res.status === 429 && intento < 5) {
            await new Promise((s) => setTimeout(s, 2000 * 2 ** intento));
            continue;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          hechas++;
          break;
        } catch (e) {
          if (intento >= 5) throw e;
          await new Promise((s) => setTimeout(s, 2000 * 2 ** intento));
        }
      }
      await new Promise((s) => setTimeout(s, 900));
    }
  }

  console.log(`\n  ${hechas} variante(s) escritas. Ahora:   npm run sync:printful`);
}

main().catch((err) => {
  console.error(`\nNo se ha podido calcular: ${err.message}`);
  process.exit(1);
});
