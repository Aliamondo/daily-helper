import { RefObject, createRef, useEffect, useState } from 'react'

import AppBar from '../../components/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import Label from '../../components/Label'
import PullRequest from './PullRequest'
import Slide from '@mui/material/Slide'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { fetchPullRequests } from '../../helpers/dataFetcher'
import moment from 'moment'

const orgName = process.env.REACT_APP_ORG_NAME || 'ePages-de'
const teamNamesRaw = process.env.REACT_APP_TEAM_NAMES || 'team-black'
const teamNames = teamNamesRaw.split(',')
export const ICON_BUTTON_SIZE = 40

export default function DailyHelper() {
  const [teamName, setTeamName] = useState(teamNames[0])
  const [shouldLoad, setShouldLoad] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(
    generateDummyPullRequests(5),
  )
  const [isLoadingAnimationPlaying, setIsLoadingAnimationPlaying] =
    useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hiddenLabels, setHiddenLabels] = useState(new Set<string>())
  const [pullRequestRefs, setPullRequestRefs] = useState<
    RefObject<HTMLElement>[]
  >([])
  const [isPullRequestInViewport, setIsPullRequestInViewport] = useState<
    Map<string, boolean>
  >(new Map())

  useEffect(() => {
    if (shouldLoad) {
      fetchPullRequests(orgName, teamName, setLoadingProgress).then(
        pullRequests => {
          setPullRequests(pullRequests)
          setIsLoadingAnimationPlaying(false)
          setPullRequestRefs(
            Array(pullRequests.length)
              .fill(null)
              .map((_, index) => pullRequestRefs[index] || createRef()),
          )
        },
      )
      setShouldLoad(false)
    }
    setPullRequestRefs(pullRequestRefs)
  }, [shouldLoad, teamName, pullRequestRefs])

  const setPullRequestInViewport = (
    pullRequestId: string,
    isVisible: boolean,
  ) => {
    if (isVisible) {
      isPullRequestInViewport.set(pullRequestId, true)
    } else {
      isPullRequestInViewport.delete(pullRequestId)
    }
    setIsPullRequestInViewport(isPullRequestInViewport)
  }

  const allLabels = new Map<string, Label>()
  pullRequests.map(pr =>
    pr.labels.forEach(label =>
      allLabels.set(label.name, {
        ...label,
        description: '',
      }),
    ),
  )

  const handleReload = (newTeamName: string) => {
    if (newTeamName !== teamName) {
      setHiddenLabels(new Set())
    }
    setTeamName(newTeamName)
    setLoadingProgress(0)
    setIsLoadingAnimationPlaying(true)
    setPullRequests(generateDummyPullRequests(isPullRequestInViewport.size + 1))
    setPullRequestRefs([])
    setIsPullRequestInViewport(new Map())
    setShouldLoad(true)
  }

  const getVisibility = (pr: PullRequest): boolean =>
    !pr.labels
      .map(label => label.name)
      .some(labelName => hiddenLabels.has(labelName))

  const showDrawer = (marginTopRaw?: number) => {
    const marginTop = marginTopRaw || 0
    return (
      <Drawer
        open={isSettingsOpen}
        variant="persistent"
        anchor="right"
        PaperProps={{
          sx: {
            marginTop: `${marginTop}px`,
            width: '40%',
            bgcolor: 'rgb(244,244,247)',
          },
        }}
      >
        <Typography textAlign="center" variant="h6" padding={2}>
          Labels
        </Typography>
        <Grid container rowSpacing={1} paddingLeft={1}>
          {Array.from(allLabels.values()).map(label => (
            <Grid item key={label.id} xs="auto">
              <Label
                label={label}
                onClick={() => {
                  if (hiddenLabels.has(label.name)) {
                    hiddenLabels.delete(label.name)
                  } else {
                    hiddenLabels.add(label.name)
                  }
                  setHiddenLabels(new Set(hiddenLabels))
                }}
                isCrossedOut={hiddenLabels.has(label.name)}
              />
            </Grid>
          ))}
        </Grid>
      </Drawer>
    )
  }

  return (
    <Box sx={{ mx: 'auto' }} maxWidth={1050}>
      <AppBar
        teamNames={teamNames}
        loadingProgress={loadingProgress}
        isLoadingAnimationPlaying={isLoadingAnimationPlaying}
        handleReload={handleReload}
        showSettings={showDrawer}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      <Stack spacing={0.5}>
        {pullRequests.map((pr, index) => (
          <Slide
            key={pr.id}
            direction="up"
            in={getVisibility(pr)}
            timeout={400}
            mountOnEnter
            unmountOnExit
            appear={false}
            enter={isPullRequestInViewport.has(pr.id)}
            exit={false} // disable exit transitions as they lag when multiple are played at once
          >
            <Box ref={pullRequestRefs[index]}>
              <PullRequest
                customRef={pullRequestRefs[index]}
                setIsInViewport={setPullRequestInViewport}
                orgName={orgName}
                isLoading={isLoadingAnimationPlaying}
                {...pr}
              />
            </Box>
          </Slide>
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
