import * as React from 'react';
import { 
  Box, Typography, Card, CardMedia, Chip, Stack, 
  Grid, Button, Container, Rating, Skeleton, IconButton,
  useTheme, alpha 
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EvStationIcon from '@mui/icons-material/EvStation';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LoginIcon from '@mui/icons-material/Login';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';

import { auth, db } from '../backend/Firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { fetchSingaporeWorkshops } from '../features/services/workshopServices';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function MainContent() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [workshops, setWorkshops] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [userCar, setUserCar] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) setUserCar(userDoc.data().car || null);
      } else {
        setUser(null);
        setUserCar(null);
      }
    });

    const getWorkshops = async () => {
      try {
        const data = await fetchSingaporeWorkshops();
        setWorkshops(data);
      } catch (error) {
        console.error("Failed to fetch workshops", error);
      } finally {
        setLoading(false);
      }
    };

    getWorkshops();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 4 }} />
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 6, md: 3 }}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '24px' }} />
      </Container>
    );
  }

  const featured = workshops[0];
  const trending = workshops.slice(1, 5);

  const actions = [
    { label: 'Emergency', desc: 'Accident help', icon: <WarningIcon />, color: theme.palette.error.main },
    { label: 'Maintenance', desc: 'Book service', icon: <BuildIcon />, color: theme.palette.primary.main },
    { label: 'Promotions', desc: 'Latest deals', icon: <LocalOfferIcon />, color: theme.palette.secondary.main },
    { label: 'Fuel Watch', desc: 'Live prices', icon: <EvStationIcon />, color: theme.palette.success.main },
  ];

  // Common Card Style for Dark Mode Consistency
  const glassStyle = {
    bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.05) : 'background.paper',
    backdropFilter: isDarkMode ? 'blur(10px)' : 'none',
    border: '1px solid',
    borderColor: isDarkMode ? alpha(theme.palette.divider, 0.1) : 'divider',
    borderRadius: '28px',
    boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.04)',
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      // Subtle gradient background for dark mode depth
      background: isDarkMode 
        ? `radial-gradient(circle at 50% -20%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%)`
        : 'none'
    }}>
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 6, md: 10 } }}>
          
          {/* 1. HERO SECTION */}
          <Box>
            <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Typography variant="h3" fontWeight="1000" sx={{ mb: 1, letterSpacing: '-0.03em' }}>
                {user ? `Welcome back, ${user.displayName?.split(' ')[0] || 'Driver'}!` : "AutoCare Redefined."}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, fontWeight: 400 }}>
                {userCar ? `Everything is ready for your ${userCar}.` : "The smartest way to manage your vehicle in Singapore."}
              </Typography>
            </MotionBox>

            <Grid container spacing={2.5}>
              {actions.map((action) => (
                <Grid key={action.label} size={{ xs: 6, md: 3 }}>
                  <MotionBox whileHover={{ y: -5 }}>
                    <Button
                      fullWidth
                      sx={{
                        ...glassStyle,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        p: 3,
                        height: '100%',
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(action.color, isDarkMode ? 0.1 : 0.05),
                          borderColor: alpha(action.color, 0.3),
                        }
                      }}
                    >
                      <Box sx={{ 
                        bgcolor: alpha(action.color, isDarkMode ? 0.2 : 0.1), 
                        p: 1.5, borderRadius: '14px', color: action.color, mb: 2, display: 'flex' 
                      }}>
                        {action.icon}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="900" color="text.primary">
                        {action.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {action.desc}
                      </Typography>
                    </Button>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 2. SMART STATUS BAR */}
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card elevation={0} sx={{ 
              ...glassStyle, 
              p: 2.5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: isDarkMode 
                ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.02)} 100%)`
                : glassStyle.bgcolor
            }}>
              {/* 2.5 USER CAR DASHBOARD */}
{user && userCar && (
  <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
    <Card sx={{ ...glassStyle, p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        
        <Box>
          <Typography variant="h6" fontWeight="900">
            {userCar} Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Next service in ~1,200 km • Estimated $180
          </Typography>
        </Box>

        <Chip 
          label="Healthy" 
          color="success" 
          sx={{ fontWeight: 800, borderRadius: '8px' }} 
        />
      </Stack>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Mileage</Typography>
            <Typography fontWeight="900">82,300 km</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Last Service</Typography>
            <Typography fontWeight="900">2 months ago</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Next Service</Typography>
            <Typography fontWeight="900">June 2026</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Est. Cost</Typography>
            <Typography fontWeight="900">$150–200</Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  </MotionBox>
)}
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: '16px', color: 'white', display: 'flex' }}>
                  <VerifiedUserIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="900">
                    {userCar ? `${userCar} Health Status` : "Connect your vehicle"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userCar ? "No urgent alerts. 4 recommended workshops nearby." : "Sign in to get personalized maintenance alerts."}
                  </Typography>
                </Box>
              </Stack>
              {!user ? (
                <Button component={Link} to="/login" variant="text" sx={{ fontWeight: 800 }}>Login</Button>
              ) : !userCar ? (
                <Button component={Link} to="/Profile" variant="contained" size="small" sx={{ borderRadius: '10px' }}>Add Car</Button>
              ) : (
                <IconButton size="small"><AutorenewIcon fontSize="small" /></IconButton>
              )}
            </Card>
          </MotionBox>

          {/* 3. FEATURED SPECIALIST */}
          <Box>
            <Typography variant="h5" fontWeight="900" sx={{ mb: 3, letterSpacing: '-0.02em' }}>Featured Specialist</Typography>
            <Card elevation={0} sx={{ ...glassStyle, overflow: 'hidden' }}>
              <Grid container>
                <Grid size={{ xs: 12, md: 7 }}>
                  <CardMedia component="img" height="400" image={featured?.img} sx={{ objectFit: 'cover' }} />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }} sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label="Top Rated" color="primary" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
                    <Chip icon={<SpeedIcon sx={{ fontSize: '1rem !important' }}/>} label="Fast Track" variant="outlined" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
                  </Stack>
                  <Typography variant="h4" fontWeight="1000" gutterBottom sx={{ lineHeight: 1 }}>{featured?.title}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Rating value={4.9} readOnly size="small" />
                    <Typography variant="subtitle2" fontWeight="800">4.9</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>{featured?.location}</Typography>
                  <Button variant="contained" fullWidth sx={{ borderRadius: '16px', py: 2, fontWeight: 900, boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.3)}` }}>
                    Book Appointment
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Box>

          {/* 4. TRENDING LIST */}
          {/* 3.5 RECOMMENDED FOR YOU */}
{userCar && (
  <Box>
    <Typography variant="h5" fontWeight="900" sx={{ mb: 3 }}>
      Recommended For You
    </Typography>

    <Grid container spacing={3}>
      {workshops.slice(0, 3).map((w) => (
        <Grid key={w.id} size={{ xs: 12, md: 4 }}>
          <MotionBox whileHover={{ y: -6 }}>
            <Card sx={{ ...glassStyle, p: 2 }}>
              
              <Stack direction="row" spacing={2}>
                <CardMedia
                  component="img"
                  image={w.img}
                  sx={{ width: 100, height: 80, borderRadius: '12px' }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight="900" noWrap>
                    {w.title}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Good for {userCar}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Rating value={4.8} readOnly size="small" />
                    <Typography variant="caption">4.8</Typography>
                  </Stack>
                </Box>
              </Stack>

              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2, borderRadius: '12px', fontWeight: 800 }}
              >
                Book Now
              </Button>

            </Card>
          </MotionBox>
        </Grid>
      ))}
    </Grid>
  </Box>
)}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="900">Popular Workshops</Typography>
              
              
              <Button endIcon={<ChevronRightIcon />} component={Link} to="/services" sx={{ fontWeight: 800 }}>View All</Button>
            </Stack>
            <Grid container spacing={3}>
              {trending.map((w) => (
                <Grid key={w.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <MotionBox whileHover={{ y: -8 }}>
                    <Card elevation={0} sx={{ bgcolor: 'transparent', border: 'none' }}>
                      <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '200px' }}>
                        <CardMedia component="img" image={w.img} height="200" sx={{ transition: '0.6s ease', '&:hover': { transform: 'scale(1.1)' } }} />
                      </Box>
                      <Box sx={{ mt: 2, px: 1 }}>
                        <Typography variant="subtitle1" fontWeight="900" noWrap>{w.title}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ opacity: 0.6 }}>{w.location}</Typography>
                      </Box>
                    </Card>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 5. MOBILE APP DOWNLOAD (MOVED TO BOTTOM) */}
