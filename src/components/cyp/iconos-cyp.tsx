/**
 * Los ocho iconos del menú, dibujados para esta casa y con guasa.
 *
 * Ninguno sale de una librería, y no es por capricho: en un menú de marca el
 * icono **es** marca. Un pictograma de camiseta genérico dice «tienda»; una
 * camiseta con el símbolo de Culow y Pililarge dice «vuestra tienda».
 *
 * Y cada uno lleva un chiste, que es lo que los separa de un juego de iconos
 * correcto. La regla es siempre la misma: **en reposo hay algo que no encaja y
 * al pasar por encima se remata**. El cuadro está torcido y se endereza; la
 * camiseta se cae de la percha; el martillo golpea y la moneda salta. Un icono
 * que solo cambia de color no cuenta nada; uno que termina una frase, sí.
 *
 * Los dos personajes aparecen dentro siempre que cabe —dos círculos pegados y
 * una cápsula alta, que es toda su silueta— así que el menú acaba contando
 * quiénes son antes de entrar en ninguna sala.
 *
 * Comparten cuadrícula de 24, trazo de 1,6 y puntas redondeadas para que se
 * lean como una familia. El color va en `currentColor`, para que la celda pueda
 * oscurecerlo al pasar sin tocar el dibujo.
 *
 * Los movimientos duran de 180 a 240 ms: lo justo para que se note que
 * responde y no tanto como para tener que esperarlo. Y viven dentro del propio
 * icono, así que la celda solo tiene que ponerse la clase `group`.
 */

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Quién es quién: los dos sobre la peana.
 *
 * El chiste es Pililarge: al pasar por encima **crece**, porque siempre puede
 * ser un poco más largo. Se estira desde los pies —`origin-bottom`— que si
 * creciera desde el centro se despegaría de la peana y parecería que flota.
 */
export const IconoPiezas = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <circle cx="7.6" cy="12.4" r="3.1" fill="currentColor" stroke="none" />
    <circle cx="10.9" cy="12.4" r="3.1" fill="currentColor" stroke="none" />
    <rect
      x="15.4"
      y="6.4"
      width="3.4"
      height="9.1"
      rx="1.7"
      fill="currentColor"
      stroke="none"
      className="origin-bottom transition-transform duration-[220ms] ease-out group-hover:scale-y-[1.28]"
    />
    <path d="M3.5 18.5h17" />
    <path d="M6 21h12" />
  </svg>
);

/**
 * Piezas breves: la tele con los dos dentro.
 *
 * Al pasar por encima **se van de la pantalla** por lados opuestos y queda el
 * triángulo de reproducir. Es un canal de piezas de quince segundos: lo suyo
 * es que se escapen antes de que acabes de mirarlos.
 */
export const IconoVideos = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <rect x="2.5" y="4.5" width="19" height="13" rx="2" />
    <g className="transition-transform duration-[240ms] ease-out group-hover:-translate-x-[6px]">
      <circle cx="8.2" cy="11" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="11" r="2.1" fill="currentColor" stroke="none" />
    </g>
    <rect
      x="14.6"
      y="7"
      width="2.4"
      height="6.2"
      rx="1.2"
      fill="currentColor"
      stroke="none"
      className="transition-transform duration-[240ms] ease-out group-hover:translate-x-[6px]"
    />
    <path
      d="M10.4 8.6l4.6 2.4-4.6 2.4z"
      fill="currentColor"
      stroke="none"
      className="opacity-0 transition-opacity duration-[220ms] delay-[80ms] ease-out group-hover:opacity-100"
    />
    <path d="M8 21h8" />
    <path d="M12 17.5V21" />
  </svg>
);

/**
 * Audioguía: el auricular y lo que dicen.
 *
 * En reposo el bocadillo tiene tres puntos, como quien está pensándoselo. Al
 * pasar por encima suelta una **exclamación**: aquí escribes algo y lo dicen
 * ellos, normalmente a gritos.
 */
export const IconoAudioguia = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M3.5 14.5v-2a8.5 8.5 0 0 1 11-8.1" />
    <rect x="2" y="13.5" width="3.6" height="5.5" rx="1.8" />
    <g className="origin-[17px_9px] transition-transform duration-[200ms] ease-out group-hover:scale-[1.12]">
      <path d="M13 3.5h8a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-4l-2.6 2.1V11.5H13A1.5 1.5 0 0 1 11.5 10V5A1.5 1.5 0 0 1 13 3.5z" />
      <g className="transition-opacity duration-150 ease-out group-hover:opacity-0">
        <circle cx="14.6" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="17" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="19.4" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
      </g>
      <g className="opacity-0 transition-opacity duration-150 delay-[90ms] ease-out group-hover:opacity-100">
        <path d="M17 5.4v2.6" />
        <circle cx="17" cy="9.7" r="0.75" fill="currentColor" stroke="none" />
      </g>
    </g>
  </svg>
);

