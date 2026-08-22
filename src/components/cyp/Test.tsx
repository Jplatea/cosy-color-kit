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
 * Diez preguntas, dos respuestas cada una, y el resultado es el personaje que
 * más veces has elegido. La gracia no está en acertar —no hay nada que
 * acertar— sino en que el personaje que te toca te lo dice él mismo con su
 * voz, y en que el resultado se puede copiar y pegar donde sea.
 *
 * Eran cinco y el empate era imposible. Con diez existe, y no se tapa: el
 * cinco a cinco tiene dictamen propio. Sin él se habría ido en silencio al
 * lado que quedara en el `else`, que es de las cosas que no detecta nadie
 * porque el test siempre contesta algo.
 */

type Ganador = "culow" | "pililarge" | "empate";

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
    pregunta: "Una puerta que pone «tire».",
    opciones: [
      { texto: "Empujo. La puerta está mal", quien: "culow" },
      { texto: "Tiro, no cede, y le pido perdón", quien: "pililarge" },
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
    pregunta: "Le llega un audio de tres minutos.",
    opciones: [
      { texto: "Lo pongo a doble y contesto «vale»", quien: "culow" },
      { texto: "Lo oigo entero. Dos veces", quien: "pililarge" },
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
    pregunta: "Queda una croqueta en la fuente.",
    opciones: [
      { texto: "Ya me la he comido", quien: "culow" },
      { texto: "Digo que no y me arrepiento toda la noche", quien: "pililarge" },
    ],
  },
  {
    pregunta: "El microondas pita.",
    opciones: [
      { texto: "Voy corriendo. Es mío", quien: "culow" },
      { texto: "Espero por si pita otra vez", quien: "pililarge" },
    ],
  },
  {
    pregunta: "Se apagan las luces de golpe.",
    opciones: [
      { texto: "Grito, para que sepan que estoy", quien: "culow" },
      { texto: "Me quedo quieto por si es de la exposición", quien: "pililarge" },
    ],
  },
  {
    pregunta: "Le piden la hora por la calle.",
    opciones: [
      { texto: "La digo mal, pero con seguridad", quien: "culow" },
      { texto: "Miro el reloj tres veces antes de decirla", quien: "pililarge" },
    ],
  },
];

/**
 * Quién sale de estas respuestas: gana el más votado.
 *
 * Estaba escrito dos veces —una para pintar y otra para hablar— y con dos
 * copias de la misma cuenta es cuestión de tiempo que una se quede atrás.
 *
 * Empate no es «no sé»: es el tercer resultado, y a medio contestar sale
 * mucho. Da igual, porque el dictamen solo se enseña con las diez puestas.
 */
function dictamen(respuestas: (0 | 1 | null)[]): Ganador {
  const culow = respuestas.reduce<number>(
    (n, o, i) => (o === null ? n : n + (PREGUNTAS[i].opciones[o].quien === "culow" ? 1 : 0)),
    0
  );
  const pilis = respuestas.filter((r) => r !== null).length - culow;
  if (culow === pilis) return "empate";
  return culow > pilis ? "culow" : "pililarge";
}

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
  // Cinco y cinco. Lo dice Culow, que habla primero siempre.
  empate: {
    titulo: "Eres un rarito",
    linea: "Ni Culow ni Pililarge. Eres un rarito. Y mira que aquí el listón está bajo.",
    resumen:
      "Cinco y cinco. No te pareces a ninguno de los dos, que en un museo con solo dos piezas tiene su mérito.",
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

  const ganador = dictamen(elegidas);
  const v = VEREDICTO[ganador];

  const responder = (i: number, opcion: 0 | 1) => {
    const siguiente = elegidas.map((val, j) => (j === i ? opcion : val)) as (0 | 1 | null)[];
    setElegidas(siguiente);
    setCopiado(false);

    // En cuanto se cierra la última, el ganador se presenta con su voz.
    if (siguiente.every((val) => val !== null)) {
      const quien = dictamen(siguiente);
      // Del empate no hay voz, así que lo dice Culow. Esperar a que Pililarge
      // se anime a hablar no es de este personaje.
      speak(VEREDICTO[quien].linea, quien === "empate" ? "culow" : quien);
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
          <Sala n="07">Sala de identificación</Sala>
          <SectionTitle className="mt-4">
            ¿Con cuál de las dos <span className="italic text-museo-tinta-suave">se identifica usted</span>?
          </SectionTitle>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-museo-tinta-suave">
            Diez preguntas sin ningún rigor científico. Al final se lo dice en voz alta la pieza
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
                {/* En el empate salen los dos, mirando a ver quién es usted. */}
                <Peana className="h-[230px] gap-5 rounded-[3px] pb-6 pt-5">
                  {ganador === "empate" ? (
                    <>
                      <Character char="culow" scale={narrow ? 0.34 : 0.42} bob />
                      <Character char="pililarge" scale={narrow ? 0.24 : 0.3} bob />
                    </>
                  ) : (
                    <Character
                      char={ganador}
                      scale={ganador === "culow" ? (narrow ? 0.5 : 0.62) : narrow ? 0.34 : 0.42}
                      bob
                    />
                  )}
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
