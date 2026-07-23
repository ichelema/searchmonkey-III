import type { HighlighterGeneric, BundledLanguage, BundledTheme } from 'shiki';

export type SyntaxToken = { start: number; end: number; color?: string };

const EXTENSION_LANGS: Record<string, string> = {
  rb: 'ruby',
  erb: 'erb',
  sh: 'shellscript',
  bash: 'shellscript',
  zsh: 'shellscript',
  rs: 'rust',
  html: 'html',
  htm: 'html',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  jsx: 'jsx',
  svelte: 'svelte',
  vue: 'vue',
  py: 'python',
  json: 'json',
  jsonc: 'jsonc',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  css: 'css',
  scss: 'scss',
  less: 'less',
  md: 'markdown',
  markdown: 'markdown',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  java: 'java',
  go: 'go',
  lua: 'lua',
  xml: 'xml',
  svg: 'xml',
  sql: 'sql',
  ini: 'ini',
  conf: 'ini',
  php: 'php',
  kt: 'kotlin',
  kts: 'kotlin',
  swift: 'swift',
  cs: 'csharp',
  pl: 'perl',
  pm: 'perl',
  ps1: 'powershell',
  diff: 'diff',
  patch: 'diff'
};

const FILENAME_LANGS: Record<string, string> = {
  dockerfile: 'dockerfile',
  makefile: 'make',
  gemfile: 'ruby',
  rakefile: 'ruby'
};

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null = null;
const loadedLangs = new Set<string>();

export function languageForPath(filePath: string): string | null {
  const name = filePath.split(/[\\/]/).at(-1)?.toLowerCase() ?? '';
  if (FILENAME_LANGS[name]) return FILENAME_LANGS[name];
  const extension = name.split('.').at(-1) ?? '';
  return EXTENSION_LANGS[extension] ?? null;
}

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({ themes: ['nord', 'github-light'], langs: [] })
    );
  }
  return highlighterPromise;
}

export async function tokenizeLines(
  text: string,
  lang: string,
  dark: boolean
): Promise<SyntaxToken[][]> {
  const highlighter = await getHighlighter();
  if (!loadedLangs.has(lang)) {
    await highlighter.loadLanguage(lang as BundledLanguage);
    loadedLangs.add(lang);
  }
  const lines = highlighter.codeToTokensBase(text, {
    lang: lang as BundledLanguage,
    theme: dark ? 'nord' : 'github-light'
  });
  return lines.map((line) => {
    let cursor = 0;
    return line.map((token) => {
      const start = cursor;
      cursor += token.content.length;
      return { start, end: cursor, color: token.color };
    });
  });
}
