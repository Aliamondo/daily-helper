import { lazy, Suspense, useMemo, useState } from 'react'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ColorModeContext } from './ColorModeContext'
import { createAppTheme } from './theme'
import { settingsHandler } from './helpers/settingsHandler'

const DailyHelper = lazy(() => import('./views/DailyHelper/DailyHelper'))

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    () =>
      // an explicit choice wins, otherwise follow the OS preference
      settingsHandler.loadColorMode() ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'),
  )

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode(prev => {
          const next = prev === 'light' ? 'dark' : 'light'
          settingsHandler.saveColorMode(next)
          return next
        }),
    }),
    [],
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={null}>
          <DailyHelper />
        </Suspense>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
