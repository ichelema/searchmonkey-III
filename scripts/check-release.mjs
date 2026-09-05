import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const tauriConfig = JSON.parse(read('src-tauri/tauri.conf.json'));
const cargoToml = read('src-tauri/Cargo.toml');
const cargoLock = read('src-tauri/Cargo.lock');
const updateCheck = read('src/lib/update-check.ts');
const page = read('src/routes/+page.svelte');
const aboutDialog = read('src/lib/components/AboutDialog.svelte');
const nativeMenu = read('src-tauri/src/lib.rs');
const workflow = read('.github/workflows/release.yml');
const changelog = read('CHANGELOG.md');

const cargoVersion = cargoToml.match(/^version = "([^"]+)"$/m)?.[1];
const lockPackage = cargoLock
  .split('[[package]]')
  .find((entry) => /^name = "searchmonkey"$/m.test(entry));
const lockVersion = lockPackage?.match(/^version = "([^"]+)"$/m)?.[1];
const versions = [packageJson.version, cargoVersion, lockVersion, tauriConfig.version];

if (versions.some((version) => !version) || new Set(versions).size !== 1) {
  throw new Error(`Release versions do not match: ${versions.join(', ')}`);
}

const version = versions[0];
const tag = process.argv[2] ?? (process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : null);
if (tag && tag !== `v${version}`) {
  throw new Error(`Release tag ${tag} does not match version ${version}`);
}

if (tauriConfig.identifier !== 'io.github.sphynx79.searchmonkey') {
  throw new Error(`Unexpected application identifier: ${tauriConfig.identifier}`);
}

const actionRefs = [...workflow.matchAll(/^\s*uses:\s+\S+@(\S+)/gm)].map((match) => match[1]);
if (!actionRefs.length || actionRefs.some((ref) => !/^[0-9a-f]{40}$/.test(ref))) {
  throw new Error('GitHub Actions must use full commit SHAs');
}

if (!changelog.includes(`## ${version} `)
  || !changelog.includes('### Upstream-derived changes')
  || !changelog.includes('### Fork-specific integration')) {
  throw new Error(`CHANGELOG.md is missing separated release notes for ${version}`);
}

const repository = 'sphynx79/searchmonkey-III';
if (!updateCheck.includes(`api.github.com/repos/${repository}/releases/latest`)
  || !updateCheck.includes(`github.com/${repository}/releases`)
  || !page.includes(`github.com/${repository}/releases`)
  || !page.includes(`github.com/${repository}/issues`)) {
  throw new Error(`Release and update links must use ${repository}`);
}

if (aboutDialog.includes('searchmonkey.dev')
  || ['Feedback', 'Website', 'Marketplace', 'Purchase'].some((label) => nativeMenu.includes(label))) {
  throw new Error('Removed website and commercial actions must remain absent');
}

console.log(`Release metadata is consistent for v${version}`);
