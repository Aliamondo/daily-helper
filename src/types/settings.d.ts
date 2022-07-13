type Settings_Team = {
  repositories: string[]
}

type Settings_All = {
  githubToken: string
  orgName: string | null
  teams: {
    [teamName: string]: Settings_Team
  }
}
