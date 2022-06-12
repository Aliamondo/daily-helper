const UserNode = `login avatarUrl`

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
            author {
              ${UserNode}
            }
            repository {
              name
              url
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
            lastCommit: commits(last: 1) {
              nodes {
                commit {
                  checkSuites(first: 10) {
                    nodes {
                      checkRuns(first: 100) {
                        nodes {
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
                    state
                    contexts {
                      context
                      description
                      state
                      creator {
                        login
                      }
                      avatarUrl
                      targetUrl
                    }
                  }
                }
              }
            }
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
