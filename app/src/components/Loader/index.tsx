import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';

export const Loader = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress color="secondary" />
    </Box>
  );
};
