import { Children } from "react";

const HEADING_ID_RE = /\[#([^\]]+)\]\s*$/m;

export function withHeadingId(children) {
  return Children.map(children, el => {
    if ("string" === typeof el) {
      const match = el.match(HEADING_ID_RE);

      if (match && match[1]?.length) {
        return (
          <span id={match[1]} className="relative scroll-mt-8">
            <a
              className={`
                absolute
                px-3
                -left-[2rem]
                invisible
                [span:hover_&]:visible
                font-mono
                font-normal
                text-gray-400
                hover:text-gray-600
                dark:text-gray-500
                dark:hover:text-gray-400
              `}
              href={`#${match[1]}`}
            >
              #
            </a>
            {el.substring(0, match.index)}
          </span>
        );
      }
    }

    return el;
  });
}
