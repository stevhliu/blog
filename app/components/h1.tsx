import { withHeadingId } from "./utils";

export function H1({ children }) {
  return (
    <h1 className="text-2xl font-bold mb-1 tracking-tight scroll-mt-8 text-balance">
      {withHeadingId(children)}
    </h1>
  );
}
