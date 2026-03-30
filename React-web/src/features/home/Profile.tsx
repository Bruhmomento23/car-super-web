import * as React from 'react';
import { 
  Container, Grid, Box, Typography, Paper, Button, 
  TextField, Avatar, Divider, Stack, CircularProgress, 
  CssBaseline, IconButton, InputAdornment,
  Chip
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// Theme & Components
import AppTheme from '../../theme/AppTheme';
import AppAppBar from '../../components/AppAppBar';
import Footer from '../../components/Footer';

// Firebase
import { auth, db } from '../../backend/Firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfilePage(props: { disableCustomTheme?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [userData, setUserData] = React.useState<any>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    car: '' // Added car field
  });

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData({
              fullName: data.fullName || '',
              phoneNumber: data.phoneNumber || '',
              email: data.email || '',
              car: data.car || '' // Fetch car from DB
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        car: formData.car // Save car to Firestore
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />

      <Container maxWidth="md" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom>
          Account Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your personal information and vehicle details.
        </Typography>

        <Grid container spacing={4}>
          {/* Left Side: Avatar & Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
                >
                  {formData.fullName.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute', bottom: 15, right: 0,
                    bgcolor: 'background.paper', boxShadow: 2,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {userData?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {userData?.role?.toUpperCase() || 'USER'}
              </Typography>
              
              {/* Mini Car Display in Sidebar */}
              {formData.car && (
                <Chip 
                  icon={<DirectionsCarIcon style={{ fontSize: '1rem' }}/>} 
                  label={formData.car} 
                  variant="outlined" 
                  size="small"
                  sx={{ mt: 1, borderRadius: '8px' }}
                />
              )}
            </Paper>
          </Grid>

          {/* Right Side: Form Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight="800">Personal Details</Typography>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Full Name</Typography>
                  <TextField
                    fullWidth
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Email Address</Typography>
                  <TextField fullWidth disabled value={formData.email} helperText="Email cannot be changed." />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Phone Number</Typography>
                  <TextField
                    fullWidth
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </Box>

                <Divider sx={{ my: 1 }} />
                
                {/* NEW VEHICLE SECTION */}
                <Typography variant="h6" fontWeight="800">Vehicle Information</Typography>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Your Car Model</Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. Toyota Camry 2.5"
                    value={formData.car}
                    onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <DirectionsCarIcon color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                  <Button variant="text" color="inherit">Cancel</Button>
                  <Button 
                    variant="contained" 
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    sx={{ px: 4, borderRadius: 2, fontWeight: 'bold' }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </AppTheme>
  );
}