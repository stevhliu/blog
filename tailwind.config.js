/** @type {import('tailwindcss').Config} */
module.exports = {
  // The sky decides dark, not the system: sky-lighting.ts sets data-night
  // on the root before first paint. The system setting is the fallback for
  // when that script hasn't run. :where() keeps a dark: class at the
  // specificity of a plain one, so hover: and the rest still override it.
  darkMode: [
    "variant",
    [
      '@media (prefers-color-scheme: dark) { &:not(:where(:root[data-night="false"] *)) }',
      '&:where(:root[data-night="true"] *)',
    ],
  ],
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "SFMono-Regular", "Consolas", "Menlo", "monospace"],
        // Code in posts (inline and blocks). Geist Mono stays the UI mono.
        code: ['"Paper Mono"', "var(--font-geist-mono)", "SFMono-Regular", "Consolas", "Menlo", "monospace"],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
};
