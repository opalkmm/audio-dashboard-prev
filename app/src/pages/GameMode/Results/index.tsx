import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Typography,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  IconButton,
  Input,
  TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import { useTimer } from 'react-timer-hook';
import { useVocalRange } from 'hooks/rangeTest';
import { COLORS } from 'theme';
import { AnimatePresence } from 'framer-motion';
// import { RangeTestType, useRangeTest } from './rangeTest.hooks';
import { setRefresh, useDashboard } from 'store/dashboard';
import { GameModeModal} from '../index' ;
import { Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';



/*
match players mode
*/ 
const steps = [
  {
    id: 'analyzing',
    instructions: "Analyzing Game Scores...",
    waitSeconds: 0,
    mustGoNext: false
  },
  {
    id: 'results',
    instructions: 'Results!',
    waitSeconds: 0,
    mustGoNext: false,
    action: 'Close'
  }
];

/*
 * match modal
 */
interface Props {
  socket: Socket;
  audioFileUrls: any;
  open: boolean;
  onClose: () => void;
}

export const ResultsModal: React.FC<Props> = ({ socket, audioFileUrls, open, onClose }) => {
  const { refresh, user } = useDashboard();
  const gameAnalysisUrl = "https://greatlybackend-orpin.vercel.app/game";
  const dispatch = useDispatch();
  const [hasRequestedAnalysis, SetHasRequestedAnalysis] = useState(false);
  const [results, setResults] = useState(undefined);
  const audio1 = audioFileUrls?.audio1;
  const audio2 = audioFileUrls?.audio2;
  const user1 = audioFileUrls?.user1;
  const user2 = audioFileUrls?.user2;



  const [currentStep, setCurrentStep] = useState(0);

  const [resultsTableData, setResultsTableData] = useState<any | undefined>({});

  

  const prepareResults = (results: any | undefined) => {
    const rows = [
      {
        id: 1,
        user1: (results?.overall_winner.includes('User 1')) ? 'x' : '',
        category: 'Overall Winner',
        user2: (results?.overall_winner.includes('User 2')) ? 'x' : '',
      },
      {
        id: 2,
        user1: (results?.pitch.includes('User 1')) ? 'x' : '',
        category: 'Pitch',
        user2: (results?.pitch.includes('User 2')) ? 'x' : '',
      },
      {
        id: 3,
        user1: (results?.resonance.includes('User 1')) ? 'x' : '',
        category: 'Resonance',
        user2: (results?.resonance.includes('User 2')) ? 'x' : '',
      },
      {
        id: 4,
        user1: (results?.rhythm.includes('User 1')) ? 'x' : '',
        category: 'Rhythm',
        user2: (results?.rhythm.includes('User 2')) ? 'x' : '',
      },
      {
        id: 5,
        user1: (results?.timbre.includes('User 1')) ? 'x' : '',
        category: 'Timbre',
        user2: (results?.timbre.includes('User 2')) ? 'x' : '',
      },
    ];
    const columns = [
      { field: 'user1', headerName: user1, width: 100 },
      { field: 'category', headerName: 'Category', width: 150 },
      { field: 'user2', headerName: user2, width: 100 },
    ];

    return (
    <DataGrid
      rows={rows}
      columns={columns}
      // pageSize={5}
    />)
  }


  

// useEffect(() => {
//     // when we get the analysis results back from the API we want to update the data
//     if (results !== undefined) {
//         // let newData = results;
//         // setResultsTableData(newData);
//     }
//     let sampleData = {
//       pitch: "winnerName",
//       rhythm: "winnerName",
//       resonance: "winnerName",
//       timbre: "winnerName",
//       overall_winner: "winnerName",
//       }
//       console.log(results);

// }, [results]);

// sent by sockets server when audio files have been sent and time to get analysis
// sent by sockets server when audio files have been sent and time to get analysis
useEffect(() => {
  if(results !== undefined) {
    nextStep();
  }

      }, [results])

  useEffect(() => {
    if ((audio1 !== undefined) && (audio2 !== undefined) && hasRequestedAnalysis == false){
      const analysisObject = { s3_url_1: audio1, s3_url_2: audio2 };
      console.log("ANALYSISOBJECTSENT", JSON.stringify(analysisObject));
      (async () => {
        const rawResponse = await fetch(gameAnalysisUrl, {
          method: 'POST',
          mode: 'cors', // idk abt the mode here
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(analysisObject)
        });
        const content = await rawResponse.json();
        console.log(content);
        setResults(content);
      })();
      // SetHasRequestedAnalysis(true);
    }

  }, [audio1, audio2])


  const handleButtonClick = async () => {
    const { waitSeconds, action } = steps[currentStep];
    if (waitSeconds === 0) {
      nextStep();
      return;
    }
    if (action == 'Close'){
      onClose();
    }
  };


  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));



  const handleClose = (
    event: {},
    reason?: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    onClose();
  };

  return (
    <AnimatePresence key={'match'}>
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown
        sx={{
          '.MuiPaper-root': {
            height: '700px',
            border: `2px solid ${COLORS.highlight}`,
            background: COLORS.paper
          }
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            color: COLORS.highlight
          }}
        >
          <HighlightOffTwoToneIcon />
        </IconButton>
        <DialogTitle
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          variant="h4"
        >
          Results
        </DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <Stack
            direction={'column'}
            spacing={2}
            justifyContent={'center'}
            display={'flex'}
            alignItems={'center'}
          >
            <Typography variant="h6">
              {steps[currentStep].instructions}
            </Typography>
            {steps[currentStep].id === 'results' && (results !== undefined) && (
                <Typography variant="h6">
                    {/* Winners: {JSON.stringify(results)} */}
                    {prepareResults(results)}
                </Typography>
            )}
            </Stack>
        </DialogContent>
        {steps[currentStep]?.action !== undefined && (
          <DialogActions
          disableSpacing
          sx={{ height: 90, padding: '24px', justifyContent: 'center' }}
        >
          <Button
            onClick={handleButtonClick}
            sx={{ width: '200px' }}
            variant="custom"
          >
            {steps[currentStep]?.action}
          </Button>
        </DialogActions>
        )}
        
      </Dialog>
    </AnimatePresence>
  );
};
