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
import { Chip, GhostButton, GoldButton, Peana, Sala, SectionTitle } from "./primitives";
import { coser, describir, type Traje } from "./sastre";
import { useSpeech } from "@/hooks/useSpeech";
import { useEncargos } from "@/hooks/useEncargos";
import { useNarrow } from "@/hooks/useNarrow";
import { tinta } from "@/lib/color";

/**
 * Sala 6: el vestuario de la colección.
 *
 * Los mandos van plegados a propósito. Con los diecinueve disfraces, la paleta
 * y los complementos desplegados a la vez, la columna de controles medía más
 * que la pantalla y arrastraba a la vitrina detrás: la pieza —que es lo único
 * que hay que mirar— acababa en una caja gigante llena de aire. Así el disfraz
 * se elige en un desplegable de una línea, el color y los complementos se abren
 * solo si hace falta, y la sala entera cabe de una vez.
 */

/** Un bloque de mandos que se abre y se cierra. Cerrado no ocupa nada. */
function Plegable({
  titulo,
  resumen,
  children,
}: {
  titulo: string;
  /** Lo elegido ahora mismo, para verlo sin tener que abrir. */
  resumen: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details className="group border border-museo-linea">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-[14px] py-[11px] [&::-webkit-details-marker]:hidden">
        <span className="cartela text-museo-tinta-tenue">{titulo}</span>
        <span className="ml-auto flex items-center gap-[10px] text-[13px] text-museo-tinta-suave">
          {resumen}
          <svg
            viewBox="0 0 12 8"
            className="h-2 w-3 shrink-0 transition-transform duration-200 group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden
          >
            <path d="M1 1.5 6 6.5l5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="border-t border-museo-linea-fina px-[14px] py-[14px]">{children}</div>
    </details>
  );
}

