import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    host: "::",
    port: 8085,
    headers: {
      'Content-Language': 'he'
    },
    proxy: {
      '/auth/callback': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth\/callback/, '')
      }
    }
  },
  plugins: [
    react(),
    command === 'serve' &&
    componentTagger(),
  ].filter(Boolean),
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    },
    assetsInclude: ['**/*.png', '**/*.ico', '**/*.webmanifest'],
    copyPublicDir: true,
  },
  publicDir: 'public',
  assetsInclude: ['**/*.png', '**/*.ico', '**/*.webmanifest'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}));
