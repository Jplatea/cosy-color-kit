import { Sala, SectionTitle } from "./primitives";
import { VOICES, useSpeech } from "@/hooks/useSpeech";
import { poems } from "@/config/cyp";
import { comoSeRecita } from "@/lib/voces";

/**
 * Sala 8: los textos de sala.
 *
 * Los poemas se presentan como los paneles impresos que un museo cuelga junto
 * a la obra: número romano, título en cursiva y el texto centrado con mucho
 * aire alrededor. Debajo, la única concesión: un botón para que se lo lea en
 * voz alta el que lo escribió.
 */

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export function Poemas() {
  const { speakLine } = useSpeech();

  return (
    <section id="poemas" className="px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 border-b border-museo-linea pb-8">
          <Sala n="08">Textos de sala</Sala>
          <SectionTitle className="mt-4">
            Literatura de <span className="italic text-museo-tinta-suave">dudosa utilidad</span>
          </SectionTitle>
        </div>

        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {poems.map((p, i) => (
            <article key={p.title} className="grid content-start gap-5 border-t border-museo-tinta pt-5">
              <div>
                <div className="cartela mb-[10px] text-museo-laton">{ROMANOS[i] ?? i + 1}</div>
                <h3 className="font-display text-[24px] italic leading-[1.15] text-museo-tinta">
                  {p.title}
                </h3>
              </div>

              <p className="whitespace-pre-line font-display text-[19px] leading-[1.6] text-museo-tinta-suave">
                {p.body}
              </p>

              <button
                type="button"
                // Cada verso acaba en pausa: se recita como verso, no como párrafo.
                onClick={() =>
                  speakLine({ who: p.voice, text: comoSeRecita(p.body), audio: p.audio })
                }
                className="cartela justify-self-start border-b border-museo-linea pb-[3px] text-museo-tinta-tenue transition-colors hover:border-museo-tinta hover:text-museo-tinta"
              >
                Lo lee {VOICES[p.voice].name} →
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
