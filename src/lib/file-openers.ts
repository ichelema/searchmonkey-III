export type FileOpenerRule = {
  extension: string;
  template: string;
};

export type FileOpenersConfig = {
  rules: FileOpenerRule[];
};

const STORAGE_KEY = 'searchmonkey.file-openers.v1';

export function defaultFileOpenersConfig(): FileOpenersConfig {
  return { rules: [] };
}

export function normalizeExtension(value: string) {
  return value.trim().replace(/^\*?\./, '').toLowerCase();
}

export function parseFileOpenersConfig(value: string | null): FileOpenersConfig {
  try {
    const parsed = JSON.parse(value ?? '{}');
    if (!Array.isArray(parsed.rules)) return defaultFileOpenersConfig();

    const rules: FileOpenerRule[] = [];
    const addRule = (extensionValue: string, templateValue: string) => {
      const extension = normalizeExtension(extensionValue);
      const template = templateValue.trim();
      if ((extension === '*' || /^[a-z0-9][a-z0-9+_-]*$/i.test(extension))
        && template.includes('{path}') && parseCommandTemplate(template)) {
        rules.push({ extension, template });
      }
    };

    for (const rule of parsed.rules.filter((candidate: unknown) => candidate && typeof candidate === 'object')) {
      if (typeof rule.extension === 'string' && typeof rule.template === 'string') {
        addRule(rule.extension, rule.template);
        continue;
      }

      if (Array.isArray(rule.extensions) && typeof rule.command === 'string') {
        const arguments_ = Array.isArray(rule.arguments)
          ? rule.arguments.filter((argument: unknown): argument is string => typeof argument === 'string')
          : [];
        const template = [quoteTemplateToken(rule.command), ...arguments_].join(' ').trim();
        for (const item of rule.extensions) {
          addRule(String(item), template);
        }
      }
    }
    return { rules };
  } catch {
    return defaultFileOpenersConfig();
  }
}

export function loadFileOpenersConfig(): FileOpenersConfig {
  return parseFileOpenersConfig(localStorage.getItem(STORAGE_KEY));
}

export function saveFileOpenersConfig(config: FileOpenersConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function openerForPath(path: string, config: FileOpenersConfig): FileOpenerRule | null {
  const filename = path.split(/[\\/]/).at(-1) ?? '';
  const extension = normalizeExtension(filename.includes('.') ? filename.split('.').at(-1) ?? '' : '');
  return config.rules.find((rule) => rule.extension === extension)
    ?? config.rules.find((rule) => rule.extension === '*')
    ?? null;
}

export function parseCommandTemplate(template: string): { command: string; arguments: string[] } | null {
  const tokens: string[] = [];
  let token = '';
  let quote = '';
  let started = false;
  const value = template.trim();

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === '\\' && value[index + 1] === quote) {
        token += quote;
        index += 1;
      } else if (character === quote) {
        quote = '';
      } else {
        token += character;
      }
      started = true;
    } else if (character === '"' || character === "'") {
      quote = character;
      started = true;
    } else if (/\s/.test(character)) {
      if (started) {
        tokens.push(token);
        token = '';
        started = false;
      }
    } else {
      token += character;
      started = true;
    }
  }

  if (quote) return null;
  if (started) tokens.push(token);
  if (!tokens[0]) return null;
  return { command: tokens[0], arguments: tokens.slice(1) };
}

export function expandCommandTemplate(template: string, path: string, line = 42, column = 7) {
  return template
    .replaceAll('{path}', path)
    .replaceAll('{line}', String(line))
    .replaceAll('{column}', String(column));
}

export function binaryFromTemplate(template: string) {
  return parseCommandTemplate(template)?.command ?? '';
}

export function quoteTemplateToken(value: string) {
  const trimmed = value.trim();
  return /\s/.test(trimmed) ? `"${trimmed.replaceAll('"', '\\"')}"` : trimmed;
}
