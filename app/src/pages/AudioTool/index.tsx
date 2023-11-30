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

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AudioToolModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [option, setOption] = useState<string>('Input0');
  const { user } = useDashboard();
  const [setNumber, setSetNumber] = useState(1);
  const [askForConfirmation, setAskForConfirmation] = useState(false);
  const [newRecordingConfirmed, setNewRecordingConfirmed] = useState(false);
  const [audios, setAudios] = useState<
    Array<{
      url: string;
      id: number;
      checked: boolean;
      ref: HTMLAudioElement | null;
    }>
  >();

  const { uploadFiles } = useAWS();
  const { files, error } = useAudioTool(option);
  const [lyrics, setLyrics] = useState('');
  const [getDashboardData] = useLazyGetDashboardDataQuery();

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

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

      setAudios(
        audioFileURLs.map((url, index) => ({
          url,
          id: index,
          checked: false,
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
  const handleChange = (
    event: SelectChangeEvent<any>,
    child: React.ReactNode
  ) => {
    resetTranscript();
    setOption(event.target.value);
  };
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
  };

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
        .then(() => {
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
          dispatch(setRefresh(new Date().getTime()));
          // get anaylsis data
          getDashboardData({ path: folderName }).then(({ data, error }) => {
            saveAnalysis(data, error as SerializedError, folderName);
          });
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
    <AnimatePresence key={'audio-tool'}>
      <PromptModal
        key={'prompt-modal'}
        title="New Recording"
        description="Are you sure you want to create a new recording? Any unsaved changes will be lost."
        onClose={handleCloseConfirmation}
        onConfirm={handleNewRecording}
        open={askForConfirmation}
      />

      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        onClose={handleClose}
        sx={{ '& .MuiPaper-root': { height: '100%', zIndex: 0 } }}
        disableEnforceFocus
        disableEscapeKeyDown
      >
        <DialogTitle display={'flex'} flexDirection={'row'}>
          AUDIO TOOL
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
            Use this tool to create a new audio file.
          </DialogContentText>
          <Divider />
          <Stack
            alignItems={'center'}
            display={'flex'}
            height={'calc(100% - 25px)'}
            justifyContent={'flex-start'}
          >
            <Grid
              container
              gridAutoColumns={'1fr'}
              gridAutoFlow={'column'}
              alignItems={'center'}
              columnGap={2}
            >
              <FormControl sx={{ m: '10px 0px', minWidth: 150 }} size="small">
                <Select
                  labelId="demo-select-small"
                  id="demo-select-small"
                  value={option}
                  onChange={handleChange}
                  disabled={status === 'recording'}
                >
                  <MenuItem value={'Input0'}>Input 0</MenuItem>
                  <MenuItem value={'Input2'}>Input 2</MenuItem>
                  <MenuItem value={'Input3'}>Input 3</MenuItem>
                </Select>
              </FormControl>
              <Divider orientation="vertical" sx={{ height: '30px' }} />
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
              <Divider orientation="vertical" sx={{ height: '30px' }} />
              <Metronome />
              <Stack direction={'row'} spacing={3} alignItems={'center'}>
                <Divider orientation="vertical" sx={{ height: '30px' }} />
                <Stack direction={'row'} alignItems={'center'} spacing={1}>
                  <IconButton
                    sx={{ width: 50, height: 50 }}
                    onClick={() => setSetNumber(Math.max(setNumber - 1, 1))}
                  >
                    <ArrowDropDownTwoToneIcon fontSize="large" />
                  </IconButton>
                  <BorderBox
                    width={'30px'}
                    height={'30px'}
                    borderRadius={'8px'}
                  >
                    <Typography>{setNumber}</Typography>
                  </BorderBox>
                  <IconButton
                    edge="start"
                    sx={{ width: 50, height: 50 }}
                    onClick={() => setSetNumber(Math.min(setNumber + 1, 10))}
                  >
                    <ArrowDropUpTwoToneIcon fontSize="large" />
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
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
              {browserSupportsSpeechRecognition && (
                <TextArea text={transcript} />
              )}
            </Box>
          </Stack>
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
