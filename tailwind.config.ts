import type { Config } from "tailwindcss";

export default {
  // El interruptor de día/noche pone la clase `.noche` en <html>.
  darkMode: ["class", ".noche"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Serif de catálogo para los titulares y las cartelas.
        display: ["Instrument Serif", "Georgia", "Times New Roman", "serif"],
        // Grotesca neutra para lo que en un museo va impreso en pequeño.
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Rotulación de tebeo. Solo se usa en la sala 2, que es una página de
        // cómic; en el resto del museo desentonaría, y ese es justo el chiste.
        comic: ["Bangers", "Impact", "Haettenschweiler", "sans-serif"],
      },
      colors: {
        /**
         * La sala: papel, pared, peanas de piedra y tinta. Los valores no están
         * aquí sino en `src/index.css`, en variables, para que el mismo nombre
         * sirva de día y de noche. `<alpha-value>` deja que Tailwind siga
         * pudiendo pedir transparencia: `text-museo-tinta/45` funciona igual.
         *
         * El latón aparece en cantidades ridículas —un filete, un sello— y ese
         * es justo el chiste: lujo de verdad puesto encima de una tontería.
         */
        museo: {
          papel: "rgb(var(--cyp-papel) / <alpha-value>)",
          pared: "rgb(var(--cyp-pared) / <alpha-value>)",
          peana: "var(--cyp-peana-2)",
          "peana-hi": "var(--cyp-peana-1)",
          tinta: "rgb(var(--cyp-tinta) / <alpha-value>)",
          // Texto secundario y letra de cartela. Las opacidades no son un
          // gusto: por debajo de 0.60 la cartela de 11 px no llega al mínimo
          // de contraste sobre papel, que es el fondo más exigente de los dos.
          "tinta-suave": "rgb(var(--cyp-tinta) / 0.72)",
          "tinta-tenue": "rgb(var(--cyp-tinta) / 0.60)",
          linea: "rgb(var(--cyp-tinta) / 0.16)",
          "linea-fina": "rgb(var(--cyp-tinta) / 0.09)",
          laton: "rgb(var(--cyp-laton) / <alpha-value>)",
          "laton-hi": "rgb(var(--cyp-laton-hi) / <alpha-value>)",
        },
      },
      keyframes: {
        "cyp-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "cyp-bob-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "cyp-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "cyp-blink": {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "96%": { transform: "scaleY(.08)" },
        },
        "cyp-rise": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "cyp-bob": "cyp-bob 7s ease-in-out infinite",
        "cyp-bob-slow": "cyp-bob-slow 8.5s ease-in-out infinite",
        "cyp-marquee": "cyp-marquee 38s linear infinite",
        "cyp-blink": "cyp-blink 6s ease-in-out infinite",
        "cyp-rise": "cyp-rise .5s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
