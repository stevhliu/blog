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
};

export async function Snippet({
  children,
  language = "python",
  theme = "catppuccin-mocha",
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
      <div className="bg-white dark:bg-[#232334] rounded-lg overflow-hidden">
        <div
          className="text-xs md:text-sm overflow-x-auto"
          style={{ 
            fontFeatureSettings: '"liga" 0',
            minWidth: '100%'
          }}
          dangerouslySetInnerHTML={{ 
            __html: processedHtml.replace(
              /<pre[^>]*>/g, 
              '<pre style="margin: 0; padding: 1rem; overflow-x: auto; white-space: pre; background-color: #232334;">'
            )
          }}
        />
      </div>
    </div>
  );
}

