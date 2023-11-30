import { motion } from 'framer-motion';
import { Box, Fab, Paper, styled } from '@mui/material';
import { COLORS } from 'theme';

export const headerHeight = 48;
export const minimizedWidth = 150;
export const expandedHeight = 660;
export const expandedWidth = 450;
export const inputHeight = 66;
export const totalHeight = headerHeight + expandedHeight + inputHeight;

export const Wrapper = styled(motion.div)`
  position: fixed;
  bottom: 0;
  margin-left: 'auto';
  right: 20px;
  z-index: 1400;
  &.marginIcon {
    margin-bottom: 20px;
  }
`;

export const ChatbotFab = styled(Fab)`
  background-color: ${COLORS.paper};
  background-image: linear-gradient(
    135deg,
    ${COLORS.highlightDarker} 0%,
    ${COLORS.highlight} 100%
  );
  color: ${COLORS.highlightLighter};
  float: right;
`;

export const Container = styled(Paper)`
  border-radius: 8px 8px 0px 0px;
  display: grid;
  grid-auto-flow: row;
  height: 100%;
  width: 100%;
  grid-template-rows: ${headerHeight}px ${expandedHeight}px ${inputHeight}px;
`;

export const ChatHeader = styled(Box)`
  display: flex;
  flex-direction: row;
  min-height: ${headerHeight}px;
  align-items: center;
  background-color: ${COLORS.highlight};
  padding: 0px 16px;
  border-radius: 8px 8px 0px 0px;
  color: ${COLORS.highlightLighter};

  &.minimized {
    justify-content: center;
  }
  &.expanded {
    justify-content: space-between;
  }
`;

export const ChatBody = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: 16px;
  /* flex-grow: 1; */
  &.minimized {
    opacity: 0;
  }
  &.expanded {
    opacity: 1;
  }
`;

export const ChatMessageContainer = styled(Box)`
  display: grid;
  grid-auto-flow: row;
  overflow-y: scroll;
  margin-bottom: 2px;
`;

export const ChatStyles = {
  user: {
    backgroundColor: COLORS.highlightLighter,
    color: COLORS.highlight,
    borderRadius: '8px 8px 0px 8px',
    padding: '8px 16px',
    margin: '0px 0px 8px auto',
    boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
  },
  bot: {
    backgroundColor: COLORS.highlight,
    color: COLORS.highlightLighter,
    borderRadius: '8px 8px 8px 0px',
    padding: '8px 16px',
    margin: '0px auto 8px 0px',
    boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
  }
};
