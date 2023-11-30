import { useDispatch } from 'react-redux';
import {
  Paper,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button
} from '@mui/material';
import { setLoggedIn, setUser } from 'store/dashboard';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { object, string, ValidationError } from 'yup';
import { UserType } from 'types/user';

// Define the validation schema for the inputs
const userSchema = object().shape({
  email: string().email().required(),
  name: string().required()
});

export const Login = () => {
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
      dispatch(setLoggedIn(true));
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
      <Card sx={{ width: '400px', borderRadius: '10px', padding: '0px 20px' }}>
        <CardContent>
          <CardHeader title="Welcome!" />
          <TextField
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
          <Button
            sx={{ height: 45, width: 100, marginTop: '10px' }}
            variant="custom"
            onClick={handleLogin}
          >
            LOGIN
          </Button>
        </CardContent>
      </Card>
    </Paper>
  );
};
