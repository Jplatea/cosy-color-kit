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
  ES: "724", MX: "484", AR: "032", CO: "170", CL: "152", PE: "604", US: "840",
  FR: "250", DE: "276", IT: "380", PT: "620", GB: "826", BR: "076", EC: "218",
  UY: "858", VE: "862", MA: "504", NL: "528", BE: "056", CA: "124",
};

const NAMES: Record<string, string> = {
  "724": "España", "484": "México", "032": "Argentina", "170": "Colombia",
  "152": "Chile", "604": "Perú", "840": "Estados Unidos", "250": "Francia",
  "276": "Alemania", "380": "Italia", "620": "Portugal", "826": "Reino Unido",
  "076": "Brasil", "218": "Ecuador", "858": "Uruguay", "862": "Venezuela",
  "504": "Marruecos", "528": "Países Bajos", "056": "Bélgica", "124": "Canadá",
};

/** Datos de ejemplo mientras el backend no devuelva `countries`. */
const DEMO: Record<string, number> = {
  "724": 1840, "484": 620, "032": 410, "170": 298, "152": 186, "604": 164,
  "840": 142, "250": 96, "276": 74, "380": 68, "620": 61, "826": 52,
  "076": 148, "218": 44, "858": 31, "862": 38, "504": 22, "528": 19,
  "056": 14, "124": 27,
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

  const real = useMemo(() => toNumericCodes(countries), [countries]);
  const hasReal = Object.keys(real).length > 0;
  /** Sin datos reales: si el backend responde, mapa vacío; si no, datos de ejemplo. */
  const data = useMemo(
    () => (hasReal ? real : live ? {} : DEMO),
    [hasReal, real, live]
  );
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
    if (!value) return "rgba(242,236,226,.06)";
    return `rgba(232,178,92,${(0.1 + 0.2 * t(value)).toFixed(3)})`;
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
        <path d={sphere} fill="rgba(232,178,92,.03)" stroke="rgba(242,236,226,.1)" />

        <g>
          {paths.map((p) => (
            <path
              key={p.code + p.d.slice(0, 12)}
              d={p.d}
              fill={landFill(p.code)}
              stroke="rgba(242,236,226,.14)"
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
              fill="rgba(232,178,92,.12)"
            />
          ))}
          {dots.map((d) => (
            <circle
              key={`dot-${d.code}`}
              cx={d.x}
              cy={d.y}
              r={radius(d.value)}
              fill="#f6c877"
              fillOpacity={0.92}
              stroke="#e8b25c"
              strokeWidth={1}
              onMouseMove={(e) => showTip(e, `${d.name} · ${fmt(d.value)} visitas`)}
              onMouseLeave={() => setTip(null)}
            />
          ))}
        </g>
      </svg>

      <div>
        <h3 className="mb-4 font-bagel text-[15px] font-normal tracking-[0.04em] text-cyp-cream/55">
          Top países
        </h3>
        {!top.length && (
          <p className="text-[13px] leading-[1.5] text-cyp-cream/35">
            Todavía no hay visitas registradas por país.
          </p>
        )}
        {!hasReal && !live && (
          <p className="mb-4 text-[12px] leading-[1.4] text-cyp-cream/30">
            Datos de ejemplo: el backend aún no envía <code>countries</code>.
          </p>
        )}
        {top.map(([code, value]) => (
          <div key={code} className="mb-[13px] grid gap-[6px]">
            <div className="flex justify-between text-[13px] text-cyp-cream/[0.78]">
              <span>{NAMES[code] || code}</span>
              <b className="text-cyp-gold">{fmt(value)}</b>
            </div>
            <div className="h-[7px] overflow-hidden rounded-full bg-cyp-cream/[0.08]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(value / top[0][1]) * 100}%`,
                  background: "linear-gradient(90deg,#e8b25c,#f6c877)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {tip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-[9px] border border-cyp-gold/40 bg-cyp-ink px-[11px] py-[7px] text-[12.5px]"
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
