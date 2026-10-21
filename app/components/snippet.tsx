import { cache } from "react";
import { codeToHtml } from "@pierre/highlights";
import type { Lang } from "@pierre/highlights";
import { pierreLight, pierreDark } from "@pierre/highlights/themes";

// Pierre themes (https://diffs.com/theme), highlighted with Highlights
// (https://diffs.com/docs#highlights). Dual-theme output emits
// --hls-light / --hls-dark CSS vars; globals.css switches between them
// via prefers-color-scheme.
const THEMES = { light: pierreLight, dark: pierreDark };

const decoder = new TextDecoder();

export const highlightCode = cache(function highlightCode(
  code: string,
  lang: Lang = "python"
) {
  // The returned bytes can live in shared WebAssembly memory that the next
  // call overwrites, so decode them right away.
  return decoder.decode(
    codeToHtml(code, { lang, themes: THEMES, defaultColor: false })
  );
});

type SnippetProps = {
  children: string;
  language?: Lang;
  maxHeight?: string;
};

export function Snippet({
  children,
  language = "python",
  maxHeight = "400px",
}: SnippetProps) {
  // Pre-process the code to ensure < and > characters are preserved
  let code = typeof children === "string" ? children.trim() : "";

  // Replace any potential Unicode angle brackets with regular ones before processing
  code = code.replace(/⟨/g, "<").replace(/⟩/g, ">");

  const html = highlightCode(code, language);

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
