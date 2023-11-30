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
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import { useTimer } from 'react-timer-hook';
import { useVocalRange } from 'hooks/rangeTest';
import { COLORS } from 'theme';
import { AnimatePresence } from 'framer-motion';
import { RangeTestType, useRangeTest } from './rangeTest.hooks';
import { setRefresh, useDashboard } from 'store/dashboard';
import { GameModeModal } from '../index';
import { Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';

import { useAWS } from 'hooks/aws';
import { PaymentRecord, useUpdateUserPaymentRecord } from "hooks/accountpaymenthistory"



/*
match players mode
*/ 
const steps = [
  {
    id: 'none',
    title: 'Game Mode',
    instructions:
      "Game mode will analyze your singing and another user's singing to compete for who can sing the best! Invite your friends or match up with another random user!",
    action: 'Start',
    waitSeconds: 0,
    mustGoNext: false
  },
  {
    id: 'song-selection',
    title: 'Song Selection',
    instructions: 'Please select your song',
    action: 'Invite Code',
    secondAction: 'Random Match',
    waitSeconds: 0,
    mustGoNext: false
  },
  {
    id: 'match-code',
    title: 'Invite Code',
    instructions: 'Input invite code to match or tell yours to someone',
    action: 'Match Code',
    secondAction: 'Cancel',
    waitSeconds: 0, 
    mustGoNext: false
  },
  {
    id: 'matching-singers',
    title: 'Matching Singers',
    instructions:
      'Matching to another singer. Please wait while you are matched',
    action: 'Close',
    secondAction: 'Cancel',
    waitSeconds: 0,
    mustGoNext: false
  }
];

interface Props {
  socket: Socket;
  userMatchCode?: string;
  open: boolean;
  onClose: () => void;
}

export const MatchModal: React.FC<Props> = ({
  socket,
  userMatchCode,
  open,
  onClose
}) => {
  const { refresh, user } = useDashboard();
  const dispatch = useDispatch();
  const {
    vocalRange,
    start: startTesting,
    stop: stopTesting
  } = useVocalRange();
  const navigate = useNavigate();
  const [option, setOption] = useState<string>('Input1');
  const [inputMatchCode, setInputMatchCode] = useState<string>('notSet');
  const [currentStep, setCurrentStep] = useState(0);
  const [lowRange, setLowRange] = useState<string>();
  const [highRange, setHighRange] = useState<string>();
  const [rangeTestHistory, setRangeTestHistory] = useState<RangeTestType[]>();
  const { rangeTestHistoryS3, historyLoaded } = useRangeTest({
    rangeTestHistory
  });
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord | undefined>(undefined);
  const [userDetails, setUserDetails] = useState<any>();
  const { listFiles, downloadFiles, uploadFiles } = useAWS();
  const path = `${user.email}`;
  const getList = async () => {
    return listFiles({ folder: path }).then((data)=>{
      setUserDetails(data);
    });
  };
  const { downloadPaymentHistory, uploadPaymentHistory } = useUpdateUserPaymentRecord();

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
      // Inside the effect, call downloadPaymentHistory and set the state
      const fetchPaymentHistory = async () => {
        try {
        const history = await downloadPaymentHistory();
        if (history) {
          setPaymentHistory(history);
          console.log("userPaymentHistory", history);
        } else {
          console.log("userPaymentHistory is empty or undefined");
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }
      };

      fetchPaymentHistory(); // Trigger the download when the component mounts
      console.log("userPaymentHistory", paymentHistory)
      // This effect runs once when the component mounts, equivalent to componentDidMount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paymentHistory !== undefined){
      let { freePlaysRemaining, paymentIntent, paymentAmount, timestamp} = paymentHistory;
      let timeSincePayment = (new Date(timestamp).getTime() - new Date().getTime())/(1000*60*60*24);
      if (freePlaysRemaining > 0 && paymentIntent == null){
        // you have freePlays and have never paid before
        // you can play, but we will count it in your history and update the record
        let newPaymentHistory = paymentHistory;
        newPaymentHistory.freePlaysRemaining = paymentHistory.freePlaysRemaining -1;
        uploadPaymentHistory(newPaymentHistory);
      } else if ((paymentIntent !== null && timeSincePayment > 31) || (freePlaysRemaining < 1)) {
        // payment was over 31 days ago
        navigate('/payment');
      }
    }
  }, [paymentHistory])

  // set range history from s3
  useEffect(() => {
    if (historyLoaded) {
      setRangeTestHistory(rangeTestHistoryS3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoaded, refresh]);
  
  const onTimerExpire = () => {
    const { mustGoNext, id } = steps[currentStep];
    if (id === 'collecting-low-range') {
      stopTesting();
      setLowRange(`${vocalRange}`);
    }
    if (id === 'collecting-high-range') {
      stopTesting();
      setHighRange(`${vocalRange}`);
    }
    if (mustGoNext) {
      nextStep();
    }
  };

  const { seconds, restart, pause } = useTimer({
    expiryTimestamp: new Date(),
    onExpire: onTimerExpire,
    autoStart: false
  });

  useEffect(() => {
    const { waitSeconds } = steps[currentStep];
    restart(new Date(Date.now() + waitSeconds * 1000), true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const songSelection = (
    event: SelectChangeEvent<any>,
    child: React.ReactNode
  ) => {
    setOption(event.target.value);
  };
  const reset = () => {
    pause();
    stopTesting();
    setCurrentStep(0);
    setLowRange(undefined);
    setHighRange(undefined);
  };

  const handleButtonClick = async () => {
    const { waitSeconds, action } = steps[currentStep];

    if (action === 'Save' && rangeTestHistory && lowRange && highRange) {
      setRangeTestHistory([
        ...rangeTestHistory,
        { lowRange, highRange, timestamp: `${new Date().toString()}` }
      ]);

      dispatch(setRefresh(new Date().getTime()));
      nextStep();
    }
    if (action === 'Start') {
      // not sure if we need to emit anything after this step
    }

    if (action === 'Match Code') {
      // match to a user that is currently waiting for you
      let username = user.name;
      let waitingUserMatchCode = inputMatchCode;
      let myMatchCode = userMatchCode;
      let userMatchDetails = {
        username,
        option,
        waitingUserMatchCode,
        myMatchCode
      };
      console.log('OTHERUSER: ', waitingUserMatchCode);
      socket.emit('findCodeMatch', userMatchDetails);
      // don't want to call onClose here, but may have to if gameMode doesn't
      // load as anticpated
    }
    if (action === 'Invite Code') {
      // to generate the code and put user in the queue to be found
      // This will create the user in the waiting room already with their
      // user Match code
      // if they input another user match code, they can move rooms...
      // let id = socket.id; don't need socket id bc that is handled on the back end by the socket.io server
      let username = user.name;
      let userMatchDetails = { username, option, userMatchCode };
      socket.emit('waitForCodeMatch', userMatchDetails);
      // don't want to call onClose here, but may have to if gameMode doesn't
      // load as anticpated
    }
    if (action === 'Close') {
      onClose();
    }
    if (action === 'Restart' || action === 'Stop') {
      reset();
      return;
    }

    if (waitSeconds === 0) {
      nextStep();
      return;
    }
  };

  const handleSecondButtonClick = async () => {
    const { secondAction } = steps[currentStep];
    if (secondAction === 'Random Match') {
      let username = user.name;
      let userMatchDetails = { username, option, userMatchCode };
      socket.emit('waitForRandomMatch', userMatchDetails);
      setCurrentStep((prev) => Math.min(prev + 2, steps.length - 1));
    }

    if (secondAction === 'Cancel') {
      let username = user.name;
      let userMatchDetails = { username, option, userMatchCode };
      socket.emit('cancelRandomMatch', userMatchDetails);
      onClose();
    }
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  useEffect(() => {
    const { id } = steps[currentStep];
  }, [currentStep, startTesting]);

  const handleClose = (
    event: {},
    reason?: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    onClose();
    reset();
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
            height: '300px',
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
          {steps[currentStep].title}
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
              {steps[currentStep].id === 'match-code' && (
                <Typography align="center">
                  {' '}
                  Your Code is: {userMatchCode}{' '}
                </Typography>
              )}
            </Typography>
          </Stack>
        </DialogContent>
        {steps[currentStep].id === 'song-selection' && (
          <FormControl sx={{ m: '10px 0px', minWidth: 150 }} size="small">
                <Select
                  labelId="demo-select-small"
                  id="demo-select-small"
                  value={option}
                  onChange={songSelection}
                  //disabled={status === 'recording'}
                >
                  <MenuItem value={'Input1'}>Input 1</MenuItem>
                  <MenuItem value={'Input2'}>Input 2</MenuItem>
                  <MenuItem value={'Input3'}>Input 3</MenuItem>
                </Select>
              </FormControl>

        )}
        {steps[currentStep].id === 'match-code' && (
          <FormControl sx={{ m: '10px 0px', minWidth: 150 }} size="small">
            <TextField
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setInputMatchCode(event.target.value);
              }}
            ></TextField>
          </FormControl>
        )}
        <DialogActions
          disableSpacing
          sx={{ height: 90, padding: '24px', justifyContent: 'center' }}
        >
          <Button
            onClick={handleButtonClick}
            sx={{ width: '200px' }}
            variant="custom"
          >
            {steps[currentStep].action}
          </Button>
          {steps[currentStep].secondAction && (
            <Button
              onClick={handleSecondButtonClick}
              sx={{ width: '200px' }}
              variant="custom"
            >
              {steps[currentStep].secondAction}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </AnimatePresence>
  );
};
