import { cache } from "react";
import postsData from "./posts.json";
import { formatInteger } from "./post-format";
import { supabase } from "./supabase";

export type Post = {
  id: string;
  date: string;
  title: string;
  views: number;
  viewsFormatted: string;
  evergreen?: boolean;
  draft?: boolean;
};

// shape of the views rows in supabase
type Views = {
  [key: string]: number;
};

// Legacy post IDs remain in Supabase so their historical views can be
// displayed on the merged canonical post.
export const VIEW_ALIASES: Record<string, string[]> = {
  "transformers-loading-pipeline": [
    "transformers-compendium-1",
    "transformers-compendium-2",
  ],
};

export function getAggregatedViews(postId: string, viewsMap: Views): number {
  return [postId, ...(VIEW_ALIASES[postId] ?? [])].reduce(
    (total, id) => total + (viewsMap[id] ?? 0),
    0
  );
}

// Wrapped with React.cache() to deduplicate requests within the same render pass
export const getPosts = cache(async () => {
  // Drafts are kept in posts.json but excluded from the public index and feed.
  const publishedPosts = postsData.posts.filter(post => !("draft" in post && post.draft));

  if (!supabase) {
    return publishedPosts.map((post): Post => ({
      ...post,
      views: 0,
      viewsFormatted: formatInteger(0),
    }));
  }

  let viewsData: { post_id: string; count: number | null }[] | null = null;

  try {
    const { data, error } = await supabase
      .from("views")
      .select("post_id, count");

    if (error) {
      console.warn("views fetch error", error);
    } else {
      viewsData = data;
    }
  } catch (err) {
    console.warn("views fetch exception", err);
  }

  const viewsMap: Views = Object.fromEntries(
    (viewsData ?? []).map(entry => [entry.post_id, Number(entry.count ?? 0)])
  );

  return publishedPosts.map((post): Post => {
    const views = getAggregatedViews(post.id, viewsMap);
    return {
      ...post,
      views,
      viewsFormatted: formatInteger(views),
    };
  });
});
