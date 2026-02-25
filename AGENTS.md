# Repository Guidelines

## Project Structure & Module Organization
This is a single-package Vue 3 + Vite app.
- `src/` contains application code.
- `src/views/visualization/map` and `src/views/visualization/globe` hold screen-specific 3D pages.
- `src/mini3d/` contains reusable Three.js engine primitives (`core`, `components`, `utils`, `shader`, `plugins`).
- `src/router/`, `src/store/`, and `src/components/` contain routing, Pinia stores, and shared UI.
- `public/assets/json/` stores GeoJSON map data; `public/draco/` stores Draco decoder assets.
- `dist/` is build output and should not be hand-edited.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies.
- `pnpm run dev` starts Vite dev server on `0.0.0.0:3000`.
- `pnpm run build` creates a production bundle in `dist/`.
- `pnpm run preview` serves the built bundle locally for verification.

## Coding Style & Naming Conventions
- Use Vue SFCs, and prefer `<script setup>` for new components.
- Follow existing style: 2-space indentation and double quotes.
- Prefer path alias imports (`@/...`) over deep relative paths.
- Use `PascalCase.vue` for feature/UI components (for example, `LoginForm.vue`).
- Use lower-case or kebab-case for module files (for example, `tab-bar.js`, `viewConfigFactory.js`).
- Keep reusable 3D logic in `src/mini3d/`; keep view-specific behavior inside `src/views/visualization/**`.

## Testing Guidelines
No automated test framework is currently configured in `package.json`.
- Minimum pre-PR check: run `pnpm run build` successfully.
- Manually smoke-test login, route guards, and visualization routes (`/visualization/map`, `/visualization/globe`).
- For new complex logic, add colocated tests with `*.spec.js` naming (for example, `src/utils/foo.spec.js`) and document how to run them in the PR.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits.
- Use prefixes like `feat:`, `refactor:`, `fix:`, `style:`, `docs:`, `chore:`.
- Keep commit messages focused and imperative (one logical change per commit).
- PRs should include: change summary, affected paths/routes, verification steps, and linked issue/task.
- Include screenshots or short recordings for UI/visualization changes.

## Security & Configuration Tips
- Keep secrets out of git; use local `.env` only.
- Validate large asset changes (GeoJSON/textures) for size and load-time impact before merging.
