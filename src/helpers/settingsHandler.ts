const SETTINGS_KEY = 'settings'

const settingsHandler = {
  saveAll(settings: Settings_All) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },
  partialSaveTeam(teamName: string, teamRepositories: string[]) {
    const teams: Settings_All['teams'] = this.load().teams
    teams[teamName] = { repositories: teamRepositories }
    this.saveAll({ teams })
  },
  load(): Settings_All {
    const rawSettings = localStorage.getItem(SETTINGS_KEY)
    return this.parse(rawSettings)
  },
  parse(rawSettings: string | null): Settings_All {
    if (!rawSettings) return { teams: {} }
    return JSON.parse(rawSettings)
  },
  loadTeam(teamName: string): Settings_Team | undefined {
    const settings = this.load()
    return settings.teams[teamName]
  },
}

Object.freeze(settingsHandler)
export { settingsHandler }
