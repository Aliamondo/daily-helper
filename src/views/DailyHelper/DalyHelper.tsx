import { RefObject, createRef, useEffect, useRef, useState } from 'react'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import AppBar from '../../components/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import InvisibleIcon from '@mui/icons-material/VisibilityOff'
import Label from '../../components/Label'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import PullRequest from './PullRequest'
import SettingsIcon from '@mui/icons-material/Settings'
import Slide from '@mui/material/Slide'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import VisibleIcon from '@mui/icons-material/Visibility'
import { dataFetcher } from '../../helpers/dataFetcher'
import moment from 'moment'
import { settingsHandler } from '../../helpers/settingsHandler'

const orgName = process.env.REACT_APP_ORG_NAME || 'ePages-de'
const teamNamesRaw = process.env.REACT_APP_TEAM_NAMES || 'team-black'
const teamNames = teamNamesRaw.split(',')
export const ICON_BUTTON_SIZE = 40

type LabelWithCount = Label & {
  count: number
}

export default function DailyHelper() {
  const [isInvalidToken, setIsInvalidToken] = useState(
    settingsHandler.loadGithubToken() === '',
  )
  const [teamName, setTeamName] = useState(teamNames[0])
  const [shouldLoad, setShouldLoad] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(
    generateDummyPullRequests(5),
  )
  const [isLoadingAnimationPlaying, setIsLoadingAnimationPlaying] = useState(
    true && !isInvalidToken,
  )
  const [isDrawbarOpen, setIsDrawbarOpen] = useState(false)
  const [
    isPullRequestsWithoutLabelsHidden,
    setIsPullRequestsWithoutLabelsHidden,
  ] = useState(false)
  const [hiddenLabels, setHiddenLabels] = useState(new Set<string>()) // always keep them lowercase
  const [pullRequestRefs, setPullRequestRefs] = useState<
    RefObject<HTMLElement>[]
  >([])
  const [isPullRequestInViewport, setIsPullRequestInViewport] = useState<
    Map<string, boolean>
  >(new Map())

  const main = useRef(null)

  const handleInvalidTokenError = () => {
    setIsInvalidToken(true)
  }

  useEffect(() => {
    if (isInvalidToken) {
      setIsInvalidToken(settingsHandler.loadGithubToken() === '')
    }

    if (!isInvalidToken && shouldLoad) {
      dataFetcher
        .fetchPullRequests({
          orgName,
          teamName,
          setProgress: setLoadingProgress,
          handleInvalidTokenError,
        })
        .then(pullRequests => {
          setPullRequests(pullRequests)
          setIsLoadingAnimationPlaying(false)
          setPullRequestRefs(
            Array(pullRequests.length)
              .fill(null)
              .map((_, index) => pullRequestRefs[index] || createRef()),
          )
        })
      setShouldLoad(false)
    }

    !isInvalidToken && setPullRequestRefs(pullRequestRefs)
  }, [shouldLoad, teamName, pullRequestRefs, isInvalidToken])

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

  const allLabels = new Map<string, LabelWithCount>()
  const pullRequestsWithLabels = pullRequests.filter(pr => pr.labels.length)
  const pullRequestsWithoutLabelsCount =
    pullRequests.length - pullRequestsWithLabels.length
  pullRequestsWithLabels.forEach(pr =>
    pr.labels.forEach(label => {
      const name = label.name.toLocaleLowerCase()
      const count = allLabels.get(name)?.count || 0
      const color = allLabels.get(name)?.color
      allLabels.set(name, {
        ...label,
        color: color || label.color,
        description: '',
        count: count + 1,
      })
    }),
  )

  const handleReload = (newTeamName: string, isValidToken: boolean) => {
    if (newTeamName !== teamName) {
      setIsPullRequestsWithoutLabelsHidden(false)
      setHiddenLabels(new Set())
    }
    setTeamName(newTeamName)
    setLoadingProgress(0)
    isValidToken && setIsLoadingAnimationPlaying(true)
    setPullRequests(generateDummyPullRequests(isPullRequestInViewport.size))
    setPullRequestRefs([])
    setIsPullRequestInViewport(new Map())
    setShouldLoad(true)
  }

  const handleLabelClick = (labelNameRaw: string) => {
    const labelName = labelNameRaw.toLocaleLowerCase()

    if (hiddenLabels.has(labelName)) {
      hiddenLabels.delete(labelName)
    } else {
      hiddenLabels.add(labelName)
    }
    setHiddenLabels(new Set(hiddenLabels))
  }

  const handlePullRequestsWithoutLabelsClick = () =>
    setIsPullRequestsWithoutLabelsHidden(!isPullRequestsWithoutLabelsHidden)

  const resetFilters = () => {
    setIsPullRequestsWithoutLabelsHidden(false)
    setHiddenLabels(new Set())
  }

  const getVisibility = (labels: Label[]): boolean => {
    if (!labels.length) return !isPullRequestsWithoutLabelsHidden
    return !labels
      .map(label => label.name.toLocaleLowerCase())
      .every(labelName => hiddenLabels.has(labelName))
  }

  return (
    <Box ref={main} sx={{ mx: 'auto' }} maxWidth={1150}>
      <AppBar
        teamNames={teamNames}
        orgName={orgName}
        loadingProgress={loadingProgress}
        isLoadingAnimationPlaying={isLoadingAnimationPlaying}
        handleReload={handleReload}
        showDrawbar={getDrawer({
          allLabels,
          handleLabelClick,
          handlePullRequestsWithoutLabelsClick,
          hiddenLabels,
          isPullRequestsWithoutLabelsHidden,
          isDrawbarOpen,
          pullRequestsWithoutLabelsCount,
          resetFilters,
        })}
        drawbarName="Search filters"
        isDrawbarOpen={isDrawbarOpen}
        setIsDrawbarOpen={setIsDrawbarOpen}
      />
      {isInvalidToken ? (
        <Alert severity="error">
          <AlertTitle>Authorization error</AlertTitle>
          <Typography display="flex" variant="h6" alignItems="center">
            Github token is not provided or is invalid. Please edit it in the
            <SettingsIcon fontSize="medium" sx={{ marginLeft: 0.5 }} />
            Settings
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={0.5}>
          {pullRequests.map((pr, index) => (
            <Slide
              key={pr.id}
              direction="up"
              in={getVisibility(pr.labels)}
              timeout={400}
              mountOnEnter
              unmountOnExit
              appear={false}
              container={main.current}
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
      )}
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
      baseRef: 'master',
      repositoryBaseRef: 'master',
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

type DrawerComponentProps = {
  isDrawbarOpen: boolean
  allLabels: Map<string, LabelWithCount>
  hiddenLabels: Set<string>
  handleLabelClick: (labelName: string) => void
  isPullRequestsWithoutLabelsHidden: boolean
  pullRequestsWithoutLabelsCount: number
  handlePullRequestsWithoutLabelsClick: VoidFunction
  resetFilters: VoidFunction
}
function getDrawer({
  isDrawbarOpen,
  ...drawerContentsProps
}: DrawerComponentProps) {
  return (marginTopRaw?: number) => {
    const marginTop = marginTopRaw || 0

    return (
      <>
        <Drawer
          open={isDrawbarOpen}
          variant="persistent"
          anchor="right"
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          PaperProps={{
            sx: {
              marginTop: `${marginTop}px`,
              minWidth: '85%',
              display: { xs: 'block', sm: 'none' }, // show only on mobile
              bgcolor: 'rgb(244, 244, 247)',
            },
          }}
        >
          <DrawerContents {...drawerContentsProps} />
        </Drawer>
        <Drawer
          open={isDrawbarOpen}
          variant="persistent"
          anchor="right"
          PaperProps={{
            sx: {
              marginTop: `${marginTop}px`,
              minWidth: '35%',
              display: { xs: 'none', sm: 'block' }, // show on larger screens
              bgcolor: 'rgb(244, 244, 247)',
            },
          }}
        >
          <DrawerContents {...drawerContentsProps} />
        </Drawer>
      </>
    )
  }
}

type DrawerContentsProps = Omit<DrawerComponentProps, 'isDrawbarOpen'>
function DrawerContents({
  allLabels,
  hiddenLabels,
  handleLabelClick,
  isPullRequestsWithoutLabelsHidden,
  pullRequestsWithoutLabelsCount,
  handlePullRequestsWithoutLabelsClick,
  resetFilters,
}: DrawerContentsProps) {
  const areFiltersEnabled =
    hiddenLabels.size || isPullRequestsWithoutLabelsHidden

  return (
    <List
      subheader={
        <ListSubheader color="primary" sx={{ bgcolor: 'inherit' }}>
          <Stack direction="row" justifyContent="space-between">
            Labels
            {areFiltersEnabled && (
              <Button
                size="small"
                onClick={resetFilters}
                sx={{ ':hover': { bgcolor: 'inherit' } }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </ListSubheader>
      }
    >
      <DrawerListItem
        count={pullRequestsWithoutLabelsCount}
        countTooltip="Total pull requests without labels"
        isHidden={isPullRequestsWithoutLabelsHidden}
        handleClick={handlePullRequestsWithoutLabelsClick}
      />
      {Array.from(allLabels.values())
        .sort((a, b) => b.count - a.count)
        .map(label => (
          <DrawerListItem
            key={label.id}
            label={label}
            countTooltip="Total pull requests with this label"
            isHidden={hiddenLabels.has(label.name.toLocaleLowerCase())}
            handleClick={() => handleLabelClick(label.name)}
          />
        ))}
    </List>
  )
}

type DrawerListItemProps = {
  label?: LabelWithCount
  count?: number
  countTooltip: string
  isHidden: boolean
  handleClick: VoidFunction
}
function DrawerListItem({
  label,
  count,
  countTooltip,
  isHidden,
  handleClick,
}: DrawerListItemProps) {
  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Tooltip title={countTooltip}>
          <Avatar
            variant="rounded"
            sx={{ width: 30, height: 30, color: 'black', bgcolor: 'lightgray' }}
          >
            <Typography variant="button">
              {label ? label.count : count}
            </Typography>
          </Avatar>
        </Tooltip>
      }
    >
      <ListItemButton onClick={handleClick}>
        {isHidden ? <InvisibleIcon /> : <VisibleIcon />}
        <ListItemText
          primary={
            <Stack paddingRight={3}>
              {label ? (
                <Label label={label} isGreyedOut={isHidden} />
              ) : (
                <Button
                  disableRipple
                  tabIndex={-1}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    color: isHidden ? 'rgb(0, 0, 0, 0.2)' : 'primary',
                    ':hover': {
                      bgcolor: 'inherit',
                    },
                  }}
                >
                  <Typography>Pull requests without labels</Typography>
                </Button>
              )}
            </Stack>
          }
          sx={{ marginLeft: label ? 0 : 1 }}
        />
      </ListItemButton>
    </ListItem>
  )
}
