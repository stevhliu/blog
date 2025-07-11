import { codeToHtml } from 'shiki';

export async function highlightCode(
  code: string,
  lang: string = 'python',
  theme: string = 'catppuccin-mocha'
) {
  return await codeToHtml(code, { lang, theme });
} 