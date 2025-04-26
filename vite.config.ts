import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
      react({
        jsxImportSource: 'react'
      }),
      command === 'serve' &&
      componentTagger(),
    ].filter(Boolean),
    base: '/dragonfly-expense-hub/',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "react": path.resolve(__dirname, "node_modules/react"),
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
      commonjsOptions: {
        include: [/node_modules/],
        extensions: ['.js', '.cjs'],
        strictRequires: true,
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: undefined,
          inlineDynamicImports: false
        }
      },
      assetsInclude: ['**/*.png', '**/*.ico', '**/*.webmanifest'],
      copyPublicDir: true,
    },
    publicDir: 'public',
    assetsInclude: ['**/*.png', '**/*.ico', '**/*.webmanifest'],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'pdfjs-dist',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-context',
        '@radix-ui/react-compose-refs'
      ],
      esbuildOptions: {
        jsx: 'automatic'
      }
    },
    preview: {
      port: 8085,
      proxy: {
        '/auth/callback': {
          target: 'http://localhost:8085',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/auth\/callback/, '')
        }
      }
    },
    define: {
      'process.env.BASE_URL': JSON.stringify('/dragonfly-expense-hub/'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    }
  };
});
