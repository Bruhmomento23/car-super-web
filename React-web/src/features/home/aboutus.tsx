import * as React from 'react';
import { Container, Grid, Box, Typography, Paper, Button, Stack, Avatar } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../../theme/AppTheme';
import AppAppBar from '../../components/AppAppBar';
import Footer from '../../components/Footer';

// Icons to match your workshop theme
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';

export default function AboutUs(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />

      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        
        {/* --- HERO SECTION --- */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" color="primary" fontWeight="bold" sx={{ letterSpacing: 2 }}>
            OUR MISSION
          </Typography>
          <Typography variant="h2" fontWeight="800" gutterBottom sx={{ mt: 1 }}>
            Revolutionizing Car Care.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            We connect vehicle owners with the most reliable workshops in the city, 
            making car maintenance as easy as ordering a coffee.
          </Typography>
        </Box>

        {/* --- STATS SECTION (Inspired by your category cards) --- */}
        <Grid container spacing={3} sx={{ mb: 10 }}>
          {[
            { label: 'Workshops', value: '500+', color: '#0066FF' },
            { label: 'Happy Users', value: '10k+', color: '#ff3366' },
            { label: 'Cities', value: '25', color: '#9c27b0' },
            { label: 'Support', value: '24/7', color: '#4caf50' },
          ].map((stat) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 4, 
                  borderBottom: `4px solid ${stat.color}` 
                }}
              >
                <Typography variant="h4" fontWeight="800" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* --- CONTENT BOX: THE "WHY" --- */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
              sx={{ 
                width: '100%', 
                height: 400, 
                bgcolor: 'grey.200', 
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
              }}
            >
               <Typography color="text.secondary">Workshop Image / Team Photo</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" fontWeight="800" gutterBottom>
              Built by car enthusiasts, for everyone.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem' }}>
              Tired of hidden costs and long waiting times? We were too. That's why we built 
              this platform to bring transparency to the automotive industry.
            </Typography>
            
            <Stack spacing={3} sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <VerifiedUserIcon color="primary" />
                <Box>
                  <Typography fontWeight="bold">Certified Partners Only</Typography>
                  <Typography variant="body2" color="text.secondary">Every workshop is manually vetted for quality and fair pricing.</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <SpeedIcon color="secondary" />
                <Box>
                  <Typography fontWeight="bold">Instant Booking</Typography>
                  <Typography variant="body2" color="text.secondary">Forget phone calls. Pick a slot and get your car fixed on your time.</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* --- CALL TO ACTION --- */}
        <Paper 
          sx={{ 
            p: { xs: 4, md: 8 }, 
            borderRadius: 8, 
            bgcolor: 'primary.main', 
            color: 'white', 
            textAlign: 'center',
            backgroundImage: 'linear-gradient(45deg, #0066FF 30%, #9c27b0 90%)'
          }}
        >
          <Typography variant="h3" fontWeight="800" gutterBottom>
            Ready to get your car serviced?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who trust us with their vehicles.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main', 
              px: 6, 
              py: 2, 
              borderRadius: 3,
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#f0f0f0' }
            }}
          >
            Find a Workshop Now
          </Button>
        </Paper>

      </Container>
      <Footer />
    </AppTheme>
  );
}