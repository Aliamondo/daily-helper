import AvatarGroup from '@mui/material/AvatarGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UserBadge from './UserBadge'

type UserGroupProps = {
  users: User[]
  groupName: string
  emptyGroupName?: string
  type?:
    | 'DEFAULT'
    | 'AUTHOR'
    | 'CONTRIBUTOR'
    | 'REQUESTED_REVIEWER'
    | 'ASSIGNEE'
}
export default function UserGroup({
  users,
  groupName,
  emptyGroupName,
  type = 'DEFAULT',
}: UserGroupProps) {
  return (
    <Stack direction="column" alignItems="center">
      {users.length ? (
        <>
          <Typography variant="subtitle1">{groupName}</Typography>
          <AvatarGroup max={3}>
            {users.map(user => (
              <UserBadge key={user.login} user={user} type={type} />
            ))}
          </AvatarGroup>
        </>
      ) : (
        <Typography variant="subtitle1">
          {emptyGroupName || `No ${groupName}`}
        </Typography>
      )}
    </Stack>
  )
}
