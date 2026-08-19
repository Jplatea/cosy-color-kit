import type { DisenoId } from "@/components/cyp/disenos";
import type { PrendaId } from "@/components/cyp/prendas";

/**
 * El catálogo de la tienda.
 *
 * Este fichero es lo único que hay que tocar para cambiar precios, tallas o
 * qué se vende. Los precios van en céntimos y en enteros: en euros y con
 * decimales, sumar tres cosas acaba dando 44,900000000000006.
 *
 * `variantes` es el puente con la imprenta. Printful identifica cada
 * combinación concreta —esta sudadera, en negro, talla L— con un número suyo,
 * y sin ese número no sabe qué imprimir. Mientras esté vacío la tienda enseña
 * el producto pero no deja pagarlo, que es mejor que cobrar por algo que nadie
 * puede fabricar. Los números salen del catálogo de Printful.
 */

export type TallaId = "XS" | "S" | "M" | "L" | "XL" | "2XL" | "UNICA";

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
  /** Precio en céntimos. */
  precio: number;
  tallas: TallaId[];
  colores: ColorPrenda[];
  disenos: DisenoId[];
  /** clave `color/talla/diseño` -> id de variante de Printful. */
  variantes: Record<string, number>;
};

const CRUDO: ColorPrenda = {
  id: "crudo",
  nombre: "Crudo",
  tela: "#efe9de",
  sombra: "#b9ae9c",
  tinta: "#14120f",
};

const TINTA: ColorPrenda = {
  id: "tinta",
  nombre: "Tinta",
  tela: "#1c1a18",
  sombra: "#000000",
  tinta: "#f2ece2",
};

const PIEDRA: ColorPrenda = {
  id: "piedra",
  nombre: "Piedra",
  tela: "#b9b2a5",
  sombra: "#8a8478",
  tinta: "#14120f",
};

const ROPA: TallaId[] = ["XS", "S", "M", "L", "XL", "2XL"];
const UNA: TallaId[] = ["UNICA"];

export const PRODUCTOS: Producto[] = [
  {
    id: "camiseta",
    nombre: "Camiseta",
    prenda: "camiseta",
    ficha: "Algodón orgánico peinado, 180 g. Corte recto, cuello reforzado.",
    precio: 2490,
    tallas: ROPA,
    colores: [CRUDO, TINTA, PIEDRA],
    disenos: ["simbolo", "rotulo", "brazos", "sentarme", "lujo"],
    variantes: {},
  },
  {
    id: "sudadera",
    nombre: "Sudadera con capucha",
    prenda: "sudadera",
    ficha: "Algodón y poliéster, 320 g. Interior cepillado, capucha forrada.",
    precio: 4990,
    tallas: ROPA,
    colores: [TINTA, CRUDO],
    disenos: ["simbolo", "rotulo", "lujo"],
    variantes: {},
  },
  {
    id: "pantalon",
    nombre: "Pantalón de chándal",
    prenda: "pantalon",
    ficha: "Mismo tejido que la sudadera. Bolsillos laterales, puño elástico.",
    precio: 4490,
    tallas: ROPA,
    colores: [TINTA, PIEDRA],
    disenos: ["simbolo", "lujo"],
    variantes: {},
  },
  {
    id: "taza",
    nombre: "Taza",
    prenda: "taza",
    ficha: "Cerámica blanca, 325 ml. Apta para lavavajillas y para la fregona.",
    precio: 1490,
    tallas: UNA,
    colores: [CRUDO, TINTA],
    disenos: ["simbolo", "rotulo", "brazos", "sentarme", "lujo"],
    variantes: {},
  },
  {
    id: "bolsa",
    nombre: "Bolsa de tela",
    prenda: "bolsa",
    ficha: "Lona de algodón, 340 g. Asas largas. Cabe una fregona entera.",
    precio: 1690,
    tallas: UNA,
    colores: [CRUDO],
    disenos: ["simbolo", "rotulo", "lujo"],
    variantes: {},
  },
  {
    id: "gorra",
    nombre: "Gorra",
    prenda: "gorra",
    ficha: "Sarga de algodón, cierre metálico. Visera curva.",
    precio: 2190,
    tallas: UNA,
    colores: [TINTA, CRUDO],
    disenos: ["simbolo", "lujo"],
    variantes: {},
  },
];

/** La clave con la que se busca la variante de imprenta. */
export const claveVariante = (color: string, talla: TallaId, diseno: DisenoId) =>
  `${color}/${talla}/${diseno}`;

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

export const NOMBRE_TALLA: Record<TallaId, string> = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  "2XL": "2XL",
  UNICA: "Talla única",
};
