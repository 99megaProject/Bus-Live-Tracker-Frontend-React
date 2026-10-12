import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = {
    "/api": { target: env.PROXY_TARGET || "http://127.0.0.1:5000", changeOrigin: true },
  };

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate", // new versions activate and reload automatically
        includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "logo.svg"],
        manifest: {
          id: "/",
          name: "Bus Tracker",
          short_name: "Bus Tracker",
          description: "Live college bus ETA and stop updates",
          lang: "en",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          theme_color: "#ff6b4a",
          background_color: "#f2efe8",
          icons: [
            { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
          cleanupOutdatedCaches: true,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//], // API calls must never get index.html
          runtimeCaching: [
            // live data + auth: never cache
            { urlPattern: ({ url }) => url.pathname.startsWith("/api/"), handler: "NetworkOnly" },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: { cacheName: "google-fonts-css" },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-files",
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    server: { host: true, proxy },
    preview: { proxy },
  };
});