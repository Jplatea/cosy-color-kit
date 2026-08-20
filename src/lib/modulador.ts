/**
 * El modulador: sube de tono una grabación sin acelerarla.
 *
 * En el canal las dos voces las pone la misma persona, y Pililarge sale de
 * pasar a Culow por un modulador básico. Medidas sobre las grabaciones del
 * canal: Culow ronda los 124 Hz y Pililarge los 216, o sea **1,74 veces más
 * agudo — 9,6 semitonos**. Y sin embargo Pililarge no habla más deprisa: si
 * fuera un simple «acelerar la cinta» iría un 74 % más rápido, y no es el caso.
 * Así que hay que subir el tono dejando la duración quieta.
 *
 * Con eso, cualquier frase grabada de Culow vale también para Pililarge, y la
 * voz que se oye es la de verdad en los dos casos. Es exactamente lo que
 * hacéis vosotros, hecho en el navegador.
 *
 * Va en dos pasos, que es la forma clásica de conseguirlo:
 *
 *   1. **Estirar** la grabación 1,74 veces sin tocar el tono (SOLA).
 *   2. **Reproducirla 1,74 veces más rápido**, que devuelve la duración
 *      original y sube el tono de paso.
 *
 * El estirado es lo delicado. Cortar en trozos y pegarlos separados deja un eco
 * metálico, porque las ondas se pegan a destiempo y se cancelan entre sí. SOLA
 * lo evita buscando, antes de pegar cada trozo, el desplazamiento que hace que
 * las dos ondas encajen —el que más se parece a lo que ya hay escrito—. Cuesta
 * unos milisegundos más y la diferencia se oye.
 */

/** Cuánto sube Pililarge sobre Culow: 216/124 Hz. */
export const SEMITONOS_PILILARGE = 9.6;

const razon = (semitonos: number) => Math.pow(2, semitonos / 12);

/** Lo ya modulado, para no repetir el trabajo al volver a pulsar. */
const hechos = new Map<string, Promise<string | null>>();

/**
 * Suelta el hilo un instante, sin que el navegador lo penalice.
 *
 * Lo natural sería `setTimeout(…, 0)`, y fue lo primero que se puso. Pero los
 * navegadores estrangulan los temporizadores de las pestañas que no se están
 * mirando: pasan a un segundo como mínimo. Con una pausa cada pocos trozos,
 * modular un clip en una pestaña de fondo tardaba medio minuto en vez de dos
 * décimas.
 *
 * `MessageChannel` no lo estrangulan —es el truco que usa el propio React para
 * repartir su trabajo—, así que va igual de rápido se esté mirando o no.
 */
function cederElHilo(): Promise<void> {
  return new Promise((sigue) => {
    const canal = new MessageChannel();
    canal.port1.onmessage = () => {
      canal.port1.close();
      sigue();
    };
    canal.port2.postMessage(null);
  });
}

/**
 * Estira `x` por `alfa` sin cambiar el tono (SOLA).
 *
 * Se avanza por la entrada a saltos cortos y se escribe a saltos largos: así
 * la señal dura más con las mismas ondas dentro. Cada trozo se busca en un
 * margen de ±`BUSQUEDA` muestras para que su onda case con la de la cola ya
 * escrita, y se cruza con un desvanecido para que la costura no chasque.
 */
async function estirar(x: Float32Array, alfa: number): Promise<Float32Array> {
  const TROZO = 1024;
  const SALTO_SALIDA = TROZO >> 1;
  const SALTO_ENTRADA = Math.max(1, Math.round(SALTO_SALIDA / alfa));
  /*
    ±256 muestras de búsqueda no es un número redondo cualquiera: a 44 kHz, un
    ciclo de una voz de 124 Hz mide unas 355 muestras. Con este margen se cubre
    más de medio ciclo, que es lo que hace falta para encontrar el punto donde
    las ondas casan. Recortarlo abarataría el cálculo y traería de vuelta el eco
    metálico que esto viene a evitar.
  */
  const BUSQUEDA = 256;
  const SOLAPE = TROZO - SALTO_SALIDA;
  /** Cada cuántos trozos se suelta el hilo para que la página no se congele. */
  const RESPIRAR = 64;
  let trozos = 0;

  const salida = new Float32Array(Math.ceil(x.length * alfa) + TROZO + BUSQUEDA);
  salida.set(x.subarray(0, Math.min(TROZO, x.length)));

  let pSalida = SALTO_SALIDA;
  let pEntrada = SALTO_ENTRADA;

  while (pEntrada + TROZO + BUSQUEDA < x.length) {
    // ¿Qué desplazamiento hace que la onda entrante case con la que ya hay?
    // Se mira una de cada ocho muestras. Con trozos de 1024 la curva de
    // parecido es suave, así que el máximo cae en el mismo sitio y el cálculo
    // baja de segundo y medio a un par de décimas.
    let mejor = 0;
    let mejorParecido = -Infinity;
    for (let k = -BUSQUEDA; k <= BUSQUEDA; k++) {
      const desde = pEntrada + k;
      if (desde < 0) continue;
      let producto = 0;
      let energia = 0;
      for (let j = 0; j < SOLAPE; j += 8) {
        const a = salida[pSalida + j];
        const b = x[desde + j];
        producto += a * b;
        energia += b * b;
      }
      const parecido = energia > 1e-9 ? producto / Math.sqrt(energia) : 0;
      if (parecido > mejorParecido) {
        mejorParecido = parecido;
        mejor = k;
      }
    }

    const desde = Math.max(0, pEntrada + mejor);
    // La cola que ya estaba se apaga mientras el trozo nuevo entra.
    for (let j = 0; j < SOLAPE; j++) {
      const peso = j / SOLAPE;
      salida[pSalida + j] = salida[pSalida + j] * (1 - peso) + x[desde + j] * peso;
    }
    for (let j = SOLAPE; j < TROZO; j++) salida[pSalida + j] = x[desde + j];

    pSalida += SALTO_SALIDA;
    pEntrada += SALTO_ENTRADA;

    // Un clip de cinco segundos son varios cientos de trozos. Hacerlos del
    // tirón congelaba la página mientras tanto.
    if (++trozos % RESPIRAR === 0) await cederElHilo();
  }

  return salida.subarray(0, Math.max(1, Math.round(x.length * alfa)));
}

