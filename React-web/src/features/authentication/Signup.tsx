import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../../theme/AppTheme';
import ColorModeSelect from '../../theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../../components/CustomIcons';
import { auth, db } from '../../backend/Firebase_config';
import {setPersistence, browserSessionPersistence,createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'; // Import Firebase Authentication functions
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  // const [emailError, setEmailError] = React.useState(false);
  // const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  // const [passwordError, setPasswordError] = React.useState(false);
  // const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  // const [nameError, setNameError] = React.useState(false);
  // const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  // Inside your component:
const navigate = useNavigate();
const [fullName,setFullName] = React.useState('');
const [email, setEmail] = React.useState('');
const [password, setPassword] = React.useState('');
const [phoneNumber, setPhoneNumber] = React.useState('');
const SignUpWithEmailAndPassword = async (event: React.FormEvent) => {
  if (event) event.preventDefault();

  let newUser = null; // Keep track of the user to delete if Firestore fails

  try {
    // 1. Create User in Firebase Auth
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    newUser = userCredential.user; 

    // 2. Update Auth Profile
    await updateProfile(newUser, { displayName: fullName });

    // 3. Create User Document in Firestore
    try {
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
      
      console.log('User registered in Auth & Firestore');
      navigate('/'); 

    } catch (firestoreError) {
      // If Firestore fails, delete the Auth user so they aren't "stuck"
      if (newUser) {
        await newUser.delete();
      }
      throw firestoreError; // Pass the error to the outer catch
    }

  } catch (error: any) {
    console.error("Sign up error:", error.code);
    
    // Better user messaging
    if (error.code === 'auth/email-already-in-use') {
      alert("This email is already registered. Try logging in!");
    } else if (error.code === 'permission-denied') {
      alert("Permission denied: Check your Firestore rules!");
    } else {
      alert(error.message);
    }
  }
};
    

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={SignUpWithEmailAndPassword}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Jon Snow"
                onChange={(e) => setFullName(e.target.value)}

              />
            </FormControl>
            <FormControl>
          <FormLabel htmlFor="phone">Phone Number</FormLabel>
          <TextField
            required
            fullWidth
            id="phone"
            placeholder="+65 1234 5678"
            name="phone"
            autoComplete="tel"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                onChange={(e) => setEmail(e.target.value)}

              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive updates via email."
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={SignUpWithEmailAndPassword}
              
            >
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign up with Google')}
              startIcon={<GoogleIcon />}
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign up with Facebook')}
              startIcon={<FacebookIcon />}
            >
              Sign up with Facebook
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link
                href="/material-ui/getting-started/templates/sign-in/"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
