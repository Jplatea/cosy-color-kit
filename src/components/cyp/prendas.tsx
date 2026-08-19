import type { ReactNode } from "react";

/**
 * Las prendas, dibujadas.
 *
 * En la tienda no hay ni una foto de estudio: cada prenda es una silueta en
 * SVG con un hueco donde va el estampado. Es coherente con el resto del sitio
 * —aquí todo está dibujado a mano— y además evita el problema de siempre de
 * las tiendas de print-on-demand: los mockups del proveedor son fotos suyas,
 * con su iluminación y su modelo, y nunca pegan con la web que los enseña.
 *
 * Cada prenda declara su `zona`: el rectángulo, en coordenadas del propio
 * dibujo, donde cabe el estampado. El estampado no sabe en qué prenda está;
 * se le da un cuadro y se dibuja dentro.
 */

export type PrendaId = "camiseta" | "sudadera" | "pantalon" | "taza" | "bolsa" | "gorra";

export type Prenda = {
  /** El contorno, ya pintado del color elegido. */
  dibujo: (color: string, sombra: string) => ReactNode;
  /** Dónde cabe el estampado, en el viewBox de 200×200. */
  zona: { x: number; y: number; w: number; h: number };
};

const VIEW = 200;

export const PRENDAS: Record<PrendaId, Prenda> = {
  camiseta: {
    zona: { x: 68, y: 62, w: 64, h: 62 },
    dibujo: (color, sombra) => (
      <>
        <path
          d="M64 34 82 26a20 20 0 0 0 36 0l18 8 26 16-14 26-16-8v96a6 6 0 0 1-6 6H60a6 6 0 0 1-6-6V76l-16 8-14-26Z"
          fill={color}
          stroke={sombra}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M82 26a20 20 0 0 0 36 0" fill="none" stroke={sombra} strokeWidth="1.5" />
        <path d="M54 76v90M146 76v90" stroke={sombra} strokeWidth="0.8" opacity=".5" />
      </>
    ),
  },

  sudadera: {
    zona: { x: 66, y: 76, w: 68, h: 58 },
    dibujo: (color, sombra) => (
      <>
        <path
          d="M62 36 84 28h32l22 8 28 18-15 28-17-9v90a7 7 0 0 1-7 7H58a7 7 0 0 1-7-7V73l-17 9-15-28Z"
          fill={color}
          stroke={sombra}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Capucha y cordones: lo que distingue una sudadera de una camiseta. */}
        <path d="M84 28c0 16 8 24 16 24s16-8 16-24" fill={sombra} opacity=".28" />
        <path d="M92 44v22M108 44v22" stroke={sombra} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M51 150h98" stroke={sombra} strokeWidth="1" opacity=".45" />
        <path d="M51 150v16a7 7 0 0 0 7 7h84a7 7 0 0 0 7-7v-16" fill={sombra} opacity=".14" />
      </>
    ),
  },

  pantalon: {
    zona: { x: 58, y: 96, w: 38, h: 34 },
    dibujo: (color, sombra) => (
      <>
        <path
          d="M56 26h88l6 28-8 118h-34l-8-84-8 84H58L50 54Z"
          fill={color}
          stroke={sombra}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M50 54h100" stroke={sombra} strokeWidth="1" opacity=".5" />
        <path d="M56 26h88v12H56z" fill={sombra} opacity=".2" />
        <path d="M100 92v80" stroke={sombra} strokeWidth="0.8" opacity=".45" />
      </>
    ),
  },

  taza: {
    zona: { x: 56, y: 78, w: 58, h: 48 },
    dibujo: (color, sombra) => (
      <>
        <path
          d="M44 56h84v92a12 12 0 0 1-12 12H56a12 12 0 0 1-12-12Z"
          fill={color}
          stroke={sombra}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <ellipse cx="86" cy="56" rx="42" ry="10" fill={sombra} opacity=".22" />
        <path
          d="M128 76h14a20 20 0 0 1 0 40h-14"
          fill="none"
          stroke={sombra}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path d="M128 76h14a20 20 0 0 1 0 40h-14" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </>
    ),
  },

  bolsa: {
    zona: { x: 62, y: 84, w: 76, h: 66 },
    dibujo: (color, sombra) => (
      <>
        <path
          d="M74 30a26 26 0 0 1 52 0"
          fill="none"
          stroke={sombra}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M48 58h104v112a4 4 0 0 1-4 4H52a4 4 0 0 1-4-4Z"
          fill={color}
          stroke={sombra}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M48 58h104" stroke={sombra} strokeWidth="1" opacity=".5" />
      </>
    ),
  },

  gorra: {
    zona: { x: 68, y: 66, w: 64, h: 32 },
    dibujo: (color, sombra) => (
      <>
        <path
          d="M40 108a60 60 0 0 1 120 0Z"
          fill={color}
          stroke={sombra}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M40 108h30a90 90 0 0 0 84 0h6a10 10 0 0 1 10 10v6a6 6 0 0 1-6 6H46a6 6 0 0 1-6-6Z"
          fill={sombra}
          opacity=".35"
        />
        <path d="M100 48v60" stroke={sombra} strokeWidth="0.9" opacity=".45" />
      </>
    ),
  },
};

/**
 * Una prenda con su estampado puesto.
 *
 * El estampado se recibe como una función que devuelve SVG y se le pasa el
 * cuadro donde tiene que caber. Así una misma frase vale igual para el pecho
 * de una camiseta que para el lateral de una taza sin saber nada de ninguna.
 */
export function Prenda({
  prenda,
  color,
  sombra,
  estampado,
  className,
  titulo,
}: {
  prenda: PrendaId;
  color: string;
  sombra: string;
  estampado?: (zona: { x: number; y: number; w: number; h: number }) => ReactNode;
  className?: string;
  titulo: string;
}) {
  const p = PRENDAS[prenda];
  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className={className} role="img" aria-label={titulo}>
      {p.dibujo(color, sombra)}
      {estampado?.(p.zona)}
    </svg>
  );
}
