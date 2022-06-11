import { Avatar, Badge, Tooltip } from '@mui/material'

import ApprovedIcon from '@mui/icons-material/CheckCircle'
import ChangesRequestedIcon from '@mui/icons-material/Cancel'
import CommentedIcon from '@mui/icons-material/Info'
import ContributorIcon from '@mui/icons-material/AddCircle'
import { ReactElement } from 'react'
import ReviewRequestedIcon from '@mui/icons-material/Pending'

function getReviewIcon(state: ReviewState): ReactElement | null {
  switch (state) {
    case 'APPROVED':
      return <ApprovedIcon color="success" />
    case 'CHANGES_REQUESTED':
      return <ChangesRequestedIcon color="error" />
    case 'COMMENTED':
      return <CommentedIcon color="action" />
    default:
      return null
  }
}

function getReviewStatusTooltip({
  reviewState,
  user,
}: {
  reviewState: ReviewState
  user: User
}): string {
  const state =
    reviewState.charAt(0).toUpperCase() +
    reviewState.substring(1).replaceAll('_', ' ').toLowerCase()

  return `${state} by ${user.login}`
}

function getTooltip({
  user,
  reviewState,
  type,
}: Pick<UserBadgeProps, 'user' | 'reviewState' | 'type'>) {
  if (type === 'AUTHOR') return `Opened by ${user.login}`
  if (type === 'CONTRIBUTOR') return `Contributed by ${user.login}`
  if (type === 'ASSIGNEE') return `Assigned to ${user.login}`
  if (type === 'REQUESTED_REVIEWER')
    return `Review requested from ${user.login}`
  if (type === 'REVIEWER' && reviewState)
    return getReviewStatusTooltip({ reviewState, user })

  return user.login
}

function getBadgeContent({
  reviewState,
  type,
}: Pick<UserBadgeProps, 'reviewState' | 'type'>) {
  if (type === 'DEFAULT') return null

  const icon = getIcon({ type, reviewState })

  return icon ? (
    <Avatar sx={{ bgcolor: 'white', width: 24, height: 24 }}>{icon}</Avatar>
  ) : null
}

function getIcon({
  reviewState,
  type,
}: Pick<UserBadgeProps, 'reviewState' | 'type'>) {
  if (type === 'CONTRIBUTOR') return <ContributorIcon color="secondary" />
  if (type === 'REQUESTED_REVIEWER')
    return <ReviewRequestedIcon htmlColor="gray" />
  if (type === 'REVIEWER' && reviewState) return getReviewIcon(reviewState)

  return null
}

type BaseUserBadgeProps = {
  user: User
}

export type UserBadgeProps =
  | (BaseUserBadgeProps & {
      type:
        | 'DEFAULT'
        | 'AUTHOR'
        | 'REQUESTED_REVIEWER'
        | 'CONTRIBUTOR'
        | 'ASSIGNEE'
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
  ...props
}: UserBadgeProps) {
  return (
    <Tooltip title={getTooltip({ user, reviewState, type })} {...props}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={getBadgeContent({ reviewState, type })}
      >
        <Avatar alt={user.login} src={user.avatarUrl} />
      </Badge>
    </Tooltip>
  )
}
