// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import playformCompress from "@playform/compress";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://mdmrk.dev",
  output: "server",
  integrations: [mdx(), sitemap(), playformCompress()],
  adapter: vercel(),
});
