import {
  getCommitChecksQuery,
  getPullRequestsByRepositoriesQuery,
  getPullRequestsByUserQuery,
  getTeamRepositories,
  getTeamUsersQuery,
} from './graphqlQueries'

import { Octokit } from 'octokit'
import { SetStateAction } from 'react'
import { enumerationToSentenceCase } from './strings'
import moment from 'moment'
import { settingsHandler } from './settingsHandler'

const octokit = new Octokit({
  auth: process.env.REACT_APP_GITHUB_TOKEN,
})

function calculateNumberOfComments(
  comments: number,
  reviews: GraphQL.Review[],
) {
  const reviewCommentedBody = reviews.filter(review =>
    Boolean(review.body),
  ).length
  const reviewComments = reviews
    .map(review => review.comments.totalCount)
    .reduce((currentSum, x) => currentSum + x, 0)

  return comments + reviewCommentedBody + reviewComments
}

function formatReviews(reviews: GraphQL.Review[]): Review[] {
  const formattedReviews = reviews.map(
    (review): Review => ({
      state: review.state,
      reviewer: review.author,
    }),
  )

  const reviewsMap = new Map()
  formattedReviews.forEach(review => {
    if (
      !reviewsMap.has(review.reviewer.login) ||
      review.state !== 'COMMENTED'
    ) {
      reviewsMap.set(review.reviewer.login, review)
    }
    // skip COMMENTED reviews, if they came after another type of review
  })

  return Array.from(reviewsMap.values())
}

function getReviewers(reviewRequests: GraphQL.ReviewRequest[]): User[] {
  return reviewRequests.map(entity => ({
    login:
      'login' in entity.requestedReviewer
        ? entity.requestedReviewer.login
        : entity.requestedReviewer.name,
    avatarUrl: entity.requestedReviewer.avatarUrl,
  }))
}

function extractContributor(
  user: GraphQL.User | null,
  author: GraphQL.User,
): GraphQL.User {
  return user || author
}

function getContributors(
  commits: GraphQL.Commit[],
  author: GraphQL.User,
): User[] {
  const contributors = new Map(
    commits
      .flatMap(({ commit: { author: commitAuthor, committer } }) => [
        extractContributor(commitAuthor.user, author),
        extractContributor(committer.user, author),
      ])
      .map(user => [user.login, user]),
  )
  contributors.delete(author.login)

  return Array.from(contributors.values())
}

function convertContextStateToCommitCheckResult(
  state: GraphQL.CommitStatusContext['state'],
): CommitCheck['result'] {
  if (state === 'EXPECTED') return 'IN_PROGRESS'
  if (state === 'PENDING') return 'PENDING'
  if (state === 'SUCCESS') return 'SUCCESS'
  return 'FAILURE'
}

type RefreshLastCommitChecksProps = {
  orgName: string
  repoName: string
  prNumber: number
}
async function refreshLastCommitChecks({
  orgName,
  repoName,
  prNumber,
}: RefreshLastCommitChecksProps) {
  const commitChecks = await octokit
    .graphql<GraphQL.CommitChecksPerPullRequestResponse>(
      getCommitChecksQuery({ orgName, repoName, prNumber }),
    )
    .then(res =>
      getLastCommitChecks(
        res.organization.repository.pullRequest.lastCommit.nodes[0].commit,
        res.organization.repository.pullRequest.baseRef.branchProtectionRule
          ?.requiredStatusCheckContexts,
      ),
    )

  return commitChecks
}

/**
 * @returns List of commit checks according to the internal type
 * @description In order to get the total number of checks for a commit,
 * we need to get all check suites of the commit and iterate every check step.
 * That number needs to be added to the number of contexts of a commit status.
 */
