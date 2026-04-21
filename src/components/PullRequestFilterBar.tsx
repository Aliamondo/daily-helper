import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import Stack from '@mui/material/Stack'
import StarRate from '@mui/icons-material/StarRate'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import ViewListIcon from '@mui/icons-material/ViewList'
import { SvgIconComponent } from '@mui/icons-material'

type FilterButtonProps = {
  label: string
  icon: SvgIconComponent
  active: boolean
  color?: string
  onClick: VoidFunction
}
function FilterButton({
  label,
  icon: Icon,
  active,
  color = 'primary.main',
  onClick,
}: FilterButtonProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        color: active ? color : 'text.secondary',
        '&:hover': {
          color: active ? color : 'text.primary',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
      <Typography variant="body2" fontWeight={active ? 600 : 400}>
        {label}
      </Typography>
    </Stack>
  )
}

type ViewToggleProps = {
  activeView: 'list' | 'kanban'
  onViewToggle: (view: 'list' | 'kanban') => void
}
function ViewToggle({ activeView, onViewToggle }: ViewToggleProps) {
  return (
    <Stack
      direction="row"
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        ml: 1,
      }}
    >
      <Tooltip title="List view">
        <Stack
          alignItems="center"
          justifyContent="center"
          onClick={() => onViewToggle('list')}
          sx={{
            px: 0.75,
            py: 0.5,
            cursor: 'pointer',
            color: activeView === 'list' ? 'primary.main' : 'text.secondary',
            bgcolor: activeView === 'list' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ViewListIcon sx={{ fontSize: 18 }} />
        </Stack>
      </Tooltip>
      <Tooltip title="Kanban view">
        <Stack
          alignItems="center"
          justifyContent="center"
          onClick={() => onViewToggle('kanban')}
          sx={{
            px: 0.75,
            py: 0.5,
            cursor: 'pointer',
            color: activeView === 'kanban' ? 'primary.main' : 'text.secondary',
            bgcolor:
              activeView === 'kanban' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ViewKanbanOutlinedIcon sx={{ fontSize: 18 }} />
        </Stack>
      </Tooltip>
    </Stack>
  )
}

type ReviewFilterBarProps = {
  isMustReviewActive: boolean
  onMustReviewToggle: VoidFunction
  isMyPrsActive: boolean
  onMyPrsToggle: VoidFunction
  isMyWorkActive: boolean
  onMyWorkToggle: VoidFunction
  activeView: 'list' | 'kanban'
  onViewToggle: (view: 'list' | 'kanban') => void
}
export default function PullRequestFilterBar({
  isMustReviewActive,
  onMustReviewToggle,
  isMyPrsActive,
  onMyPrsToggle,
  isMyWorkActive,
  onMyWorkToggle,
  activeView,
  onViewToggle,
}: ReviewFilterBarProps) {
  return (
    <Stack direction="row" gap={0.5} alignItems="center">
      <FilterButton
        label="Highest Priority"
        icon={StarRate}
        active={isMustReviewActive}
        color="error.main"
        onClick={onMustReviewToggle}
      />
      <FilterButton
        label="My PRs"
        icon={PersonIcon}
        active={isMyPrsActive}
        onClick={onMyPrsToggle}
      />
      <FilterButton
        label="My work"
        icon={GroupIcon}
        active={isMyWorkActive}
        onClick={onMyWorkToggle}
      />
      <ViewToggle activeView={activeView} onViewToggle={onViewToggle} />
    </Stack>
  )
}
