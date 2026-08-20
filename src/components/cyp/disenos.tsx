import type { ReactNode } from "react";

/**
 * Los estampados.
 *
 * Cada uno se dibuja dentro del cuadro que le da la prenda, sin saber en cuál
 * está: la misma frase vale para el pecho de una camiseta o para el lateral de
 * una taza. Por eso todo va en porcentajes de esa zona y no en medidas fijas.
 *
 * El texto se parte a mano en líneas en vez de dejar que fluya: en SVG no hay
 * ajuste de línea automático, y de paso el corte es una decisión de diseño y no
 * lo que decida el navegador de turno.
 */

export type Zona = { x: number; y: number; w: number; h: number };

export type DisenoId = "simbolo" | "brazos" | "sentarme" | "lujo" | "rotulo";

export type Diseno = {
  nombre: string;
  /** Cómo se describe en la ficha del producto. */
  descripcion: string;
  dibujar: (z: Zona, tinta: string) => ReactNode;
};

/** El símbolo: las dos esferas de Culow y la barra de Pililarge. */
function simbolo(z: Zona, tinta: string, escala = 1) {
  // El símbolo original mide 129×102; se encaja centrado en la zona.
  const k = (Math.min(z.w / 129, z.h / 102) * escala);
  const w = 129 * k;
  const h = 102 * k;
  const x = z.x + (z.w - w) / 2;
  const y = z.y + (z.h - h) / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill={tinta}>
      <circle cx="33" cy="64" r="27" />
      <circle cx="60" cy="64" r="27" />
      <rect x="97" y="12" width="26" height="79" rx="13" />
    </g>
  );
}

/** Un bloque de líneas centradas, ajustado para llenar el ancho de la zona. */
function lineas(
  z: Zona,
  tinta: string,
  filas: string[],
  opciones: { fuente?: string; peso?: number; interletra?: number; alto?: number } = {}
) {
  const {
    // Bangers, la misma rotulación que va impresa en la prenda: lo que se ve
    // aquí tiene que ser lo que llega a casa del cliente.
    fuente = "Bangers, Impact, sans-serif",
    peso = 400,
    interletra = 0.04,
    alto = 1.16,
  } = opciones;
  // El cuerpo sale de lo que quepa: manda la línea más larga o el alto total.
  const masLarga = Math.max(...filas.map((f) => f.length), 1);
  // Bangers es estrecha: cada letra ocupa poco menos de la mitad del cuerpo.
  const porAncho = z.w / (masLarga * (0.44 + interletra));
  const porAlto = z.h / (filas.length * alto);
  const cuerpo = Math.min(porAncho, porAlto);
  const primeraY = z.y + z.h / 2 - ((filas.length - 1) * cuerpo * alto) / 2 + cuerpo * 0.34;
  return (
    <g fill={tinta} fontFamily={fuente} fontWeight={peso} textAnchor="middle">
      {filas.map((f, i) => (
        <text
          key={f + i}
          x={z.x + z.w / 2}
          y={primeraY + i * cuerpo * alto}
          fontSize={cuerpo}
          letterSpacing={cuerpo * interletra}
        >
          {f}
        </text>
      ))}
    </g>
  );
}

export const DISENOS: Record<DisenoId, Diseno> = {
  simbolo: {
    nombre: "El símbolo",
    descripcion: "Las dos figuras reducidas a su silueta, grandes y solas.",
    dibujar: (z, tinta) => simbolo(z, tinta, 0.92),
  },

  rotulo: {
    nombre: "El rótulo",
    descripcion: "El símbolo con el nombre debajo, como la placa de la entrada.",
    dibujar: (z, tinta) => (
      <>
        {simbolo({ ...z, h: z.h * 0.6 }, tinta, 0.8)}
        {lineas({ x: z.x, y: z.y + z.h * 0.68, w: z.w, h: z.h * 0.22 }, tinta, ["CULOW & PILILARGE"], {
          interletra: 0.1,
        })}
      </>
    ),
  },

  brazos: {
    nombre: "Sin brazos",
    descripcion: "«Culow no tiene brazos y aún así señala», en letra de cartela.",
    dibujar: (z, tinta) =>
      lineas(z, tinta, ["CULOW NO TIENE BRAZOS", "Y AÚN ASÍ SEÑALA"]),
  },

  sentarme: {
    nombre: "Cuatro años",
    descripcion: "«Llevo cuatro años intentando sentarme». Lo dice Pililarge.",
    dibujar: (z, tinta) =>
      lineas(z, tinta, ["LLEVO CUATRO AÑOS", "INTENTANDO", "SENTARME"]),
  },

  lujo: {
    nombre: "Lujo estúpido",
    descripcion: "Dos palabras en serif de catálogo. No hace falta más.",
    dibujar: (z, tinta) =>
      lineas(z, tinta, ["Lujo", "estúpido"], {
        // El único que no va rotulado: el chiste del lujo pide serif.
        fuente: "'Instrument Serif', Georgia, serif",
        interletra: 0.01,
        alto: 0.98,
      }),
  },
};

export const ORDEN_DISENOS: DisenoId[] = ["simbolo", "rotulo", "brazos", "sentarme", "lujo"];
