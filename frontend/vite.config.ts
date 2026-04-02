import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'EcoMed — Descarte Consciente',
        short_name: 'EcoMed',
        description: 'Encontre o ponto de descarte correto para seus medicamentos',
        start_url: '/mapa',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#2D7D46',
        orientation: 'portrait-primary',
        lang: 'pt-BR',
        categories: ['health', 'utilities'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // API de pontos — Stale While Revalidate (5 min)
            urlPattern: /\/api\/v1\/pontos/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-pontos',
              expiration: { maxAgeSeconds: 300 },
            },
          },
          {
            // Tiles do mapa OpenStreetMap — Cache First (7 dias)
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxAgeSeconds: 604800, maxEntries: 500 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Fotos dos pontos — Cache First (1 dia)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxAgeSeconds: 86400, maxEntries: 100 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
