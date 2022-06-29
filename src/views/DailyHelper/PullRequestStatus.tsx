import AvatarGroup from '@mui/material/AvatarGroup'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UserBadge from '../../components/UserBadge'
import UserGroup from '../../components/UserGroup'
import moment from 'moment'
import { useRef } from 'react'

export default function PullRequestStatus({
  isLoading,
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
> & { isLoading: boolean }) {
  const authorRef = useRef<HTMLHeadingElement>(null)
  const skeletonHeight =
    authorRef.current?.offsetHeight && authorRef.current.offsetHeight - 16

  const createdAtFromNow = moment(createdAt).fromNow()

  return (
    <>
      <Grid item xs={2} ref={authorRef}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            height={skeletonHeight}
          >
            <AuthorColumn author={author} createdAtFromNow={createdAtFromNow} />
          </Skeleton>
        ) : (
          <AuthorColumn author={author} createdAtFromNow={createdAtFromNow} />
        )}
      </Grid>
      <Grid item xs={2}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            height={skeletonHeight}
          />
        ) : (
          <UserGroup
            users={contributors}
            groupName="Contributors"
            type="CONTRIBUTOR"
          />
        )}
      </Grid>
      <Grid item xs={2}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            height={skeletonHeight}
          />
        ) : (
          <UserGroup users={assignees} groupName="Assignees" type="ASSIGNEE" />
        )}
      </Grid>
      <Grid item xs={2}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            height={skeletonHeight}
          />
        ) : (
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
        )}
      </Grid>
    </>
  )
}

type AuthorColumnProps = {
  author: PullRequest['author']
  createdAtFromNow: string
}
function AuthorColumn({ author, createdAtFromNow }: AuthorColumnProps) {
  return (
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
  )
}
