import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// A one-line change is nearly always +1 -1, so the smallest diff still needs two
// squares - with a single one there is nowhere for the ratio to show
const MIN_SQUARES = 2
const MAX_SQUARES = 10
// Changed-line ceiling per square, give or take doubling at every step. One entry
// per count from MIN_SQUARES upwards, anything past the last one is MAX_SQUARES
const SQUARE_THRESHOLDS = [2, 10, 25, 50, 100, 250, 500, 1000]

const BUCKET_THRESHOLDS = [10, 50, 200, 800]
const BUCKET_LABELS = ['XS', 'S', 'M', 'L', 'XL']

/** Zero-based bucket, so it can drive a visual scale as well as the label */
export function getDiffSizeBucketIndex(
  additions: number,
  deletions: number,
): number {
  const changedLines = additions + deletions
  const bucket = BUCKET_THRESHOLDS.findIndex(
    threshold => changedLines <= threshold,
  )
  return bucket === -1 ? BUCKET_LABELS.length - 1 : bucket
}

export function getDiffSizeLabel(additions: number, deletions: number): string {
  return BUCKET_LABELS[getDiffSizeBucketIndex(additions, deletions)]
}

/**
 * How many squares the row is long. Length is what makes the size of a diff
 * readable at a glance, so it carries the magnitude - the green/red split within
 * that length carries the additions/deletions ratio
 */
export function getSquareCount(additions: number, deletions: number): number {
  const changedLines = additions + deletions
  if (changedLines === 0) return 0

  const step = SQUARE_THRESHOLDS.findIndex(
    threshold => changedLines <= threshold,
  )
  return step === -1 ? MAX_SQUARES : MIN_SQUARES + step
}

export function getDiffSizeSquares(
  additions: number,
  deletions: number,
): { additionSquares: number; deletionSquares: number } {
  const changedLines = additions + deletions
  const squareCount = getSquareCount(additions, deletions)
  if (squareCount === 0) return { additionSquares: 0, deletionSquares: 0 }

  let additionSquares = Math.round((additions / changedLines) * squareCount)

  // Never round a side that has lines in it away completely
  if (additionSquares === 0 && additions > 0) additionSquares = 1
  if (additionSquares === squareCount && deletions > 0)
    additionSquares = squareCount - 1

  return { additionSquares, deletionSquares: squareCount - additionSquares }
}

type DiffSizeProps = {
  additions: number
  deletions: number
  changedFiles: number
  showNumbers?: boolean
}
export default function DiffSize({
  additions,
  deletions,
  changedFiles,
  showNumbers = true,
}: DiffSizeProps) {
  const { additionSquares, deletionSquares } = getDiffSizeSquares(
    additions,
    deletions,
  )
  const files = `${changedFiles} ${changedFiles === 1 ? 'file' : 'files'}`

  const content = (
    <Stack
      component="span"
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{ display: 'inline-flex', verticalAlign: 'middle' }}
    >
      <Stack
        component="span"
        direction="row"
        spacing={0.25}
        sx={{ display: 'inline-flex' }}
      >
        {Array.from(
          { length: additionSquares + deletionSquares },
          (_, index) => (
            <Box
              key={index}
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '1px',
                bgcolor:
                  index < additionSquares ? 'success.main' : 'error.main',
              }}
            />
          ),
        )}
      </Stack>
      {showNumbers && (
        <Typography
          component="span"
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap' }}
        >
          +{additions} −{deletions} · {files}
        </Typography>
      )}
    </Stack>
  )

  // Only worth a tooltip where the numbers are not already spelled out inline
  if (showNumbers) return content

  return (
    <Tooltip title={`+${additions} −${deletions} · ${files}`}>
      {content}
    </Tooltip>
  )
}
