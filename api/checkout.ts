/**
 * Abre el pago de la tienda.
 *
 * Recibe lo que hay en la cesta, monta una sesión de Stripe Checkout y
 * devuelve la URL a la que mandar al visitante. El cobro, la tarjeta y el
 * cumplimiento del RGPD de los datos de pago son de Stripe: aquí no entra
 * ningún número de tarjeta ni se guarda nada de nadie.
 *
 * Regla de oro: **el precio no viene del navegador**. Del cliente solo se
 * acepta qué producto y cuántas unidades; el importe se busca en el catálogo
 * del propio servidor. Si el precio viajara en la petición, cualquiera podría
 * comprarse una sudadera por un céntimo cambiando un número en el inspector.
 *
 * Sin `STRIPE_SECRET_KEY` responde 503 y la web dice que la tienda todavía no
 * está abierta, en vez de fingir un pago que no existe.
 *
 * Variables de entorno:
 *   STRIPE_SECRET_KEY   clave secreta de Stripe (sk_live_… o sk_test_…)
 *   CYP_URL             dominio público, para las vueltas de Stripe
 */

/**
 * La tabla de precios, por id de variante de la imprenta que la fabrique.
 *
 * Está escrita aquí dentro, y no importada, después de que dos intentos
 * fallaran en producción con FUNCTION_INVOCATION_FAILED: ni un `import` de
 * JSON ni uno de un módulo hermano llegaban a la función ya empaquetada.
 * Vercel mete cada función en su propio paquete y de al lado no llegaba nada,
 * así que lo único que no puede perderse por el camino es el propio fichero.
 *
 * La rellenan `npm run sync:printful` y `npm run sync:gelato` entre las dos
 * marcas, los dos con la misma función compartida para que el segundo en correr
 * no borre las variantes del primero. No se toca a mano: se vuelve a
 * sincronizar.
 *
 * Se busca por id de variante, que es lo único que manda el navegador. El
 * importe sale siempre de aquí, nunca de la petición: si viniera en ella,
 * cualquiera compraría una sudadera por un céntimo.
 */
