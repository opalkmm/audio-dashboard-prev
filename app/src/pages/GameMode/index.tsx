import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  Divider,
  Grid
} from '@mui/material';
import { useTimer } from 'react-timer-hook';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { MicButton } from './MicButton';
import { TextArea } from './TextArea';
import ArrowDropUpTwoToneIcon from '@mui/icons-material/ArrowDropUpTwoTone';
import ArrowDropDownTwoToneIcon from '@mui/icons-material/ArrowDropDownTwoTone';
import MicNoneTwoToneIcon from '@mui/icons-material/MicNoneTwoTone';
import { BorderBox } from 'pages/sharedStyles';
import { useReactMediaRecorder } from 'react-media-recorder';
import { motion, AnimatePresence } from 'framer-motion';
import { PromptModal } from 'components/PromptModal';
import { useAudioTool } from 'hooks/audioTool';
import { setRefresh, setSnackbar } from 'store/dashboard';
import { Metronome } from './Metronome';
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition';
import { useAWS } from 'hooks/aws';
import { useDashboard } from 'store/dashboard';
import { AUDIO_ANALYSIS_FILE, AUDIO_RECORDING_FOLDER } from 'config';
import { useLazyGetDashboardDataQuery } from 'store/dashboardApi';
import { AWSError } from 'aws-sdk';
import { SerializedError } from '@reduxjs/toolkit';
import { DashboardType } from 'types/dashboard';
import { Socket } from 'socket.io-client';
import { COLORS } from 'theme';

interface Props {
  socket: Socket;
  gameDetails?: { option: string, user1: string, user2: string };
  open: boolean;
  onClose: () => void;
}

interface userAudioObject {
  user1: string;
  user2: string;
  audio1: string;
  audio2: string;
}

