import { dataFetcher } from './dataFetcher'

const SETTINGS_KEY = 'settings'

const settingsHandler = {
  saveAll(settings: Settings_All) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },

  partialSaveTeam(teamName: string, teamRepositories: string[]) {
    const settings = this.load()
    const teams = settings.teams
    teams[teamName] = { repositories: teamRepositories }
    this.saveAll({ ...settings, teams })
  },

  partialSave(partialSettings: Partial<Settings_All>) {
    const settings = this.load()

    if (!!partialSettings.teams) {
      const teams = { ...settings.teams, ...partialSettings.teams }
      partialSettings.teams = teams
    }

    if (partialSettings.githubToken !== settings.githubToken) {
      dataFetcher.setToken(partialSettings.githubToken || '')
    }

    this.saveAll({ ...settings, ...partialSettings })
  },

  load(): Settings_All {
    const rawSettings = localStorage.getItem(SETTINGS_KEY)
    return this.parse(rawSettings)
  },

  parse(rawSettings: string | null): Settings_All {
    if (!rawSettings)
      return { githubToken: '', orgName: null, teamNames: [], teams: {} }
    return JSON.parse(rawSettings)
  },

  loadGithubToken(): string {
    return this.load().githubToken
  },

  loadOrgName(): string | null {
    return this.load().orgName || null
  },

  loadTeamNames(): string[] {
    return this.load().teamNames || []
  },

  loadTeam(teamName: string): Settings_Team | undefined {
    const settings = this.load()
    return settings.teams[teamName]
  },
}

Object.freeze(settingsHandler)
export { settingsHandler }
