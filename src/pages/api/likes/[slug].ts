import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

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

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const body = await request.json();
    const { fingerprint, action } = body;
    const slug = params.slug;

    if (!slug || !fingerprint || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400 },
      );
    }

    if (action === "like") {
      const { data: existingLike, error: checkError } = await supabase
        .from("likes")
        .select("id")
        .eq("slug", slug)
        .eq("fingerprint", fingerprint)
        .maybeSingle();

      if (!existingLike && !checkError) {
        const { error: insertError } = await supabase
          .from("likes")
          .insert([{ slug, fingerprint, created_at: new Date().toISOString() }])
          .select();

        if (insertError) {
          console.error("Insert error:", insertError);
          return new Response(
            JSON.stringify({
              error: "Failed to like post",
              details: insertError.message,
            }),
            { status: 500 },
          );
        }
      }
    } else if (action === "unlike") {
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("slug", slug)
        .eq("fingerprint", fingerprint);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        return new Response(
          JSON.stringify({
            error: "Failed to unlike post",
            details: deleteError.message,
          }),
          { status: 500 },
        );
      }
    }

    const { count, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug);

    if (countError) {
      console.error("Count error:", countError);
      return new Response(
        JSON.stringify({
          error: "Failed to count likes",
          details: countError.message,
        }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({
        count: count || 0,
        userLiked: action === "like",
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500 },
    );
  }
};
