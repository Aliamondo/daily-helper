type Settings_Team = {
  repositories: string[]
}

type Settings_All = {
  teams: {
    [teamName: string]: Settings_Team
  }
}
