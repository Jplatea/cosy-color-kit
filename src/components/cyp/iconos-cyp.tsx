/**
 * Los seis iconos del menú, dibujados para esta casa.
 *
 * Ninguno sale de una librería, y no es por capricho: en un menú de marca el
 * icono **es** marca. Un pictograma de camiseta genérico dice «tienda»; una
 * camiseta con el símbolo de Culow y Pililarge dice «vuestra tienda». Son cinco
 * minutos de dibujo y la diferencia entre parecer una plantilla y no parecerlo.
 *
 * Los dos personajes aparecen dentro siempre que tiene sentido —dos círculos
 * pegados y una cápsula alta, que es toda su silueta— así que el menú acaba
 * contando quiénes son antes incluso de que se entre en ninguna sala.
 *
 * Comparten cuadrícula de 24, trazo de 1,4 y puntas redondeadas para que se
 * lean como una familia. El color no se decide aquí: va en `currentColor`, y
 * así la celda puede oscurecerlo al pasar por encima sin tocar el dibujo.
 *
 * **La animación va dentro del propio icono**, en las piezas marcadas con
 * `.mueve`. La celda solo tiene que ponerse la clase `group` y el movimiento
 * ocurre solo. Son de 180 a 220 ms: lo justo para que se note que responde y
 * no tanto como para tener que esperarlo.
 */

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Quién es quién: los dos, de pie sobre su peana.
 *
 * Al pasar por encima se asoman un poco, que es lo que hacen las dos figuras
 * en el hero de la web. Se mueven ellos, no la peana: una peana que flota
 * quedaría ridícula.
 */
export const IconoPiezas = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <g className="origin-bottom transition-transform duration-200 ease-out group-hover:-translate-y-[1.2px]">
      <circle cx="7.6" cy="12.4" r="3.1" fill="currentColor" stroke="none" />
      <circle cx="10.9" cy="12.4" r="3.1" fill="currentColor" stroke="none" />
      <rect x="15.4" y="6.4" width="3.4" height="9.1" rx="1.7" fill="currentColor" stroke="none" />
    </g>
    <path d="M3.5 18.5h17" />
    <path d="M6 21h12" />
  </svg>
);

/**
 * Piezas breves: la tele, con los dos dentro.
 *
 * El triángulo de reproducir no está hasta que se pasa por encima. Antes había
 * dos cosas dentro de la pantalla peleándose por el sitio; así la pantalla se
 * lee primero y el play llega como respuesta.
 */
export const IconoVideos = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <rect x="2.5" y="4.5" width="19" height="13" rx="2" />
    <g className="transition-opacity duration-200 ease-out group-hover:opacity-0">
      <circle cx="9.4" cy="12" r="2.3" fill="currentColor" stroke="none" />
      <circle cx="11.8" cy="12" r="2.3" fill="currentColor" stroke="none" />
      <rect x="14.8" y="7.6" width="2.6" height="6.7" rx="1.3" fill="currentColor" stroke="none" />
    </g>
    <path
      d="M10 8.6l5 2.4-5 2.4z"
      fill="currentColor"
      stroke="none"
      className="opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
    />
    <path d="M8 21h8" />
    <path d="M12 17.5V21" />
  </svg>
);

/**
 * Audioguía: el auricular de sala y lo que dicen.
 *
 * El bocadillo se hincha al pasar por encima. Es la sección donde uno escribe
 * algo y los personajes lo dicen con su voz, así que el icono tenía que llevar
 * el habla y no solo el aparato.
 */
export const IconoAudioguia = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M3.5 14.5v-2a8.5 8.5 0 0 1 12-7.7" />
    <rect x="2" y="13.5" width="3.6" height="5.5" rx="1.8" />
    <g className="origin-[16px_9px] transition-transform duration-200 ease-out group-hover:scale-110">
      <path d="M13.5 4.5h7.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-3.5l-2.5 2v-2h-1.5a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5z" />
    </g>
  </svg>
);

/**
 * Vestuario: la percha con la prenda y su símbolo.
 *
 * Se balancea un grado al pasar por encima, colgando del gancho. Una percha
 * que se mueve desde el centro no se lee como percha.
 */
