import Box from '@mui/material/Box'
import Popper, { PopperPlacementType } from '@mui/material/Popper'
import { ReactElement, RefObject, useRef, useState } from 'react'
import { useTheme } from '@mui/material/styles'

import AvatarGroup from '@mui/material/AvatarGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UserBadge from './UserBadge'

type StateRects = {
  popper: { width: number; height: number; x: number; y: number }
  reference: { width: number; height: number; x: number; y: number }
}

type UserGroupProps = {
  users: User[]
  groupName: string
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
  type = 'DEFAULT',
}: UserGroupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const container = useRef(null)
  const main = useRef<HTMLHeadingElement>(null)

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const showUsers = () =>
    users.map(user => <UserBadge key={user.login} user={user} type={type} />)

  return (
    <Stack direction="column" alignItems="center">
      <Typography variant="overline" sx={{ userSelect: 'none' }}>{groupName}</Typography>
      {users.length ? (
        <>
          <AvatarGroup
            max={3}
            componentsProps={{
              additionalAvatar: {
                ref: container,
                onClick: handleClick,
              },
            }}
          >
            {showUsers()}
          </AvatarGroup>
          <AvatarGroupPopper
            isOpen={isOpen}
            showUsers={showUsers}
            main={main}
            container={container}
            handleClose={handleClose}
          />
        </>
      ) : (
        <Box sx={{ height: 40 }} />
      )}
    </Stack>
  )
}

type AvatarGroupPopperProps = {
  isOpen: boolean
  showUsers: () => ReactElement[]
  main: RefObject<HTMLHeadingElement>
  container: RefObject<HTMLHeadingElement>
  handleClose: VoidFunction
}
export function AvatarGroupPopper({
  isOpen,
  showUsers,
  handleClose,
  main,
  container,
}: AvatarGroupPopperProps) {
  const theme = useTheme()
  const bgColor = theme.palette.prCard.popup

  if (!isOpen) return null

  const users = showUsers()

  return (
    <ClickAwayListener onClickAway={handleClose} touchEvent={false}>
      <Popper
        ref={main}
        open={isOpen}
        anchorEl={container.current}
        placement="top"
        modifiers={[
          {
            name: 'flip',
            enabled: false,
          },
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              rootBoundary: 'document',
            },
          },
          {
            name: 'offset',
            options: {
              offset: ({
                popper,
                reference,
              }: PopperPlacementType & StateRects) => [
                -reference.width / 2,
                -popper.height + 5,
              ],
            },
          },
        ]}
        sx={{ zIndex: 1 }}
      >
        <Paper
          elevation={20}
          sx={{
            maxWidth: 500,
            padding: 1,
            bgcolor: bgColor,
            display: 'flex',
          }}
        >
          <Grid container rowSpacing={2} columns={10} columnSpacing={1}>
            {users.map(user => (
              <Grid item xs={users.length > 10 ? 1 : 'auto'}>
                {user}
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Popper>
    </ClickAwayListener>
  )
}
