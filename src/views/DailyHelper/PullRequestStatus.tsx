import AvatarGroup from '@mui/material/AvatarGroup'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UserBadge from '../../components/UserBadge'
import UserGroup from '../../components/UserGroup'
import moment from 'moment'

export default function PullRequestStatus({
  createdAt,
  author,
  reviews,
  requestedReviewers,
  contributors,
  assignees,
  isDraft,
}: Pick<
  PullRequest,
  | 'createdAt'
  | 'author'
  | 'reviews'
  | 'requestedReviewers'
  | 'contributors'
  | 'assignees'
  | 'isDraft'
>) {
  const createdAtFromNow = moment(createdAt).fromNow()

  return (
    <>
      <Grid item xs={2}>
        <Stack direction="column">
          <Typography variant="subtitle1" align="center">
            Author
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <AvatarGroup max={3} sx={{ marginLeft: 1 }}>
              <UserBadge user={author} type="AUTHOR" />
            </AvatarGroup>
            <Typography variant="subtitle2">{createdAtFromNow}</Typography>
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <UserGroup
          users={contributors}
          groupName="Contributors"
          type="CONTRIBUTOR"
        />
      </Grid>
      <Grid item xs={2}>
        <UserGroup users={assignees} groupName="Assignees" type="ASSIGNEE" />
      </Grid>
      <Grid item xs={2}>
        <Stack direction="column" alignItems="center">
          {reviews.length || requestedReviewers.length ? (
            <>
              <Typography variant="subtitle1">Reviewers</Typography>
              <AvatarGroup max={3}>
                {reviews
                  .filter(({ state }) => state !== 'DISMISSED') // Hide dismissed and stale reviews
                  .map(review => (
                    <UserBadge
                      key={review.reviewer.login}
                      user={review.reviewer}
                      reviewState={review.state}
                      type="REVIEWER"
                    />
                  ))}
                {requestedReviewers.map(requestedReviewer => (
                  <UserBadge
                    key={requestedReviewer.login}
                    user={requestedReviewer}
                    type="REQUESTED_REVIEWER"
                  />
                ))}
              </AvatarGroup>
            </>
          ) : (
            <Typography
              variant="subtitle1"
              color={isDraft ? 'GrayText' : 'InfoText'}
            >
              {isDraft ? 'Draft pull request' : 'Review required'}
            </Typography>
          )}
        </Stack>
      </Grid>
    </>
  )
}
