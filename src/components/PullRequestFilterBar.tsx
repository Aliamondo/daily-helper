import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import Stack from '@mui/material/Stack'
import StarRate from '@mui/icons-material/StarRate'
import Typography from '@mui/material/Typography'
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

type ReviewFilterBarProps = {
  isMustReviewActive: boolean
  onMustReviewToggle: VoidFunction
  isMyPrsActive: boolean
  onMyPrsToggle: VoidFunction
  isMyWorkActive: boolean
  onMyWorkToggle: VoidFunction
}
export default function PullRequestFilterBar({
  isMustReviewActive,
  onMustReviewToggle,
  isMyPrsActive,
  onMyPrsToggle,
  isMyWorkActive,
  onMyWorkToggle,
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
    </Stack>
  )
}
