import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { COLORS } from 'theme';

export const BorderBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid ${COLORS.highlight};
`;
