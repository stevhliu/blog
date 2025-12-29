import { codeToHtml } from 'shiki';

type SupportedLanguage = 'python' | 'yaml' | 'json';

export async function highlightCode(
  code: string,
  lang: SupportedLanguage = 'python',
  theme: string
) {
  return await codeToHtml(code, { lang, theme });
}

type SnippetProps = {
  children: string;
  language?: SupportedLanguage;
  theme?: string;
  maxHeight?: string;
};

export async function Snippet({
  children,
  language = "python",
  theme = "catppuccin-mocha",
  maxHeight = "400px",
}: SnippetProps) {
  // Pre-process the code to ensure < and > characters are preserved
  let code = typeof children === "string" ? children.trim() : "";
  
  // Replace any potential Unicode angle brackets with regular ones before processing
  code = code.replace(/⟨/g, '<').replace(/⟩/g, '>');
  
  const html = await highlightCode(code, language, theme);
  
  // Post-process to ensure < and > characters are rendered as text, not HTML
  const processedHtml = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/⟨/g, '<')
    .replace(/⟩/g, '>');

  return (
    <div className="my-6">
      <div className="bg-[#232334] rounded-lg overflow-x-auto overflow-y-auto p-4" style={{ maxHeight }}>
        <div
          className="text-xs md:text-sm min-w-full [&_pre]:!bg-[#232334] [&_pre]:!m-0 [&_pre]:!p-0"
          style={{ fontFeatureSettings: '"liga" 0' }}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </div>
    </div>
  );
}

