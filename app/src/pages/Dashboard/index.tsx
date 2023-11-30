import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardHeader,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material';
import { PageHeader } from 'components/PageHeader';
import { Loader } from 'components/Loader';
import fireLogo from 'assets/trendingtopic-11.svg';
import {
  AudioToolModal,
  RangeTestModal,
  GameModeModal,
  LoginModal,
  ArchiveModal,
  FaqModal,
} from 'pages';
import { ResultsModal } from 'pages/GameMode/Results';
import { MatchModal } from 'pages/GameMode/Match';
import { GraphDataType, LineGraph } from './LineGraph';
import { useGetArchives } from 'hooks/archives';
import { AUDIO_ANALYSIS_FILE, AUDIO_RECORDING_FOLDER } from 'config';
import { DashboardType } from 'types/dashboard';
import { useAWS } from 'hooks/aws';
import { useDashboard } from 'store/dashboard';
import { RangeTestType, useRangeTest } from 'pages/RangeTest/rangeTest.hooks';
import { COLORS } from 'theme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DataTable } from './DataTable';
import { socket } from '../../socket/socket';
import { Stripe } from 'components/Stripe';


/*
 * Main dashboard page
 */

export const Dashboard = () => {

  socket.connect();
  const matches = useMediaQuery('(min-width:400px)');
  const navigate = useNavigate();
  const location = useLocation();
  const { downloadFiles } = useAWS();
  const { user, refresh, gameMatchId } = useDashboard();
  const { downloadRangeTestHistory } = useRangeTest({
    rangeTestHistory: undefined
  });
  const [loginModal, setLoginModal] = useState(false);
  const [gameId, setGameId] = useState();
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false);
  const [gameDetails, setGameDetails] = useState({user1: '', user2: '', option: ''});
  const [openAudioTool, setOpenAudioTool] = useState(false);
  const [openGameMode, setOpenGameMode] = useState(false);
  const [openResults, setOpenResults] = useState(false);
  const [audioFileUrls, setAudioFileUrls] = useState(undefined);

  const [openMatch, setOpenMatch] = useState(false);
  const [openRangeTest, setOpenRangeTest] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | undefined>();
  const [lastRangeTest, setLastRangeTest] = useState<
    RangeTestType | undefined
  >();
  const [openFAQ, setOpenFAQ] = useState(false);
  const [dashboardData, setDashboardData] = useState<
    DashboardType | undefined
  >();
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [audioFileLoading, setAudioFileLoading] = useState(false);
  const { archives } = useGetArchives();

  // create graph data
  const graphData = useMemo(() => {
    if (!dashboardData) return [];
    const graphDataArr = new Array<GraphDataType>();
    if (dashboardData?.time?.length && dashboardData?.position?.length) {
      for (let i = 0; i < dashboardData?.time?.length; i++) {
        graphDataArr.push({
          time: dashboardData?.time[i] || 0,
          position: dashboardData?.position[i] || 0
        });
      }
    }
    return graphDataArr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardData, refresh]);

  useEffect(() => {
    setLoginModal(location.pathname === '/login');
    setOpenAudioTool(location.pathname === '/audio-tool');
    setOpenGameMode(location.pathname === '/game-mode');
    setOpenPaymentModal(location.pathname === '/payment');
    setOpenMatch(location.pathname.includes('/match'));
    setOpenResults(location.pathname === '/results');
    setOpenRangeTest(location.pathname === '/range-test');
    setOpenArchive(location.pathname === '/archives');
    setOpenFAQ(location.pathname === '/faq');
  }, [location.pathname]);

  
  const [archiveId, setCurrentArchiveId] = useState<number>(-1);

  const handleArchiveInputChange = (event: SelectChangeEvent<number>) => {
    const {
      target: { value }
    } = event;
    const id = typeof value === 'number' ? value : parseInt(value, 0);
    setCurrentArchiveId(id);
    fetchDashboardData(id);
  };

  const fetchDashboardData = useCallback(
    async (id: number) => {
      // load archive data
      const audioPath = `${user.email}/${AUDIO_RECORDING_FOLDER}/${archives[id].path}`;
      const analysisPath = `${user.email}/${AUDIO_RECORDING_FOLDER}/${archives[id].id}/${AUDIO_ANALYSIS_FILE}.json`;

      setAudioFileLoading(true);
      // load audio data
      if (audioPath) {
        downloadFiles({ path: audioPath })
          .then((data) => {
            // create File from data
            if (data.Body) {
              // create a blob url from the file
              const blobUrl = URL.createObjectURL(
                new Blob([data.Body as Uint8Array], { type: data.ContentType })
              );
              setAudioBlobUrl(blobUrl);
            }
          })
          .finally(() => {
            setAudioFileLoading(false);
          });
      }

      setAnalysisLoading(true);
      // load analysis data
      if (analysisPath) {
        downloadFiles({ path: analysisPath })
          .then((data) => {
            // create File from data
            if (data.Body) {
              const blob = new Blob([data.Body as Uint8Array], {
                type: 'application/json'
              });
              blob.text().then((json) => {
                setDashboardData(JSON.parse(json) as DashboardType);
              });
            }
          })
          .catch((err) => {
            setDashboardData(undefined);
          })
          .finally(() => {
            setAnalysisLoading(false);
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [archives, user.email, refresh]
  );

  useEffect(() => {
    if (archives.length > 0) {
      fetchDashboardData(0);
    }
  }, [archives, fetchDashboardData, refresh]);
  useEffect(() => {
    socket.on("startSingingMatch", (matchDetails) => {
      setGameDetails(matchDetails);

      navigate('/game-mode');
      console.log("Both players are ready: game start!");
    })
  });
  useEffect(() => {
    // When both players in the room are joined and ready,
    // this event will be emitted by the server telling us
    // that we are ready to start the game
    // so it can close this modal and open the game mode modal instead
    socket.on("userAudioFilesReady", (incomingAudioFileUrls) => {
      // call the /game api endpoint with the strings of the URLs to the files
        // {
        //   "roomId":roomId, // socket roomId
        //   user1: user1Name,
        //   user2: user2Name,
        //   audio1: '',
        //   audio2: ''
        // }
        setAudioFileUrls(incomingAudioFileUrls);
        navigate('/results');
      console.log("audioFileUrls", incomingAudioFileUrls?.user1, incomingAudioFileUrls?.audio1, incomingAudioFileUrls?.user2, incomingAudioFileUrls?.audio2);
    })
  });
  useEffect(() => {
    downloadRangeTestHistory().then((data: RangeTestType[] | undefined) => {
      if (!data || data.length === 0) return;
      const ranges = [
        ...data.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      ];
      setLastRangeTest(ranges[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refresh]);

  return (
    <>
      {loginModal && (
        <LoginModal open={loginModal} onClose={() => navigate('/')} />
      )}
      {openAudioTool && (
        <AudioToolModal open={openAudioTool} onClose={() => navigate('/')} />
      )}
      {openGameMode && (
        <GameModeModal socket={socket} gameDetails={gameDetails} open={openGameMode} onClose={() => navigate('/')} />
      )}
      {openPaymentModal && (
        <Stripe  open={openPaymentModal} onClose={() => navigate('/')} />
      )}
      {openResults && (audioFileUrls !== undefined) &&(
        <ResultsModal socket={socket} audioFileUrls={audioFileUrls} open={openResults} onClose={() => navigate('/')} />
      )}
      {openMatch && (
        <MatchModal socket={socket} userMatchCode={gameMatchId} open={openMatch} onClose={() => navigate('/')} />
      )}
      {openRangeTest && (
        <RangeTestModal open={openRangeTest} onClose={() => navigate('/')} />
      )}
      {openArchive && (
        <ArchiveModal open={openArchive} onClose={() => navigate('/')} />
      )}
      {openFAQ && <FaqModal open={openFAQ} onClose={() => navigate('/')} />}
      <Box top={'85px'} position={'relative'} padding={'20px'} width={'100%'}>
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gap={2}
        >
          <Box
            gridColumn={'span 3'}
            display="grid"
            gridTemplateColumns="repeat(5, 1fr)"
            gridAutoRows={'min-content'}
            gap={2}
          >
            <Box gridColumn="span 4" minWidth={'300px'}>
              <Card sx={{ height: 150, padding: '10px 30px' }}>
                <CardHeader
                  title="Audio File"
                  sx={{ padding: '15px 0px', color: COLORS.highlight }}
                />
                {audioFileLoading ? (
                  <Box
                    width={'100%'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Loader />
                  </Box>
                ) : audioBlobUrl ? (
                  <audio style={{ width: '100%' }} controls src={audioBlobUrl}>
                    Your browser does not support the
                    <code>audio</code> element.
                  </audio>
                ) : (
                  <Box
                    width={'100%'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">No data</Typography>
                  </Box>
                )}
              </Card>
            </Box>
            <Box gridColumn="span 4" minWidth={'280px'}>
              <Card
                sx={{
                  height: 150,
                  padding: '10px 30px',
                  color: COLORS.highlightLighter
                }}
              >
                <CardHeader
                  title={'Vocal Range'}
                  sx={{ padding: '15px 0px', color: COLORS.highlight }}
                />
                {lastRangeTest ? (
                  <Box
                    width={'100%'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    color={COLORS.highlightLighter}
                  >
                    <Stack direction={'row'} width={'100%'} spacing={10}>
                      <Stack direction={'column'}>
                        <Typography variant="caption">Low Range</Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {lastRangeTest.lowRange}
                        </Typography>
                      </Stack>
                      <Stack direction={'column'}>
                        <Typography variant="caption">High Range</Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {lastRangeTest.highRange}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    width={'100%'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">No data</Typography>
                  </Box>
                )}
              </Card>
            </Box>
            <Box gridColumn="span 8">
              <Card
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  padding: '10px 30px'
                }}
              >
                <CardHeader
                  title="Graph"
                  sx={{
                    padding: '15px 0px',
                    color: COLORS.highlight,
                    marginRight: 'auto'
                  }}
                />
                {analysisLoading ? (
                  <Loader />
                ) : !graphData || graphData.length === 0 ? (
                  <Box
                    width={'100%'}
                    minHeight={'250px'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">No data</Typography>
                  </Box>
                ) : (
                  <LineGraph graphData={graphData} />
                )}
              </Card>
            </Box>
            <Box gridColumn="span 8">
              <Card sx={{ height: 320, padding: '10px 30px' }}>
                <CardHeader
                  title={'Text'}
                  sx={{ padding: '15px 0px', color: COLORS.highlight }}
                />
                {!graphData || graphData.length === 0 ? (
                  <Box
                    width={'100%'}
                    height={'250px'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">No data</Typography>
                  </Box>
                ) : (
                  <List>
                    {dashboardData?.bulletlist?.map((item, index) => (
                      <ListItem key={index}>{item}</ListItem>
                    ))}
                  </List>
                )}
              </Card>
            </Box>
          </Box>
          <Box
            gridColumn={`span ${matches ? 3 : 1}`}
            display="grid"
            gridTemplateRows="max-content"
            gap={2}
          >
            <Box gridColumn="span 1">
              <Card sx={{ padding: '10px' }}>
                <CardHeader
                  title={'Gif'}
                  sx={{ padding: '15px 30px', color: COLORS.highlight }}
                />
                {!graphData || graphData.length === 0 ? (
                  <Box
                    width={'100%'}
                    height={'250px'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">No data</Typography>
                  </Box>
                ) : (
                  <>
                    <DataTable data={dashboardData?.table1} />
                  </>
                )}
              </Card>
            </Box>
            <Box gridColumn="span 1">
              <Card sx={{ padding: '10px' }}>
                <CardHeader
                  title="Grid"
                  sx={{ padding: '15px 30px', color: COLORS.highlight }}
                />
                {!graphData || graphData.length === 0 ? (
                  <Box
                    width={'100%'}
                    height={'250px'}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">No data</Typography>
                  </Box>
                ) : (
                  <DataTable data={dashboardData?.table2} />
                )}
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display={'flex'} position={'fixed'} id="header-wrapper">
        <Stack
          direction="row"
          justifyContent={'space-between'}
          width={'calc(100vw - 250px)'}
        >
          <PageHeader
            icon={<img src={fireLogo} alt="fire logo" />}
            title="Welcome back!"
            subtitle="This is your main dashboard"
          />
          <FormControl sx={{ m: 1, width: 300, mt: 3, ml: 'auto', right: 0 }}>
            <InputLabel id="archive-select-label">
              <em>History</em>
            </InputLabel>
            <Select
              value={archiveId}
              onChange={handleArchiveInputChange}
              variant="outlined"
              labelId="archive-select-label"
              label="History"
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem disabled value={-1}>
                <em>History</em>
              </MenuItem>
              {archives.map(({ created_at }, index) => (
                <MenuItem key={index} value={index}>
                  {created_at}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </>
  );
};