export const IconoVestuario = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <g className="origin-[12px_5px] transition-transform duration-200 ease-out group-hover:rotate-[3deg]">
      <path d="M12 7.2a1.8 1.8 0 1 1 1.8-1.8" />
      <path d="M12 7.2v1.4" />
      <path d="M12 8.6 4.6 13.4a.9.9 0 0 0 .5 1.6h13.8a.9.9 0 0 0 .5-1.6L12 8.6z" />
      <circle cx="10.4" cy="13.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="11.8" cy="13.2" r="1" fill="currentColor" stroke="none" />
      <rect x="13.3" y="11.3" width="1.2" height="2.8" rx="0.6" fill="currentColor" stroke="none" />
    </g>
    <path d="M6 18.5h12" />
  </svg>
);

/**
 * Tienda: la camiseta con el símbolo al pecho.
 *
 * Se inclina un grado, como si alguien la levantara de la percha. La camiseta
 * es lo que más se vende, así que es la que va en el icono y no una bolsa.
 */
export const IconoTienda = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <g className="origin-center transition-transform duration-200 ease-out group-hover:rotate-[-3deg]">
      <path d="M8.8 3.2 4.4 5.6l1.5 3.4L8.2 8v12h7.6V8l2.3 1 1.5-3.4-4.4-2.4a3.3 3.3 0 0 1-6.4 0z" />
      <circle cx="10.3" cy="11.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="11.7" cy="11.6" r="1" fill="currentColor" stroke="none" />
      <rect x="13.2" y="9.7" width="1.2" height="2.9" rx="0.6" fill="currentColor" stroke="none" />
    </g>
  </svg>
);

/**
 * ¿Cuál eres tú?: los dos y una interrogación en medio.
 *
 * La interrogación sube y baja al pasar por encima. Es un test de dos
 * opciones, así que el icono son las dos opciones: no hay forma más corta de
 * decirlo.
 */
export const IconoTest = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <circle cx="5.9" cy="15.4" r="2.9" fill="currentColor" stroke="none" />
    <circle cx="8.9" cy="15.4" r="2.9" fill="currentColor" stroke="none" />
    <rect x="17.2" y="9.6" width="3.2" height="8.7" rx="1.6" fill="currentColor" stroke="none" />
    <g className="transition-transform duration-200 ease-out group-hover:-translate-y-[1.5px]">
      <path d="M12.1 6.1a1.7 1.7 0 1 1 1.8 1.8v1.3" />
      <circle cx="13.9" cy="11.6" r="0.75" fill="currentColor" stroke="none" />
    </g>
    <path d="M3.5 20.5h17" />
  </svg>
);

/**
 * Textos de sala: la cartela colgada, con su renglón escrito.
 *
 * Al pasar por encima se subraya la primera línea, como si alguien la
 * estuviera leyendo. Es la sala de los poemas: el gesto es leer.
 */
export const IconoTextos = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="M7 10h10" className="transition-[stroke-width] duration-200 ease-out group-hover:[stroke-width:2.2]" />
    <path d="M7 13.5h6" />
  </svg>
);

/**
 * Tasación: el martillo del subastador, que golpea al pasar por encima.
 *
 * Gira desde el mango y no desde el centro, que es como se sujeta. Un martillo
 * que pivota por su cabeza no parece un martillo.
 */
export const IconoTasacion = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M4.5 20.5h11" />
    <g className="origin-[9px_15px] transition-transform duration-200 ease-out group-hover:rotate-[-14deg]">
      <path d="m8.6 8.4 4.6 4.6" />
      <rect x="11.4" y="3.1" width="7.2" height="3.9" rx="1.4" transform="rotate(45 15 5.05)" />
      <path d="m8 9 -3.2 3.2a1.7 1.7 0 0 0 2.4 2.4L10.4 11.4" />
    </g>
  </svg>
);

export const ICONOS_CYP = {
  piezas: IconoPiezas,
  videos: IconoVideos,
  audioguia: IconoAudioguia,
  vestuario: IconoVestuario,
  tienda: IconoTienda,
  test: IconoTest,
  textos: IconoTextos,
  tasacion: IconoTasacion,
} as const;

export type IconoCyp = keyof typeof ICONOS_CYP;
