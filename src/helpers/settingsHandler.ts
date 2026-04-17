import { dataFetcher } from './dataFetcher'

const SETTINGS_KEY = 'settings'

const settingsHandler = {
  saveAll(settings: Settings_All) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },

  partialSave(partialSettings: Partial<Settings_All>) {
    const settings = this.load()

    if (!!partialSettings.teams) {
      partialSettings.teams = { ...settings.teams, ...partialSettings.teams }
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

  loadPipelineStatus(): boolean {
    return this.load().loadPipelineStatus ?? false
  },

  loadAliases(): Record<string, string> {
    return this.load().aliases ?? {}
  },

  loadFilters(): Settings_Filters {
    return (
      this.load().filters ?? {
        botPatterns: ['[bot]'],
        botLogins: ['dependabot', 'copilot-pull-request-reviewer'],
        titleWhitelist: ['security', 'critical', 'urgent'],
      }
    )
  },

  saveAlias(login: string, alias: string | null): void {
    const settings = this.load()
    const aliases = { ...(settings.aliases ?? {}) }
    if (alias) {
      aliases[login] = alias
    } else {
      delete aliases[login]
    }
    this.saveAll({ ...settings, aliases })
  },
}

Object.freeze(settingsHandler)
export { settingsHandler }
