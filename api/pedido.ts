/**
 * Manda a la imprenta lo que se acaba de pagar.
 *
 * Stripe llama aquí en cuanto alguien termina de pagar. Esta función mira qué
 * se ha comprado y a dónde va, y crea el pedido en Printful. Es la pieza que
 * convierte «ha entrado dinero» en «hay una camiseta en producción»: sin ella
 * el cobro funciona igual, pero los pedidos hay que copiarlos a mano.
 *
 * No se fía de lo que le llega. Un webhook es una URL pública y cualquiera
 * puede escribirle, así que hay dos cierres —y el segundo es el que de verdad
 * aguanta:
 *
 *   1. **La firma.** Stripe firma cada aviso con un secreto compartido. Si
 *      está configurado y el cuerpo llega en crudo, se comprueba y lo que no
 *      cuadre se tira.
 *   2. **La consulta.** Aunque la firma pase, del aviso solo se usa el
 *      identificador de la sesión: el qué y el cuánto se le vuelven a
 *      preguntar a Stripe. Un aviso falso no puede inventarse un pago que
 *      Stripe no confirme, y por eso este cierre basta él solo.
 *
 * Y no duplica: cada pedido lleva como `external_id` el de la sesión de
 * Stripe. Si el aviso llega dos veces —Stripe reintenta mientras no reciba un
 * 200— el segundo se encuentra el pedido ya creado y no hace nada.
 *
 * Variables de entorno, todas en el proyecto de Vercel:
 *   STRIPE_SECRET_KEY       obligatoria, la misma que usa el cobro
 *   STRIPE_WEBHOOK_SECRET   el secreto de firma (whsec_…), muy recomendable
 *   PRINTFUL_API_KEY        el token de Printful, con permiso sobre pedidos
 *   PRINTFUL_STORE_ID       solo si tu cuenta tiene más de una tienda
 *   PRINTFUL_CONFIRMAR      «1» para mandarlo a producción sin tocar nada
 *   GELATO_API_KEY          la clave de Gelato
 *   GELATO_CONFIRMAR        «1» para lo mismo en Gelato
 *
 * Sin las dos variables de confirmar, los pedidos entran como borrador y los
 * apruebas tú en el panel de cada imprenta. Para empezar es lo sensato: se ve
 * qué va a salir antes de pagarlo.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Vercel parsea el cuerpo por su cuenta, y aquí eso estorba: la firma de
 * Stripe se calcula sobre los bytes exactos que mandó, y un JSON que se
 * parsea y se vuelve a escribir ya no es el mismo texto.
 *
 * Si aun así llega parseado —esto depende del runtime y no siempre se
 * respeta—, no se rompe nada: se pierde la comprobación de firma y queda el
 * segundo cierre, que es el que importa.
 */
export const config = { api: { bodyParser: false } };

/** Más viejo que esto es un aviso repescado, no uno recién llegado. */
const VENTANA = 300;

type Peticion = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  [Symbol.asyncIterator]?: () => AsyncIterator<Buffer | string>;
};

type Respuesta = {
  status: (code: number) => Respuesta;
  json: (body: unknown) => void;
};

async function cuerpoCrudo(req: Peticion): Promise<string> {
  if (typeof req[Symbol.asyncIterator] !== "function") return "";
  const trozos: Buffer[] = [];
  for await (const t of req as AsyncIterable<Buffer | string>) {
    trozos.push(typeof t === "string" ? Buffer.from(t) : t);
  }
  return Buffer.concat(trozos).toString("utf8");
}

/** Compara sin dar pistas por el tiempo que tarda. */
function iguales(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * La cabecera viene como `t=1234,v1=abc,v1=def`: una marca de tiempo y una o
 * varias firmas —varias mientras se rota el secreto—. Basta con que cuadre una.
 */
function firmaValida(crudo: string, cabecera: string, secreto: string) {
  const campos = cabecera.split(",").map((p) => p.split("="));
  const t = campos.find((c) => c[0]?.trim() === "t")?.[1]?.trim();
  const firmas = campos.filter((c) => c[0]?.trim() === "v1").map((c) => c[1]?.trim() || "");
  if (!t || !firmas.length) return false;

  const edad = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(edad) || edad > VENTANA) return false;

  const esperada = createHmac("sha256", secreto).update(`${t}.${crudo}`).digest("hex");
  return firmas.some((f) => f && iguales(esperada, f));
}

const cabecera = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] || "" : v || "");

