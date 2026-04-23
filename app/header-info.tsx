"use client";

import { usePathname } from "next/navigation";
import postsData from "./posts.json";
import { ViewCounter } from "./(post)/view-counter";

const postsById = new Map(postsData.posts.map((p) => [p.id, p]));

function useCurrentPost() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments.length >= 2 ? segments[segments.length - 1] : null;
  const post = slug ? postsById.get(slug) ?? null : null;
  return { post };
}

export function HeaderInfo() {
  const { post } = useCurrentPost();
  const total = postsData.posts.length.toString().padStart(3, "0");

  if (post) {
    return (
      <>
        {post.date}
        <br />
        <ViewCounter id={post.id} initialViews="0" />
      </>
    );
  }

  return <>Total Records: {total}</>;
}
