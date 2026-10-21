import { useContext, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { PrOverridesContext } from '../PrOverridesContext'
import { PriorityStar, getPriorityStar } from '../helpers/prOverrides'

const STAR_LABELS: Record<PriorityStar, string> = {
  high: 'Highest Priority',
  medium: 'Medium Priority',
  normal: 'Normal Priority',
  low: 'Low Priority',
}

const STAR_COLORS: Record<PriorityStar, string> = {
  high: 'error.main',
  medium: 'warning.main',
  normal: 'text.disabled',
  // Same grey as an empty note button, filled to tell it apart from normal
  low: 'text.disabled',
}

const STAR_OPTIONS = Object.keys(STAR_LABELS) as PriorityStar[]

function Star({ star, fontSize }: { star: PriorityStar; fontSize: number }) {
  const Icon = star === 'normal' ? StarBorderIcon : StarIcon
  return <Icon sx={{ fontSize, color: STAR_COLORS[star] }} />
}

type PriorityStarButtonProps = {
  prId: string
  size?: 'small' | 'medium'
}

export default function PriorityStarButton({
  prId,
  size = 'medium',
}: PriorityStarButtonProps) {
  const { overrides, automaticIds, setPriority } =
    useContext(PrOverridesContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const override = overrides[prId]
  const star = getPriorityStar(prId, automaticIds, overrides)
  const automaticStar = automaticIds.has(prId) ? 'high' : 'normal'

  const tooltip = `${STAR_LABELS[star]} (${override ? 'set by you' : 'automatic'})`

  const pick = (priority: PriorityStar | 'auto') => {
    setPriority(prId, priority)
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          onClick={e => setAnchorEl(e.currentTarget)}
          // A star's solid part sits low in its box, so it's lifted a little
          // to look centered on the PR number next to it
          sx={{
            p: 0.25,
            ml: 0.5,
            position: 'relative',
            top: size === 'small' ? -1 : -2,
          }}
        >
          <Star star={star} fontSize={size === 'small' ? 16 : 20} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem dense onClick={() => pick('auto')}>
          {/* Faded, since it's whatever the rules currently give */}
          <ListItemIcon sx={{ opacity: 0.5 }}>
            <Star star={automaticStar} fontSize={18} />
          </ListItemIcon>
          <ListItemText
            primary="Automatic"
            secondary={STAR_LABELS[automaticStar]}
          />
          {!override && <CheckIcon fontSize="small" sx={{ ml: 2 }} />}
        </MenuItem>
        <Divider />
        {STAR_OPTIONS.map(option => (
          <MenuItem key={option} dense onClick={() => pick(option)}>
            <ListItemIcon>
              <Star star={option} fontSize={18} />
            </ListItemIcon>
            <ListItemText>{STAR_LABELS[option]}</ListItemText>
            {override === option && (
              <CheckIcon fontSize="small" sx={{ ml: 2 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
