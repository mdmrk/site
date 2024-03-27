import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://mdmrk.com",
  markdown: {
    shikiConfig: {
      theme: syntaxTheme,
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    (await import("astro-compress")).default(),
    tailwind(),
  ],
});
