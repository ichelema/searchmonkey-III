import { describe, expect, it } from 'vitest';
import {
  expandCommandTemplate,
  type FileOpenersConfig,
  normalizeExtension,
  openerForPath,
  parseCommandTemplate,
  parseFileOpenersConfig
} from './file-openers';

describe('file opener rules', () => {
  it('normalizes extension case and common forms', () => {
    expect(normalizeExtension('*.TXT')).toBe('txt');
    expect(normalizeExtension('.Md')).toBe('md');
    expect(normalizeExtension('*')).toBe('*');
  });

  it('uses the first matching extension rule', () => {
    const config: FileOpenersConfig = {
      rules: [
        { extension: 'txt', template: 'first {path}' },
        { extension: 'txt', template: 'second {path}' }
      ]
    };
    expect(openerForPath('/tmp/README.TXT', config)?.template).toBe('first {path}');
    expect(openerForPath('/tmp/README', config)).toBeNull();
  });

  it('uses a wildcard fallback while preferring a matching extension', () => {
    const config: FileOpenersConfig = {
      rules: [
        { extension: '*', template: 'fallback {path}' },
        { extension: 'md', template: 'markdown {path}' }
      ]
    };
    expect(openerForPath('/tmp/README.md', config)?.template).toBe('markdown {path}');
    expect(openerForPath('/tmp/notes.txt', config)?.template).toBe('fallback {path}');
    expect(openerForPath('/tmp/README', config)?.template).toBe('fallback {path}');
  });

  it.each([
    ['Linux', 'code --goto {path}:{line}:{column}', 'code', ['--goto', '{path}:{line}:{column}']],
    [
      'Windows',
      '"C:\\Program Files\\Notepad++\\notepad++.exe" -n{line} "{path}"',
      'C:\\Program Files\\Notepad++\\notepad++.exe',
      ['-n{line}', '{path}']
    ],
    [
      'macOS',
      '"/Applications/Visual Studio Code.app" --goto "{path}:{line}:{column}"',
      '/Applications/Visual Studio Code.app',
      ['--goto', '{path}:{line}:{column}']
    ]
  ])('parses a representative %s command', (_platform, template, command, arguments_) => {
    expect(parseCommandTemplate(template)).toEqual({ command, arguments: arguments_ });
  });

  it('keeps spaced paths intact while expanding placeholders', () => {
    expect(expandCommandTemplate('editor --goto "{path}:{line}:{column}"', '/tmp/My File.txt', 12, 3))
      .toBe('editor --goto "/tmp/My File.txt:12:3"');
  });

  it('rejects empty and malformed templates', () => {
    expect(parseCommandTemplate('')).toBeNull();
    expect(parseCommandTemplate('"/missing/closing/quote {path}')).toBeNull();
  });

  it('migrates the stored multi-extension format', () => {
    expect(parseFileOpenersConfig(JSON.stringify({
      rules: [{
        extensions: ['*.TXT', '.Md'],
        command: '/Applications/My Editor',
        arguments: ['--line', '{line}', '{path}']
      }]
    }))).toEqual({
      rules: [
        { extension: 'txt', template: '"/Applications/My Editor" --line {line} {path}' },
        { extension: 'md', template: '"/Applications/My Editor" --line {line} {path}' }
      ]
    });
  });

  it('loads a wildcard rule from storage', () => {
    expect(parseFileOpenersConfig(JSON.stringify({
      rules: [{ extension: '*', template: 'editor {path}' }]
    }))).toEqual({
      rules: [{ extension: '*', template: 'editor {path}' }]
    });
  });

  it('falls back to an empty config for malformed storage', () => {
    expect(parseFileOpenersConfig('{')).toEqual({ rules: [] });
    expect(parseFileOpenersConfig('{"rules":"invalid"}')).toEqual({ rules: [] });
    expect(parseFileOpenersConfig(JSON.stringify({
      rules: [
        { extension: 'txt', template: '"unterminated {path}' },
        { extension: 'md', template: 'editor --line {line}' }
      ]
    }))).toEqual({ rules: [] });
  });
});
