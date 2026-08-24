import { useEffect, useState } from "react";

/**
 * El botón de volver a la entrada: un círculo con una flecha.
 *
 * La página mide quince mil píxeles y ocho salas. Desde el final, subir a la
 * portada eran cuatro segundos de rueda y, en el móvil, medio minuto de pulgar.
 *
 * Es uno solo y flotante, no uno pegado al final de cada sala: sirve desde
 * donde sea, no solo al llegar a un borde.
 *
 * Va en tinta, no del color del papel: la primera versión tenía un contraste
 * de 1,00 contra la pared y no se veía. Sin texto ni filete, solo el círculo y
 * la flecha —un control de servicio, no una placa del museo—, para que no
 * compita con el latón que sí está reservado a lo que se vende.
 *
 * No aparece hasta que hay algo de lo que volver.
 */
export function VolverArriba() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mirar = () => setVisible(window.scrollY > window.innerHeight * 1.5);
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    return () => window.removeEventListener("scroll", mirar);
  }, []);

  const subir = () => {
    const suave = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior: suave as ScrollBehavior });
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  };

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Volver a la entrada"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-[55] flex h-11 w-11 items-center justify-center rounded-full bg-museo-tinta text-museo-papel shadow-[0_8px_22px_rgb(var(--cyp-tinta)/0.32)] transition-[opacity,transform] duration-300 ease-out sm:bottom-7 sm:right-7 ${
        visible
          ? "translate-y-0 opacity-100 hover:-translate-y-[2px]"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span aria-hidden className="text-[16px] leading-none">
        ↑
      </span>
    </button>
  );
}
