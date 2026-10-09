import ApprovedIcon from '@mui/icons-material/CheckCircle'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import ChangesRequestedIcon from '@mui/icons-material/Cancel'
import CommentedIcon from '@mui/icons-material/Info'
import ContributorIcon from '@mui/icons-material/BuildCircle'
import { ReactElement } from 'react'
import ReviewPendingIcon from '@mui/icons-material/Pending'
import ReviewRequestedIcon from '@mui/icons-material/Circle'
import Tooltip from '@mui/material/Tooltip'
import { getUserBadgeTooltip } from '../helpers/userBadge'

function getReviewIcon(state: ReviewState): ReactElement | null {
  switch (state) {
    case 'APPROVED':
      return <ApprovedIcon color="success" />
    case 'CHANGES_REQUESTED':
      return <ChangesRequestedIcon color="error" />
    case 'COMMENTED':
      return <CommentedIcon color="info" />
    case 'PENDING':
      return <ReviewPendingIcon color="disabled" />
    default:
      return null
  }
}

const DIMENSIONS = {
  medium: { avatar: 40, badge: 20, badgeIcon: 20 },
  small: { avatar: 30, badge: 15, badgeIcon: 14 },
}

function getBadgeContent({
  reviewState,
  type,
  size,
}: Pick<UserBadgeProps, 'reviewState' | 'type' | 'size'>) {
  if (type === 'DEFAULT') return null

  const icon = getIcon({ type, reviewState })
  const { badge, badgeIcon } = DIMENSIONS[size ?? 'medium']

  return icon ? (
    <Avatar
      sx={{
        backgroundColor: 'white',
        width: badge,
        height: badge,
        '& .MuiSvgIcon-root': { fontSize: badgeIcon },
      }}
    >
      {icon}
    </Avatar>
  ) : null
}

function getIcon({
  reviewState,
  type,
}: Pick<UserBadgeProps, 'reviewState' | 'type'>) {
  if (type === 'CONTRIBUTOR') return <ContributorIcon htmlColor="#6c40e6" />
  if (type === 'REQUESTED_REVIEWER')
    return <ReviewRequestedIcon htmlColor="#bf8700" fontSize="small" />
  if (type === 'REVIEWER' && reviewState) return getReviewIcon(reviewState)

  return null
}

type BaseUserBadgeProps = {
  user: User
  size?: 'small' | 'medium'
}

export type UserBadgeProps =
  | (BaseUserBadgeProps & {
      type:
        | 'DEFAULT'
        | 'AUTHOR'
        | 'REQUESTED_REVIEWER'
        | 'CONTRIBUTOR'
        | 'ASSIGNEE'
        | 'COMMIT_CHECK_RUNNER'
      reviewState?: ReviewState
    })
  | (BaseUserBadgeProps & {
      type: 'REVIEWER'
      reviewState: ReviewState
    })

export default function UserBadge({
  user,
  reviewState,
  type,
  size = 'medium',
  ...props
}: UserBadgeProps) {
  const { avatar } = DIMENSIONS[size]

  return (
    <Tooltip
      title={getUserBadgeTooltip({ user, reviewState, type })}
      {...props}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={getBadgeContent({ reviewState, type, size })}
      >
        <Avatar
          alt={user.login}
          src={user.avatarUrl}
          sx={{ width: avatar, height: avatar }}
        />
      </Badge>
    </Tooltip>
  )
}
