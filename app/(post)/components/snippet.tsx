import { codeToHtml } from 'shiki';

export async function highlightCode(
  code: string,
  lang: string = 'python',
  theme: string
) {
  return await codeToHtml(code, { lang, theme });
}

type SnippetProps = {
  children: string;
  language?: string;
  theme?: string;
};

export async function Snippet({
  children,
  language = "python",
  theme = "catppuccin-mocha",
}: SnippetProps) {
  const html = await highlightCode(
    typeof children === "string" ? children.trim() : "",
    language,
    theme
  );

  return (
    <div className="my-6">
      <div className="bg-white dark:bg-[#232334] rounded-lg">
        <div
          className="text-xs md:text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

