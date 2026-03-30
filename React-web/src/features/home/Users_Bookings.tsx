import * as React from 'react';
import { 
  Container, Grid, Box, Typography, Paper, Button, 
  Chip, Avatar, Divider, Card, Stack, CircularProgress, 
  CssBaseline, CardMedia, Rating
} from '@mui/material';
import { Link } from 'react-router-dom';

// Theme & Components
import AppTheme from '../../theme/AppTheme';
import AppAppBar from '../../components/AppAppBar';
import Footer from '../../components/Footer';

// Firebase
import { auth, db } from '../../backend/Firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// API Service
import { fetchSingaporeWorkshops } from '../services/workshopServices';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HistoryIcon from '@mui/icons-material/History';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';

export default function MyBookings(props: { disableCustomTheme?: boolean }) {
  const [loading, setLoading] = React.useState(true);
  const [userData, setUserData] = React.useState<any>(null);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [workshops, setWorkshops] = React.useState<any[]>([]);
  const [displayLimit, setDisplayLimit] = React.useState(3); // For "View All" logic

  React.useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Workshops from API
      try {
        const workshopData = await fetchSingaporeWorkshops();
        setWorkshops(workshopData);
      } catch (err) {
        console.error("Workshop fetch error", err);
      }

      // 2. Auth & Firestore
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) setUserData(userDoc.data());

            const q = query(collection(db, "bookings"), where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);
            setAppointments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch (error) {
            console.error("Firestore error:", error);
          }
        }
        setLoading(false);
      });
      return unsubscribe;
    };

    fetchData();
  }, []);

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />

      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Grid container spacing={4}>
          
          {/* LEFT SIDE: User Profile Card */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, textAlign: 'center', position: { md: 'sticky' }, top: '100px' }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                {getInitials(userData?.fullName)}
              </Avatar>
              <Typography variant="h6" fontWeight="800">{userData?.fullName || "User"}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userData?.car ? `Driving: ${userData.car}` : "No vehicle added"}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Stack spacing={2} sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Appointments</Typography>
                  <Chip label={appointments.length} size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Points Earned</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">450 pts</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT SIDE: Booking History & Recommendations */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
              <Box>
                <Typography variant="h4" fontWeight="800">My Garage</Typography>
                <Typography variant="body1" color="text.secondary">Manage your car services</Typography>
              </Box>
              <Button variant="contained" startIcon={<DirectionsCarIcon />} component={Link} to="/Services" sx={{ borderRadius: 3 }}>
                Book New Service
              </Button>
            </Box>

            {/* UPCOMING & HISTORY SECTION */}
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingActionsIcon color="warning" /> Upcoming
                </Typography>
                {/* Check for appointments with 'Pending' status here */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 4, borderLeft: '6px solid #ed6c02' }}>
                  <Typography color="text.secondary">No active tasks for your {userData?.car || 'vehicle'}.</Typography>
                </Card>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="action" /> Past Services
                </Typography>
                {appointments.length > 0 ? (
                  appointments.map((booking) => (
                    <Card key={booking.id} variant="outlined" sx={{ mb: 2, borderRadius: 4, p: 2 }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={2} alignItems="center">
                             <CheckCircleIcon color="success" />
                             <Box>
                                <Typography fontWeight="bold">{booking.serviceType}</Typography>
                                <Typography variant="caption" color="text.secondary">{booking.date} • {booking.status}</Typography>
                             </Box>
                          </Stack>
                          <Button size="small" variant="text">Details</Button>
                       </Stack>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No history yet.</Typography>
                )}
              </Box>

              <Divider />

              {/* WORKSHOP API INTEGRATION SECTION */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="800">Explore Nearby Workshops</Typography>
                  <Button 
                    endIcon={<ChevronRightIcon />} 
                    onClick={() => setDisplayLimit(prev => prev === 3 ? 10 : 3)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {displayLimit === 3 ? "View All" : "Show Less"}
                  </Button>
                </Stack>

                <Grid container spacing={2}>
                  {workshops.slice(0, displayLimit).map((ws) => (
                    <Grid key={ws.id} size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', height: '100%' }}>
                        <CardMedia component="img" height="120" image={ws.img} />
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight="800" noWrap>{ws.title}</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                            <StarIcon sx={{ color: '#faaf00', fontSize: '1rem' }} />
                            <Typography variant="caption" fontWeight="bold">4.8</Typography>
                            <Typography variant="caption" color="text.secondary">({ws.location})</Typography>
                          </Stack>
                          <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                            Book
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </AppTheme>
  );
}