import { Character } from "./Character";
import { Eyebrow, SectionTitle } from "./primitives";

const BIOS = [
  {
    char: "culow" as const,
    scale: 0.7,
    name: "Culow",
    traits: "Bajito · redondo · optimista",
    bio: "Se emociona con cualquier cosa: una piedra bonita, el ruido de la nevera. Habla rápido y agudo, y termina las frases antes de haberlas pensado. No tiene brazos pero insiste en aplaudir.",
  },
  {
    char: "pililarge" as const,
    scale: 0.47,
    name: "Pililarge",
    traits: "Alto · rígido · filosófico",
    bio: "Habla grave y despacio, como si cada frase costara dinero. Lleva años intentando sentarse. Cuando por fin dice algo, suele ser demasiado profundo para la situación.",
  },
];

export function Personajes() {
  return (
    <section id="personajes" className="bg-cyp-ink-soft px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow>Ellos dos</Eyebrow>
        <SectionTitle className="mb-10 mt-3">Quién es quién</SectionTitle>

        <div className="grid gap-6 lg:grid-cols-2">
          {BIOS.map((b) => (
            <div
              key={b.name}
              className="grid items-center gap-[26px] rounded-[24px] border border-cyp-cream/[0.09] p-[34px] sm:grid-cols-[150px_1fr]"
              style={{
                background:
                  "radial-gradient(80% 70% at 30% 10%, rgba(255,236,205,.09), transparent 70%), #141010",
              }}
            >
              <div className="flex justify-center">
                <Character char={b.char} scale={b.scale} />
              </div>
              <div>
                <div className="font-bagel text-[34px] text-cyp-cream-hi">{b.name}</div>
                <div className="mt-1 text-[13px] uppercase tracking-[0.1em] text-cyp-gold">
                  {b.traits}
                </div>
                <p className="mt-3 text-[16px] leading-[1.6] text-cyp-cream/[0.68]">{b.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
