import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CharacterId } from "@/components/cyp/Character";
import { GUION, clipDe } from "@/lib/voces";
import { SEMITONOS_PILILARGE, modular } from "@/lib/modulador";

/**
 * Voz de los personajes.
 *
 * Hay tres caminos y se prueban en este orden, porque así va de lo más fiel a
 * lo más apañado:
 *
 *  1. **Clip grabado.** Si una frase trae `audio`, suena ese fichero. Es la voz
 *     del actor de verdad: nada la mejora.
 *  2. **Voz clonada.** Si no hay clip, se le pide a `/api/voz`, que genera la
 *     frase con las voces de ElevenLabs entrenadas con ellos dos. Sirve para
 *     cualquier cosa que alguien escriba, que es lo que no puede dar un clip.
 *  3. **Voz del navegador.** Si no hay ni lo uno ni lo otro, se sintetiza. Para
 *     que no suene a robot leyendo, cada personaje coge una voz distinta del
 *     sistema y la frase se trocea en cláusulas con su propia prosodia: Culow
 *     suelta la frase de golpe, grave y sin pararse a pensarla; Pililarge la va
 *     soltando a trozos, agudo y con la duda puesta al final.
 *
 * El tono y la velocidad solo se pueden tocar en el tercero: en los otros dos
 * los trae la propia grabación.
 */

export type CharacterId_ = CharacterId;

type VoicePreset = {
  name: string;
  pitch: number;
  rate: number;
  /** Silencio entre cláusulas, en ms. */
  pause: number;
  /** Cuánto se acelera (o frena) según avanza la frase. */
  rateDrift: number;
  /** Variación aleatoria de tono por cláusula: evita la cadencia plana. */
  jitter: number;
  /** Ajuste de tono en la última cláusula: Culow cierra grave, Pililarge sube. */
  finalPitch: number;
  /** Voces del sistema preferidas, de mejor a peor. */
  prefer: RegExp[];
};

/**
 * Los ajustes no son a ojo: salen de medir las grabaciones reales del canal
 * (`src/assets/voces/*-muestra.mp3`) con autocorrelación, ventana a ventana.
 *
 *            tono medio        rango        ritmo
 *   Culow      124 Hz       108–147 Hz    4,8 sílabas/s
 *   Pililarge  216 Hz       191–242 Hz    4,0 sílabas/s
 *
 * Pililarge suena 1,74 veces más agudo que Culow —9,6 semitonos exactos— y
 * Culow habla un 20 % más rápido. Esa proporción tan redonda no es casualidad:
 * en el canal las dos voces las pone la misma persona y a Pililarge se le sube
 * el tono con un modulador. Por eso aquí los dos usan la MISMA voz del sistema
 * y lo único que los separa es el tono, igual que en los vídeos. Darle a
 * Pililarge una voz de mujer, que es lo que se hacía antes, sonaba a otra
 * persona en vez de a Culow subido.
 */
export const VOICES: Record<CharacterId, VoicePreset> = {
  culow: {
    name: "Culow",
    // 124 Hz sobre una voz de hombre. Va rápido y casi no respira: suelta la
    // frase entera de un tirón y encima acelera.
    pitch: 1.05,
    rate: 1.1,
    pause: 70,
    rateDrift: 0.05,
    jitter: 0.05,
    finalPitch: -0.08,
    // Timbre grave.
    prefer: [/jorge/i, /pablo/i, /álvaro|alvaro/i, /diego/i, /carlos/i, /enrique/i, /male/i],
  },
  pililarge: {
    name: "Pililarge",
    // La misma voz que Culow, subida 1,74 veces: 124 Hz pasan a 216, que son
    // los 9,6 semitonos que le mete el modulador en el canal. Además va un 20 %
    // más lento: se para entre trozo y trozo y termina subiendo, como si dudara
    // de lo que acaba de decir.
    pitch: 1.74,
    rate: 0.9,
    pause: 320,
    rateDrift: -0.03,
    jitter: 0.08,
    finalPitch: 0.12,
    // No se usa: Pililarge hereda la voz de Culow. Se deja por si algún día
    // se separan de verdad.
    prefer: [/mónica|monica/i, /paulina/i, /helena/i, /laura/i, /elvira/i, /esperanza/i, /female/i],
  },
};

