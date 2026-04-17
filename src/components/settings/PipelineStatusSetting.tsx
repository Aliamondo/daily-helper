import { ChangeEvent } from 'react'

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import PipelineIcon from '@mui/icons-material/AccountTree'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type PipelineStatusSettingProps = {
  loadPipelineStatus: boolean
  setLoadPipelineStatus: (value: boolean) => void
}
export default function PipelineStatusSetting({
  loadPipelineStatus,
  setLoadPipelineStatus,
}: PipelineStatusSettingProps) {
  return (
    <Grid container item xs={12} sx={{ marginBottom: 2 }}>
      <Grid item xs={12}>
        <FormControlLabel
          labelPlacement="start"
          sx={{ width: '100%', justifyContent: 'space-between', ml: 0 }}
          label={
            <Stack direction="row" alignItems="center">
              <PipelineIcon sx={{ marginRight: 1 }} />
              <Typography sx={{ fontWeight: 800 }}>
                Load pipeline status for PRs
              </Typography>
            </Stack>
          }
          control={
            <Checkbox
              checked={loadPipelineStatus}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLoadPipelineStatus(e.target.checked)
              }
            />
          }
        />
      </Grid>
    </Grid>
  )
}
