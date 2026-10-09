import { getRemovedItems } from './core'

/**
 * Saved members who are no longer in the team. Nobody is flagged until the
 * whole team has loaded (teamLogins is null until then)
 */
export function getFormerMembers(
  savedLogins: string[],
  teamLogins: Set<string> | null,
): User[] {
  return getRemovedItems(savedLogins, teamLogins).map(login => ({
    login,
    name: null,
    avatarUrl: `https://github.com/${login}.png?size=48`,
  }))
}
