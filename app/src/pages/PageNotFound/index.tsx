import { Stack, Paper, Typography } from '@mui/material';

/*
 * Error404 page not found
 */
export const PageNotFound = () => {
  return (
    <Paper
      sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: '0px'
      }}
    >
      <Stack direction="column">
        <Paper sx={{ padding: '20px', borderRadius: '10px' }} elevation={0}>
          <Typography fontSize={'xxx-large'}>404</Typography>
          <Typography fontSize={'medium'}>Page Not Found</Typography>
        </Paper>
      </Stack>
    </Paper>
  );
};
