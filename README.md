# Github Daily Helper

## To-do checklist

- [x] Search team repositories in settings
- [x] Add no PRs message for no PRs found and all PRs filtered out
- [ ] Add tests
- [ ] Show missing required `CheckRun`s, if possible
- [ ] Research and add tab with currently ran github actions for recently merged PRs (potentially filter by `CODEOWNERS`)
- [ ] Extract wording to translations file
- [ ] (Low priority) Rework `UserGroup`s empty states (reconsider what's shown on `DRAFT` PRs)
- [x] List appropriate pull requests where a review from the team was requested
- [x] Research how to make an application start faster
- [ ] Add Orchestrator view. One section per repo (hideable) plus custom ones for things like syncs. Pull in notes added to PRs in List or Kanban views.

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
