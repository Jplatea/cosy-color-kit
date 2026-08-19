import { useCallback, useEffect, useState } from "react";

/**
 * Los últimos encargos al sastre.
 *
 * Solo se guarda la frase que se escribió, no el disfraz. El sastre es
 * determinista —la misma descripción da siempre el mismo traje—, así que con
 * el texto basta para reconstruirlo entero, y la lista ocupa nada.
 *
 * Vive en este navegador. No es la lista de encargos del museo, es la tuya:
 * lo que escribe un visitante no se le enseña a los demás.
 */

const CLAVE = "cyp:encargos";
const MAXIMO = 8;

function leer(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useEncargos() {
  const [encargos, setEncargos] = useState<string[]>([]);

  // Se lee después de montar y no en el estado inicial: así el HTML que pinta
  // el servidor y el primero que pinta el navegador son el mismo.
  useEffect(() => setEncargos(leer()), []);

  const guardar = useCallback((lista: string[]) => {
    setEncargos(lista);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista));
    } catch {
      /* almacenamiento lleno o bloqueado: la lista vale para esta visita */
    }
  }, []);

  /** Apunta un encargo. Si ya estaba, sube al principio en vez de duplicarse. */
  const apuntar = useCallback(
    (texto: string) => {
      const limpio = texto.trim();
      if (!limpio) return;
      const sinRepetir = leer().filter((x) => x.toLowerCase() !== limpio.toLowerCase());
      guardar([limpio, ...sinRepetir].slice(0, MAXIMO));
    },
    [guardar]
  );

  const olvidar = useCallback(
    (texto: string) => guardar(leer().filter((x) => x !== texto)),
    [guardar]
  );

  const vaciar = useCallback(() => guardar([]), [guardar]);

  return { encargos, apuntar, olvidar, vaciar };
}
