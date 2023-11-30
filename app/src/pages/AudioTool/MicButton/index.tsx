import styled from '@emotion/styled';
import MicNoneTwoToneIcon from '@mui/icons-material/MicNoneTwoTone';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import theme from 'theme';
import { AnimatePresence, motion } from 'framer-motion';


/* Mic button component */
const Circle = styled(motion.button)`
  position: relative;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  box-shadow: 0px 0px 25px -7px white;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
`;
const InnerCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  border: 3px solid ${theme.palette.secondary.main};
  background: none;
`;

interface Props {
  isRecording: boolean;
  onClick: () => void;
}

export const MicButton: React.FC<Props> = ({ isRecording, onClick }) => {
  return (
    <AnimatePresence key={'mic-button'}>
      <Circle
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1 }}
        onClick={onClick}
      >
        {isRecording ? (
          <>
            <InnerCircle
              key={'inner-circle-recording'}
              transition={{
                duration: 2,
                ease: 'easeOut',
                repeat: Infinity
              }}
              initial={{
                scale: 0,
                opacity: 0.5
              }}
              animate={{
                scale: 1.4,
                opacity: 0
              }}
              style={{
                borderColor: theme.palette.success.main
              }}
            />
            <StopRoundedIcon sx={{ fontSize: '4em' }} color="success" />
          </>
        ) : (
          <>
            <InnerCircle
              key={'inner-circle'}
              transition={{
                duration: 0.1,
                ease: 'easeOut'
              }}
              initial={{ scale: 1, opacity: 0.5 }}
              style={{
                borderColor: theme.palette.secondary.main
              }}
            />
            <MicNoneTwoToneIcon
              color={isRecording ? 'success' : 'secondary'}
              sx={{ fontSize: '3em' }}
            />
          </>
        )}
      </Circle>
    </AnimatePresence>
  );
};
