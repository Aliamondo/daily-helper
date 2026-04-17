import {
  ChangeEvent,
  SyntheticEvent,
  useContext,
  useEffect,
  useState,
} from 'react'

import AuthorizationSetting from './AuthorizationSetting'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'
import { ColorModeContext } from '../../ColorModeContext'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import OrganizationSetting from './OrganizationSetting'
import PipelineStatusSetting from './PipelineStatusSetting'
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import SaveIcon from '@mui/icons-material/Save'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import FiltersSetting from './FiltersSetting'
import TeamMembersSetting from './TeamMembersSetting'
import TeamRepositoriesSetting from './TeamRepositoriesSetting'
import Typography from '@mui/material/Typography'
import { equals } from '../../helpers/core'
import { queryCache } from '../../helpers/queryCache'
import { settingsHandler } from '../../helpers/settingsHandler'
import { useTheme } from '@mui/material/styles'

type SettingsProps = {
  isOpen: boolean
  close: VoidFunction
  selectedTeamName: string
  handleReload: (teamName: string, isValidToken: boolean) => void
  isLoading: boolean
}
export default function Settings({
  isOpen,
  close,
  selectedTeamName,
  handleReload,
  isLoading,
}: SettingsProps) {
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)
  const [activeTab, setActiveTab] = useState(0)
  const [mountedTabs, setMountedTabs] = useState(new Set([0]))

  const [githubToken, setGithubToken] = useState(
    settingsHandler.loadGithubToken() || '',
  )
  const [orgName, setOrgName] = useState(settingsHandler.loadOrgName())
  const [teamNames, setTeamNames] = useState(settingsHandler.loadTeamNames())
  const [selectedRepositories, setSelectedRepositories] = useState<Set<string>>(
    new Set(),
  )
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [loadPipelineStatus, setLoadPipelineStatus] = useState(
    settingsHandler.loadPipelineStatus(),
  )
  const [filters, setFilters] = useState<Settings_Filters>(() =>
    settingsHandler.loadFilters(),
  )
  const [saveKey, setSaveKey] = useState(0)
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false)

  useEffect(() => {
    const savedTeam = settingsHandler.loadTeam(selectedTeamName)
    setSelectedRepositories(new Set(savedTeam?.repositories))
    setSelectedMembers(new Set(savedTeam?.members))
  }, [selectedTeamName])

  const handleGithubTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGithubToken(event.target.value)
  }

  const handleOrgNameChange = (_e: SyntheticEvent, newValue: unknown) => {
    setOrgName((newValue as Organization)?.login || null)
  }

  const handleTeamNamesChange = (_e: SyntheticEvent, newValues: unknown[]) => {
    setTeamNames((newValues as Team[]).map(team => team.name))
  }

  const handleSave = () => {
    queryCache.clear()
    settingsHandler.partialSave({
      githubToken,
      orgName: githubToken ? orgName : null,
      teamNames: githubToken && orgName ? teamNames : [],
      teams: {
        [selectedTeamName]: {
          repositories: Array.from(selectedRepositories),
          members: Array.from(selectedMembers),
        },
      },
      loadPipelineStatus,
      filters,
    })

    setSaveKey(k => k + 1)

    if (!githubToken || !orgName) {
      setOrgName(null)
      setTeamNames([])
    }

    handleReload(
      teamNames.includes(selectedTeamName) ? selectedTeamName : teamNames[0],
      Boolean(githubToken) && Boolean(orgName) && teamNames.length > 0,
    )
  }

  const savedTeam = settingsHandler.loadTeam(selectedTeamName)
  const isResetSettingsDisabled =
    equals(savedTeam?.repositories.length, selectedRepositories.size) &&
    equals(savedTeam?.members?.length ?? 0, selectedMembers.size) &&
    settingsHandler.loadGithubToken() === githubToken &&
    settingsHandler.loadOrgName() === orgName &&
    JSON.stringify(settingsHandler.loadTeamNames()) ===
      JSON.stringify(teamNames) &&
    settingsHandler.loadPipelineStatus() === loadPipelineStatus &&
    JSON.stringify(settingsHandler.loadFilters()) === JSON.stringify(filters)

  const hasUnsavedChanges = !isResetSettingsDisabled

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setIsConfirmDiscardOpen(true)
    } else {
      close()
    }
  }

  const handleSaveAndClose = () => {
    handleSave()
    close()
  }

  const handleReset = () => {
    const savedTeam = settingsHandler.loadTeam(selectedTeamName)
    setSelectedRepositories(new Set(savedTeam?.repositories))
    setSelectedMembers(new Set(savedTeam?.members))
    setGithubToken(settingsHandler.loadGithubToken())
    setOrgName(settingsHandler.loadOrgName())
    setTeamNames(settingsHandler.loadTeamNames())
    setLoadPipelineStatus(settingsHandler.loadPipelineStatus())
    setFilters(settingsHandler.loadFilters())
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      scroll="paper"
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: 520 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          Settings
          <IconButton edge="end" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Tabs
          orientation="vertical"
          value={activeTab}
          sx={{
            borderRight: 1,
            borderColor: 'divider',
            minWidth: 140,
            pt: 1,
            '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left' },
          }}
          onChange={(_, v) => {
            setActiveTab(v)
            setMountedTabs(prev => new Set([...prev, v]))
          }}
        >
          <Tab label="General" />
          <Tab label="Members" />
          <Tab label="Repositories" />
          <Tab label="Filters" />
        </Tabs>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {activeTab === 0 && (
            <FormGroup>
              <Grid container rowGap={2}>
                <AuthorizationSetting
                  githubToken={githubToken}
                  handleGithubTokenChange={handleGithubTokenChange}
                />
                <OrganizationSetting
                  orgName={orgName}
                  teamNames={teamNames}
                  handleOrgNameChange={handleOrgNameChange}
                  handleTeamNamesChange={handleTeamNamesChange}
                  githubToken={githubToken}
                />
                <Grid container item xs={12}>
                  <PipelineStatusSetting
                    loadPipelineStatus={loadPipelineStatus}
                    setLoadPipelineStatus={setLoadPipelineStatus}
                  />
                </Grid>
                <Grid container item xs={12}>
                  <FormControlLabel
                    labelPlacement="start"
                    sx={{
                      width: '100%',
                      justifyContent: 'space-between',
                      ml: 0,
                    }}
                    label={
                      <Stack direction="row" alignItems="center">
                        <DarkModeIcon sx={{ mr: 1 }} />
                        <Typography sx={{ fontWeight: 800 }}>
                          Dark mode
                        </Typography>
                      </Stack>
                    }
                    control={
                      <Switch
                        checked={theme.palette.mode === 'dark'}
                        onChange={colorMode.toggleColorMode}
                      />
                    }
                  />
                </Grid>
              </Grid>
            </FormGroup>
          )}
          {mountedTabs.has(1) && (
            <Grid
              container
              sx={{ display: activeTab === 1 ? undefined : 'none' }}
            >
              <TeamMembersSetting
                teamName={selectedTeamName}
                selectedMembers={selectedMembers}
                setSelectedMembers={setSelectedMembers}
                saveKey={saveKey}
              />
            </Grid>
          )}
          {mountedTabs.has(2) && (
            <Grid
              container
              sx={{ display: activeTab === 2 ? undefined : 'none' }}
            >
              <TeamRepositoriesSetting
                teamName={selectedTeamName}
                selectedRepositories={selectedRepositories}
                setSelectedRepositories={setSelectedRepositories}
                saveKey={saveKey}
              />
            </Grid>
          )}
          {mountedTabs.has(3) && (
            <Box sx={{ display: activeTab === 3 ? undefined : 'none' }}>
              <FiltersSetting filters={filters} setFilters={setFilters} />
            </Box>
          )}
        </Box>
      </Box>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Button
          size="large"
          onClick={handleReset}
          startIcon={<RestoreIcon />}
          disabled={isResetSettingsDisabled}
        >
          Reset changes
        </Button>
        <Button
          onClick={handleSave}
          size="large"
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          Save changes
        </Button>
      </DialogActions>

      <Dialog
        open={isConfirmDiscardOpen}
        onClose={() => setIsConfirmDiscardOpen(false)}
      >
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. What would you like to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDiscardOpen(false)}>
            Keep editing
          </Button>
          <Button
            color="error"
            onClick={() => {
              setIsConfirmDiscardOpen(false)
              handleReset()
              close()
            }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <SaveIcon />
            }
            onClick={() => {
              setIsConfirmDiscardOpen(false)
              handleSaveAndClose()
            }}
          >
            Save & close
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}
