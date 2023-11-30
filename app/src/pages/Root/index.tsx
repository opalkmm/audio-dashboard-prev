import { Box, CssBaseline } from '@mui/material';
import { Stack } from '@mui/system';
import { useSnackbar } from 'notistack';
import { Navigation } from 'components/Navigation';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router';
import { useDashboard } from 'store/dashboard';
import { useEffect } from 'react';
import ChatBox from 'components/Chatbot';

/*
 * Root page
 * This is the main page that contains the navigation and the content
 */
export const Root = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { snackbar, user } = useDashboard();

  // Redirect to login page if user is not logged in
  useEffect(() => {
    if (!user.name || !user.email) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Show existing snackbar message
  useEffect(() => {
    if (snackbar.message) {
      enqueueSnackbar(snackbar.message, { variant: snackbar.variant });
    }
  }, [snackbar, enqueueSnackbar]);

  return (
    /* cssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */
    <Stack direction={'row'}>
      <CssBaseline />
      <Navigation />
      <ChatBox />
      <Box
        id="content"
        sx={{
          display: 'flex',
          flexGrow: 1
        }}
      >
        <Outlet />
      </Box>
    </Stack>
  );
};
