import { SiteShell } from "../site-shell";

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell variant="post">{children}</SiteShell>;
}
