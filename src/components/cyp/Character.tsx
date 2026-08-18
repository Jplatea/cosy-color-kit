import type { CSSProperties, ReactNode } from "react";

/**
 * Culow y Pililarge, esculpidos en CSS.
 *
 * Culow son dos lóbulos esféricos pegados; Pililarge es una cápsula alta.
 * Ambos comparten el mismo acabado mate: un degradado radial con la luz
 * arriba a la izquierda y una sombra interior abajo a la derecha.
 *
 * `dress` controla si además se pintan ojos, disfraz y complementos: en el
 * hero y en las biografías van desnudos y sin cara; en los dos juguetes,
 * vestidos.
 */

export type CharacterId = "culow" | "pililarge";
export type CostumeId =
  | "none"
  | "larva"
  | "esponja"
  | "cerdita"
  | "amarillos"
  | "astro"
  | "vaquero";
export type ExtraId = "gafas" | "corona" | "pajarita" | "gorro";

export type Extras = Record<ExtraId, boolean>;

export const NO_EXTRAS: Extras = {
  gafas: false,
  corona: false,
  pajarita: false,
  gorro: false,
};

export const COSTUMES: { id: CostumeId; label: string; color: string }[] = [
  { id: "none", label: "Sin disfraz", color: "#f1e8da" },
  { id: "larva", label: "Gusanito", color: "#7c3aed" },
  { id: "esponja", label: "Esponja", color: "#f2c500" },
  { id: "cerdita", label: "Cerdita", color: "#f39ec0" },
  { id: "amarillos", label: "Familia amarilla", color: "#f5cf3d" },
  { id: "astro", label: "Astronauta", color: "#e7ecf2" },
  { id: "vaquero", label: "Vaquero", color: "#b4552f" },
];

export const SWATCHES: { name: string; value: string }[] = [
  { name: "Crema", value: "#f1e8da" },
  { name: "Morado", value: "#7c3aed" },
  { name: "Amarillo", value: "#f2c500" },
  { name: "Rosa", value: "#f39ec0" },
  { name: "Verde", value: "#059669" },
  { name: "Azul", value: "#2563eb" },
  { name: "Teja", value: "#b4552f" },
  { name: "Negro", value: "#26211d" },
];

export const EXTRAS: { id: ExtraId; label: string }[] = [
  { id: "gafas", label: "Gafas de sol" },
  { id: "corona", label: "Corona" },
  { id: "pajarita", label: "Pajarita" },
  { id: "gorro", label: "Gorro de fiesta" },
];

export const SKIN = "#f1e8da";

/** Aclara u oscurece un color hex por una cantidad fija en cada canal. */
export function shade(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount)));
  return `rgb(${clamp((n >> 16) & 255)},${clamp((n >> 8) & 255)},${clamp(n & 255)})`;
}

/** El acabado mate del cuerpo: luz arriba-izquierda, caída hacia el borde. */
function bodyGradient(base: string): string {
  return `radial-gradient(circle at 34% 22%, ${shade(base, 42)}, ${base} 55%, ${shade(base, -70)} 92%)`;
}

/** Textura que algunos disfraces superponen al cuerpo (rayas, poros, costuras). */
function costumeTexture(costume: CostumeId): string | null {
  if (costume === "larva")
    return "repeating-linear-gradient(180deg, rgba(0,0,0,.16) 0 14px, rgba(255,255,255,.06) 14px 34px)";
  if (costume === "esponja")
    return "radial-gradient(circle at 24% 30%, rgba(0,0,0,.18) 0 9px, transparent 10px), radial-gradient(circle at 68% 55%, rgba(0,0,0,.16) 0 12px, transparent 13px), radial-gradient(circle at 40% 78%, rgba(0,0,0,.14) 0 8px, transparent 9px)";
  if (costume === "astro")
    return "linear-gradient(180deg, transparent 38%, rgba(0,0,0,.12) 38% 41%, transparent 41%), linear-gradient(180deg, transparent 62%, rgba(0,0,0,.1) 62% 64%, transparent 64%)";
  return null;
}

function Eyes({ top, size }: { top: string; size: number }) {
  const eye = (side: "left" | "right") => {
    const style: CSSProperties = {
      position: "absolute",
      top,
      [side]: "20%",
      width: size,
      height: size * 1.15,
      borderRadius: "50%",
      background: "#fffdf8",
      boxShadow: "inset 0 2px 5px rgba(0,0,0,.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
    return (
      <div key={side} style={style} className="animate-cyp-blink">
        <div
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: "50%",
            background: "#1a1512",
            transform: "translateY(-12%)",
          }}
        />
      </div>
    );
  };
  return (
    <>
      {eye("left")}
      {eye("right")}
    </>
  );
}

