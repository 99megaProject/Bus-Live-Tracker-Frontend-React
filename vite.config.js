// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // reachable from your phone on the LAN
    proxy: {
      "/api": { target: "http://10.133.200.19:5000", changeOrigin: true },
    },
  },
});