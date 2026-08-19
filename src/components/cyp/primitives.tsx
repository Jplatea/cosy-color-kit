import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Etiqueta pequeña en dorado que encabeza cada sección. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-cyp-gold">
      {children}
    </div>
  );
}

/** Titular de sección, en Bagel Fat One. */
export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("font-bagel text-[46px] leading-tight text-cyp-cream-hi", className)}>
      {children}
    </h2>
  );
}

/** Botón de selección: dorado cuando está activo, contorno tenue cuando no. */
export function chipStyle(active: boolean): CSSProperties {
  return {
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    border: `1px solid ${active ? "#e8b25c" : "rgba(242,236,226,.18)"}`,
    background: active ? "rgba(232,178,92,.14)" : "transparent",
    color: active ? "#e8b25c" : "rgba(242,236,226,.78)",
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

/** Botón principal dorado. */
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
        "rounded-[14px] bg-cyp-gold px-[26px] py-[15px] text-[15.5px] font-bold text-cyp-on-gold transition-colors hover:bg-cyp-gold-hi",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Botón secundario: solo contorno. */
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
        "rounded-[14px] border border-cyp-cream/20 px-[22px] py-[15px] text-[15.5px] font-bold text-cyp-cream transition-colors hover:border-cyp-cream",
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * Miniatura de vídeo, short o post.
 *
 * Si no hay imagen todavía, en vez de un hueco vacío pinta un marcador con la
 * silueta del foco del estudio, para que la rejilla no se caiga mientras
 * faltan las miniaturas reales.
 */
export function Thumb({
  src,
  alt,
  label,
  fallbackSrc,
}: {
  src?: string;
  alt: string;
  label?: string;
  /** Se prueba si `src` no existe en el servidor (un vertical que YouTube no generó). */
  fallbackSrc?: string;
}) {
  // YouTube devuelve 404 para las miniaturas que nunca generó, y eso solo se sabe
  // al pedirlas. Guardamos cuál estamos enseñando y bajamos un escalón al fallar:
  // principal → respaldo → marcador de posición.
  const [actual, setActual] = useState(src);
  const [previa, setPrevia] = useState(src);

  // Si cambia el vídeo (una sincronización nueva), se vuelve a empezar por la principal.
  if (previa !== src) {
    setPrevia(src);
    setActual(src);
  }

  if (actual) { 
    return (
        <img
        src={actual}
        alt={alt}
        loading="lazy"
        onError={() =>
          setActual(fallbackSrc && actual !== fallbackSrc ? fallbackSrc : undefined)
        }
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return (
    <div
      aria-label={alt}
      role="img"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
      style={{
        background:
          "radial-gradient(70% 60% at 50% 22%, rgba(255,236,205,.10), transparent 72%), #141010",
      }}
    >
      <div
        className="h-9 w-9 rounded-full"
        style={{
          background: "radial-gradient(circle at 34% 24%, #ffffff, #efe6d8 52%, #b6a998 88%)",
          opacity: 0.35,
        }}
      />
      {label && (
        <div className="px-4 text-[12.5px] leading-snug text-cyp-cream/35">{label}</div>
      )}
    </div>
  );
}
