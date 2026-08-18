import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CharacterId } from "@/components/cyp/Character";

/**
 * Voz de los personajes.
 *
 * Hay dos caminos, y la sección de arriba no distingue entre ellos:
 *
 *  1. **Audio real.** Si una frase trae `audio`, suena ese clip y el modulador
 *     se dibuja con la amplitud real de la onda. Es el camino bueno: en cuanto
 *     haya recortes de voz del canal, los personajes suenan como los actores.
 *  2. **Voz del navegador.** Si no hay clip, se sintetiza. Para que no suene a
 *     robot leyendo, cada personaje elige una voz distinta del sistema y la
 *     frase se trocea en cláusulas con su propia prosodia: Culow atropella y
 *     se acelera, Pililarge se para entre frase y frase y cierra hacia abajo.
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
  /** Ajuste de tono en la última cláusula: Culow sube, Pililarge cierra grave. */
  finalPitch: number;
  /** Voces del sistema preferidas, de mejor a peor. */
  prefer: RegExp[];
};

export const VOICES: Record<CharacterId, VoicePreset> = {
  culow: {
    name: "Culow",
    pitch: 1.65,
    rate: 1.12,
    pause: 60,
    rateDrift: 0.04,
    jitter: 0.06,
    finalPitch: 0.1,
    // Timbre claro y brillante.
    prefer: [/mónica|monica/i, /paulina/i, /helena/i, /laura/i, /elvira/i, /esperanza/i, /female/i],
  },
  pililarge: {
    name: "Pililarge",
    pitch: 0.45,
    rate: 0.9,
    pause: 360,
    rateDrift: -0.02,
    jitter: 0.03,
    finalPitch: -0.08,
    // Timbre grave y lento.
    prefer: [/jorge/i, /pablo/i, /álvaro|alvaro/i, /diego/i, /carlos/i, /enrique/i, /male/i],
  },
};

export const METER_BARS = 34;

export type Line = { who: CharacterId | string; text: string; audio?: string };

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
  const [speaker, setSpeaker] = useState<CharacterId>("culow");
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

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
   * Reparte las voces del sistema entre los dos, asegurando que no les toque
   * la misma: media conversación se pierde si suenan idénticos.
   */
  const assigned = useMemo(() => {
    const spanish = voices.filter((v) => /^es/i.test(v.lang));
    const pool = spanish.length ? spanish : voices;
    const best = (who: CharacterId, taken?: SpeechSynthesisVoice) => {
      const free = pool.filter((v) => v !== taken);
      for (const pattern of VOICES[who].prefer) {
        const hit = free.find((v) => pattern.test(v.name));
        if (hit) return hit;
      }
      return (
        free.find((v) => /es[-_]ES/i.test(v.lang)) ||
        free[0] ||
        pool[0] ||
        null
      );
    };
    const culow = best("culow");
    return { culow, pililarge: best("pililarge", culow ?? undefined) };
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

      if (line.audio) {
        playClip(line.audio, who, run, onDone);
        return;
      }
      const preset = VOICES[who];
      speakSynth(line.text, who, pitch ?? preset.pitch, rate ?? preset.rate, run, onDone);
    },
    [playClip, speakSynth]
  );

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

  return {
    speaking,
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
  };
}
