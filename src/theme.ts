import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    prCard: {
      default: string
      popup: string
      draft: string
      approved: string
      changesRequested: string
    }
  }
  interface PaletteOptions {
    prCard?: {
      default?: string
      popup?: string
      draft?: string
      approved?: string
      changesRequested?: string
    }
  }
}

export function createAppTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      prCard: {
        default:
          mode === 'dark' ? 'rgb(40, 40, 55, 0.6)' : 'rgb(244, 244, 247, 0.6)',
        popup: mode === 'dark' ? 'rgb(40, 40, 55)' : 'rgb(244, 244, 247)',
        draft:
          mode === 'dark'
            ? 'rgb(100, 100, 110, 0.5)'
            : 'rgb(200, 200, 200, 0.6)',
        approved:
          mode === 'dark' ? 'rgb(30, 160, 90, 0.45)' : 'rgb(140, 230, 175)',
        changesRequested:
          mode === 'dark' ? 'rgb(180, 40, 60, 0.45)' : 'rgb(255, 175, 185)',
      },
    },
  })
}
