import { useEffect, useState } from "react";

/**
 * El botón de volver a la entrada.
 *
 * La página mide dieciséis mil píxeles y trece salas. Desde la última, subir a
 * la portada eran cuatro segundos de rueda, y en el móvil, medio minuto de
 * pulgar. La cabecera vuelve al empezar a subir, sí, pero eso solo devuelve el
 * menú: para llegar arriba había que subir a mano igual.
 *
 * Es uno solo y flotante, no uno pegado al final de cada sala. Trece copias del
 * mismo botón serían trece sitios que mantener y, sobre todo, solo servirían al
 * llegar al borde de una sala: aquí hace falta poder subir **desde donde sea**,
 * a mitad de la tienda o del libro de visitas.
 *
 * No aparece hasta que hay algo de lo que volver. Con la portada a la vista un
 * botón de «arriba» es ruido: señala un sitio donde ya estás.
 */
export function VolverArriba() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /*
      Se enseña pasada una pantalla y media. Antes de eso, subir es un gesto
      corto y el botón estorba más de lo que ayuda.
    */
    const mirar = () => setVisible(window.scrollY > window.innerHeight * 1.5);
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    return () => window.removeEventListener("scroll", mirar);
  }, []);

  const subir = () => {
    /*
      Sube suave, salvo que el sistema pida menos movimiento: recorrer
      dieciséis mil píxeles animados marea a quien ha pedido justo lo contrario.
      Y se limpia el ancla de la barra de direcciones, que si no queda apuntando
      a una sala en la que ya no estás.
    */
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
      className={`group fixed bottom-6 right-6 z-[55] flex items-center gap-[9px] rounded-[2px] border border-museo-linea bg-museo-papel/95 px-[13px] py-[10px] text-museo-tinta shadow-[0_6px_22px_rgb(var(--cyp-tinta)/0.16)] backdrop-blur-[6px] transition-[opacity,transform] duration-300 ease-out hover:border-museo-tinta ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {/* La flecha sube un poco al pasar, que es lo que va a hacer la página. */}
      <span
        aria-hidden
        className="text-[14px] leading-none transition-transform duration-200 ease-out group-hover:-translate-y-[2px]"
      >
        ↑
      </span>
      <span className="cartela hidden sm:block">A la entrada</span>
    </button>
  );
}
