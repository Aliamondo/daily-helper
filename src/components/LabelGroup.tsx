import { useRef, useState } from 'react'

import Chip from '@mui/material/Chip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Label from './Label'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'

type LabelGroupProps = {
  labels: Label[]
  max?: number
}
export default function LabelGroup({ labels, max = 2 }: LabelGroupProps) {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const overflowRef = useRef<HTMLDivElement>(null)

  if (!labels.length) return null

  const visible = labels.slice(0, max)
  const hidden = labels.slice(max)

  // No wrapper element on purpose: an inline-flex box is an atomic inline and
  // cannot be split across lines, so a wrapper would send every chip to the next
  // line together. Returned loose, each chip is its own inline box and they break
  // one at a time, the way bare chips used to
  return (
    <>
      {visible.map(label => (
        <Label key={label.id} label={label} />
      ))}
      {!!hidden.length && (
        <>
          <Chip
            ref={overflowRef}
            size="small"
            label={`+${hidden.length}`}
            onClick={() => setIsOpen(open => !open)}
            sx={{ marginLeft: 1, cursor: 'pointer', flexShrink: 0 }}
          />
          {isOpen && (
            <ClickAwayListener
              onClickAway={() => setIsOpen(false)}
              touchEvent={false}
            >
              <Popper
                open
                anchorEl={overflowRef.current}
                placement="bottom-end"
                sx={{ zIndex: 2 }}
              >
                <Paper
                  elevation={20}
                  sx={{
                    maxWidth: 400,
                    p: 1,
                    backgroundColor: theme.palette.prCard.popup,
                  }}
                >
                  <Stack
                    direction="row"
                    useFlexGap
                    sx={{ flexWrap: 'wrap', rowGap: 1 }}
                  >
                    {hidden.map(label => (
                      <Label key={label.id} label={label} />
                    ))}
                  </Stack>
                </Paper>
              </Popper>
            </ClickAwayListener>
          )}
        </>
      )}
    </>
  )
}
