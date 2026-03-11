export function ZeroBadge() {
  return (
    <a
      href="https://huggingface.co/docs/hub/spaces-zerogpu"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block align-middle transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <svg
        viewBox="0 0 32 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-5 w-auto"
        aria-label="ZeroGPU"
      >
        <rect
          width="29.28"
          height="9.85"
          rx="3"
          transform="matrix(1 0 -.27564 .96126 3.33 .47)"
          fill="currentColor"
          className="text-gray-200 dark:text-gray-800"
        />
        <path
          d="M7.6 2.8c1.3 0 1.3 1 .6 1.3-.3.1-.4.4-.5.7.1.1.3.1.3.2 1-.5 2.1-.3 2.1.7 0 1.2-1 1.3-1.3.6-.1-.3-.4-.4-.7-.5a.9.9 0 0 1-.3.3c.6 1 .3 2.1-.7 2.1-1.2 0-1.3-1-.6-1.3.3-.1.4-.4.5-.7a.9.9 0 0 1-.4-.3c-1 .6-2.1.3-2.1-.7 0-1.2 1-1.3 1.3-.6.1.3.4.4.7.5a.8.8 0 0 1 .3-.3c-.6-1-.3-2.1.6-2.1Z"
          fill="currentColor"
          className="text-black dark:text-gray-200"
        />
        <text
          x="28.5"
          y="5.5"
          dominantBaseline="central"
          textAnchor="end"
          textLength="17"
          lengthAdjust="spacingAndGlyphs"
          fontSize="7"
          fontWeight="800"
          fontStyle="italic"
          fontFamily="system-ui, sans-serif"
          fill="currentColor"
          className="text-black dark:text-gray-200"
        >
          ZERO
        </text>
      </svg>
    </a>
  );
}
