import { beforeEach, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'
import { settingsHandler } from './helpers/settingsHandler'

// Stub the lazy view with a probe that exposes the current theme mode and the toggle
vi.mock('./views/DailyHelper/DailyHelper', async () => {
  const { useContext } = await import('react')
  const { useTheme } = await import('@mui/material/styles')
  const { ColorModeContext } = await import('./ColorModeContext')

  return {
    default: function DailyHelperStub() {
      const { toggleColorMode } = useContext(ColorModeContext)
      const theme = useTheme()
      return (
        <div data-testid="daily-helper">
          <span data-testid="mode">{theme.palette.mode}</span>
          <button onClick={toggleColorMode}>toggle</button>
        </div>
      )
    },
  }
})

vi.mock('./helpers/settingsHandler', () => ({
  settingsHandler: {
    loadColorMode: vi.fn(),
    saveColorMode: vi.fn(),
  },
}))

function setPrefersDark(dark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: dark && query.includes('dark'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(settingsHandler.loadColorMode).mockReturnValue(null as never) // no saved choice
  setPrefersDark(false)
})

test('renders the lazy-loaded DailyHelper view', async () => {
  render(<App />)
  expect(await screen.findByTestId('daily-helper')).toBeInTheDocument()
})

test('follows a light OS preference when nothing is saved', async () => {
  render(<App />)
  expect(await screen.findByTestId('mode')).toHaveTextContent('light')
})

test('follows a dark OS preference when nothing is saved', async () => {
  setPrefersDark(true)
  render(<App />)
  expect(await screen.findByTestId('mode')).toHaveTextContent('dark')
})

test('a saved choice wins over the OS preference', async () => {
  vi.mocked(settingsHandler.loadColorMode).mockReturnValue('light')
  setPrefersDark(true)
  render(<App />)
  expect(await screen.findByTestId('mode')).toHaveTextContent('light')
})

test('toggling switches the mode and saves the choice', async () => {
  render(<App />)
  expect(await screen.findByTestId('mode')).toHaveTextContent('light')

  userEvent.click(screen.getByRole('button', { name: /toggle/i }))

  expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  expect(settingsHandler.saveColorMode).toHaveBeenCalledWith('dark')
})
