import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { keyframes, useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import type { MergeBlocker } from '../helpers/getMergeBlocker'
import { getDisplayName } from '../helpers/getDisplayName'

// The visible lines are thin, so a lone line sits in a wider transparent strip
// that catches the hover. Two lines split that strip between them
const HIT_AREA = 12
const LINE_WIDTH = 5
const STRIPE = 14

const marching = keyframes`
  to { background-position: 0 ${STRIPE * 4}px; }
`

type PrCardEdgesProps = {
  blocker: MergeBlocker | null
  autoMerge: AutoMerge | null
  // Only the list view animates: a kanban board shows too many cards at once
  animateAutoMerge?: boolean
}

/**
 * Renders the card's status lines along its left edge: the outer one for
 * whatever blocks the merge (red for conflicts, amber for anything else), and
 * next to it a purple one for auto-merge. Vertical lines run the full height
 * of their own card, so they can't be mistaken for the neighbouring card's.
 * The parent card must be `position: relative` and clip its overflow
 */
export default function PrCardEdges({
  blocker,
  autoMerge,
  animateAutoMerge = false,
}: PrCardEdgesProps) {
  const theme = useTheme()

  const autoMergeTitle = autoMerge?.enabledBy
    ? `Auto-merge enabled by ${getDisplayName(autoMerge.enabledBy)}`
    : 'Auto-merge enabled'
  const { autoMerge: main, autoMergeStripe: stripe } = theme.palette.prCard

  return (
    <>
      {blocker && (
        <Edge
          testId="merge-blocker-edge"
          title={
            blocker.reasons.length === 1 ? (
              blocker.reasons[0]
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {blocker.reasons.map(reason => (
                  <li key={reason}>{reason}</li>
                ))}
              </Box>
            )
          }
          left={0}
          width={autoMerge ? LINE_WIDTH : HIT_AREA}
          lineSx={{
            backgroundColor:
              blocker.severity === 'conflict'
                ? theme.palette.error.main
                : theme.palette.warning.main,
          }}
        />
      )}
      {autoMerge && (
        <Edge
          testId="auto-merge-edge"
          title={autoMergeTitle}
          left={blocker ? LINE_WIDTH : 0}
          width={blocker ? HIT_AREA - LINE_WIDTH : HIT_AREA}
          lineSx={
            animateAutoMerge
              ? {
                  background: `repeating-linear-gradient(180deg, ${main} 0 ${STRIPE}px, ${stripe} ${STRIPE}px ${STRIPE * 2}px)`,
                  animation: `${marching} 1.2s linear infinite`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                  },
                }
              : { backgroundColor: main }
          }
        />
      )}
    </>
  )
}

type EdgeProps = {
  testId: string
  title: ReactNode
  // the hover strip; the visible line is drawn at its left side
  left: number
  width: number
  lineSx: object
}

function Edge({ testId, title, left, width, lineSx }: EdgeProps) {
  return (
    <Tooltip title={title} followCursor>
      <Box
        data-testid={testId}
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left,
          width,
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: LINE_WIDTH,
            ...lineSx,
          },
        }}
      />
    </Tooltip>
  )
}
