import * as React from 'react';
import { 
  Container, Grid, Box, Typography, Paper, Button, 
  TextField, Avatar, Divider, Stack, CircularProgress, 
  CssBaseline
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// Theme & Components
import AppTheme from '../../theme/AppTheme';
import AppAppBar from '../../components/AppAppBar';
import Footer from '../../components/Footer';

// Firebase
import { auth, db, storage } from '../../backend/Firebase_config';
import { onAuthStateChanged, updateProfile as updateAuthProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

type UserFormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  profilePictureUrl: string;
};

type Vehicle = {
  id: string;
  licensePlate: string;
  carModel: string;
  carYear: string;
  carColor: string;
  isPrimary: boolean;
};

const VEHICLE_MOCKS: Array<{ carModel: string; carYear: string; carColor: string }> = [
  { carModel: 'Toyota Corolla Altis 1.6', carYear: '2020', carColor: 'Silver' },
  { carModel: 'Honda Civic 1.5 Turbo', carYear: '2022', carColor: 'Black' },
  { carModel: 'Mazda 3 2.0', carYear: '2021', carColor: 'Red' },
  { carModel: 'Hyundai Elantra 1.6', carYear: '2019', carColor: 'Blue' },
  { carModel: 'Kia Cerato 1.6', carYear: '2018', carColor: 'White' },
];

const EMPTY_FORM_DATA: UserFormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: '',
  profilePictureUrl: '',
};

const normalizeLicensePlate = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

const isValidSingaporePlate = (value: string) => /^[A-Z]{1,3}\d{1,4}[A-Z]$/.test(value);

const getRandomVehicleDetails = () =>
  VEHICLE_MOCKS[Math.floor(Math.random() * VEHICLE_MOCKS.length)];

