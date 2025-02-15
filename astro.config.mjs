// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import playformCompress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
  site: "https://mdmrk.dev",
  integrations: [mdx(), sitemap(), playformCompress()],
});
