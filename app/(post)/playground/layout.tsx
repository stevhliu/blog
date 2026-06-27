import { PostChrome } from "../post-chrome";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PostChrome post={null}>{children}</PostChrome>;
}
