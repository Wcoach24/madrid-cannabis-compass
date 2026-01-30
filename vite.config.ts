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
      // Flexible regex to match various Vite CSS output formats
      // Handles: <link rel="stylesheet" href="..."> with or without crossorigin
      return html.replace(
        /<link\s+rel="stylesheet"\s+(crossorigin\s+)?href="([^"]+\.css)"(\s+crossorigin)?>/g,
        '<link rel="stylesheet" href="$2" media="print" onload="this.media=\'all\'">'
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
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-accordion'
          ],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority']
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
}));
