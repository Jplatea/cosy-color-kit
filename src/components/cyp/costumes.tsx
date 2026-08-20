import type { CSSProperties, ReactNode } from "react";

/**
 * Los disfraces del vestidor.
 *
 * Vive aparte de `Character.tsx` porque son dos cosas distintas: allí está la
 * anatomía de los personajes —que no cambia nunca— y aquí lo que se les pone
 * encima, que es donde se añade cosa nueva. Todo se dibuja con divs, degradados
 * y `clip-path`: ni una imagen, así que un disfraz más no pesa nada.
 *
 * Para añadir uno: entra en COSTUMES con su grupo y su color, y se le da su
 * pinta en `CostumeParts`. Nada más.
 */

export type CharacterId = "culow" | "pililarge";

export type CostumeId =
  | "none"
  // Series
  | "larva" | "esponja" | "cerdita" | "amarillos" | "ninja" | "heroe"
  // Oficios
  | "astro" | "vaquero" | "chef" | "buzo" | "obra"
  // Bichos
  | "abeja" | "rana" | "dino" | "pollito"
  // Fantasía
  | "vampiro" | "fantasma" | "mago" | "robot";

/**
 * Los complementos se pueden poner encima de cualquier disfraz. Los tres
 * últimos no se dibujan aquí sino en el costurero (`piezas.tsx`), que ya los
 * tenía hechos para el sastre: repetirlos habría sido tener el mismo ala en
 * dos sitios y que un día dejaran de parecerse.
 */
export type ExtraId =
  | "gafas"
  | "corona"
  | "pajarita"
  | "gorro"
  | "alas"
  | "pelo"
  | "zapatos";
export type Extras = Record<ExtraId, boolean>;

export const NO_EXTRAS: Extras = {
  gafas: false, corona: false, pajarita: false, gorro: false,
  alas: false, pelo: false, zapatos: false,
};

/** El orden de este array manda: es el orden en que salen los grupos. */
export const GRUPOS = ["Series", "Oficios", "Bichos", "Fantasía"] as const;
export type Grupo = (typeof GRUPOS)[number];

export type Costume = {
  id: CostumeId;
  label: string;
  /** Color por defecto al elegirlo; luego se puede cambiar. */
  color: string;
  /** Sin grupo = va suelto arriba del todo ("Sin disfraz"). */
  grupo?: Grupo;
};

