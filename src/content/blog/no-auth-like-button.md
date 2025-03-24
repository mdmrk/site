---
title: "no auth like button"
description: "implementing a like button that does not need authentication in Astro and Supabase"
pubDate: "03/24/2025"
---

After creating a simple static blog in Astro I thought about implement a like button for my blog posts.

However, I didn't want users through the hassle of signin up or linking a Google account so they can leave an upvote. Instead I investigated about a authless solution.

Luckily I found [this](https://abhisaha.com/blog/no-authentication-like-button/) post talking about it and I implemented the method it explains. So thank you to the author.

The method suggested is **Audio Fingerprinting**. The concept is well explained in the link above, but basically we are creating and handling an **identifier** in a way that mostly works for distinguishing among different users.

Currently I had a client-only setup, so I needed a database to store the information and a backend to talk to that database.

### Database

Firstly, I setup a database in Supabase, which was really easy, and prepared a table. Looks something like this:

| id  | slug                | fingerprint                                | created_at |
| :-- | :------------------ | :----------------------------------------- | :--------- |
| 000 | no-auth-like-button | 01321131318321732173217321321031(whatever) | today      |

I stored a couple of credentials I would need inside a `.env`.

### Backend

I needed a solution for my client-only web hosted in Github Actions. I decided for **Vercel**. Vercel allowed me for an easy SSR integration. Server Side Rendering was in my mind, or at least it was...

It turns out Astro launched a feature called Islands which allows you to basically inject async server renderer code. The way they explain it:

```
A client island is an interactive JavaScript UI component
that is hydrated separately from the rest of the page,
while a server island is a UI component that server-renders
its dynamic content separately from the rest of the page.
```

This way I could server my static htmls as before **AND** in the back talk to my server and retrieve the likes info or whatever i need. **It'll show when ready, let's load content first**.

Integrating Vercel is pretty easy with Astro. Just:

```sh
bunx astro add vercel
```

and the result:

```js
// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import playformCompress from "@playform/compress";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://mdmrk.dev",
  output: "server", // <= This is the main change!
  integrations: [mdx(), sitemap(), playformCompress()],
  adapter: vercel(),
});
```

Next step was writting a simple API for my client to talk to the server... but what server? We didn't create one so far.

Well, the api will live inside my client's `src/pages` but separated. For the desired `GET /api/likes/[blog post slug]` and `POST /api/likes/[blog post slug]?fingerprint=0123` we can create the file `/src/pages/likes/[slug].ts`.

```
.
│
(...)
├── src
│   ├── pages
│   │   ├── about.astro
│   │   ├── api
│   │   │   └── likes
│   │   │       └── [slug].ts
│   │   ├── blog
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── index.astro
│   │   ├── robots.txt.ts
│   │   └── rss.xml.js
└── tsconfig.json
(...)
```

Now the server can be implemented:

```ts
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const url = new URL(request.url);
    const fingerprint = url.searchParams.get("fingerprint");
    const slug = params.slug;

    if (!slug || !fingerprint) {
      return new Response(
        JSON.stringify({ error: "Missing slug or fingerprint" }),
        { status: 400 },
      );
    }

    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug);

    const { data: userLike } = await supabase
      .from("likes")
      .select("id")
      .eq("slug", slug)
      .eq("fingerprint", fingerprint)
      .single();

    return new Response(
      JSON.stringify({
        count: count || 0,
        userLiked: !!userLike,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching likes:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
};
```

### Fingerprint

The fingerprint must be created on runtime at the client side and sent to the server to handle it. We can create a new one a user visits or page or it as a cookie. This makes the implementation more robust.

```sh
export async function getFingerprint(): Promise<string> {
  try {
    const storedFingerprint = localStorage.getItem("device_fingerprint");

    if (storedFingerprint) {
      return storedFingerprint;
    }

    const fingerprint = await generateFingerprint();

    localStorage.setItem("device_fingerprint", fingerprint);

    return fingerprint;
  } catch (e) {
    return generateFingerprint();
  }
}
```

Remember, my focus is to load the page _fast_ and then take any amount of time to fetch the likes. So even the fingerprint is async. It is the first time I try this and I'm not very into webdev, so there will be some mistakes.

I use this blog as a testbed anyway.
