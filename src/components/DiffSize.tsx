import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { getDiffSizeSquares } from '../helpers/diffSize'

// The gap grows with the squares so the row stays proportioned at either size
const SQUARE_DIMENSIONS = {
  small: { size: 6, gap: 0.25 },
  medium: { size: 10, gap: 0.25 },
}

type DiffSizeProps = {
  additions: number
  deletions: number
  changedFiles: number
  showNumbers?: boolean
  size?: 'small' | 'medium'
}
export default function DiffSize({
  additions,
  deletions,
  changedFiles,
  showNumbers = true,
  size = 'medium',
}: DiffSizeProps) {
  const { size: squareSize, gap } = SQUARE_DIMENSIONS[size]
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
      sx={{
        display: 'inline-flex',
        verticalAlign: showNumbers ? 'baseline' : 'middle',
      }}
    >
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
      <Stack
        component="span"
        direction="row"
        spacing={gap}
        sx={{ display: 'inline-flex' }}
      >
        {Array.from(
          { length: additionSquares + deletionSquares },
          (_, index) => (
            <Box
              key={index}
              component="span"
              sx={{
                width: squareSize,
                height: squareSize,
                borderRadius: '1px',
                backgroundColor:
                  index < additionSquares ? 'success.main' : 'error.main',
              }}
            />
          ),
        )}
      </Stack>
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
