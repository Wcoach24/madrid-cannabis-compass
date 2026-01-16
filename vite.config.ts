import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip', '@radix-ui/react-accordion'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // Admin pages chunk - rarely accessed
          'admin': [
            './src/pages/AdminDashboard.tsx',
            './src/pages/AdminInvitations.tsx',
            './src/pages/AdminClubs.tsx',
            './src/pages/AdminGuides.tsx',
            './src/pages/SeedData.tsx',
            './src/pages/GenerateArticles.tsx',
            './src/pages/BulkGenerate.tsx',
            './src/pages/TranslateContent.tsx',
          ],
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500,
  },
}));
