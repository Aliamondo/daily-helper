import { RefObject, useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CommentsIcon from '@mui/icons-material/ChatOutlined'
import CommitChecksIndicator from '../../components/CommitChecksIndicator'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Grid from '@mui/material/Grid'
import { ICON_BUTTON_SIZE } from './DalyHelper'
import Label from '../../components/Label'
import Link from '@mui/material/Link'
import NoCommentsIcon from '@mui/icons-material/ChatBubbleOutline'
import PullRequestStateIcon from '../../components/PullRequestStateIcon'
import PullRequestStatus from './PullRequestStatus'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { refreshLastCommitChecks } from '../../helpers/dataFetcher'
import useOnScreen from '../../helpers/useOnScreen'

function getBackgroundColor({
  state,
  reviewDecision,
  isDraft,
  isLoading,
}: Pick<PullRequest, 'state' | 'reviewDecision' | 'isDraft'> & {
  isLoading: boolean
}) {
  if (state === 'OPEN' && !isLoading) {
    if (reviewDecision === 'CHANGES_REQUESTED') return 'rgb(250, 170, 180, 0.6)'
    if (reviewDecision === 'APPROVED') return 'rgb(65, 200, 150, 0.5)'

    if (isDraft) return 'rgb(200, 200, 200, 0.6)'
  }

  return 'rgb(244, 244, 247, 0.6)'
}

type PullRequestProps = {
  customRef: RefObject<HTMLElement>
  setIsInViewport: (id: string, visible: boolean) => void
  orgName: string
  isLoading: boolean
} & PullRequest

export default function PullRequest({
  customRef,
  setIsInViewport,
  orgName,
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
  const [lastCommitChecks, setLastCommitChecks] = useState(
    originalLastCommitChecks,
  )
  const [isLastCommitChecksLoading, setIsLastCommitChecksLoading] =
    useState(false)

  const isInViewport = useOnScreen(customRef)
  useEffect(() => {
    setIsInViewport(id, isInViewport)
  }, [isInViewport, id, setIsInViewport])

  const handleCommitChecksReload = async () => {
    setIsLastCommitChecksLoading(true)
    setLastCommitChecks(
      await refreshLastCommitChecks({
        orgName,
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
        bgcolor: getBackgroundColor({
          state,
          reviewDecision,
          isDraft,
          isLoading,
        }),
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
                  variant="subtitle1"
                  color="GrayText"
                  underline="hover"
                  target="_blank"
                  rel="noopener"
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
                  color="InfoText"
                  underline="hover"
                  marginLeft={1}
                  target="_blank"
                  rel="noopener"
                >
                  (#{number})
                </Link>
                {lastCommitChecks.result ? (
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
                  color={'GrayText'}
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
            isDraft={isDraft}
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
