import { useMemo, useState } from "react";
import { Cartela, GhostButton, GoldButton, Peana, Sala, SectionTitle } from "./primitives";
import { useSpeech } from "@/hooks/useSpeech";
import { laton, objeto, objetoMedio, objetoSuave, tinta } from "@/lib/color";

/**
 * Sala 8: la tasación.
 *
 * Aquí es donde el sitio enseña del todo la carta: cuatro chorradas —una
 * fregona, un ventilador roto— tratadas con ficha técnica, procedencia y
 * precio de salida en euros. Cada puja multiplica la cifra y uno de los dos
 * la comenta en voz alta, que es el único sitio donde la broma se dice.
 */

type Lote = {
  n: string;
  titulo: string;
  ficha: [string, string][];
  salida: number;
  /** Lo que suelta cada uno cuando alguien puja por este lote. */
  culow: string;
  pililarge: string;
  /** El dibujo del objeto, en formas planas: ninguna imagen. */
  arte: JSX.Element;
};

const LOTES: Lote[] = [
  {
    n: "Lote 01",
    titulo: "Fregona, sin uso aparente",
    ficha: [
      ["Técnica", "Algodón trenzado sobre palo"],
      ["Firma", "No consta"],
      ["Procedencia", "Colección particular, cocina"],
    ],
    salida: 12,
    culow: "Doce euros. Por doce euros esa fregona me tiene que fregar a mí.",
    pililarge: "¿Y si la fregona no quiere? Nadie le ha preguntado.",
    arte: (
      <g>
        <rect x="46" y="8" width="7" height="62" rx="3.5" fill={objetoMedio} />
        <path d="M30 70h40l-6 34a14 14 0 0 1-28 0Z" fill={objeto} />
        <path d="M38 74v30M50 74v32M62 74v30" stroke={tinta()} strokeWidth="1.4" opacity=".22" />
      </g>
    ),
  },
  {
    n: "Lote 02",
    titulo: "Ventilador que ya no gira",
    ficha: [
      ["Técnica", "Tres aspas, dos direcciones"],
      ["Rendimiento", "Cero viento"],
      ["Procedencia", "Herencia de un tío segundo"],
    ],
    salida: 45,
    culow: "Cuarenta y cinco. Y encima hay que soplarle tú.",
    pililarge: "A mí me da aire igual. Si me lo creo mucho.",
    arte: (
      <g>
        <rect x="45" y="72" width="10" height="32" rx="4" fill={objetoMedio} />
        <rect x="32" y="102" width="36" height="7" rx="3.5" fill={objetoMedio} />
        <circle cx="50" cy="46" r="33" fill="none" stroke={tinta()} strokeWidth="1.2" opacity=".3" />
        <g fill={objeto} stroke={tinta()} strokeOpacity=".18" strokeWidth="1">
          <ellipse cx="50" cy="29" rx="8.5" ry="16" />
          <ellipse cx="64" cy="54" rx="8.5" ry="16" transform="rotate(120 64 54)" />
          <ellipse cx="36" cy="54" rx="8.5" ry="16" transform="rotate(240 36 54)" />
        </g>
        <circle cx="50" cy="46" r="5" fill={laton()} />
      </g>
    ),
  },
  {
    n: "Lote 03",
    titulo: "Taburete jamás conquistado",
    ficha: [
      ["Técnica", "Tres patas de madera"],
      ["Historial", "Cuatro años de asedio"],
      ["Procedencia", "Sigue en su sitio"],
    ],
    salida: 90,
    culow: "Noventa euros por una silla que ha ganado una guerra. Justo.",
    pililarge: "Yo no pujo. Si lo compro, tengo que sentarme, y no sé.",
    arte: (
      <g>
        <ellipse cx="50" cy="42" rx="33" ry="10" fill={objeto} stroke={tinta()} strokeOpacity=".18" />
        <rect x="17" y="42" width="66" height="7" fill={objetoSuave} />
        <path d="M24 49 19 104M76 49l5 55M50 49v55" stroke={objetoMedio} strokeWidth="6" strokeLinecap="round" />
      </g>
    ),
  },
  {
    n: "Lote 04",
    titulo: "Silencio de Pililarge (2 min)",
    ficha: [
      ["Técnica", "Pieza sonora"],
      ["Tirada", "Original, irrepetible, inaudible"],
      ["Procedencia", "Grabado en directo, sin querer"],
    ],
    salida: 300,
    culow: "Trescientos euros por que se calle. Barato me parece.",
    pililarge: "Es lo mejor que he hecho y no me acuerdo de cómo.",
    arte: (
      <g>
        <rect x="16" y="32" width="68" height="56" fill={objeto} stroke={tinta()} strokeOpacity=".18" />
        <path d="M26 60h9l6-15 8 32 7-23 6 11h12" fill="none" stroke={tinta()} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
      </g>
    ),
  },
];

