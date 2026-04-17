import { SyntheticEvent, useEffect, useState } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Checkbox from '@mui/material/Checkbox'
import Grid from '@mui/material/Grid'
import OrganizationIcon from '@mui/icons-material/CorporateFare'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { dataFetcher } from '../../helpers/dataFetcher'

type OrganizationSettingProps = {
  orgName: string | null
  teamNames: string[]
  handleOrgNameChange: (_e: SyntheticEvent, newValue: unknown) => void
  handleTeamNamesChange: (_e: SyntheticEvent, newValues: unknown[]) => void
  githubToken?: string
}
export default function OrganizationSetting({
  orgName,
  teamNames,
  handleOrgNameChange,
  handleTeamNamesChange,
  githubToken,
}: OrganizationSettingProps) {
  const [orgOptions, setOrgOptions] = useState<Organization[]>([])
  const [isOrgOpen, setIsOrgOpen] = useState(false)
  const [isOrgLoading, setIsOrgLoading] = useState(false)
  const [orgInputValue, setOrgInputValue] = useState(
    orgOptions.find(org => org.login === orgName) ||
      (orgName && { login: orgName, avatarUrl: '', name: orgName }) ||
      null,
  )

  const [teamOptions, setTeamOptions] = useState<Team[]>([])
  const [isTeamOpen, setIsTeamOpen] = useState(false)
  const [isTeamLoading, setIsTeamLoading] = useState(false)

  const teamsIntersection = teamOptions.filter(option =>
    teamNames.find(teamName => teamName === option.name),
  )
  const initialTeamsInputValue: Team[] = teamNames.map(
    teamName =>
      teamsIntersection.find(option => option.name === teamName) || {
        name: teamName,
        avatarUrl: '',
        description: null,
      },
  )

  const [teamsInputValue, setTeamsInputValue] = useState(initialTeamsInputValue)

  useEffect(() => {
    const getOrganizations = async () => {
      setIsOrgLoading(true)
      setOrgOptions(await dataFetcher.fetchOrganizations(githubToken))
      setIsOrgLoading(false)
    }

    const getTeams = async () => {
      if (orgName) {
        setIsTeamLoading(true)
        setTeamOptions(await dataFetcher.fetchTeams(orgName, githubToken))
        setIsTeamLoading(false)
      }
    }

    setOrgInputValue(
      orgOptions.find(org => org.login === orgName) ||
        (orgName && { login: orgName, avatarUrl: '', name: orgName }) ||
        null,
    )

    const tempTeamsIntersection = teamOptions.filter(option =>
      teamNames.find(teamName => teamName === option.name),
    )
    const tempTeamsInputValue: Team[] = teamNames.map(
      teamName =>
        tempTeamsIntersection.find(option => option.name === teamName) || {
          name: teamName,
          avatarUrl: '',
          description: null,
        },
    )
    setTeamsInputValue(tempTeamsInputValue)

    if (githubToken) {
      isOrgOpen && orgOptions.length === 0 && getOrganizations()
      isTeamOpen && orgName && teamOptions.length === 0 && getTeams()
    } else {
      orgOptions.length > 0 && setOrgOptions([])
      teamOptions.length > 0 && setTeamOptions([])
    }

    if (!orgName && teamOptions.length > 0) {
      setTeamOptions([])
    }
  }, [
    orgName,
    orgOptions,
    isOrgOpen,
    githubToken,
    isTeamOpen,
    teamOptions,
    teamNames,
  ])

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
            <OrganizationIcon sx={{ marginRight: 1 }} />
            Organization
          </Stack>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          id="organization-name"
          fullWidth
          value={orgInputValue}
          onChange={handleOrgNameChange}
          options={orgOptions}
          open={isOrgOpen}
          onOpen={() => setIsOrgOpen(true)}
          onClose={() => setIsOrgOpen(false)}
          loading={isOrgLoading}
          getOptionLabel={option => option.login}
          sx={{ marginBottom: 1 }}
          isOptionEqualToValue={(option, value) => option.login === value.login}
          renderOption={(props, option) => (
            <li {...props}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Avatar src={option.avatarUrl} />
                <Typography>{option.name}</Typography>
                <Typography color="text.secondary">({option.login})</Typography>
              </Stack>
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              id="orgName"
              label="Select organization"
              error={!orgName}
            />
          )}
        />
        <Autocomplete
          id="team-names"
          fullWidth
          multiple
          disableCloseOnSelect
          value={teamsInputValue}
          onChange={handleTeamNamesChange}
          options={teamOptions}
          open={isTeamOpen}
          onOpen={() => setIsTeamOpen(true)}
          onClose={() => setIsTeamOpen(false)}
          loading={isTeamLoading}
          getOptionLabel={option => option.name}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox checked={selected} sx={{ marginRight: 1 }} />
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                overflow="hidden"
              >
                <Avatar src={option.avatarUrl} />
                <Typography>{option.name}</Typography>
                {option.description && (
                  <Typography color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </Stack>
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              id="teamName"
              label="Select teams"
              error={teamNames.length === 0}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}
