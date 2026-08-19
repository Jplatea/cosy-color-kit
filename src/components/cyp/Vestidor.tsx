import { useState } from "react";
import {
  COSTUMES,
  Character,
  EXTRAS,
  GRUPOS,
  NO_EXTRAS,
  SKIN,
  SWATCHES,
  type CharacterId,
  type CostumeId,
  type Extras,
} from "./Character";
import { Chip, Eyebrow, GhostButton, GoldButton, SectionTitle } from "./primitives";
import { useNarrow } from "@/hooks/useNarrow";

export function Vestidor() {
  const narrow = useNarrow();
  const [char, setChar] = useState<CharacterId>("culow");
  const [costume, setCostume] = useState<CostumeId>("larva");
  const [color, setColor] = useState<string>(
    COSTUMES.find((c) => c.id === "larva")!.color
  );
  const [extras, setExtras] = useState<Extras>(NO_EXTRAS);

  const pickCostume = (c: (typeof COSTUMES)[number]) => {
    setCostume(c.id);
    setColor(c.color);
  };

  const randomLook = () => {
    // Solo los que tienen categoría: sorprender con «Sin disfraz» no sorprende.
    const conDisfraz = COSTUMES.filter((x) => x.grupo);
    const c = conDisfraz[Math.floor(Math.random() * conDisfraz.length)];
    const sw = SWATCHES[Math.floor(Math.random() * SWATCHES.length)];
    const ex = { ...NO_EXTRAS };
    EXTRAS.forEach((x) => {
      ex[x.id] = Math.random() > 0.65;
    });
    setChar(Math.random() > 0.5 ? "culow" : "pililarge");
    setCostume(c.id);
    setColor(sw.value);
    setExtras(ex);
  };

  const resetLook = () => {
    setCostume("none");
    setColor(SKIN);
    setExtras(NO_EXTRAS);
  };

  return (
    <section id="vestidor" className="bg-cyp-ink-soft px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow>Juguete nº 2</Eyebrow>
        <SectionTitle className="mb-[6px] mt-3">El vestidor</SectionTitle>
        <p className="mb-[34px] max-w-[640px] text-[17px] text-cyp-cream/60">
          Elige a uno, ponle un disfraz, cámbiale el color y añádele complementos. Todos los
          disfraces son parodias hechas a mano, no calcos.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Escenario */}
          <div
            className="relative flex min-h-[560px] items-end justify-center rounded-[24px] border border-cyp-cream/[0.09] px-[30px] pb-[60px] pt-10"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 6%, rgba(255,236,205,.12), transparent 72%), #100c0b",
            }}
          >
            <div
              className="absolute bottom-[44px] left-1/2 h-[90px] w-[420px] -translate-x-1/2 blur-[6px]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(255,235,205,.12), transparent 70%)",
              }}
            />
            <div className="relative z-[2]">
              <Character
                char={char}
                scale={char === "culow" ? (narrow ? 0.9 : 1.35) : narrow ? 0.8 : 1.1}
                dress
                costume={costume}
                color={color}
                extras={extras}
                bob
              />
            </div>
          </div>

          {/* Panel de control */}
          <div className="grid content-start gap-[22px] rounded-[24px] border border-cyp-cream/[0.09] bg-cyp-card p-7">
            <div className="grid gap-[10px]">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-cyp-cream/50">
                Personaje
              </span>
              <div className="flex gap-[10px]">
                <Chip active={char === "culow"} onClick={() => setChar("culow")}>
                  Culow
                </Chip>
                <Chip active={char === "pililarge"} onClick={() => setChar("pililarge")}>
                  Pililarge
                </Chip>
              </div>
            </div>

            <div className="grid gap-[10px]">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-cyp-cream/50">
                Disfraz
              </span>

              {/* "Sin disfraz" va suelto arriba: no pertenece a ninguna categoría. */}
              <div className="grid grid-cols-2 gap-[9px]">
                {COSTUMES.filter((c) => !c.grupo).map((c) => (
                  <Chip key={c.id} active={costume === c.id} onClick={() => pickCostume(c)}>
                    {c.label}
                  </Chip>
                ))}
              </div>

              {GRUPOS.map((grupo) => {
                const delGrupo = COSTUMES.filter((c) => c.grupo === grupo);
                if (!delGrupo.length) return null;
                return (
                  <div key={grupo} className="grid gap-[9px]">
                    <span className="mt-1 text-[11.5px] uppercase tracking-[0.14em] text-cyp-gold/70">
                      {grupo}
                    </span>
                    <div className="grid grid-cols-2 gap-[9px]">
                      {delGrupo.map((c) => (
                        <Chip key={c.id} active={costume === c.id} onClick={() => pickCostume(c)}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-[10px]">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-cyp-cream/50">
                Color
              </span>
              <div className="flex flex-wrap gap-[9px]">
                {SWATCHES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    title={s.name}
                    aria-label={s.name}
                    aria-pressed={color === s.value}
                    onClick={() => setColor(s.value)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      cursor: "pointer",
                      background: s.value,
                      border: `2px solid ${color === s.value ? "#e8b25c" : "rgba(242,236,226,.2)"}`,
                      boxShadow: color === s.value ? "0 0 0 3px rgba(232,178,92,.25)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-[10px]">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-cyp-cream/50">
                Complementos
              </span>
              <div className="flex flex-wrap gap-[9px]">
                {EXTRAS.map((x) => (
                  <Chip
                    key={x.id}
                    active={extras[x.id]}
                    onClick={() => setExtras((e) => ({ ...e, [x.id]: !e[x.id] }))}
                  >
                    {x.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-[10px] border-t border-cyp-cream/10 pt-[18px]">
              <GoldButton onClick={randomLook} className="px-[22px] py-[14px] text-[15px]">
                Sorpréndeme
              </GoldButton>
              <GhostButton onClick={resetLook} className="px-5 py-[14px] text-[15px]">
                Desnudarlo
              </GhostButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
