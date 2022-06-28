import { SxProps, Theme } from '@mui/system'
import { forwardRef, useRef, useState } from 'react'

import Badge from '@mui/material/Badge'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import FailureIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import PendingIcon from '@mui/icons-material/Circle'
import Popper from '@mui/material/Popper'
import SkippedIcon from '@mui/icons-material/DoNotDisturbAlt'
import SuccessIcon from '@mui/icons-material/Check'
import UserBadge from './UserBadge'

type CommitChecksIndicatorProps = {
  commitChecks: CommitCheck[]
  result: CommitCheck['result']
  sx?: SxProps<Theme>
}

const CommitChecksIndicatorIcon = forwardRef<
  SVGSVGElement,
  { result: CommitCheck['result']; sx?: SxProps<Theme> }
>(({ result, sx, ...props }, ref) => {
  const SMALL_FONT_SIZE = 14

  const commonProps = { sx, ...props }

  switch (result) {
    case 'SUCCESS':
      return <SuccessIcon color="success" {...commonProps} />
    case 'FAILURE':
      return <FailureIcon ref={ref} color="error" {...commonProps} />
    case 'IN_PROGRESS':
    case 'PENDING':
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

function getCommitChecksCompositeStatus(
  result: CommitChecksIndicatorProps['result'],
): string {
  switch (result) {
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

function CommitCheckRunnerBadge({ checker }: Pick<CommitCheck, 'checker'>) {
  return <UserBadge user={checker} type="COMMIT_CHECK_RUNNER" />
}

export default function CommitChecksIndicator({
  commitChecks,
  result,
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
              <CommitChecksIndicatorIcon result={result} />
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
                    primary={getCommitChecksCompositeStatus(result)}
                    secondary={`${successes} / ${total} checks OK`}
                    sx={{ textAlign: 'center' }}
                  />
                  {commitChecks.map(commitCheck => (
                    <ListItem
                      key={commitCheck.id}
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
                            result={commitCheck.result}
                          />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <CommitCheckRunnerBadge checker={commitCheck.checker} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Link
                            href={commitCheck.runUrl}
                            target="_blank"
                            rel="noopener"
                          >
                            {commitCheck.name}
                          </Link>
                        }
                        secondary={commitCheck.description}
                      />
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
