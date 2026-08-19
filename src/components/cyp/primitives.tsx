import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Las piezas sueltas de la sala.
 *
 * Todo el sitio se monta con esto: un número de sala, un titular en serif, un
 * filete, una cartela y dos botones. Si algo aquí cambia, cambia el museo
 * entero, que es exactamente lo que se quiere.
 */

/** La chapita de sala: «Sala 03 · Proyecciones». */
export function Sala({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-museo-tinta-45">
      <span className="cartela text-museo-laton">Sala {n}</span>
      <span className="h-px w-8 bg-museo-linea" />
      <span className="cartela">{children}</span>
    </div>
  );
}

/** Se mantiene el nombre antiguo para no tocar las secciones que ya lo usan. */
export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div className="cartela text-museo-laton">{children}</div>
);

/** Titular de sección, en serif de catálogo. */
export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-display text-[42px] font-normal leading-[1.05] tracking-[-0.015em] text-museo-tinta sm:text-[54px]",
        className
      )}
    >
      {children}
    </h2>
  );
}

/** El filete que separa una sala de la siguiente. */
export const Filete = ({ className }: { className?: string }) => (
  <hr className={cn("border-0 border-t border-museo-linea", className)} />
);

/**
 * La cartela de museo: la ficha en letra diminuta que se pega al lado de la
 * pieza. Cada fila es un par etiqueta/valor.
 */
