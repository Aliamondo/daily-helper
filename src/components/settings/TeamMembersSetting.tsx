import { KeyboardEvent, useEffect, useRef, useState } from 'react'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/DriveFileRenameOutline'
import GroupIcon from '@mui/icons-material/Group'
import InputBase from '@mui/material/InputBase'
import SelectableList from './SelectableList'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { dataFetcher } from '../../helpers/dataFetcher'
import { queryCache } from '../../helpers/queryCache'
import { settingsHandler } from '../../helpers/settingsHandler'
import { usePagination } from './usePagination'

const PAGE_SIZE = 24

type AliasEditorProps = {
  login: string
  originalName: string | null
  alias: string | undefined
  onSave: (login: string, alias: string | null) => void
}
function AliasEditor({ login, originalName, alias, onSave }: AliasEditorProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(alias ?? '')
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasAlias = Boolean(alias)
  const displayName = alias ?? originalName ?? login

  const commit = () => {
    const trimmed = value.trim()
    onSave(login, trimmed || null)
    setEditing(false)
  }

  const cancel = () => {
    setValue(alias ?? '')
    setEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') cancel()
    e.stopPropagation()
  }

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        value={value}
        autoFocus
        size="small"
        placeholder={originalName ?? login}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
        }}
        sx={{
          fontSize: 'inherit',
          width: 160,
          borderBottom: '1px solid',
          borderColor: 'primary.main',
        }}
      />
    )
  }

  return (
    <Box
      component="span"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        setValue(alias ?? '')
        setEditing(true)
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        cursor: 'text',
      }}
    >
      <Typography
        component="span"
        color={hasAlias ? 'primary' : 'text.primary'}
        sx={{ fontStyle: hasAlias ? 'italic' : 'normal' }}
      >
        {displayName}
      </Typography>
      <Tooltip
        title={
          hasAlias
            ? `Custom alias — original: ${originalName ?? login}`
            : 'Set alias'
        }
        placement="right"
      >
        <EditIcon
          fontSize="inherit"
          color={hasAlias ? 'primary' : 'disabled'}
          sx={{
            opacity: hasAlias || hovered ? 1 : 0,
            transition: 'opacity 0.15s',
            fontSize: '0.9rem',
          }}
        />
      </Tooltip>
    </Box>
  )
}

type TeamMembersSettingProps = {
  teamName: string
  selectedMembers: Set<string>
  setSelectedMembers: (newValue: Set<string>) => void
  saveKey: number
}
export default function TeamMembersSetting({
  teamName,
  selectedMembers,
  setSelectedMembers,
  saveKey,
}: TeamMembersSettingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pageable, setPageable] = useState<TeamMemberPageable>()
  const [aliases, setAliases] = useState<Record<string, string>>(() =>
    settingsHandler.loadAliases(),
  )
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
      settingsHandler.loadTeamNames().length > 0 &&
      Boolean(teamName)

    if (!canFetch) {
      setPageable(undefined)
      return
    }

    const orgName = settingsHandler.loadOrgName() || ''
    const cacheKey = `members:${orgName}:${teamName}:${pageCursor.page}:${pageCursor.startCursor ?? ''}:${pageCursor.endCursor ?? ''}`
    const cached = queryCache.get<TeamMemberPageable>(cacheKey)
    if (cached) {
      setPageable(cached)
      return
    }

    const fetch = async () => {
      setIsLoading(true)
      const result = await dataFetcher
        .fetchTeamUsersPageable(
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

  const handleSaveAlias = (login: string, alias: string | null) => {
    settingsHandler.saveAlias(login, alias)
    setAliases(settingsHandler.loadAliases())
  }

  const items =
    pageable?.members
      .slice()
      .sort((a, b) => {
        const nameA = aliases[a.login] ?? a.name ?? a.login
        const nameB = aliases[b.login] ?? b.name ?? b.login
        return nameA.localeCompare(nameB)
      })
      .map(({ login, name, avatarUrl }) => ({
        key: login,
        label: (
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar src={avatarUrl} sx={{ width: 24, height: 24 }} />
            <AliasEditor
              login={login}
              originalName={name}
              alias={aliases[login]}
              onSave={handleSaveAlias}
            />
          </Stack>
        ),
      })) ?? []

  return (
    <SelectableList
      icon={<GroupIcon sx={{ marginRight: 1 }} />}
      title={teamName ? `Members of ${teamName}` : 'Members'}
      isLoading={isLoading}
      items={items}
      selectedKeys={selectedMembers}
      setSelectedKeys={setSelectedMembers}
      pageable={pageable}
      pageSize={PAGE_SIZE}
      onNavigate={navigate}
    />
  )
}
