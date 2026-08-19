
import {
  CostumeParts,
  ExtraParts,
  NO_EXTRAS,
  SKIN,
  costumeTexture,
  shade,
  type CharacterId,
  type CostumeId,
  type Extras,
} from "./costumes";

/**
 * Culow y Pililarge, esculpidos en CSS.
 *
 * Culow son dos lóbulos esféricos pegados; Pililarge es una cápsula alta. Sin
 * patas y sin brazos a propósito: la silueta limpia es la marca, y en cuanto
 * se les cuelgan extremidades dejan de parecer las esculturas del canal.
 *
 * Ambos comparten el mismo acabado mate: un degradado radial con la luz arriba
 * a la izquierda y una sombra interior abajo a la derecha.
 *
 * `dress` controla si además se pintan ojos, disfraz y complementos: en el
 * hero y en las biografías van desnudos y sin cara; en los dos juguetes,
 * vestidos.
 */

/** Medidas base (a escala 1). Todo lo demás se deriva de aquí. */
const BODY = {
  culow: { w: 230, h: 150, lobe: 132 },
  pililarge: { w: 132, h: 372 },
} as const;

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
  const backgroundImage = texture
    ? `${texture},${bodyGradient(base)}`
    : bodyGradient(base);
  const backgroundBlendMode = texture ? "multiply" : "normal";

  const bobClass = bob
    ? char === "culow"
      ? "animate-cyp-bob"
      : "animate-cyp-bob-slow"
    : undefined;

  const dressing = dress ? (
    <>
      <CostumeParts costume={costume} color={base} char={char} s={s} />
      <ExtraParts extras={extras} char={char} s={s} />
    </>
  ) : null;

  /**
   * La sombra sobre la peana. Va tibia y suave, no negra: las piezas se
   * exponen sobre piedra clara y una sombra dura las despegaría del suelo.
   */
  const shadow = (
    <div
      style={{
        position: "absolute",
        bottom: -12 * s,
        left: "50%",
        width: 200 * s,
        height: 26 * s,
        marginLeft: -100 * s,
        borderRadius: "50%",
        background: "radial-gradient(50% 50% at 50% 50%, rgba(52,42,30,.32), transparent 72%)",
        filter: "blur(7px)",
      }}
    />
  );

  if (char === "culow") {
    const m = BODY.culow;
    const lobe = (side: "left" | "right") => (
      <div
        key={side}
        style={{
          position: "absolute",
          [side]: 0,
          bottom: 0,
          width: m.lobe * s,
          height: m.lobe * s,
          borderRadius: "50%",
          backgroundImage,
          backgroundBlendMode,
          boxShadow: "inset -12px -14px 26px rgba(70,58,46,.4)",
        }}
      />
    );

    return (
      <div className={bobClass} style={{ position: "relative", width: m.w * s, height: m.h * s }}>
        {lobe("left")}
        {lobe("right")}
        {shadow}
        {dressing}
      </div>
    );
  }

  const m = BODY.pililarge;

  return (
    <div
      className={bobClass}
      style={{
        position: "relative",
        width: m.w * s,
        height: m.h * s,
        borderRadius: 70 * s,
        backgroundImage,
        backgroundBlendMode,
        boxShadow: "inset -16px -10px 34px rgba(70,58,46,.36)",
      }}
    >
      {shadow}
      {dressing}
    </div>
  );
}

export type { CharacterId, CostumeId, Extras } from "./costumes";
export { COSTUMES, EXTRAS, GRUPOS, NO_EXTRAS, SKIN, SWATCHES, shade } from "./costumes";
