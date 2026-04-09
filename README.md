# Github Daily Helper

## To-do checklist

- [x] Search team repositories in settings
- [ ] Add no PRs message for no PRs found and all PRs filtered out
- [ ] Add tests
- [ ] Show missing required `CheckRun`s, if possible
- [ ] Research and add tab with currently ran github actions for recently merged PRs (potentially filter by `CODEOWNERS`)
- [ ] Extract wording to translations file
- [ ] (Low priority) Rework `UserGroup`s empty states (reconsider what's shown on `DRAFT` PRs)
- [ ] List appropriate pull requests where a review from the team was requested
- [ ] Research how to make application start faster

## General info

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

A GitHub personal access token with the `repo` and `read:org` scopes is required. [Create one here](https://github.com/settings/tokens).

### Setup

Install dependencies (pnpm recommended):

```sh
pnpm install
```

### Running locally

```sh
pnpm start
```

Opens the app at [http://localhost:3000](http://localhost:3000).

### Building for production

```sh
pnpm build
```

Builds the app into the `build` folder.

### Deploying to GitHub Pages

```sh
pnpm deploy
```

### Formatting

```sh
pnpm fixlint
```
