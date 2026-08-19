import { useState } from "react";
import { Character } from "./Character";
import { GhostButton, GoldButton, Peana, Sala, SectionTitle } from "./primitives";
import { useSpeech } from "@/hooks/useSpeech";
import { useNarrow } from "@/hooks/useNarrow";
import { socials } from "@/config/cyp";
import { papel, tinta } from "@/lib/color";

/**
 * "¿Cuál de los dos eres tú?".
 *
 * Cinco preguntas, dos respuestas cada una, y el resultado es el personaje que
 * más veces has elegido. La gracia no está en acertar —no hay nada que
 * acertar— sino en que el personaje que te toca te lo dice él mismo con su
 * voz, y en que el resultado se puede copiar y pegar donde sea.
 */

type Respuesta = { texto: string; quien: "culow" | "pililarge" };

const PREGUNTAS: { pregunta: string; opciones: [Respuesta, Respuesta] }[] = [
  {
    pregunta: "Suena el despertador.",
    opciones: [
      { texto: "Le contesto mal y me levanto", quien: "culow" },
      { texto: "Me quedo pensando qué querrá decirme", quien: "pililarge" },
    ],
  },
  {
    pregunta: "Alguien te cuenta algo increíble.",
    opciones: [
      { texto: "Mentira. Siguiente", quien: "culow" },
      { texto: "¿En serio? Cuéntame más", quien: "pililarge" },
    ],
  },
  {
    pregunta: "Hay una silla libre en la sala.",
    opciones: [
      { texto: "Me siento antes de que la vea nadie", quien: "culow" },
      { texto: "La miro un rato. Ya me sentaré", quien: "pililarge" },
    ],
  },
  {
    pregunta: "Te preguntan qué tal estás.",
    opciones: [
      { texto: "Digo la verdad y se arrepienten", quien: "culow" },
      { texto: "Digo que bien y luego lo pienso", quien: "pililarge" },
    ],
  },
  {
    pregunta: "El microondas pita.",
    opciones: [
      { texto: "Voy corriendo. Es mío", quien: "culow" },
      { texto: "Espero por si pita otra vez", quien: "pililarge" },
    ],
  },
];

const VEREDICTO = {
  culow: {
    titulo: "Eres Culow",
    linea: "Eres Culow. Vas de frente, hablas grave y no te disculpas por nada. Enhorabuena, supongo.",
    resumen:
      "Contestas antes de pensar y aciertas más de lo que deberías. La gente te quiere aunque no sepa muy bien por qué.",
  },
  pililarge: {
    titulo: "Eres Pililarge",
    linea: "Eres Pililarge. Te lo crees todo, y aun así te va mejor que a mí. No lo entiendo.",
    resumen:
      "Vas despacio, preguntas cosas raras y no le haces mal a nadie. Sigues intentando sentarte y algún día lo consigues.",
  },
} as const;

