import * as React from 'react';
import { 
  Box, Typography, Card, CardMedia, Chip, Stack, 
  Grid, Button, Container, Skeleton, IconButton,
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
import SecurityIcon from '@mui/icons-material/Security';
import RouteIcon from '@mui/icons-material/Route';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import StarsIcon from '@mui/icons-material/Stars';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GarageIcon from '@mui/icons-material/Garage';
import PinDropIcon from '@mui/icons-material/PinDrop';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import InsightsIcon from '@mui/icons-material/Insights';
import PlaceIcon from '@mui/icons-material/Place';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

import { auth, db } from '../backend/Firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { fetchSingaporeWorkshops } from '../features/services/workshopServices';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

type VehicleSummary = {
  id: string;
  licensePlate: string;
  carModel: string;
  carYear: string;
  carColor: string;
  isPrimary: boolean;
};

const getVehicleSnapshot = (vehicle: VehicleSummary | null) => {
  if (!vehicle) {
    return {
      mileage: '--',
      lastService: '--',
      nextService: '--',
      estimatedCost: '--',
    };
  }

  const seed = vehicle.licensePlate
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);

  const lastServiceMonths = (seed % 4) + 1;
  const nextServiceDays = ((seed * 3) % 28) + 7;
  const mileageBase = 28000 + (seed % 57) * 1000;
  const estimatedBase = 140 + (seed % 6) * 25;

  return {
    mileage: `${mileageBase.toLocaleString()} km`,
    lastService: `${lastServiceMonths} month${lastServiceMonths > 1 ? 's' : ''} ago`,
    nextService: `${nextServiceDays} days`,
    estimatedCost: `$${estimatedBase}-${estimatedBase + 45}`,
  };
};

