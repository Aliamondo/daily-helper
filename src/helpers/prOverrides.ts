const PR_OVERRIDES_KEY = 'prOverrides'

/** Each value is also the star the card shows */
export type PriorityStar = 'high' | 'medium' | 'normal' | 'low'

/** Keyed by the PR's GitHub node id. A missing PR follows the automatic rules */
export type PrOverrides = Record<string, PriorityStar>

export function loadPrOverrides(): PrOverrides {
  try {
    return JSON.parse(localStorage.getItem(PR_OVERRIDES_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function savePrOverrides(overrides: PrOverrides): void {
  localStorage.setItem(PR_OVERRIDES_KEY, JSON.stringify(overrides))
}

/** 'auto' drops the override, so the Highest Priority rules decide again */
export function setPriorityOverride(
  overrides: PrOverrides,
  prId: string,
  priority: PriorityStar | 'auto',
): PrOverrides {
  const { [prId]: _, ...rest } = overrides
  return priority === 'auto' ? rest : { ...rest, [prId]: priority }
}

/** The override only changes which filter shows a PR: it never affects the order */
export function getPriorityStar(
  prId: string,
  automaticIds: Set<string>,
  overrides: PrOverrides,
): PriorityStar {
  return overrides[prId] ?? (automaticIds.has(prId) ? 'high' : 'normal')
}
