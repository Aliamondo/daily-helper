import { ChipListEditor } from './FiltersSetting'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

type JiraSettingProps = {
  jira: Settings_Jira
  setJira: (jira: Settings_Jira) => void
}
export default function JiraSetting({ jira, setJira }: JiraSettingProps) {
  return (
    <Grid container rowGap={4}>
      <Grid container item xs={12} rowGap={1}>
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 800 }}>Jira URL</Typography>
          <Typography variant="caption" color="text.secondary">
            Ticket keys found in a PR link to this Jira instance.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            size="small"
            fullWidth
            label="Jira URL"
            placeholder="https://your-company.atlassian.net"
            value={jira.baseUrl}
            onChange={e => setJira({ ...jira, baseUrl: e.target.value })}
          />
        </Grid>
      </Grid>
      <ChipListEditor
        label="Project keys"
        description="Look for tickets of these projects in PR titles and branch names, e.g. CGY finds CGY-123, cgy_123 or CGY/123."
        items={jira.projectKeys}
        onChange={projectKeys =>
          setJira({
            ...jira,
            projectKeys: [...new Set(projectKeys.map(k => k.toUpperCase()))],
          })
        }
      />
    </Grid>
  )
}
