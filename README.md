# asifur-rahman9.github.io

Personal site: terminal-themed landing page with experience, projects, toolbox and a small runner game.

**Live:** https://asifur-rahman9.github.io

## Stack
- [Astro](https://astro.build) renders every section to static HTML at build time (projects are readable without JS)
- React islands for the interactive parts: terminal (`client:load`), dog (`client:idle`), project explorer, toolbox and game (`client:visible`)
- Vitest for the terminal command logic
- GitHub Actions: test + build on every PR, deploy to GitHub Pages on `main`

## Run
```bash
npm install
npm run dev     # http://localhost:4321
npm test
npm run build   # outputs dist/
```

## Edit content
All copy lives in `src/data/site.ts` (experience, projects, toolbox). To show the resume button, add `public/resume.pdf` and set `resume: '/resume.pdf'`.

## Layout
```
src/data/site.ts          content
src/lib/commands.ts       terminal commands (pure, tested)
src/lib/game.ts           runner game engine
src/components/*.tsx      React islands
src/pages/index.astro     page
.github/workflows/        CI/CD
```