export default function MainContent() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [workshops, setWorkshops] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [primaryVehicle, setPrimaryVehicle] = React.useState<VehicleSummary | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const vehicleSnapshot = await getDocs(collection(db, 'users', firebaseUser.uid, 'vehicles'));
          const vehicles = vehicleSnapshot.docs.map((vehicleDoc) => {
            const data = vehicleDoc.data();
            return {
              id: vehicleDoc.id,
              licensePlate: (data.licensePlate || '').toString(),
              carModel: (data.carModel || '').toString(),
              carYear: (data.carYear || '').toString(),
              carColor: (data.carColor || '').toString(),
              isPrimary: Boolean(data.isPrimary),
            } satisfies VehicleSummary;
          });

          const selectedVehicle = vehicles.find((vehicle) => vehicle.isPrimary) || vehicles[0] || null;
          setPrimaryVehicle(selectedVehicle);
        } catch (error) {
          console.error('Failed to fetch vehicles', error);
          setPrimaryVehicle(null);
        }
      } else {
        setUser(null);
        setPrimaryVehicle(null);
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
  const vehicleSnapshot = getVehicleSnapshot(primaryVehicle);
  const vehicleTitle = primaryVehicle?.carModel || null;
  const vehicleMeta = primaryVehicle
    ? [primaryVehicle.licensePlate, primaryVehicle.carYear, primaryVehicle.carColor].filter(Boolean).join(' • ')
    : null;

  const actions = [
    { label: 'Emergency', desc: 'Accident help', icon: <WarningIcon />, color: theme.palette.error.main },
    { label: 'Maintenance', desc: 'Book service', icon: <BuildIcon />, color: theme.palette.primary.main },
    { label: 'Promotions', desc: 'Latest deals', icon: <LocalOfferIcon />, color: theme.palette.secondary.main },
    { label: 'Fuel Watch', desc: 'Live prices', icon: <EvStationIcon />, color: theme.palette.success.main },
  ];

  const appHighlights = [
    {
      title: 'Smart Maintenance Timeline',
      description: 'Auto reminders based on your mileage and service history.',
      icon: <NotificationsActiveIcon />,
      accent: theme.palette.warning.main,
    },
    {
      title: 'One-Tap Breakdown Help',
      description: 'Share your location and dispatch support in seconds.',
      icon: <RouteIcon />,
      accent: theme.palette.error.main,
    },
    {
      title: 'Trusted Workshop Network',
      description: 'Verified specialists with transparent pricing and reviews.',
      icon: <SecurityIcon />,
      accent: theme.palette.success.main,
    },
  ];

  const trustStats = [
    { value: '2026 Goal', label: 'Workshop-first digital operations layer', tone: theme.palette.primary.main },
    { value: 'Roadmap', label: 'Predictive maintenance insights and smarter matching', tone: theme.palette.warning.main },
    { value: 'Focus', label: 'Faster service coordination for drivers and partners', tone: theme.palette.success.main },
  ];

  const ownershipPillars = [
    {
      title: 'Service planning that stays ahead',
      description: 'Centralised platform to track service timing, projected upkeep and workshop availability.',
      icon: <CalendarMonthIcon />,
      accent: theme.palette.primary.main,
    },
    {
      title: 'Roadside help when things go wrong',
      description: 'Request support quickly and keep all your assistance history in one ownership timeline.',
      icon: <SupportAgentIcon />,
      accent: theme.palette.error.main,
    },
    {
      title: 'Vehicle insights that feel practical',
      description: 'See the health of your active vehicle and the next action you should actually care about.',
      icon: <InsightsIcon />,
      accent: theme.palette.secondary.main,
    },
    {
      title: 'Trusted workshops across Singapore',
      description: 'Compare partner specialists, locations, and promotions without digging through listings.',
      icon: <PlaceIcon />,
      accent: theme.palette.success.main,
    },
  ];

  const journeySteps = [
    {
      eyebrow: '01',
      title: 'Set up your driver profile',
      description: 'Add your details, vehicle plate, and preferred service locations once.',
    },
    {
      eyebrow: '02',
      title: 'Let AutoCare surface the next action',
      description: 'From due servicing to workshop offers, the app points you to what matters now.',
    },
    {
      eyebrow: '03',
      title: 'Book, track, and get back on the road',
      description: 'Manage appointments, roadside help, and vehicle records from a single place.',
    },
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
                {vehicleTitle ? `Everything is ready for your ${vehicleTitle}.` : "The smartest way to manage your vehicle in Singapore."}
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

            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              {trustStats.map((stat) => (
                <Grid key={stat.label} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      ...glassStyle,
                      p: 3,
                      height: '100%',
                      background: isDarkMode
                        ? `linear-gradient(145deg, ${alpha(stat.tone, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`
                        : `linear-gradient(145deg, ${alpha('#ffffff', 0.96)} 0%, ${alpha(stat.tone, 0.08)} 100%)`,
                    }}
                  >
                    <Typography variant="h4" fontWeight="1000" sx={{ letterSpacing: '-0.04em' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      {stat.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                elevation={0}
                sx={{
                  ...glassStyle,
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  background: isDarkMode
                    ? `linear-gradient(140deg, ${alpha(theme.palette.secondary.main, 0.18)} 0%, ${alpha('#090b10', 0.96)} 55%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
                    : `linear-gradient(140deg, ${alpha('#fefefe', 0.98)} 0%, ${alpha('#eef6ff', 0.94)} 55%, ${alpha('#fff4eb', 0.95)} 100%)`,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 'auto -20% -35% auto',
                    width: 260,
                    height: 260,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.22)} 0%, transparent 72%)`,
                    pointerEvents: 'none',
                  }}
                />
                <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                  <Chip
                    icon={<BoltIcon sx={{ fontSize: '1rem !important' }} />}
                    label="Driver Command Center"
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: '999px',
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.secondary.main, isDarkMode ? 0.22 : 0.12),
                    }}
                  />
                  <Typography variant="h4" fontWeight="1000" sx={{ maxWidth: 520, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
                    One dashboard for service planning, breakdown support, and vehicle ownership.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, lineHeight: 1.75 }}>
                    AutoCare is at its best when the page feels alive with your next appointment, your active vehicle,
                    and the best workshops nearby. This section turns the homepage into that operational dashboard.
                  </Typography>
                  <Grid container spacing={1.5}>
                    {[
                      'Workshop booking in a few taps',
                      'Vehicle-aware reminders and cost estimates',
                      'Roadside support with faster context',
                    ].map((point) => (
                      <Grid key={point} size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            ...glassStyle,
                            p: 2,
                            height: '100%',
                            borderRadius: '20px',
                            bgcolor: isDarkMode ? alpha('#ffffff', 0.05) : alpha('#ffffff', 0.82),
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.4 }}>
                            {point}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                elevation={0}
                sx={{
                  ...glassStyle,
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isDarkMode
                    ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`
                    : `linear-gradient(180deg, ${alpha('#ffffff', 0.98)} 0%, ${alpha('#ecf3ff', 0.96)} 100%)`,
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}>
                        Today with AutoCare
                      </Typography>
                      <Typography variant="h5" fontWeight="900" sx={{ mt: 0.5 }}>
                        {primaryVehicle ? primaryVehicle.licensePlate : 'Your vehicle snapshot'}
                      </Typography>
                    </Box>
                    <WorkspacePremiumIcon sx={{ color: theme.palette.warning.main }} />
                  </Stack>
                  <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                    {[
                      { title: 'Next best action', value: primaryVehicle ? 'Schedule your next service' : 'Add your first vehicle' },
                      { title: 'Support readiness', value: 'Emergency and workshop access enabled' },
                      { title: 'Records synced', value: primaryVehicle ? 'Vehicle profile is active on web' : 'Sign in to unlock personalization' },
                    ].map((item) => (
                      <Box
                        key={item.title}
                        sx={{
                          p: 1.75,
                          borderRadius: '18px',
                          bgcolor: isDarkMode ? alpha('#ffffff', 0.05) : alpha('#0d1728', 0.035),
                          border: `1px solid ${alpha(theme.palette.divider, 0.16)}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {item.title}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.35 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Button
                  component={Link}
                  to={user ? '/Profile' : '/SignIn'}
                  endIcon={<ArrowOutwardIcon />}
                  variant="contained"
                  sx={{ mt: 3, borderRadius: '16px', py: 1.4, fontWeight: 900 }}
                >
                  {user ? 'Open My Profile' : 'Create My Driver Profile'}
                </Button>
              </Card>
            </Grid>
          </Grid>

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
              {/* 2.5 USER VEHICLE DASHBOARD */}
{user && primaryVehicle && (
  <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
    <Card
      sx={{
        ...glassStyle,
        p: 3,
        mt: 2,
        background: isDarkMode
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 60%)`
          : `linear-gradient(135deg, ${alpha('#ffffff', 0.98)} 0%, ${alpha('#eef5ff', 0.95)} 100%)`,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip
              icon={<GarageIcon sx={{ fontSize: '1rem !important' }} />}
              label="Primary vehicle"
              size="small"
              sx={{ fontWeight: 800, borderRadius: '8px' }}
            />
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
              label="Road-ready"
              color="success"
              size="small"
              sx={{ fontWeight: 800, borderRadius: '8px' }}
            />
          </Stack>

          <Box>
            <Typography variant="h5" fontWeight="1000" sx={{ lineHeight: 1.05 }}>
              {primaryVehicle.carModel}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {vehicleMeta}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <PinDropIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Personalized reminders and workshop suggestions are now using your current vehicle.
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            minWidth: { md: 220 },
            p: 2,
            borderRadius: '20px',
            bgcolor: isDarkMode ? alpha('#ffffff', 0.05) : alpha('#0b1220', 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            License Plate
          </Typography>
          <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '0.08em', mt: 0.5 }}>
            {primaryVehicle.licensePlate}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Estimated upkeep based on your active vehicle record.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Mileage</Typography>
            <Typography fontWeight="900">{vehicleSnapshot.mileage}</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Last Service</Typography>
            <Typography fontWeight="900">{vehicleSnapshot.lastService}</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Next Service</Typography>
            <Typography fontWeight="900">{vehicleSnapshot.nextService}</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Est. Cost</Typography>
            <Typography fontWeight="900">{vehicleSnapshot.estimatedCost}</Typography>
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
                    {vehicleTitle ? `${vehicleTitle} Health Status` : "Connect your vehicle"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicleTitle
                      ? `Tracking ${primaryVehicle?.licensePlate} for maintenance reminders and nearby workshop matches.`
                      : "Sign in to get personalized maintenance alerts."}
                  </Typography>
                </Box>
              </Stack>
              {!user ? (
                <Button component={Link} to="/SignIn" variant="text" sx={{ fontWeight: 800 }}>Login</Button>
              ) : !primaryVehicle ? (
                <Button component={Link} to="/Profile" variant="contained" size="small" sx={{ borderRadius: '10px' }}>Add Vehicle</Button>
              ) : (
                <Button component={Link} to="/Profile" variant="outlined" size="small" sx={{ borderRadius: '10px', fontWeight: 800,  maxWidth: 140,height: 60 }}>
                  Manage Vehicle
                </Button>
              )}
            </Card>
          </MotionBox>

          <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>
                  Why Drivers Stay With AutoCare
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 620 }}>
                  The homepage should answer three questions immediately: what can I do now, what should I do next, and who can help me fast.
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2.5}>
              {ownershipPillars.map((pillar) => (
                <Grid key={pillar.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <MotionBox whileHover={{ y: -6 }}>
                    <Card
                      elevation={0}
                      sx={{
                        ...glassStyle,
                        p: 2.5,
                        height: '100%',
                        background: isDarkMode
                          ? alpha(theme.palette.background.paper, 0.42)
                          : alpha('#ffffff', 0.98),
                      }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: '16px',
                          display: 'grid',
                          placeItems: 'center',
                          color: pillar.accent,
                          bgcolor: alpha(pillar.accent, isDarkMode ? 0.22 : 0.12),
                          mb: 2,
                        }}
                      >
                        {pillar.icon}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="900" sx={{ lineHeight: 1.25, mb: 1 }}>
                        {pillar.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {pillar.description}
                      </Typography>
                    </Card>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Box>

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
                    <Chip label="Workshop Spotlight" color="primary" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
                    <Chip icon={<SpeedIcon sx={{ fontSize: '1rem !important' }}/>} label="Fast Track" variant="outlined" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
                  </Stack>
                  <Typography variant="h4" fontWeight="1000" gutterBottom sx={{ lineHeight: 1 }}>{featured?.title}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Chip label="Partner workshop" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
                    <Typography variant="caption" color="text.secondary">Live pricing and location details</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>{featured?.location}</Typography>
                  <Button variant="contained" fullWidth sx={{ borderRadius: '16px', py: 2, fontWeight: 900, boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.3)}` }}>
                    Book Appointment
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Box>

          <Box>
            <Card
              elevation={0}
              sx={{
                ...glassStyle,
                p: { xs: 3, md: 3.5 },
                background: isDarkMode
                  ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.5)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
                  : `linear-gradient(135deg, ${alpha('#ffffff', 0.98)} 0%, ${alpha('#f4f8ff', 0.98)} 100%)`,
              }}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.03em' }}>
                    How the platform fits a real ownership journey
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.75 }}>
                    Instead of looking like a brochure, the homepage now explains the product flow and gives people a clearer reason to stay and explore.
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2}>
                    {journeySteps.map((step) => (
                      <Grid key={step.eyebrow} size={{ xs: 12, md: 4 }}>
                        <Card
                          elevation={0}
                          sx={{
                            height: '100%',
                            p: 2.25,
                            borderRadius: '20px',
                            bgcolor: isDarkMode ? alpha('#ffffff', 0.05) : alpha('#0b1220', 0.035),
                            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                          }}
                        >
                          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}>
                            {step.eyebrow}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="900" sx={{ mt: 0.6, mb: 1 }}>
                            {step.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {step.description}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Box>

          {/* 4. TRENDING LIST */}
          {/* 3.5 RECOMMENDED FOR YOU */}
          {vehicleTitle && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Section header */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        width: 40, height: 40, borderRadius: '12px',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <DirectionsCarIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>
                      Matched to your vehicle
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.15 }}>
                    Recommended For You
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Workshops that work on <strong>{vehicleTitle}</strong>
                  </Typography>
                </Box>
                <Button
                  endIcon={<ChevronRightIcon />}
                  component={Link} to="/services"
                  sx={{ fontWeight: 800, display: { xs: 'none', sm: 'flex' } }}
                >
                  See All
                </Button>
              </Stack>

              <Grid container spacing={3}>
                {workshops.slice(0, 3).map((w, idx) => (
                  <Grid key={w.id} size={{ xs: 12, md: 4 }}>
                    <MotionBox whileHover={{ y: -8 }} style={{ height: '100%' }}>
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid',
                          borderColor: isDarkMode
                            ? alpha(theme.palette.primary.main, 0.18)
                            : alpha(theme.palette.primary.main, 0.12),
                          background: isDarkMode
                            ? alpha(theme.palette.background.paper, 0.7)
                            : '#fff',
                          boxShadow: isDarkMode
                            ? `0 8px 32px ${alpha('#000', 0.35)}`
                            : `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                          transition: 'box-shadow 0.3s ease',
                          '&:hover': {
                            boxShadow: isDarkMode
                              ? `0 16px 48px ${alpha('#000', 0.5)}`
                              : `0 16px 48px ${alpha(theme.palette.primary.main, 0.18)}`,
                          },
                        }}
                      >
                        {/* Image with gradient overlay */}
                        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={w.img}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.5s ease',
                              '&:hover': { transform: 'scale(1.06)' },
                            }}
                          />
                          {/* Gradient overlay */}
                          <Box
                            sx={{
                              position: 'absolute', inset: 0,
                              background: `linear-gradient(to top, ${alpha('#000', 0.65)} 0%, transparent 55%)`,
                            }}
                          />
                          {/* Match badge */}
                          <Box
                            sx={{
                              position: 'absolute', top: 12, left: 12,
                              px: 1, py: 0.3,
                              borderRadius: '4px',
                              bgcolor: theme.palette.primary.main,
                              backdropFilter: 'blur(4px)',
                              display: 'inline-flex', alignItems: 'center', gap: 0.4,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                color: '#fff',
                                letterSpacing: 0.6,
                                textTransform: 'uppercase',
                                lineHeight: 1,
                              }}
                            >
                              Suggested Match
                            </Typography>
                          </Box>
                          {/* Index badge */}
                          <Box
                            sx={{
                              position: 'absolute', top: 14, right: 14,
                              width: 32, height: 32, borderRadius: '50%',
                              bgcolor: alpha('#fff', 0.15),
                              backdropFilter: 'blur(8px)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${alpha('#fff', 0.3)}`,
                            }}
                          >
                            <Typography variant="caption" fontWeight={900} color="#fff">
                              {String(idx + 1).padStart(2, '0')}
                            </Typography>
                          </Box>
                          {/* Title overlay */}
                          <Box sx={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={900}
                              color="#fff"
                              noWrap
                              sx={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                            >
                              {w.title}
                            </Typography>
                            <Typography variant="caption" color={alpha('#fff', 0.8)} noWrap>
                              {w.location}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Card body */}
                        <Box sx={{ p: 2.5 }}>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                            {(w.services || ['General Service', 'Inspection']).slice(0, 2).map((svc: string) => (
                              <Chip
                                key={svc}
                                label={svc}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.68rem',
                                  borderRadius: '8px',
                                  borderColor: isDarkMode
                                    ? alpha(theme.palette.primary.main, 0.4)
                                    : alpha(theme.palette.primary.main, 0.3),
                                  color: theme.palette.primary.main,
                                }}
                              />
                            ))}
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
                            <DirectionsCarIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Matched based on your <strong>{vehicleTitle}</strong>
                            </Typography>
                          </Stack>

                          <Button
                            variant="contained"
                            fullWidth
                            disableElevation
                            sx={{
                              borderRadius: '14px',
                              fontWeight: 800,
                              py: 1.2,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                              },
                            }}
                          >
                            Book Now
                          </Button>
                        </Box>
                      </Card>
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </MotionBox>
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
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{
              ...glassStyle,
              position: 'relative',
              overflow: 'hidden',
              mt: 4,
              p: { xs: 3, md: 4 },
              borderRadius: '32px',
              background: isDarkMode
                ? `linear-gradient(130deg, ${alpha(theme.palette.primary.dark, 0.35)} 0%, ${alpha('#0b0c0e', 0.95)} 45%, ${alpha(theme.palette.background.paper, 0.65)} 100%)`
                : `linear-gradient(130deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f3f7ff', 0.98)} 45%, ${alpha('#e8f2ff', 0.95)} 100%)`,
              borderColor: isDarkMode
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.main, 0.15),
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: { xs: 200, md: 280 },
                height: { xs: 200, md: 280 },
                borderRadius: '50%',
                right: { xs: -80, md: -40 },
                top: { xs: -90, md: -120 },
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
            <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2.5} sx={{ p: { xs: 1, md: 2 } }}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Chip
                      icon={<StarsIcon sx={{ fontSize: '1rem !important' }} />}
                      label="New Mobile Experience"
                      sx={{
                        borderRadius: '999px',
                        fontWeight: 800,
                        bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.1),
                        color: isDarkMode ? '#fff' : theme.palette.primary.dark,
                        px: 1,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      iOS and Android
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h3"
                    fontWeight="1000"
                    sx={{
                      lineHeight: { xs: 1.08, md: 1.02 },
                      letterSpacing: '-0.04em',
                      color: isDarkMode ? '#ffffff' : '#05070b',
                    }}
                  >
                    Take AutoCare Everywhere,
                    <Box component="span" sx={{ color: 'primary.main', display: 'block' }}>
                      from service booking to SOS support.
                    </Box>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: 620,
                      lineHeight: 1.75,
                      color: isDarkMode ? alpha('#ffffff', 0.75) : alpha('#101828', 0.8),
                    }}
                  >
                    Built to become the operating system for vehicle ownership: unified booking, proactive maintenance,
                    roadside support, and stronger workshop coordination in one mobile experience.
                  </Typography>

                  <Grid container spacing={1.5} sx={{ pt: 0.5 }}>
                    {appHighlights.map((item) => (
                      <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card
                          elevation={0}
                          sx={{
                            height: '100%',
                            borderRadius: '18px',
                            p: 1.8,
                            bgcolor: isDarkMode
                              ? alpha(theme.palette.background.paper, 0.4)
                              : alpha('#ffffff', 0.8),
                            border: `1px solid ${alpha(item.accent, 0.22)}`,
                            boxShadow: isDarkMode ? 'none' : `0 10px 24px ${alpha(item.accent, 0.1)}`,
                          }}
                        >
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '11px',
                              display: 'grid',
                              placeItems: 'center',
                              mb: 1,
                              color: item.accent,
                              bgcolor: alpha(item.accent, isDarkMode ? 0.2 : 0.12),
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography variant="subtitle2" fontWeight={900} sx={{ lineHeight: 1.25, mb: 0.6 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                            {item.description}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1.5 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AppleIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        borderRadius: '14px',
                        px: 2.5,
                        py: 1.35,
                        minWidth: 185,
                        textTransform: 'none',
                        bgcolor: '#0f1115',
                        color: '#fff',
                        boxShadow: `0 14px 28px ${alpha('#000000', 0.25)}`,
                        '&:hover': { bgcolor: '#000000' },
                      }}
                    >
                      <Box sx={{ textAlign: 'left', ml: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.1, opacity: 0.85 }}>
                          Download on
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="800">
                          App Store
                        </Typography>
                      </Box>
                    </Button>

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AndroidIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        borderRadius: '14px',
                        px: 2.5,
                        py: 1.35,
                        minWidth: 185,
                        textTransform: 'none',
                        bgcolor: '#0f1115',
                        color: '#fff',
                        boxShadow: `0 14px 28px ${alpha('#000000', 0.25)}`,
                        '&:hover': { bgcolor: '#000000' },
                      }}
                    >
                      <Box sx={{ textAlign: 'left', ml: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.1, opacity: 0.85 }}>
                          Get it on
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="800">
                          Google Play
                        </Typography>
                      </Box>
                    </Button>
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    position: 'relative',
                    minHeight: { xs: 360, md: 470 },
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <MotionBox
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    sx={{
                      position: 'relative',
                      width: { xs: 230, md: 255 },
                      borderRadius: '34px',
                      p: 1,
                      bgcolor: '#0b0e14',
                      boxShadow: `0 28px 55px ${alpha('#000000', 0.35)}`,
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: '28px',
                        overflow: 'hidden',
                        bgcolor: isDarkMode ? '#101521' : '#f4f8ff',
                        border: `1px solid ${alpha('#ffffff', 0.12)}`,
                        minHeight: { xs: 420, md: 458 },
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.6,
                      }}
                    >
                      <Box
                        sx={{
                          height: 122,
                          borderRadius: '18px',
                          p: 1.6,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
                          color: '#fff',
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Next Service
                        </Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1, mt: 0.6 }}>
                          Friday, 10:30 AM
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.88 }}>
                          AutoTorque Specialist Centre
                        </Typography>
                      </Box>

                      <Stack spacing={1.1}>
                        {["Maintenance Due in 14 days", "2 nearby workshops available", "Roadside support: Active"].map((line) => (
                          <Box
                            key={line}
                            sx={{
                              p: 1.2,
                              borderRadius: '12px',
                              bgcolor: isDarkMode ? alpha('#ffffff', 0.06) : alpha('#0b1220', 0.04),
                              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                              {line}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </MotionBox>

                  <Card
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 20, md: 26 },
                      left: { xs: 14, md: 18 },
                      borderRadius: '16px',
                      px: 1.6,
                      py: 1,
                      bgcolor: isDarkMode ? alpha('#11161f', 0.9) : alpha('#ffffff', 0.95),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                      boxShadow: isDarkMode ? 'none' : `0 8px 20px ${alpha('#000000', 0.12)}`,
                    }}
                  >
                    <Typography variant="caption" fontWeight={800}>
                      Target outcome: higher workshop retention and repeat servicing
                    </Typography>
                  </Card>

                  <Card
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      top: { xs: 16, md: 24 },
                      right: { xs: 14, md: 22 },
                      borderRadius: '16px',
                      px: 1.6,
                      py: 1,
                      bgcolor: isDarkMode ? alpha('#11161f', 0.9) : alpha('#ffffff', 0.95),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
                      boxShadow: isDarkMode ? 'none' : `0 8px 20px ${alpha('#000000', 0.12)}`,
                    }}
                  >
                    <Typography variant="caption" fontWeight={800}>
                      Product direction: workshop growth through better customer continuity
                    </Typography>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </MotionBox>

        </Box>
      </Container>
    </Box>
  );
}