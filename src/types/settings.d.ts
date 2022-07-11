type Settings_Team = {
  repositories: string[]
}

type Settings_All = {
  githubToken: string
  teams: {
    [teamName: string]: Settings_Team
  }
}
