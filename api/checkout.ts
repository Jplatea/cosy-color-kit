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
 * La tabla de precios, por id de variante de Printful.
 *
 * Está escrita aquí dentro, y no importada, después de que dos intentos
 * fallaran en producción con FUNCTION_INVOCATION_FAILED: ni un `import` de
 * JSON ni uno de un módulo hermano llegaban a la función ya empaquetada.
 * Vercel mete cada función en su propio paquete y de al lado no llegaba nada,
 * así que lo único que no puede perderse por el camino es el propio fichero.
 *
 * La rellena `npm run sync:printful` entre las dos marcas. No se toca a mano:
 * se vuelve a sincronizar.
 *
 * Se busca por id de variante, que es lo único que manda el navegador. El
 * importe sale siempre de aquí, nunca de la petición: si viniera en ella,
 * cualquiera compraría una sudadera por un céntimo.
 */
// === PRECIOS · generado, no editar ===
type Articulo = { nombre: string; precio: number };
const PRECIOS: Record<string, Articulo> = {
  "5453261502": {
    "nombre": "Una alfombrilla que no vale para la puerta de la casa · 12″×18″",
    "precio": 2100
  },
  "5453261503": {
    "nombre": "Una alfombrilla que no vale para la puerta de la casa · 12″×22″",
    "precio": 2200
  },
  "5453261504": {
    "nombre": "Una alfombrilla que no vale para la puerta de la casa · 16″×32″",
    "precio": 2800
  },
  "5453194211": {
    "nombre": "La bolsa que se bolsepapea a todas las bolsas · One size",
    "precio": 7700
  },
  "5453185424": {
    "nombre": "Gorrica para ponertela en la cabeza · One size",
    "precio": 3000
  },
  "5453185425": {
    "nombre": "Gorrica para ponertela en la cabeza · One size",
    "precio": 3000
  },
  "5453151950": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · S",
    "precio": 2750
  },
  "5453151951": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · M",
    "precio": 2750
  },
  "5453151952": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · L",
    "precio": 2750
  },
  "5453151953": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · XL",
    "precio": 2750
  },
  "5453151954": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · S",
    "precio": 2750
  },
  "5453151955": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · M",
    "precio": 2750
  },
  "5453151956": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · L",
    "precio": 2750
  },
  "5453151957": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · XL",
    "precio": 2750
  },
  "5453151958": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · S",
    "precio": 2750
  },
  "5453151959": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · M",
    "precio": 2750
  },
  "5453151960": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · L",
    "precio": 2750
  },
  "5453151961": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · XL",
    "precio": 2750
  },
  "5453151962": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · S",
    "precio": 2750
  },
  "5453151963": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · M",
    "precio": 2750
  },
  "5453151964": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · L",
    "precio": 2750
  },
  "5453151965": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · XL",
    "precio": 2750
  },
  "5453151966": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · S",
    "precio": 2750
  },
  "5453151967": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · M",
    "precio": 2750
  },
  "5453151968": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · L",
    "precio": 2750
  },
  "5453151969": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · XL",
    "precio": 2750
  },
  "5453151970": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · S",
    "precio": 2750
  },
  "5453151971": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · M",
    "precio": 2750
  },
  "5453151972": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · L",
    "precio": 2750
  },
  "5453151973": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · XL",
    "precio": 2750
  },
  "5453151974": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · S",
    "precio": 2750
  },
  "5453151975": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · M",
    "precio": 2750
  },
  "5453151976": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · L",
    "precio": 2750
  },
  "5453151977": {
    "nombre": "Camisetita para esos maduritos que se quieren poner fuertecitos · XL",
    "precio": 2750
  },
  "5453002936": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XS",
    "precio": 2700
  },
  "5453002937": {
    "nombre": "Padelbros alucinarán con la camisetita molona · S",
    "precio": 2700
  },
  "5453002938": {
    "nombre": "Padelbros alucinarán con la camisetita molona · M",
    "precio": 2700
  },
  "5453002939": {
    "nombre": "Padelbros alucinarán con la camisetita molona · L",
    "precio": 2700
  },
  "5453002940": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XL",
    "precio": 2700
  },
  "5453002941": {
    "nombre": "Padelbros alucinarán con la camisetita molona · 2XL",
    "precio": 2900
  },
  "5453002942": {
    "nombre": "Padelbros alucinarán con la camisetita molona · S",
    "precio": 2700
  },
  "5453002943": {
    "nombre": "Padelbros alucinarán con la camisetita molona · M",
    "precio": 2700
  },
  "5453002944": {
    "nombre": "Padelbros alucinarán con la camisetita molona · L",
    "precio": 2700
  },
  "5453002945": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XL",
    "precio": 2700
  },
  "5453002946": {
    "nombre": "Padelbros alucinarán con la camisetita molona · 2XL",
    "precio": 2900
  },
  "5453002947": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XS",
    "precio": 2700
  },
  "5453002948": {
    "nombre": "Padelbros alucinarán con la camisetita molona · S",
    "precio": 2700
  },
  "5453002949": {
    "nombre": "Padelbros alucinarán con la camisetita molona · M",
    "precio": 2700
  },
  "5453002950": {
    "nombre": "Padelbros alucinarán con la camisetita molona · L",
    "precio": 2700
  },
  "5453002951": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XL",
    "precio": 2700
  },
  "5453002952": {
    "nombre": "Padelbros alucinarán con la camisetita molona · 2XL",
    "precio": 2900
  },
  "5453002953": {
    "nombre": "Padelbros alucinarán con la camisetita molona · S",
    "precio": 2700
  },
  "5453002954": {
    "nombre": "Padelbros alucinarán con la camisetita molona · M",
    "precio": 2700
  },
  "5453002955": {
    "nombre": "Padelbros alucinarán con la camisetita molona · L",
    "precio": 2700
  },
  "5453002956": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XL",
    "precio": 2700
  },
  "5453002957": {
    "nombre": "Padelbros alucinarán con la camisetita molona · 2XL",
    "precio": 2900
  },
  "5453002958": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XS",
    "precio": 2700
  },
  "5453002960": {
    "nombre": "Padelbros alucinarán con la camisetita molona · S",
    "precio": 2700
  },
  "5453002961": {
    "nombre": "Padelbros alucinarán con la camisetita molona · M",
    "precio": 2700
  },
  "5453002962": {
    "nombre": "Padelbros alucinarán con la camisetita molona · L",
    "precio": 2700
  },
  "5453002963": {
    "nombre": "Padelbros alucinarán con la camisetita molona · XL",
    "precio": 2700
  },
  "5453002964": {
    "nombre": "Padelbros alucinarán con la camisetita molona · 2XL",
    "precio": 2900
  },
  "5452966559": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · S",
    "precio": 1050
  },
  "5452966560": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · M",
    "precio": 1050
  },
  "5452966562": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · L",
    "precio": 1050
  },
  "5452966563": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · XL",
    "precio": 1050
  },
  "5452966564": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · S",
    "precio": 1050
  },
  "5452966565": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · M",
    "precio": 1050
  },
  "5452966566": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · L",
    "precio": 1050
  },
  "5452966567": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · XL",
    "precio": 1050
  },
  "5452966568": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · S",
    "precio": 1050
  },
  "5452966569": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · M",
    "precio": 1050
  },
  "5452966570": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · L",
    "precio": 1050
  },
  "5452966571": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · XL",
    "precio": 1050
  },
  "5452966572": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · S",
    "precio": 1050
  },
  "5452966573": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · M",
    "precio": 1050
  },
  "5452966574": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · L",
    "precio": 1050
  },
  "5452966575": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · XL",
    "precio": 1050
  },
  "5452966576": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · S",
    "precio": 1050
  },
  "5452966577": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · M",
    "precio": 1050
  },
  "5452966578": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · L",
    "precio": 1050
  },
  "5452966579": {
    "nombre": "Camisetita para aquellos criptobros que están en bancarrota · XL",
    "precio": 1050
  },
  "5452270555": {
    "nombre": "Bolsa para los fuertecitos de gimnasio que quieren vacilar de mochilita · One size",
    "precio": 9600
  },
  "5452259381": {
    "nombre": "Para que el ratoncito retoce alegremente · 8.7\"x7.1\"",
    "precio": 1250
  },
  "5449680122": {
    "nombre": "Bolsaca para el dinerete, gafitas chulas.... · 15″×15″",
    "precio": 2100
  },
  "5452910521": {
    "nombre": "Bolsaca para el dinerete, gafitas chulas.... · 15″×15″",
    "precio": 2100
  },
  "5452910522": {
    "nombre": "Bolsaca para el dinerete, gafitas chulas.... · 15″×15″",
    "precio": 2100
  },
  "5449668444": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XS",
    "precio": 5350
  },
  "5449668445": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · S",
    "precio": 5350
  },
  "5449668446": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · M",
    "precio": 5350
  },
  "5449668447": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · L",
    "precio": 5350
  },
  "5449668448": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XL",
    "precio": 5350
  },
  "5449668449": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 2XL",
    "precio": 5500
  },
  "5449668450": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 3XL",
    "precio": 5700
  },
  "5452275032": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · S",
    "precio": 5350
  },
  "5452275034": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · M",
    "precio": 5350
  },
  "5452275054": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · L",
    "precio": 5350
  },
  "5452275058": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XL",
    "precio": 5350
  },
  "5452275060": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 2XL",
    "precio": 5500
  },
  "5452275061": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 3XL",
    "precio": 5700
  },
  "5452275062": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XS",
    "precio": 5350
  },
  "5452275063": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · S",
    "precio": 5350
  },
  "5452275064": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · M",
    "precio": 5350
  },
  "5452275065": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · L",
    "precio": 5350
  },
  "5452276767": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XS",
    "precio": 5350
  },
  "5452276823": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · XL",
    "precio": 5350
  },
  "5452276829": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 2XL",
    "precio": 5500
  },
  "5452276842": {
    "nombre": "Sudadera to perita de cuello como si llevaras collarin · 3XL",
    "precio": 5700
  },
  "5449667542": {
    "nombre": "Gorraca para aparcar coches como un pro · S/M",
    "precio": 2350
  },
  "5449667543": {
    "nombre": "Gorraca para aparcar coches como un pro · L/XL",
    "precio": 2350
  },
  "5452909812": {
    "nombre": "Gorraca para aparcar coches como un pro · S/M",
    "precio": 2350
  },
  "5452909813": {
    "nombre": "Gorraca para aparcar coches como un pro · L/XL",
    "precio": 2350
  },
  "5452909814": {
    "nombre": "Gorraca para aparcar coches como un pro · S/M",
    "precio": 2350
  },
  "5452909815": {
    "nombre": "Gorraca para aparcar coches como un pro · L/XL",
    "precio": 2350
  },
  "5452909816": {
    "nombre": "Gorraca para aparcar coches como un pro · S/M",
    "precio": 2350
  },
  "5452909817": {
    "nombre": "Gorraca para aparcar coches como un pro · L/XL",
    "precio": 2350
  },
  "5452909818": {
    "nombre": "Gorraca para aparcar coches como un pro · S/M",
    "precio": 2350
  },
  "5452909819": {
    "nombre": "Gorraca para aparcar coches como un pro · L/XL",
    "precio": 2350
  },
  "5449158693": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XS",
    "precio": 2700
  },
  "5449158694": {
    "nombre": "Camisetita para ver a tus Bros en el padel · S",
    "precio": 2700
  },
  "5449158695": {
    "nombre": "Camisetita para ver a tus Bros en el padel · M",
    "precio": 2700
  },
  "5449158696": {
    "nombre": "Camisetita para ver a tus Bros en el padel · L",
    "precio": 2700
  },
  "5449158697": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XL",
    "precio": 2700
  },
  "5449158698": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 2XL",
    "precio": 2850
  },
  "5449158699": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 3XL",
    "precio": 3050
  },
  "5449158700": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 4XL",
    "precio": 3200
  },
  "5449158701": {
    "nombre": "Camisetita para ver a tus Bros en el padel · 5XL",
    "precio": 3500
  },
  "5452906230": {
    "nombre": "Camisetita para ver a tus Bros en el padel · S",
    "precio": 2700
  },
  "5452906231": {
    "nombre": "Camisetita para ver a tus Bros en el padel · M",
    "precio": 2700
  },
  "5452906232": {
    "nombre": "Camisetita para ver a tus Bros en el padel · L",
    "precio": 2700
  },
  "5452906233": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XL",
    "precio": 2700
  },
  "5452906234": {
    "nombre": "Camisetita para ver a tus Bros en el padel · S",
    "precio": 2700
  },
  "5452906235": {
    "nombre": "Camisetita para ver a tus Bros en el padel · M",
    "precio": 2700
  },
  "5452906236": {
    "nombre": "Camisetita para ver a tus Bros en el padel · L",
    "precio": 2700
  },
  "5452906237": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XL",
    "precio": 2700
  },
  "5452906238": {
    "nombre": "Camisetita para ver a tus Bros en el padel · S",
    "precio": 2700
  },
  "5452906239": {
    "nombre": "Camisetita para ver a tus Bros en el padel · M",
    "precio": 2700
  },
  "5452906240": {
    "nombre": "Camisetita para ver a tus Bros en el padel · L",
    "precio": 2700
  },
  "5452906241": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XL",
    "precio": 2700
  },
  "5452906242": {
    "nombre": "Camisetita para ver a tus Bros en el padel · S",
    "precio": 2700
  },
  "5452906243": {
    "nombre": "Camisetita para ver a tus Bros en el padel · M",
    "precio": 2700
  },
  "5452906244": {
    "nombre": "Camisetita para ver a tus Bros en el padel · L",
    "precio": 2700
  },
  "5452906245": {
    "nombre": "Camisetita para ver a tus Bros en el padel · XL",
    "precio": 2700
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
          número. Lo que de verdad protege no es el formato sino la línea de
          después: si no está en la tabla, no se vende.
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
                // El id de la imprenta viaja hasta aquí para que el pedido se
                // pueda fabricar solo desde el webhook, sin volver a mirar nada.
                variante,
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
    /*
      Cómo sale el cargo en el extracto del banco.

      La cuenta de Stripe se comparte con otro proyecto y su nombre público es
      el de aquel, así que sin esto el comprador ve un cobro de una marca que
      no ha visitado nunca —y eso, en un extracto, es lo que hace que alguien
      llame al banco a reclamar en vez de a la tienda.

      Ojo: esto arregla el extracto, **no la página de pago**. El nombre y el
      logotipo de esa página salen de los datos públicos de la cuenta, no de
      la petición, y no hay parámetro que los sustituya: o se renombra la
      cuenta o cada tienda necesita la suya.

      Máximo 22 caracteres y sin < > " ' *, o Stripe rechaza la sesión entera.
    */
    params.set("payment_intent_data[statement_descriptor]", "CULOW Y PILILARGE");
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
