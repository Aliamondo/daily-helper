import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import type { JiraTicket } from '../helpers/jiraKeys'

type JiraLinksProps = {
  tickets: JiraTicket[]
  variant?: 'full' | 'compact'
}
export default function JiraLinks({
  tickets,
  variant = 'full',
}: JiraLinksProps) {
  if (!tickets.length) return null

  if (variant === 'full') {
    // Loose chips, like LabelGroup, so they wrap one at a time with the title
    return (
      <>
        {tickets.map(ticket => (
          <Chip
            key={ticket.key}
            component="a"
            href={ticket.url}
            target="_blank"
            rel="noopener"
            clickable
            size="small"
            variant="outlined"
            label={ticket.key}
            icon={<OpenInNewIcon fontSize="small" />}
            aria-label={`Open ${ticket.key} in Jira`}
            sx={{ marginLeft: 1, marginBottom: 0.5 }}
          />
        ))}
      </>
    )
  }

  const [first, ...rest] = tickets
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
      <Link
        href={first.url}
        target="_blank"
        rel="noopener"
        variant="caption"
        underline="hover"
        aria-label={`Open ${first.key} in Jira`}
      >
        {first.key}
      </Link>
      {!!rest.length && (
        <Tooltip
          disableInteractive={false}
          title={
            <Stack>
              {rest.map(ticket => (
                <Link
                  key={ticket.key}
                  href={ticket.url}
                  target="_blank"
                  rel="noopener"
                  color="inherit"
                  aria-label={`Open ${ticket.key} in Jira`}
                >
                  {ticket.key}
                </Link>
              ))}
            </Stack>
          }
        >
          <Chip size="small" label={`+${rest.length}`} sx={{ height: 18 }} />
        </Tooltip>
      )}
    </Stack>
  )
}
