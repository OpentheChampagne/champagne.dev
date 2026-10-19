import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: "https://champagne.dev",
  trailingSlash: "never",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404") && !new URL(page).pathname.startsWith("/blog") && !new URL(page).pathname.startsWith("/preview/") })],
  build: { format: "file", inlineStylesheets: "never" },
  vite: { build: { assetsInlineLimit: 0 } },
});
