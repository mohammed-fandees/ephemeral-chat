import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/ephemeral-chat/", 
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
