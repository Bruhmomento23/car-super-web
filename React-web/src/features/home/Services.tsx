import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid'; 
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack'; 

// Icons
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import StarIcon from '@mui/icons-material/Star';

import AppTheme from '../../theme/AppTheme';
import AppAppBar from '../../components/AppAppBar';
import Footer from '../../components/Footer';

// API Service
import { fetchSingaporeWorkshops } from '../services/workshopServices';
import BookingDialog from './BookingDialog';
import { auth } from '../../backend/Firebase_config';

export default function Services(props: { disableCustomTheme?: boolean }) {
  const [workshops, setWorkshops] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [visibleCount, setVisibleCount] = React.useState(3);
  const [bookingDialogOpen, setBookingDialogOpen] = React.useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = React.useState<{ id: string; title: string; location: string } | null>(null);

  const handleBookNow = (ws: any) => {
    if (!auth.currentUser) {
      window.location.href = '/SignIn';
      return;
    }
    setSelectedWorkshop({ id: ws.id, title: ws.title, location: ws.location });
    setBookingDialogOpen(true);
  };

  React.useEffect(() => {
    const getWorkshops = async () => {
      try {
        const data = await fetchSingaporeWorkshops();
        setWorkshops(data);
      } catch (error) {
        console.error("Failed to load workshops", error);
      } finally {
        setLoading(false);
      }
    };
    getWorkshops();
  }, []);

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />

      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Grid container spacing={4}>
          
          {/* LEFT SIDE: Search & Filters */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, position: { md: 'sticky' }, top: '100px', bgcolor: 'background.paper' }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>Your search</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Location" placeholder="Near me" fullWidth size="small" />
                <TextField label="Service Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} />
                <Button variant="contained" size="large" fullWidth sx={{ mt: 1, borderRadius: 2, fontWeight: 'bold' }}>
                  Find Workshops
                </Button>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" fontWeight="700" gutterBottom>Popular filters</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <FormControlLabel control={<Checkbox size="small" />} label="Open Now" />
                <FormControlLabel control={<Checkbox size="small" />} label="Warranty Included" />
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT SIDE: Results */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>⚡ Popular Searches</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Chip icon={<SettingsIcon />} label="Oil Change" variant="outlined" sx={{ borderRadius: 3, fontWeight: 'bold' }} />
                <Chip icon={<BuildIcon />} label="Brake Service" variant="outlined" sx={{ borderRadius: 3, fontWeight: 'bold' }} />
                <Chip icon={<TireRepairIcon />} label="Tire Rotation" variant="outlined" sx={{ borderRadius: 3, fontWeight: 'bold' }} />
              </Box>
            </Box>

            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>Browse Categories</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'General', icon: <BuildIcon />, color: '#0066FF' },
                  { label: 'Bodywork', icon: <AutoFixHighIcon />, color: '#ff3366' },
                  { label: 'Battery', icon: <BatteryChargingFullIcon />, color: '#9c27b0' },
                  { label: 'Cleaning', icon: <LocalCarWashIcon />, color: '#4caf50' },
                ].map((cat) => (
                  <Grid key={cat.label} size={{ xs: 6, sm: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
                      <Box sx={{ bgcolor: cat.color, color: 'white', p: 1.5, borderRadius: 3, display: 'inline-flex', mb: 1 }}>{cat.icon}</Box>
                      <Typography variant="subtitle2" fontWeight="bold">{cat.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" fontWeight="800" sx={{ mb: 3 }}>Recommended Workshops</Typography>

            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 3 }} />)
            ) : (
              workshops.slice(0, visibleCount).map((ws) => (
                <Card 
                  key={ws.id} 
                  variant="outlined" 
                  sx={{ mb: 3, borderRadius: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, overflow: 'hidden' }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', sm: 280 }, height: { xs: 200, sm: 'auto' }, objectFit: 'cover' }}
                    image={ws.img}
                    alt={ws.title}
                  />
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h5" fontWeight="700">{ws.title}</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Stack direction={"row" as const} spacing={0.5} alignItems="center" justifyContent="flex-end">
                            <StarIcon sx={{ color: '#faaf00', fontSize: '1.2rem' }} />
                            {/* DYNAMIC RATING */}
                            <Typography variant="subtitle2" fontWeight="bold">
                              {ws.rating || 'N/A'}
                            </Typography>
                          </Stack>
                          {/* DYNAMIC REVIEW COUNT */}
                          <Typography variant="caption" color="text.secondary">
                            {ws.reviews ? `${ws.reviews} reviews` : 'New Workshop'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {ws.location} • {ws.isOpen ? 'Open Now' : 'Closed'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* DYNAMIC TAGS */}
                        {ws.tags?.map((tag: string) => (
                          <Chip key={tag} label={tag} size="small" sx={{ borderRadius: 1, fontWeight: 'bold' }} />
                        )) || <Chip label="Verified" size="small" sx={{ borderRadius: 1, fontWeight: 'bold' }} />}
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {/* DYNAMIC PRICE */}
                        <Typography variant="h5" fontWeight="800">
                          {ws.price ? `from $${ws.price}` : 'Price on request'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                          Estimate for Service
                        </Typography>
                        <Button variant="contained" sx={{ borderRadius: 2, px: 4 }} onClick={() => handleBookNow(ws)}>Book Now</Button>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))
            )}

            {!loading && visibleCount < workshops.length && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={handleViewMore}
                  sx={{ borderRadius: 3, px: 8, py: 1.5, fontWeight: 'bold', textTransform: 'none', borderWidth: 2 }}
                >
                  View more workshops
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />

      <BookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        workshop={selectedWorkshop}
      />
    </AppTheme>
  );
}