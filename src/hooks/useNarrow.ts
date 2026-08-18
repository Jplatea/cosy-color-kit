import { useEffect, useState } from "react";

/**
 * ¿Estamos en una pantalla estrecha?
 *
 * Los personajes se dibujan en píxeles reales, no con `transform: scale`: un
 * `scale` deja el ancho de layout intacto y el bloque seguiría empujando la
 * página. Por eso el tamaño se decide aquí y se pasa como número.
 */
export function useNarrow(maxWidth = 639) {
  const query = `(max-width: ${maxWidth}px)`;
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    setNarrow(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return narrow;
}
