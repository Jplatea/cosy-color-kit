import type { DisenoId } from "@/components/cyp/disenos";
import type { PrendaId } from "@/components/cyp/prendas";
import printful from "./printful.json";

/**
 * El catálogo de la tienda.
 *
 * Manda Printful. Lo que esté dado de alta allí es lo que se vende aquí:
 * `npm run sync:printful` escribe `printful.json` con los productos, sus
 * tallas, sus colores y —lo importante— el id que hay que mandar para crear el
 * pedido. Si no hay nada sincronizado todavía, se enseña el catálogo de
 * muestra de abajo pero sin poder pagarlo, que es mejor que cobrar algo que
 * nadie puede fabricar.
 *
 * Lo que Printful no sabe es cómo se dibuja cada prenda ni qué estampado
 * lleva: eso es nuestro. Se deduce del nombre que le hayas puesto al producto
 * en Printful, así que llámalo en cristiano —«Camiseta Culow · símbolo»— y
 * saldrá bien solo. Si alguna vez falla, `AJUSTES` lo fuerza a mano.
 *
 * Los precios van en céntimos y en enteros: en euros y con decimales, sumar
 * tres cosas acaba dando 44,900000000000006.
 */

export type TallaId = string;

export type ColorPrenda = {
  id: string;
  nombre: string;
  /** El color del tejido y su sombra, para dibujar la prenda. */
  tela: string;
  sombra: string;
  /** Con qué tinta se estampa encima para que se lea. */
  tinta: string;
};

export type Producto = {
  id: string;
  nombre: string;
  prenda: PrendaId;
  /** Qué es, en la ficha. */
  ficha: string;
  /**
   * Precio "desde", en céntimos: el más barato de sus variantes. Es lo que se
   * enseña en la tarjeta antes de elegir talla.
   */
  precio: number;
  /** Precio real de cada combinación. Printful cobra más por las tallas grandes. */
  precios: Record<string, number>;
  tallas: TallaId[];
  colores: ColorPrenda[];
  disenos: DisenoId[];
  /**
   * clave `color/talla/diseño` -> id de variante en su imprenta.
   *
   * Va como texto aunque Printful numere: los identificadores no se suman ni
   * se comparan, solo se pasan tal cual, y en texto no hay `Number()` que los
   * pueda estropear por el camino.
   */
  variantes: Record<string, string>;
  /**
   * Las fotos que da Printful. Cuando hay, mandan sobre el dibujo: son la
   * imagen real de lo que se recibe, y en una tienda eso importa más que la
   * coherencia del estilo. La primera es la portada.
   */
  fotos: string[];
};

/** La clave con la que se busca la variante de imprenta. */
export const claveVariante = (color: string, talla: TallaId, diseno: DisenoId) =>
  `${color}/${talla}/${diseno}`;

// ------------------------------------------------------- de nombre a dibujo

/** Cómo se llama cada prenda por ahí fuera, en español y en inglés. */
const PISTAS_PRENDA: [PrendaId, RegExp][] = [
  ["sudadera", /sudadera|hoodie|sweatshirt|crewneck/i],
  ["pantalon", /pantal|jogger|sweatpant|short/i],
  ["taza", /taza|mug/i],
  ["bolsa", /bolsa|tote|shopper/i],
  ["gorra", /gorra|cap|hat|beanie/i],
  ["camiseta", /camiseta|t-?shirt|\btee\b|top/i],
];

const PISTAS_DISENO: [DisenoId, RegExp][] = [
  ["rotulo", /r[oó]tulo|logotipo|wordmark/i],
  ["brazos", /brazo|se[ñn]ala/i],
  ["sentarme", /sentar|cuatro a[ñn]os|4 a[ñn]os/i],
  ["lujo", /lujo/i],
  ["simbolo", /s[ií]mbolo|logo|icono/i],
];

/** Fuerza a mano lo que el nombre no deje claro. La clave es el id de Printful. */
const AJUSTES: Record<string, { prenda?: PrendaId; diseno?: DisenoId; ficha?: string }> = {};

const buscar = <T,>(pistas: [T, RegExp][], texto: string, porDefecto: T): T =>
  pistas.find(([, patron]) => patron.test(texto))?.[0] ?? porDefecto;

/** Aclara el tejido para saber si el estampado va en negro o en crema. */
function tintaSobre(hex: string): string {
  const limpio = hex.replace("#", "");
  if (limpio.length !== 6) return "#14120f";
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  // Luminancia percibida: el ojo pesa mucho más el verde que el azul.
  const luz = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luz > 0.55 ? "#14120f" : "#f2ece2";
}

function oscurecer(hex: string, cuanto = 0.24): string {
  const limpio = hex.replace("#", "");
  if (limpio.length !== 6) return "#8a8478";
  const canal = (i: number) =>
    Math.max(0, Math.round(parseInt(limpio.slice(i, i + 2), 16) * (1 - cuanto)))
      .toString(16)
      .padStart(2, "0");
  return `#${canal(0)}${canal(2)}${canal(4)}`;
}

const idDeColor = (nombre: string) =>
  nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unico";

// ------------------------------------------------------------- el catálogo

type VariantePF = {
  id: number;
  talla: string;
  color: string;
  precio: number;
  hex?: string;
  disponible?: boolean;
};

