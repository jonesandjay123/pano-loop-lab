import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite config. No special aliases or plugins — this is a lab, kept simple on purpose.
export default defineConfig({
  plugins: [react()],
});