export function Cartela({
  filas,
  className,
}: {
  filas: [string, ReactNode][];
  className?: string;
}) {
  return (
    /*
      La columna de etiquetas se mide sola (`auto`) en vez de llevar un ancho
      fijo. Con un ancho fijo, una etiqueta larga con el interletrado de cartela
      —«CONSERVACIÓN»— se salía de su columna y se montaba encima del valor.
      Midiéndola, la columna crece hasta la etiqueta más larga de esa ficha y no
      se solapa nada; `whitespace-nowrap` evita además que una etiqueta de dos
      palabras parta por la mitad.
    */
    <dl className={cn("grid gap-[7px]", className)}>
      {filas.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[auto_1fr] items-baseline gap-x-4">
          <dt className="cartela whitespace-nowrap text-museo-tinta-45">{k}</dt>
          <dd className="text-[14px] leading-[1.45] text-museo-tinta-70">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * La peana: el rectángulo de piedra clara donde se apoyan las piezas. Las
 * figuras son casi blancas, así que sin este fondo desaparecerían en la pared.
 */
export function Peana({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("relative flex items-end justify-center overflow-hidden", className)}
      style={{
        background:
          "linear-gradient(176deg, #efe9de 0%, #e4ddd1 62%, #d8d0c2 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Botón de selección: relleno de tinta cuando está activo, filete cuando no. */
export function chipStyle(active: boolean): CSSProperties {
  return {
    padding: "10px 15px",
    borderRadius: 2,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: ".02em",
    border: `1px solid ${active ? "#14120f" : "rgba(20,18,15,.18)"}`,
    background: active ? "#14120f" : "transparent",
    color: active ? "#f7f4ef" : "rgba(20,18,15,.7)",
    transition: "all .18s ease",
  };
}

export function Chip({
  active,
  onClick,
  children,
  title,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children?: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      style={chipStyle(active)}
      className={className}
    >
      {children}
    </button>
  );
}

/** Botón principal: tinta sólida, esquinas casi rectas. */
export function GoldButton({
  children,
  onClick,
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "rounded-[2px] bg-museo-tinta px-[24px] py-[13px] text-[14px] font-medium tracking-[0.01em] text-museo-papel transition-colors hover:bg-museo-laton",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Botón secundario: solo filete. */
export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[2px] border border-museo-linea px-[20px] py-[13px] text-[14px] font-medium text-museo-tinta-70 transition-colors hover:border-museo-tinta hover:text-museo-tinta",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Enlace con el filete debajo, como una referencia de catálogo. */
export function LinkRule({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={cn(
        "cartela border-b border-museo-tinta pb-[3px] text-museo-tinta transition-colors hover:border-museo-laton hover:text-museo-laton",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Marco de pared.
 *
 * Los fotogramas del canal son escenas oscuras: medidos uno a uno, en la
 * mayoría solo entre el 10 % y el 25 % de la altura tiene luz, y esa franja cae
 * un poco por debajo del centro. Colgados a pelo sobre papel hueso quedaban
 * como cuatro rectángulos negros, así que van montados como una fotografía:
 * pasepartú de pared, filete finísimo alrededor y una sombra corta debajo, que
 * es lo que separa «cuadro» de «agujero».
 */
export function Marco({
  children,
  compacto = false,
  className,
}: {
  children: ReactNode;
  /** Marco pequeño: el pasepartú se estrecha para no comerse la imagen. */
  compacto?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-museo-linea bg-museo-pared transition-shadow",
        compacto
          ? "p-[6px] shadow-[0_8px_18px_-14px_rgba(20,18,15,.5)] group-hover:shadow-[0_12px_24px_-14px_rgba(20,18,15,.55)]"
          : "p-[11px] shadow-[0_14px_30px_-22px_rgba(20,18,15,.55)] group-hover:shadow-[0_20px_40px_-20px_rgba(20,18,15,.6)]",
        className
      )}
    >
      <div className="relative overflow-hidden bg-museo-peana">{children}</div>
    </div>
  );
}

/** Lo que `npm run sync:youtube` mide de cada miniatura. */
export type Encuadre = {
  /** Qué parte de la altura ocupan los personajes, de 0 a 1. */
  banda?: number;
  /** A qué altura está el centro de esa franja, de 0 a 1. */
  centro?: number;
  /** Proporción de la miniatura (ancho ÷ alto). */
  ratio?: number;
};

/**
 * Miniatura de una proyección.
 *
 * El acercamiento no es fijo: cada foto se coloca con lo que se midió de ella
 * al sincronizar. La regla es una sola —los personajes tienen que salir
 * enteros— y de ahí sale todo:
 *
 *   · Se calcula cuánto habría que ampliar la foto para que la franja donde
 *     están los muñecos llene el alto del marco, y cuánto para que la foto
 *     llene el ancho. Se coge la menor de las dos: la primera nunca corta a
 *     nadie, y la segunda evita ampliar de más y sacar una foto borrosa.
 *   · Después se desplaza hasta que el centro de esa franja cae en el centro
 *     del marco.
 *
 * En la práctica, un vídeo con los muñecos pequeños en mitad de una escena
 * negra se acerca hasta llenar el marco, y uno que ya llena el cuadro se queda
 * entero con paspartú a los lados. Nunca se corta una cabeza.
 *
 * Sin medidas —una miniatura nueva, o el fichero sin sincronizar— se recorta
 * centrado, que es lo de siempre.
 */
export function Thumb({
  src,
  alt,
  label,
  encuadre,
  caja,
}: {
  src?: string;
  alt: string;
  label?: string;
  encuadre?: Encuadre;
  /** Proporción del marco (ancho ÷ alto). Hace falta para calcular el zoom. */
  caja?: number;
}) {
  if (src) {
    const { banda, centro = 0.5, ratio } = encuadre || {};

    if (banda && ratio && caja) {
      // Alto de la foto, en % del alto del marco.
      const paraLlenarElAncho = caja / ratio;
      const paraQueQuepanLosMuñecos = 1 / banda;
      const alto = Math.min(paraLlenarElAncho, paraQueQuepanLosMuñecos) * 100;

      // Se sube o se baja hasta centrar la franja; si la foto no sobra por
      // arriba y por abajo, simplemente se centra.
      const arriba =
        alto <= 100
          ? (100 - alto) / 2
          : Math.min(0, Math.max(100 - alto, 50 - centro * alto));

      return (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute left-1/2 max-w-none -translate-x-1/2"
          style={{ height: `${alto}%`, width: "auto", top: `${arriba}%` }}
        />
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );
  }
  return (
    <div
      aria-label={alt}
      role="img"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
      style={{ background: "linear-gradient(176deg,#efe9de,#ded6c8)" }}
    >
      <div className="h-8 w-8 rounded-full bg-museo-tinta/10" />
      {label && <div className="cartela px-4 text-museo-tinta-45">{label}</div>}
    </div>
  );
}
