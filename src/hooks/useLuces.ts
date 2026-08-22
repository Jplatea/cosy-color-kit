import { useCallback, useSyncExternalStore } from "react";

/**
 * Las luces de la sala.
 *
 * El museo abre de día —papel hueso y tinta negra— y de noche baja las luces:
 * mismo sitio, mismas piezas, con los focos puestos. Toda la paleta vive en
 * variables CSS, así que encender o apagar es poner o quitar una clase.
 *
 * El estado es uno solo para toda la página, no uno por componente: el
 * interruptor está en la cabecera pero la cabecera también lee si es de noche,
 * y con un `useState` por sitio cada uno se habría enterado por su cuenta —o
 * no se habría enterado—. Aquí hay un único valor y quien quiera se suscribe.
 *
 * **El museo abre de día.** Siempre, aunque el móvil esté en modo oscuro. La
 * sala es de papel hueso y tinta negra y esa es la primera impresión que tiene
 * que dar; seguir al sistema hacía que media visita entrara de noche sin
 * haberlo pedido. Quien quiera la noche le da al interruptor, y entonces sí se
 * recuerda para las siguientes visitas.
 *
 * La clase se pone también en `index.html` antes de pintar nada, para que no
 * haya un fogonazo blanco al cargar de noche.
 */

export type Luces = "dia" | "noche";

const CLAVE = "cyp:luces";

/** Lo que dejó puesto el script de `index.html` antes de que React arrancara. */
function leerDelDocumento(): Luces {
  if (typeof document === "undefined") return "dia";
  return document.documentElement.classList.contains("noche") ? "noche" : "dia";
}

let luces: Luces = leerDelDocumento();
const suscritos = new Set<() => void>();

function aplicar(siguiente: Luces) {
  luces = siguiente;
  document.documentElement.classList.toggle("noche", siguiente === "noche");
  // La barra del navegador en el móvil se pinta con esto: si no se actualiza,
  // queda una franja blanca encima de una página oscura.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", siguiente === "noche" ? "#14110f" : "#f7f4ef");
  suscritos.forEach((avisar) => avisar());
}

const suscribir = (avisar: () => void) => {
  suscritos.add(avisar);
  return () => void suscritos.delete(avisar);
};

export function useLuces() {
  const actual = useSyncExternalStore(
    suscribir,
    () => luces,
    () => "dia" as Luces
  );

  const cambiar = useCallback(() => {
    const siguiente: Luces = luces === "dia" ? "noche" : "dia";
    aplicar(siguiente);
    try {
      localStorage.setItem(CLAVE, siguiente);
    } catch {
      /* sin almacenamiento el cambio vale para esta visita y ya está */
    }
  }, []);

  return { luces: actual, cambiar, esDeNoche: actual === "noche" };
}
