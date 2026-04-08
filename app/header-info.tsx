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
  const dateLabel = post ? post.date : "2024";
  return { post, dateLabel };
}

export function HeaderInfo() {
  const { post, dateLabel } = useCurrentPost();

  return (
    <>
      {dateLabel}
      {post ? (
        <>
          <br />
          <ViewCounter id={post.id} initialViews="0" />
        </>
      ) : null}
    </>
  );
}

