import { SetStateAction, useEffect, useState } from 'react'
import {
  getCommitChecksQuery,
  getPullRequestsByUserQuery,
  getTeamUsersQuery,
} from '../../helpers/graphqlQueries'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import { Octokit } from 'octokit'
import PullRequest from './PullRequest'
import ReloadIcon from '@mui/icons-material/Replay'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { enumerationToSentenceCase } from '../../helpers/strings'
import moment from 'moment'

const orgName = process.env.ORG_NAME || 'ePages-de'
const teamName = process.env.TEAM_NAME || 'team-black'
export const ICON_BUTTON_SIZE = 40

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

function getReviewers(reviewRequests: GraphQL_ReviewRequest[]): User[] {
  return reviewRequests.map(entity => ({
    login:
      'login' in entity.requestedReviewer
        ? entity.requestedReviewer.login
        : entity.requestedReviewer.name,
    avatarUrl: entity.requestedReviewer.avatarUrl,
  }))
}

function extractContributor(
  user: GraphQL_User | null,
  author: GraphQL_User,
): GraphQL_User {
  return user || author
}

function getContributors(
  commits: GraphQL_Commit[],
  author: GraphQL_User,
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
  state: GraphQL_CommitStatusContext['state'],
): CommitCheck['result'] {
  if (state === 'EXPECTED') return 'IN_PROGRESS'
  if (state === 'PENDING') return 'PENDING'
  if (state === 'SUCCESS') return 'SUCCESS'
  return 'FAILURE'
}

type RefreshLastCommitChecksProps = {
  repoName: string
  prNumber: number
}
export async function refreshLastCommitChecks({
  repoName,
  prNumber,
}: RefreshLastCommitChecksProps) {
  const commitChecks = await octokit
    .graphql<GraphQL_CommitChecksPerPullRequestResponse>(
      getCommitChecksQuery({ orgName, repoName, prNumber }),
    )
    .then(res =>
      getLastCommitChecks(
        res.organization.repository.pullRequest.lastCommit.nodes[0].commit,
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
  lastCommitChecks: GraphQL_LastCommitWithChecks,
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
      completedAt: null,
      checker: {
        login: context.creator.login,
        avatarUrl: context.avatarUrl,
        backgroundColor: '000000',
      },
    })
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
  checkRun: GraphQL_CommitCheckRun,
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
  checkRun: GraphQL_CommitCheckRun,
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
  lastCommitChecks: GraphQL_LastCommitWithChecks,
): PullRequest['lastCommitChecks'] {
  const state = lastCommitChecks.statusCheckRollup?.state
  const result = state ? convertContextStateToCommitCheckResult(state) : null

  return {
    commitChecks: extractLastCommitChecks(lastCommitChecks),
    result,
  }
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
  const [shouldLoad, setShouldLoad] = useState(true)
  const [progress, setProgress] = useState(0)
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const isLoading = progress < 100

  useEffect(() => {
    if (shouldLoad) {
      fetchPullRequests(setProgress).then(setPullRequests)
      setShouldLoad(false)
    }
  }, [shouldLoad])

  const handleReload = () => {
    setProgress(0)
    setShouldLoad(true)
  }

  return (
    <Box sx={{ mx: 'auto', width: '90%' }} maxWidth={1000}>
      <AppBar>
        <Toolbar>
          <Typography>Daily Helper</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Refresh pull requests">
            <IconButton
              edge="end"
              size="large"
              color="inherit"
              onClick={handleReload}
            >
              <ReloadIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        {isLoading && <LinearProgress variant="determinate" value={progress} />}
      </AppBar>
      <Toolbar sx={{ paddingBottom: '1em' }} />
      <Stack spacing={0.5}>
        {pullRequests.map(pr => (
          <PullRequest key={pr.id} isLoading={isLoading} {...pr} />
        ))}
      </Stack>
    </Box>
  )
}
