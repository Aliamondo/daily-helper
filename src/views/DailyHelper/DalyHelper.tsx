import { SyntheticEvent, useEffect, useState } from 'react'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import PullRequest from './PullRequest'
import ReloadIcon from '@mui/icons-material/Replay'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { fetchPullRequests } from '../../helpers/dataFetcher'
import moment from 'moment'

const orgName = process.env.REACT_APP_ORG_NAME || 'ePages-de'
const teamNamesRaw = process.env.REACT_APP_TEAM_NAMES || 'team-black'
const teamNames = teamNamesRaw.split(',')
export const ICON_BUTTON_SIZE = 40

export default function DailyHelper() {
  const [shouldLoad, setShouldLoad] = useState(true)
  const [progress, setProgress] = useState(0)
  const [teamTabValue, setTeamTabValue] = useState(0)
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(
    generateDummyPullRequests(5),
  )
  const [isLoadingAnimationPlaying, setIsLoadingAnimationPlaying] =
    useState(true)

  useEffect(() => {
    if (shouldLoad) {
      fetchPullRequests(orgName, teamNames[teamTabValue], setProgress).then(
        pullRequests => {
          setPullRequests(pullRequests)
          setIsLoadingAnimationPlaying(false)
        },
      )
      setShouldLoad(false)
    }
  }, [shouldLoad, teamTabValue])

  const handleReload = () => {
    setProgress(0)
    setIsLoadingAnimationPlaying(true)
    if (pullRequests.length < 5) {
      pullRequests.push(...generateDummyPullRequests(5 - pullRequests.length))
    }
    setPullRequests(pullRequests.slice(0, 5))
    setShouldLoad(true)
  }

  const handleTabChange = (_e: SyntheticEvent, newValue: number) => {
    setTeamTabValue(newValue)
    handleReload()
  }

  return (
    <Box sx={{ mx: 'auto', width: '90%' }} maxWidth={1050}>
      <AppBar>
        <Toolbar sx={{ paddingBottom: isLoadingAnimationPlaying ? 0 : 0.5 }}>
          <Typography variant="h6" whiteSpace="nowrap" paddingRight={2}>
            Daily Helper
          </Typography>
          <Tabs
            variant="scrollable"
            value={teamTabValue}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
          >
            {teamNames.map((teamName, index) => (
              <Tab key={teamName} value={index} label={teamName} />
            ))}
          </Tabs>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Refresh pull requests">
            <IconButton
              edge="end"
              size="large"
              color="inherit"
              onClick={handleReload}
            >
              <ReloadIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        {isLoadingAnimationPlaying && (
          <LinearProgress variant="determinate" value={progress} />
        )}
      </AppBar>
      <Toolbar sx={{ paddingBottom: 2 }} />
      <Stack spacing={0.5}>
        {pullRequests.map(pr => (
          <PullRequest
            key={pr.id}
            orgName={orgName}
            isLoading={isLoadingAnimationPlaying}
            {...pr}
          />
        ))}
      </Stack>
    </Box>
  )
}

function generateDummyPullRequests(total: number): PullRequest[] {
  return Array(total)
    .fill(0)
    .map((_, index) => ({
      id: index.toString(),
      author: {
        login: '',
        avatarUrl: '',
      },
      title: '',
      number: 0,
      url: '',
      repositoryUrl: '',
      repositoryName: '',
      state: 'OPEN',
      isDraft: false,
      reviewDecision: 'REVIEW_REQUIRED',
      createdAt: moment().subtract(1, 'days').toDate(),
      labels: [],
      reviews: [],
      comments: 0,
      requestedReviewers: [],
      contributors: [],
      assignees: [],
      lastCommitChecks: {
        commitChecks: [],
        result: 'SUCCESS',
      },
    }))
}
