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
}

type Label = {
  id: number
  color: string
  name: string
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
