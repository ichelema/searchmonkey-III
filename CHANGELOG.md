# Changelog

## 0.5.0 (unreleased)

This version follows the fork's existing `v0.4.0` release. It does not replace
or move that tag, which represents a different codebase from upstream 0.4.0.

### Upstream-derived changes

- Improved search controls, layout behavior, and rendering.
- Added file and directory name filtering.
- Added Windows-1250 decoding for regular search results.
- Added configurable file-opening applications.
- Improved Linux packaging.

### Fork-specific integration

- Preserved the Nord interface and the fork's application identity.
- Kept PDF/plugin previews UTF-8 while adding Windows-1250 for regular files.
- Kept Open and Reveal targeting source documents for generated previews.
- Retained PDF search, syntax highlighting, and plugin settings.
- Retained the removal of telemetry, feedback, website, marketplace, and
  purchase functionality.

### Upgrade compatibility

- Existing settings remain in the same application data namespace.
- Legacy file-opening settings are migrated to the current format.
- Update checks and release links continue to use the fork repository.
