import { useRef } from "react";
import { Character } from "./Character";
import { muestraDe } from "@/lib/voces";
import { Cartela, Peana, Sala, SectionTitle } from "./primitives";

/**
 * Sala 3: el estudio de las dos piezas.
 *
 * Aquí van los textos largos, los que en un museo cuelgan en un panel al lado
 * de la obra y nadie lee entero. La gracia está en el tono: se describe a un
 * tipo bajito y basto con el vocabulario de una ficha de conservación.
 */

const PIEZAS = [
  {
    char: "culow" as const,
    n: "01",
    nombre: "Culow",
    epigrafe: "Bajito · redondo · basto",
    texto:
      "Dos lóbulos esféricos unidos por su punto de tangencia. Voz grave y modales de bar a las tres de la tarde: contesta antes de que le pregunten, se ríe de sus propios chistes y no pide perdón por nada. Carece de extremidades superiores, lo que no le ha impedido nunca señalar a nadie.",
    filas: [
      ["Función", "Empezar los problemas"],
      ["Registro", "Grave, atropellado"],
      ["Conservación", "Excelente. Preocupa"],
    ] as [string, string][],
  },
  {
    char: "pililarge" as const,
    n: "02",
    nombre: "Pililarge",
    epigrafe: "Alto · inocente · un poco tonto",
    texto:
      "Volumen capsular de eje vertical, sin articulación conocida. Voz aguda y cero maldad: se cree todo lo que le cuenta Culow, incluso cuando Culow se está riendo mientras se lo cuenta. Lleva cuatro años intentando sentarse en un taburete y sostiene que va por buen camino.",
    filas: [
      ["Función", "Creerse lo anterior"],
      ["Registro", "Agudo, a trocitos"],
      ["Conservación", "De pie desde 2024"],
    ] as [string, string][],
  },
];

/**
 * El botón de oírlos. Suena la grabación de verdad, no el sintetizador: aquí
 * no se trata de que digan nada concreto, sino de saber cómo suenan. Solo
 * aparece si hay muestra puesta.
 */
function Escuchar({ quien, nombre }: { quien: "culow" | "pililarge"; nombre: string }) {
  const url = muestraDe(quien);
  const audio = useRef<HTMLAudioElement | null>(null);
  if (!url) return null;

  const sonar = () => {
    // Se para lo que hubiera sonando antes, incluida la otra ficha.
    document.querySelectorAll("audio[data-muestra]").forEach((a) => {
      const el = a as HTMLAudioElement;
      el.pause();
      el.currentTime = 0;
    });
    window.speechSynthesis?.cancel();
    void audio.current?.play();
  };

  return (
    <>
      <audio ref={audio} src={url} preload="none" data-muestra />
      <button
        type="button"
        onClick={sonar}
        className="cartela mt-4 inline-flex items-center gap-2 border-b border-museo-linea pb-[3px] text-museo-tinta-tenue transition-colors hover:border-museo-tinta hover:text-museo-tinta"
      >
        <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]" fill="currentColor" aria-hidden>
          <path d="M2 1l9 5-9 5z" />
        </svg>
        Así suena {nombre}
      </button>
    </>
  );
}

export function Personajes() {
  return (
    <section id="personajes" className="bg-museo-pared px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 border-b border-museo-linea pb-8">
          <Sala n="03">Estudio de las piezas</Sala>
          <SectionTitle className="mt-4">Quién es quién</SectionTitle>
        </div>

        <div className="grid gap-x-[52px] gap-y-14 md:grid-cols-2">
          {PIEZAS.map((p) => (
            <article key={p.nombre} className="grid gap-6 sm:grid-cols-[170px_1fr] sm:items-start">
              <Peana className="h-[210px] rounded-[3px] pb-6 pt-5">
                <Character char={p.char} scale={p.char === "culow" ? 0.5 : 0.33} />
              </Peana>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="cartela text-museo-laton">{p.n}</span>
                  <h3 className="font-display text-[32px] leading-none text-museo-tinta">
                    {p.nombre}
                  </h3>
                </div>
                <div className="cartela mt-[10px] text-museo-tinta-tenue">{p.epigrafe}</div>
                <p className="mt-4 text-[15.5px] leading-[1.65] text-museo-tinta-suave">{p.texto}</p>
                <Cartela className="mt-5 border-t border-museo-linea pt-4" filas={p.filas} />
                <Escuchar quien={p.char} nombre={p.nombre} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
