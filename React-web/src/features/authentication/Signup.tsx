import * as React from 'react';
import { 
  Box, Button, Checkbox, CssBaseline, FormControlLabel, 
  Link, TextField, Typography, Stack, Grid, CircularProgress, Alert, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../../theme/AppTheme';
import ColorModeSelect from '../../theme/ColorModeSelect';
import { SitemarkIcon } from '../../components/CustomIcons';
import { auth, db } from '../../backend/Firebase_config';
import { setPersistence, browserSessionPersistence, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';

import { Link as RouterLink } from 'react-router-dom'; // The Router navigation link


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
    width: '500px',
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
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [accountType, setAccountType] = React.useState<'driver' | 'workshop'>('driver');

  // --- NEW STATE VARIABLES ---
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [addressLine1, setAddressLine1] = React.useState('');
  const [addressLine2, setAddressLine2] = React.useState('');
  const [city, setCity] = React.useState('Singapore');
  const [postalCode, setPostalCode] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [businessName, setBusinessName] = React.useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = React.useState('');

// const Card = styled(MuiCard)(({ theme }) => ({
//   display: 'flex',
//   flexDirection: 'column',
//   alignSelf: 'center',
//   width: '100%',
//   padding: theme.spacing(4),
//   gap: theme.spacing(2),
//   margin: 'auto',
//   [theme.breakpoints.up('sm')]: { width: '600px' }, // Widened for grid fields
// }));

// const SignUpContainer = styled(Stack)(({ theme }) => ({
//   minHeight: '100dvh',
//   padding: theme.spacing(2),
// }));
const SignUpWithEmailAndPassword = async (event: React.FormEvent) => {
  event.preventDefault();
  if (!termsAccepted) return;
  setError('');
  setLoading(true);

  let newUser = null;
  const normalizedUsername = username.trim().toLowerCase();

  try {
    // 1. CREATE THE AUTH USER FIRST 
    // This makes the user "Authenticated" so Firestore rules let you search.
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    newUser = userCredential.user;

    if (accountType === 'driver') {
      // Since newUser exists, request.auth is no longer null.
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', normalizedUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await newUser.delete();
        setError('This username is already taken.');
        return;
      }
    }

    // Proceed with profile and Firestore
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const fullName = `${normalizedFirstName} ${normalizedLastName}`.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhoneNumber = phoneNumber.trim();
    const normalizedAddressLine1 = addressLine1.trim();
    const normalizedAddressLine2 = addressLine2.trim();
    const normalizedCity = city.trim();
    const normalizedPostalCode = postalCode.trim();
    const normalizedCountry = country.trim();

    const normalizedBusinessName = businessName.trim();
    const normalizedBusinessRegistrationNumber = businessRegistrationNumber.trim();

    await updateProfile(newUser, { displayName: fullName || normalizedBusinessName || normalizedEmail });
    await sendEmailVerification(newUser);

    if (accountType === 'driver') {
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        phoneNumber: normalizedPhoneNumber,
        addressLine1: normalizedAddressLine1,
        addressLine2: normalizedAddressLine2 || null,
        city: normalizedCity,
        postalCode: normalizedPostalCode,
        country: normalizedCountry || null,
        termsAccepted,
        emailVerified: false,
        profilePictureUrl: null,
        lastSeen: null,
        isOnline: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'workshop_owners', newUser.uid), {
        id: newUser.uid,
        email: normalizedEmail,
        fullName,
        phoneNumber: normalizedPhoneNumber,
        businessName: normalizedBusinessName || null,
        businessRegistrationNumber: normalizedBusinessRegistrationNumber || null,
        verificationStatus: 'pending',
        ownedWorkshopIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileImageUrl: null,
        isActive: true,
        verificationDocumentUrls: null,
        verificationNotes: null,
        verifiedAt: null,
        verifiedBy: null,
        termsAccepted,
        emailVerified: false,
      });
    }

    navigate('/verify-email');
        } catch (err: any) {
    // If anything fails (network error, Firestore rules, etc.)
    // and we already created the Auth user, delete them.
    if (newUser) {
      try {
        await newUser.delete();
      } catch (deleteError) {
        console.error("Cleanup failed", deleteError);
      }
    }
    setError(
      err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.code === 'auth/weak-password'
        ? 'Password must be at least 6 characters.'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : err.message ?? 'Sign up failed. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

 return (
    <AppTheme {...props}>
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography variant="h4" sx={{ mb: 1 }}>Sign up</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Select account type first.
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
            sx={{ mb: 2 }}
          >
            <ToggleButton value="driver">Driver Account</ToggleButton>
            <ToggleButton value="workshop">Workshop Account</ToggleButton>
          </ToggleButtonGroup>
          
          <Box component="form" onSubmit={SignUpWithEmailAndPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            <Grid container spacing={2}>
              {accountType === 'driver' ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField required fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField required fullWidth label="Full Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Business Name (Optional)" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Business Registration Number (Optional)" value={businessRegistrationNumber} onChange={(e) => setBusinessRegistrationNumber(e.target.value)} />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth label="Phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Grid>

              {accountType === 'driver' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField required fullWidth label="Address Line 1" value={addressLine1}  onChange={(e) => setAddressLine1(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField fullWidth label="Address Line 2 (Optional)" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField required fullWidth label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Country (Optional)" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </Grid>
                </>
              )}
            </Grid>

            <FormControlLabel
              control={<Checkbox required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
              label="I accept the terms and conditions"
            />

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ height: 48 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : accountType === 'driver' ? 'Create Driver Account' : 'Create Workshop Account'}
            </Button>
                        <Typography sx={{ textAlign: 'center' }}>
                          Already have an account?{' '}
                          <Link
                            component={RouterLink} // Use the alias here
                             to="/SignIn"
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