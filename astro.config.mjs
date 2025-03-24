// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import playformCompress from "@playform/compress";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://mdmrk.dev",
  output: "server",
  integrations: [mdx(), sitemap(), playformCompress()],
  adapter: vercel(),
});
