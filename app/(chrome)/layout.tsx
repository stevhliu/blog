import { SiteShell } from "../site-shell";

export default function ChromeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell variant="chrome">{children}</SiteShell>;
}
