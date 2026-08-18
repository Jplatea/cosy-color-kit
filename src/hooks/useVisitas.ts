import { useEffect, useState } from "react";
import { fetchStats, trackSections, type Stats } from "@/lib/stats";
import { trackedSections } from "@/config/cyp";

const SECTION_IDS = trackedSections.map((s) => s.id);

/** Carga el panel de visitas y dice si los datos vienen del backend o del navegador. */
export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchStats(SECTION_IDS).then((r) => {
      if (!alive) return;
      setStats(r.stats);
      setLive(r.live);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { stats, live };
}

/**
 * Cuenta qué secciones ha llegado a ver el visitante.
 *
 * Se acumulan en un lote y se envían de una sola vez, para no disparar una
 * petición por sección mientras alguien baja rápido por la página.
 */
export function useSectionTracking() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const pending = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = () => {
      if (!pending.size) return;
      const batch = Array.from(pending);
      pending.clear();
      void trackSections(batch);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          pending.add(entry.target.id);
          observer.unobserve(entry.target);
        });
        clearTimeout(timer);
        timer = setTimeout(flush, 1200);
      },
      { threshold: 0.35 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, []);
}
