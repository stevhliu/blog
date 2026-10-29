// Flat config for the ESLint CLI. `next lint` is removed in Next 16, and
// eslint-config-next 15 still ships the legacy format, so FlatCompat wraps it.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

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
      ".cursor-previews/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/jsx-no-target-blank": "off",
    },
  },
];

export default config;
