import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type StatusBannerProps = {
  severity: 'error' | 'warning'
  icon: ReactNode
  title: string
  description: ReactNode
  action?: {
    label: string
    icon?: ReactNode
    onClick: VoidFunction
  }
  /** Single line, for problems that don't block the board */
  compact?: boolean
}

export default function StatusBanner({
  severity,
  icon,
  title,
  description,
  action,
  compact = false,
}: StatusBannerProps) {
  return (
    <Paper
      variant="outlined"
      role={severity === 'error' ? 'alert' : 'status'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 1.25 : 1.75,
        px: compact ? 1.5 : 2,
        py: compact ? 1 : 1.75,
        borderLeft: 3,
        borderLeftColor: `${severity}.main`,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      {compact ? (
        <Box sx={{ display: 'flex', color: `${severity}.main` }}>{icon}</Box>
      ) : (
        <Box
          sx={theme => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
            width: 36,
            height: 36,
            borderRadius: '50%',
            color: `${severity}.main`,
            backgroundColor: alpha(theme.palette[severity].main, 0.12),
          })}
        >
          {icon}
        </Box>
      )}

      {compact ? (
        <Typography variant="body2">
          <Box component="span" fontWeight={500}>
            {title}
          </Box>{' '}
          <Box component="span" color="text.secondary">
            {description}
          </Box>
        </Typography>
      ) : (
        <Box>
          <Typography variant="subtitle1" fontWeight={500} lineHeight={1.4}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      )}

      {action && (
        <Button
          variant={compact ? 'text' : 'outlined'}
          color="inherit"
          size="small"
          startIcon={action.icon}
          onClick={action.onClick}
          sx={{ ml: 'auto', flex: 'none', whiteSpace: 'nowrap' }}
        >
          {action.label}
        </Button>
      )}
    </Paper>
  )
}
