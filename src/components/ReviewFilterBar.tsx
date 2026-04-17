import Chip from '@mui/material/Chip'
import PersonIcon from '@mui/icons-material/Person'
import Stack from '@mui/material/Stack'
import StarRate from '@mui/icons-material/StarRate'
import GroupIcon from '@mui/icons-material/Group'

type ReviewFilterBarProps = {
  isMustReviewActive: boolean
  onMustReviewToggle: VoidFunction
  isMyPrsActive: boolean
  onMyPrsToggle: VoidFunction
  isMyWorkActive: boolean
  onMyWorkToggle: VoidFunction
}
export default function ReviewFilterBar({
  isMustReviewActive,
  onMustReviewToggle,
  isMyPrsActive,
  onMyPrsToggle,
  isMyWorkActive,
  onMyWorkToggle,
}: ReviewFilterBarProps) {
  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Chip
        icon={<StarRate />}
        label="Highest Priority"
        onClick={onMustReviewToggle}
        color={isMustReviewActive ? 'error' : 'default'}
        variant={isMustReviewActive ? 'filled' : 'outlined'}
      />
      <Chip
        icon={<PersonIcon />}
        label="My PRs"
        onClick={onMyPrsToggle}
        color={isMyPrsActive ? 'primary' : 'default'}
        variant={isMyPrsActive ? 'filled' : 'outlined'}
      />
      <Chip
        icon={<GroupIcon />}
        label="My work"
        onClick={onMyWorkToggle}
        color={isMyWorkActive ? 'primary' : 'default'}
        variant={isMyWorkActive ? 'filled' : 'outlined'}
      />
    </Stack>
  )
}