function extractLastCommitChecks(
  lastCommitChecks: GraphQL.LastCommitWithChecks,
  requiredStatusCheckContexts: GraphQL.BaseRef['branchProtectionRule']['requiredStatusCheckContexts'],
): CommitCheck[] {
  const commitChecks: CommitCheck[] = []

  const {
    checkSuites: { nodes: checkSuites },
    status,
    statusCheckRollup,
  } = lastCommitChecks

  checkSuites.forEach(checkSuite => {
    const checker: CommitChecker = {
      login: checkSuite.app.slug,
      avatarUrl: checkSuite.app.logoUrl,
      backgroundColor: checkSuite.app.logoBackgroundColor,
    }

    checkSuite.checkRuns.nodes.forEach(checkRun => {
      const startedAt = checkRun.startedAt ? new Date(checkRun.startedAt) : null
      const completedAt = checkRun.completedAt
        ? new Date(checkRun.completedAt)
        : null

      commitChecks.push({
        id: checkRun.id,
        name: checkRun.name,
        description: getCommitCheckDescription(
          checkRun,
          startedAt,
          completedAt,
        ),
        result: extractCommitCheckRunResult(checkRun),
        runUrl: checkRun.permalink,
        required: false,
        startedAt,
        completedAt,
        checker,
      })
    })
  })

  status?.contexts.forEach(context => {
    commitChecks.push({
      id: context.id,
      name: context.context,
      description: context.description,
      result: convertContextStateToCommitCheckResult(context.state),
      runUrl: context.targetUrl,
      startedAt: new Date(context.createdAt),
      required: false,
      completedAt: null,
      checker: {
        login: context.creator.login,
        avatarUrl: context.avatarUrl,
        backgroundColor: '000000',
      },
    })
  })

  requiredStatusCheckContexts?.forEach((contextName, i) => {
    const index = commitChecks.findIndex(
      commitCheck => commitCheck.name === contextName,
    )
    if (index >= 0) {
      commitChecks[index].required = true
    } else {
      commitChecks.push({
        id: `required-${i}`,
        name: contextName,
        description: '',
        result: 'PENDING',
        runUrl: '',
        startedAt: null,
        completedAt: null,
        required: true,
        checker: {
          login: contextName.toLocaleUpperCase(),
          avatarUrl: 'fakeurl',
          backgroundColor: '000000',
        },
      })
    }
  })

  // Only fix the order when there are check contexts
  if (!!statusCheckRollup) {
    const commitChecksOrder = statusCheckRollup.contexts.nodes.map(
      ({ id }) => id,
    )
    commitChecks.sort(
      (a, b) =>
        commitChecksOrder.indexOf(a.id) - commitChecksOrder.indexOf(b.id),
    )
  }

  return commitChecks
}

function getCommitCheckDescription(
  checkRun: GraphQL.CommitCheckRun,
  startedAt: Date | null,
  completedAt: Date | null,
): string {
  if (checkRun.status === 'COMPLETED') {
    if (
      checkRun.conclusion === 'NEUTRAL' ||
      checkRun.conclusion === 'SKIPPED'
    ) {
      return 'Skipped'
    }

    const runTime = moment(completedAt).from(moment(startedAt), true)
    return enumerationToSentenceCase(`${checkRun.status} in ${runTime}`)
  }

  return enumerationToSentenceCase(checkRun.status)
}

function extractCommitCheckRunResult(
  checkRun: GraphQL.CommitCheckRun,
): CommitCheck['result'] {
  if (checkRun.status === 'COMPLETED') {
    if (checkRun.conclusion === 'SUCCESS') {
      return 'SUCCESS'
    }
    if (
      checkRun.conclusion === 'SKIPPED' ||
      checkRun.conclusion === 'NEUTRAL'
    ) {
      return 'SKIPPED'
    }
    return 'FAILURE'
  }
  if (checkRun.status === 'IN_PROGRESS') return 'IN_PROGRESS'
  if (
    checkRun.status === 'PENDING' ||
    checkRun.status === 'QUEUED' ||
    checkRun.status === 'WAITING' ||
    checkRun.status === 'REQUESTED'
  ) {
    return 'PENDING'
  }
  return 'FAILURE'
}

function getLastCommitChecks(
  lastCommitChecks: GraphQL.LastCommitWithChecks,
  requiredStatusCheckContexts: GraphQL.BaseRef['branchProtectionRule']['requiredStatusCheckContexts'],
): PullRequest['lastCommitChecks'] {
  const state = lastCommitChecks.statusCheckRollup?.state
  const result = state ? convertContextStateToCommitCheckResult(state) : null

  return {
    commitChecks: extractLastCommitChecks(
      lastCommitChecks,
      requiredStatusCheckContexts,
    ),
    result,
  }
}

