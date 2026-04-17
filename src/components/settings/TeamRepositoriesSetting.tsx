import { useEffect, useState } from 'react'

import Chip, { ChipProps } from '@mui/material/Chip'
import ListIcon from '@mui/icons-material/Ballot'
import SelectableList from './SelectableList'
import Stack from '@mui/material/Stack'
import { dataFetcher } from '../../helpers/dataFetcher'
import { queryCache } from '../../helpers/queryCache'
import { settingsHandler } from '../../helpers/settingsHandler'
import { usePagination } from './usePagination'

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

  return (
    <SelectableList
      icon={<ListIcon sx={{ marginRight: 1 }} />}
      title={teamName ? `Repositories of ${teamName}` : 'Repositories'}
      isLoading={isLoading}
      items={items}
      selectedKeys={selectedRepositories}
      setSelectedKeys={setSelectedRepositories}
      columnMinWidth={300}
      pageable={pageable}
      pageSize={PAGE_SIZE}
      onNavigate={navigate}
    />
  )
}
