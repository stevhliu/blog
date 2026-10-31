import { cache, isValidElement } from "react";
import type { ReactNode } from "react";
import { codeToHtml, isSupportedLanguage } from "@pierre/highlights";
import type { Lang } from "@pierre/highlights";
import { pierreLight, pierreDark } from "@pierre/highlights/themes";

// Pierre themes (https://diffs.com/theme), highlighted with Highlights
// (https://diffs.com/docs#highlights). Dual-theme output emits
// --hls-light / --hls-dark CSS vars; globals.css switches between them
// via prefers-color-scheme.
const THEMES = { light: pierreLight, dark: pierreDark };

const decoder = new TextDecoder();

const highlightCode = cache(function highlightCode(
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
  children: ReactNode;
  language?: Lang;
  maxHeight?: string;
};

type CodeElementProps = { className?: string; children?: ReactNode };

// Snippet is used two ways. Written as <Snippet>{`...`}</Snippet> it gets the
// code as a string. Mapped to `pre` for Markdown fences, MDX hands it a
// <code className="language-x"> element instead, so read the text and the
// language off that element.
function readSource(children: ReactNode): { code: string; fenceLang?: string } {
  if (typeof children === "string") return { code: children };
  if (isValidElement<CodeElementProps>(children)) {
    const { className = "", children: inner } = children.props;
    const fenceLang = className.match(/language-(\S+)/)?.[1];
    return { code: readSource(inner).code, fenceLang: fenceLang ?? "plain" };
  }
  if (Array.isArray(children)) {
    return { code: children.map(child => readSource(child).code).join("") };
  }
  return { code: "" };
}

export function Snippet({
  children,
  language = "python",
  maxHeight = "400px",
}: SnippetProps) {
  const { code: source, fenceLang } = readSource(children);
  // A fence's language tag wins; an unknown tag falls back to plain text
  // instead of failing the build.
  const requested = fenceLang ?? language;
  const lang: Lang = isSupportedLanguage(requested) ? requested : "plain";

  // Pre-process the code to ensure < and > characters are preserved
  let code = source.trim();

  // Replace any potential Unicode angle brackets with regular ones before processing
  code = code.replace(/⟨/g, "<").replace(/⟩/g, ">");

  const html = highlightCode(code, lang);

  return (
    <div className="my-6">
      <div
        className="overflow-auto overscroll-x-contain rounded-lg text-xs md:text-sm"
        style={{ maxHeight, fontFeatureSettings: '"liga" 0' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
