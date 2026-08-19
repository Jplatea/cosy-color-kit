/**
 * Los logos de las tres redes, dibujados a mano.
 *
 * Vive aparte porque los usan dos secciones —la entrada y las otras sedes— y
 * antes estaban duplicados. Van en `currentColor`, así que heredan la tinta de
 * la sala y valen igual sobre papel que sobre negro; y son trazados propios,
 * no imágenes descargadas, para que ninguna red imponga su color corporativo
 * dentro de una exposición que es entera en blanco y negro.
 */

type Props = { className?: string };

export function IconoYouTube({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" role="img" aria-label="YouTube">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

export function IconoTikTok({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" role="img" aria-label="TikTok">
      <path d="M16.6 5.8a5.4 5.4 0 0 1-1.3-3.3h-3.1v13.1a2.7 2.7 0 1 1-2-2.6V9.8a5.9 5.9 0 1 0 5.1 5.8V9.2a8.5 8.5 0 0 0 5 1.6V7.7a5.4 5.4 0 0 1-3.7-1.9Z" />
    </svg>
  );
}

export function IconoInstagram({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      role="img"
      aria-label="Instagram"
    >
      <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const ICONOS = {
  youtube: IconoYouTube,
  tiktok: IconoTikTok,
  instagram: IconoInstagram,
} as const;

export type RedId = keyof typeof ICONOS;
