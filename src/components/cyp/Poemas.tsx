import { Eyebrow, SectionTitle } from "./primitives";
import { VOICES, useSpeech } from "@/hooks/useSpeech";
import { poems } from "@/config/cyp";

export function Poemas() {
  const { speakLine } = useSpeech();

  return (
    <section id="poemas" className="px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow>Poemas absurdos</Eyebrow>
        <SectionTitle className="mb-[34px] mt-3">Literatura de dudosa utilidad</SectionTitle>

        <div className="grid gap-[22px] md:grid-cols-2 lg:grid-cols-3">
          {poems.map((p) => (
            <div
              key={p.title}
              className="grid content-start gap-4 rounded-[22px] border border-cyp-cream/[0.09] bg-cyp-card p-8"
            >
              <div className="font-bagel text-[22px] text-cyp-cream-hi">{p.title}</div>
              <div className="whitespace-pre-line text-[17px] leading-[1.75] text-cyp-cream/[0.72]">
                {p.body}
              </div>
              <button
                type="button"
                // Cada verso acaba en pausa: se recita como verso, no como párrafo.
                onClick={() =>
                  speakLine({ who: p.voice, text: p.body.replace(/\n/g, ", "), audio: p.audio })
                }
                className="justify-self-start rounded-full border border-cyp-cream/20 px-[18px] py-[11px] text-[13.5px] font-semibold text-cyp-cream/80 transition-colors hover:border-cyp-gold hover:text-cyp-gold"
              >
                Que lo recite {VOICES[p.voice].name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
