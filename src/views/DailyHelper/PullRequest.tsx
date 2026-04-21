import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CommentsIcon from '@mui/icons-material/ChatOutlined'
import CommitChecksIndicator from '../../components/CommitChecksIndicator'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Grid from '@mui/material/Grid'
import { ICON_BUTTON_SIZE } from './DailyHelper'
import Label from '../../components/Label'
import Link from '@mui/material/Link'
import NoCommentsIcon from '@mui/icons-material/ChatBubbleOutline'
import PullRequestStateIcon from '../../components/PullRequestStateIcon'
import PullRequestStatus from './PullRequestStatus'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { dataFetcher } from '../../helpers/dataFetcher'
import { settingsHandler } from '../../helpers/settingsHandler'
type PullRequestProps = {
  isLoading: boolean
} & PullRequest

export default function PullRequest({
  isLoading,
  id,
  title,
  author,
  comments,
  number,
  labels,
  assignees,
  repositoryUrl,
  repositoryName,
  repositoryBaseRef,
  baseRef,
  url,
  createdAt,
  state,
  isDraft,
  reviewDecision,
  reviews,
  requestedReviewers,
  contributors,
  lastCommitChecks: originalLastCommitChecks,
}: PullRequestProps) {
  const theme = useTheme()
  const [lastCommitChecks, setLastCommitChecks] = useState(
    originalLastCommitChecks,
  )
  const [isLastCommitChecksLoading, setIsLastCommitChecksLoading] =
    useState(false)

  const handleCommitChecksReload = async () => {
    setIsLastCommitChecksLoading(true)
    setLastCommitChecks(
      await dataFetcher.refreshLastCommitChecks({
        orgName: settingsHandler.loadOrgName() || '',
        repoName: repositoryName,
        prNumber: number,
      }),
    )
    setIsLastCommitChecksLoading(false)
  }

  return (
    <Card
      variant="outlined"
      sx={{
        minHeight: 150,
        minWidth: 700,
        bgcolor: (() => {
          if (state === 'OPEN' && !isLoading) {
            if (reviewDecision === 'CHANGES_REQUESTED')
              return theme.palette.prCard.changesRequested
            if (reviewDecision === 'APPROVED')
              return theme.palette.prCard.approved
            if (isDraft) return theme.palette.prCard.draft
          }
          return theme.palette.prCard.default
        })(),
      }}
    >
      <CardContent>
        <Grid container columnSpacing={2} rowSpacing={2} alignItems="center">
          <Grid item xs="auto">
            {isLoading ? (
              <Skeleton
                variant="circular"
                animation="wave"
                width={ICON_BUTTON_SIZE}
                height={ICON_BUTTON_SIZE}
              />
            ) : (
              <PullRequestStateIcon state={state} isDraft={isDraft} />
            )}
          </Grid>
          <Grid item xs={10}>
            {isLoading ? (
              <Grid item xs={9}>
                <Skeleton variant="text" animation="wave" />
              </Grid>
            ) : (
              <>
                <Link
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                  }}
                >
                  {repositoryName}
                </Link>
                <Link
                  href={url}
                  underline="none"
                  variant="body1"
                  marginLeft={1}
                  target="_blank"
                  rel="noopener"
                >
                  {title}
                </Link>
                {repositoryBaseRef !== baseRef && (
                  <Chip
                    label={baseRef}
                    size="small"
                    icon={<CompareArrowsIcon fontSize="small" />}
                    color="primary"
                    sx={{ marginLeft: 1, marginBottom: 0.5 }}
                  />
                )}
                <Link
                  href={url}
                  variant="subtitle1"
                  color="text.secondary"
                  underline="hover"
                  marginLeft={1}
                  target="_blank"
                  rel="noopener"
                >
                  (#{number})
                </Link>
                {!!lastCommitChecks ? (
                  <CommitChecksIndicator
                    commitChecks={lastCommitChecks.commitChecks}
                    result={lastCommitChecks.result}
                    prUrl={url}
                    handleReload={handleCommitChecksReload}
                    isLoading={isLastCommitChecksLoading}
                    sx={{
                      marginBottom: 0.3,
                    }}
                  />
                ) : null}
                {labels.map(label => (
                  <Label key={label.id} label={label} />
                ))}
              </>
            )}
          </Grid>
          <Grid item xs={1}>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                animation="wave"
                width={ICON_BUTTON_SIZE}
                height={ICON_BUTTON_SIZE}
              />
            ) : (
              <Link href={url} underline="none" target="_blank" rel="noopener">
                <Stack
                  direction="row"
                  spacing={0.5}
                  color="text.secondary"
                  marginRight={4}
                >
                  {comments ? <CommentsIcon /> : <NoCommentsIcon />}
                  <Typography>{comments}</Typography>
                </Stack>
              </Link>
            )}
          </Grid>
          <PullRequestStatus
            isLoading={isLoading}
            author={author}
            createdAt={createdAt}
            reviews={reviews}
            requestedReviewers={requestedReviewers}
            contributors={contributors}
            assignees={assignees}
          />
        </Grid>
      </CardContent>
    </Card>
  )
}