/**
 * Vestuario: la percha con la prenda.
 *
 * Al pasar por encima **la camiseta se resbala** y la percha se queda sola.
 * Vestirlos es exactamente eso: intentarlo y que se caiga. La percha se
 * balancea del gancho, que es de donde cuelga.
 */
export const IconoVestuario = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <g className="origin-[12px_4.5px] transition-transform duration-[220ms] ease-out group-hover:rotate-[5deg]">
      <path d="M12 6.6a1.7 1.7 0 1 1 1.7-1.7" />
      <path d="M12 6.6v1.3" />
      <path d="M12 7.9 5 12.4a.9.9 0 0 0 .5 1.6h13a.9.9 0 0 0 .5-1.6L12 7.9z" />
    </g>
    <g className="transition-transform duration-[240ms] ease-out group-hover:translate-y-[5px] group-hover:rotate-[8deg]">
      <path d="M9.4 15.6h5.2v4.9H9.4z" />
      <circle cx="11" cy="17.6" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="12.1" cy="17.6" r="0.75" fill="currentColor" stroke="none" />
      <rect x="13.2" y="16.3" width="0.9" height="2.4" rx="0.45" fill="currentColor" stroke="none" />
    </g>
  </svg>
);

/**
 * Tienda: la camiseta con su etiqueta de precio.
 *
 * La etiqueta cuelga y **se balancea** al pasar por encima, como si alguien
 * acabara de soltarla. La camiseta es lo que más se vende, así que es la que va
 * aquí y no una bolsa.
 */
export const IconoTienda = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M8.8 3.2 4.4 5.6l1.5 3.4L8.2 8v12h7.6V8l2.3 1 1.5-3.4-4.4-2.4a3.3 3.3 0 0 1-6.4 0z" />
    <circle cx="10.3" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="11.7" cy="12" r="1" fill="currentColor" stroke="none" />
    <rect x="13.2" y="10.1" width="1.2" height="2.9" rx="0.6" fill="currentColor" stroke="none" />
    <g className="origin-[16.2px_6.4px] transition-transform duration-[220ms] ease-out group-hover:rotate-[16deg]">
      <path d="M16.2 6.4v2.2" />
      <path d="M15 8.6h2.6l.9 2.1-2.2 1.5-2-1.5z" />
    </g>
  </svg>
);

/**
 * ¿Cuál eres tú?: los dos y la duda en medio.
 *
 * En reposo la interrogación está centrada, sin decidirse. Al pasar por encima
 * **se inclina hacia Culow**, porque siempre acaba eligiéndose al que grita
 * más. Nadie ha pedido su opinión a la interrogación.
 */
export const IconoTest = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <circle cx="5.7" cy="15.6" r="2.8" fill="currentColor" stroke="none" />
    <circle cx="8.6" cy="15.6" r="2.8" fill="currentColor" stroke="none" />
    <rect x="17.4" y="9.9" width="3" height="8.5" rx="1.5" fill="currentColor" stroke="none" />
    <g className="origin-bottom transition-transform duration-[220ms] ease-out group-hover:-translate-x-[2px] group-hover:-rotate-[16deg]">
      <path d="M11.6 5.9a1.7 1.7 0 1 1 1.8 1.8v1.2" />
      <circle cx="13.4" cy="11.2" r="0.75" fill="currentColor" stroke="none" />
    </g>
    <path d="M3.5 20.5h17" />
  </svg>
);

/**
 * Textos de sala: el cuadro con el poema.
 *
 * Cuelga **torcido**, como en toda casa, y al pasar por encima se endereza
 * solo. Es el chiste más de museo de los ocho: nadie se resiste a enderezar un
 * cuadro torcido.
 */
export const IconoTextos = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M12 3v2" />
    <g className="origin-[12px_5px] -rotate-[7deg] transition-transform duration-[240ms] ease-out group-hover:rotate-0">
      <rect x="4" y="5" width="16" height="12" rx="1.2" />
      <path d="M7.2 9h9.6" />
      <path d="M7.2 12h6.4" />
      <path d="M7.2 14.6h3.6" />
    </g>
  </svg>
);

/**
 * Tasación: el martillo y lo que vale todo esto.
 *
 * Golpea al pasar por encima y **la moneda pega un bote**. La cartela de esa
 * sala dice «cuánto valdría todo esto. Poco», así que la moneda es una y
 * pequeña. El martillo gira desde el mango, que es como se sujeta.
 */
export const IconoTasacion = ({ className }: Props) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M3.5 20.5h13" />
    <g className="origin-[8px_14px] transition-transform duration-[200ms] ease-out group-hover:rotate-[-18deg]">
      <path d="m7.8 8.2 4.4 4.4" />
      <rect x="10.6" y="3.2" width="6.8" height="3.7" rx="1.3" transform="rotate(45 14 5.05)" />
      <path d="m7.2 8.8-3 3a1.6 1.6 0 0 0 2.3 2.3l3-3" />
    </g>
    <circle
      cx="18.4"
      cy="18.2"
      r="2.3"
      className="transition-transform duration-[200ms] delay-[110ms] ease-out group-hover:-translate-y-[3px]"
    />
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
