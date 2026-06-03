import { cache } from "react";
import { codeToHtml } from "shiki";
import type { ThemeRegistration } from "shiki";
import pierreLight from "./themes/pierre-light.json";
import pierreDark from "./themes/pierre-dark.json";

type SupportedLanguage = "python" | "yaml" | "json";

// Pierre themes (https://diffs.com/theme). Dual-theme output emits
// --shiki-light / --shiki-dark CSS vars; globals.css switches between them
// via prefers-color-scheme.
const THEMES = {
  light: pierreLight as unknown as ThemeRegistration,
  dark: pierreDark as unknown as ThemeRegistration,
};

export const highlightCode = cache(async function highlightCode(
  code: string,
  lang: SupportedLanguage = "python"
) {
  return codeToHtml(code, { lang, themes: THEMES, defaultColor: false });
});

type SnippetProps = {
  children: string;
  language?: SupportedLanguage;
  maxHeight?: string;
};

export async function Snippet({
  children,
  language = "python",
  maxHeight = "400px",
}: SnippetProps) {
  // Pre-process the code to ensure < and > characters are preserved
  let code = typeof children === "string" ? children.trim() : "";

  // Replace any potential Unicode angle brackets with regular ones before processing
  code = code.replace(/⟨/g, "<").replace(/⟩/g, ">");

  const html = await highlightCode(code, language);

  return (
    <div className="my-6">
      <div
        className="overflow-auto rounded-lg text-xs md:text-sm"
        style={{ maxHeight, fontFeatureSettings: '"liga" 0' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

