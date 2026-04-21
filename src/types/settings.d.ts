type Settings_Team = {
  repositories: string[]
  members?: string[]
}

type Settings_Filters = {
  botPatterns: string[]
  botLogins: string[]
  titleWhitelist: string[]
}

type Settings_All = {
  githubToken: string
  orgName: string | null
  teamNames: string[]
  teams: {
    [teamName: string]: Settings_Team
  }
  loadPipelineStatus?: boolean
  aliases?: Record<string, string>
  filters?: Settings_Filters
  view?: 'list' | 'kanban'
  sort?: {
    field: import('../components/SortControl').SortField
    dirs: Record<
      import('../components/SortControl').SortField,
      import('../components/SortControl').SortDir
    >
  }
}
