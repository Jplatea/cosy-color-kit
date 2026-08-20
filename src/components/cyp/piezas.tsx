import type { ReactNode } from "react";
import { Eyes, shade, type CharacterId } from "./costumes";

/**
 * El costurero.
 *
 * Los diecinueve disfraces del vestidor están cosidos a mano uno por uno: cada
 * uno sabe exactamente dónde va su gorro y de qué color es su hocico. Eso está
 * bien para los que ya existen, pero no sirve para inventar uno nuevo a partir
 * de lo que alguien escriba en una caja de texto.
 *
 * Esto es lo otro: piezas sueltas —orejas, cuernos, alas, un sombrero, una
 * cola— que se pueden combinar entre sí. El sastre (`sastre.ts`) lee una
 * descripción, elige qué piezas pedir, y aquí se dibujan. Ninguna sabe nada de
 * las demás: se apilan y ya está.
 *
 * Todas reciben el mismo contexto y respetan las dos reglas de la casa:
 *   · `cima` y `lado` son la altura real de la coronilla. En Pililarge la
 *     cabeza es el borde de arriba de su marco; en Culow no, porque son dos
 *     esferas apoyadas abajo. Sin esto, en Culow los sombreros flotan.
 *   · Lo que va por detrás del cuerpo lleva `zIndex: -1`.
 */

export type Ctx = {
  /** Color elegido para el disfraz. */
  color: string;
  char: CharacterId;
  /** Escala: 1 es el tamaño del hero. */
  s: number;
  /** true si es Pililarge (la cápsula alta). */
  alto: boolean;
  /** Altura de la coronilla, para lo que va centrado. */
  cima: number;
  /** Altura del hombro de cada lóbulo, para lo que se apoya a un lado. */
  lado: number;
  eyeTop: string;
  eyeSize: number;
};

export type PiezaId =
  | "cara"
  | "orejas-punta"
  | "orejas-redondas"
  | "cuernos"
  | "antenas"
  | "alas"
  | "capa"
  | "cola"
  | "casco"
  | "sombrero"
  | "gorro-punta"
  | "chistera"
  | "corona"
  | "melena"
  | "pico"
  | "hocico"
  | "colmillos"
  | "bigote"
  | "aletas"
  | "pinchos"
  | "flor"
  | "gafas"
  | "parche"
  | "pajarita"
  | "cinturon"
  | "zapatos"
  | "pelo";

export type TexturaId = "rayas" | "lunares" | "escamas" | "pelo" | "metal";

/** Las tramas que se pueden superponer al cuerpo. */
export const TEXTURAS: Record<TexturaId, string> = {
  rayas:
    "repeating-linear-gradient(180deg, rgba(0,0,0,.18) 0 13px, rgba(255,255,255,.07) 13px 30px)",
  lunares:
    "radial-gradient(circle at 26% 28%, rgba(0,0,0,.2) 0 10px, transparent 11px), radial-gradient(circle at 70% 58%, rgba(0,0,0,.18) 0 13px, transparent 14px), radial-gradient(circle at 42% 82%, rgba(0,0,0,.16) 0 9px, transparent 10px)",
  escamas:
    "radial-gradient(circle at 50% 100%, transparent 9px, rgba(0,0,0,.16) 10px 11px, transparent 12px) 0 0/22px 16px",
  pelo:
    "repeating-linear-gradient(102deg, rgba(0,0,0,.12) 0 3px, transparent 3px 9px)",
  metal:
    "linear-gradient(100deg, rgba(255,255,255,.4) 0 8%, transparent 22% 78%, rgba(0,0,0,.22) 92%)",
};

type Dibujo = (c: Ctx) => ReactNode[];

/** Atajo: un div absoluto, que es de lo que está hecho todo esto. */
const caja = (key: string, style: React.CSSProperties) => (
  <div key={key} style={{ position: "absolute", ...style }} />
);

/** Muchas piezas van por pares, una a cada lado. */
const aLosLados = (hacer: (side: "left" | "right", i: number) => ReactNode[]) =>
  (["left", "right"] as const).flatMap(hacer);

