type PullRequest = {
  id: string
  title: string
  url: string
  comments: number
  number: number
  createdAt: Date
  state: 'OPEN' | 'CLOSED' | 'MERGED'
  reviewDecision: 'REVIEW_REQUIRED' | 'APPROVED' | 'CHANGES_REQUESTED'
  author: User
  contributors: User[]
  labels: Label[]
  repositoryUrl: string
  repositoryName: string
  isDraft: boolean
  reviews: Review[]
  requestedReviewers: User[]
  assignees: User[]
  lastCommitChecks: {
    commitChecks: CommitCheck[]
    result: CommitCheck['result'] | null
  }
}

type Label = {
  id: string
  color: string
  name: string
  description: string
}

type User = {
  login: string
  avatarUrl: string
}

type Review = {
  state: ReviewState
  reviewer: User
}

type ReviewState =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'COMMENTED'
  | 'PENDING'
  | 'DISMISSED'

type CommitCheck = {
  id: string
  result: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED'
  name: string
  description: string
  runUrl: string
  startedAt: Date | null
  completedAt: Date | null
  checker: CommitChecker
}

type CommitChecker = User & {
  backgroundColor: string
}