/** Un AudioBuffer metido en un .wav de 16 bits, que es lo que sabe leer un <audio>. */
function comoWav(buffer: AudioBuffer): Blob {
  const canales = buffer.numberOfChannels;
  const muestras = buffer.length;
  const bytes = 44 + muestras * canales * 2;
  const vista = new DataView(new ArrayBuffer(bytes));

  const texto = (pos: number, s: string) => {
    for (let i = 0; i < s.length; i++) vista.setUint8(pos + i, s.charCodeAt(i));
  };

  texto(0, "RIFF");
  vista.setUint32(4, bytes - 8, true);
  texto(8, "WAVEfmt ");
  vista.setUint32(16, 16, true);
  vista.setUint16(20, 1, true); // PCM
  vista.setUint16(22, canales, true);
  vista.setUint32(24, buffer.sampleRate, true);
  vista.setUint32(28, buffer.sampleRate * canales * 2, true);
  vista.setUint16(32, canales * 2, true);
  vista.setUint16(34, 16, true);
  texto(36, "data");
  vista.setUint32(40, muestras * canales * 2, true);

  const pistas = Array.from({ length: canales }, (_, c) => buffer.getChannelData(c));
  let pos = 44;
  for (let i = 0; i < muestras; i++) {
    for (let c = 0; c < canales; c++) {
      const v = Math.max(-1, Math.min(1, pistas[c][i]));
      vista.setInt16(pos, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      pos += 2;
    }
  }
  return new Blob([vista.buffer], { type: "audio/wav" });
}

/**
 * Devuelve la URL de esa grabación subida `semitonos`, o `null` si el navegador
 * no puede con ello.
 *
 * Si falla, quien llama se queda con la síntesis de siempre: es mejor que suene
 * regular a que no suene.
 */
export function modular(url: string, semitonos: number): Promise<string | null> {
  const llave = `${url}|${semitonos}`;
  const hecho = hechos.get(llave);
  if (hecho) return hecho;

  const trabajo = (async () => {
    try {
      const Contexto = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Contexto || typeof OfflineAudioContext === "undefined") return null;

      const datos = await (await fetch(url)).arrayBuffer();
      const ctx = new Contexto();
      const original = await ctx.decodeAudioData(datos);
      void ctx.close();

      const alfa = razon(semitonos);
      const canales = original.numberOfChannels;
      const largo = Math.ceil(original.length * alfa);

      // Paso 1: estirado, canal a canal.
      const estirado = new OfflineAudioContext(canales, largo, original.sampleRate).createBuffer(
        canales,
        largo,
        original.sampleRate
      );
      for (let c = 0; c < canales; c++) {
        const pista = await estirar(original.getChannelData(c), alfa);
        estirado.copyToChannel(pista.slice(0, largo), c);
      }

      // Paso 2: reproducirlo más rápido. Vuelve a durar lo que duraba y sube
      // de tono; el remuestreo fino lo hace el propio navegador.
      const salida = new OfflineAudioContext(canales, original.length, original.sampleRate);
      const fuente = salida.createBufferSource();
      fuente.buffer = estirado;
      fuente.playbackRate.value = alfa;
      fuente.connect(salida.destination);
      fuente.start();

      return URL.createObjectURL(comoWav(await salida.startRendering()));
    } catch (err) {
      console.warn("[modulador] no se ha podido subir el tono", err);
      return null;
    }
  })();

  hechos.set(llave, trabajo);
  return trabajo;
}
