# Releasing Searchmonkey

## Version alignment

1. Choose a version newer than the latest fork tag. Never move an existing tag.
2. Update `package.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, and
   `src-tauri/tauri.conf.json`.
3. Add release notes to `CHANGELOG.md`, separating upstream-derived changes
   from fork-specific integration.
4. Run `pnpm check:release v<version>`.

## Verification

Run from a clean checkout:

```sh
pnpm install --frozen-lockfile
scripts/pull-rg-bin.sh
pnpm check:release v0.5.0
pnpm test
pnpm check
pnpm build
RUSTUP_TOOLCHAIN=stable cargo test --manifest-path src-tauri/Cargo.toml --locked
pnpm tauri build --no-bundle
```

The tag-triggered release workflow repeats the checks and builds Linux,
Windows, and macOS artifacts. Keep the GitHub release as a draft until all
matrix jobs and the following upgrade checks pass.

## Upgrade from fork v0.4.0

Use an isolated application-data directory and never a maintainer's live
profile.

1. Launch the published fork `v0.4.0`.
2. Configure representative search, layout, encoding, and plugin settings.
3. Install and launch the candidate build over the same isolated profile.
4. Verify settings migration, Nord styling, PDF search, syntax highlighting,
   and application identity `io.github.sphynx79.searchmonkey`.
5. Verify update requests and release links use only
   `sphynx79/searchmonkey-III`.
6. Confirm telemetry, feedback, website, marketplace, and purchase actions are
   absent.

After publishing the final Linux tarball, update the Flatpak manifest URL and
SHA-256 in a separate commit.
