import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Serif de catálogo para los titulares y las cartelas.
        display: ["Instrument Serif", "Georgia", "Times New Roman", "serif"],
        // Grotesca neutra para lo que en un museo va impreso en pequeño.
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        /**
         * La sala: papel hueso, pared blanca, peanas de piedra y tinta negra.
         * El latón aparece en cantidades ridículas —un filete, un sello— y ese
         * es justo el chiste: lujo de verdad puesto encima de una tontería.
         */
        museo: {
          papel: "#f7f4ef",
          pared: "#fffdf9",
          peana: "#e4ddd1",
          "peana-hi": "#efe9de",
          tinta: "#14120f",
          "tinta-70": "rgba(20,18,15,.70)",
          "tinta-45": "rgba(20,18,15,.45)",
          linea: "rgba(20,18,15,.16)",
          "linea-fina": "rgba(20,18,15,.09)",
          laton: "#9a7b3f",
          "laton-hi": "#b8955a",
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