export const COSTUMES: Costume[] = [
  { id: "none", label: "Sin disfraz", color: "#f1e8da" },

  { id: "larva", label: "Gusanito", color: "#7c3aed", grupo: "Series" },
  { id: "esponja", label: "Esponja", color: "#f2c500", grupo: "Series" },
  { id: "cerdita", label: "Cerdita", color: "#f39ec0", grupo: "Series" },
  { id: "amarillos", label: "Familia amarilla", color: "#f5cf3d", grupo: "Series" },
  { id: "ninja", label: "Tortuga ninja", color: "#4f9e3f", grupo: "Series" },
  { id: "heroe", label: "Superhéroe", color: "#2563eb", grupo: "Series" },

  { id: "astro", label: "Astronauta", color: "#e7ecf2", grupo: "Oficios" },
  { id: "vaquero", label: "Vaquero", color: "#b4552f", grupo: "Oficios" },
  { id: "chef", label: "Cocinero", color: "#fdfaf4", grupo: "Oficios" },
  { id: "buzo", label: "Buceador", color: "#1f6f8b", grupo: "Oficios" },
  { id: "obra", label: "Obrero", color: "#f6a821", grupo: "Oficios" },

  { id: "abeja", label: "Abeja", color: "#f2c500", grupo: "Bichos" },
  { id: "rana", label: "Rana", color: "#3fa34d", grupo: "Bichos" },
  { id: "dino", label: "Dinosaurio", color: "#2f9e6b", grupo: "Bichos" },
  { id: "pollito", label: "Pollito", color: "#ffd94a", grupo: "Bichos" },

  { id: "vampiro", label: "Vampiro", color: "#2b2233", grupo: "Fantasía" },
  { id: "fantasma", label: "Fantasma", color: "#eef1f6", grupo: "Fantasía" },
  { id: "mago", label: "Mago", color: "#4c3a8f", grupo: "Fantasía" },
  { id: "robot", label: "Robot", color: "#9aa7b4", grupo: "Fantasía" },
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
  { id: "pelo", label: "Pelo" },
  { id: "alas", label: "Alas" },
  { id: "zapatos", label: "Zapatos" },
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

/** Textura que algunos disfraces superponen al cuerpo (rayas, poros, costuras). */
export function costumeTexture(costume: CostumeId): string | null {
  if (costume === "larva")
    return "repeating-linear-gradient(180deg, rgba(0,0,0,.16) 0 14px, rgba(255,255,255,.06) 14px 34px)";
  if (costume === "esponja")
    return "radial-gradient(circle at 24% 30%, rgba(0,0,0,.18) 0 9px, transparent 10px), radial-gradient(circle at 68% 55%, rgba(0,0,0,.16) 0 12px, transparent 13px), radial-gradient(circle at 40% 78%, rgba(0,0,0,.14) 0 8px, transparent 9px)";
  if (costume === "astro")
    return "linear-gradient(180deg, transparent 38%, rgba(0,0,0,.12) 38% 41%, transparent 41%), linear-gradient(180deg, transparent 62%, rgba(0,0,0,.1) 62% 64%, transparent 64%)";
  if (costume === "abeja")
    return "repeating-linear-gradient(180deg, rgba(0,0,0,.72) 0 16px, transparent 16px 38px)";
  if (costume === "rana")
    return "radial-gradient(circle at 28% 42%, rgba(0,0,0,.16) 0 11px, transparent 12px), radial-gradient(circle at 72% 66%, rgba(0,0,0,.14) 0 9px, transparent 10px)";
  if (costume === "obra")
    return "repeating-linear-gradient(180deg, transparent 0 46%, rgba(255,255,255,.55) 46% 52%, transparent 52% 100%)";
  return null;
}

/**
 * Dónde está la cabeza de cada uno.
 *
 * Pililarge es una cápsula que llena su marco, así que allí «encima de la
 * cabeza» es el borde de arriba. Culow no: son dos esferas apoyadas abajo, y su
 * cuerpo empieza bastante más abajo del techo de la caja. Además su silueta
 * sube sobre cada lóbulo y baja en el valle donde se juntan, así que hacen
 * falta dos alturas: `cima` para lo que va centrado y `lado` para lo que se
 * apoya sobre un lóbulo. Sin esto, en Culow los gorros flotan.
 *
 * Lo usan los disfraces de aquí y las piezas sueltas del costurero, así que
 * vive fuera de los dos: si cambia la anatomía, cambia en un sitio.
 */
export function medidas(char: CharacterId, s: number) {
  const alto = char === "pililarge";
  return {
    alto,
    cima: alto ? 0 : 40 * s,
    lado: alto ? 0 : 20 * s,
    eyeTop: alto ? "11%" : "16%",
    eyeSize: 34 * s,
  };
}

export function Eyes({ top, size }: { top: string; size: number }) {
  const eye = (side: "left" | "right") => {
    const style: CSSProperties = {
      position: "absolute", top, [side]: "20%",
      width: size, height: size * 1.15, borderRadius: "50%",
      background: "#fffdf8", boxShadow: "inset 0 2px 5px rgba(0,0,0,.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
    };
    return (
      <div key={side} style={style} className="animate-cyp-blink">
        <div style={{
          width: size * 0.42, height: size * 0.42, borderRadius: "50%",
          background: "#1a1512", transform: "translateY(-12%)",
        }} />
      </div>
    );
  };
  return <>{eye("left")}{eye("right")}</>;
}

/** Las piezas sueltas de cada disfraz: antenas, orejas, cascos, sombreros… */
export function CostumeParts({
  costume, color, char, s,
}: {
  costume: CostumeId; color: string; char: CharacterId; s: number;
}) {
  const { alto, eyeTop, cima, lado, eyeSize } = medidas(char, s);
  const P: ReactNode[] = [];
  const cara = (mult = 1, top = eyeTop) => P.push(<Eyes key="eyes" top={top} size={eyeSize * mult} />);

  if (costume === "larva") {
    (["left", "right"] as const).forEach((side, i) => {
      P.push(<div key={`st${side}`} style={{ position: "absolute", top: -46 * s + lado, [side]: "26%", width: 6 * s, height: 44 * s, background: shade(color, -40), borderRadius: 4 * s, transform: `rotate(${i ? 16 : -16}deg)` }} />);
      P.push(<div key={`ba${side}`} style={{ position: "absolute", top: -62 * s + lado, [side]: "21%", width: 22 * s, height: 22 * s, borderRadius: "50%", background: shade(color, 60) }} />);
    });
    cara();
  } else if (costume === "esponja") {
    cara(1.05);
    P.push(<div key="sh" style={{ position: "absolute", bottom: alto ? "4%" : "15%", left: alto ? "8%" : "13%", right: alto ? "8%" : "13%", height: 20 * s, background: "#fffaf0", borderRadius: 4 * s }} />);
    P.push(<div key="be" style={{ position: "absolute", bottom: alto ? "4%" : "15%", left: alto ? "8%" : "13%", right: alto ? "8%" : "13%", height: 9 * s, background: "#8a5a2b", borderRadius: 3 * s }} />);
    P.push(<div key="ti" style={{ position: "absolute", top: "40%", left: "50%", width: 16 * s, height: 26 * s, marginLeft: -8 * s, background: "#c0392b", clipPath: "polygon(50% 0,100% 100%,50% 74%,0 100%)" }} />);
  } else if (costume === "cerdita") {
    (["left", "right"] as const).forEach((side) => {
      P.push(<div key={`ea${side}`} style={{ position: "absolute", top: -18 * s + lado, [side]: "24%", width: 26 * s, height: 30 * s, background: shade(color, -18), clipPath: "polygon(50% 0,100% 100%,0 100%)" }} />);
    });
    cara(0.85);
    P.push(
      <div key="sn" style={{ position: "absolute", top: alto ? "24%" : "40%", left: "50%", width: 48 * s, height: 34 * s, marginLeft: -24 * s, borderRadius: "50%", background: shade(color, -26), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 * s }}>
        {[0, 1].map((i) => <div key={i} style={{ width: 7 * s, height: 12 * s, borderRadius: "50%", background: shade(color, -80) }} />)}
      </div>
    );
  } else if (costume === "amarillos") {
    P.push(<div key="ha" style={{ position: "absolute", top: -30 * s + lado, left: "14%", right: "14%", height: 34 * s, background: "#2b2b2b", clipPath: "polygon(0 100%,8% 12%,18% 100%,28% 4%,40% 100%,52% 10%,64% 100%,76% 2%,88% 100%,100% 22%)" }} />);
    cara(1.2);
    P.push(<div key="mo" style={{ position: "absolute", top: alto ? "26%" : "46%", left: "50%", width: 40 * s, height: 14 * s, marginLeft: -20 * s, borderRadius: "0 0 40px 40px", border: `${3 * s}px solid rgba(0,0,0,.5)`, borderTopColor: "transparent" }} />);
  } else if (costume === "ninja") {
    // Caparazón: óvalo marrón con placas, bien abajo para que no tape la cara.
    P.push(<div key="ca" style={{ position: "absolute", top: alto ? "44%" : "46%", left: "12%", right: "12%", bottom: alto ? "6%" : "2%", borderRadius: "50%", background: `radial-gradient(circle at 40% 30%, #b07a3c, #6b4420 78%)`, border: `${3 * s}px solid #4e3117`, boxShadow: "inset 0 -8px 16px rgba(0,0,0,.45)" }} />);
    [[-24, -8], [10, -8], [-7, 16]].forEach(([x, y], i) =>
      P.push(<div key={`pl${i}`} style={{ position: "absolute", top: `calc(${alto ? "56%" : "60%"} + ${y * s}px)`, left: "50%", marginLeft: x * s, width: 26 * s, height: 20 * s, borderRadius: 6 * s, background: "rgba(0,0,0,.16)" }} />)
    );
    cara(0.85);
    // La cinta cruza justo por los ojos, con las dos colas al viento.
    P.push(<div key="ban" style={{ position: "absolute", top: `calc(${eyeTop} + ${6 * s}px)`, left: alto ? "-4%" : "11%", right: alto ? "-4%" : "11%", height: 15 * s, background: "#c0392b", zIndex: 4 }} />);
    P.push(<div key="t1" style={{ position: "absolute", top: `calc(${eyeTop} + ${4 * s}px)`, right: alto ? "-24%" : "-5%", width: 46 * s, height: 8 * s, background: "#c0392b", borderRadius: 3 * s, transform: "rotate(-14deg)", zIndex: 4 }} />);
    P.push(<div key="t2" style={{ position: "absolute", top: `calc(${eyeTop} + ${18 * s}px)`, right: alto ? "-22%" : "-3%", width: 38 * s, height: 7 * s, background: "#a32f22", borderRadius: 3 * s, transform: "rotate(8deg)", zIndex: 4 }} />);
  } else if (costume === "heroe") {
    P.push(<div key="cape" style={{ position: "absolute", top: alto ? "14%" : "30%", left: "-22%", right: "-22%", bottom: "-4%", background: shade(color, -50), clipPath: "polygon(28% 0,72% 0,100% 100%,0 100%)", zIndex: -1 }} />);
    cara(0.85);
    // Antifaz: una franja estrecha a la altura de los ojos, con pico entre ceja y ceja.
    P.push(<div key="mask" style={{ position: "absolute", top: alto ? `calc(${eyeTop} - ${9 * s}px)` : `calc(${eyeTop} + ${2 * s}px)`, left: alto ? "8%" : "15%", right: alto ? "8%" : "15%", height: 30 * s, background: shade(color, -30), clipPath: "polygon(0 0,42% 0,50% 34%,58% 0,100% 0,100% 62%,74% 100%,50% 74%,26% 100%,0 62%)", zIndex: 4 }} />);
    P.push(<div key="em" style={{ position: "absolute", top: alto ? "44%" : "58%", left: "50%", width: 56 * s, height: 56 * s, marginLeft: -28 * s, background: "#f6c877", clipPath: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.4))" }} />);
  } else if (costume === "astro") {
    P.push(<div key="he" style={{ position: "absolute", top: alto ? "2%" : "-14%", left: "50%", width: "84%", height: alto ? "26%" : "86%", marginLeft: "-42%", borderRadius: "50%", background: "linear-gradient(150deg, rgba(255,255,255,.55), rgba(150,190,230,.28) 45%, rgba(255,255,255,.1))", border: `${3 * s}px solid rgba(255,255,255,.6)`, boxShadow: "inset 0 8px 22px rgba(255,255,255,.35)" }} />);
    cara(0.8, alto ? "9%" : "30%");
    P.push(
      <div key="pa" style={{ position: "absolute", top: "50%", left: "50%", width: 46 * s, height: 30 * s, marginLeft: -23 * s, borderRadius: 6 * s, background: "#2b3138", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 * s }}>
        {["#059669", "#e8b25c", "#2563eb"].map((c) => <div key={c} style={{ width: 8 * s, height: 8 * s, borderRadius: "50%", background: c }} />)}
      </div>
    );
  } else if (costume === "vaquero") {
    P.push(<div key="po" style={{ position: "absolute", top: alto ? "18%" : "34%", left: "-6%", right: "-6%", bottom: "2%", background: color, clipPath: "polygon(18% 0,82% 0,100% 100%,0 100%)", opacity: 0.95 }} />);
    P.push(<div key="br" style={{ position: "absolute", top: -26 * s + cima, left: "50%", width: 132 * s, height: 18 * s, marginLeft: -66 * s, borderRadius: "50%", background: "#7a5232" }} />);
    P.push(<div key="cr" style={{ position: "absolute", top: -52 * s + cima, left: "50%", width: 62 * s, height: 34 * s, marginLeft: -31 * s, borderRadius: `${10 * s}px ${10 * s}px 0 0`, background: "#8a5c38" }} />);
    P.push(<div key="ba" style={{ position: "absolute", top: alto ? "15%" : "30%", left: "50%", width: 54 * s, height: 34 * s, marginLeft: -27 * s, background: "#c0392b", clipPath: "polygon(0 0,100% 0,50% 100%)" }} />);
    cara(0.85);
  } else if (costume === "chef") {
    // El gorro se apoya en la cabeza: la cinta pisa el cuerpo y el fuelle sale de ella.
    P.push(<div key="ba" style={{ position: "absolute", top: -18 * s + cima, left: "50%", width: 86 * s, height: 24 * s, marginLeft: -43 * s, borderRadius: 5 * s, background: "#f4eee2", boxShadow: "0 3px 6px rgba(0,0,0,.28)" }} />);
    P.push(<div key="pu" style={{ position: "absolute", top: -62 * s + cima, left: "50%", width: 98 * s, height: 52 * s, marginLeft: -49 * s, borderRadius: `${44 * s}px ${44 * s}px ${10 * s}px ${10 * s}px`, background: "radial-gradient(circle at 34% 24%, #ffffff, #ece5d8 82%)", boxShadow: "inset 0 -7px 13px rgba(0,0,0,.12)" }} />);
    cara(0.85);
    P.push(<div key="pañ" style={{ position: "absolute", bottom: alto ? "10%" : "2%", left: "50%", width: 70 * s, height: 30 * s, marginLeft: -35 * s, background: "#c0392b", clipPath: "polygon(0 0,100% 0,50% 100%)" }} />);
  } else if (costume === "buzo") {
    cara(0.8);
    // Correa por detrás, y las gafas encima: se ven los ojos a través del cristal.
    P.push(<div key="ci" style={{ position: "absolute", top: `calc(${eyeTop} + ${12 * s}px)`, left: alto ? "-4%" : "9%", right: alto ? "-4%" : "9%", height: 9 * s, background: shade(color, -45), zIndex: 4 }} />);
    P.push(<div key="ma" style={{ position: "absolute", top: `calc(${eyeTop} - ${10 * s}px)`, left: "12%", right: "12%", height: 52 * s, borderRadius: `${22 * s}px ${22 * s}px ${16 * s}px ${16 * s}px`, background: "linear-gradient(160deg, rgba(200,238,250,.42), rgba(90,160,190,.30))", border: `${4 * s}px solid ${shade(color, -25)}`, boxShadow: "inset 0 4px 10px rgba(255,255,255,.30)", zIndex: 5 }} />);
    P.push(<div key="tu" style={{ position: "absolute", top: -44 * s + cima, right: alto ? "2%" : "12%", width: 11 * s, height: 82 * s, borderRadius: 6 * s, background: "#f6a821", zIndex: 5 }} />);
    P.push(<div key="tu2" style={{ position: "absolute", top: -44 * s + cima, right: alto ? "2%" : "12%", width: 30 * s, height: 11 * s, borderRadius: 6 * s, background: "#f6a821", zIndex: 5 }} />);
  } else if (costume === "obra") {
    P.push(<div key="do" style={{ position: "absolute", top: -50 * s + cima, left: "50%", width: 92 * s, height: 50 * s, marginLeft: -46 * s, borderRadius: `${46 * s}px ${46 * s}px 0 0`, background: `linear-gradient(180deg, ${shade(color, 40)}, ${color})` }} />);
    P.push(<div key="br" style={{ position: "absolute", top: -8 * s + cima, left: "50%", width: 118 * s, height: 12 * s, marginLeft: -59 * s, borderRadius: 6 * s, background: shade(color, -30) }} />);
    cara(0.85);
  } else if (costume === "abeja") {
    (["left", "right"] as const).forEach((side, i) => {
      P.push(<div key={`al${side}`} style={{ position: "absolute", top: alto ? "22%" : "18%", [side]: "-26%", width: 54 * s, height: 74 * s, borderRadius: "50%", background: "rgba(255,255,255,.42)", border: "1px solid rgba(255,255,255,.5)", transform: `rotate(${i ? 18 : -18}deg)`, zIndex: -1 }} />);
      P.push(<div key={`an${side}`} style={{ position: "absolute", top: -34 * s + lado, [side]: "30%", width: 4 * s, height: 32 * s, background: "#2b2b2b", borderRadius: 2 * s, transform: `rotate(${i ? 14 : -14}deg)` }} />);
      P.push(<div key={`ap${side}`} style={{ position: "absolute", top: -44 * s + lado, [side]: "26%", width: 14 * s, height: 14 * s, borderRadius: "50%", background: "#2b2b2b" }} />);
    });
    cara(0.9);
  } else if (costume === "rana") {
    // Los ojos van encima de la cabeza, que es lo que hace que se lea como rana.
    (["left", "right"] as const).forEach((side) => {
      P.push(
        <div key={`oj${side}`} style={{ position: "absolute", top: -30 * s + lado, [side]: "18%", width: 42 * s, height: 42 * s, borderRadius: "50%", background: "#fffdf8", border: `${2 * s}px solid ${shade(color, -40)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 16 * s, height: 16 * s, borderRadius: "50%", background: "#1a1512" }} />
        </div>
      );
    });
    P.push(<div key="bo" style={{ position: "absolute", top: alto ? "20%" : "42%", left: "18%", right: "18%", height: 8 * s, borderRadius: 4 * s, background: shade(color, -55) }} />);
  } else if (costume === "dino") {
    [0, 1, 2, 3].forEach((i) => {
      P.push(<div key={`cr${i}`} style={{ position: "absolute", top: (-26 + i * 2) * s + lado, left: `${18 + i * 18}%`, width: 20 * s, height: 26 * s, background: shade(color, -45), clipPath: "polygon(50% 0,100% 100%,0 100%)" }} />);
    });
    cara(0.85);
    P.push(<div key="di" style={{ position: "absolute", top: alto ? "24%" : "44%", left: "22%", right: "22%", height: 14 * s, background: "#fffdf8", clipPath: "polygon(0 0,100% 0,92% 100%,83% 20%,75% 100%,66% 20%,58% 100%,50% 20%,41% 100%,33% 20%,25% 100%,16% 20%,8% 100%,0 20%)" }} />);
  } else if (costume === "pollito") {
    P.push(<div key="cre" style={{ position: "absolute", top: -20 * s + cima, left: "50%", width: 30 * s, height: 24 * s, marginLeft: -15 * s, background: "#e8623c", clipPath: "polygon(50% 0,100% 100%,0 100%)" }} />);
    (["left", "right"] as const).forEach((side, i) => {
      P.push(<div key={`ala${side}`} style={{ position: "absolute", top: alto ? "34%" : "34%", [side]: "-14%", width: 34 * s, height: 52 * s, borderRadius: "50%", background: shade(color, -22), transform: `rotate(${i ? 12 : -12}deg)`, zIndex: -1 }} />);
    });
    cara(0.85);
    P.push(<div key="pi" style={{ position: "absolute", top: alto ? "22%" : "40%", left: "50%", width: 26 * s, height: 20 * s, marginLeft: -13 * s, background: "#f6a821", clipPath: "polygon(50% 100%,0 0,100% 0)" }} />);
  } else if (costume === "vampiro") {
    P.push(<div key="cue" style={{ position: "absolute", top: alto ? "6%" : "2%", left: "-14%", right: "-14%", height: 66 * s, background: "#7d1128", clipPath: "polygon(0 100%,14% 0,50% 60%,86% 0,100% 100%)", zIndex: -1 }} />);
    P.push(<div key="cap" style={{ position: "absolute", top: alto ? "20%" : "26%", left: "-18%", right: "-18%", bottom: "0%", background: shade(color, -20), clipPath: "polygon(26% 0,74% 0,100% 100%,0 100%)", zIndex: -1 }} />);
    cara(0.85);
    P.push(<div key="col" style={{ position: "absolute", top: alto ? "24%" : "42%", left: "50%", width: 30 * s, height: 16 * s, marginLeft: -15 * s, background: "#fffdf8", clipPath: "polygon(0 0,100% 0,78% 100%,60% 12%,40% 12%,22% 100%)" }} />);
  } else if (costume === "fantasma") {
    // Sin blanco de ojo: dos huecos negros, que es lo que lo hace fantasma.
    (["left", "right"] as const).forEach((side) => {
      P.push(<div key={`hu${side}`} style={{ position: "absolute", top: eyeTop, [side]: "22%", width: 30 * s, height: 38 * s, borderRadius: "50%", background: "#15121a" }} />);
    });
    P.push(<div key="bo" style={{ position: "absolute", top: alto ? "22%" : "44%", left: "50%", width: 26 * s, height: 32 * s, marginLeft: -13 * s, borderRadius: "50%", background: "#15121a" }} />);
    P.push(<div key="fle" style={{ position: "absolute", left: alto ? "-2%" : "14%", right: alto ? "-2%" : "14%", bottom: alto ? -10 * s : 6 * s, height: 26 * s, background: shade(color, -6), clipPath: "polygon(0 0,100% 0,100% 40%,88% 100%,75% 40%,62% 100%,50% 40%,38% 100%,25% 40%,12% 100%,0 40%)" }} />);
  } else if (costume === "mago") {
    P.push(<div key="som" style={{ position: "absolute", top: -86 * s + cima, left: "50%", width: 96 * s, height: 92 * s, marginLeft: -48 * s, background: `linear-gradient(180deg, ${shade(color, 30)}, ${shade(color, -30)})`, clipPath: "polygon(50% 0,100% 100%,0 100%)" }} />);
    P.push(<div key="ala" style={{ position: "absolute", top: -12 * s + cima, left: "50%", width: 124 * s, height: 14 * s, marginLeft: -62 * s, borderRadius: "50%", background: shade(color, -40) }} />);
    [[-20, -60], [12, -44], [-4, -30]].map(([x, y], i) =>
      P.push(<div key={`es${i}`} style={{ position: "absolute", top: y * s + cima, left: "50%", marginLeft: x * s, width: 10 * s, height: 10 * s, background: "#f6c877", clipPath: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }} />)
    );
    cara(0.8);
    P.push(<div key="bar" style={{ position: "absolute", top: alto ? "22%" : "42%", left: "50%", width: 66 * s, height: 60 * s, marginLeft: -33 * s, background: "#f2ece2", clipPath: "polygon(14% 0,86% 0,74% 62%,50% 100%,26% 62%)", opacity: 0.95 }} />);
  } else if (costume === "robot") {
    P.push(<div key="ant" style={{ position: "absolute", top: -44 * s + cima, left: "50%", width: 5 * s, height: 40 * s, marginLeft: -2.5 * s, background: shade(color, -40) }} />);
    P.push(<div key="bol" style={{ position: "absolute", top: -58 * s + cima, left: "50%", width: 18 * s, height: 18 * s, marginLeft: -9 * s, borderRadius: "50%", background: "#e8b25c", boxShadow: "0 0 14px rgba(232,178,92,.75)" }} />);
    (["left", "right"] as const).forEach((side) => {
      P.push(
        <div key={`oj${side}`} style={{ position: "absolute", top: eyeTop, [side]: "20%", width: 34 * s, height: 24 * s, borderRadius: 5 * s, background: "#141a20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 16 * s, height: 8 * s, borderRadius: 3 * s, background: "#4fd1c5", boxShadow: "0 0 10px rgba(79,209,197,.9)" }} />
        </div>
      );
    });
    P.push(
      <div key="pan" style={{ position: "absolute", top: alto ? "40%" : "58%", left: "50%", width: 60 * s, height: 36 * s, marginLeft: -30 * s, borderRadius: 6 * s, background: "#141a20", border: `${2 * s}px solid ${shade(color, -30)}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 * s }}>
        {["#e8623c", "#f6c877", "#4fd1c5"].map((c) => <div key={c} style={{ width: 9 * s, height: 9 * s, borderRadius: "50%", background: c }} />)}
      </div>
    );
  } else {
    cara(0.9);
  }

  return <>{P}</>;
}

export function ExtraParts({ extras, char, s }: { extras: Extras; char: CharacterId; s: number }) {
  const alto = char === "pililarge";
  /** Igual que en `CostumeParts`: en Culow la coronilla no es el techo. */
  const cima = alto ? 0 : 40 * s;
  return (
    <>
      {extras.gafas && (
        <div style={{ position: "absolute", top: alto ? "12%" : "20%", left: alto ? "10%" : "17%", right: alto ? "10%" : "17%", height: 30 * s, display: "flex", alignItems: "center", gap: 6 * s, zIndex: 6 }}>
          <div style={{ flex: 1, height: "100%", borderRadius: 8 * s, background: "#181513", border: `${2 * s}px solid #3a332d` }} />
          <div style={{ width: 12 * s, height: 3 * s, background: "#181513" }} />
          <div style={{ flex: 1, height: "100%", borderRadius: 8 * s, background: "#181513", border: `${2 * s}px solid #3a332d` }} />
        </div>
      )}
      {extras.corona && (
        <div style={{ position: "absolute", top: -40 * s + cima, left: "50%", width: 84 * s, height: 42 * s, marginLeft: -42 * s, background: "#e8b25c", clipPath: "polygon(0 100%,0 20%,20% 55%,38% 0,50% 45%,62% 0,80% 55%,100% 20%,100% 100%)", zIndex: 7 }} />
      )}
      {extras.gorro && (
        <div style={{ position: "absolute", top: -66 * s + cima, left: "50%", width: 54 * s, height: 70 * s, marginLeft: -27 * s, background: "repeating-linear-gradient(135deg, #f39ec0 0 10px, #7c3aed 10px 20px)", clipPath: "polygon(50% 0,100% 100%,0 100%)", zIndex: 7 }} />
      )}
      {extras.pajarita && (
        <div style={{ position: "absolute", bottom: alto ? "12%" : "18%", left: "50%", width: 62 * s, height: 26 * s, marginLeft: -31 * s, background: "#c0392b", clipPath: "polygon(0 0,42% 34%,42% 66%,0 100%,100% 100%,58% 66%,58% 34%,100% 0)", zIndex: 6 }} />
      )}
    </>
  );
}
