import { describe, expect, it, vi } from 'vitest';
import { compareVersions, getAvailableUpdate } from './update-check';

describe('release version comparison', () => {
  it.each([
    ['v0.5.1', '0.5.0', 1],
    ['0.5.0', 'v0.5.0+build.1', 0],
    ['0.5.0-beta.1', '0.5.0', -1],
    ['0.5.0', '0.5.0-rc.1', 1]
  ])('compares %s with %s', (left, right, direction) => {
    expect(Math.sign(compareVersions(left, right))).toBe(direction);
  });
});

describe('fork update check', () => {
  it('requests only the fork and reports a newer release', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      tag_name: 'v0.5.1',
      html_url: 'https://github.com/sphynx79/searchmonkey-III/releases/tag/v0.5.1',
      assets: []
    }), { status: 200 }));

    const update = await getAvailableUpdate('0.5.0', fetcher as unknown as typeof fetch);

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.github.com/repos/sphynx79/searchmonkey-III/releases/latest',
      expect.any(Object)
    );
    expect(update?.tagName).toBe('v0.5.1');
  });

  it.each(['v0.5.0', 'v0.4.9'])('ignores release %s when running 0.5.0', async (tagName) => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      tag_name: tagName,
      assets: []
    }), { status: 200 }));

    await expect(getAvailableUpdate('0.5.0', fetcher as unknown as typeof fetch)).resolves.toBeNull();
  });
});