export const METER_BARS = 34;

export type Line = { who: CharacterId | string; text: string; audio?: string };

/**
 * La voz real, la de ElevenLabs.
 *
 * Se pide a `/api/voz`, que es quien guarda la clave. Aquí solo se decide si
 * usarla o no, y se recuerdan dos cosas para no repetir trabajo:
 *
 *  · Si el endpoint contesta que no está configurado, no se le vuelve a
 *    preguntar en toda la visita: la web se queda con la voz del navegador sin
 *    dar la lata ni gastar peticiones.
 *  · Cada frase generada se guarda en memoria. Volver a pulsar la misma frase
 *    no cuesta ni red ni dinero.
 */
const MAX_VOZ = 300;

/** null = todavía no se sabe. */
let vozRealDisponible: boolean | null = null;
const cacheVoz = new Map<string, string>();
const avisosVoz = new Set<() => void>();

const marcarVoz = (valor: boolean) => {
  if (vozRealDisponible === valor) return;
  vozRealDisponible = valor;
  avisosVoz.forEach((avisar) => avisar());
};

async function pedirVozReal(text: string, who: CharacterId): Promise<string | null> {
  if (vozRealDisponible === false) return null;
  const limpio = text.trim();
  if (!limpio || limpio.length > MAX_VOZ) return null;

  const clave = `${who}|${limpio}`;
  const guardado = cacheVoz.get(clave);
  if (guardado) return guardado;

  try {
    const res = await fetch(`/api/voz?v=${who}&t=${encodeURIComponent(limpio)}`);
    // 503 = sin configurar. 404 = todavía no hay función desplegada.
    if (res.status === 503 || res.status === 404) {
      marcarVoz(false);
      return null;
    }
    // Un 429 es pasajero: se sintetiza esta vez, pero se sigue intentando luego.
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("audio")) return null;
    let url = URL.createObjectURL(blob);

    /*
      Si el servidor ha tenido que prestarle a Pililarge la voz de Culow —lo
      hace cuando solo hay una voz clonada, que es lo normal— lo dice por esta
      cabecera con los semitonos que hay que subirle. Se le suben aquí, igual
      que a las tomas grabadas.

      Clonar las dos voces por separado sonaría a dos personas distintas.
      Modulando una sola suena a lo que es: la misma, con el mando puesto.
    */
    const semis = Number(res.headers.get("x-cyp-modular") || 0);
    if (semis) {
      const subida = await modular(url, semis);
      // Si el navegador no puede modular, mejor la voz sin subir que ninguna.
      if (subida) url = subida;
    }

    marcarVoz(true);
    cacheVoz.set(clave, url);
    return url;
  } catch {
    return null;
  }
}

const clampPitch = (v: number) => Math.max(0.1, Math.min(2, v));
const clampRate = (v: number) => Math.max(0.5, Math.min(1.8, v));

/**
 * Turno de palabra, compartido por todas las secciones.
 *
 * `speechSynthesis` es único en la página: si alguien recita un poema mientras
 * los personajes hablan, la primera voz se corta. Ese corte llega como un
 * evento `end` normal, así que sin un turno común la sección interrumpida
 * seguiría con la cláusula siguiente y se pisarían las dos.
 *
 * `claim()` reparte un número nuevo e invalida el anterior; cada sección se
 * apunta con `onYield` para poder apagar su modulador cuando pierde el turno.
 */
let activeRun = 0;
const yielders = new Set<() => void>();

function claim(): number {
  activeRun += 1;
  yielders.forEach((reset) => reset());
  return activeRun;
}

const holdsFloor = (run: number) => activeRun === run;

/**
 * Trocea en cláusulas por puntuación. Las piezas muy cortas se pegan a la
 * siguiente: separar "Sí." de su frase sonaría entrecortado, no expresivo.
 */