const euros = (n: number) =>
  n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function Subasta() {
  const { speak } = useSpeech();
  /** Cuántas pujas lleva cada lote, por índice. */
  const [pujas, setPujas] = useState<number[]>(() => LOTES.map(() => 0));

  /**
   * Cada puja multiplica por 2,4 y suma un pico impar, para que el número se
   * vaya de madre rápido y nunca quede redondo. Es un chiste con calculadora.
   */
  const precio = (i: number) =>
    Math.round(LOTES[i].salida * Math.pow(2.4, pujas[i]) + pujas[i] * 7);

  const pujar = (i: number) => {
    setPujas((p) => p.map((v, j) => (j === i ? v + 1 : v)));
    const l = LOTES[i];
    // Alternan: la primera puja la comenta Culow, la siguiente Pililarge.
    const who = pujas[i] % 2 === 0 ? "culow" : "pililarge";
    speak(who === "culow" ? l.culow : l.pililarge, who);
  };

  const total = useMemo(
    () => LOTES.reduce((sum, _l, i) => sum + precio(i), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pujas]
  );

  return (
    <section id="subasta" className="bg-museo-pared px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8 border-b border-museo-linea pb-8">
          <div>
            <Sala n="08">Tasación</Sala>
            <SectionTitle className="mt-4">
              Objetos sin <span className="italic text-museo-tinta-suave">ningún valor</span>
            </SectionTitle>
            <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.65] text-museo-tinta-suave">
              Cuatro piezas de la colección, tasadas con la seriedad que no merecen. Puje lo que
              quiera: no se vende nada y ellos comentan cada cifra.
            </p>
          </div>
          <div className="border-l border-museo-tinta pl-5">
            <div className="cartela text-museo-tinta-tenue">Valor de la sala</div>
            <div className="font-display text-[38px] leading-tight text-museo-tinta">
              {euros(total)}
            </div>
          </div>
        </div>

        <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {LOTES.map((l, i) => (
            /*
              Columna flexible, no rejilla: la ficha de cada lote tiene un alto
              distinto —unas procedencias ocupan dos líneas y otras una— y con
              `content-start` el precio y el botón acababan a distinta altura en
              cada tarjeta. Con `flex-1` en el bloque del medio, lo que sobra se
              lo come la ficha y la línea de precio queda a la misma altura en
              toda la fila.
            */
            <article key={l.n} className="flex h-full flex-col gap-4">
              <Peana className="h-[190px] shrink-0 rounded-[3px] border border-museo-linea pb-5 pt-5">
                <svg viewBox="0 0 100 115" className="h-[135px]" aria-hidden>
                  {l.arte}
                </svg>
              </Peana>

              <div className="flex-1 border-t border-museo-tinta pt-3">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="cartela text-museo-laton">{l.n}</span>
                  {pujas[i] > 0 && (
                    <span className="cartela text-museo-tinta-tenue">
                      {pujas[i]} {pujas[i] === 1 ? "puja" : "pujas"}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-[21px] leading-[1.2] text-museo-tinta">
                  {l.titulo}
                </h3>
                <Cartela className="mt-3" filas={l.ficha} />
              </div>

              <div className="border-t border-museo-linea pt-3">
                <div className="cartela text-museo-tinta-tenue">
                  {pujas[i] ? "Puja actual" : "Precio de salida"}
                </div>
                <div className="font-display text-[27px] leading-tight text-museo-tinta">
                  {euros(precio(i))}
                </div>
              </div>

              <GoldButton onClick={() => pujar(i)} className="w-full px-4 py-[12px] text-[13.5px]">
                Pujar
              </GoldButton>
            </article>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-5 border-t border-museo-linea pt-6">
          <GhostButton onClick={() => setPujas(LOTES.map(() => 0))} className="px-4 py-[11px] text-[13.5px]">
            Vaciar la sala
          </GhostButton>
          <p className="cartela text-museo-tinta-tenue">
            No se cobra nada · No se envía nada · No hay nada
          </p>
        </div>
      </div>
    </section>
  );
}
