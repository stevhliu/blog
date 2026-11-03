// Flat config for the ESLint CLI (`next lint` is removed in Next 16).
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".pnpm-store/**",
      "public/**",
      "next-env.d.ts",
      ".agents/**",
      ".claude/**",
      ".cursor/**",
      // The miniature pipeline's Python environment, vendored model code and
      // working files (see tools/miniature/.gitignore).
      "tools/miniature/.venv/**",
      "tools/miniature/vendor/**",
      "tools/miniature/work/**",
    ],
  },
  ...nextVitals,
  {
    rules: {
      "react/jsx-no-target-blank": "off",
    },
  },
];

export default config;
