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

// El catálogo, repetido aquí a propósito: Vercel empaqueta cada función por
// separado y deja fuera lo que no cuelgue de ella, así que importar el del
// frontend rompería en producción. Si cambian los precios, cambian en los dos
// sitios; es el precio de no tener un paso de compilación compartido.
const CATALOGO: Record<string, { nombre: string; precio: number }> = {
  camiseta: { nombre: "Camiseta", precio: 2490 },
  sudadera: { nombre: "Sudadera con capucha", precio: 4990 },
  pantalon: { nombre: "Pantalón de chándal", precio: 4490 },
  taza: { nombre: "Taza", precio: 1490 },
  bolsa: { nombre: "Bolsa de tela", precio: 1690 },
  gorra: { nombre: "Gorra", precio: 2190 },
};

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

    // Se reconstruye la cesta con los precios del servidor.
    const lineas = entrada
      .map((l) => {
        const id = typeof l.producto === "string" ? l.producto : "";
        const producto = CATALOGO[id];
        const cantidad = Math.min(
          MAX_UNIDADES,
          Math.max(1, Math.floor(Number(l.cantidad) || 0))
        );
        if (!producto) return null;
        const detalle = [texto(l.diseno), texto(l.color), texto(l.talla)]
          .filter(Boolean)
          .join(" · ");
        return {
          quantity: cantidad,
          price_data: {
            currency: "eur",
            unit_amount: producto.precio,
            product_data: {
              name: producto.nombre,
              description: detalle || undefined,
              metadata: {
                producto: id,
                color: texto(l.color),
                talla: texto(l.talla),
                diseno: texto(l.diseno),
                // El id de la imprenta viaja hasta aquí para que el pedido se
                // pueda fabricar solo desde el webhook, sin volver a mirar nada.
                variante: String(Number(l.variante) || ""),
              },
            },
          },
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);

    if (!lineas.length) return res.status(400).json({ error: "nada que cobrar" });

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
