import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

export async function GET(context: APIContext) {
  if (!context.site) {
    return new Response("site not configured", { status: 500 });
  }
  const posts = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  });
}
