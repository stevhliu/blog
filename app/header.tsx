import { SiteHeader } from "./site-header";
import postsData from "./posts.json";

export function Header() {
  return <SiteHeader totalRecords={postsData.posts.length} />;
}
