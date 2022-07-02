import './AppBar.css'

import { ReactElement, SyntheticEvent, useRef, useState } from 'react'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import MenuIcon from '@mui/icons-material/Menu'
import ReloadIcon from '@mui/icons-material/Replay'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

type AppBarElementProps = {
  teamNames: string[]
  handleReload: (teamName: string) => void
  loadingProgress: number
  isLoadingAnimationPlaying: boolean
  showSettings?: (marginTop?: number) => ReactElement | null
  isSettingsOpen: boolean
  setIsSettingsOpen: (newState: boolean) => void
}
export default function AppBarElement({
  teamNames,
  handleReload,
  loadingProgress,
  isLoadingAnimationPlaying,
  showSettings,
  isSettingsOpen,
  setIsSettingsOpen,
}: AppBarElementProps) {
  const [teamTabValue, setTeamTabValue] = useState(0)
  const settingsButtonRef = useRef(null)
  const toolbarRef = useRef<HTMLHeadingElement>(null)

  const handlePullRequestsReload = (
    _e: SyntheticEvent | null,
    newTeamTabValue: number = teamTabValue,
  ) => {
    handleReload(teamNames[newTeamTabValue])
  }

  const handleTabChange = (_e: SyntheticEvent, newValue: number) => {
    setTeamTabValue(newValue)
    handlePullRequestsReload(null, newValue)
  }

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  const handleHideSettings = () => {
    setIsSettingsOpen(false)
  }

  return (
    <>
      <AppBar>
        <Toolbar
          ref={toolbarRef}
          sx={{ paddingBottom: isLoadingAnimationPlaying ? 0 : 0.5 }}
        >
          <Typography variant="h6" whiteSpace="nowrap" paddingRight={2}>
            Daily Helper
          </Typography>
          <Tabs
            variant="scrollable"
            value={teamTabValue}
            onChange={handleTabChange}
            textColor="inherit"
          >
            {teamNames.map((teamName, index) => (
              <Tab key={teamName} value={index} label={teamName} />
            ))}
          </Tabs>
          <Box sx={{ flexGrow: 1 }} />
          {showSettings && (
            <ClickAwayListener onClickAway={handleHideSettings}>
              <Box>
                <Tooltip title="Settings">
                  <IconButton
                    ref={settingsButtonRef}
                    size="large"
                    color="inherit"
                    onClick={handleToggleSettings}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
                {showSettings(toolbarRef.current?.offsetHeight)}
              </Box>
            </ClickAwayListener>
          )}
          <Tooltip title="Refresh pull requests">
            <IconButton
              edge="end"
              size="large"
              color="inherit"
              onClick={handlePullRequestsReload}
            >
              <ReloadIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        {isLoadingAnimationPlaying && (
          <LinearProgress variant="determinate" value={loadingProgress} />
        )}
      </AppBar>
      <Toolbar sx={{ paddingBottom: 2 }} />
    </>
  )
}
