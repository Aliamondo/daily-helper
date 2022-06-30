import Avatar from '@mui/material/Avatar'
import ClosedPullRequestIcon from '@mui/icons-material/RemoveRoad'
import OpenPullRequestIcon from '@mui/icons-material/Merge'
import { ReactElement } from 'react'
import Tooltip from '@mui/material/Tooltip'

type FinalPullRequestState = 'OPEN' | 'MERGED' | 'CLOSED' | 'DRAFT'
const styles: Record<
  FinalPullRequestState,
  {
    bgColor: string
    icon: ReactElement
    tooltip: string
  }
> = {
  MERGED: {
    bgColor: '#8250df',
    icon: <ClosedPullRequestIcon />,
    tooltip: 'Merged pull request',
  },
  OPEN: {
    bgColor: 'green',
    icon: <OpenPullRequestIcon />,
    tooltip: 'Open pull request',
  },
  CLOSED: {
    bgColor: 'red',
    icon: <ClosedPullRequestIcon />,
    tooltip: 'Closed pull request',
  },
  DRAFT: {
    bgColor: 'gray',
    icon: <OpenPullRequestIcon />,
    tooltip: 'Draft pull request',
  },
}

export default function PullRequestStateIcon({
  state,
  isDraft,
}: Pick<PullRequest, 'state' | 'isDraft'>) {
  const finalState = isDraft && state === 'OPEN' ? 'DRAFT' : state

  return (
    <Tooltip title={styles[finalState].tooltip}>
      <Avatar sx={{ bgcolor: styles[finalState].bgColor }}>
        {styles[finalState].icon}
      </Avatar>
    </Tooltip>
  )
}
