import postsData from "./posts.json";
import commaNumber from "comma-number";
import { supabase } from "./supabase";

export type Post = {
  id: string;
  date: string;
  title: string;
  views: number;
  viewsFormatted: string;
  evergreen?: boolean;
};

// shape of the views rows in supabase
type Views = {
  [key: string]: number;
};

export const getPosts = async () => {
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

  return postsData.posts.map((post): Post => {
    const views = viewsMap[post.id] ?? 0;
    return {
      ...post,
      views,
      viewsFormatted: commaNumber(views),
    };
  });
};
