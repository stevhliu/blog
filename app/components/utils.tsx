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
                opacity-0
                focus-visible:opacity-100
                [@media(hover:hover)_and_(pointer:fine)]:[span:hover_&]:opacity-100
                transition-opacity
                duration-100
                ease-out
                font-mono
                font-normal
                text-[var(--color-subtext)]
                [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--color-text)]
              `}
              href={`#${match[1]}`}
              aria-label="Link to this section"
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
