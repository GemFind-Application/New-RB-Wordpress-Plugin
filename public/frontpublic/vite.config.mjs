import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Wraps entire bundle in an IIFE so no globals leak in WP themes. */
function wrapInIIFE() {
  return {
    name: "wrap-in-iife",
    generateBundle(_, bundle) {
      for (const file of Object.keys(bundle)) {
        const chunk = bundle[file];
        if (chunk.type === "chunk" && chunk.code) {
          chunk.code = `(function(){${chunk.code}})();`;
        }
      }
    },
  };
}

export default defineConfig({
  build: {
    outDir: "build",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    sourcemap: false,
    rollupOptions: {
      plugins: [wrapInIIFE()],
      output: {
        format: "es",
        entryFileNames: `assets/frontend.js`,
        chunkFileNames: `assets/frontend.js`,
        assetFileNames: `assets/frontend.[ext]`,
      },
    },
  },
  plugins: [react()],
});
