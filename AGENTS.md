# Repository Guidelines

## Project Structure & Module Organization
- `prompts/` contains the source YAML prompt files (one prompt per file, e.g., `prompts/codereview.yml`).
- `scripts/` holds Bun/TypeScript tooling for build, validation, version sync, and bumps.
- `dist/` contains generated outputs (`dist/package.yml`) used for releases/GitHub Pages; treat as build artifacts.
- `docs/` hosts contributor and publishing guides.
- `.github/` stores CI workflows and issue templates.
- `_manifest.yml` is the Espanso package manifest and must stay in sync with `package.json`.

## Build, Test, and Development Commands
- `bun install` installs dependencies.
- `bun run validate` checks all prompt files for required fields, trigger rules, and duplicates.
- `bun run build` generates `dist/package.yml` and syncs manifest metadata.
- `bun run test:version` verifies version parity between `_manifest.yml` and `package.json`.
- `bun run bump:patch|minor|major` bumps versions and runs the build.

## Coding Style & Naming Conventions
- YAML prompt files use `trigger`, `label`, `description`, `prompt` keys and a multi-line block (`prompt: |`). When a variable should accept multi-line input (e.g. code, stack traces, long text), add `form_fields` with `multiline: true` for that variable.
- Triggers must start with `:` and contain no spaces; prefer lowercase without dashes (e.g., `:codereview`).
- File names should mirror the trigger without dashes (e.g., `prompts/codereview.yml`).
- Prompt variables use `{{name}}` or `{{name|default}}`; keep variable names descriptive.
- TypeScript scripts use ES modules, 2-space indentation, double quotes, and semicolons (match existing style).

## Testing Guidelines
There is no unit test framework. Validation is script-based:
- Run `bun run validate` for schema/format checks and unique triggers.
- Run `bun run test:version` when changing versions or manifests.

## Commit & Pull Request Guidelines
Commit history leans toward Conventional Commits (e.g., `feat:`, `fix:`, `chore(release):`) with optional scopes; a few commits are simple “Add …” messages. Prefer Conventional Commits for consistency.
PRs should include:
- A short description of the change and affected triggers/files.
- Linked issues for new prompts (especially if created via issue templates).
- Confirmation that `bun run validate` and `bun run build` were executed when prompt files change.

## Security & Configuration Tips
Prompts are public content. Do not add secrets, tokens, or personal data. If a prompt needs input, use variables instead of hard-coded values.

