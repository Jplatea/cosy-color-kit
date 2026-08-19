/**
 * El símbolo de la marca: Culow reducido a dos esferas unidas y Pililarge a
 * una barra de esquinas blandas. Va en línea (no como <img>) para que herede
 * el color del texto y se pueda pintar en crema, dorado o negro sin duplicar
 * ficheros. La versión suelta en vectorial está en `src/assets/logo-mark.svg`.
 */
export function LogoMark({ className, title = "Culow y Pililarge" }: {
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 129 102" className={className} role="img" aria-label={title}>
      <g fill="currentColor">
        <circle cx="33" cy="64" r="27" />
        <circle cx="60" cy="64" r="27" />
        <rect x="97" y="12" width="26" height="79" rx="13" />
      </g>
    </svg>
  );
}

/** El símbolo dentro de su cuadrado, tal como se usa de avatar en el canal. */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <span
      className={
        "inline-grid place-items-center rounded-[2px] bg-museo-tinta text-museo-papel " +
        (className || "")
      }
    >
      <LogoMark className="w-[62%]" />
    </span>
  );
}
