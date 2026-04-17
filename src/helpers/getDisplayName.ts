import { settingsHandler } from './settingsHandler'

export function getDisplayName(user: {
  login: string
  name?: string | null
}): string {
  const aliases = settingsHandler.loadAliases()
  return aliases[user.login] ?? user.name ?? user.login
}
