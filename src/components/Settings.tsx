import { ChangeEventHandler, useEffect, useState } from 'react'
import Chip, { ChipProps } from '@mui/material/Chip'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import KeyIcon from '@mui/icons-material/Key'
import LastPageIcon from '@mui/icons-material/LastPage'
import Link from '@mui/material/Link'
import ListIcon from '@mui/icons-material/Ballot'
import NextIcon from '@mui/icons-material/ChevronRight'
import PreviousIcon from '@mui/icons-material/ChevronLeft'
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import SaveIcon from '@mui/icons-material/Save'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { dataFetcher } from '../helpers/dataFetcher'
import { settingsHandler } from '../helpers/settingsHandler'

const PAGE_SIZE = 24

type PageCursor = {
  startCursor?: string
  endCursor?: string
  page: PageNavigation
}

const initialPageCursor: PageCursor = {
  page: 'NEXT_PAGE',
}

function getPermissionColor(
  permission: TeamRepository['permission'],
): ChipProps['color'] {
  switch (permission) {
    case 'ADMIN':
      return 'error'
    case 'MAINTAIN':
      return 'warning'
    case 'WRITE':
      return 'info'
    case 'READ':
      return 'success'
    case 'TRIAGE':
      return 'secondary'
    default:
      return 'default'
  }
}

type SettingsProps = {
  isOpen: boolean
  close: VoidFunction
  orgName: string
  teamName: string
  handleReload: (teamName: string, isValidToken: boolean) => void
  isLoading: boolean
}
export default function Settings({
  isOpen,
  close,
  teamName,
  orgName,
  handleReload,
  isLoading,
}: SettingsProps) {
  const [githubToken, setGithubToken] = useState(
    settingsHandler.loadGithubToken() || '',
  )
  const [isRepositoriesLoading, setIsRepositoriesLoading] = useState(false)
  const [teamRepositoriesPageable, setTeamRepositoriesPageable] =
    useState<TeamRepositoryPageable>()
  const [pageCursor, setPageCursor] = useState<PageCursor>(initialPageCursor)
  const [currentTeam, setCurrentTeam] = useState('')
  const [selectedRepositories, setSelectedRepositories] = useState<Set<string>>(
    new Set(),
  )

  useEffect(() => {
    const getTeamRepositories = async () => {
      setIsRepositoriesLoading(true)
      setTeamRepositoriesPageable(
        await dataFetcher
          .fetchTeamRepositories(
            orgName,
            teamName,
            pageCursor.page,
            PAGE_SIZE,
            pageCursor.startCursor,
            pageCursor.endCursor,
            teamRepositoriesPageable?.total,
          )
          .catch(error => {
            setIsRepositoriesLoading(false)
            throw error
          }),
      )
      setIsRepositoriesLoading(false)
    }

    if (currentTeam !== teamName) {
      setCurrentTeam(teamName)
      setPageCursor(initialPageCursor)

      const savedTeam = settingsHandler.loadTeam(teamName)
      if (savedTeam) {
        setSelectedRepositories(new Set(savedTeam.repositories))
      } else {
        setSelectedRepositories(new Set())
      }
    }

    Boolean(settingsHandler.loadGithubToken()) && getTeamRepositories()
  }, [teamName, orgName, pageCursor, currentTeam, teamRepositoriesPageable?.total])

  const handleGithubTokenChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setGithubToken(event.target.value)
  }

  const handleSave = () => {
    settingsHandler.partialSave({
      githubToken,
      teams: {
        [currentTeam]: { repositories: Array.from(selectedRepositories) },
      },
    })

    if (!teamRepositoriesPageable) {
      setPageCursor({
        page: pageCursor.page === 'NEXT_PAGE' ? 'PREVIOUS_PAGE' : 'NEXT_PAGE',
        endCursor: '',
        startCursor: '',
      })
    }

    // reset the view on github token removal
    if (!githubToken) {
      setTeamRepositoriesPageable(undefined)
    }

    handleReload(currentTeam, Boolean(githubToken))
  }

  const handleReset = () => {
    const savedTeam = settingsHandler.loadTeam(currentTeam)
    setSelectedRepositories(new Set(savedTeam?.repositories))
  }

  return (
    <Dialog open={isOpen} onClose={close} scroll="paper" maxWidth="lg">
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          Settings
          <IconButton edge="end" onClick={close}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          <Grid container>
            <AuthorizationSetting
              githubToken={githubToken}
              handleGithubTokenChange={handleGithubTokenChange}
            />
            <TeamRepositoriesSetting
              teamName={teamName}
              isRepositoriesLoading={isRepositoriesLoading}
              setPageCursor={setPageCursor}
              selectedRepositories={selectedRepositories}
              setSelectedRepositories={setSelectedRepositories}
              teamRepositoriesPageable={teamRepositoriesPageable}
            />
          </Grid>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button
          size="large"
          onClick={handleReset}
          startIcon={<RestoreIcon />}
          disabled={
            settingsHandler.loadTeam(currentTeam)?.repositories.length ===
            selectedRepositories.size
          }
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
    </Dialog>
  )
}

