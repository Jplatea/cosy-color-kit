import { useState } from "react";
import { Character, type CharacterId } from "./Character";
import { Chip, GhostButton, GoldButton, Peana, Sala, SectionTitle } from "./primitives";
import { METER_BARS, VOICES, useSpeech } from "@/hooks/useSpeech";
import { useNarrow } from "@/hooks/useNarrow";
import { duet, phrases } from "@/config/cyp";
import { tinta } from "@/lib/color";

/**
 * Sala 5: la audioguía.
 *
 * Es el mismo juguete de siempre —escribes algo y lo dice el que elijas— pero
 * presentado como el aparato que te dan en la entrada de un museo: un cacharro
 * con su número de pista, su aguja de nivel y sus instrucciones de uso. El
 * medidor se dibuja con barras finas de tinta en vez de con luces de discoteca.
 */
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
    <section id="hablar" className="px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 border-b border-museo-linea pb-8">
          <Sala n="05">Audioguía</Sala>
          <SectionTitle className="mt-4">
            Que hablen <span className="italic text-museo-tinta-suave">las piezas</span>
          </SectionTitle>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-museo-tinta-suave">
            Escriba lo que quiera oír, elija a cuál de los dos se lo pone en la boca y pulse.
            El aparato es gratuito y no hay que devolverlo.
          </p>
        </div>

        <div className="grid items-stretch gap-[26px] lg:grid-cols-2">
          {/* El aparato: vitrina arriba, aguja de nivel abajo. */}
          <div className="border border-museo-linea bg-museo-pared">
            <Peana className="h-[290px] px-6 pb-8 pt-6">
              <div className="flex items-end gap-7 sm:gap-12">
                {(["culow", "pililarge"] as const).map((who) => (
                  <div
                    key={who}
                    className="transition-all duration-300"
                    style={{
                      opacity: speaking && speaker !== who ? 0.34 : 1,
                      transform: speaking && speaker === who ? "scale(1.05)" : "none",
                    }}
                  >
                    <Character
                      char={who}
                      scale={who === "culow" ? (narrow ? 0.42 : 0.56) : narrow ? 0.34 : 0.46}
                      dress
                      costume="none"
                      bob={!speaking}
                    />
                  </div>
                ))}
              </div>
            </Peana>

            <div className="border-t border-museo-linea p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="cartela text-museo-tinta-tenue">Nivel</span>
                <span className="cartela text-museo-laton">
                  {speaking ? `Pista — ${VOICES[speaker].name}` : "En silencio"}
                </span>
              </div>
              {/* Barras finas de tinta: aguja de estudio, no ecualizador de coche. */}
              <div ref={meterRef} aria-hidden className="flex h-[70px] items-end gap-[3px]">
                {Array.from({ length: METER_BARS }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{
                      height: "6%",
                      background: tinta(),
                      opacity: 0.75,
                      transition: speaking ? "none" : "height .3s ease",
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 h-px w-full bg-museo-linea" />
            </div>
          </div>

          {/* Los mandos, con la pinta de un panel de instrucciones. */}
          <div className="grid content-start gap-5 border border-museo-linea bg-museo-pared p-6 sm:p-8">
            <div className="grid gap-[10px]">
              <span className="cartela text-museo-tinta-tenue">Quién habla</span>
              <div className="flex gap-[10px]">
                <Chip active={speaker === "culow"} onClick={() => pick("culow")} className="flex-1">
                  Culow
                </Chip>
                <Chip
                  active={speaker === "pililarge"}
                  onClick={() => pick("pililarge")}
                  className="flex-1"
                >
                  Pililarge
                </Chip>
              </div>
            </div>

            <div className="grid gap-[10px]">
              <label htmlFor="cyp-texto" className="cartela text-museo-tinta-tenue">
                Qué dice
              </label>
              <textarea
                id="cyp-texto"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full resize-y border border-museo-linea bg-museo-papel p-4 text-[16px] leading-[1.5] text-museo-tinta outline-none transition-colors focus:border-museo-tinta"
              />
              <div className="flex flex-wrap gap-2">
                {phrases.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setText(p.text)}
                    className="cartela border border-museo-linea px-[11px] py-[7px] text-museo-tinta-suave transition-colors hover:border-museo-tinta hover:text-museo-tinta"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <label className="grid gap-2">
                <span className="cartela text-museo-tinta-tenue">
                  Tono <b className="text-museo-laton">{pitch.toFixed(2)}</b>
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.05}
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-museo-tinta"
                />
              </label>
              <label className="grid gap-2">
                <span className="cartela text-museo-tinta-tenue">
                  Velocidad <b className="text-museo-laton">{rate.toFixed(2)}</b>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-museo-tinta"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <GoldButton onClick={() => speak(text, speaker, pitch, rate)}>Reproducir</GoldButton>
              <GhostButton onClick={stop}>Parar</GhostButton>
              <GhostButton onClick={() => sayDialogue(duet)}>Pista a dos voces</GhostButton>
            </div>

            <div className="grid gap-2 border-t border-museo-linea pt-4 text-[13px] leading-[1.6] text-museo-tinta-tenue">
              {supported ? (
                <>
                  <p>
                    Cada uno coge una voz distinta del sistema y la frase se trocea en cláusulas:
                    Culow va grave y atropellado, Pililarge agudo y a trocitos. Para que suenen como
                    los actores de verdad, mete los clips del canal en{" "}
                    <code className="text-museo-tinta-suave">public/voces/</code> y apúntalos en{" "}
                    <code className="text-museo-tinta-suave">src/config/cyp.ts</code>.
                  </p>
                  {(assigned.culow || assigned.pililarge) && (
                    <p>
                      Voces de este navegador — Culow: {assigned.culow?.name ?? "por defecto"} ·
                      Pililarge: {assigned.pililarge?.name ?? "por defecto"}
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Este navegador no tiene síntesis de voz, así que las piezas se quedan calladas.
                  Pruebe en Chrome, Edge o Safari.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
