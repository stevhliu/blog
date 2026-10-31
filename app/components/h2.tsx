import { withHeadingId } from "./utils";

export function H2({ children }) {
  return (
    <h2 className="group font-medium text-xl my-8 relative tracking-[-0.03em] scroll-mt-8 text-balance">
      {withHeadingId(children)}
    </h2>
  );
}