function toClauses(text: string): string[] {
  const raw = text.match(/[^.!?…:;,]+[.!?…:;,]*/g) || [text];
  const out: string[] = [];
  raw.forEach((piece) => {
    const clause = piece.trim();
    if (!clause) return;
    const prev = out[out.length - 1];
    if (prev && prev.length < 12) out[out.length - 1] = `${prev} ${clause}`;
    else out.push(clause);
  });
  return out.length ? out : [text];
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [speaker, setSpeaker] = useState<CharacterId>("culow");
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  /*
    Las tomas de Pililarge se van cocinando en cuanto la página está tranquila.

    Modular un clip cuesta cerca de un segundo, y hacerlo en el momento en que
    alguien pulsa el botón se nota. Aquí se hace antes, de una en una y en los
    ratos muertos, así que cuando llega el clic ya está esperando. Lo que salga
    se queda guardado dentro del propio modulador; esto solo le da el empujón.
  */
  useEffect(() => {
    const ocioso =
      (window as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 1200));
    let vivo = true;
    ocioso(async () => {
      for (const toma of GUION) {
        if (!vivo) return;
        if (toma.quien !== "culow") continue;
        const url = clipDe(toma.id);
        if (url) await modular(url, SEMITONOS_PILILARGE);
      }
    });
    return () => {
      vivo = false;
    };
  }, []);

  const meterRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourcesRef = useRef(new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>());

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setSupported(false);
      return;
    }
    // En Chrome la lista de voces llega de forma asíncrona.
    const read = () => setVoices(synth.getVoices());
    read();
    synth.addEventListener("voiceschanged", read);
    return () => {
      synth.removeEventListener("voiceschanged", read);
      synth.cancel();
    };
  }, []);

  /**
   * A los dos les toca la MISMA voz del sistema, y eso es a propósito.
   *
   * En el canal las dos voces las pone la misma persona: se graba una vez y a
   * Pililarge se le sube el tono con un modulador. Se nota en la medida —124 Hz
   * Culow, 216 Hz Pililarge, exactamente 1,74 veces— y explica por qué antes no
   * se parecían: la web le daba a Pililarge una voz de mujer del sistema, así
   * que sonaba a otra persona en vez de a Culow con el tono subido.
   */
  const assigned = useMemo(() => {
    const spanish = voices.filter((v) => /^es/i.test(v.lang));
    const pool = spanish.length ? spanish : voices;
    for (const pattern of VOICES.culow.prefer) {
      const hit = pool.find((v) => pattern.test(v.name));
      if (hit) return { culow: hit, pililarge: hit };
    }
    const suelta = pool.find((v) => /es[-_]ES/i.test(v.lang)) || pool[0] || null;
    return { culow: suelta, pililarge: suelta };
  }, [voices]);

  const stopMeter = useCallback(() => {
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
    const node = meterRef.current;
    if (!node) return;
    Array.from(node.children).forEach((bar) => {
      (bar as HTMLElement).style.height = "8%";
    });
  }, []);

  /** Modulador sintético: tres senoides desfasadas sugieren voz sin analizar audio. */
  const startSynthMeter = useCallback((pitch: number) => {
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    const node = meterRef.current;
    if (!node) return;
    const bars = Array.from(node.children) as HTMLElement[];
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      bars.forEach((bar, i) => {
        const w =
          Math.sin(t * (7 + pitch * 5) + i * 0.55) *
          Math.sin(t * 2.3 + i * 0.2) *
          Math.sin(t * 11 + i);
        const h = 8 + Math.abs(w) * 88 * (0.6 + 0.4 * Math.sin((i / METER_BARS) * Math.PI));
        bar.style.height = `${h.toFixed(1)}%`;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  /** Modulador real: alturas tomadas del espectro del clip que está sonando. */
  const startAudioMeter = useCallback(() => {
    const analyser = analyserRef.current;
    const node = meterRef.current;
    if (!analyser || !node) return;
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    const bars = Array.from(node.children) as HTMLElement[];
    const spectrum = new Uint8Array(analyser.frequencyBinCount);
    const loop = () => {
      analyser.getByteFrequencyData(spectrum);
      // Las frecuencias graves dominan la voz: se muestrea solo el tramo útil.
      const usable = Math.floor(spectrum.length * 0.55);
      bars.forEach((bar, i) => {
        const from = Math.floor((i / bars.length) * usable);
        const to = Math.max(from + 1, Math.floor(((i + 1) / bars.length) * usable));
        let sum = 0;
        for (let k = from; k < to; k++) sum += spectrum[k];
        const level = sum / (to - from) / 255;
        bar.style.height = `${(8 + level * 88).toFixed(1)}%`;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  /** Suelta el turno sin cortar a nadie: solo apaga lo de esta sección. */
  const yieldFloor = useCallback(() => {
    clearTimeout(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    stopMeter();
    setSpeaking(false);
  }, [stopMeter]);

  const stop = useCallback(() => {
    claim();
    window.speechSynthesis?.cancel();
    yieldFloor();
  }, [yieldFloor]);

  // Cuando otra sección toma la palabra, esta apaga su modulador y su estado.
  useEffect(() => {
    yielders.add(yieldFloor);
    return () => {
      yielders.delete(yieldFloor);
    };
  }, [yieldFloor]);

  useEffect(() => stop, [stop]);

  /** Reproduce un clip real y engancha el analizador al modulador. */
  const playClip = useCallback(
    (url: string, who: CharacterId, run: number, onDone?: () => void) => {
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      try {
        const Ctx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctx) {
          const ctx = ctxRef.current ?? new Ctx();
          ctxRef.current = ctx;
          void ctx.resume();
          if (!analyserRef.current) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.72;
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
          }
          // Un elemento <audio> solo admite un MediaElementSource en su vida.
          let source = sourcesRef.current.get(audio);
          if (!source) {
            source = ctx.createMediaElementSource(audio);
            sourcesRef.current.set(audio, source);
          }
          source.connect(analyserRef.current!);
        }
      } catch {
        /* sin Web Audio el clip suena igual, con el modulador sintético */
      }

      const finish = (ok: boolean) => {
        if (!holdsFloor(run)) return;
        stopMeter();
        setSpeaking(false);
        audioRef.current = null;
        if (ok && onDone) onDone();
      };

      audio.onplay = () => {
        if (!holdsFloor(run)) return;
        setSpeaker(who);
        setSpeaking(true);
        if (analyserRef.current) startAudioMeter();
        else startSynthMeter(VOICES[who].pitch);
      };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);

      void audio.play().catch(() => finish(false));
    },
    [startAudioMeter, startSynthMeter, stopMeter]
  );

  /** Sintetiza una frase entera, cláusula a cláusula, con la prosodia del personaje. */
  const speakSynth = useCallback(
    (
      text: string,
      who: CharacterId,
      basePitch: number,
      baseRate: number,
      run: number,
      onDone?: () => void
    ) => {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const preset = VOICES[who];
      const clauses = toClauses(text);
      const voice = assigned[who];

      const sayClause = (i: number) => {
        if (!holdsFloor(run)) return;
        if (i >= clauses.length) {
          stopMeter();
          setSpeaking(false);
          onDone?.();
          return;
        }
        const last = i === clauses.length - 1;
        const drift = preset.rateDrift * i;
        const jitter = (Math.random() - 0.5) * 2 * preset.jitter;

        const utterance = new SpeechSynthesisUtterance(clauses[i]);
        utterance.lang = "es-ES";
        if (voice) utterance.voice = voice;
        utterance.pitch = clampPitch(basePitch + jitter + (last ? preset.finalPitch : 0));
        utterance.rate = clampRate(baseRate + drift + (last ? preset.rateDrift : 0));

        utterance.onstart = () => {
          if (!holdsFloor(run)) return;
          setSpeaker(who);
          setSpeaking(true);
          startSynthMeter(utterance.pitch);
        };
        const next = (ok: boolean) => {
          if (!holdsFloor(run)) return;
          if (!ok) {
            stopMeter();
            setSpeaking(false);
            return;
          }
          if (last) {
            sayClause(i + 1);
            return;
          }
          timerRef.current = setTimeout(() => sayClause(i + 1), preset.pause);
        };
        utterance.onend = () => next(true);
        utterance.onerror = () => next(false);

        synth.speak(utterance);
      };

      sayClause(0);
    },
    [assigned, startSynthMeter, stopMeter]
  );

  /** Dice una frase: por clip real si lo hay, si no sintetizada. */
  const speakLine = useCallback(
    (line: Line, pitch?: number, rate?: number, onDone?: () => void) => {
      const who = (line.who as CharacterId) in VOICES ? (line.who as CharacterId) : "culow";
      if (!line.text.trim() && !line.audio) return;

      // Corta lo que hubiera sonando —aquí o en otra sección— y toma el turno.
      window.speechSynthesis?.cancel();
      const run = claim();

      // Un clip grabado manda sobre todo lo demás. Puede venir dado a mano en
      // la configuración, o estar en `src/assets/voces/` con el nombre del
      // guion: se busca por el texto exacto, así que da igual si la frase llega
      // de un botón, de un poema o escrita a mano en la caja.
      const grabado =
        line.audio ??
        clipDe(GUION.find((toma) => toma.quien === who && toma.texto === line.text.trim())?.id);
      if (grabado) {
        playClip(grabado, who, run, onDone);
        return;
      }

      const ajuste = preset(who);
      const sintetizar = () =>
        speakSynth(line.text, who, pitch ?? ajuste.pitch, rate ?? ajuste.rate, run, onDone);

      /*
        Pililarge es Culow subido de tono, así que su grabación ya existe:
        es la de Culow pasada por el modulador.

        Todas las tomas del guion están puestas a nombre de Culow —es quien
        viene elegido de fábrica en la audioguía—, con lo que al cambiar de
        personaje se perdía la voz de verdad y se caía a la síntesis. Se notaba
        muchísimo: la misma frase sonaba a ellos con uno y a robot con el otro.
        Ahora se coge esa misma toma y se le suben los 9,6 semitonos que los
        separan, igual que en los vídeos.
      */
      if (who === "pililarge") {
        const deCulow = clipDe(
          GUION.find((toma) => toma.quien === "culow" && toma.texto === line.text.trim())?.id
        );
        if (deCulow) {
          setPreparando(true);
          void modular(deCulow, SEMITONOS_PILILARGE).then((url) => {
            setPreparando(false);
            if (!holdsFloor(run)) return;
            if (url) playClip(url, who, run, onDone);
            else sintetizar();
          });
          return;
        }
      }

      // Si ya se sabe que no hay voz real, se sintetiza sin esperar a nadie.
      if (vozRealDisponible === false) {
        sintetizar();
        return;
      }

      setPreparando(true);
      void pedirVozReal(line.text, who).then((url) => {
        setPreparando(false);
        // Mientras se generaba, alguien puede haber tomado la palabra.
        if (!holdsFloor(run)) return;
        if (url) playClip(url, who, run, onDone);
        else sintetizar();
      });
    },
    [playClip, speakSynth]
  );

  /** El ajuste de cada uno. Los dos comparten voz; lo que los separa es el tono. */
  const preset = useCallback((who: CharacterId): VoicePreset => VOICES[who], []);

  const speak = useCallback(
    (text: string, who: CharacterId, pitch?: number, rate?: number, audio?: string) =>
      speakLine({ who, text, audio }, pitch, rate),
    [speakLine]
  );

  /** Recita una conversación encadenando personajes. */
  const sayDialogue = useCallback(
    (lines: readonly Line[]) => {
      const run = (i: number) => {
        if (i >= lines.length) return;
        speakLine(lines[i], undefined, undefined, () => run(i + 1));
      };
      run(0);
    },
    [speakLine]
  );

  // La disponibilidad se descubre con la primera frase; cuando se sabe, hay
  // que repintar las secciones que lo cuentan.
  const [, repintar] = useState(0);
  useEffect(() => {
    const avisar = () => repintar((n) => n + 1);
    avisosVoz.add(avisar);
    return () => {
      avisosVoz.delete(avisar);
    };
  }, []);

  return {
    speaking,
    /** true mientras se está generando la voz real. */
    preparando,
    /** null hasta que se prueba; true si suenan las voces clonadas. */
    vozReal: vozRealDisponible,
    speaker,
    setSpeaker,
    speak,
    speakLine,
    stop,
    sayDialogue,
    meterRef,
    supported,
    /** Qué voz del sistema le ha tocado a cada uno (se muestra en la sección). */
    assigned,
    /** El tono y la velocidad que tocan en esta máquina. */
    preset,
  };
}
