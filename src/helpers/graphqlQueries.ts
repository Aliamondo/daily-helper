const UserNode = `login avatarUrl`
const LastCommitChecksNode = `
lastCommit: commits(last: 1) {
  nodes {
    commit {
      checkSuites(first: 10) {
        nodes {
          checkRuns(first: 100) {
            nodes {
              id
              name
              status
              conclusion
              permalink
              startedAt
              completedAt
            }
          }
          app {
            slug
            logoUrl
            logoBackgroundColor
          }
        }
      }
      status {
        contexts {
          id
          context
          description
          state
          createdAt
          creator {
            login
          }
          avatarUrl
          targetUrl
        }
      }
      statusCheckRollup {
        state
        contexts(first: 100) {
          nodes {
            ... on CheckRun {
              id
            }
            ... on StatusContext {
              id
            }
          }
        }
      }
    }
  }
}`

type GetTeamUsersProps = {
  orgName: string
  teamName: string
}
export function getTeamUsersQuery({ orgName, teamName }: GetTeamUsersProps) {
  return `{
    organization(login: "${orgName}"){
      teams(query: "${teamName}",first: 1){
        nodes{
          members(first: 100){
            nodes{
              ${UserNode}
            }
          }
        }
      }
    }
  }`
}

type GetPullRequestsByUserProps = {
  orgName: string
  author: string
}
export function getPullRequestsByUserQuery({
  orgName,
  author,
}: GetPullRequestsByUserProps) {
  return `{
    search(
      query: "is:open org:${orgName} type:pr author:${author}"
      first: 100
      type: ISSUE
    ) {
        nodes {
          ... on PullRequest {
            title
            permalink
            number
            createdAt
            state
            id
            isDraft
            reviewDecision
            author {
              ${UserNode}
            }
            repository {
              name
              url
              defaultBranchRef {
                name
              }
            }
            baseRef {
              name
              branchProtectionRule {
                requiredStatusCheckContexts
              }
            }
            comments {
              totalCount
            }
            reviews(first: 100) {
              nodes {
                body
                state
                author {
                  ${UserNode}
                }
                comments {
                  totalCount
                }
              }
            }
            assignees(first: 100) {
              nodes {
                ${UserNode}
              }
            }
            reviewRequests(first: 100) {
              nodes {
                requestedReviewer {
                  ... on Team {
                    avatarUrl
                    name
                  }
                  ... on User {
                    ${UserNode}
                  }
                }
              }
            }
            commits(first: 100) {
              nodes {
                ... on PullRequestCommit {
                  commit {
                    author {
                      user {
                        ${UserNode}
                      }
                    }
                    committer {
                      user {
                        ${UserNode}
                      }
                    }
                  }
                }
              }
            }
            ${LastCommitChecksNode}
            labels(first: 100) {
              nodes {
                id
                color
                name
                description
              }
            }
          }
        }
      }
    }`
}

type GetCommitChecksProps = {
  orgName: string
  repoName: string
  prNumber: number
}
export function getCommitChecksQuery({
  orgName,
  repoName,
  prNumber,
}: GetCommitChecksProps) {
  return `{
    organization(login: "${orgName}"){
      repository(name: "${repoName}") {
        pullRequest(number: ${prNumber}) {
          ${LastCommitChecksNode}
        }
      }
    }
  }`
}
