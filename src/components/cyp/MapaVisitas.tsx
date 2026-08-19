import { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import topoUrl from "world-atlas/countries-110m.json?url";

/**
 * Mapa mundial de visitas.
 *
 * Geometría real (Natural Earth 110m, vía world-atlas), países teñidos según
 * volumen y un punto amarillo por país cuyo tamaño crece con las visitas.
 * El TopoJSON se carga aparte para que no engorde el bundle inicial.
 */

const W = 760;
const H = 400;

/** Natural Earth identifica los países por código ISO-3166 numérico. */
const ISO_A2_TO_NUM: Record<string, string> = {
  ES: "724", PT: "620", FR: "250", DE: "276", IT: "380", GB: "826", IE: "372",
  NL: "528", BE: "056", CH: "756", AT: "040", PL: "616", CZ: "203", SE: "752",
  NO: "578", DK: "208", FI: "246", GR: "300", RO: "642", HU: "348", RU: "643",
  UA: "804", TR: "792",
  MX: "484", CO: "170", PE: "604", CL: "152", AR: "032", UY: "858", PY: "600",
  BO: "068", VE: "862", EC: "218", PA: "591", CR: "188", GT: "320", SV: "222",
  HN: "340", NI: "558", DO: "214", CU: "192", PR: "630", BR: "076",
  US: "840", CA: "124",
  MA: "504", DZ: "012", TN: "788", EG: "818", NG: "566", ZA: "710",
  IL: "376", AE: "784", SA: "682", PK: "586", IN: "356", TH: "764", ID: "360",
  PH: "608", CN: "156", HK: "344", JP: "392", KR: "410", SG: "702", TW: "158",
  AU: "036", NZ: "554",
};

const NAMES: Record<string, string> = {
  "724": "España", "620": "Portugal", "250": "Francia", "276": "Alemania",
  "380": "Italia", "826": "Reino Unido", "372": "Irlanda", "528": "Países Bajos",
  "056": "Bélgica", "756": "Suiza", "040": "Austria", "616": "Polonia",
  "203": "Chequia", "752": "Suecia", "578": "Noruega", "208": "Dinamarca",
  "246": "Finlandia", "300": "Grecia", "642": "Rumanía", "348": "Hungría",
  "643": "Rusia", "804": "Ucrania", "792": "Turquía",
  "484": "México", "170": "Colombia", "604": "Perú", "152": "Chile",
  "032": "Argentina", "858": "Uruguay", "600": "Paraguay", "068": "Bolivia",
  "862": "Venezuela", "218": "Ecuador", "591": "Panamá", "188": "Costa Rica",
  "320": "Guatemala", "222": "El Salvador", "340": "Honduras", "558": "Nicaragua",
  "214": "R. Dominicana", "192": "Cuba", "630": "Puerto Rico", "076": "Brasil",
  "840": "Estados Unidos", "124": "Canadá",
  "504": "Marruecos", "012": "Argelia", "788": "Túnez", "818": "Egipto",
  "566": "Nigeria", "710": "Sudáfrica",
  "376": "Israel", "784": "Emiratos", "682": "Arabia Saudí", "586": "Pakistán",
  "356": "India", "764": "Tailandia", "360": "Indonesia", "608": "Filipinas",
  "156": "China", "344": "Hong Kong", "392": "Japón", "410": "Corea del Sur",
  "702": "Singapur", "158": "Taiwán", "036": "Australia", "554": "Nueva Zelanda",
};

/** Acepta códigos alfa-2 (`ES`) o numéricos (`724`) y los unifica a numérico. */
function toNumericCodes(raw: Record<string, number> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  Object.entries(raw || {}).forEach(([key, value]) => {
    const code = /^\d+$/.test(key) ? key.padStart(3, "0") : ISO_A2_TO_NUM[key.toUpperCase()];
    if (code) out[code] = (out[code] || 0) + value;
  });
  return out;
}

type Dot = { code: string; value: number; x: number; y: number; name: string };
type Tip = { x: number; y: number; text: string } | null;

export function MapaVisitas({
  countries,
  live = false,
}: {
  countries?: Record<string, number>;
  /** Si el backend responde pero aún no hay países, el mapa sale vacío en vez de inventar. */
  live?: boolean;
}) {
  const [features, setFeatures] = useState<FeatureCollection<Geometry> | null>(null);
  const [tip, setTip] = useState<Tip>(null);

  useEffect(() => {
    let alive = true;
    fetch(topoUrl)
      .then((r) => r.json())
      .then((topo) => {
        if (!alive) return;
        // `feature()` devuelve Feature o FeatureCollection según el objeto; con
        // `countries` siempre es una colección, pero los tipos no lo saben.
        setFeatures(
          feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>
        );
      })
      .catch(() => {
        /* sin geometría el panel muestra solo el top de países */
      });
    return () => {
      alive = false;
    };
  }, []);

  /**
   * Solo visitas reales. Antes había aquí una tabla de países inventada para
   * que el mapa no saliera vacío en la primera carga; se ha quitado a
   * propósito: un contador que enseña números falsos no es un contador. Si
   * todavía no ha entrado nadie, el mapa sale en blanco y lo dice.
   */
  const data = useMemo(() => toNumericCodes(countries), [countries]);
  const hasReal = Object.keys(data).length > 0;
  const max = useMemo(() => Math.max(...Object.values(data), 1), [data]);

  /** La proyección es cara y siempre es la misma: se calcula una vez. */
  const path = useMemo(
    () => geoPath(geoNaturalEarth1().fitSize([W, H - 10], { type: "Sphere" })),
    []
  );
  const sphere = useMemo(() => path({ type: "Sphere" }) || "", [path]);

  const { paths, dots } = useMemo(() => {
    if (!features) return { paths: [] as { d: string; code: string; name: string }[], dots: [] as Dot[] };

    const paths = features.features.map((f) => ({
      d: path(f) || "",
      code: String(f.id).padStart(3, "0"),
      name: (f.properties as { name?: string })?.name || "",
    }));

    const dots = features.features
      .map((f) => {
        const code = String(f.id).padStart(3, "0");
        const value = data[code];
        if (!value) return null;
        const [x, y] = path.centroid(f);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return {
          code,
          value,
          x,
          y,
          name: NAMES[code] || (f.properties as { name?: string })?.name || code,
        };
      })
      .filter((d): d is Dot => d !== null)
      .sort((a, b) => b.value - a.value);

    return { paths, dots };
  }, [features, data, path]);

  const top = useMemo(
    () => Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6),
    [data]
  );

  /** Raíz cuadrada: las diferencias entre países pequeños siguen viéndose. */
  const t = (value: number) => Math.sqrt(value / max);
  const radius = (value: number) => 2.5 + 14.5 * t(value);
  const landFill = (code: string) => {
    const value = data[code];
    if (!value) return "rgba(20,18,15,.05)";
    return `rgba(20,18,15,${(0.12 + 0.5 * t(value)).toFixed(3)})`;
  };

  const showTip = (e: React.MouseEvent, text: string) =>
    setTip({ x: e.clientX, y: e.clientY, text });

  const fmt = (n: number) => n.toLocaleString("es-ES");

  return (
    <div className="grid items-center gap-6 lg:grid-cols-[1fr_232px]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        role="img"
        aria-label="Mapa mundial de visitas por país"
      >
        <path d={sphere} fill="#efe9de" stroke="rgba(20,18,15,.12)" />

        <g>
          {paths.map((p) => (
            <path
              key={p.code + p.d.slice(0, 12)}
              d={p.d}
              fill={landFill(p.code)}
              stroke="rgba(20,18,15,.16)"
              strokeWidth={0.5}
              onMouseMove={(e) =>
                showTip(
                  e,
                  `${NAMES[p.code] || p.name || p.code} · ${
                    data[p.code] ? `${fmt(data[p.code])} visitas` : "sin visitas"
                  }`
                )
              }
              onMouseLeave={() => setTip(null)}
            />
          ))}
        </g>

        <g>
          {dots.map((d) => (
            <circle
              key={`halo-${d.code}`}
              cx={d.x}
              cy={d.y}
              r={radius(d.value) * 2.1}
              fill="rgba(154,123,63,.14)"
            />
          ))}
          {dots.map((d) => (
            <circle
              key={`dot-${d.code}`}
              cx={d.x}
              cy={d.y}
              r={radius(d.value)}
              fill="#9a7b3f"
              fillOpacity={0.9}
              stroke="#14120f"
              strokeWidth={1}
              onMouseMove={(e) => showTip(e, `${d.name} · ${fmt(d.value)} visitas`)}
              onMouseLeave={() => setTip(null)}
            />
          ))}
        </g>
      </svg>

      <div>
        <h3 className="cartela mb-4 text-museo-tinta-45">Procedencia del público</h3>

        {!hasReal && (
          <p className="text-[13px] leading-[1.55] text-museo-tinta-45">
            {live
              ? "Todavía no ha entrado nadie de ningún país registrado. En cuanto entre alguien, aparece aquí."
              : "Sin el contador levantado no hay procedencias que enseñar."}
          </p>
        )}

        {top.map(([code, value]) => (
          <div key={code} className="mb-[13px] grid gap-[6px]">
            <div className="flex justify-between text-[13px] text-museo-tinta-70">
              <span>{NAMES[code] || code}</span>
              <b className="text-museo-tinta">{fmt(value)}</b>
            </div>
            <div className="h-[5px] overflow-hidden bg-museo-tinta/10">
              <div
                className="h-full bg-museo-tinta"
                style={{ width: `${(value / top[0][1]) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {tip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap border border-museo-tinta bg-museo-papel px-[11px] py-[7px] text-[12.5px] text-museo-tinta"
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
