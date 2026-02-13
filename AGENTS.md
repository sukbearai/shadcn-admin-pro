# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + Vue 3 data-visualization project with Three.js scenes.

- `src/main.js`: app bootstrap (Vue + router).
- `src/views/map/` and `src/views/globe/`: main screen pages, scene orchestration, and view-specific components.
- `src/mini3d/`: reusable 3D engine modules (`core/`, `components/`, `shader/`, `utils/`, `plugins/`).
- `src/components/`: shared UI components (cards, menu, header, charts).
- `src/assets/`: fonts, textures, images, and SCSS.
- `public/assets/json/`: GeoJSON map data.
- `public/draco/`: Draco decoder files for compressed 3D assets.
- `build/constant.js`: centralized build constants.

## Build, Test, and Development Commands
Use one package manager per branch to avoid lockfile churn.

- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server on `0.0.0.0:3000`.
- `npm run build`: create production output in `dist/`.
- `npm run preview`: preview the production build locally.

Example workflow:
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Coding Style & Naming Conventions
- Use Vue 3 Composition API (`<script setup>` where practical).
- Follow existing formatting: 2-space indentation, double quotes in JS, and minimal semicolons.
- Prefer alias imports with `@` for `src` paths (configured in `vite.config.js`).
- Vue components: PascalCase file names (for example `YearlyEconomyTrend.vue`).
- Utilities/hooks/modules: camelCase (for example `useThrottle.js`).
- Keep reusable 3D logic in `src/mini3d/`; keep scene-specific behavior inside `src/views/*/`.

## Testing Guidelines
No automated test framework is currently configured.

- Treat `npm run build` as the required compile/bundle check.
- Use `npm run preview` for production smoke testing after UI/3D changes.
- If adding tests, prefer Vitest + Vue Test Utils and name files `*.spec.js` near source files.

## Commit & Pull Request Guidelines
Follow Conventional Commits as seen in history (`feat:`, `refactor:`, `chore:`).

- Commit example: `feat(map): add district flyline animation`
- PRs should include: concise summary, scope, verification commands run, and screenshots/GIFs for visual changes.
- Link related issues/tasks when available.

## Security & Configuration Tips
- Keep secrets in `.env`; do not commit credentials.
- Place large static assets in `public/` or `src/assets/` and optimize file size before committing.
