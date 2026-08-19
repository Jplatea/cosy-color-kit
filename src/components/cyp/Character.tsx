import { CostumeParts, ExtraParts, NO_EXTRAS, SKIN, costumeTexture, shade } from "./costumes";
import type { CharacterId, CostumeId, Extras } from "./costumes";

/**
 * Culow y Pililarge, esculpidos en CSS.
 *
 * Culow son dos lóbulos esféricos pegados; Pililarge es una cápsula alta.
 * Ambos comparten el mismo acabado mate: un degradado radial con la luz arriba
 * a la izquierda y una sombra interior abajo a la derecha.
 *
 * Aquí solo vive la anatomía, que no cambia nunca. Lo que se les pone encima
 * está en `costumes.tsx`, que es donde se añade cosa nueva.
 *
 * `dress` controla si además se pintan ojos, disfraz y complementos: en el hero
 * y en las biografías van desnudos y sin cara; en los juguetes, vestidos.
 */

export type { CharacterId, CostumeId, ExtraId, Extras, Costume, Grupo } from "./costumes";
export { COSTUMES, SWATCHES, EXTRAS, GRUPOS, NO_EXTRAS, SKIN, shade } from "./costumes";

/** El acabado mate del cuerpo: luz arriba-izquierda, caída hacia el borde. */
function bodyGradient(base: string): string {
  return `radial-gradient(circle at 34% 22%, ${shade(base, 42)}, ${base} 55%, ${shade(base, -70)} 92%)`;
}

export type CharacterProps = {
  char: CharacterId;
  /** 1 = tamaño del hero. */
  scale?: number;
  /** Si es false, sale desnudo y sin cara (hero y biografías). */
  dress?: boolean;
  costume?: CostumeId;
  color?: string;
  extras?: Extras;
  /** Flotación en bucle. */
  bob?: boolean;
};

export function Character({
  char,
  scale = 1,
  dress = false,
  costume = "none",
  color,
  extras = NO_EXTRAS,
  bob = false,
}: CharacterProps) {
  const s = scale;
  const base = costume === "none" ? SKIN : color || SKIN;
  const texture = costumeTexture(costume);
  const backgroundImage = texture ? `${texture},${bodyGradient(base)}` : bodyGradient(base);
  const backgroundBlendMode = texture ? "multiply" : "normal";

  const bobClass = bob
    ? char === "culow" ? "animate-cyp-bob" : "animate-cyp-bob-slow"
    : undefined;

  const shadow = (
    <div style={{
      position: "absolute", bottom: -14 * s, left: "50%", width: 210 * s, height: 30 * s,
      marginLeft: -105 * s, borderRadius: "50%",
      background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,.62), transparent 72%)",
      filter: "blur(5px)",
    }} />
  );

  const dressing = dress ? (
    <>
      <CostumeParts costume={costume} color={base} char={char} s={s} />
      <ExtraParts extras={extras} char={char} s={s} />
    </>
  ) : null;

  if (char === "culow") {
    const lobe = (side: "left" | "right") => (
      <div key={side} style={{
        position: "absolute", [side]: 0, bottom: 0, width: 132 * s, height: 132 * s,
        borderRadius: "50%", backgroundImage, backgroundBlendMode,
        boxShadow: "inset -12px -14px 26px rgba(70,58,46,.4)",
      }} />
    );
    return (
      <div className={bobClass} style={{ position: "relative", width: 230 * s, height: 150 * s }}>
        {lobe("left")}
        {lobe("right")}
        {shadow}
        {dressing}
      </div>
    );
  }

  return (
    <div
      className={bobClass}
      style={{
        position: "relative", width: 132 * s, height: 372 * s, borderRadius: 70 * s,
        backgroundImage, backgroundBlendMode,
        boxShadow: "inset -16px -10px 34px rgba(70,58,46,.36)",
      }}
    >
      {shadow}
      {dressing}
    </div>
  );
}
