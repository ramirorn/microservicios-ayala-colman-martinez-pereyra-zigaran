import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// En desarrollo (npm run dev) reenviamos al Gateway igual que lo hace nginx en Docker
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": GATEWAY_URL,
      "/estado": GATEWAY_URL
    }
  }
});
