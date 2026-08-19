/**
 * Los colores de la sala, para cuando hay que escribirlos a mano.
 *
 * Casi todo el sitio se pinta con clases de Tailwind (`text-museo-tinta`), que
 * ya salen de las variables de `index.css` y cambian solas de día a noche. Pero
 * quedan sitios donde el color se calcula —el mapa tiñe cada país según sus
 * visitas— o donde va dentro de un SVG. Para esos está esto: la misma variable,
 * escrita desde JavaScript, en vez de un hexadecimal clavado que se quedaría
 * negro al bajar las luces.
 */

/** La tinta de la sala, opcionalmente con transparencia (`tinta(.18)`). */
export const tinta = (alfa?: number) =>
  alfa === undefined ? "rgb(var(--cyp-tinta))" : `rgb(var(--cyp-tinta) / ${alfa})`;

/** El papel: el fondo de la página. */
export const papel = (alfa?: number) =>
  alfa === undefined ? "rgb(var(--cyp-papel))" : `rgb(var(--cyp-papel) / ${alfa})`;

/** El latón: el único color de la sala además del blanco y el negro. */
export const laton = (alfa?: number) =>
  alfa === undefined ? "rgb(var(--cyp-laton))" : `rgb(var(--cyp-laton) / ${alfa})`;

/** Los tonos de los objetos dibujados (la fregona, el ventilador, el taburete). */
export const objeto = "var(--cyp-objeto)";
export const objetoMedio = "var(--cyp-objeto-medio)";
export const objetoSuave = "var(--cyp-objeto-suave)";