type AuthorizationSettingProps = {
  githubToken: string
  handleGithubTokenChange: ChangeEventHandler<HTMLInputElement>
}
function AuthorizationSetting({
  githubToken,
  handleGithubTokenChange,
}: AuthorizationSettingProps) {
  return (
    <Grid
      container
      item
      xs={12}
      justifyContent="space-between"
      rowGap={2}
      sx={{ marginBottom: 2 }}
    >
      <Grid item xs={12}>
        <Typography component="div">
          <Stack direction="row" alignItems="center" sx={{ fontWeight: 800 }}>
            <KeyIcon sx={{ marginRight: 1 }} />
            Authorization (
            <Link
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener"
            >
              link
            </Link>
            )
          </Stack>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="github-token"
          label="Github token"
          fullWidth
          value={githubToken}
          onChange={handleGithubTokenChange}
        />
      </Grid>
    </Grid>
  )
}

type TeamRepositoriesSettingProps = {
  teamName: string
  teamRepositoriesPageable?: TeamRepositoryPageable
  selectedRepositories: Set<string>
  setSelectedRepositories: (newValue: Set<string>) => void
  setPageCursor: (newValue: PageCursor) => void
  isRepositoriesLoading: boolean
}
function TeamRepositoriesSetting({
  teamName,
  teamRepositoriesPageable,
  selectedRepositories,
  setSelectedRepositories,
  isRepositoriesLoading,
  setPageCursor,
}: TeamRepositoriesSettingProps) {
  const handleUnselectAllRepositories = () => {
    setSelectedRepositories(new Set())
  }

  const handleSelectAllRepositoriesOnPage = () => {
    teamRepositoriesPageable?.teamRepositories.forEach(teamRepository =>
      selectedRepositories.add(teamRepository.nameWithOwner),
    )
    setSelectedRepositories(new Set(selectedRepositories))
  }

  const handleRepositoryClick = (nameWithOwner: string) => {
    if (selectedRepositories.has(nameWithOwner)) {
      selectedRepositories.delete(nameWithOwner)
    } else {
      selectedRepositories.add(nameWithOwner)
    }
    setSelectedRepositories(new Set(selectedRepositories))
  }

  const handlePageChange = (page: PageNavigation) => {
    setPageCursor({
      startCursor: teamRepositoriesPageable?.startCursor,
      endCursor: teamRepositoriesPageable?.endCursor,
      page,
    })
  }

  const handleNextPage = () => {
    handlePageChange('NEXT_PAGE')
  }

  const handlePrevPage = () => {
    handlePageChange('PREVIOUS_PAGE')
  }

  const handleFirstPage = () => {
    handlePageChange('FIRST_PAGE')
  }

  const handleLastPage = () => {
    handlePageChange('LAST_PAGE')
  }

  const selectedSize = selectedRepositories.size

  return (
    <>
      <Grid container item xs={12} justifyContent="space-between">
        <Grid item>
          <Typography component="div">
            <Stack direction="row" alignItems="center" sx={{ fontWeight: 800 }}>
              <ListIcon sx={{ marginRight: 1 }} />
              {`Repositories of ${teamName} (${
                teamRepositoriesPageable?.total || 0
              } total${`, ${
                selectedSize > 0 &&
                selectedSize < (teamRepositoriesPageable?.total || 0)
                  ? selectedSize
                  : 'none'
              } selected`})`}
              {isRepositoriesLoading && (
                <CircularProgress size={20} sx={{ marginLeft: 1 }} />
              )}
            </Stack>
          </Typography>
        </Grid>
        {teamRepositoriesPageable && (
          <Grid item>
            <Button size="small" onClick={handleSelectAllRepositoriesOnPage}>
              Select all
            </Button>
            <Button
              size="small"
              onClick={handleUnselectAllRepositories}
              disabled={!selectedRepositories.size}
            >
              Unselect all
            </Button>
          </Grid>
        )}
      </Grid>
      {teamRepositoriesPageable?.teamRepositories.map(
        ({ name, nameWithOwner, permission }) => (
          <Grid item key={nameWithOwner} lg={4} sm={6} xs={12}>
            <FormControlLabel
              label={
                <>
                  <Stack direction="row" alignItems="center">
                    {name}
                    <Chip
                      color={getPermissionColor(permission)}
                      label={permission}
                      size="small"
                      variant="outlined"
                      sx={{ marginLeft: 1 }}
                    />
                  </Stack>
                </>
              }
              control={
                <Checkbox
                  checked={selectedRepositories.has(nameWithOwner)}
                  onClick={() => handleRepositoryClick(nameWithOwner)}
                />
              }
            />
          </Grid>
        ),
      ) || (
        <Grid item marginTop={2}>
          <Typography color="GrayText">No data available</Typography>
        </Grid>
      )}
      {teamRepositoriesPageable && teamRepositoriesPageable.total > PAGE_SIZE && (
        <Grid container item xs={12} justifyContent="space-around">
          <Grid container item xs={6} columnGap={2} justifyContent="center">
            <Grid item xs={3}>
              <Button
                onClick={handleFirstPage}
                disabled={!teamRepositoriesPageable?.hasPreviousPage}
                startIcon={<FirstPageIcon />}
              >
                First
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                onClick={handlePrevPage}
                disabled={!teamRepositoriesPageable?.hasPreviousPage}
                startIcon={<PreviousIcon />}
              >
                Prev
              </Button>
            </Grid>
          </Grid>
          <Grid container item xs={6} columnGap={2} justifyContent="center">
            <Grid item xs={3}>
              <Button
                onClick={handleNextPage}
                disabled={!teamRepositoriesPageable?.hasNextPage}
                endIcon={<NextIcon />}
              >
                Next
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                onClick={handleLastPage}
                disabled={!teamRepositoriesPageable?.hasNextPage}
                endIcon={<LastPageIcon />}
              >
                Last
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  )
}