// === PRECIOS · generado, no editar ===
type Articulo = {
  nombre: string;
  precio: number;
  imprenta: "printful" | "gelato";
  uid?: string;
};
const PRECIOS: Record<string, Articulo> = {
  "5449680122": {
    "nombre": "Bolsaca para el dinerete, gafitas chulas.... · 15″×15″",
    "precio": 1850,
    "imprenta": "printful"
  },
  "5449668444": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XS",
    "precio": 4850,
    "imprenta": "printful"
  },
  "5449668445": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · S",
    "precio": 4850,
    "imprenta": "printful"
  },
  "5449668446": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · M",
    "precio": 4850,
    "imprenta": "printful"
  },
  "5449668447": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · L",
    "precio": 4850,
    "imprenta": "printful"
  },
  "5449668448": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XL",
    "precio": 4850,
    "imprenta": "printful"
  },
  "5449668449": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 2XL",
    "precio": 5000,
    "imprenta": "printful"
  },
  "5449668450": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 3XL",
    "precio": 5200,
    "imprenta": "printful"
  },
  "5449667542": {
    "nombre": "Gorraca para aparcar coches como un pro · S/M",
    "precio": 2100,
    "imprenta": "printful"
  },
  "5449667543": {
    "nombre": "Gorraca para aparcar coches como un pro · L/XL",
    "precio": 2100,
    "imprenta": "printful"
  },
  "5449158693": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XS",
    "precio": 2900,
    "imprenta": "printful"
  },
  "5449158694": {
    "nombre": "Camisetita para ver a tus Bros en el padel · S",
    "precio": 2900,
    "imprenta": "printful"
  },
  "5449158695": {
    "nombre": "Camisetita para ver a tus Bros en el padel · M",
    "precio": 2900,
    "imprenta": "printful"
  },
  "5449158696": {
    "nombre": "Camisetita para ver a tus Bros en el padel · L",
    "precio": 2900,
    "imprenta": "printful"
  },
  "5449158697": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XL",
    "precio": 2900,
    "imprenta": "printful"
  },
  "5449158698": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 2XL",
    "precio": 3050,
    "imprenta": "printful"
  },
  "5449158699": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 3XL",
    "precio": 3200,
    "imprenta": "printful"
  },
  "5449158700": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 4XL",
    "precio": 3400,
    "imprenta": "printful"
  },
  "5449158701": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 5XL",
    "precio": 3650,
    "imprenta": "printful"
  },
  "4a2ea768-82ec-4402-bf73-c3fef93c6f68": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · XL",
    "precio": 4400,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_xl_gco_white_gpr_4-4_gildan_18500"
  },
  "21b7c10f-cb24-4f8d-98f8-8b89d3096e9d": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · 4XL",
    "precio": 5600,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_4xl_gco_white_gpr_4-4_gildan_18500"
  },
  "4605bb99-e013-4a02-b057-20c229e6b63f": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · L",
    "precio": 4400,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_l_gco_white_gpr_4-4_gildan_18500"
  },
  "eeec2a8a-b3e5-45cd-a9e4-2b97dc58ee70": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · S",
    "precio": 4400,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_s_gco_white_gpr_4-4_gildan_18500"
  },
  "c63c07b5-13aa-4312-b2b4-c34cf212e4d9": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · M",
    "precio": 4400,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_m_gco_white_gpr_4-4_gildan_18500"
  },
  "ff320fac-14a4-4500-af5e-22ac3f97e818": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · 5XL",
    "precio": 5850,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_5xl_gco_white_gpr_4-4_gildan_18500"
  },
  "89eaeebc-a6b6-4791-841d-1e675519c5a5": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · 3XL",
    "precio": 4850,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_3xl_gco_white_gpr_4-4_gildan_18500"
  },
  "04ef42bd-6ab2-478c-932a-741dacd501bf": {
    "nombre": "La Sudadera perfecta para que, aunque te confundan con un gorrilla, tu estés calentico · 2XL",
    "precio": 4650,
    "imprenta": "gelato",
    "uid": "apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_2xl_gco_white_gpr_4-4_gildan_18500"
  },
  "0407f747-1a56-4621-a9b2-1309ee1eb15e": {
    "nombre": "Tote Bag \"Kit de Desahucio\" – Bolsa de Algodón Resistente para Gente que lo tiene complicado con su pareja",
    "precio": 2600,
    "imprenta": "gelato",
    "uid": "bag_product_bsc_tote-bag_bqa_clc_bsi_std-t_bco_white_bpr_4-4"
  }
};
// === FIN PRECIOS ===

const ENVIO = { precio: 490, gratisDesde: 6000 };
const MAX_UNIDADES = 20;

type LineaCliente = {
  producto?: unknown;
  cantidad?: unknown;
  color?: unknown;
  talla?: unknown;
  diseno?: unknown;
  variante?: unknown;
};

type Peticion = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type Respuesta = {
  status: (code: number) => Respuesta;
  json: (body: unknown) => void;
  end: () => void;
};

const texto = (v: unknown, max = 40) =>
  typeof v === "string" ? v.slice(0, max).replace(/[^\w\s\-áéíóúñÁÉÍÓÚÑ]/gi, "") : "";

