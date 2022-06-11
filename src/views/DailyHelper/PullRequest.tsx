import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CommentsIcon from '@mui/icons-material/ChatBubbleOutline'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import PullRequestStateIcon from './PullRequestStateIcon'
import PullRequestStatus from './PullRequestStatus'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b
  })

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : {
        r: 0,
        g: 0,
        b: 0,
      }
}

function getFontColor(backgroundColor: string): string {
  const { r, g, b } = hexToRgb(backgroundColor)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.5 ? 'black' : 'white'
}

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
}: PullRequest) {
  return (
    <Card
      variant="outlined"
      sx={{
        minHeight: 150,
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
            {labels.map(label => (
              <Chip
                key={label.id}
                label={label.name}
                sx={{
                  bgcolor: `#${label.color}`,
                  color: getFontColor(label.color),
                  marginLeft: 1,
                }}
              />
            ))}
          </Grid>
          <Grid item xs={1}>
            <Link href={url} underline="none">
              <Stack
                direction="row"
                spacing={0.5}
                color="GrayText"
                marginRight={4}
              >
                <CommentsIcon />
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
