import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { forwardRef } from 'react'

function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b
  })

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : {
        r: 0,
        g: 0,
        b: 0,
      }
}

function getFontColor(backgroundColor: string): string {
  const { r, g, b } = hexToRgb(backgroundColor)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.5 ? 'black' : 'white'
}

type LabelProps = {
  label: Label
  onClick?: VoidFunction
  isCrossedOut?: boolean
}

const Label = forwardRef<HTMLDivElement, LabelProps>(
  ({ label, onClick, isCrossedOut, ...props }: LabelProps, ref) => {
    const rgbColor = hexToRgb(label.color)
    const rgbColorString = `${rgbColor.r * 255}, ${rgbColor.g * 255}, ${
      rgbColor.b * 255
    }`
    return (
      <Chip
        ref={ref}
        label={isCrossedOut ? <s>{label.name}</s> : label.name}
        sx={{
          bgcolor: `rgb(${rgbColorString}, ${isCrossedOut ? 0.3 : 1})`,
          color: getFontColor(label.color),
          padding: 1,
          marginLeft: 1,
          ':hover': onClick && {
            border: `ButtonHighlight 2px solid`,
            padding: 0.75,
            bgcolor: `rgb(${rgbColorString}, 0.7)`,
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
