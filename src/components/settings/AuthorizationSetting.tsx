import { ChangeEventHandler, useState } from 'react'

import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import KeyIcon from '@mui/icons-material/Key'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

type AuthorizationSettingProps = {
  githubToken: string
  handleGithubTokenChange: ChangeEventHandler<HTMLInputElement>
}
export default function AuthorizationSetting({
  githubToken,
  handleGithubTokenChange,
}: AuthorizationSettingProps) {
  const [showToken, setShowToken] = useState(false)

  return (
    <Grid
      container
      item
      xs={12}
      justifyContent="space-between"
      rowGap={2}
      sx={{ marginBottom: 2 }}
    >
      <Grid item xs={12}>
        <Typography component="div">
          <Stack direction="row" alignItems="center" sx={{ fontWeight: 800 }}>
            <KeyIcon sx={{ marginRight: 1 }} />
            Authorization (
            <Link
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener"
            >
              link
            </Link>
            )
          </Stack>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="github-token"
          label="Github token"
          type={showToken ? 'text' : 'password'}
          error={!githubToken}
          autoComplete="off"
          helperText={'Must include scopes "repo" and "read:org"'}
          fullWidth
          value={githubToken}
          onChange={handleGithubTokenChange}
          InputProps={{
            endAdornment: githubToken ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowToken(v => !v)}
                  edge="end"
                  size="small"
                >
                  {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </Grid>
    </Grid>
  )
}
