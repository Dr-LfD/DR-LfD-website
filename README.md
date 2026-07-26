# Decompose and Reorganize: Planning with  Primitives and Visuomotor Policies Learned from Demonstrations

This repository contains the DR-LfD project website. The site is a Vite + React academic project page, with most page content driven by `template.yaml`.

The template is adopted from [Academic Project Page Template](https://github.com/denkiwakame/academic-project-template).

## Requirements

- Node.js 22.13.1, matching the version in `package.json`
- npm

Install dependencies once:

```bash
npm ci
```

## Edit Content

Most website text, paper links, figures, and demo sections live in:

```bash
template.yaml
```

Static assets live under:

```bash
public/
```

## Build

Run the production build before pushing changes:

```bash
npm run build
```

The production output is written to `build/`. This directory is generated and ignored by git.

Optional checks:

```bash
npm run lint
npm run format
npm run typos
```

## Preview

For fast local development:

```bash
npm run dev -- --host 0.0.0.0
```

Open:

```text
http://localhost:8080/
```

To preview the production build:

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Open:

```text
http://localhost:4173/DR-LfD-website/
```

If port `4173` is already in use, Vite will print the next available port, for example `4174`.

## Update Remote

Check the pending changes:

```bash
git status
git diff --stat
```

Commit the website updates:

```bash
git add README.md template.yaml src public scripts MULTIMEDIA_ASSETS.md REDESIGN_PLAN.md
git commit \
  -m "Make the project page easier to scan and preview" \
  -m "The page content and media were revised so reviewers can build, inspect, and deploy the website without rediscovering the local workflow.

Confidence: high
Scope-risk: narrow
Tested: npm run build"
```

Push to the project remote:

```bash
git push dr-origin main
```

GitHub Pages deployment is handled by `.github/workflows/deploy.yaml` on pushes to `main` or `project-page`. The workflow installs dependencies, runs `npm run build`, uploads `build/`, and deploys it to GitHub Pages.