/** Las piezas sueltas de cada disfraz: antenas, orejas, casco, sombrero… */
function CostumeParts({
  costume,
  color,
  char,
  s,
}: {
  costume: CostumeId;
  color: string;
  char: CharacterId;
  s: number;
}) {
  const eyeTop = char === "pililarge" ? "11%" : "16%";
  const eyeSize = 34 * s;
  const parts: ReactNode[] = [];

  if (costume === "larva") {
    (["left", "right"] as const).forEach((side, i) => {
      parts.push(
        <div
          key={`stalk-${side}`}
          style={{
            position: "absolute",
            top: -46 * s,
            [side]: "26%",
            width: 6 * s,
            height: 44 * s,
            background: shade(color, -40),
            borderRadius: 4 * s,
            transform: `rotate(${i ? 16 : -16}deg)`,
          }}
        />
      );
      parts.push(
        <div
          key={`ball-${side}`}
          style={{
            position: "absolute",
            top: -62 * s,
            [side]: "21%",
            width: 22 * s,
            height: 22 * s,
            borderRadius: "50%",
            background: shade(color, 60),
          }}
        />
      );
    });
    parts.push(<Eyes key="eyes" top={eyeTop} size={eyeSize} />);
  } else if (costume === "esponja") {
    parts.push(<Eyes key="eyes" top={eyeTop} size={eyeSize * 1.05} />);
    parts.push(
      <div
        key="shirt"
        style={{
          position: "absolute",
          bottom: "4%",
          left: "8%",
          right: "8%",
          height: 20 * s,
          background: "#fffaf0",
          borderRadius: 4 * s,
        }}
      />
    );
    parts.push(
      <div
        key="belt"
        style={{
          position: "absolute",
          bottom: "4%",
          left: "8%",
          right: "8%",
          height: 9 * s,
          background: "#8a5a2b",
          borderRadius: 3 * s,
        }}
      />
    );
    parts.push(
      <div
        key="tie"
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 16 * s,
          height: 26 * s,
          marginLeft: -8 * s,
          background: "#c0392b",
          clipPath: "polygon(50% 0,100% 100%,50% 74%,0 100%)",
        }}
      />
    );
  } else if (costume === "cerdita") {
    (["left", "right"] as const).forEach((side) => {
      parts.push(
        <div
          key={`ear-${side}`}
          style={{
            position: "absolute",
            top: -18 * s,
            [side]: "24%",
            width: 26 * s,
            height: 30 * s,
            background: shade(color, -18),
            clipPath: "polygon(50% 0,100% 100%,0 100%)",
          }}
        />
      );
    });
    parts.push(<Eyes key="eyes" top={eyeTop} size={eyeSize * 0.85} />);
    parts.push(
      <div
        key="snout"
        style={{
          position: "absolute",
          top: char === "pililarge" ? "24%" : "40%",
          left: "50%",
          width: 48 * s,
          height: 34 * s,
          marginLeft: -24 * s,
          borderRadius: "50%",
          background: shade(color, -26),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8 * s,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 7 * s,
              height: 12 * s,
              borderRadius: "50%",
              background: shade(color, -80),
            }}
          />
        ))}
      </div>
    );
  } else if (costume === "amarillos") {
    parts.push(
      <div
        key="hair"
        style={{
          position: "absolute",
          top: -30 * s,
          left: "14%",
          right: "14%",
          height: 34 * s,
          background: "#2b2b2b",
          clipPath:
            "polygon(0 100%,8% 12%,18% 100%,28% 4%,40% 100%,52% 10%,64% 100%,76% 2%,88% 100%,100% 22%)",
        }}
      />
    );
    parts.push(<Eyes key="eyes" top={eyeTop} size={eyeSize * 1.2} />);
    parts.push(
      <div
        key="mouth"
        style={{
          position: "absolute",
          top: char === "pililarge" ? "26%" : "46%",
          left: "50%",
          width: 40 * s,
          height: 14 * s,
          marginLeft: -20 * s,
          borderRadius: "0 0 40px 40px",
          border: `${3 * s}px solid rgba(0,0,0,.5)`,
          borderTopColor: "transparent",
        }}
      />
    );
  } else if (costume === "astro") {
    parts.push(
      <div
        key="helmet"
        style={{
          position: "absolute",
          top: char === "pililarge" ? "2%" : "-14%",
          left: "50%",
          width: "84%",
          height: char === "pililarge" ? "26%" : "86%",
          marginLeft: "-42%",
          borderRadius: "50%",
          background:
            "linear-gradient(150deg, rgba(255,255,255,.55), rgba(150,190,230,.28) 45%, rgba(255,255,255,.1))",
          border: `${3 * s}px solid rgba(255,255,255,.6)`,
          boxShadow: "inset 0 8px 22px rgba(255,255,255,.35)",
        }}
      />
    );
    parts.push(
      <Eyes key="eyes" top={char === "pililarge" ? "9%" : "30%"} size={eyeSize * 0.8} />
    );
    parts.push(
      <div
        key="panel"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 46 * s,
          height: 30 * s,
          marginLeft: -23 * s,
          borderRadius: 6 * s,
          background: "#2b3138",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6 * s,
        }}
      >
        {["#059669", "#e8b25c", "#2563eb"].map((c) => (
          <div
            key={c}
            style={{ width: 8 * s, height: 8 * s, borderRadius: "50%", background: c }}
          />
        ))}
      </div>
    );
  } else if (costume === "vaquero") {
    parts.push(
      <div
        key="poncho"
        style={{
          position: "absolute",
          top: char === "pililarge" ? "18%" : "34%",
          left: "-6%",
          right: "-6%",
          bottom: "2%",
          background: color,
          clipPath: "polygon(18% 0,82% 0,100% 100%,0 100%)",
          opacity: 0.95,
        }}
      />
    );
    parts.push(
      <div
        key="brim"
        style={{
          position: "absolute",
          top: -26 * s,
          left: "50%",
          width: 132 * s,
          height: 18 * s,
          marginLeft: -66 * s,
          borderRadius: "50%",
          background: "#7a5232",
        }}
      />
    );
    parts.push(
      <div
        key="crown"
        style={{
          position: "absolute",
          top: -52 * s,
          left: "50%",
          width: 62 * s,
          height: 34 * s,
          marginLeft: -31 * s,
          borderRadius: `${10 * s}px ${10 * s}px 0 0`,
          background: "#8a5c38",
        }}
      />
    );
    parts.push(
      <div
        key="bandana"
        style={{
          position: "absolute",
          top: char === "pililarge" ? "15%" : "30%",
          left: "50%",
          width: 54 * s,
          height: 34 * s,
          marginLeft: -27 * s,
          background: "#c0392b",
          clipPath: "polygon(0 0,100% 0,50% 100%)",
        }}
      />
    );
    parts.push(<Eyes key="eyes" top={eyeTop} size={eyeSize * 0.85} />);
  } else {
    parts.push(<Eyes key="eyes" top={eyeTop} size={eyeSize * 0.9} />);
  }

  return <>{parts}</>;
}

