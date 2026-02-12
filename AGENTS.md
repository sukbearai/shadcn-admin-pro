# Repository Guidelines

## Project Structure & Module Organization
This project is a Vite + Vue 3 data-visualization app with Three.js rendering.

- `src/main.js` bootstraps Vue and router.
- `src/views/map/` contains the main large-screen view (`index.vue`) and 3D scene orchestration (`map.vue`, `map.js`, `map/*`).
- `src/mini3d/` is the reusable 3D engine layer (`core/`, `components/`, `shader/`, `utils/`, `plugins/`).
- `src/components/` holds shared UI components (cards, menu, radar, header).
- `src/assets/` stores styles, textures, fonts, and static UI images.
- `public/assets/json/` contains map GeoJSON data; `public/draco/` contains Draco decoder assets.
- `build/constant.js` centralizes build constants (for example `dist` output folder).

## Build, Test, and Development Commands
- `npm install` (or `pnpm install`): install dependencies.
- `npm run dev`: start Vite dev server with host binding (`vite --host`).
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: preview the production bundle locally.

Use one package manager consistently in a branch to avoid lockfile churn.

## Coding Style & Naming Conventions
- Use ES modules and Vue 3 Composition API (`<script setup>` where applicable).
- Match existing formatting: 2-space indentation, double quotes in JS, and minimal semicolon usage unless file style already differs.
- Use alias imports via `@` for `src` (configured in `vite.config.js`).
- Vue component files use PascalCase (for example `YearlyEconomyTrend.vue`); utility modules use camelCase.
- Keep 3D engine code separated: scene logic in `src/views/map/`, reusable primitives/plugins in `src/mini3d/`.

## Testing Guidelines
There is currently no automated test framework configured (no `test` script in `package.json`).

For changes, run:
- `npm run build` to catch compile/runtime bundling errors.
- `npm run preview` for a quick production smoke test.

When adding tests, prefer Vitest + Vue Test Utils and place specs near source as `*.spec.js`.

## Commit & Pull Request Guidelines
This repository currently has no commit history, so adopt Conventional Commits:
- `feat(map): add district flyline animation`
- `fix(three): handle texture loading fallback`

PRs should include:
- concise summary and scope,
- screenshots/GIFs for UI or 3D visual changes,
- verification notes (commands run, e.g. `npm run build`),
- linked issue/task when available.

## Security & Configuration Tips
- Keep secrets in `.env`; never commit credentials.
- Large model/texture files should go in `public/` or `src/assets/` with clear naming and optimized size.
