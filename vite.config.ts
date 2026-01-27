import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),    
    ],
    define: {
      "process.env": env,
      'import.meta.env.VITE_GMAPS_API_KEY': JSON.stringify('AIzaSyC6OO39gLvWbZpMzBiLSs1pGNehjJbr2Vg')
    },

    server: {
      port: 5173,
        allowedHosts: [""],
        proxy: {
          '/lastmas': {
            target: 'https://user-api.resque.ng/',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path
          },
        '/maps': {
          target: 'https://maps.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/maps/, 'maps'),
          secure: false,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        },
        '/wallet': {
          target: '⁠https://booking-service.resque.ng',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/wallet/, '/admins')
        },
        '/users': {
          target: '⁠https://booking-service.resque.ng',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/wallet/, '/admins')
        }
      }
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});