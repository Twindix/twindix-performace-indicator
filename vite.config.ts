import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    build: { sourcemap: true },
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": "/src" } },
});
