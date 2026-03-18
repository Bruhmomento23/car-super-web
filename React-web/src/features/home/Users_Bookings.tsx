import * as React from 'react';
import { Container, Grid, Box, Typography, Paper, Button, Chip, Avatar, Divider, Card, Stack } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../../theme/AppTheme';
import AppAppBar from '../../components/AppAppBar';
import Footer from '../../components/Footer';

// Icons for Status
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HistoryIcon from '@mui/icons-material/History';

export default function MyBookings(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />

      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Grid container spacing={4}>
          
          {/* LEFT SIDE: User Profile & Quick Stats */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: 'background.paper', position: { md: 'sticky' }, top: '100px' }}>
              <Avatar 
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
              >
                JD
              </Avatar>
              <Typography variant="h6" fontWeight="800">John Doe</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>Member since 2024</Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Stack spacing={2} sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Bookings</Typography>
                  <Chip label="2" size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Repairs</Typography>
                  <Typography variant="body2" fontWeight="bold">14</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Saved Workshops</Typography>
                  <Typography variant="body2" fontWeight="bold">5</Typography>
                </Box>
              </Stack>

              <Button variant="outlined" fullWidth sx={{ mt: 4, borderRadius: 2, textTransform: 'none' }}>
                Edit Profile
              </Button>
            </Paper>
          </Grid>

          {/* RIGHT SIDE: Booking History & Status */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
              <Box>
                <Typography variant="h4" fontWeight="800">My Garage</Typography>
                <Typography variant="body1" color="text.secondary">Manage your upcoming and past services</Typography>
              </Box>
              <Button variant="contained" startIcon={<DirectionsCarIcon />} sx={{ borderRadius: 3, px: 3 }}>
                Book New Service
              </Button>
            </Box>

            {/* UPCOMING BOOKING CARD */}
            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PendingActionsIcon color="warning" /> Upcoming Appointments
            </Typography>

            <Card variant="outlined" sx={{ mb: 4, borderRadius: 4, p: 3, borderLeft: '6px solid #ed6c02' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 2 }}>
                   <Box sx={{ textAlign: 'center', bgcolor: 'grey.100', p: 1, borderRadius: 2 }}>
                      <Typography variant="h5" fontWeight="800">24</Typography>
                      <Typography variant="caption" fontWeight="bold">MARCH</Typography>
                   </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="h6" fontWeight="bold">Full Engine Tune-up</Typography>
                  <Typography variant="body2" color="text.secondary">AutoPro Workshop - Downtown</Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'warning.main', fontWeight: 'bold' }}>
                    Status: Awaiting Vehicle Drop-off
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { sm: 'right' } }}>
                  <Button variant="text" size="small" sx={{ fontWeight: 'bold' }}>Reschedule</Button>
                  <Button variant="contained" size="small" disableElevation sx={{ ml: 1, borderRadius: 2 }}>Details</Button>
                </Grid>
              </Grid>
            </Card>

            {/* PAST BOOKINGS */}
            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="action" /> Past Services
            </Typography>

            {[1, 2].map((i) => (
              <Card key={i} variant="outlined" sx={{ mb: 2, borderRadius: 4, p: 2, opacity: 0.8 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 2, sm: 1 }}>
                    <CheckCircleIcon color="success" />
                  </Grid>
                  <Grid size={{ xs: 10, sm: 7 }}>
                    <Typography fontWeight="bold">Oil Change & Filter Replacement</Typography>
                    <Typography variant="caption" color="text.secondary">Completed on Feb 12, 2024 • Total: $85.00</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'right' }}>
                    <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>Download Invoice</Button>
                    <Button variant="text" size="small" sx={{ ml: 1, textTransform: 'none', fontWeight: 'bold' }}>Re-book</Button>
                  </Grid>
                </Grid>
              </Card>
            ))}

          </Grid>
        </Grid>
      </Container>
      <Footer />
    </AppTheme>
  );
}