async function fetchPullRequests(
  orgName: string,
  teamName: string,
  setProgress: {
    (value: SetStateAction<number>): void
    (arg0: number): void
  },
): Promise<PullRequest[]> {
  const teamRepositories = settingsHandler.loadTeam(teamName)?.repositories

  const teamUsers: string[] = await octokit
    .graphql<GraphQL.UserResponse>(getTeamUsersQuery({ orgName, teamName }))
    .then(res =>
      res.organization.teams.nodes[0].members.nodes.map(
        (user: GraphQL.User) => user.login,
      ),
    )
  setProgress(10)

  let progress = 10
  const totalResources = teamUsers.length + (teamRepositories ? 1 : 0)

  const pullRequestPromises = teamUsers.map(user =>
    octokit
      .graphql<GraphQL.PullRequestsResponse>(
        getPullRequestsByUserQuery({ orgName, author: user }),
      )
      .then(res => {
        progress += 90 / totalResources
        setProgress(progress)
        return res
      }),
  )

  teamRepositories &&
    pullRequestPromises.push(
      octokit
        .graphql<GraphQL.PullRequestsResponse>(
          getPullRequestsByRepositoriesQuery({
            repositories: teamRepositories,
          }),
        )
        .then(res => {
          progress += 90 / totalResources
          setProgress(progress)
          return res
        }),
    )

  const rawPullRequestsData = await Promise.all(pullRequestPromises)
  const rawPullRequests = rawPullRequestsData
    .map(res => res.search.nodes)
    .flat()

  // We have to get rid of duplicate PRs from team repositories from team users
  const uniquePullRequests = new Map<string, GraphQL.PullRequest>()
  rawPullRequests.forEach(pr => uniquePullRequests.set(pr.id, pr))

  const pullRequests = Array.from(uniquePullRequests.values()).map(
    (pr): PullRequest => ({
      id: pr.id,
      author: pr.author,
      title: pr.title,
      number: pr.number,
      url: pr.permalink,
      repositoryUrl: pr.repository.url,
      repositoryName: pr.repository.name,
      repositoryBaseRef: pr.repository.defaultBranchRef.name,
      baseRef: pr.baseRef.name,
      state: pr.state,
      isDraft: pr.isDraft,
      reviewDecision: pr.reviewDecision,
      createdAt: new Date(pr.createdAt),
      labels: pr.labels.nodes,
      reviews: formatReviews(pr.reviews.nodes),
      comments: calculateNumberOfComments(
        pr.comments.totalCount,
        pr.reviews.nodes,
      ),
      requestedReviewers: getReviewers(pr.reviewRequests.nodes),
      contributors: getContributors(pr.commits.nodes, pr.author),
      assignees: pr.assignees.nodes,
      lastCommitChecks: getLastCommitChecks(
        pr.lastCommit.nodes[0].commit,
        pr.baseRef.branchProtectionRule?.requiredStatusCheckContexts,
      ),
    }),
  )

  pullRequests.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())

  // allow loading bar to hit 100% for 0.5 seconds
  await new Promise(res => setTimeout(res, 500))

  // team-review-requested:${teamName}
  return pullRequests
}

async function fetchTeamRepositories(
  orgName: string,
  teamName: string,
  pageInfoCursor: string,
  isNextPage: boolean,
): Promise<TeamRepositoryPageable> {
  const {
    edges: repositoriesRaw,
    totalCount,
    pageInfo,
  } = await octokit
    .graphql<GraphQL.TeamRepositoryResponse>(
      getTeamRepositories({ orgName, teamName, pageInfoCursor, isNextPage }),
    )
    .then(res => res.organization.teams.nodes[0].repositories)

  return {
    teamRepositories: repositoriesRaw.map(repository => ({
      permission: repository.permission,
      name: repository.node.name,
      nameWithOwner: repository.node.nameWithOwner,
    })),
    total: totalCount,
    hasNextPage: pageInfo.hasNextPage,
    hasPreviousPage: pageInfo.hasPreviousPage,
    startCursor: pageInfo.startCursor,
    endCursor: pageInfo.endCursor,
  }
}

export { fetchPullRequests, refreshLastCommitChecks, fetchTeamRepositories }
