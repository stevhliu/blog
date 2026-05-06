import postsData from "@/app/posts.json";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/app/supabase";

const validIds = new Set(postsData.posts.map((p) => p.id));

export async function POST(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");

  if (!id || !validIds.has(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.rpc("increment_view", { p_id: id });
  if (error) {
    console.error("increment_view error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
