type Settings_Team = {
  repositories: string[]
  members?: string[]
}

type Settings_All = {
  githubToken: string
  orgName: string | null
  teamNames: string[]
  teams: {
    [teamName: string]: Settings_Team
  }
  loadPipelineStatus?: boolean
}