export default async function handler(req: Peticion, res: Respuesta) {
  if (req.method !== "POST") return res.status(405).json({ error: "método no permitido" });

  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) return res.status(503).json({ error: "la tienda todavía no está abierta" });

  try {
    const body: { lineas?: LineaCliente[] } =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body as never) || {};
    const entrada = Array.isArray(body.lineas) ? body.lineas.slice(0, 20) : [];
    if (!entrada.length) return res.status(400).json({ error: "la cesta está vacía" });

    // Se reconstruye la cesta con los precios del servidor. Del navegador solo
    // se acepta qué variante y cuántas unidades.
    const lineas = entrada
      .map((l) => {
        /*
          El identificador llega como texto y se limpia, no se convierte a
          número: Printful numera sus variantes pero Gelato usa UUID, y un
          `Number()` por el camino dejaba los de Gelato en `NaN`. Lo que de
          verdad protege no es el formato sino la línea de después: si no está
          en la tabla, no se vende.
        */
        const variante = typeof l.variante === "string" || typeof l.variante === "number"
          ? String(l.variante).replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64)
          : "";
        const articulo = PRECIOS[variante];
        if (!articulo) return null;

        const cantidad = Math.min(
          MAX_UNIDADES,
          Math.max(1, Math.floor(Number(l.cantidad) || 0))
        );
        const detalle = [texto(l.diseno), texto(l.color)].filter(Boolean).join(" · ");

        return {
          quantity: cantidad,
          price_data: {
            currency: "eur",
            unit_amount: articulo.precio,
            product_data: {
              name: articulo.nombre,
              description: detalle || undefined,
              metadata: {
                color: texto(l.color),
                talla: texto(l.talla),
                diseno: texto(l.diseno),
                // El id de la variante y quién la fabrica viajan hasta aquí
                // para que el webhook pueda mandar el pedido sin volver a mirar
                // nada. En la tienda conviven dos imprentas y desde el nombre
                // del producto no hay forma de saber cuál es cuál.
                variante,
                imprenta: articulo.imprenta,
                uid: articulo.uid || "",
              },
            },
          },
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);

    if (!lineas.length) {
      return res.status(409).json({ error: "esos artículos ya no están a la venta" });
    }

    const subtotal = lineas.reduce(
      (n, l) => n + l.price_data.unit_amount * l.quantity,
      0
    );
    // Envío: gratis a partir del umbral, y si no se cobra como una línea más.
    if (subtotal < ENVIO.gratisDesde && ENVIO.precio > 0) {
      lineas.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: ENVIO.precio,
          product_data: { name: "Envío", description: undefined, metadata: {} as never },
        },
      });
    }

    const origen =
      process.env.CYP_URL ||
      (typeof req.headers.origin === "string" ? req.headers.origin : "") ||
      "https://www.culowypililarge.com";

    // Se habla con Stripe por su API de formularios, sin librería: una
    // dependencia menos que mantener para tres campos.
    const params = new URLSearchParams();
    params.set("mode", "payment");
    /*
      Tarjeta, dicho a las claras.

      Si no se dice nada, Stripe elige los métodos que tengas activados para la
      moneda, y una cuenta recién abierta no tiene ninguno: contesta 400 con un
      «No valid payment method types for this Checkout Session» y la web se
      queda en «el cobro no ha respondido». Pidiendo tarjeta funciona desde el
      primer minuto, sin tocar ajustes.

      Cuando actives más métodos en el panel de Stripe —Bizum, que en España lo
      pide mucha gente— se quita esta línea y vuelven a salir solos.
    */
    params.set("payment_method_types[0]", "card");
    params.set("success_url", `${origen}/?pedido=hecho`);
    params.set("cancel_url", `${origen}/#tienda`);
    params.set("shipping_address_collection[allowed_countries][0]", "ES");
    params.set("shipping_address_collection[allowed_countries][1]", "PT");
    params.set("locale", "es");
    lineas.forEach((l, i) => {
      params.set(`line_items[${i}][quantity]`, String(l.quantity));
      params.set(`line_items[${i}][price_data][currency]`, l.price_data.currency);
      params.set(`line_items[${i}][price_data][unit_amount]`, String(l.price_data.unit_amount));
      params.set(`line_items[${i}][price_data][product_data][name]`, l.price_data.product_data.name);
      if (l.price_data.product_data.description) {
        params.set(
          `line_items[${i}][price_data][product_data][description]`,
          l.price_data.product_data.description
        );
      }
      Object.entries(l.price_data.product_data.metadata || {}).forEach(([k, v]) => {
        if (v) params.set(`line_items[${i}][price_data][product_data][metadata][${k}]`, String(v));
      });
    });

    const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${clave}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!stripe.ok) {
      const detalle = await stripe.text();
      console.error("[checkout] stripe", stripe.status, detalle.slice(0, 300));
      return res.status(502).json({ error: "el cobro no ha respondido" });
    }

    const sesion = (await stripe.json()) as { url?: string };
    if (!sesion.url) return res.status(502).json({ error: "sin url de pago" });
    return res.status(200).json({ url: sesion.url });
  } catch (err) {
    console.error("[checkout]", err);
    return res.status(500).json({ error: "no se ha podido abrir el pago" });
  }
}