async function stripe(ruta: string, clave: string) {
  const res = await fetch(`https://api.stripe.com/v1${ruta}`, {
    headers: { authorization: `Bearer ${clave}` },
  });
  if (!res.ok) {
    throw new Error(`stripe ${res.status} en ${ruta}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

async function printful(ruta: string, opciones: RequestInit = {}) {
  const cabeceras: Record<string, string> = {
    authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    "content-type": "application/json",
  };
  if (process.env.PRINTFUL_STORE_ID) cabeceras["x-pf-store-id"] = process.env.PRINTFUL_STORE_ID;
  const res = await fetch(`https://api.printful.com${ruta}`, { ...opciones, headers: cabeceras });
  return { ok: res.ok, estado: res.status, cuerpo: await res.json().catch(() => null) };
}

async function gelato(url: string, cuerpo?: unknown) {
  const res = await fetch(url, {
    method: cuerpo ? "POST" : "GET",
    headers: {
      "X-API-KEY": process.env.GELATO_API_KEY || "",
      "content-type": "application/json",
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  return { ok: res.ok, estado: res.status, cuerpo: await res.json().catch(() => null) };
}

/**
 * ¿Ya se mandó este pedido a Gelato?
 *
 * Gelato no tiene el `external_id` de Printful, que rechaza el duplicado solo;
 * hay que preguntar por la referencia antes de crear nada. Si la consulta
 * falla se contesta que no existe: crear un pedido de más se ve y se cancela,
 * pero no crearlo deja a alguien pagado y sin camiseta.
 */
async function gelatoRepetido(referencia: string): Promise<boolean> {
  const r = await gelato("https://order.gelatoapis.com/v4/orders:search", {
    orderReferenceIds: [referencia],
    limit: 1,
  });
  if (!r.ok) return false;
  return Boolean((r.cuerpo as { orders?: unknown[] })?.orders?.length);
}

/** Lo que Stripe recogió en su formulario, traducido a lo que pide Printful. */
function destinatario(sesion: Record<string, unknown>) {
  const cliente = (sesion.customer_details || {}) as Record<string, unknown>;
  const envio = (sesion.shipping_details ||
    (sesion.collected_information as Record<string, unknown>)?.shipping_details ||
    {}) as Record<string, unknown>;
  const dir = (envio.address || cliente.address) as Record<string, string> | undefined;
  if (!dir) return null;
  return {
    name: String(envio.name || cliente.name || ""),
    address1: dir.line1 || "",
    address2: dir.line2 || "",
    city: dir.city || "",
    state_code: dir.state || "",
    country_code: dir.country || "",
    zip: dir.postal_code || "",
    email: String(cliente.email || ""),
    phone: String(cliente.phone || ""),
  };
}

export default async function handler(req: Peticion, res: Respuesta) {
  if (req.method !== "POST") return res.status(405).json({ error: "método no permitido" });

  const claveStripe = process.env.STRIPE_SECRET_KEY;
  // Basta con una imprenta configurada: la tienda puede vender solo de una.
  if (!claveStripe || !(process.env.PRINTFUL_API_KEY || process.env.GELATO_API_KEY)) {
    console.error("[pedido] falta STRIPE_SECRET_KEY o la clave de alguna imprenta");
    return res.status(503).json({ error: "sin configurar" });
  }

  const crudo = await cuerpoCrudo(req);

  const secretoFirma = process.env.STRIPE_WEBHOOK_SECRET;
  if (secretoFirma && crudo) {
    if (!firmaValida(crudo, cabecera(req.headers["stripe-signature"]), secretoFirma)) {
      console.error("[pedido] firma que no cuadra");
      return res.status(400).json({ error: "firma inválida" });
    }
  } else if (secretoFirma) {
    // El runtime se comió el cuerpo antes de llegar aquí. Se sigue, porque lo
    // que autoriza de verdad es preguntarle a Stripe, pero conviene saberlo.
    console.warn("[pedido] sin cuerpo en crudo: no se ha podido comprobar la firma");
  }

  let aviso: Record<string, unknown>;
  try {
    aviso = crudo ? JSON.parse(crudo) : ((req.body as Record<string, unknown>) ?? {});
  } catch {
    return res.status(400).json({ error: "json ilegible" });
  }

  // De todo lo que Stripe cuenta, aquí solo interesa un pago terminado.
  if (aviso.type !== "checkout.session.completed") return res.status(200).json({ ok: true });

  const objeto = (aviso.data as Record<string, unknown>)?.object as Record<string, unknown>;
  const idSesion = String(objeto?.id || "");
  if (!idSesion.startsWith("cs_")) return res.status(400).json({ error: "sesión rara" });

  try {
    // A partir de aquí no se usa nada del aviso: manda lo que diga Stripe.
    const sesion = (await stripe(
      `/checkout/sessions/${encodeURIComponent(idSesion)}` +
        "?expand[]=line_items&expand[]=line_items.data.price.product",
      claveStripe
    )) as Record<string, any>;

    if (sesion.payment_status !== "paid") {
      console.log(`[pedido] ${idSesion} todavía sin pagar (${sesion.payment_status})`);
      return res.status(200).json({ ok: true, ignorado: "sin pagar" });
    }

    /*
      Cada línea sabe quién la fabrica, porque se apuntó al abrir el cobro.

      Una misma cesta puede llevar una camiseta de Printful y una sudadera de
      Gelato: son dos pedidos a dos imprentas distintas, no uno. Se reparten
      aquí y cada una se manda por su lado.

      La línea del envío se cae sola: no lleva variante porque el porte lo cobra
      la web, y lo que se fabrica son prendas.
    */
    const lineas = (sesion.line_items?.data || []) as Record<string, any>[];
    const reparto = { printful: [] as Record<string, any>[], gelato: [] as Record<string, any>[] };
    for (const l of lineas) {
      const meta = l.price?.product?.metadata || {};
      if (!meta.variante) continue;
      const donde = meta.imprenta === "gelato" ? "gelato" : "printful";
      reparto[donde].push({ meta, cantidad: Number(l.quantity) || 1 });
    }

    if (!reparto.printful.length && !reparto.gelato.length) {
      console.error(`[pedido] ${idSesion} sin artículos con variante`);
      return res.status(200).json({ ok: true, ignorado: "sin artículos" });
    }

    const quien = destinatario(sesion);
    if (!quien?.address1 || !quien.country_code) {
      console.error(`[pedido] ${idSesion} sin dirección de envío`);
      return res.status(200).json({ ok: true, ignorado: "sin dirección" });
    }

    const hechos: string[] = [];

    // ── Printful ────────────────────────────────────────────────────────────
    if (reparto.printful.length) {
      // ¿Ya estaba? Stripe reintenta el aviso hasta que le contestas 200, y sin
      // esta comprobación una red lenta se convierte en dos camisetas.
      const previo = await printful(`/orders/@${encodeURIComponent(idSesion)}`);
      if (previo.ok) {
        hechos.push("printful: ya existía");
      } else {
        const confirmar = process.env.PRINTFUL_CONFIRMAR === "1";
        const creado = await printful(`/orders?confirm=${confirmar ? "1" : "0"}`, {
          method: "POST",
          body: JSON.stringify({
            external_id: idSesion,
            recipient: quien,
            items: reparto.printful.map((x) => ({
              sync_variant_id: Number(x.meta.variante),
              quantity: x.cantidad,
            })),
          }),
        });
        if (!creado.ok) {
          // 500 a propósito: así Stripe lo reintenta, que es justo lo que se
          // quiere si la imprenta estaba caída. El pago ya está hecho; solo
          // falta fabricar.
          console.error(`[pedido] printful ${creado.estado}`, JSON.stringify(creado.cuerpo).slice(0, 400));
          return res.status(500).json({ error: "la imprenta no ha aceptado el pedido" });
        }
        hechos.push(`printful #${creado.cuerpo?.result?.id} (${confirmar ? "confirmado" : "borrador"})`);
      }
    }

    // ── Gelato ──────────────────────────────────────────────────────────────
    if (reparto.gelato.length) {
      const repetido = await gelatoRepetido(idSesion);
      if (repetido) {
        hechos.push("gelato: ya existía");
      } else {
        const confirmar = process.env.GELATO_CONFIRMAR === "1";
        const creado = await gelato("https://order.gelatoapis.com/v4/orders", {
          // Es la misma llave con la que se pregunta si ya existe: así el
          // reintento de Stripe encuentra el pedido en vez de duplicarlo.
          orderReferenceId: idSesion,
          customerReferenceId: quien.email || "culowypililarge",
          orderType: confirmar ? "order" : "draft",
          currency: "EUR",
          recipient: {
            country: quien.country_code,
            firstName: (quien.name || "Cliente").split(" ")[0] || "Cliente",
            lastName: (quien.name || "").split(" ").slice(1).join(" ") || "-",
            addressLine1: quien.address1,
            addressLine2: quien.address2 || undefined,
            city: quien.city,
            postCode: quien.zip,
            state: quien.state_code || undefined,
            email: quien.email,
          },
          products: reparto.gelato.map((x, i) => ({
            itemReferenceId: `it-${i + 1}`,
            // Gelato quiere el del catálogo, que describe la prenda entera; el
            // de la tienda va también, que es lo que le ata el diseño puesto.
            productUid: x.meta.uid,
            storeProductVariantId: x.meta.variante,
            quantity: x.cantidad,
          })),
        });
        if (!creado.ok) {
          console.error(`[pedido] gelato ${creado.estado}`, JSON.stringify(creado.cuerpo).slice(0, 400));
          return res.status(500).json({ error: "la imprenta no ha aceptado el pedido" });
        }
        hechos.push(`gelato ${creado.cuerpo?.id ?? ""} (${confirmar ? "confirmado" : "borrador"})`);
      }
    }

    console.log(`[pedido] ${idSesion} -> ${hechos.join(" · ")}`);
    return res.status(200).json({ ok: true, hechos });
  } catch (err) {
    console.error("[pedido]", err);
    return res.status(500).json({ error: "no se ha podido crear el pedido" });
  }
}
