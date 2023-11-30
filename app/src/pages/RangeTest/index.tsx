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
  IconButton
} from '@mui/material';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import { useTimer } from 'react-timer-hook';
import { useVocalRange } from 'hooks/rangeTest';
import { COLORS } from 'theme';
import { AnimatePresence } from 'framer-motion';
import { RangeTestType, useRangeTest } from './rangeTest.hooks';
import { setRefresh, useDashboard } from 'store/dashboard';

/*
 * Range test component
 */
const steps = [
  {
    id: 'none',
    instructions: 'Start the range test',
    action: 'Start',
    waitSeconds: 0,
    mustGoNext: false
  },
  {
    id: 'low-range',
    instructions: 'Say "La" in your lowest comfortable pitch',
    action: "I'm Ready",
    waitSeconds: 0,
    mustGoNext: false
  },
  {
    id: 'collecting-low-range',
    instructions: 'Sing "La" in your lowest comfortable pitch',
    action: 'Stop',
    waitSeconds: 5,
    mustGoNext: true
  },
  {
    id: 'high-range',
    instructions: 'Now say "La" in your highest comfortable pitch',
    action: "I'm Ready",
    waitSeconds: 0,
    mustGoNext: false
  },
  {
    id: 'collecting-high-range',
    instructions: 'Sing "La" in your highest comfortable pitch',
    action: 'Stop',
    waitSeconds: 5,
    mustGoNext: true
  },
  {
    id: 'done',
    instructions: 'You are done with the range test',
    action: 'Save',
    waitSeconds: 0,
    mustGoNext: false
  },
  {
    id: 'saved',
    instructions: 'You are done with the range test',
    action: 'Restart',
    waitSeconds: 0,
    mustGoNext: false
  }
];

/*
 * Range test modal
 */
interface Props {
  open: boolean;
  onClose: () => void;
}

export const RangeTestModal: React.FC<Props> = ({ open, onClose }) => {
  const { refresh } = useDashboard();
  const dispatch = useDispatch();
  const {
    vocalRange,
    start: startTesting,
    stop: stopTesting
  } = useVocalRange();

  const [currentStep, setCurrentStep] = useState(0);
  const [lowRange, setLowRange] = useState<string>();
  const [highRange, setHighRange] = useState<string>();
  const [rangeTestHistory, setRangeTestHistory] = useState<RangeTestType[]>();
  const { rangeTestHistoryS3, historyLoaded } = useRangeTest({
    rangeTestHistory
  });

  // set initial values on open
  useEffect(() => {
    if (!open) return;
    if (historyLoaded) return;
    if (rangeTestHistory?.length === 0) {
      setRangeTestHistory([]);
    }
  }, [rangeTestHistory, open, historyLoaded]);

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

    if (action === 'Restart' || action === 'Stop') {
      reset();
      return;
    }

    if (waitSeconds === 0) {
      nextStep();
      return;
    }
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  useEffect(() => {
    const { id } = steps[currentStep];

    if (id === 'collecting-low-range') {
      startTesting();
    }
    if (id === 'collecting-high-range') {
      startTesting();
    }
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
    <AnimatePresence key={'audio-tool'}>
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
          Range Test
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
            {seconds > 0 && <Typography variant="h3">{seconds}</Typography>}
            <Stack direction={'row'} spacing={2}>
              {lowRange && (
                <Typography>
                  low range: <b>{lowRange}</b>
                </Typography>
              )}
              {lowRange && highRange && <Typography>|</Typography>}
              {highRange && (
                <Typography>
                  high range: <b>{highRange}</b>
                </Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>
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
        </DialogActions>
      </Dialog>
    </AnimatePresence>
  );
};
