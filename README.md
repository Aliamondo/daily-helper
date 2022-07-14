# Github Daily Helper

## To-do checklist

- [x] Link commit `CheckRun` to their permalink
- [x] Add reload button to fetch new statuses for commit `CheckRun`. Should also affect overall status on PR card
- [x] Add reload of all pull requests, preferrably with app bar
- [x] Show multiple teams, when specified
- [x] Show all users of a group when clicking on `+x` icon
- [x] Link to `/checks` from commit check runs title
- [x] Add filters to hide/show tickets with certain labels (such as `WiP`)
- [x] Add filters to hide/show tickets without any labels and reset filters
- [x] Research how to get missing `PENDING` `CheckRun`s. Might be related to required repository checks.
- [x] Show which branch the PR was created against (hide against `master`/`base`?)
- [x] Select team owned repositories per team
- [x] Minify GraphQL queries before sending requests
- [ ] Search team repositories in settings
- [ ] Add no PRs message for no PRs found and all PRs filtered out
- [ ] Add tests
- [ ] Show missing required `CheckRun`s, if possible
- [ ] Research and add tab with currently ran github actions for recently merged PRs (potentially filter by `CODEOWNERS`)
- [ ] Extract wording to translations file
- [ ] (Low priority) Rework `UserGroup`s empty states (reconsider what's shown on `DRAFT` PRs)
- [ ] List appropriate pull requests where a review from the team was requested
- [ ] Research how to make application start faster

## Environment variables

| Variable | Description | Default value |
|:---:|:---:|:---:|
| `REACT_APP_TEAM_NAMES` | The name of teams to track on Github separated by commas. Can be found at [https://github.com/orgs/{ORG_NAME}/teams/{TEAM_NAME}](https://github.com/orgs/ePages-de/teams/team-black). | team-black |

## General info

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn build`

Builds the app for production to the `build` folder.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