export function Vestidor() {
  const narrow = useNarrow();
  const [char, setChar] = useState<CharacterId>("culow");
  const [costume, setCostume] = useState<CostumeId>("larva");
  const [color, setColor] = useState<string>(COSTUMES.find((c) => c.id === "larva")!.color);
  const [extras, setExtras] = useState<Extras>(NO_EXTRAS);

  // El disfraz a medida. Mientras haya uno puesto pisa al del desplegable;
  // elegir del desplegable lo quita, que es lo que espera cualquiera.
  const { speak } = useSpeech();
  const [encargo, setEncargo] = useState("");
  const [traje, setTraje] = useState<Traje | null>(null);
  const { encargos, apuntar, vaciar } = useEncargos();

  const actual = COSTUMES.find((c) => c.id === costume);
  const puestos = EXTRAS.filter((x) => extras[x.id]);
  const colorActual = SWATCHES.find((s) => s.value === color);

  const elegir = (id: CostumeId) => {
    const c = COSTUMES.find((x) => x.id === id);
    if (!c) return;
    setTraje(null);
    setCostume(c.id);
    setColor(c.color);
  };

  /** Manda el encargo al sastre y deja que uno de los dos lo comente. */
  const encargar = () => {
    const texto = encargo.trim();
    if (!texto) return;
    const cosido = coser(texto);
    setTraje(cosido);
    apuntar(texto);
    const quien = char;
    speak(
      cosido.reconocido.length
        ? `Vale. ${describir(cosido)}. Ya está.`
        : `No sé qué es eso, pero te lo he hecho igual. ${describir(cosido)}.`,
      quien
    );
  };

  const randomLook = () => {
    // El índice arranca en 1 para no "sorprender" con «Sin disfraz».
    const c = COSTUMES[1 + Math.floor(Math.random() * (COSTUMES.length - 1))];
    const sw = SWATCHES[Math.floor(Math.random() * SWATCHES.length)];
    const ex = { ...NO_EXTRAS };
    EXTRAS.forEach((x) => {
      ex[x.id] = Math.random() > 0.65;
    });
    setTraje(null);
    setChar(Math.random() > 0.5 ? "culow" : "pililarge");
    setCostume(c.id);
    setColor(sw.value);
    setExtras(ex);
  };

  const repetir = (texto: string) => {
    setEncargo(texto);
    setTraje(coser(texto));
  };

  const resetLook = () => {
    setTraje(null);
    setEncargo("");
    setCostume("none");
    setColor(SKIN);
    setExtras(NO_EXTRAS);
  };

  return (
    <section id="vestidor" className="bg-museo-pared px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-9 border-b border-museo-linea pb-8">
          <Sala n="06">Vestuario de la colección</Sala>
          <SectionTitle className="mt-4">El vestidor</SectionTitle>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-museo-tinta-suave">
            Elija una pieza, póngale un traje y cámbiele el color. Todos los trajes son parodias
            hechas a mano, no calcos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          {/* La vitrina: lo justo para que quepa el más alto de los dos. */}
          {/*
            La vitrina se estira: la columna de mandos ha crecido con el sastre
            y los últimos encargos, y con la peana a una altura fija quedaban
            trescientos píxeles de nada debajo de la cartela. Ahora la peana se
            come lo que sobre y las dos columnas terminan en la misma línea.
          */}
          <figure className="flex flex-col">
            <Peana className="min-h-[320px] flex-1 rounded-[3px] px-6 pb-[34px] pt-6">
              <Character
                char={char}
                scale={char === "culow" ? (narrow ? 0.68 : 0.9) : narrow ? 0.5 : 0.65}
                dress
                costume={costume}
                color={color}
                extras={extras}
                traje={traje ?? undefined}
                bob
              />
            </Peana>
            <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-museo-tinta pt-3">
              <span className="font-display text-[21px] text-museo-tinta">
                «{char === "culow" ? "Culow" : "Pililarge"}
                {traje
                  ? `, de ${traje.nombre.toLowerCase()}`
                  : actual && actual.id !== "none"
                    ? `, de ${actual.label.toLowerCase()}`
                    : ", sin traje"}»
              </span>
              <span className="cartela text-museo-tinta-tenue">
                {traje ? describir(traje) : `Intervención del visitante · ${new Date().getFullYear()}`}
              </span>
            </figcaption>
          </figure>

          {/* Mandos: dos botones fijos y tres plegables. */}
          <div className="grid content-start gap-[9px] border border-museo-linea p-[18px]">
            {/*
              El sastre. Va lo primero porque es lo que la gente quiere probar
              antes que nada: escribes lo que se te ocurra y sale algo. Nunca
              contesta que no; si no reconoce ni una palabra, se lo inventa a
              partir de la propia frase y lo dice en voz alta.
            */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                encargar();
              }}
              className="grid gap-[8px] border border-museo-linea p-[14px]"
            >
              <label htmlFor="cyp-encargo" className="cartela text-museo-tinta-tenue">
                Encargar un traje
              </label>
              <input
                id="cyp-encargo"
                value={encargo}
                onChange={(e) => setEncargo(e.target.value)}
                placeholder="un pirata azul con bigote"
                className="w-full border-b border-museo-linea bg-transparent pb-[6px] text-[15px] text-museo-tinta outline-none transition-colors placeholder:text-museo-tinta-tenue focus:border-museo-tinta"
              />
              <div className="mt-1 flex items-center gap-[9px]">
                <GoldButton type="submit" className="flex-1 px-3 py-[10px] text-[13px]">
                  Que lo cosa
                </GoldButton>
                {traje && (
                  <button
                    type="button"
                    onClick={() => {
                      setTraje(null);
                      setEncargo("");
                    }}
                    className="cartela text-museo-tinta-tenue transition-colors hover:text-museo-tinta"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </form>

            {encargos.length > 0 && (
              <details className="group border border-museo-linea">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-[14px] py-[11px] [&::-webkit-details-marker]:hidden">
                  <span className="cartela text-museo-tinta-tenue">Últimos encargos</span>
                  <span className="ml-auto flex items-center gap-[10px] text-[13px] text-museo-tinta-suave">
                    {encargos.length}
                    <svg
                      viewBox="0 0 12 8"
                      className="h-2 w-3 shrink-0 transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      aria-hidden
                    >
                      <path d="M1 1.5 6 6.5l5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-museo-linea-fina px-[14px] py-[12px]">
                  <ul className="grid">
                    {encargos.map((e) => (
                      <li key={e}>
                        <button
                          type="button"
                          onClick={() => repetir(e)}
                          className="w-full border-b border-museo-linea-fina py-[9px] text-left text-[14px] text-museo-tinta-suave transition-colors hover:text-museo-tinta"
                        >
                          {e}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={vaciar}
                    className="cartela mt-3 text-museo-tinta-tenue transition-colors hover:text-museo-tinta"
                  >
                    Vaciar la lista
                  </button>
                </div>
              </details>
            )}

            <div className="flex gap-[9px]">
              <Chip active={char === "culow"} onClick={() => setChar("culow")} className="flex-1">
                Culow
              </Chip>
              <Chip
                active={char === "pililarge"}
                onClick={() => setChar("pililarge")}
                className="flex-1"
              >
                Pililarge
              </Chip>
            </div>

            {/* El desplegable nativo: una línea, y en el móvil lo pinta el
                sistema con su propia rueda, que es lo cómodo ahí. */}
            <label className="grid gap-[6px] border border-museo-linea px-[14px] py-[10px]">
              <span className="cartela text-museo-tinta-tenue">Traje</span>
              <select
                value={costume}
                onChange={(e) => elegir(e.target.value as CostumeId)}
                className="w-full cursor-pointer appearance-none bg-transparent font-display text-[19px] text-museo-tinta outline-none"
              >
                {COSTUMES.filter((c) => !c.grupo).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
                {GRUPOS.map((g) => (
                  <optgroup key={g} label={g}>
                    {COSTUMES.filter((c) => c.grupo === g).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <Plegable
              titulo="Color"
              resumen={
                <span
                  className="h-[16px] w-[16px] rounded-full border border-museo-linea"
                  style={{ background: color }}
                  title={colorActual?.name || color}
                />
              }
            >
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    title={s.name}
                    aria-label={s.name}
                    aria-pressed={color === s.value}
                    onClick={() => setColor(s.value)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      cursor: "pointer",
                      background: s.value,
                      border: `1px solid ${color === s.value ? tinta() : tinta(0.2)}`,
                      boxShadow: color === s.value ? `0 0 0 2px ${tinta(0.18)}` : "none",
                    }}
                  />
                ))}
              </div>
            </Plegable>

            <Plegable
              titulo="Complementos"
              resumen={puestos.length ? `${puestos.length} puestos` : "Ninguno"}
            >
              <div className="flex flex-wrap gap-2">
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
            </Plegable>

            <div className="mt-1 flex gap-[9px]">
              <GoldButton onClick={randomLook} className="flex-1 px-3 py-[12px] text-[13.5px]">
                Sorpréndame
              </GoldButton>
              <GhostButton onClick={resetLook} className="px-3 py-[12px] text-[13.5px]">
                Desvestir
              </GhostButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
