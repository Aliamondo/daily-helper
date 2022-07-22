type Settings_Team = {
  repositories: string[]
}

type Settings_All = {
  githubToken: string
  orgName: string | null
  teamNames: string[]
  teams: {
    [teamName: string]: Settings_Team
  }
}
