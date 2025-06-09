import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
// import { VitePWA } from 'vite-plugin-pwa'; // si quieres PWA más adelante

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }), // Abre el visualizador tras el build
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'robots.txt'],
    //   manifest: {
    //     name: 'Hitzkale',
    //     short_name: 'Hitzkale',
    //     start_url: '/',
    //     display: 'standalone',
    //     background_color: '#ffffff',
    //     theme_color: '#317EFB',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    // })
  ],
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['zustand', 'axios'] // Ajusta con tus dependencias reales
        }
      }
    }
  }
});