export default function ProfilePage(props: { disableCustomTheme?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [addingVehicle, setAddingVehicle] = React.useState(false);
  const [userData, setUserData] = React.useState<any>(null);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [licensePlateInput, setLicensePlateInput] = React.useState('');
  const profileImageInputRef = React.useRef<HTMLInputElement | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<UserFormData>(EMPTY_FORM_DATA);

  const hydrateFormData = React.useCallback((data: any) => {
    const nextFormData: UserFormData = {
      firstName: (data.firstName || '').toString(),
      lastName: (data.lastName || '').toString(),
      username: (data.username || '').toString(),
      email: (data.email || '').toString(),
      phoneNumber: (data.phoneNumber || '').toString(),
      addressLine1: (data.addressLine1 || '').toString(),
      addressLine2: (data.addressLine2 || '').toString(),
      city: (data.city || '').toString(),
      postalCode: (data.postalCode || '').toString(),
      country: (data.country || '').toString(),
      profilePictureUrl: (data.profilePictureUrl || '').toString(),
    };
    setFormData(nextFormData);
  }, []);

  const loadVehicles = React.useCallback(async (uid: string) => {
    const vehiclesRef = collection(db, 'users', uid, 'vehicles');
    const snapshot = await getDocs(vehiclesRef);
    const vehicleRows = snapshot.docs.map((vehicleDoc) => {
      const data = vehicleDoc.data();
      return {
        id: vehicleDoc.id,
        licensePlate: (data.licensePlate || '').toString(),
        carModel: (data.carModel || '').toString(),
        carYear: (data.carYear || '').toString(),
        carColor: (data.carColor || '').toString(),
        isPrimary: Boolean(data.isPrimary),
      };
    });

    vehicleRows.sort((a, b) => {
      if (a.isPrimary === b.isPrimary) return 0;
      return a.isPrimary ? -1 : 1;
    });

    setVehicles(vehicleRows);
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            hydrateFormData(data);
          }
          await loadVehicles(user.uid);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [hydrateFormData, loadVehicles]);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;

    const normalizedFirstName = formData.firstName.trim();
    const normalizedLastName = formData.lastName.trim();
    const normalizedUsername = formData.username.trim().toLowerCase();
    const normalizedPhone = formData.phoneNumber.trim();
    const normalizedAddressLine1 = formData.addressLine1.trim();
    const normalizedAddressLine2 = formData.addressLine2.trim();
    const normalizedCity = formData.city.trim();
    const normalizedPostalCode = formData.postalCode.trim();
    const normalizedCountry = formData.country.trim();
    const normalizedProfilePictureUrl = formData.profilePictureUrl.trim();
    const fullName = `${normalizedFirstName} ${normalizedLastName}`.trim();

    if (!normalizedFirstName || !normalizedLastName || !normalizedUsername || !normalizedAddressLine1 || !normalizedCity || !normalizedPostalCode) {
      alert('Please fill in all required profile fields.');
      return;
    }

    setSaving(true);
    try {
      const usersRef = collection(db, 'users');
      const usernameSnapshot = await getDocs(query(usersRef, where('username', '==', normalizedUsername)));
      const usernameTaken = usernameSnapshot.docs.some((entry) => entry.id !== auth.currentUser?.uid);
      if (usernameTaken) {
        alert('This username is already taken.');
        setSaving(false);
        return;
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        fullName,
        username: normalizedUsername,
        phoneNumber: normalizedPhone,
        addressLine1: normalizedAddressLine1,
        addressLine2: normalizedAddressLine2 || null,
        city: normalizedCity,
        postalCode: normalizedPostalCode,
        country: normalizedCountry || null,
        profilePictureUrl: normalizedProfilePictureUrl || null,
        updatedAt: serverTimestamp(),
        car: deleteField(),
      });

      await updateAuthProfile(auth.currentUser, {
        displayName: fullName,
        photoURL: normalizedProfilePictureUrl || null,
      });

      const latestUserDoc = await getDoc(userRef);
      if (latestUserDoc.exists()) {
        const latestData = latestUserDoc.data();
        setUserData(latestData);
        hydrateFormData(latestData);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile.");
    }
    setSaving(false);
  };

  const handleCancelChanges = () => {
    if (userData) {
      hydrateFormData(userData);
    } else {
      setFormData(EMPTY_FORM_DATA);
    }
  };

  const handleAddVehicle = async () => {
    if (!auth.currentUser) return;
    const normalizedPlate = normalizeLicensePlate(licensePlateInput);

    if (!normalizedPlate) {
      alert('Please enter a license plate.');
      return;
    }
    if (!isValidSingaporePlate(normalizedPlate)) {
      alert('Enter a valid Singapore plate (e.g. SBA1234A).');
      return;
    }

    setAddingVehicle(true);
    try {
      const details = getRandomVehicleDetails();
      const isPrimary = vehicles.length === 0;

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'vehicles'), {
        licensePlate: normalizedPlate,
        carModel: details.carModel,
        carYear: details.carYear,
        carColor: details.carColor,
        isPrimary,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLicensePlateInput('');
      await loadVehicles(auth.currentUser.uid);
      alert('Vehicle added successfully.');
    } catch (error) {
      console.error('Add vehicle error:', error);
      alert('Failed to add vehicle.');
    }
    setAddingVehicle(false);
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.currentUser) return;

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    const maxFileSizeInBytes = 5 * 1024 * 1024;
    if (selectedFile.size > maxFileSizeInBytes) {
      alert('Please upload an image smaller than 5MB.');
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const fileExtension = selectedFile.name.split('.').pop() || 'jpg';
      const storagePath = `users/${auth.currentUser.uid}/profile/profile-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, selectedFile, { contentType: selectedFile.type });
      const downloadUrl = await getDownloadURL(storageRef);

      setFormData((current) => ({ ...current, profilePictureUrl: downloadUrl }));
    } catch (error) {
      console.error('Profile image upload error:', error);
      alert('Failed to upload profile image.');
    }

    event.target.value = '';
    setUploadingImage(false);
  };

  const avatarUrl = formData.profilePictureUrl.trim();
  const avatarLabel = `${formData.firstName} ${formData.lastName}`.trim() || formData.username || 'U';

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

      <Container maxWidth="lg" sx={{ mt: { xs: 11, md: 15 }, mb: 10, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -20,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 68%)`,
            pointerEvents: 'none',
          }}
        />

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 3,
            borderRadius: 4,
            background: (theme) =>
              `linear-gradient(120deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(
                theme.palette.secondary.main,
                0.08,
              )} 100%)`,
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 0.2 }}>
            Profile Hub
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 760 }}>
            Keep your personal details, profile image, and vehicle information up to date.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  textAlign: 'center',
                  position: { md: 'sticky' },
                  top: { md: 112 },
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  boxShadow: (theme) => `0 18px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                }}
              >
                <Avatar
                  src={avatarUrl || undefined}
                  sx={{
                    width: 128,
                    height: 128,
                    mx: 'auto',
                    mb: 1.5,
                    bgcolor: 'primary.main',
                    fontSize: '3.1rem',
                    border: (theme) => `4px solid ${alpha(theme.palette.background.paper, 0.9)}`,
                  }}
                >
                  {avatarLabel.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h6" fontWeight={800}>
                  {avatarLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  @{formData.username || 'user'}
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={uploadingImage}
                  sx={{ borderRadius: 999, py: 1.1, fontWeight: 700 }}
                >
                  {uploadingImage ? 'Uploading Image...' : 'Upload Profile Image'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                  JPG, PNG or WEBP up to 5MB
                </Typography>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  style={{ display: 'none' }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
                }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                    Account Snapshot
                  </Typography>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2" fontWeight={600}>{formData.email || 'Not set'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">City</Typography>
                    <Typography variant="body2" fontWeight={600}>{formData.city || 'Not set'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Vehicles</Typography>
                    <Typography variant="body2" fontWeight={600}>{vehicles.length} saved</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Box
                sx={{
                  px: { xs: 2.5, md: 3.5 },
                  py: 2,
                  background: (theme) =>
                    `linear-gradient(100deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(
                      theme.palette.primary.main,
                      0.85,
                    )} 100%)`,
                }}
              >
                <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 800 }}>
                  Edit Profile Details
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.86), mt: 0.5 }}>
                  Required fields are marked and validated before saving.
                </Typography>
              </Box>

              <Stack spacing={2.25} sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.75 }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        required
                        fullWidth
                        label="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        disabled
                        label="Email Address"
                        value={formData.email}
                        helperText="Email cannot be changed."
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.04),
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.75 }}>
                    Address Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        required
                        fullWidth
                        label="Address Line 1"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Address Line 2 (Optional)"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        label="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        required
                        fullWidth
                        label="Postal Code"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Country (Optional)"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 3 }}
                >
                  <Stack spacing={1.6}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Vehicles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add only your license plate. Vehicle details are auto-filled with temporary mock data.
                    </Typography>

                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                          fullWidth
                          label="License Plate"
                          placeholder="e.g., SBA1234A"
                          value={licensePlateInput}
                          onChange={(e) => setLicensePlateInput(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          disabled={addingVehicle}
                          onClick={handleAddVehicle}
                          sx={{ height: 56, borderRadius: 2 }}
                        >
                          {addingVehicle ? 'Adding...' : 'Add Vehicle'}
                        </Button>
                      </Grid>
                    </Grid>

                    {vehicles.length === 0 ? (
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.background.default, 0.45) }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No vehicles added yet.
                        </Typography>
                      </Paper>
                    ) : (
                      <Stack spacing={1.25}>
                        {vehicles.map((vehicle) => (
                          <Paper
                            key={vehicle.id}
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              borderColor: vehicle.isPrimary ? 'primary.main' : 'divider',
                              backgroundColor: (theme) =>
                                vehicle.isPrimary ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper,
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={800}>
                              {vehicle.licensePlate} {vehicle.isPrimary ? '(Primary)' : ''}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {vehicle.carModel} - {vehicle.carYear} - {vehicle.carColor}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                    pt: 1,
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1,
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(6px)',
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    mt: 1,
                    pb: 0.5,
                  }}
                >
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={handleCancelChanges}
                    sx={{ borderRadius: 2, px: 2.25 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateProfile}
                    disabled={saving || uploadingImage}
                    sx={{ px: 3.5, borderRadius: 2, fontWeight: 800 }}
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