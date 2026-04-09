import UserGroup, { AvatarGroupPopper } from '../../components/UserGroup'
import { useRef, useState } from 'react'

import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UserBadge from '../../components/UserBadge'
import { fromNow } from '../../helpers/time'

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

  const createdAtFromNow = fromNow(createdAt)

  return (
    <>
      <Grid item xs={2.5} ref={authorRef} sx={{ userSelect: 'none' }}>
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
      <Grid item xs={2.5} sx={{ userSelect: 'none' }}>
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
      <Grid item xs={2.5} sx={{ userSelect: 'none' }}>
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
      <Grid item xs={2.5} sx={{ userSelect: 'none' }}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            height={skeletonHeight}
          />
        ) : (
          <ReviewersColumn
            reviews={reviews}
            requestedReviewers={requestedReviewers}
            isDraft={isDraft}
          />
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
      <Typography variant="overline" align="center" sx={{ userSelect: 'none' }}>
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

function ReviewersColumn({
  reviews,
  requestedReviewers,
  isDraft,
}: Pick<PullRequest, 'reviews' | 'requestedReviewers' | 'isDraft'>) {
  const [isOpen, setIsOpen] = useState(false)
  const container = useRef(null)
  const main = useRef<HTMLHeadingElement>(null)

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const showUsers = () => {
    return [
      reviews
        .filter(({ state }) => state !== 'DISMISSED') // Hide dismissed and stale reviews
        .map(review => (
          <UserBadge
            key={`reviewer-${review.reviewer.login}`}
            user={review.reviewer}
            reviewState={review.state}
            type="REVIEWER"
          />
        )),
      requestedReviewers.map(requestedReviewer => (
        <UserBadge
          key={`requestedReviewer-${requestedReviewer.login}`}
          user={requestedReviewer}
          type="REQUESTED_REVIEWER"
        />
      )),
    ].flat()
  }

  return (
    <Stack direction="column" alignItems="center">
      <Typography variant="overline" sx={{ userSelect: 'none' }}>
        Reviewers
      </Typography>
      {reviews.length || requestedReviewers.length ? (
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
