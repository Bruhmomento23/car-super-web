import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import ForgotPassword from '../../components/ForgotPassword';
import AppTheme from '../../theme/AppTheme';
import ColorModeSelect from '../../theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../../components/CustomIcons';
import { Link as RouterLink } from 'react-router-dom'; // The Router navigation link
import { auth, db } from '../../backend/Firebase_config';
import { setPersistence, signInWithEmailAndPassword, browserSessionPersistence, signOut } from "firebase/auth"; // Import Firebase Authentication functions
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

console.log('SignIn page rendered');

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const friendlySignInError = (code: string) => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Incorrect email or password.';
    case 'auth/too-many-requests': return 'Too many failed attempts. Please try again later.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    default: return 'Sign in failed. Please try again.';
  }
};

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [accountType, setAccountType] = React.useState<'driver' | 'workshop'>('driver');
  const navigate = useNavigate();

  const SigninwithEmailAndPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const signedInUser = userCredential.user;

      if (accountType === 'driver') {
        const userDoc = await getDoc(doc(db, 'users', signedInUser.uid));
        if (!userDoc.exists()) {
          await signOut(auth);
          setError('This account is not registered as a driver account.');
          return;
        }
        navigate('/');
        return;
      }

      const ownerDoc = await getDoc(doc(db, 'workshop_owners', signedInUser.uid));
      if (!ownerDoc.exists()) {
        await signOut(auth);
        setError('This account is not registered as a workshop account.');
        return;
      }

      navigate('/WorkshopPortal');
    } catch (err: any) {
      setError(friendlySignInError(err.code));
    } finally {
      setLoading(false);
    }
  };




  
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };





  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose the account type you want to access.
          </Typography>
          <ToggleButtonGroup
            value={accountType}
            exclusive
            color="primary"
            fullWidth
            onChange={(_e, nextValue: 'driver' | 'workshop' | null) => {
              if (nextValue) {
                setAccountType(nextValue);
                setError('');
              }
            }}
            sx={{ mt: 1, mb: 1 }}
          >
            <ToggleButton value="driver">Driver Account</ToggleButton>
            <ToggleButton value="workshop">Workshop Account</ToggleButton>
          </ToggleButtonGroup>
          <Box
            component="form"
            onSubmit={SigninwithEmailAndPassword}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                // error={emailError}
                // helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                // error={passwordError}
                // helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ height: 44 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : accountType === 'driver' ? 'Sign in as Driver' : 'Sign in as Workshop'}
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Forgot your password?
            </Link>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign in with Google')}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign in with Facebook')}
              startIcon={<FacebookIcon />}
            >
              Sign in with Facebook
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link
                component={RouterLink} // Use the alias here
                 to="/SignUp"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
