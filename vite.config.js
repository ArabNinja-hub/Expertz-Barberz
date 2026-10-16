import { defineConfig } from "vite";
export default defineConfig({
  // GitHub Pages project sites are served from /<repository-name>/.
  base: "/Expertz-Barberz/",
  server: { host: "0.0.0.0", allowedHosts: [".e2b.app"] },
  preview: { host: "0.0.0.0", allowedHosts: [".e2b.app"] },
});
