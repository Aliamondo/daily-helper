import BoltIcon from '@mui/icons-material/Bolt'
import Tooltip from '@mui/material/Tooltip'
import { getDisplayName } from '../helpers/getDisplayName'

type AutoMergeIndicatorProps = {
  autoMerge: AutoMerge
  fontSize?: 'inherit' | 'small' | 'medium'
}
export default function AutoMergeIndicator({
  autoMerge,
  fontSize = 'small',
}: AutoMergeIndicatorProps) {
  const enabledBy = autoMerge.enabledBy
    ? ` by ${getDisplayName(autoMerge.enabledBy)}`
    : ''

  return (
    <Tooltip title={`Auto-merge enabled${enabledBy}`}>
      <BoltIcon
        color="secondary"
        fontSize={fontSize}
        sx={{ verticalAlign: 'middle', flexShrink: 0 }}
      />
    </Tooltip>
  )
}
