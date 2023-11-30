import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { IconButton, Stack } from '@mui/material';
import { COLORS } from 'theme';
import beep from 'assets/tick.mp3';

export const Metronome: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const [bpm, setBPM] = useState<number>(120);
  //   const [count, setCount] = useState(0);
  const intervalRef = useRef<any>();

  useEffect(() => {
    // Calculate the interval duration based on the BPM
    const intervalDuration = (60 / bpm) * 1000;

    if (isPlaying) {
      // Start the metronome
      intervalRef.current = setInterval(() => {
        // Increment the count and play a tick sound
        // setCount((count) => count + 1);
        const tick = new Audio(beep);
        tick.play();
      }, intervalDuration);
    } else {
      // Stop the metronome
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, bpm]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setBPM(typeof newValue === 'number' ? newValue : bpm);
  };

  const handlePlayButtonClick = () => {
    setIsPlaying(true);
  };
  const handleStopButtonClick = () => {
    setIsPlaying(false);
    // setCount(0);
  };

  return (
    <Stack
      direction={'row'}
      spacing={1}
      justifyContent={'center'}
      alignItems={'center'}
      width={'auto'}
      flexGrow={1}
      sx={{ color: COLORS.highlightLighter }}
    >
      {isPlaying ? (
        <IconButton onClick={handleStopButtonClick}>
          <StopIcon />
        </IconButton>
      ) : (
        <IconButton onClick={handlePlayButtonClick}>
          <PlayArrowIcon />
        </IconButton>
      )}
      <Slider
        value={typeof bpm === 'number' ? bpm : 0}
        onChange={handleSliderChange}
        aria-labelledby="input-slider"
        sx={{ color: COLORS.highlightLighter, maxWidth: '200px' }}
        min={60}
        max={240}
        step={1}
      />

      <Stack
        direction={'row'}
        spacing={0.4}
        textAlign={'right'}
        width={'90px'}
        justifyContent={'center'}
      >
        <Typography fontSize={'small'}>{bpm}</Typography>
        <Typography fontSize={'small'}>bpm</Typography>
      </Stack>
    </Stack>
  );
};