const DIBUJOS: Record<PiezaId, Dibujo> = {
  cara: ({ eyeTop, eyeSize }) => [<Eyes key="cara" top={eyeTop} size={eyeSize} />],

  "orejas-punta": ({ color, s, lado }) =>
    aLosLados((side) => [
      caja(`op-${side}`, {
        top: -20 * s + lado,
        [side]: "23%",
        width: 28 * s,
        height: 34 * s,
        background: shade(color, -16),
        clipPath: "polygon(50% 0,100% 100%,0 100%)",
      }),
    ]),

  "orejas-redondas": ({ color, s, lado }) =>
    aLosLados((side) => [
      caja(`or-${side}`, {
        top: -18 * s + lado,
        [side]: "19%",
        width: 34 * s,
        height: 34 * s,
        borderRadius: "50%",
        background: shade(color, -14),
      }),
    ]),

  cuernos: ({ s, lado }) =>
    aLosLados((side, i) => [
      caja(`cu-${side}`, {
        top: -30 * s + lado,
        [side]: "24%",
        width: 14 * s,
        height: 38 * s,
        background: "linear-gradient(180deg,#f3ead6,#b9a480)",
        borderRadius: `${7 * s}px ${7 * s}px 0 0`,
        transform: `rotate(${i ? 18 : -18}deg)`,
      }),
    ]),

  antenas: ({ color, s, lado }) =>
    aLosLados((side, i) => [
      caja(`an-t-${side}`, {
        top: -44 * s + lado,
        [side]: "27%",
        width: 5 * s,
        height: 42 * s,
        background: shade(color, -40),
        borderRadius: 3 * s,
        transform: `rotate(${i ? 15 : -15}deg)`,
      }),
      caja(`an-b-${side}`, {
        top: -58 * s + lado,
        [side]: "22%",
        width: 20 * s,
        height: 20 * s,
        borderRadius: "50%",
        background: shade(color, 55),
      }),
    ]),

  alas: ({ s, alto }) =>
    aLosLados((side, i) => [
      caja(`al-${side}`, {
        top: alto ? "20%" : "6%",
        [side]: "-34%",
        width: 62 * s,
        height: 86 * s,
        background: "linear-gradient(180deg,rgba(255,255,255,.94),rgba(226,216,196,.8))",
        borderRadius: `${side === "left" ? "60% 20% 60% 20%" : "20% 60% 20% 60%"}`,
        transform: `rotate(${i ? 16 : -16}deg)`,
        zIndex: -1,
      }),
    ]),

  capa: ({ color, s, alto }) => [
    caja("capa", {
      top: alto ? "14%" : "28%",
      left: "-22%",
      right: "-22%",
      bottom: "-4%",
      background: shade(color, -50),
      clipPath: "polygon(28% 0,72% 0,100% 100%,0 100%)",
      zIndex: -1,
    }),
  ],

  cola: ({ color, s, alto }) => [
    caja("cola", {
      bottom: alto ? "4%" : "-6%",
      right: "-26%",
      width: 70 * s,
      height: 26 * s,
      background: shade(color, -22),
      borderRadius: `0 ${18 * s}px ${18 * s}px 0`,
      transform: "rotate(-12deg)",
      zIndex: -1,
    }),
  ],

  casco: ({ s, cima, alto }) => [
    caja("casco-v", {
      top: 6 * s + cima,
      left: alto ? "6%" : "16%",
      right: alto ? "6%" : "16%",
      height: 74 * s,
      borderRadius: 999,
      background: "linear-gradient(160deg,rgba(190,225,255,.5),rgba(120,160,200,.28))",
      border: `${3 * s}px solid rgba(255,255,255,.75)`,
      zIndex: 5,
    }),
    caja("casco-b", {
      top: -14 * s + cima,
      left: alto ? "2%" : "12%",
      right: alto ? "2%" : "12%",
      height: 26 * s,
      borderRadius: `${13 * s}px ${13 * s}px 0 0`,
      background: "#e7ecf2",
      zIndex: 6,
    }),
  ],

  sombrero: ({ s, cima, alto }) => [
    caja("so-ala", {
      top: -14 * s + cima,
      left: alto ? "-16%" : "0%",
      right: alto ? "-16%" : "0%",
      height: 13 * s,
      borderRadius: 999,
      background: "#4a3524",
    }),
    caja("so-copa", {
      top: -40 * s + cima,
      left: alto ? "18%" : "28%",
      right: alto ? "18%" : "28%",
      height: 30 * s,
      borderRadius: `${10 * s}px ${10 * s}px 0 0`,
      background: "#5c422c",
    }),
  ],

  "gorro-punta": ({ color, s, cima, alto }) => [
    caja("gp", {
      top: -66 * s + cima,
      left: alto ? "18%" : "28%",
      right: alto ? "18%" : "28%",
      height: 76 * s,
      background: shade(color, -34),
      clipPath: "polygon(50% 0,100% 100%,0 100%)",
    }),
    caja("gp-bola", {
      top: -74 * s + cima,
      left: "50%",
      width: 18 * s,
      height: 18 * s,
      marginLeft: -9 * s,
      borderRadius: "50%",
      background: "#fffaf0",
    }),
  ],

  chistera: ({ s, cima, alto }) => [
    caja("ch-ala", {
      top: -12 * s + cima,
      left: alto ? "-10%" : "6%",
      right: alto ? "-10%" : "6%",
      height: 11 * s,
      borderRadius: 999,
      background: "#181513",
    }),
    caja("ch-copa", {
      top: -58 * s + cima,
      left: alto ? "22%" : "31%",
      right: alto ? "22%" : "31%",
      height: 50 * s,
      borderRadius: `${4 * s}px ${4 * s}px 0 0`,
      background: "#181513",
    }),
    caja("ch-cinta", {
      top: -22 * s + cima,
      left: alto ? "22%" : "31%",
      right: alto ? "22%" : "31%",
      height: 10 * s,
      background: "#7a1f1f",
    }),
  ],

  corona: ({ s, cima, alto }) => [
    caja("co", {
      top: -30 * s + cima,
      left: alto ? "20%" : "29%",
      right: alto ? "20%" : "29%",
      height: 34 * s,
      background: "linear-gradient(180deg,#f6d98a,#c99b3c)",
      clipPath: "polygon(0 100%,0 34%,17% 62%,34% 6%,50% 52%,66% 6%,83% 62%,100% 34%,100% 100%)",
    }),
  ],

  melena: ({ color, s, cima, alto }) => [
    caja("me", {
      top: -30 * s + cima,
      left: alto ? "-14%" : "-2%",
      right: alto ? "-14%" : "-2%",
      height: 110 * s,
      borderRadius: "50%",
      background: `radial-gradient(circle at 50% 34%, ${shade(color, -20)}, ${shade(color, -60)})`,
      zIndex: -1,
    }),
  ],

  pico: ({ s, alto }) => [
    caja("pi", {
      top: alto ? "24%" : "42%",
      left: "50%",
      width: 34 * s,
      height: 24 * s,
      marginLeft: -17 * s,
      background: "linear-gradient(180deg,#f4b942,#d99420)",
      clipPath: "polygon(0 0,100% 0,50% 100%)",
      zIndex: 4,
    }),
  ],

  hocico: ({ color, s, alto }) => [
    <div
      key="ho"
      style={{
        position: "absolute",
        top: alto ? "24%" : "40%",
        left: "50%",
        width: 48 * s,
        height: 34 * s,
        marginLeft: -24 * s,
        borderRadius: "50%",
        background: shade(color, -26),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8 * s,
        zIndex: 4,
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{ width: 7 * s, height: 12 * s, borderRadius: "50%", background: shade(color, -80) }}
        />
      ))}
    </div>,
  ],

  colmillos: ({ s, alto }) =>
    aLosLados((side) => [
      caja(`cm-${side}`, {
        top: alto ? "30%" : "48%",
        [side]: "36%",
        width: 11 * s,
        height: 20 * s,
        background: "#fffdf7",
        clipPath: "polygon(0 0,100% 0,50% 100%)",
        zIndex: 5,
      }),
    ]),

  bigote: ({ s, alto }) => [
    caja("bi", {
      top: alto ? "28%" : "46%",
      left: "50%",
      width: 62 * s,
      height: 16 * s,
      marginLeft: -31 * s,
      background: "#332a20",
      borderRadius: `${8 * s}px ${8 * s}px ${3 * s}px ${3 * s}px`,
      clipPath: "polygon(0 0,100% 0,88% 100%,50% 56%,12% 100%)",
      zIndex: 5,
    }),
  ],

  aletas: ({ color, s, alto }) =>
    aLosLados((side, i) => [
      caja(`ae-${side}`, {
        top: alto ? "38%" : "34%",
        [side]: "-22%",
        width: 44 * s,
        height: 34 * s,
        background: shade(color, -26),
        borderRadius: "50%",
        transform: `rotate(${i ? 24 : -24}deg)`,
        zIndex: -1,
      }),
    ]),

  pinchos: ({ color, s, cima }) =>
    [0, 1, 2, 3, 4].map((i) =>
      caja(`pn-${i}`, {
        top: -18 * s + cima + Math.abs(i - 2) * 7 * s,
        left: `${18 + i * 16}%`,
        width: 9 * s,
        height: 24 * s,
        background: shade(color, -46),
        clipPath: "polygon(50% 0,100% 100%,0 100%)",
      })
    ),

  flor: ({ s, cima }) => [
    <div
      key="fl"
      style={{
        position: "absolute",
        top: -34 * s + cima,
        left: "62%",
        width: 40 * s,
        height: 40 * s,
        zIndex: 4,
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 17 * s,
            height: 17 * s,
            marginLeft: -8.5 * s,
            marginTop: -8.5 * s,
            borderRadius: "50%",
            background: "#f28fb1",
            transform: `rotate(${i * 72}deg) translateY(${-11 * s}px)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 15 * s,
          height: 15 * s,
          marginLeft: -7.5 * s,
          marginTop: -7.5 * s,
          borderRadius: "50%",
          background: "#f7d34a",
        }}
      />
    </div>,
  ],

  gafas: ({ s, alto }) => [
    <div
      key="ga"
      style={{
        position: "absolute",
        top: alto ? "12%" : "20%",
        left: alto ? "10%" : "17%",
        right: alto ? "10%" : "17%",
        height: 30 * s,
        display: "flex",
        alignItems: "center",
        gap: 6 * s,
        zIndex: 6,
      }}
    >
      <div style={{ flex: 1, height: "100%", borderRadius: 8 * s, background: "#181513", border: `${2 * s}px solid #3a332d` }} />
      <div style={{ width: 12 * s, height: 3 * s, background: "#181513" }} />
      <div style={{ flex: 1, height: "100%", borderRadius: 8 * s, background: "#181513", border: `${2 * s}px solid #3a332d` }} />
    </div>,
  ],

  parche: ({ s, alto, eyeTop }) => [
    caja("pa", {
      top: eyeTop,
      left: alto ? "16%" : "22%",
      width: 40 * s,
      height: 36 * s,
      borderRadius: 6 * s,
      background: "#191512",
      zIndex: 7,
    }),
    caja("pa-cuerda", {
      top: `calc(${eyeTop} + ${8 * s}px)`,
      left: alto ? "-4%" : "8%",
      right: alto ? "-4%" : "8%",
      height: 4 * s,
      background: "#191512",
      zIndex: 6,
    }),
  ],

  pajarita: ({ s, alto }) => [
    caja("pj", {
      top: alto ? "52%" : "72%",
      left: "50%",
      width: 54 * s,
      height: 24 * s,
      marginLeft: -27 * s,
      background: "#8c1f1f",
      clipPath: "polygon(0 0,42% 34%,58% 34%,100% 0,100% 100%,58% 66%,42% 66%,0 100%)",
      zIndex: 5,
    }),
  ],

  cinturon: ({ s, alto }) => [
    caja("ci", {
      top: alto ? "58%" : "62%",
      left: alto ? "-2%" : "4%",
      right: alto ? "-2%" : "4%",
      height: 22 * s,
      background: "#2b2119",
      zIndex: 4,
    }),
    caja("ci-h", {
      top: alto ? "56%" : "60%",
      left: "50%",
      width: 30 * s,
      height: 28 * s,
      marginLeft: -15 * s,
      borderRadius: 5 * s,
      background: "linear-gradient(180deg,#f0cd7c,#b8893a)",
      zIndex: 5,
    }),
  ],

  /**
   * El pelo.
   *
   * No vale la melena de león que ya había: esa va detrás del cuerpo —que es lo
   * suyo para enmarcar una cabeza de león— y aquí desaparecía entera detrás de
   * los lóbulos. El pelo va por delante y encima de la coronilla, con un
   * mechón levantado: sin el mechón parece un casco.
   */
  pelo: ({ s, cima, alto }) => [
    caja("pe-base", {
      top: -24 * s + cima,
      left: alto ? "2%" : "12%",
      right: alto ? "2%" : "12%",
      height: 50 * s,
      borderRadius: `${30 * s}px ${30 * s}px ${10 * s}px ${10 * s}px`,
      background: "linear-gradient(180deg,#4a3324,#241708)",
      zIndex: 4,
    }),
    // El flequillo: tres picos por delante, para que no sea un bloque liso.
    caja("pe-flequillo", {
      top: 14 * s + cima,
      left: alto ? "2%" : "12%",
      right: alto ? "2%" : "12%",
      height: 22 * s,
      background: "#33220f",
      clipPath: "polygon(0 0,100% 0,100% 40%,82% 100%,64% 34%,46% 100%,28% 34%,10% 96%,0 38%)",
      zIndex: 5,
    }),
    // Y el mechón de arriba, que es lo que le da la gracia.
    caja("pe-mechon", {
      top: -46 * s + cima,
      left: "54%",
      width: 20 * s,
      height: 34 * s,
      background: "#3d2a1c",
      borderRadius: `${10 * s}px ${10 * s}px 0 0`,
      transform: "rotate(22deg)",
      transformOrigin: "bottom center",
      zIndex: 4,
    }),
  ],

  /**
   * Los zapatos.
   *
   * Ninguno de los dos tiene pies, así que los zapatos no calzan nada: se
   * apoyan debajo del cuerpo y ya está. En Culow van uno bajo cada lóbulo; en
   * Pililarge, juntos en la base de la cápsula. Que no haya pierna que meter
   * dentro es exactamente el chiste.
   */
  zapatos: ({ s, alto }) =>
    aLosLados((side, i) => [
      <div
        key={`za-${side}`}
        style={{
          position: "absolute",
          bottom: -14 * s,
          [side]: alto ? "6%" : "16%",
          width: 54 * s,
          height: 24 * s,
          background: "linear-gradient(180deg,#3a322b,#171310)",
          borderRadius: `${16 * s}px ${16 * s}px ${6 * s}px ${6 * s}px`,
          transform: `rotate(${i ? 4 : -4}deg) scaleX(${i ? 1 : -1})`,
          boxShadow: `inset 0 ${-4 * s}px ${6 * s}px rgba(0,0,0,.5)`,
          zIndex: 3,
        }}
      >
        {/* La puntera, un pelín levantada: sin esto parecen ladrillos. */}
        <div
          style={{
            position: "absolute",
            right: -2 * s,
            bottom: 0,
            width: 22 * s,
            height: 18 * s,
            borderRadius: `${11 * s}px ${11 * s}px ${4 * s}px ${4 * s}px`,
            background: "linear-gradient(180deg,#4a4038,#221c17)",
          }}
        />
      </div>,
    ]),
};

/** Dibuja las piezas pedidas, en el orden en que se piden. */
export function dibujarPiezas(piezas: PiezaId[], ctx: Ctx): ReactNode[] {
  return piezas.flatMap((id) => DIBUJOS[id]?.(ctx) ?? []);
}

/** Para la lista que se enseña debajo del disfraz inventado. */
export const NOMBRES: Record<PiezaId, string> = {
  cara: "ojos",
  "orejas-punta": "orejas de punta",
  "orejas-redondas": "orejas redondas",
  cuernos: "cuernos",
  antenas: "antenas",
  alas: "alas",
  capa: "capa",
  cola: "cola",
  casco: "casco",
  sombrero: "sombrero",
  "gorro-punta": "gorro de punta",
  chistera: "chistera",
  corona: "corona",
  melena: "melena",
  pico: "pico",
  hocico: "hocico",
  colmillos: "colmillos",
  bigote: "bigote",
  aletas: "aletas",
  pinchos: "pinchos",
  flor: "flor",
  gafas: "gafas de sol",
  parche: "parche",
  pajarita: "pajarita",
  cinturon: "cinturón",
  zapatos: "zapatos",
  pelo: "pelo",
};

export const NOMBRES_TEXTURA: Record<TexturaId, string> = {
  rayas: "a rayas",
  lunares: "de lunares",
  escamas: "con escamas",
  pelo: "peludo",
  metal: "metalizado",
};
