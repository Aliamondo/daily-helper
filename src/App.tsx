import { useMemo, useState } from 'react'

import CssBaseline from '@mui/material/CssBaseline'
import DailyHelper from './views/DailyHelper/DalyHelper'
import { ThemeProvider } from '@mui/material/styles'
import { ColorModeContext } from './ColorModeContext'
import { createAppTheme } from './theme'

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  )

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode(prev => (prev === 'light' ? 'dark' : 'light')),
    }),
    [],
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <DailyHelper />
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
