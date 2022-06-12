import { SetStateAction, useEffect, useState } from 'react'
import {
  getPullRequestsByUserQuery,
  getTeamUsersQuery,
} from '../../helpers/graphqlQueries'

import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import { Octokit } from 'octokit'
import PullRequest from './PullRequest'
import Stack from '@mui/material/Stack'

const orgName = process.env.ORG_NAME || 'ePages-de'
const teamName = process.env.TEAM_NAME || 'team-crimson'

function calculateNumberOfComments(
  comments: number,
  reviews: GraphQL_Review[],
) {
  const reviewCommentedBody = reviews.filter(review =>
    Boolean(review.body),
  ).length
  const reviewComments = reviews
    .map(review => review.comments.totalCount)
    .reduce((currentSum, x) => currentSum + x, 0)

  return comments + reviewCommentedBody + reviewComments
}

function formatReviews(reviews: GraphQL_Review[]): Review[] {
  const formattedReviews = reviews.map(
    (review): Review => ({
      state: review.state,
      reviewer: review.author,
    }),
  )

  const reviewsMap = new Map(
    formattedReviews.map(review => [review.reviewer.login, review]),
  )

  return Array.from(reviewsMap.values())
}

function getReviewers(reviewRequests: GraphQL_ReviewRequest[]): User[] {
  return reviewRequests.map(entity => ({
    login:
      'login' in entity.requestedReviewer
        ? entity.requestedReviewer.login
        : entity.requestedReviewer.name,
    avatarUrl: entity.requestedReviewer.avatarUrl,
  }))
}

function getContributors(
  commits: GraphQL_Commit[],
  author: GraphQL_User,
): User[] {
  const contributors = new Map(
    commits
      .flatMap(({ commit: { author: commitAuthor, committer } }) => [
        commitAuthor.user || author,
        committer.user || author,
      ])
      .map(user => [user.login, user]),
  )
  contributors.delete(author.login)

  return Array.from(contributors.values())
}

function convertContextStateToCommitCheckResult(
  state: GraphQL_CommitStatusContext['state'],
): CommitCheck['result'] {
  if (state === 'PENDING' || state === 'EXPECTED') return 'PENDING'
  if (state === 'SUCCESS') return 'SUCCESS'
  return 'FAILURE'
}

/**
 * @returns List of commit checks according to the internal type
 * @description In order to get the total number of checks for a commit,
 * we need to get all check suites of the commit and iterate every check step.
 * That number needs to be added to the number of contexts of a commit status.
 */
function getLastCommitChecks(
  lastCommitChecks: GraphQL_LastCommitWithChecks,
): CommitCheck[] {
  const commitChecks: CommitCheck[] = []

  const {
    checkSuites: { nodes: checkSuites },
    status,
  } = lastCommitChecks

  checkSuites.forEach(checkSuite => {
    const checker: CommitChecker = {
      login: checkSuite.app.slug,
      avatarUrl: checkSuite.app.logoUrl,
      backgroundColor: checkSuite.app.logoBackgroundColor,
    }

    checkSuite.checkRuns.nodes.forEach(checkRun => {
      commitChecks.push({
        name: checkRun.name,
        description: getCommitCheckDescription(checkRun),
        result: extractCommitCheckRunResult(checkRun),
        runUrl: checkRun.permalink,
        checker,
      })
    })
  })

  status?.contexts.forEach(context => {
    commitChecks.push({
      name: context.context,
      description: context.description,
      result: convertContextStateToCommitCheckResult(context.state),
      runUrl: context.targetUrl,
      checker: {
        login: context.creator.login,
        avatarUrl: context.avatarUrl,
        backgroundColor: '000000',
      },
    })
  })

  return commitChecks
}

function getCommitCheckDescription(checkRun: GraphQL_CommitCheckRun): string {
  return checkRun.status
}

function extractCommitCheckRunResult(
  checkRun: GraphQL_CommitCheckRun,
): CommitCheck['result'] {
  if (checkRun.status === 'COMPLETED') {
    if (
      checkRun.conclusion === 'SUCCESS' ||
      checkRun.conclusion === 'NEUTRAL'
    ) {
      return 'SUCCESS'
    }
    if (checkRun.conclusion === 'SKIPPED') {
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
  )
    return 'PENDING'
  return 'FAILURE'
}

const octokit = new Octokit({
  auth: process.env.REACT_APP_GITHUB_TOKEN,
})
async function fetchPullRequests(setProgress: {
  (value: SetStateAction<number>): void
  (arg0: number): void
}): Promise<PullRequest[]> {
  const teamUsers: string[] = await octokit
    .graphql<GraphQL_UserResponse>(getTeamUsersQuery({ orgName, teamName }))
    .then(res =>
      res.organization.teams.nodes[0].members.nodes.map(
        (user: GraphQL_User) => user.login,
      ),
    )
  setProgress(10)

  let progress = 10

  const pullRequestPromises = Promise.all(
    teamUsers.map(user =>
      octokit
        .graphql<GraphQL_PullRequestsPerUserResponse>(
          getPullRequestsByUserQuery({ orgName, author: user }),
        )
        .then(res => {
          progress += 90 / teamUsers.length
          setProgress(progress)
          return res
        }),
    ),
  )

  const rawPullRequestsData = await pullRequestPromises
  const rawPullRequests = rawPullRequestsData
    .map(res => res.search.nodes)
    .flat()

  const pullRequests = rawPullRequests.map(
    (pr): PullRequest => ({
      id: pr.id,
      author: pr.author,
      title: pr.title,
      number: pr.number,
      url: pr.permalink,
      repositoryUrl: pr.repository.url,
      repositoryName: pr.repository.name,
      state: pr.state,
      isDraft: pr.isDraft,
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
      lastCommitChecks: getLastCommitChecks(pr.lastCommit.nodes[0].commit),
    }),
  )

  pullRequests.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())

  // allow loading bar to hit 100% for 0.5 seconds
  await new Promise(res => setTimeout(res, 500))

  // team-review-requested:${teamName}
  return pullRequests
}

export default function DailyHelper() {
  const [firstTime, setFirstTime] = useState(true)
  const [progress, setProgress] = useState(0)
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])

  useEffect(() => {
    if (firstTime) {
      fetchPullRequests(setProgress).then(setPullRequests)
      setFirstTime(false)
    }
  }, [firstTime])

  if (!pullRequests.length)
    return <LinearProgress variant="determinate" value={progress} />

  return (
    <Box sx={{ mx: 'auto', width: '90%' }} maxWidth={1000}>
      <Stack spacing={0.5}>
        {pullRequests.map(pr => (
          <PullRequest key={pr.id} {...pr} />
        ))}
      </Stack>
    </Box>
  )
}
