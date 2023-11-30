import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  IconButton,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Card,
  Stack
} from '@mui/material';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import { COLORS } from 'theme';
import { AnimatePresence } from 'framer-motion';
import { useAWS } from 'hooks/aws';
import { setSnackbar, useDashboard } from 'store/dashboard';
import PlayCircleFilledWhiteTwoToneIcon from '@mui/icons-material/PlayCircleFilledWhiteTwoTone';
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone';
import { Loader } from 'components/Loader';
import { AUDIO_RECORDING_FOLDER } from 'config';
import { AWSError } from 'aws-sdk';

interface Props {
  open: boolean;
  onClose: () => void;
}

type archive = {
  path: string;
  created_at: string;
  isPlaying: boolean;
  blobUrl?: string;
  isLoading?: boolean;
};

export const ArchiveModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { listFiles, downloadFiles } = useAWS();
  const [archives, setArchives] = useState<archive[]>([]);
  const { user } = useDashboard();

  useEffect(() => {
    const getArchives = async () => {
      try {
        const archives = await listFiles({
          folder: `${user.email}/${AUDIO_RECORDING_FOLDER}`
        });

        if (archives && archives.Contents && archives.Contents.length > 0) {
          const contents = archives.Contents;
          // create a list of archives where the name and created_at are extracted from the key and are not undefined
          const archivesList = contents
            .map((archive) => {
              const key = archive.Key;
              const path = key?.split(`/${AUDIO_RECORDING_FOLDER}/`)[1];
              const created_at = archive.LastModified?.toLocaleDateString(
                'en-US',
                {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              );
              if (path && created_at) {
                return {
                  path,
                  created_at
                };
              }
              return undefined;
            })
            .filter((archive) => archive !== undefined) as archive[];
          setArchives(archivesList);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getArchives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePlayRecording = async (path: string, isPlaying: boolean) => {
    if (isPlaying) {
      setArchives((prev) => {
        const updated = prev.find((a) => a.path === path);
        if (updated) {
          updated.isPlaying = false;
        }
        return [...prev];
      });
      return;
    }
    // set isPlaying state to false for all archives
    setArchives((prev) => {
      const updated = prev.map((a) => {
        a.isPlaying = false;
        return a;
      });
      return [...updated];
    });

    // set the isLoading state to true for the archive that is being played
    setArchives((prev) => {
      const updated = prev.find((a) => a.path === path);
      if (updated) {
        updated.isLoading = true;
      }
      return [...prev];
    });

    // download the file from s3
    try {
      const file = await downloadFiles({
        path: `${user.email}/${AUDIO_RECORDING_FOLDER}/${path}`
      });

      // create a blob url from the file
      const blobUrl = URL.createObjectURL(
        new Blob([file.Body as Uint8Array], { type: file.ContentType })
      );

      // set the isPlaying state to true for the archive that is being played
      setArchives((prev) => {
        const updated = prev.find((a) => a.path === path);
        if (updated) {
          updated.isPlaying = true;
          updated.blobUrl = blobUrl;
        }
        return [...prev];
      });
    } catch (error) {
      dispatch(
        setSnackbar({ message: (error as AWSError).message, variant: 'error' })
      );
    } finally {
      // set the isLoading state to false for the archive that is being played
      setArchives((prev) => {
        const updated = prev.find((a) => a.path === path);
        if (updated) {
          updated.isLoading = false;
        }
        return [...prev];
      });
    }
  };

  return (
    <AnimatePresence key={'audio-tool'}>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        onClose={onClose}
        disableEscapeKeyDown
        sx={{
          '.MuiPaper-root': {
            // minHeight: '300px',
            border: `2px solid ${COLORS.highlight}`,
            background: COLORS.paper
          }
        }}
      >
        <IconButton
          onClick={onClose}
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
          Archives
        </DialogTitle>
        <DialogContent>
          <Stack direction={'column'} spacing={1.5}>
            {archives && archives.length > 0 ? (
              archives.map((archive, index) => (
                <Card
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0px 16px',
                    height: '60px'
                  }}
                >
                  <Typography variant="subtitle1">
                    {archive.created_at}
                  </Typography>
                  {archive.isLoading ? (
                    <Loader />
                  ) : (
                    <IconButton
                      disableRipple
                      onClick={() =>
                        handlePlayRecording(archive.path, archive.isPlaying)
                      }
                    >
                      {archive.isPlaying ? (
                        <>
                          <audio
                            src={archive.blobUrl}
                            autoPlay
                            onEnded={() =>
                              setArchives((prev) => {
                                const updated = prev.find(
                                  (a) => a.path === archive.path
                                );
                                if (updated) {
                                  updated.isPlaying = false;
                                }
                                return [...prev];
                              })
                            }
                          />
                          <StopCircleTwoToneIcon
                            fontSize="large"
                            sx={{ color: COLORS.secondaryLight }}
                          />
                        </>
                      ) : (
                        <PlayCircleFilledWhiteTwoToneIcon
                          fontSize="large"
                          sx={{ color: COLORS.secondaryLight }}
                        />
                      )}
                    </IconButton>
                  )}
                </Card>
              ))
            ) : (
              <Box
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                height={'100%'}
              >
                <Typography variant="h5">No archives found</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};
