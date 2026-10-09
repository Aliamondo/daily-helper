import { ReactNode, forwardRef } from 'react'

import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { getFontColor, hexToRgb } from '../helpers/core'

type LabelProps = {
  label: Pick<Label, 'color' | 'description'> & {
    name: Label['name'] | ReactNode
  }
  onClick?: VoidFunction
  isGreyedOut?: boolean
}

const Label = forwardRef<HTMLDivElement, LabelProps>(
  ({ label, onClick, isGreyedOut, ...props }: LabelProps, ref) => {
    const rgbColor = hexToRgb(label.color)
    const rgbColorString = `${rgbColor.r * 255}, ${rgbColor.g * 255}, ${
      rgbColor.b * 255
    }`
    return (
      <Chip
        ref={ref}
        label={label.name}
        size="small"
        sx={{
          backgroundColor: `rgb(${rgbColorString}, ${isGreyedOut ? 0.3 : 1})`,
          color: getFontColor(label.color),
          marginLeft: 1,
          ':hover': onClick && {
            border: `ButtonHighlight 0.25em solid`,
            padding: 0.75,
            backgroundColor: `rgb(${rgbColorString}, 0.7)`,
            color: getFontColor(label.color),
          },
        }}
        onClick={onClick}
        {...props}
      />
    )
  },
)

function LabelWithTooltip({ label, ...props }: LabelProps) {
  const labelComponent = <Label label={label} {...props} />

  if (label.description)
    return <Tooltip title={label.description}>{labelComponent}</Tooltip>

  return labelComponent
}

export default LabelWithTooltip
