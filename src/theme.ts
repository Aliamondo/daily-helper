import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    prCard: {
      default: string
      popup: string
      draft: string
      approved: string
      changesRequested: string
      autoMerge: string
      autoMergeStripe: string
    }
  }
  interface PaletteOptions {
    prCard?: {
      default?: string
      popup?: string
      draft?: string
      approved?: string
      changesRequested?: string
      autoMerge?: string
      autoMergeStripe?: string
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
        // MUI's secondary is a pale lavender in dark mode, which a 5px line
        // on a dark card barely shows, so these are picked per mode
        autoMerge: mode === 'dark' ? 'rgb(185, 120, 255)' : 'rgb(142, 36, 170)',
        autoMergeStripe:
          mode === 'dark' ? 'rgb(120, 60, 220)' : 'rgb(196, 120, 220)',
      },
    },
  })
}
