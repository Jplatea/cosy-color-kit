import { useEffect, useState } from "react";

/**
 * El botón de volver a la entrada.
 *
 * La página mide quince mil píxeles y ocho salas. Desde el final, subir a la
 * portada eran cuatro segundos de rueda y, en el móvil, medio minuto de pulgar.
 * La cabecera vuelve al empezar a subir, sí, pero eso solo devuelve el menú:
 * para llegar arriba había que subir a mano igual.
 *
 * Es uno solo y flotante, no uno pegado al final de cada sala. Ocho copias del
 * mismo botón serían ocho sitios que mantener y, sobre todo, solo servirían al
 * llegar al borde de una sala: aquí hace falta poder subir **desde donde sea**,
 * a mitad de la tienda o del libro de visitas.
 *
 * **Va en tinta, y eso es la corrección de un error.** Nació del color del
 * papel, con un filete finísimo por todo contorno: una placa de papel crema
 * sobre una pared de papel crema. Medido en la web publicada, el contraste
 * entre la placa y la pared era de **1,00** —el mismo color exacto— y el del
 * filete, 1,40, cuando un borde necesita 3 para leerse. En el móvil, además, se
 * quedaba en una flecha suelta sin texto. Estaba en la página y funcionaba, y
 * aun así no se veía, que para el visitante es lo mismo que no estar.
 *
 * En tinta sobre papel pasa de 1,00 a más de trece a uno, y sigue funcionando
 * de noche sin escribir ninguna excepción: los dos colores giran juntos al
 * bajar las luces, así que la placa se vuelve clara sobre pared oscura.
 *
 * Y no va en latón, que sería lo llamativo. El latón está reservado a lo único
 * que se vende. Un botón de servicio no le quita el color al escaparate.
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
      Sube suave, salvo que el sistema pida menos movimiento: recorrer quince
      mil píxeles animados marea a quien ha pedido justo lo contrario. Y se
      limpia el ancla de la barra de direcciones, que si no queda apuntando a
      una sala en la que ya no estás.
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
      /*
        En el móvil es un cuadrado de 48, sin texto: es el pulgar quien lo
        busca, y por debajo de 44 se falla al darle. En el ordenador se estira y
        dice adónde lleva, que ahí sobra sitio y una flecha sola no basta para
        saber si sube al principio de la sala o de la página.
      */
      className={`group fixed bottom-5 right-5 z-[55] flex h-12 w-12 items-center justify-center gap-[10px] rounded-[2px] bg-museo-tinta text-museo-papel shadow-[0_10px_30px_rgb(var(--cyp-tinta)/0.35)] transition-[opacity,transform] duration-300 ease-out sm:bottom-7 sm:right-7 sm:h-auto sm:w-auto sm:px-[17px] sm:py-[12px] ${
        visible
          ? "translate-y-0 opacity-100 hover:-translate-y-[2px]"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {/*
        Un filete de latón dentro de la placa.

        Es el remate de las cartelas del museo y aquí hace que la tinta no sea
        un rectángulo negro suelto, sino una pieza de la misma casa.
      */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[6px] top-[6px] h-px bg-museo-laton/50"
      />
      {/* La flecha sube un poco al pasar, que es lo que va a hacer la página. */}
      <span
        aria-hidden
        className="text-[17px] leading-none transition-transform duration-200 ease-out group-hover:-translate-y-[2px] sm:text-[14px]"
      >
        ↑
      </span>
      <span className="cartela hidden sm:block">A la entrada</span>
    </button>
  );
}
