import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'FABRICIAN — The Intelligent Fashion Universe',
          short_name: 'FABRICIAN',
          description:
            'Contemporary fashion atelier from Bangladesh. Explore StarKiT menswear, Fariza\'s Territory three-piece couture, 3D textile drape previews, and express nationwide delivery.',
          theme_color: '#09090B',
          background_color: '#09090B',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          lang: 'en',
          categories: ['shopping', 'lifestyle', 'fashion'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
          shortcuts: [
            {
              name: "Fariza's Territory — Women's Couture",
              short_name: "Fariza's Edit",
              description: "Explore all 18 curated women's three-piece designs",
              url: '/#farizas-territory',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'StarKiT — Menswear & Hoodies',
              short_name: 'StarKiT',
              description: 'Explore 11 graphic archive 330–350 GSM brushed fleece hoodies',
              url: '/#starkit',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Store Admin Console',
              short_name: 'Admin Console',
              description: 'Manage orders, Pathao dispatch, and live inventory',
              url: '/#admin',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
          globIgnores: [
            '**/assets/aistudio/**/*.pdf',
            '**/assets/aistudio/**/*.mp4',
            '**/assets/aistudio/**/*.ppm',
            '**/assets/aistudio/**/*.json',
            '**/assets/aistudio/**/*.csv',
            '**/assets/aistudio/hoodie_catalog_page-*',
            '**/assets/aistudio/hoodie_page_*',
            '**/assets/aistudio/Gemini_Generated_Image_*',
            '**/assets/aistudio/Paste_*',
            '**/assets/aistudio/test_page_*',
          ],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/__\/auth/],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.origin === 'https://fonts.googleapis.com',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request, url }) =>
                request.destination === 'image' && url.origin === self.location.origin,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fabrician-catalog-images',
                expiration: { maxEntries: 140, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'vendor-three';
            if (id.includes('node_modules/animejs')) return 'vendor-anime';
            if (id.includes('node_modules/motion')) return 'vendor-motion';
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
