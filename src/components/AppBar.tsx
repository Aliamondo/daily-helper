import './AppBar.css'

import {
  KeyboardEvent,
  ReactElement,
  SyntheticEvent,
  useRef,
  useState,
} from 'react'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import MenuIcon from '@mui/icons-material/Menu'
import ReloadIcon from '@mui/icons-material/Replay'
import Settings from './Settings'
import SettingsIcon from '@mui/icons-material/Settings'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import packageData from '../../package.json'
import { settingsHandler } from '../helpers/settingsHandler'

type AppBarElementProps = {
  handleReload: (teamName: string, isValidToken: boolean) => void
  loadingProgress: number
  isLoadingAnimationPlaying: boolean
  showDrawbar?: (marginTop?: number) => ReactElement | null
  drawbarName: string
  isDrawbarOpen: boolean
  setIsDrawbarOpen: (newState: boolean) => void
}
export default function AppBarElement({
  handleReload: initialHandleReload,
  loadingProgress,
  isLoadingAnimationPlaying,
  showDrawbar,
  drawbarName,
  isDrawbarOpen,
  setIsDrawbarOpen,
}: AppBarElementProps) {
  const [teamTabValue, setTeamTabValue] = useState(0)
  const [teamNames, setTeamNames] = useState(settingsHandler.loadTeamNames())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const DrawbarButtonRef = useRef(null)
  const toolbarRef = useRef<HTMLHeadingElement>(null)

  const handleReload = (teamName: string, isValidToken: boolean) => {
    setTeamNames(settingsHandler.loadTeamNames())
    initialHandleReload(teamName, isValidToken)
  }

  const handlePullRequestsReload = (
    _e: SyntheticEvent | null,
    newTeamTabValue: number = teamTabValue,
  ) => {
    initialHandleReload(
      teamNames[newTeamTabValue],
      Boolean(settingsHandler.loadGithubToken()) &&
        Boolean(settingsHandler.loadOrgName()),
    )
  }

  const handleTabChange = (_e: SyntheticEvent, newValue: number) => {
    setTeamTabValue(newValue)
    handlePullRequestsReload(null, newValue)
  }

  const handleToggleDrawbar = () => {
    setIsDrawbarOpen(!isDrawbarOpen)
  }

  const handleHideDrawbar = () => {
    setIsDrawbarOpen(false)
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
          onKeyUp={({ code }: KeyboardEvent) => {
            code === 'Escape' && handleHideDrawbar()
          }}
        >
          <Typography variant="h6" whiteSpace="nowrap" paddingRight={1}>
            Daily Helper
          </Typography>
          <Typography variant="caption" paddingRight={1}>
            v{packageData.version}
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
          {showDrawbar && (
            <ClickAwayListener onClickAway={handleHideDrawbar}>
              <Box>
                <Tooltip title={drawbarName}>
                  <IconButton
                    ref={DrawbarButtonRef}
                    size="large"
                    color="inherit"
                    onClick={handleToggleDrawbar}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
                {showDrawbar(toolbarRef.current?.offsetHeight)}
              </Box>
            </ClickAwayListener>
          )}

          <Tooltip title="Settings">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleToggleSettings}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Settings
            isOpen={isSettingsOpen}
            close={handleHideSettings}
            selectedTeamName={teamNames[teamTabValue]}
            handleReload={handleReload}
            isLoading={isLoadingAnimationPlaying}
          />

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
