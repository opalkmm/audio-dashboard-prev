import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Typography,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
  Divider,
  useTheme
} from '@mui/material';
import { setUser } from 'store/dashboard';
import { useNavigate } from 'react-router';
import { object, string, ValidationError } from 'yup';
import { UserType } from 'types/user';
import { COLORS } from 'theme';
import { AnimatePresence } from 'framer-motion';
import { Apple, FacebookRounded, Google } from '@mui/icons-material';

/*
 * Login Modal component
 */

// Define the validation schema for the inputs
const userSchema = object().shape({
  email: string().email().required(),
  name: string().required()
});

interface Props {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ open, onClose }) => {
  const theme = useTheme();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = localStorage.getItem('user');

  // check if user is logged in
  useEffect(() => {
    if (user) {
      try {
        const parsedUser = JSON.parse(user) as UserType;
        dispatch(setUser(parsedUser));
        navigate('/audio-tool');
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, [dispatch, navigate, user]);

  const [errors, setErrors] = useState<UserType>({
    name: '',
    email: ''
  });

  const handleLogin = async () => {
    // Validate the inputs
    try {
      await userSchema.validate({ email, name }, { abortEarly: false });
      // save the user to local storage
      localStorage.setItem('user', JSON.stringify({ name, email }));
      // if validation is successful, clear errors
      setErrors({ name: '', email: '' });
      // dispatch the user to the store
      dispatch(setUser({ name, email }));
    } catch (error: any) {
      const { inner } = error as ValidationError;
      const newErrors = { name: '', email: '' };
      inner.forEach(({ path, message }) => {
        newErrors[path as keyof UserType] = message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <AnimatePresence key={'audio-tool'}>
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
        onClose={onClose}
        disableEscapeKeyDown
        sx={{
          '.MuiPaper-root': {
            padding: theme.spacing(1),
            border: `2px solid ${COLORS.highlight}`,
            background: COLORS.paper
          },
          zIndex: 1500
        }}
      >
        <DialogTitle
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          variant="h4"
        >
          Login
        </DialogTitle>
        <DialogContent
          sx={{
            paddingBottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography>Please enter your name and email to continue</Typography>
          <Stack
            direction={'column'}
            spacing={2}
            justifyContent={'center'}
            display={'flex'}
            alignItems={'center'}
            width={'100%'}
          >
            <TextField
              name="name"
              type="text"
              id="outlined-basic"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              name="email"
              type="email"
              id="outlined-basic"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Stack>
        </DialogContent>
        <DialogActions
          disableSpacing
          sx={{ height: 90, padding: '24px', justifyContent: 'center' }}
        >
          <Button
            onClick={handleLogin}
            sx={{ width: '200px' }}
            variant="custom"
          >
            Login
          </Button>
        </DialogActions>
        <Divider orientation="horizontal">OR</Divider>
        <DialogActions>
          <Stack
            direction={'column'}
            spacing={2}
            justifyContent={'center'}
            width={'100%'}
          >
            <Button
              fullWidth
              startIcon={<FacebookRounded />}
              sx={{
                py: theme.spacing(1),
                background: COLORS.blue,
                color: theme.palette.common.white,
                borderRadius: theme.shape.borderRadius,
                '&:hover': {
                  background: COLORS.blue,
                  color: theme.palette.common.white
                }
              }}
            >
              Continue with facebook
            </Button>
            <Button
              fullWidth
              startIcon={<Apple />}
              sx={{
                py: theme.spacing(1),
                background: theme.palette.common.black,
                color: theme.palette.common.white,
                borderRadius: theme.shape.borderRadius,
                '&:hover': {
                  background: theme.palette.common.black,
                  color: theme.palette.common.white
                }
              }}
            >
              Continue with apple
            </Button>
            <Button
              fullWidth
              startIcon={<Google />}
              sx={{
                background: theme.palette.common.white,
                color: theme.palette.common.black,
                borderRadius: theme.shape.borderRadius,
                py: theme.spacing(1),
                '&:hover': {
                  background: theme.palette.common.white,
                  color: theme.palette.common.black
                }
              }}
            >
              Continue with google
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </AnimatePresence>
  );
};
