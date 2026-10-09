# GitHub Daily Helper

## To-do checklist

- [ ] ~~Show missing required `CheckRun`s, if possible~~ `CheckRun` feature is on pause because in my current projects I have 80+ checks for every PR and hundreds of PRs to load.
- [ ] ~~Research and add tab with currently ran github actions for recently merged PRs (potentially filter by `CODEOWNERS`)~~
- [ ] (Low priority) Extract wording to translations file

## General info

This project uses [Vite](https://vitejs.dev/) + React + TypeScript.

### Prerequisites

A GitHub personal access token with the `repo` and `read:org` scopes is required. [Create one here](https://github.com/settings/tokens).

### Setup

Install dependencies:

```sh
pnpm install
```

### Running locally

```sh
pnpm start
```

Opens the app at [http://localhost:5173](http://localhost:5173).

### Building for production

```sh
pnpm build
```

Builds the app into the `dist` folder.

### Deploying to GitHub Pages

Deployment happens automatically on every push to `master` via GitHub Actions.

### Formatting

```sh
pnpm fixlint
```
