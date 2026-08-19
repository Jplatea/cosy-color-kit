import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
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
  type Grupo,
} from "./Character";
import { Chip, Eyebrow, GhostButton, GoldButton, SectionTitle } from "./primitives";
import { useNarrow } from "@/hooks/useNarrow";

/**
 * Un apartado plegable del panel.
 *
 * Van todos con el mismo `name`, así que el navegador se encarga de cerrar el
 * anterior al abrir otro: el panel nunca crece más de un bloque abierto. Los
 * navegadores que no entienden `name` simplemente los dejan abrirse sueltos.
 */
function Bloque({
  titulo,
  valor,
  abierto,
  children,
}: {
  titulo: string;
  /** Resumen de lo elegido, para leerlo con el bloque cerrado. */
  valor: ReactNode;
  abierto?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      name="vestidor"
      open={abierto}
      className="group overflow-hidden rounded-[14px] border border-cyp-cream/[0.09] bg-cyp-ink/40"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-[14px] py-[12px] [&::-webkit-details-marker]:hidden">
        <span className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-cyp-cream/50">
          {titulo}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13.5px] text-cyp-cream/[0.82]">{valor}</span>
          <ChevronDown
            size={16}
            className="shrink-0 text-cyp-cream/40 transition-transform group-open:rotate-180"
          />
        </span>
      </summary>
      <div className="border-t border-cyp-cream/[0.07] px-3 pb-[14px] pt-[13px]">{children}</div>
    </details>
  );
}

export function Vestidor() {
  const narrow = useNarrow();
  const [char, setChar] = useState<CharacterId>("culow");
  const [costume, setCostume] = useState<CostumeId>("larva");
  const [color, setColor] = useState<string>(
    COSTUMES.find((c) => c.id === "larva")!.color
  );
  const [extras, setExtras] = useState<Extras>(NO_EXTRAS);
  const [grupoActivo, setGrupoActivo] = useState<Grupo>(GRUPOS[0]);

  const actual = COSTUMES.find((c) => c.id === costume);
  const nombreColor = SWATCHES.find((s) => s.value === color)?.name ?? "A juego";
  const puestos = EXTRAS.filter((x) => extras[x.id]).length;

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
    // Que la pestaña siga al disfraz sorteado, o el elegido no se ve marcado.
    if (c.grupo) setGrupoActivo(c.grupo);
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

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
          {/* Escenario */}
          <div
            className="relative flex min-h-[390px] items-end justify-center rounded-[24px] border border-cyp-cream/[0.09] px-[30px] pb-[44px] pt-[54px]"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 6%, rgba(255,236,205,.12), transparent 72%), #100c0b",
            }}
          >
            <div
              className="absolute bottom-[32px] left-1/2 h-[80px] w-[360px] -translate-x-1/2 blur-[6px]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(255,235,205,.12), transparent 70%)",
              }}
            />
            <div className="relative z-[2]">
              <Character
                char={char}
                scale={char === "culow" ? (narrow ? 1 : 1.5) : narrow ? 0.6 : 0.78}
                dress
                costume={costume}
                color={color}
                extras={extras}
                bob
              />
            </div>
          </div>

          {/* Panel de control */}
          <div className="grid content-start gap-[10px] rounded-[24px] border border-cyp-cream/[0.09] bg-cyp-card p-3">
            <Bloque titulo="Personaje" valor={char === "culow" ? "Culow" : "Pililarge"}>
              <div className="flex gap-[10px]">
                <Chip active={char === "culow"} onClick={() => setChar("culow")}>
                  Culow
                </Chip>
                <Chip active={char === "pililarge"} onClick={() => setChar("pililarge")}>
                  Pililarge
                </Chip>
              </div>
            </Bloque>

            <Bloque titulo="Disfraz" valor={actual?.label ?? "Ninguno"} abierto>
              {/* "Sin disfraz" va suelto arriba: no pertenece a ninguna categoría. */}
              <div className="mb-3 flex flex-wrap gap-[9px]">
                {COSTUMES.filter((c) => !c.grupo).map((c) => (
                  <Chip key={c.id} active={costume === c.id} onClick={() => pickCostume(c)}>
                    {c.label}
                  </Chip>
                ))}
              </div>

              {/* Las categorías, como pestañas: solo se pinta la abierta, así el panel
                  mide lo que la categoría más larga y no la suma de las cuatro. */}
              <div className="mb-3 flex flex-wrap gap-[5px] border-t border-cyp-cream/[0.07] pt-3">
                {GRUPOS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrupoActivo(g)}
                    aria-pressed={grupoActivo === g}
                    className={
                      grupoActivo === g
                        ? "shrink-0 rounded-full bg-cyp-gold/[0.14] px-[9px] py-[5px] text-[11px] font-semibold uppercase tracking-[0.08em] text-cyp-gold"
                        : "shrink-0 rounded-full px-[9px] py-[5px] text-[11px] font-semibold uppercase tracking-[0.08em] text-cyp-cream/40 transition-colors hover:text-cyp-cream/70"
                    }
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-[8px]">
                {COSTUMES.filter((c) => c.grupo === grupoActivo).map((c) => (
                  <Chip key={c.id} active={costume === c.id} onClick={() => pickCostume(c)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </Bloque>

            <Bloque
              titulo="Color"
              valor={
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-[13px] w-[13px] shrink-0 rounded-full"
                    style={{ background: color, border: "1px solid rgba(242,236,226,.25)" }}
                  />
                  {nombreColor}
                </span>
              }
            >
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
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      cursor: "pointer",
                      background: s.value,
                      border: `2px solid ${color === s.value ? "#e8b25c" : "rgba(242,236,226,.2)"}`,
                      boxShadow: color === s.value ? "0 0 0 3px rgba(232,178,92,.25)" : "none",
                    }}
                  />
                ))}
              </div>
            </Bloque>

            <Bloque
              titulo="Complementos"
              valor={puestos === 0 ? "Ninguno" : puestos === 1 ? "1 puesto" : `${puestos} puestos`}
            >
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
            </Bloque>

            <div className="mt-1 flex flex-wrap gap-[10px] border-t border-cyp-cream/10 pt-[14px]">
              <GoldButton onClick={randomLook} className="px-[18px] py-[12px] text-[14.5px]">
                Sorpréndeme
              </GoldButton>
              <GhostButton onClick={resetLook} className="px-4 py-[12px] text-[14.5px]">
                Desnudarlo
              </GhostButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
