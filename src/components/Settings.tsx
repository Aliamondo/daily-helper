import Chip, { ChipProps } from '@mui/material/Chip'
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import ListIcon from '@mui/icons-material/ViewList'
import NextIcon from '@mui/icons-material/ChevronRight'
import PreviousIcon from '@mui/icons-material/ChevronLeft'
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import SaveIcon from '@mui/icons-material/Save'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { fetchTeamRepositories } from '../helpers/dataFetcher'
import { settingsHandler } from '../helpers/settingsHandler'

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
  handleReload: (teamName: string) => void
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
        await fetchTeamRepositories(
          orgName,
          teamName,
          pageCursor.page,
          pageCursor.startCursor,
          pageCursor.endCursor,
        ),
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

    getTeamRepositories()
  }, [teamName, orgName, pageCursor, currentTeam])

  const handleRepositoryClick = (nameWithOwner: string) => {
    if (selectedRepositories.has(nameWithOwner)) {
      selectedRepositories.delete(nameWithOwner)
    } else {
      selectedRepositories.add(nameWithOwner)
    }
    setSelectedRepositories(new Set(selectedRepositories))
  }

  const handleUnselectAllRepositories = () => {
    setSelectedRepositories(new Set())
  }

  const handleSelectAllRepositoriesOnPage = () => {
    teamRepositoriesPageable?.teamRepositories.forEach(teamRepository =>
      selectedRepositories.add(teamRepository.nameWithOwner),
    )
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

  const handleSave = () => {
    settingsHandler.partialSaveTeam(
      currentTeam,
      Array.from(selectedRepositories),
    )
    handleReload(currentTeam)
  }

  const handleReset = () => {
    const savedTeam = settingsHandler.loadTeam(currentTeam)
    setSelectedRepositories(new Set(savedTeam?.repositories))
  }

  const selectedSize = selectedRepositories.size

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
        <Typography component="div">
          <FormGroup>
            <Grid container>
              <Grid container item xs={12} justifyContent="space-between">
                <Grid item>
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ fontWeight: 800 }}
                  >
                    <ListIcon sx={{ marginRight: 1 }} />
                    {`${teamName} repositories (${
                      teamRepositoriesPageable?.total
                    } total${
                      selectedSize > 0 &&
                      selectedSize < (teamRepositoriesPageable?.total || 0) &&
                      `, ${selectedSize} selected`
                    })`}
                    {isRepositoriesLoading && (
                      <CircularProgress size={20} sx={{ marginLeft: 1 }} />
                    )}
                  </Stack>
                </Grid>
                <Grid item>
                  <Button
                    size="small"
                    onClick={handleSelectAllRepositoriesOnPage}
                  >
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
              )}
              <Grid container item xs={12} justifyContent="space-around">
                <Grid item>
                  <Button
                    onClick={handlePrevPage}
                    disabled={!teamRepositoriesPageable?.hasPreviousPage}
                    startIcon={<PreviousIcon />}
                  >
                    Prev
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    onClick={handleNextPage}
                    disabled={!teamRepositoriesPageable?.hasNextPage}
                    endIcon={<NextIcon />}
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </FormGroup>
        </Typography>
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
