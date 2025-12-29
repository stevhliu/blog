import postsData from "@/app/posts.json";
import commaNumber from "comma-number";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/app/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? null;

  if (id === null) {
    return NextResponse.json(
      {
        error: {
          message: 'Missing "id" query',
          code: "MISSING_ID",
        },
      },
      { status: 400 }
    );
  }

  const post = postsData.posts.find(post => post.id === id);

  if (post == null) {
    return NextResponse.json(
      {
        error: {
          message: "Unknown post",
          code: "UNKNOWN_POST",
        },
      },
      { status: 400 }
    );
  }

  if (url.searchParams.get("incr") != null) {
    const { data, error } = await supabase.rpc("increment_view", { p_id: id });
    const views = Number(data ?? 0);

    if (error) {
      console.error("increment_view error", error);
    }

    return NextResponse.json(
      {
        ...post,
        views,
        viewsFormatted: commaNumber(views),
      },
      { status: error ? 500 : 200 }
    );
  } else {
    const { data, error } = await supabase
      .from("views")
      .select("count")
      .eq("post_id", id)
      .maybeSingle();

    if (error) {
      console.error("view fetch error", error);
    }

    const views = Number(data?.count ?? 0);
    return NextResponse.json(
      {
        ...post,
        views,
        viewsFormatted: commaNumber(views),
      },
      { status: error ? 500 : 200 }
    );
  }
}
