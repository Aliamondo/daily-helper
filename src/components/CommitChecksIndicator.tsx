import { SxProps, Theme } from '@mui/system'
import { forwardRef, useRef, useState } from 'react'

import Badge from '@mui/material/Badge'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import FailureIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import PendingIcon from '@mui/icons-material/Circle'
import Popper from '@mui/material/Popper'
import SkippedIcon from '@mui/icons-material/SkipNext'
import SuccessIcon from '@mui/icons-material/Check'
import UserBadge from './UserBadge'

type CommitChecksIndicatorProps = {
  commitChecks: CommitCheck[]
  sx?: SxProps<Theme>
}

const CommitChecksIndicatorIcon = forwardRef<
  SVGSVGElement,
  CommitChecksIndicatorProps
>(({ commitChecks, sx, ...props }, ref) => {
  const SMALL_FONT_SIZE = 14

  const commonProps = { sx, ...props }
  const compositeResult = getCompositeResult(commitChecks)

  switch (compositeResult) {
    case 'SUCCESS':
      return <SuccessIcon color="success" {...commonProps} />
    case 'FAILURE':
      return <FailureIcon ref={ref} color="error" {...commonProps} />
    case 'IN_PROGRESS':
      return (
        <PendingIcon
          htmlColor="#bf8700"
          {...commonProps}
          sx={{ ...sx, fontSize: SMALL_FONT_SIZE }}
        />
      )
    case 'SKIPPED':
      return <SkippedIcon color="disabled" {...commonProps} />
    default:
      return (
        <PendingIcon
          color="disabled"
          {...commonProps}
          sx={{ ...sx, fontSize: SMALL_FONT_SIZE }}
        />
      )
  }
})

function getCompositeResult(
  commitChecks: CommitCheck[],
): CommitCheck['result'] {
  if (commitChecks.some(({ result }) => result === 'IN_PROGRESS'))
    return 'IN_PROGRESS'
  if (commitChecks.some(({ result }) => result === 'PENDING')) return 'PENDING'
  if (commitChecks.some(({ result }) => result === 'FAILURE')) return 'FAILURE'
  if (commitChecks.every(({ result }) => result === 'SKIPPED')) return 'SKIPPED'
  if (
    commitChecks.every(
      ({ result }) => result === 'SUCCESS' || result === 'SKIPPED',
    )
  )
    return 'SUCCESS'

  return 'FAILURE'
}

function getCommitChecksCompositeStatus(commitChecks: CommitCheck[]): string {
  const compositeResult = getCompositeResult(commitChecks)

  switch (compositeResult) {
    case 'SUCCESS':
      return 'All checks have passed'
    case 'IN_PROGRESS':
    case 'PENDING':
      return "Some checks haven't completed yet"
    case 'SKIPPED':
      return 'All checks were skipped'
    default:
      return 'Some checks were not successful'
  }
}

function CommitRunnerBadge({
  commitChecker,
}: {
  commitChecker: CommitChecker
}) {
  return <UserBadge user={commitChecker} type="DEFAULT" />
}

export default function CommitChecksIndicator({
  commitChecks,
  sx,
}: CommitChecksIndicatorProps) {
  const ICON_BUTTON_SIZE = 40

  const [isOpen, setIsOpen] = useState(false)
  const container = useRef(null)

  const handleClick = () => {
    setIsOpen(!isOpen)
  }
  const handleClose = () => {
    setIsOpen(false)
  }

  const total = commitChecks.length
  const successes = commitChecks.filter(
    ({ result }) => result === 'SUCCESS' || result === 'SKIPPED',
  ).length

  if (total) {
    return (
      <>
        <ClickAwayListener onClickAway={handleClose}>
          <Badge>
            <IconButton
              ref={container}
              edge="end"
              disableRipple
              onClick={handleClick}
              sx={{ width: ICON_BUTTON_SIZE, height: ICON_BUTTON_SIZE, ...sx }}
            >
              <CommitChecksIndicatorIcon commitChecks={commitChecks} />
            </IconButton>
            <Popper
              open={isOpen}
              anchorEl={container.current}
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
              ]}
              sx={{ zIndex: 1 }}
            >
              <Paper
                elevation={20}
                sx={{
                  minWidth: 400,
                  maxWidth: 800,
                  bgcolor: 'rgb(244,244,247)',
                }}
              >
                <List>
                  <ListItemText
                    primary={getCommitChecksCompositeStatus(commitChecks)}
                    secondary={`${successes} / ${total} checks OK`}
                    sx={{ textAlign: 'center' }}
                  />
                  {commitChecks.map(commitCheck => (
                    <ListItem
                      key={commitCheck.runUrl}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          disableRipple
                          sx={{
                            width: ICON_BUTTON_SIZE,
                            height: ICON_BUTTON_SIZE,
                          }}
                        >
                          <CommitChecksIndicatorIcon
                            commitChecks={[commitCheck]}
                          />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <CommitRunnerBadge
                          commitChecker={commitCheck.checker}
                        />
                      </ListItemAvatar>
                      <ListItemText primary={commitCheck.name} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Popper>
          </Badge>
        </ClickAwayListener>
      </>
    )
  }

  return null
}