export const GameModeModal: React.FC<Props> = ({ socket, gameDetails, open, onClose }) => {

  const gameAnalysisUrl = "https://greatlybackend-orpin.vercel.app/game";

  const dispatch = useDispatch();
  // const [option, setOption] = useState<any>('Input1');
  
  // initialize as blank strings
  const [userAudioFiles, setUserAudioFiles] = useState<userAudioObject>(
    {user1: '', user2: '', audio1: '', audio2: ''}
    );
  const { user } = useDashboard();
  const otherUserName = gameDetails && gameDetails?.user1 === user.name ? gameDetails?.user2 : gameDetails?.user1;
  const [setNumber, setSetNumber] = useState(1);
  const [askForConfirmation, setAskForConfirmation] = useState(true);
  const [beginGameMode, setBeginGameMode] = useState(false);
  const [newRecordingConfirmed, setNewRecordingConfirmed] = useState(false);
  const [audios, setAudios] = useState<
    Array<{
      url: string;
      id: number;
      checked: boolean;
      ref: HTMLAudioElement | null;
    }>
  >();

  const { uploadFiles, listFiles } = useAWS();
  const { files, error } = useAudioTool(gameDetails?.option as string);
  const [lyrics, setLyrics] = useState('');
  const [getDashboardData] = useLazyGetDashboardDataQuery();
  const [openCountdown, setOpenCountdown] = useState(true);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  useEffect(() => {
    // don't record on load, but record on audio file play
    // startRecording();
    // resetTranscript();
    // SpeechRecognition.startListening({ continuous: true })
  }, [files]);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      dispatch(
        setSnackbar({
          message: 'Speech Recognition is not supported on your browser',
          variant: 'warning'
        })
      );
    }
  }, [browserSupportsSpeechRecognition, dispatch]);


  useEffect(() => {
    // when we have a userAudioFile to analyse, communicate that to socket server
   if (userAudioFiles.audio1 !== '' && userAudioFiles.user1 !== ''){
    console.log(userAudioFiles);
    socket.emit('userFileReady', userAudioFiles);
   }
  }, [userAudioFiles, socket]);


  useEffect(() => {
    if (error) {
      const { message, variant } = error;
      dispatch(setSnackbar({ message, variant }));
    } else if (files) {
      // get audio files
      const audioFileURLs = files
        .filter((file) => file.ContentType?.includes('audio'))
        .map((file) =>
          URL.createObjectURL(
            new Blob([file.Body as Uint8Array], { type: file.ContentType })
          )
        );

      // we should auto start playing the song 
      // right here we are autoplaying with the vocals and music
      // not sure how we can highlight the words true karaoke style
      // but for now this is good
      setAudios(
        audioFileURLs.map((url, index) => ({
          url,
          id: index,
          checked: true,
          ref: null
        }))
      );

      // get text files
      const textFiles = files.filter((file) =>
        file.ContentType?.includes('text')
      )[0];

      if (textFiles.Body) {
        let text = textFiles.Body.toString('utf8');
        setLyrics(text);
      } else {
        setLyrics('');
      }
    }
  }, [dispatch, error, files]);
  
  const delayedCloseCountdown = () => setTimeout(function(){
    setOpenCountdown(false);
}, 1000);

  const { seconds, restart, pause } = useTimer({
    expiryTimestamp: new Date(new Date().getTime() + 3000),
    onExpire: (() => delayedCloseCountdown),
    autoStart: true
  });
  

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      video: false,
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      mediaRecorderOptions: {
        mimeType: 'audio/webm;codecs=pcm'
      }
    });
  // const handleChange = (
  //   event: SelectChangeEvent<any>,
  //   child: React.ReactNode
  // ) => {
  //   resetTranscript();
  //   setOption(event.target.value);
  // };
  const handleClose = (
    event: {},
    reason?: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    onClose();
    clearBlobUrl();
    resetTranscript();
    setAskForConfirmation(false);
    stopRecording();
    SpeechRecognition.stopListening();
    dispatch(setRefresh(new Date().getTime()));
  };

  const handleRecording = useCallback(() => {
    if (status === 'idle' || status === 'stopped' || status === 'paused') {
      if (mediaBlobUrl) {
        setAskForConfirmation(true);
      } else {
        startRecording();
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
      }
    } else {
      stopRecording();
      SpeechRecognition.stopListening();
      SpeechRecognition.abortListening();
    }
  }, [status, mediaBlobUrl, startRecording, resetTranscript, stopRecording]);

  const handleNewRecording = () => {
    clearBlobUrl();
    setNewRecordingConfirmed(true);
    handleCloseConfirmation();
  };

  const handleCloseConfirmation = () => {
    setAskForConfirmation(false);
  };

  const handleAudioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const checked = e.target.checked;
    setAudios((prev) => {
      if (!prev) return prev;
      const newAudios = prev.map((audio) => {
        if (audio.id === id) {
          return { ...audio, checked };
        }
        return audio;
      });
      return newAudios;
    });
  };

  useEffect(() => {
    if (status === 'idle' || status === 'stopped' || status === 'paused') {
      if (mediaBlobUrl === undefined && newRecordingConfirmed) {
        setNewRecordingConfirmed(false);
        handleRecording();
      }
    }
  }, [status, mediaBlobUrl, newRecordingConfirmed, handleRecording]);

  const handleOnPlay = (
    e: React.SyntheticEvent<HTMLAudioElement>,
    id: number
  ) => {
    const audio = e.target as HTMLAudioElement;
    const updatedAudios = audios?.map((a) =>
      a.id === id ? { ...a, ref: audio } : a
    );
    const largestCurrentTime = updatedAudios?.reduce((prev, curr) => {
      if (curr.ref) {
        return curr.ref.currentTime > prev ? curr.ref.currentTime : prev;
      }
      return prev;
    }, 0);

    updatedAudios?.forEach((a) => {
      if (a.ref) {
        a.ref.currentTime = largestCurrentTime || 0;
      }
    });

    setAudios(updatedAudios);
    startRecording();
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true })
  };

  // TODO call this after the audio file finished playing
  const handleUploadFile = () => {
    if (!mediaBlobUrl) return;
    if (user.email === '' || user.name === '') return;
    fetch(mediaBlobUrl).then(async (res) => {
      const folderName = `${
        user.email
      }/${AUDIO_RECORDING_FOLDER}/${new Date().getTime()}`;
      const blob = await res.blob();
      const file = new File([blob], `${new Date().getTime()}.wav`, {
        type: 'audio/wav'
      });
     
      uploadFiles({ file, path: folderName })
        .then((res) => {
          // send as this user as user1 and let the socket server determine who is userr 1 and 2

          setUserAudioFiles({...userAudioFiles, audio1: res.Location, user1: user.name});
          dispatch(
            setSnackbar({
              message: 'Audio file uploaded successfully',
              variant: 'success'
            })
          );
          onClose();
          clearBlobUrl();
          resetTranscript();
          setAskForConfirmation(false);
          stopRecording();
          SpeechRecognition.stopListening();
          // dispatch(setRefresh(new Date().getTime()));
          // get anaylsis data -> we might add this in the future, but this is the function
          // or analysing the audio-tool, not for game scores analysis
          // getDashboardData({ path: folderName }).then(({ data, error }) => {
          //   saveAnalysis(data, error as SerializedError, folderName);
          // });
        })
        .catch((err) => {
          dispatch(setSnackbar({ message: err.message, variant: 'error' }));
        });
    });
  };

  const saveAnalysis = (
    data: DashboardType | undefined,
    error: SerializedError | undefined,
    path: string
  ) => {
    if (data && !error) {
      // upload a json file
      const jsonFile = new File(
        [JSON.stringify(data)],
        `${AUDIO_ANALYSIS_FILE}.json`,
        {
          type: 'application/json'
        }
      );
      try {
        uploadFiles({ file: jsonFile, path }).finally(() => {
          dispatch(setRefresh(new Date().getTime()));
          dispatch(
            setSnackbar({
              message: 'Audio analysis file uploaded successfully',
              variant: 'success'
            })
          );
          console.log('audio analysis file uploaded');
        });
      } catch (err) {
        dispatch(
          setSnackbar({ message: (err as AWSError).message, variant: 'error' })
        );
      }
    } else {
      dispatch(
        setSnackbar({
          message: error?.message || 'Something went wrong',
          variant: 'error'
        })
      );
    }
  };
 
  return (
    <AnimatePresence key={'game-mode'}>
    

      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={true}
        onClose={handleClose}
        sx={{ '& .MuiPaper-root': { height: '100%', zIndex: 0 } }}
        disableEnforceFocus
        disableEscapeKeyDown
      >
          {/* beginGameMode event will be switched on when both players are ready,
      the socket server will emit startSingingMatch and that will tell us to start the
      3,2,1 countdown and begin the game. When  */}
      {seconds > 0 && openCountdown == true && (
        <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={openCountdown}
        onClose={handleClose}
        disableEscapeKeyDown
        sx={{
          '.MuiPaper-root': {
            height: '300px',
            border: `2px solid ${COLORS.highlight}`,
            background: COLORS.paper,
            zIndex: 1500
          }
        }}
      >
        <DialogContent sx={{ paddingBottom: 0 }}>
          <Stack
            direction={'column'}
            spacing={2}
            justifyContent={'center'}
            display={'flex'}
            alignItems={'center'}
          >
        <Typography variant="h6">
              {'Ready to Start!'}
            </Typography>
            {seconds > 0 && <Typography variant="h3">{seconds}</Typography>}
            {seconds == 0 && <Typography variant="h3">{'Sing!'}</Typography>}
            </Stack>
        </DialogContent>
        </Dialog>
        
      )}
       
        <DialogTitle display={'flex'} flexDirection={'row'}>
          GAME MODE
          {status === 'recording' && (
            <motion.div
              style={{ alignItems: 'center', display: 'flex' }}
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.2 }}
            >
              <MicNoneTwoToneIcon color="success" />
            </motion.div>
          )}
        </DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <DialogContentText>
            You are playing against {otherUserName}!
            You are singing {gameDetails?.option}!
          </DialogContentText>
          <FormGroup
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginRight: 'auto'
                }}
              >
                {audios?.map((audio, index) => (
                  <React.Fragment key={audio.url}>
                    {audio.checked && (
                      <audio
                        hidden
                        autoPlay
                        onPlay={(e) => handleOnPlay(e, index)}
                      >
                        <source src={audio.url} type="audio/wav" />
                      </audio>
                    )}

                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={(e) => handleAudioChange(e, index)}
                          checked={audio.checked}
                        />
                      }
                      label={index === 0 ? 'Music' : 'Voice'}
                    />
                  </React.Fragment>
                ))}
              </FormGroup>
            <Box
              height={'calc(100% - 75px)'}
              width={'100%'}
              marginBottom={'20px'}
              display={'flex'}
              flexDirection={'row'}
              gap={'20px'}
            >
              <TextArea
                text={lyrics}
                scroll={status === 'recording'}
                reset={newRecordingConfirmed}
              />
              
            </Box>
          
        </DialogContent>
        <DialogActions disableSpacing sx={{ height: 90, padding: '24px' }}>
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 'auto',
              justifyContent: 'flex-start'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: mediaBlobUrl ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {mediaBlobUrl && (
              <audio controls>
                <source src={mediaBlobUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            )}
          </motion.div>
          <Box
            left={'50%'}
            position={'absolute'}
            sx={{ transform: 'translate(-50%, 0%)' }}
          >
            <MicButton
              onClick={handleRecording}
              isRecording={status === 'recording'}
            />
          </Box>
          <Button
            variant="custom"
            onClick={handleClose}
            sx={{ margin: '0px 5px' }}
          >
            CLOSE
          </Button>
          <Button
            variant="custom"
            onClick={handleUploadFile}
            sx={{ margin: '0px 5px' }}
            disabled={mediaBlobUrl === undefined}
          >
            ANALYZE
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatePresence>
  );
};
