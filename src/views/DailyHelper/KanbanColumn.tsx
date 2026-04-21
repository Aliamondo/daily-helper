import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import PullRequest from './PullRequest'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type KanbanColumnProps = {
  title: string
  pullRequests: PullRequest[]
  isLoading: boolean
  accentColor: string
}

export default function KanbanColumn({
  title,
  pullRequests,
  isLoading,
  accentColor,
}: KanbanColumnProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.default',
          py: 0.75,
          borderBottom: 2,
          borderColor: accentColor,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        <Chip
          label={pullRequests.length}
          size="small"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Stack>

      <Stack spacing={0.5}>
        {pullRequests.map(pr => (
          <PullRequest
            key={pr.id}
            isLoading={isLoading}
            variant="compact"
            {...pr}
          />
        ))}
        {!isLoading && pullRequests.length === 0 && (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ py: 2, textAlign: 'center' }}
          >
            No pull requests
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