export function Test() {
  const narrow = useNarrow();
  const { speak } = useSpeech();
  /** Una entrada por pregunta; `null` = sin contestar todavía. */
  const [elegidas, setElegidas] = useState<(0 | 1 | null)[]>(() => PREGUNTAS.map(() => null));
  const [copiado, setCopiado] = useState(false);

  const contestadas = elegidas.filter((v) => v !== null).length;
  const completo = contestadas === PREGUNTAS.length;

  const culowes = elegidas.reduce<number>(
    (n, opcion, i) => (opcion === null ? n : n + (PREGUNTAS[i].opciones[opcion].quien === "culow" ? 1 : 0)),
    0
  );
  // Empate imposible: son cinco preguntas.
  const ganador = culowes * 2 > PREGUNTAS.length ? "culow" : "pililarge";
  const v = VEREDICTO[ganador];

  const responder = (i: number, opcion: 0 | 1) => {
    const siguiente = elegidas.map((val, j) => (j === i ? opcion : val)) as (0 | 1 | null)[];
    setElegidas(siguiente);
    setCopiado(false);

    // En cuanto se cierra la última, el ganador se presenta con su voz.
    if (siguiente.every((val) => val !== null)) {
      const culowFinal = siguiente.reduce<number>(
        (n, o, j) => n + (PREGUNTAS[j].opciones[o as 0 | 1].quien === "culow" ? 1 : 0),
        0
      );
      const quien = culowFinal * 2 > PREGUNTAS.length ? "culow" : "pililarge";
      speak(VEREDICTO[quien].linea, quien);
    }
  };

  const copiar = async () => {
    const texto = `${v.titulo}. ${v.resumen} — Haz el test en ${socials.youtube}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      // Sin permiso de portapapeles no pasa nada: el resultado ya está en pantalla.
      setCopiado(false);
    }
  };

  const reiniciar = () => {
    setElegidas(PREGUNTAS.map(() => null));
    setCopiado(false);
  };

  return (
    <section id="test" className="px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 border-b border-museo-linea pb-8">
          <Sala n="06">Sala de identificación</Sala>
          <SectionTitle className="mt-4">
            ¿Con cuál de las dos <span className="italic text-museo-tinta-suave">se identifica usted</span>?
          </SectionTitle>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-museo-tinta-suave">
            Cinco preguntas sin ningún rigor científico. Al final se lo dice en voz alta la pieza
            que le haya tocado.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid content-start gap-[14px]">
            {PREGUNTAS.map((p, i) => (
              <fieldset
                key={p.pregunta}
className="border border-museo-linea bg-museo-pared p-[22px]"
              >
                <legend className="px-2 font-display text-[21px] text-museo-tinta">
                  <span className="cartela mr-2 align-middle text-museo-laton">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p.pregunta}
                </legend>
                <div className="mt-3 grid gap-[9px] sm:grid-cols-2">
                  {p.opciones.map((o, j) => {
                    const activa = elegidas[i] === j;
                    return (
                      <button
                        key={o.texto}
                        type="button"
                        aria-pressed={activa}
                        onClick={() => responder(i, j as 0 | 1)}
                        className="border px-4 py-[13px] text-left text-[14px] transition-colors"
                        style={{
                          borderColor: activa ? tinta() : tinta(0.18),
                          background: activa ? tinta() : "transparent",
                          color: activa ? papel() : tinta(0.7),
                        }}
                      >
                        {o.texto}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {/* El veredicto. Antes de terminar enseña el progreso, para que la
              columna no sea un hueco vacío mientras se contesta. */}
          <div
            className="grid content-start gap-5 self-start border border-museo-linea bg-museo-pared p-7 lg:sticky lg:top-[104px]"
          >
            {completo ? (
              <>
                <Peana className="h-[230px] rounded-[3px] pb-6 pt-5">
                  <Character
                    char={ganador}
                    scale={ganador === "culow" ? (narrow ? 0.5 : 0.62) : narrow ? 0.34 : 0.42}
                    bob
                  />
                </Peana>
                <div>
                  <div className="cartela text-museo-laton">Dictamen</div>
                  <div className="mt-2 font-display text-[34px] leading-tight text-museo-tinta">
                    {v.titulo}
                  </div>
                  <p className="mt-3 text-[15px] leading-[1.65] text-museo-tinta-suave">
                    {v.resumen}
                  </p>
                </div>
                <div className="flex flex-wrap gap-[10px] border-t border-museo-linea pt-[18px]">
                  <GoldButton onClick={copiar} className="px-[20px] py-[13px] text-[14.5px]">
                    {copiado ? "Copiado" : "Copiar resultado"}
                  </GoldButton>
                  <GhostButton onClick={reiniciar} className="px-5 py-[13px] text-[14.5px]">
                    Otra vez
                  </GhostButton>
                </div>
              </>
            ) : (
              <>
                <div className="cartela text-museo-laton">
                  Llevas {contestadas} de {PREGUNTAS.length}
                </div>
                <div className="h-px w-full bg-museo-linea">
                  <div
                    className="h-px bg-museo-tinta transition-[width] duration-300"
                    style={{ width: `${(contestadas / PREGUNTAS.length) * 100}%` }}
                  />
                </div>
                <p className="text-[15px] leading-[1.65] text-museo-tinta-suave">
                  Contesta las cinco y aquí sale quién eres. No hay respuestas buenas; tampoco
                  malas; en realidad no hay respuestas.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
