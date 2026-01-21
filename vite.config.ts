import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Custom plugin to make CSS non-blocking using media swap technique.
 * Converts: <link rel="stylesheet" href="...">
 * To: <link rel="stylesheet" href="..." media="print" onload="this.media='all'">
 * 
 * This eliminates render-blocking CSS (~160ms savings on FCP/LCP).
 */
function nonBlockingCss(): Plugin {
  return {
    name: 'non-blocking-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Match CSS link tags and add media swap attributes
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
        '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'">'
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && nonBlockingCss(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Only vendor-react - let Vite handle page splitting via React.lazy()
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
}));