function ExtraParts({
  extras,
  char,
  s,
}: {
  extras: Extras;
  char: CharacterId;
  s: number;
}) {
  return (
    <>
      {extras.gafas && (
        <div
          style={{
            position: "absolute",
            top: char === "pililarge" ? "12%" : "17%",
            left: "10%",
            right: "10%",
            height: 30 * s,
            display: "flex",
            alignItems: "center",
            gap: 6 * s,
            zIndex: 6,
          }}
        >
          <div
            style={{
              flex: 1,
              height: "100%",
              borderRadius: 8 * s,
              background: "#181513",
              border: `${2 * s}px solid #3a332d`,
            }}
          />
          <div style={{ width: 12 * s, height: 3 * s, background: "#181513" }} />
          <div
            style={{
              flex: 1,
              height: "100%",
              borderRadius: 8 * s,
              background: "#181513",
              border: `${2 * s}px solid #3a332d`,
            }}
          />
        </div>
      )}
      {extras.corona && (
        <div
          style={{
            position: "absolute",
            top: -40 * s,
            left: "50%",
            width: 84 * s,
            height: 42 * s,
            marginLeft: -42 * s,
            background: "#e8b25c",
            clipPath:
              "polygon(0 100%,0 20%,20% 55%,38% 0,50% 45%,62% 0,80% 55%,100% 20%,100% 100%)",
            zIndex: 7,
          }}
        />
      )}
      {extras.gorro && (
        <div
          style={{
            position: "absolute",
            top: -66 * s,
            left: "50%",
            width: 54 * s,
            height: 70 * s,
            marginLeft: -27 * s,
            background: "repeating-linear-gradient(135deg, #f39ec0 0 10px, #7c3aed 10px 20px)",
            clipPath: "polygon(50% 0,100% 100%,0 100%)",
            zIndex: 7,
          }}
        />
      )}
      {extras.pajarita && (
        <div
          style={{
            position: "absolute",
            bottom: char === "pililarge" ? "12%" : "6%",
            left: "50%",
            width: 62 * s,
            height: 26 * s,
            marginLeft: -31 * s,
            background: "#c0392b",
            clipPath: "polygon(0 0,42% 34%,42% 66%,0 100%,100% 100%,58% 66%,58% 34%,100% 0)",
            zIndex: 6,
          }}
        />
      )}
    </>
  );
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

  const shadow = (
    <div
      style={{
        position: "absolute",
        bottom: -14 * s,
        left: "50%",
        width: 210 * s,
        height: 30 * s,
        marginLeft: -105 * s,
        borderRadius: "50%",
        background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,.62), transparent 72%)",
        filter: "blur(5px)",
      }}
    />
  );

  const dressing = dress ? (
    <>
      <CostumeParts costume={costume} color={base} char={char} s={s} />
      <ExtraParts extras={extras} char={char} s={s} />
    </>
  ) : null;

  if (char === "culow") {
    const lobe = (side: "left" | "right") => (
      <div
        key={side}
        style={{
          position: "absolute",
          [side]: 0,
          bottom: 0,
          width: 132 * s,
          height: 132 * s,
          borderRadius: "50%",
          backgroundImage,
          backgroundBlendMode,
          boxShadow: "inset -12px -14px 26px rgba(70,58,46,.4)",
        }}
      />
    );
    return (
      <div
        className={bobClass}
        style={{ position: "relative", width: 230 * s, height: 150 * s }}
      >
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
        position: "relative",
        width: 132 * s,
        height: 372 * s,
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
