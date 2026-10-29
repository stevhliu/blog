/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
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
