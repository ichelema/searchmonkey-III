import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const searchBar = readFileSync(
  new URL('./components/SearchBar.svelte', import.meta.url),
  'utf8'
);
const page = readFileSync(new URL('../routes/+page.svelte', import.meta.url), 'utf8');

describe('file or folder name refinement', () => {
  it('keeps the optional control compact', () => {
    expect(searchBar).toContain('>+ Name</button>');
    expect(searchBar).toContain('aria-label="File or folder name"');
    expect(searchBar).toContain('{#if showPathQuery}');
  });

  it('sends the normalized path query to the backend', () => {
    expect(page).toContain('bind:pathQuery');
    expect(page).toContain('const cleanPathQuery = pathQuery.trim();');
    expect(page).toContain('path_query: cleanPathQuery');
  });

  it('persists the refinement and migrates older criteria', () => {
    expect(page).toContain('pathQuery,');
    expect(page).toContain("pathQuery: typeof criteria.pathQuery === 'string' ? criteria.pathQuery : ''");
    expect(page).toContain('search.pathQuery !== criteria.pathQuery');
  });
});
