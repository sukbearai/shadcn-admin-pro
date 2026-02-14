# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + Vue 3 data-visualization project with Three.js scenes.

- `src/main.js`: app bootstrap (Vue + router).
- `src/router/index.js`: route definitions (`/#/` and `/#/globe`).
- `src/views/map/` and `src/views/globe/`: page-level scene orchestration and panel components.
- `src/mini3d/`: reusable 3D engine modules (`core/`, `components/`, `utils/`, `shader/`, `plugins/`).
- `src/components/`: shared UI components.
- `public/assets/json/`: GeoJSON map assets.
- `public/draco/`: Draco decoder files.
- `build/constant.js`: build output constants.

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
- Use Vue 3 Composition API; prefer `<script setup>` for new components.
- Follow existing formatting: 2-space indentation, double quotes in JS, minimal semicolons.
- Prefer alias imports with `@` for `src` (configured in `vite.config.js`).
- Vue component files use PascalCase, for example `YearlyEconomyTrend.vue`.
- Hooks/utilities/modules use camelCase, for example `useThrottle.js`.
- Keep reusable 3D logic in `src/mini3d/`; keep scene-specific behavior in `src/views/*/`.

## Testing Guidelines
No automated test framework is currently configured.

- Treat `npm run build` as the required compile/bundle check.
- Use `npm run preview` for manual production smoke testing after UI/3D changes.
- If adding tests, prefer Vitest + Vue Test Utils and name files `*.spec.js` near source files.

## Commit & Pull Request Guidelines
Follow Conventional Commits used in history, such as:

- `feat(map): add district flyline animation`
- `refactor(globe): simplify intro transition flow`

PRs should include:
- concise summary and scope
- verification commands run
- screenshots/GIFs for visual changes
- related issue/task links when available

## Security & Configuration Tips
- Keep secrets in `.env`; do not commit credentials.
- Optimize large static assets before committing; place them in `public/` or `src/assets/`.
- If adding drill-down map data, keep GeoJSON paths consistent with `public/assets/json/`.

## Map Skinning Workflow
Map skinning is centralized and should be done via the skin config layer instead of scattering hard-coded values.

- Skin source of truth: `src/views/map/skin/index.js` (`defaultMapSkin` + `createMapSkin` deep merge).
- Runtime skin entry: `src/views/map/config.js` -> `mapViewConfig.mapScene.skin`.
- Asset loader binding: `src/views/map/assets.js` reads `skin.assets.textures` and `skin.assets.mapFiles`.
- 3D world theme binding: `src/views/map/map.js` reads `skin.world` for scene, lights, materials, gradients, flyline, particles, stroke, etc.
- Scene injection path: `src/views/map/index.vue` resolves skin and passes it into both `Assets` and `World`.

When replacing map data/materials:
- Prefer overriding only changed fields in `mapViewConfig.mapScene.skin` (partial override merge).
- Keep resource keys stable (`china`, `mapJson`, `mapStroke`; and texture keys used by `getResource(...)`).
- Ensure GeoJSON feature properties include at least `name`, `center`, `centroid`, `adcode`, `childrenNum` for labels/drill-down/fallback.
- If custom drill-down local files are provided, keep naming consistent with existing `assets/json/{name}.json` or `assets/json/areas_v3/bound/{adcode}.json`.
