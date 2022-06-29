# Github Daily Helper

## To-do checklist

- [x] Link commit `CheckRun` to their permalink
- [x] Add reload button to fetch new statuses for commit `CheckRun`. Should also affect overall status on PR card
- [x] Add reload of all pull requests, preferrably with app bar
- [x] Show multiple teams, when specified
- [ ] Rework `UserGroup`s empty states (reconsider what's shown on `DRAFT` PRs)
- [ ] Extract wording to translations file
- [ ] Add filters to hide/show tickets with certain labels (such as `WiP`)
- [ ] Research how to get missing `PENDING` `CheckRun`s. Might be related to required repository checks.
- [ ] List appropriate pull requests where a review from the team was requested
- [ ] Show automatic review requests from `CODEOWNERS`
- [ ] Research and add tab with currently ran github actions for recently merged PRs (potentially filter by `CODEOWNERS`)
- [ ] Research how to make application start faster

## Environment variables

| Variable | Description | Default value |
|:---:|:---:|:---:|
| `REACT_APP_GITHUB_TOKEN` | [Your Github personal access token](https://github.com/settings/tokens). Needed to make requests against Github's GraphQL API. | - |
| `REACT_APP_ORG_NAME` | The name of an organization on Github. Can be found at [https://github.com/{ORG_NAME}](https://github.com/ePages-de). | ePages-de |
| `REACT_APP_TEAM_NAMES` | The name of teams to track on Github separated by commas. Can be found at [https://github.com/orgs/{ORG_NAME}/teams/{TEAM_NAME}](https://github.com/orgs/ePages-de/teams/team-black). | team-black |

## General info

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn build`

Builds the app for production to the `build` folder.\

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
