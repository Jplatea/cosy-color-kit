import { laton, papel, tinta } from "@/lib/color";

/**
 * La banderola de la tienda: un cartel de dibujo animado de los años treinta.
 *
 * Todo el museo va en serio —papel hueso, cartelas de catálogo, tinta negra— y
 * eso es el chiste. Pero la tienda es la sala donde el museo deja de fingir y
 * te pide dinero, así que aquí se permite un guiño: una banderola de rótulo de
 * feria, de las que en los cartoons antiguos sujetan dos manos con guante.
 *
 * El dibujo sigue las reglas de aquel estilo, que son pocas y muy concretas:
 *
 *  · **Contorno grueso y del mismo grosor en todo el trazo.** Un dibujo de los
 *    treinta se hacía a plumilla de ancho constante; el contorno que se afina
 *    en las curvas es de otra época.
 *  · **Nada recto.** La cinta ondula, las colas se abren en pico y el conjunto
 *    va ligeramente torcido. Una banderola perfectamente horizontal parece
 *    corporativa; una que cuelga un poco parece dibujada.
 *  · **Rayos de sol detrás.** El recurso de siempre para decir «mira aquí».
 *
 * Los colores salen de las variables de la sala, así que la banderola baja las
 * luces con todo lo demás y no hace falta una versión nocturna.
 */
export function Banderola({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none relative select-none" aria-hidden>
      <svg viewBox="0 0 340 118" className="h-[92px] w-[266px] overflow-visible">
        {/* Los rayos: un abanico desde detrás del centro de la cinta. */}
        <g stroke={laton(0.34)} strokeWidth="3.5" strokeLinecap="round">
          {Array.from({ length: 11 }, (_, i) => {
            // Se saltan los de en medio, que quedarían tapados por la cinta.
            const a = (-100 + i * 20) * (Math.PI / 180);
            const largo = i % 2 ? 46 : 33;
            return (
              <line
                key={i}
                x1={170 + Math.cos(a) * 62}
                y1={62 + Math.sin(a) * 34}
                x2={170 + Math.cos(a) * (62 + largo)}
                y2={62 + Math.sin(a) * (34 + largo * 0.55)}
              />
            );
          })}
        </g>

        <g transform="rotate(-2.2 170 62)">
          {/* Las colas, detrás de la cinta y un poco más oscuras. */}
          <path
            d="M40 34 L8 24 L20 47 L6 66 L40 60 Z"
            fill={laton()}
            stroke={tinta()}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M300 34 L332 24 L320 47 L334 66 L300 60 Z"
            fill={laton()}
            stroke={tinta()}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/*
            La cinta. Los bordes son curvas y no rectas: es lo que hace que
            parezca tela colgada y no una pastilla de color.
          */}
          <path
            d="M34 28 Q170 6 306 28 Q312 47 306 70 Q170 92 34 70 Q28 47 34 28 Z"
            fill={laton()}
            stroke={tinta()}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Un filete interior, como los rótulos pintados a mano. */}
          <path
            d="M46 36 Q170 17 294 36 Q299 48 294 62 Q170 81 46 62 Q41 48 46 36 Z"
            fill="none"
            stroke={papel(0.5)}
            strokeWidth="1.6"
          />
          <text
            x="170"
            y="56"
            textAnchor="middle"
            className="font-comic"
            fontSize="30"
            letterSpacing="1.5"
            fill={papel()}
            stroke={tinta()}
            strokeWidth="0.9"
            paintOrder="stroke"
          >
            {children}
          </text>
        </g>

        {/* Dos estrellitas de destello, el remate de siempre. */}
        {[
          [24, 96, 7],
          [318, 92, 5.5],
        ].map(([x, y, r], i) => (
          <path
            key={i}
            d={`M${x} ${y - r} Q${x + r * 0.22} ${y - r * 0.22} ${x + r} ${y} Q${x + r * 0.22} ${y + r * 0.22} ${x} ${y + r} Q${x - r * 0.22} ${y + r * 0.22} ${x - r} ${y} Q${x - r * 0.22} ${y - r * 0.22} ${x} ${y - r} Z`}
            fill={laton()}
            stroke={tinta()}
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}