<MotionBox
  initial={{ opacity: 0, scale: 0.98 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  sx={{ 
    ...glassStyle, // Spread first
    // Overrides follow to ensure they take priority
    bgcolor: isDarkMode ? '#000000' : '#ffffff', 
    backdropFilter: isDarkMode ? 'blur(10px)' : 'none',
    backgroundImage: 'none', 
    overflow: 'hidden',
    mt: 4,
    // Ensure the border is subtle in dark mode and visible in light mode
    border: isDarkMode 
      ? `1px solid ${alpha(theme.palette.divider, 0.1)}` 
      : '1px solid #f0f0f0',
    boxShadow: isDarkMode ? 'none' : '0 30px 60px rgba(0,0,0,0.05)',
  }}
>
  <Grid container alignItems="center">
    <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 4, md: 8 } }}>
      <Typography 
        variant="h3" 
        fontWeight="1000" 
        sx={{ 
          mb: 2, 
          letterSpacing: '-0.04em', 
          // Explicitly use theme text colors
          color: isDarkMode ? '#ffffff' : '#000000' 
        }}
      >
        Download Our <Box component="span" sx={{ color: 'primary.main' }}>Mobile App</Box>
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 5, 
          maxWidth: '450px', 
          lineHeight: 1.7,
          color: isDarkMode ? alpha('#ffffff', 0.7) : 'text.secondary'
        }}
      >
        Access your service history, claim exclusive rewards, and find emergency help anywhere in Singapore.
      </Typography>
      
      {/* Buttons and Image remain the same */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<AppleIcon />}
          sx={{ 
            bgcolor: isDarkMode ? '#ffffff' : '#000000', 
            color: isDarkMode ? '#000000' : '#ffffff', 
            borderRadius: '14px', 
            px: 3, py: 1.5,
            textTransform: 'none',
            '&:hover': { bgcolor: isDarkMode ? '#f0f0f0' : '#333' } 
          }}
        >
          <Box sx={{ textAlign: 'left', ml: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>Download on</Typography>
            <Typography variant="subtitle2" fontWeight="700">App Store</Typography>
          </Box>
        </Button>

        <Button 
          variant="contained" 
          size="large" 
          startIcon={<AndroidIcon />}
          sx={{ 
            bgcolor: isDarkMode ? '#ffffff' : '#000000', 
            color: isDarkMode ? '#000000' : '#ffffff', 
            borderRadius: '14px', 
            px: 3, py: 1.5,
            textTransform: 'none',
            '&:hover': { bgcolor: isDarkMode ? '#f0f0f0' : '#333' } 
          }}
        >
          <Box sx={{ textAlign: 'left', ml: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>Get it on</Typography>
            <Typography variant="subtitle2" fontWeight="700">Google Play</Typography>
          </Box>
        </Button>
      </Stack>
    </Grid>

    <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
       <motion.img 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        src="https://img.freepik.com/free-psd/smartphone-mockup_1310-812.jpg"
        style={{ 
          width: '80%', 
          maxHeight: '400px', 
          objectFit: 'contain',
          filter: isDarkMode ? 'brightness(0.8) contrast(1.2)' : 'none',
          marginBottom: '-20px',
          position: 'relative'
        }} 
      />
    </Grid>
  </Grid>
</MotionBox>

        </Box>
      </Container>
    </Box>
  );
}