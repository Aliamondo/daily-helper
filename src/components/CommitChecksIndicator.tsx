import { KeyboardEvent, forwardRef, useRef, useState } from 'react'
import { SxProps, Theme } from '@mui/system'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import FailureIcon from '@mui/icons-material/Close'
import { ICON_BUTTON_SIZE } from '../views/DailyHelper/DalyHelper'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import PendingIcon from '@mui/icons-material/Circle'
import Popper from '@mui/material/Popper'
import ReloadIcon from '@mui/icons-material/Replay'
import Skeleton from '@mui/material/Skeleton'
import SkippedIcon from '@mui/icons-material/DoNotDisturbAlt'
import SuccessIcon from '@mui/icons-material/Check'
import UserBadge from './UserBadge'

type CommitChecksIndicatorProps = {
  commitChecks: CommitCheck[]
  result: CommitCheck['result']
  prUrl: string
  handleReload: VoidFunction
  isLoading: boolean
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

function getCommitChecksCalculatedStatus(
  result: CommitChecksIndicatorProps['result'],
  commitChecks: CommitCheck[],
): CommitChecksIndicatorProps['result'] {
  if (result === 'SUCCESS') {
    if (commitChecks.find(commitCheck => commitCheck.result === 'PENDING')) {
      return 'FAILURE'
    }
  }

  return result
}

function getCommitChecksCompositeStatus(
  resultRaw: CommitChecksIndicatorProps['result'],
  commitChecks: CommitCheck[],
): string {
  const result = getCommitChecksCalculatedStatus(resultRaw, commitChecks)

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
  prUrl,
  handleReload,
  isLoading,
  sx,
}: CommitChecksIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const container = useRef(null)
  const main = useRef<HTMLHeadingElement>(null)

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
      <ClickAwayListener onClickAway={handleClose}>
        <Box
          component="span"
          sx={{ margin: 1 }}
          onKeyUp={({ code }: KeyboardEvent) => {
            code === 'Escape' && handleClose()
          }}
        >
          <IconButton
            ref={container}
            edge="end"
            onClick={handleClick}
            sx={{ width: ICON_BUTTON_SIZE, height: ICON_BUTTON_SIZE, ...sx }}
          >
            <CommitChecksIndicatorIcon
              result={getCommitChecksCalculatedStatus(result, commitChecks)}
            />
          </IconButton>
          <Popper
            ref={main}
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
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={handleReload}
                      size="large"
                      disableRipple={isLoading}
                    >
                      {isLoading ? (
                        <CircularProgress size={30} />
                      ) : (
                        <ReloadIcon />
                      )}
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      isLoading ? (
                        <Skeleton
                          variant="text"
                          animation="wave"
                          width={200}
                          sx={{ marginLeft: 'auto', marginRight: 'auto' }}
                        />
                      ) : (
                        <Link
                          href={`${prUrl}/checks`}
                          target="_blank"
                          rel="noopener"
                        >
                          {getCommitChecksCompositeStatus(result, commitChecks)}
                        </Link>
                      )
                    }
                    secondary={
                      isLoading ? (
                        <Skeleton
                          variant="text"
                          animation="wave"
                          width={250}
                          sx={{ marginLeft: 'auto', marginRight: 'auto' }}
                        />
                      ) : (
                        `${successes} / ${total} checks OK`
                      )
                    }
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
                {commitChecks.map(commitCheck => (
                  <ListItem
                    key={commitCheck.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        disableRipple
                        tabIndex={-1}
                        sx={{
                          width: ICON_BUTTON_SIZE,
                          height: ICON_BUTTON_SIZE,
                        }}
                      >
                        {isLoading ? (
                          <Skeleton
                            variant="circular"
                            animation="wave"
                            height={24}
                            width={ICON_BUTTON_SIZE}
                          />
                        ) : (
                          <CommitChecksIndicatorIcon
                            result={commitCheck.result}
                          />
                        )}
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      {isLoading ? (
                        <Skeleton
                          variant="circular"
                          animation="wave"
                          width={ICON_BUTTON_SIZE}
                          height={ICON_BUTTON_SIZE}
                        />
                      ) : (
                        <CommitCheckRunnerBadge checker={commitCheck.checker} />
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        isLoading ? (
                          <Skeleton
                            variant="text"
                            animation="wave"
                            width={200}
                          />
                        ) : (
                          <>
                            {commitCheck.runUrl ? (
                              <Link
                                href={commitCheck.runUrl}
                                target="_blank"
                                rel="noopener"
                              >
                                {commitCheck.name}
                              </Link>
                            ) : (
                              commitCheck.name
                            )}
                            {commitCheck.required && (
                              <Chip
                                label="Required"
                                size="small"
                                variant="outlined"
                                sx={{ marginLeft: 1 }}
                              />
                            )}
                          </>
                        )
                      }
                      secondary={
                        isLoading ? (
                          <Skeleton
                            variant="text"
                            animation="wave"
                            width={main.current!.offsetWidth - 120}
                          />
                        ) : (
                          commitCheck.description
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Popper>
        </Box>
      </ClickAwayListener>
    )
  }

  return null
}
