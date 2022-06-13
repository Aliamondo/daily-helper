# Github Daily Helper

## To-do checklist

- [x] Link commit `CheckRun`' to their permalink
- [ ] Rework `UserGroup`s empty states (reconsider what's shown on `DRAFT` PRs)
- [ ] Extract wording to translations file
- [ ] Add filters to hide/show `WiP` tickets
- [ ] Add reload button to fetch new statuses for commit `CheckRun`. Should also affect overall status on PR card
- [ ] Research how to get missing `PENDING` `CheckRun`
- [ ] List appropriate pull requests where a review from the team was requested
- [ ] Research and add tab with currently ran github actions for recently merged PRs (potentially filter by `CODEOWNERS`)
- [ ] Research how to make application start faster

## Environment variables

| Variable | Description | Default value |
|:---:|:---:|:---:|
| `REACT_APP_GITHUB_TOKEN` | [Your Github personal access token](https://github.com/settings/tokens). Needed to make requests against Github GraphQL API. | - |
| `ORG_NAME` | The name of an organization on Github. Can be found at [https://github.com/{ORG_NAME}](https://github.com/ePages-de). | ePages-de |
| `TEAM_NAME` | The name of a team on Github. Can be found at [https://github.com/orgs/{ORG_NAME}/teams/{TEAM_NAME}](https://github.com/orgs/ePages-de/teams/team-black). | team-black |

## General info

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn build`

Builds the app for production to the `build` folder.\

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
