import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: { sizes: [512], padding: 0.1, resizeOptions: { fit: "contain", background: "#ff6b4a" } },
    apple: { sizes: [180], padding: 0.1, resizeOptions: { fit: "contain", background: "#ff6b4a" } },
  },
  images: ["public/logo.svg"],
});