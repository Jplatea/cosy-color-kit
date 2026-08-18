import { useState } from "react";
import { Character, type CharacterId } from "./Character";
import { Chip, Eyebrow, GhostButton, GoldButton, SectionTitle } from "./primitives";
import { METER_BARS, VOICES, useSpeech } from "@/hooks/useSpeech";
import { useNarrow } from "@/hooks/useNarrow";
import { duet, phrases } from "@/config/cyp";

export function HazlosHablar() {
  const narrow = useNarrow();
  const { speaking, speaker, setSpeaker, speak, stop, sayDialogue, meterRef, supported, assigned } =
    useSpeech();
  const [text, setText] = useState(
    "Buenas. Soy una forma blanca y hoy he descubierto la fregona."
  );
  const [pitch, setPitch] = useState(VOICES.culow.pitch);
  const [rate, setRate] = useState(VOICES.culow.rate);

  const pick = (who: CharacterId) => {
    setSpeaker(who);
    setPitch(VOICES[who].pitch);
    setRate(VOICES[who].rate);
  };

  return (
    <section id="hablar" className="relative overflow-hidden px-6 py-[100px] lg:px-10">
      <div
        className="pointer-events-none absolute -top-[140px] left-1/2 h-[600px] w-[900px] -translate-x-1/2"
        style={{
          background: "radial-gradient(50% 50% at 50% 40%, rgba(232,178,92,.13), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px]">
        <Eyebrow>Juguete nº 1</Eyebrow>
        <SectionTitle className="mb-[6px] mt-3">Hazlos hablar</SectionTitle>
        <p className="mb-[34px] max-w-[640px] text-[17px] text-cyp-cream/60">
          Escribe algo, elige quién lo dice y dale al botón. El modulador de la izquierda reacciona
          a la voz.
        </p>

        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* Escenario + modulador */}
          <div
            className="relative grid content-between gap-[22px] rounded-[24px] border border-cyp-cream/[0.09] p-[30px]"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 8%, rgba(255,236,205,.10), transparent 70%), #100c0b",
            }}
          >
            <div className="flex min-h-[280px] items-end justify-center gap-6 pt-[10px] sm:gap-11">
              {(["culow", "pililarge"] as const).map((who) => (
                <div
                  key={who}
                  className="transition-all duration-300"
                  style={{
                    opacity: speaking && speaker !== who ? 0.32 : 1,
                    transform: speaking && speaker === who ? "scale(1.04)" : "none",
                  }}
                >
                  <Character
                    char={who}
                    scale={
                      who === "culow" ? (narrow ? 0.52 : 0.72) : narrow ? 0.46 : 0.62
                    }
                    dress
                    costume="none"
                    bob={!speaking}
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="mb-[10px] flex items-center justify-between">
                <span className="text-[12.5px] uppercase tracking-[0.12em] text-cyp-cream/45">
                  Modulador
                </span>
                <span className="text-[12.5px] uppercase tracking-[0.12em] text-cyp-gold">
                  {speaking ? `${VOICES[speaker].name} hablando` : "en silencio"}
                </span>
              </div>
              <div
                ref={meterRef}
                aria-hidden
                className="flex h-[92px] items-end gap-1 px-[2px]"
              >
                {Array.from({ length: METER_BARS }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-[3px]"
                    style={{
                      height: "8%",
                      background:
                        "linear-gradient(180deg, #f6c877, #e8b25c 60%, rgba(232,178,92,.35))",
                      transition: speaking ? "none" : "height .3s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="grid content-start gap-5 rounded-[24px] border border-cyp-cream/[0.09] bg-cyp-card p-[30px]">
            <div className="grid gap-[10px]">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-cyp-cream/50">
                Quién habla
              </span>
              <div className="flex gap-[10px]">
                <Chip active={speaker === "culow"} onClick={() => pick("culow")}>
                  Culow
                </Chip>
                <Chip active={speaker === "pililarge"} onClick={() => pick("pililarge")}>
                  Pililarge
                </Chip>
              </div>
            </div>

            <div className="grid gap-[10px]">
              <label
                htmlFor="cyp-texto"
                className="text-[13px] font-semibold uppercase tracking-[0.1em] text-cyp-cream/50"
              >
                Qué dice
              </label>
              <textarea
                id="cyp-texto"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full resize-y rounded-[14px] border border-cyp-cream/[0.16] bg-cyp-ink p-4 text-[16px] leading-[1.5] text-cyp-cream outline-none focus:border-cyp-gold"
              />
              <div className="flex flex-wrap gap-2">
                {phrases.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setText(p.text)}
                    className="rounded-full border border-cyp-cream/[0.18] px-[13px] py-2 text-[13px] text-cyp-cream/[0.72] transition-colors hover:border-cyp-gold hover:text-cyp-gold"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[18px]">
              <label className="grid gap-2">
                <span className="text-[12.5px] text-cyp-cream/55">
                  Tono <b className="text-cyp-gold">{pitch.toFixed(2)}</b>
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.05}
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-cyp-gold"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[12.5px] text-cyp-cream/55">
                  Velocidad <b className="text-cyp-gold">{rate.toFixed(2)}</b>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-cyp-gold"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <GoldButton onClick={() => speak(text, speaker, pitch, rate)}>Que lo diga</GoldButton>
              <GhostButton onClick={stop}>Callar</GhostButton>
              <GhostButton onClick={() => sayDialogue(duet)}>Diálogo a dos</GhostButton>
            </div>

            <div className="grid gap-2 border-t border-cyp-cream/10 pt-4 text-[13px] leading-[1.55] text-cyp-cream/40">
              {supported ? (
                <>
                  <p>
                    Cada personaje coge una voz distinta del sistema y la frase se trocea en
                    cláusulas: Culow atropella y se acelera, Pililarge se para entre frase y frase.
                    Para que suenen como los actores de verdad, mete los clips del canal en{" "}
                    <code className="text-cyp-cream/60">public/voces/</code> y apúntalos en{" "}
                    <code className="text-cyp-cream/60">src/config/cyp.ts</code>: entonces suena el
                    audio real y el modulador dibuja su onda.
                  </p>
                  {(assigned.culow || assigned.pililarge) && (
                    <p className="text-cyp-cream/30">
                      Voces de este navegador — Culow: {assigned.culow?.name ?? "por defecto"} ·
                      Pililarge: {assigned.pililarge?.name ?? "por defecto"}
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Este navegador no tiene síntesis de voz, así que los personajes se quedan
                  callados. Prueba en Chrome, Edge o Safari.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
