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
 *   PRINTFUL_CONFIRMAR      «1» para mandarlo a producción sin tocar nada.
 *                           Sin esto el pedido entra como borrador y lo
 *                           confirmas tú en Printful, que para empezar es lo
 *                           sensato: se ve qué va a salir antes de pagarlo.
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
  if (!claveStripe || !process.env.PRINTFUL_API_KEY) {
    console.error("[pedido] faltan STRIPE_SECRET_KEY o PRINTFUL_API_KEY");
    return res.status(503).json({ error: "sin configurar" });
  }

  /*
    Rescate de pagos que se quedaron sin fabricar.

    Pasó de verdad: el secreto de firma en Vercel era el de otra cuenta, así
    que Stripe entregaba el aviso, aquí se rechazaba por firma inválida, y el
    comprador se quedaba pagado y sin camiseta. Stripe reintenta durante días,
    pero no hay por qué esperar sentado ni pelearse con su panel.

    No lleva contraseña, y no hace falta: lo único que puede hacer es crear el
    pedido que el webhook tendría que haber creado. Le pregunta a Stripe cuáles
    de las últimas sesiones están **pagadas de verdad** —del que llama no se
    fía de nada— y para cada una llama a la misma función, que ya es
    idempotente. Quien lo invoque sin permiso solo consigue que se fabrique lo
    que alguien ya pagó.

        curl -X POST https://www.culowypililarge.com/api/pedido?rescatar=1
  */
  const rescatar = new URL(req.url || "", "http://x").searchParams.get("rescatar");
  if (rescatar) {
    const lista = (await stripe("/checkout/sessions?limit=20", claveStripe)) as Record<string, any>;
    const pagadas = ((lista?.data || []) as Record<string, any>[]).filter(
      (x) => x.payment_status === "paid"
    );
    const hechos = [];
    for (const sesion of pagadas) {
      const r = await crearPedido(String(sesion.id), claveStripe);
      hechos.push({ sesion: String(sesion.id).slice(0, 20) + "…", ...r.cuerpo });
    }
    console.log(`[pedido] rescate: ${pagadas.length} sesión(es) pagada(s) revisada(s)`);
    return res.status(200).json({ revisadas: pagadas.length, hechos });
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

  const hecho = await crearPedido(idSesion, claveStripe);
  return res.status(hecho.estado).json(hecho.cuerpo);
}

/**
 * Crea en Printful el pedido de una sesión de Stripe ya pagada.
 *
 * Estaba dentro del manejador del webhook, y se sacó cuando hizo falta poder
 * repetirlo a mano: un pago se quedó sin fabricar porque el secreto de firma
 * era el de otra cuenta, y sin esto la única forma de recuperarlo era buscar
 * el botón de reenviar en el panel de Stripe.
 *
 * Es idempotente: antes de crear nada pregunta a Printful si ya existe un
 * pedido con ese `external_id`. Da igual cuántas veces se llame.
 */
async function crearPedido(idSesion: string, claveStripe: string) {
  const respuesta = (estado: number, cuerpo: Record<string, unknown>) => ({ estado, cuerpo });
  try {
    // A partir de aquí no se usa nada del aviso: manda lo que diga Stripe.
    const sesion = (await stripe(
      `/checkout/sessions/${encodeURIComponent(idSesion)}` +
        "?expand[]=line_items&expand[]=line_items.data.price.product",
      claveStripe
    )) as Record<string, any>;

    if (sesion.payment_status !== "paid") {
      console.log(`[pedido] ${idSesion} todavía sin pagar (${sesion.payment_status})`);
      return respuesta(200, { ok: true, ignorado: "sin pagar" });
    }

    /*
      La línea del envío se cae sola: no lleva variante porque el porte lo
      cobra la web, y lo que se fabrica son prendas. El id de Printful viaja en
      los metadatos desde que se abrió el cobro.
    */
    const articulos = ((sesion.line_items?.data || []) as Record<string, any>[])
      .map((l) => ({
        sync_variant_id: Number(l.price?.product?.metadata?.variante || 0),
        quantity: Number(l.quantity) || 1,
      }))
      .filter((a) => a.sync_variant_id > 0);

    if (!articulos.length) {
      console.error(`[pedido] ${idSesion} sin artículos con variante`);
      return respuesta(200, { ok: true, ignorado: "sin artículos" });
    }

    const quien = destinatario(sesion);
    if (!quien?.address1 || !quien.country_code) {
      console.error(`[pedido] ${idSesion} sin dirección de envío`);
      return respuesta(200, { ok: true, ignorado: "sin dirección" });
    }

    // ¿Ya estaba? Stripe reintenta el aviso hasta que le contestas 200, y sin
    // esta comprobación una red lenta se convierte en dos camisetas.
    const previo = await printful(`/orders/@${encodeURIComponent(idSesion)}`);
    if (previo.ok) {
      console.log(`[pedido] ${idSesion} ya existía en Printful`);
      return respuesta(200, { ok: true, repetido: true });
    }

    const confirmar = process.env.PRINTFUL_CONFIRMAR === "1";
    const creado = await printful(`/orders?confirm=${confirmar ? "1" : "0"}`, {
      method: "POST",
      body: JSON.stringify({ external_id: idSesion, recipient: quien, items: articulos }),
    });

    if (!creado.ok) {
      // 500 a propósito: así Stripe lo reintenta, que es justo lo que se quiere
      // si Printful estaba caído. El pago ya está hecho; solo falta fabricar.
      console.error(`[pedido] printful ${creado.estado}`, JSON.stringify(creado.cuerpo).slice(0, 400));
      return respuesta(500, { error: "la imprenta no ha aceptado el pedido" });
    }

    console.log(
      `[pedido] ${idSesion} -> printful #${creado.cuerpo?.result?.id}` +
        ` · ${articulos.length} artículo(s) · ${confirmar ? "confirmado" : "borrador"}`
    );
    return respuesta(200, { ok: true, pedido: creado.cuerpo?.result?.id });
  } catch (err) {
    console.error("[pedido]", err);
    return respuesta(500, { error: "no se ha podido crear el pedido" });
  }
}

