type PullRequest = {
  id: string
  title: string
  url: string
  comments: number
  number: number
  createdAt: Date
  state: 'OPEN' | 'CLOSED' | 'MERGED'
  author: User
  contributors: User[]
  labels: Label[]
  repositoryUrl: string
  repositoryName: string
  isDraft: boolean
  reviews: Review[]
  requestedReviewers: User[]
  assignees: User[]
  lastCommitChecks: CommitCheck[]
}

type Label = {
  id: number
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

type ReviewState = 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED'

type CommitCheck = {
  result: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED'
  name: string
  description: string
  runUrl: string
  checker: CommitChecker
}

type CommitChecker = User & {
  backgroundColor: string
}
