import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig({
  server: {
    host: true,
    port: 5188,
    // El panel de visitas pide /api/stats. En desarrollo lo atiende
    // `npm run server`; si no está levantado, el frontend cuenta en local.
    proxy: {
      "/api": {
        target: process.env.CYP_API_URL || "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "./src") },
  },
});
