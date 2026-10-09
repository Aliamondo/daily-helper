import { useEffect, useState } from 'react'

import Chip, { ChipProps } from '@mui/material/Chip'
import FolderOffIcon from '@mui/icons-material/FolderOff'
import Grid from '@mui/material/Grid'
import ListIcon from '@mui/icons-material/Ballot'
import SelectableList from './SelectableList'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { getRemovedItems, partitionSet } from '../../helpers/core'
import { dataFetcher } from '../../helpers/dataFetcher'
import { queryCache } from '../../helpers/queryCache'
import { settingsHandler } from '../../helpers/settingsHandler'
import { usePagination } from '../../hooks/usePagination'

const PAGE_SIZE = 24

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

type TeamRepositoriesSettingProps = {
  teamName: string
  selectedRepositories: Set<string>
  setSelectedRepositories: (newValue: Set<string>) => void
  saveKey: number
}
export default function TeamRepositoriesSetting({
  teamName,
  selectedRepositories,
  setSelectedRepositories,
  saveKey,
}: TeamRepositoriesSettingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pageable, setPageable] = useState<TeamRepositoryPageable>()
  const { pageCursor, reset, navigate } = usePagination()
  const [currentTeam, setCurrentTeam] = useState('')
  const [teamRepositoryNames, setTeamRepositoryNames] =
    useState<Set<string> | null>(null)

  useEffect(() => {
    setTeamRepositoryNames(null)
    const orgName = settingsHandler.loadOrgName()
    if (!orgName || !teamName || !settingsHandler.loadGithubToken()) return

    const cacheKey = `repos-all:${orgName}:${teamName}`
    const cached = queryCache.get<Set<string>>(cacheKey)
    if (cached) {
      setTeamRepositoryNames(cached)
      return
    }

    let isCurrent = true
    dataFetcher
      .fetchAllTeamRepositoryNames(orgName, teamName)
      .then(names => {
        queryCache.set(cacheKey, names)
        if (isCurrent) setTeamRepositoryNames(names)
      })
      .catch(error => console.error('Loading team repositories failed', error))
    return () => {
      isCurrent = false
    }
  }, [teamName, saveKey])

  useEffect(() => {
    if (currentTeam !== teamName) {
      setCurrentTeam(teamName)
      reset()
      return
    }

    const canFetch =
      Boolean(settingsHandler.loadGithubToken()) &&
      Boolean(settingsHandler.loadOrgName()) &&
      settingsHandler.loadTeamNames().length > 0

    if (!canFetch) {
      setPageable(undefined)
      return
    }

    const orgName = settingsHandler.loadOrgName() || ''
    const cacheKey = `repos:${orgName}:${teamName}:${pageCursor.page}:${pageCursor.startCursor ?? ''}:${pageCursor.endCursor ?? ''}`
    const cached = queryCache.get<TeamRepositoryPageable>(cacheKey)
    if (cached) {
      setPageable(cached)
      return
    }

    const fetch = async () => {
      setIsLoading(true)
      const result = await dataFetcher
        .fetchTeamRepositories(
          orgName,
          teamName,
          pageCursor.page,
          PAGE_SIZE,
          pageCursor.startCursor,
          pageCursor.endCursor,
          pageCursor.total,
        )
        .catch(error => {
          setIsLoading(false)
          throw error
        })
      queryCache.set(cacheKey, result)
      setPageable(result)
      setIsLoading(false)
    }

    void fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamName, pageCursor, currentTeam, saveKey])

  const items =
    pageable?.teamRepositories.map(({ name, nameWithOwner, permission }) => ({
      key: nameWithOwner,
      label: (
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
      ),
    })) ?? []

  // Saved repositories are searched as-is, so one removed from the team keeps
  // showing up on the board until unchecked
  const formerRepositories = getRemovedItems(
    settingsHandler.loadTeam(teamName)?.repositories ?? [],
    teamRepositoryNames,
  )
  const formerNames = new Set(formerRepositories)

  // Each list only sees and changes its own repositories, like members
  const [selectedFormer, selectedCurrent] = partitionSet(
    selectedRepositories,
    name => formerNames.has(name),
  )
  const setSelectedCurrent = (next: Set<string>) =>
    setSelectedRepositories(new Set([...next, ...selectedFormer]))
  const setSelectedFormer = (next: Set<string>) =>
    setSelectedRepositories(new Set([...selectedCurrent, ...next]))

  return (
    <>
      <SelectableList
        icon={<ListIcon sx={{ marginRight: 1 }} />}
        title={teamName ? `Repositories of ${teamName}` : 'Repositories'}
        isLoading={isLoading}
        items={items}
        selectedKeys={selectedCurrent}
        setSelectedKeys={setSelectedCurrent}
        columnMinWidth={300}
        pageable={pageable}
        pageSize={PAGE_SIZE}
        onNavigate={navigate}
      />
      {formerRepositories.length > 0 && (
        <>
          <Grid item xs={12} sx={{ mt: 3 }} />
          <SelectableList
            icon={
              <Tooltip
                title="No longer in the team on GitHub, but its pull requests still load. Uncheck and save to remove it from this list."
                placement="top"
              >
                <FolderOffIcon color="error" sx={{ marginRight: 1 }} />
              </Tooltip>
            }
            title={`Previous repositories of ${teamName}`}
            isLoading={false}
            items={formerRepositories.map(name => ({ key: name, label: name }))}
            selectedKeys={selectedFormer}
            setSelectedKeys={setSelectedFormer}
            columnMinWidth={300}
          />
        </>
      )}
    </>
  )
}
