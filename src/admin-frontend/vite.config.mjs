import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "../../assets/build",
    emptyOutDir: true,
    // Self-contained IIFE — avoids top-level `wp` clashing with WordPress globals.
    minify: "terser",
    terserOptions: {
      mangle: {
        reserved: ["wp"],
      },
    },
    rollupOptions: {
      output: {
        format: "iife",
        name: "GemfindRBAdmin",
        inlineDynamicImports: true,
        entryFileNames: "admin.js",
        assetFileNames: "admin.[ext]",
      },
    },
  },
  plugins: [react()],
});
