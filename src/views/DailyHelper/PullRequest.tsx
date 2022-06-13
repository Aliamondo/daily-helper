import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CommentsIcon from '@mui/icons-material/ChatOutlined'
import CommitChecksIndicator from '../../components/CommitChecksIndicator'
import Grid from '@mui/material/Grid'
import Label from '../../components/Label'
import Link from '@mui/material/Link'
import NoCommentsIcon from '@mui/icons-material/ChatBubbleOutline'
import PullRequestStateIcon from './PullRequestStateIcon'
import PullRequestStatus from './PullRequestStatus'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

function getBackgroundColor({
  state,
  reviews,
  isDraft,
}: Pick<PullRequest, 'state' | 'reviews' | 'isDraft'>) {
  if (state === 'OPEN') {
    const reviewStates = reviews.map(review => review.state)

    if (reviewStates.includes('CHANGES_REQUESTED'))
      return 'rgb(250, 170, 180, 0.6)'
    if (reviewStates.includes('APPROVED')) return 'rgb(65, 200, 150, 0.5)'

    if (isDraft) return 'rgb(200, 200, 200, 0.6)'
  }

  return 'rgb(244, 244, 247, 0.6)'
}

export default function PullRequest({
  title,
  author,
  comments,
  number,
  labels,
  assignees,
  repositoryUrl,
  repositoryName,
  url,
  createdAt,
  state,
  isDraft,
  reviews,
  requestedReviewers,
  contributors,
  lastCommitChecks,
}: PullRequest) {
  return (
    <Card
      variant="outlined"
      sx={{
        minHeight: 150,
        minWidth: 600,
        bgcolor: getBackgroundColor({ state, reviews, isDraft }),
      }}
    >
      <CardContent>
        <Grid container columnSpacing={2} rowSpacing={2} alignItems="center">
          <Grid item xs={1}>
            <PullRequestStateIcon state={state} isDraft={isDraft} />
          </Grid>
          <Grid item xs={10}>
            <Link
              href={repositoryUrl}
              variant="subtitle1"
              color="GrayText"
              underline="hover"
            >
              {repositoryName}
            </Link>
            <Link href={url} underline="none" variant="body1" marginLeft={1}>
              {title}
            </Link>
            <Link
              href={url}
              variant="subtitle1"
              color="InfoText"
              underline="hover"
              marginLeft={1}
            >
              (#{number})
            </Link>
            {lastCommitChecks.result ? (
              <CommitChecksIndicator
                commitChecks={lastCommitChecks.commitChecks}
                result={lastCommitChecks.result}
                sx={{
                  marginBottom: 0.3,
                }}
              />
            ) : null}
            {labels.map(label => (
              <Label key={label.id} label={label} />
            ))}
          </Grid>
          <Grid item xs={1}>
            <Link href={url} underline="none">
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
          </Grid>
          <PullRequestStatus
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
