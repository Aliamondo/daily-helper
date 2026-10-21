import { createContext } from 'react'
import type { PriorityStar, PrOverrides } from './helpers/prOverrides'

export const PrOverridesContext = createContext<{
  overrides: PrOverrides
  // PRs the Highest Priority rules pick, before any override
  automaticIds: Set<string>
  setPriority: (prId: string, priority: PriorityStar | 'auto') => void
}>({
  overrides: {},
  automaticIds: new Set(),
  setPriority: () => {},
})
