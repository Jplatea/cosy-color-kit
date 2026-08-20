import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Las piezas de tebeo.
 *
 * Todo esto vive solo en la sala 2, que es una página de cómic dentro de un
 * museo en blanco y negro. No hay cuatricromía: la página va en tinta sobre
 * papel con el latón de acento, que es la paleta de la casa. Un tebeo antiguo
 * a dos tintas, vaya — el chiste sigue siendo el mismo contraste de siempre.
 */

/** La trama de puntos del fondo, que es lo que huele a imprenta barata. */
export const TRAMA =
  "radial-gradient(circle, rgb(var(--cyp-tinta) / .22) 1.1px, transparent 1.4px) 0 0 / 7px 7px";

/**
 * Las viñetas no son todas rectangulares: se les corta una esquina o se les
 * inclina un lado. Es lo que separa una página de cómic de una rejilla de
 * fotos, y por eso hay una forma distinta para cada una.
 *
 * Los cortes son suaves a propósito. Con ángulos más bestias las esquinas se
 * comen los bocadillos, y el bocadillo es lo que hay que leer.
 */
export const FORMAS = [
  "polygon(0 0, 100% 0, 100% 94%, 0 100%)",
  "polygon(0 6%, 100% 0, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 100%, 0 94%)",
  "polygon(4% 0, 100% 0, 96% 100%, 0 100%)",
  "polygon(0 0, 96% 0, 100% 100%, 4% 100%)",
  "polygon(0 0, 100% 6%, 100% 100%, 0 100%)",
];

/**
 * Una viñeta.
 *
 * El borde no puede ser un `border` normal: al recortar con `clip-path` se
 * recorta también el borde y desaparecen justo las esquinas en diagonal, que
 * son las que se quieren ver. Así que son dos capas con la misma forma, una de
 * tinta y otra encima tres píxeles por dentro: lo que asoma alrededor es el
 * filete.
 */
export function Vineta({
  forma,
  children,
  className,
}: {
  forma: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative bg-museo-tinta", className)}
      style={{ clipPath: forma }}
    >
      <div
        className="absolute inset-[3px] overflow-hidden bg-museo-peana"
        style={{ clipPath: forma }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Una onomatopeya: la estrella con la palabra dentro.
 *
 * Va en SVG y no en divs porque hace falta el contorno de la letra —el texto
 * lleva un trazo grueso por debajo y el relleno encima—, y eso en CSS son
 * cuatro sombras mal puestas. La estrella se dibuja con `points` calculados,
 * así que cambiar el número de puntas es cambiar un número.
 */
export function Onomatopeya({
  texto,
  className,
  giro = -12,
  puntas = 11,
}: {
  texto: string;
  className?: string;
  /** Grados de inclinación. Ninguna va recta: quedan muertas. */
  giro?: number;
  puntas?: number;
}) {
  const estrella: string[] = [];
  for (let i = 0; i < puntas * 2; i++) {
    const fuera = i % 2 === 0;
    const rx = fuera ? 50 : 36;
    const ry = fuera ? 32 : 21;
    // Un poco de irregularidad: una estrella perfecta parece un engranaje.
    const arruga = fuera ? 1 + ((i * 7) % 5) / 40 : 1;
    const a = (Math.PI * i) / puntas - Math.PI / 2;
    estrella.push(
      `${(50 + Math.cos(a) * rx * arruga).toFixed(1)},${(34 + Math.sin(a) * ry * arruga).toFixed(1)}`
    );
  }

  return (
    <svg
      viewBox="0 0 100 68"
      className={cn("pointer-events-none absolute z-[3]", className)}
      style={{ transform: `rotate(${giro}deg)` }}
      role="img"
      aria-label={texto}
    >
      <polygon
        points={estrella.join(" ")}
        fill="rgb(var(--cyp-laton))"
        stroke="rgb(var(--cyp-tinta))"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="42"
        textAnchor="middle"
        fontFamily="Bangers, Impact, sans-serif"
        fontSize="26"
        letterSpacing="1"
        stroke="rgb(var(--cyp-tinta))"
        strokeWidth="6"
        strokeLinejoin="round"
        fill="none"
      >
        {texto}
      </text>
      <text
        x="50"
        y="42"
        textAnchor="middle"
        fontFamily="Bangers, Impact, sans-serif"
        fontSize="26"
        letterSpacing="1"
        fill="rgb(var(--cyp-papel))"
      >
        {texto}
      </text>
    </svg>
  );
}

/**
 * Qué onomatopeya le toca a cada viñeta.
 *
 * No todas llevan: si las seis explotan, no explota ninguna. Van en la uno, la
 * tres y la cinco, que reparten el ruido por la página sin amontonarlo.
 */
export const RUIDOS: (
  | { texto: string; className: string; giro: number }
  | null
)[] = [
  { texto: "¡ZAS!", className: "right-[6%] top-[12%] w-[26%]", giro: 14 },
  null,
  { texto: "¡PLOF!", className: "right-[4%] bottom-[10%] w-[46%]", giro: -9 },
  null,
  { texto: "¡BOOM!", className: "left-[6%] bottom-[8%] w-[48%]", giro: 11 },
  null,
];
