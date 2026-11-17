# asifur-rahman9.github.io

Personal site: a terminal-style hero with a pixel-art desk scene, projects shown as a commit history pulled from GitHub, and a small runner game.

**Live:** https://asifur-rahman9.github.io

## Stack
- [Astro](https://astro.build) renders every section to static HTML at build time (projects are readable without JS)
- React islands for the interactive parts: terminal and hero scene (`client:load`), project explorer (`client:idle`), game (`client:visible`)
- Vitest for the terminal commands, GitHub helpers and cache
- GitHub Actions: test + build on every PR, deploy to GitHub Pages on `main`

## Run
```bash
npm install
npm run dev     # http://localhost:4321
npm test
npm run build   # outputs dist/
```

## Edit content
All copy lives in `src/data/site.ts`: projects, minor repos, and the experience, skills and education the terminal prints. The resume button serves `public/resume.pdf`.

## GitHub data
Commits and repo descriptions are fetched at build time (CI passes `GITHUB_TOKEN` for a higher rate limit), then refreshed in the browser and cached in `localStorage` for 10 minutes. The site rebuilds every 6 hours, and right away when a project repo pushes if it has `extras/notify-site.yml` installed.

## Layout
```
src/data/site.ts          content
src/lib/commands.ts       terminal commands (pure, tested)
src/lib/github.ts         GitHub API helpers (tested)
src/lib/cache.ts          localStorage cache shared by the islands (tested)
src/lib/events.ts         window events between the islands
src/lib/sprites.ts        pixel-art sprites for the hero scene and game
src/lib/game.ts           runner game engine
src/components/*.tsx      React islands
src/pages/index.astro     page
.github/workflows/        CI/CD
extras/notify-site.yml    workflow to copy into project repos
```
