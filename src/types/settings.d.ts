namespace Settings {
  type Team = {
    repositories: string[]
  }

  type All = {
    teams: {
      [teamName: string]: Team
    }
  }
}
