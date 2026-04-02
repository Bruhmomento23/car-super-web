import * as React from 'react';
import { Box, Button, Typography, Stack, Link, CssBaseline } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { auth, db } from '../../backend/Firebase_config';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AppTheme from '../../theme/AppTheme';
import { SitemarkIcon } from '../../components/CustomIcons';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(3),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: { width: '450px' },
}));

const Container = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  padding: theme.spacing(2),
}));

export default function VerifyEmail(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // If no user is logged in, send them back to sign up
  React.useEffect(() => {
    if (!auth.currentUser) {
      navigate('/SignIn');
    }
  }, [auth.currentUser, navigate]);
    React.useEffect(() => {
    const interval = setInterval(async () => {
        if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
            // Update Firestore
            await setDoc(doc(db, "users", auth.currentUser.uid), {
            emailVerified: true,
            updatedAt: serverTimestamp(),
            }, { merge: true });
            
            clearInterval(interval);
            navigate('/');
        }
        }
    }, 3000); // Check every 3 seconds

  return () => clearInterval(interval); // Cleanup on unmount
}, [navigate]);
  const handleResendEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        alert("Verification email sent!");
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleBackToSignIn = async () => {
    await signOut(auth);
    navigate('/SignIn');
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Container direction="column" justifyContent="center">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography variant="h4">Verify your email</Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            We've sent a verification link to <strong>{user?.email}</strong>. 
            Please check your inbox and click the link to activate your account.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => window.location.reload()}
            >
              I've verified my email
            </Button>
            
            <Button fullWidth variant="outlined" onClick={handleResendEmail}>
              Resend verification email
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center' }}>
            Wrong email?{' '}
            <Link component="button" variant="body2" onClick={handleBackToSignIn}>
              Go back to Sign In
            </Link>
          </Typography>
        </Card>
      </Container>
    </AppTheme>
  );
}