type ProductoPF = {
  id: number;
  nombre: string;
  miniatura?: string;
  fotos?: string[];
  variantes: VariantePF[];
};

function deLaImprenta(): Producto[] {
  const crudos = (printful?.productos ?? []) as ProductoPF[];

  return crudos
    .map((p): Producto | null => {
      const vivas = p.variantes.filter((v) => v.disponible !== false && v.precio > 0);
      if (!vivas.length) return null;

      const ajuste = AJUSTES[String(p.id)] || {};
      const prenda = ajuste.prenda ?? buscar(PISTAS_PRENDA, p.nombre, "camiseta");
      const diseno = ajuste.diseno ?? buscar(PISTAS_DISENO, p.nombre, "simbolo");

      const colores: ColorPrenda[] = [];
      for (const v of vivas) {
        const id = idDeColor(v.color || "único");
        if (colores.some((c) => c.id === id)) continue;
        const tela = v.hex && /^#?[0-9a-f]{6}$/i.test(v.hex) ? `#${v.hex.replace("#", "")}` : "#efe9de";
        colores.push({
          id,
          nombre: v.color || "Único",
          tela,
          sombra: oscurecer(tela),
          tinta: tintaSobre(tela),
        });
      }

      const tallas = [...new Set(vivas.map((v) => v.talla || "UNICA"))];

      const variantes: Record<string, string> = {};
      const precios: Record<string, number> = {};
      for (const v of vivas) {
        const clave = claveVariante(idDeColor(v.color || "único"), v.talla || "UNICA", diseno);
        variantes[clave] = String(v.id);
        precios[clave] = v.precio;
      }

      return {
        id: `pf-${p.id}`,
        // El nombre de Printful suele traer el modelo detrás; se queda lo de antes
        // del primer separador, que es como lo has llamado tú.
        nombre: p.nombre.split(/\s[–—|]\s/)[0].trim() || p.nombre,
        prenda,
        ficha: ajuste.ficha ?? FICHAS[prenda],
        // El precio lo pone Printful: es el único sitio donde debe vivir. Y no
        // es uno solo — una 5XL cuesta más que una S, así que se guarda el de
        // cada combinación y en la tarjeta se enseña el más barato como "desde".
        precio: Math.min(...vivas.map((v) => v.precio)),
        precios,
        tallas,
        colores,
        disenos: [diseno],
        variantes,
        fotos: p.fotos?.length ? p.fotos : p.miniatura ? [p.miniatura] : [],
      } satisfies Producto;
    })
    .filter((p): p is Producto => p !== null);
}

const FICHAS: Record<PrendaId, string> = {
  camiseta: "Algodón orgánico peinado. Corte recto, cuello reforzado.",
  sudadera: "Algodón y poliéster. Interior cepillado, capucha forrada.",
  pantalon: "Mismo tejido que la sudadera. Bolsillos laterales, puño elástico.",
  taza: "Cerámica. Apta para lavavajillas y para la fregona.",
  bolsa: "Lona de algodón. Asas largas. Cabe una fregona entera.",
  gorra: "Sarga de algodón, cierre metálico. Visera curva.",
};

/**
 * El escaparate de antes de que hubiera imprenta. Se ve, pero no se puede
 * comprar: sin id de variante no hay nada que fabricar.
 */
const MUESTRA: Producto[] = (
  [
    ["camiseta", "Camiseta", 2490, ["S", "M", "L", "XL"]],
    ["sudadera", "Sudadera con capucha", 4990, ["S", "M", "L", "XL"]],
    ["taza", "Taza", 1490, ["UNICA"]],
  ] as [PrendaId, string, number, string[]][]
).map(([prenda, nombre, precio, tallas]) => ({
  id: `muestra-${prenda}`,
  nombre,
  prenda,
  ficha: FICHAS[prenda],
  precio,
  tallas,
  colores: [
    { id: "crudo", nombre: "Crudo", tela: "#efe9de", sombra: "#b9ae9c", tinta: "#14120f" },
    { id: "tinta", nombre: "Tinta", tela: "#1c1a18", sombra: "#000000", tinta: "#f2ece2" },
  ],
  disenos: ["simbolo", "rotulo", "brazos", "sentarme", "lujo"] as DisenoId[],
  variantes: {},
  precios: {},
  fotos: [],
}));

const deImprenta = deLaImprenta();

/** true cuando lo que se ve viene de Printful y no del escaparate de muestra. */
export const hayImprenta = deImprenta.length > 0;

export const PRODUCTOS: Producto[] = hayImprenta ? deImprenta : MUESTRA;

/**
 * Lo que cuesta esa combinación. Si no está en la tabla —porque la imprenta no
 * la tiene dada de alta— se devuelve el precio "desde", que es lo que se está
 * enseñando en pantalla.
 */
export const precioDe = (p: Producto, color: string, talla: TallaId, diseno: DisenoId) =>
  p.precios[claveVariante(color, talla, diseno)] ?? p.precio;

export const euros = (centimos: number) =>
  (centimos / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });

/** Envío. Se cobra aparte y se dice antes de pagar, no en la última pantalla. */
export const ENVIO = {
  precio: 490,
  gratisDesde: 6000,
  texto: "Envío a península. Gratis a partir de 60 €.",
};

export const NOMBRE_TALLA = (t: TallaId) => (t === "UNICA" ? "Talla única" : t);
