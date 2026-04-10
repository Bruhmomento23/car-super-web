import * as React from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../backend/Firebase_config';
import BookingDialog from './BookingDialog';
import { fetchSingaporeWorkshops, type WorkshopListItem } from '../services/workshopServices';

const SERVICE_HIGHLIGHTS = [
  'Send a booking request with your vehicle plate only',
  'Share issue notes before the workshop responds',
  'Track workshop replies through the AutoCare flow',
  'Get into the request queue before final confirmation',
];

const DETAIL_PILL_SX = {
  bgcolor: 'rgba(7, 12, 20, 0.68)',
  color: 'common.white',
  border: '1px solid rgba(255,255,255,0.28)',
  backdropFilter: 'blur(10px)',
  '& .MuiChip-icon': {
    color: 'rgba(255,255,255,0.92)',
  },
};

type LocationState = {
  workshop?: WorkshopListItem;
};

export default function WorkshopDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workshopId } = useParams();
  const [workshop, setWorkshop] = React.useState<WorkshopListItem | null>(
    (location.state as LocationState | null)?.workshop ?? null,
  );
  const [loading, setLoading] = React.useState(!workshop);
  const [error, setError] = React.useState('');
  const [bookingOpen, setBookingOpen] = React.useState(false);

  React.useEffect(() => {
    if (workshop || !workshopId) return;

    let active = true;
    const loadWorkshop = async () => {
      setLoading(true);
      setError('');
      try {
        const results = await fetchSingaporeWorkshops();
        if (!active) return;
        const match = results.find(item => item.id === workshopId) ?? null;
        setWorkshop(match);
        if (!match) {
          setError('This workshop could not be found. It may no longer be available in the current search results.');
        }
      } catch {
        if (active) {
          setError('Failed to load workshop details. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWorkshop();
    return () => {
      active = false;
    };
  }, [workshop, workshopId]);

  const handleBookNow = () => {
    if (!auth.currentUser) {
      navigate('/SignIn');
      return;
    }
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Box sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!workshop) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={800}>Workshop unavailable</Typography>
            <Typography color="text.secondary">{error || 'The selected workshop could not be loaded.'}</Typography>
            <Box>
              <Button component={RouterLink} to="/Services" startIcon={<ArrowBackIcon />} variant="contained">
                Back to workshops
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const ratingValue = workshop.rating ? workshop.rating.toFixed(1) : 'N/A';
  const reviewSummary = workshop.reviews ? `${workshop.reviews} Google reviews` : 'Review count unavailable';
  const requestGuidance = workshop.isOpen ? 'Send a request while the workshop is currently open.' : 'Send a request now and the workshop can reply later.';

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Stack spacing={3.5}>
          <Breadcrumbs sx={{ color: 'text.secondary' }}>
            <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</RouterLink>
            <RouterLink to="/Services" style={{ color: 'inherit', textDecoration: 'none' }}>Workshops</RouterLink>
            <Typography color="text.primary">{workshop.title}</Typography>
          </Breadcrumbs>

          <Box
            sx={{
              borderRadius: 6,
              overflow: 'hidden',
              position: 'relative',
              minHeight: { xs: 320, md: 430 },
              backgroundImage: `linear-gradient(110deg, rgba(9,16,28,0.86) 0%, rgba(9,16,28,0.62) 46%, rgba(9,16,28,0.18) 100%), url(${workshop.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              p: { xs: 3, md: 5 },
            }}
          >
            <Stack spacing={3} sx={{ maxWidth: 860, width: '100%', color: 'common.white' }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={workshop.isOpen ? 'Open now' : 'Currently closed'}
                  sx={{
                    ...DETAIL_PILL_SX,
                    bgcolor: workshop.isOpen ? '#22c55e' : 'rgba(71, 85, 105, 0.94)',
                    color: workshop.isOpen ? '#052e16' : 'common.white',
                    borderColor: workshop.isOpen ? '#bbf7d0' : 'rgba(226, 232, 240, 0.26)',
                    boxShadow: workshop.isOpen ? '0 10px 30px rgba(34, 197, 94, 0.32)' : 'none',
                    fontWeight: 900,
                    '& .MuiChip-label': {
                      px: 0.6,
                    },
                  }}
                />
                <Chip icon={<VerifiedOutlinedIcon />} label="Request through AutoCare" sx={DETAIL_PILL_SX} />
              </Stack>
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.35rem' }, fontWeight: 900, lineHeight: 1.05 }}>
                {workshop.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                <PlaceIcon fontSize="small" />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {workshop.location}
                </Typography>
              </Stack>
              <Typography sx={{ maxWidth: 600, color: 'rgba(255,255,255,0.78)' }}>
                Review the workshop details first, then send a booking request with your vehicle plate and preferred service date.
              </Typography>
              <Grid container spacing={1.5} sx={{ maxWidth: 760 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2.25,
                      borderRadius: 4,
                      bgcolor: 'rgba(7, 12, 20, 0.72)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(14px)',
                      minHeight: 172,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', fontWeight: 800 }}>
                        Google rating
                      </Typography>
                      <StarRoundedIcon sx={{ color: '#fbbf24' }} />
                    </Stack>
                    <Typography sx={{ fontSize: { xs: '1.9rem', md: '2.2rem' }, fontWeight: 900, lineHeight: 1 }}>
                      {ratingValue}
                    </Typography>
                    <Typography sx={{ mt: 0.8, color: 'rgba(255,255,255,0.72)' }}>
                      {reviewSummary}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2.25,
                      borderRadius: 4,
                      bgcolor: 'rgba(7, 12, 20, 0.72)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(14px)',
                      minHeight: 172,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', fontWeight: 800 }}>
                        Pricing tier
                      </Typography>
                      <PaidOutlinedIcon sx={{ color: 'rgba(255,255,255,0.78)' }} />
                    </Stack>
                    <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.65rem' }, fontWeight: 800, lineHeight: 1.1 }}>
                      {workshop.priceText}
                    </Typography>
                    <Typography sx={{ mt: 0.8, color: 'rgba(255,255,255,0.72)' }}>
                      From ${workshop.displayPrice} for a typical service entry point.
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2.25,
                      borderRadius: 4,
                      bgcolor: 'rgba(7, 12, 20, 0.72)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(14px)',
                      minHeight: 172,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', fontWeight: 800 }}>
                        Request flow
                      </Typography>
                      <ForumOutlinedIcon sx={{ color: 'rgba(255,255,255,0.78)' }} />
                    </Stack>
                    <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' }, fontWeight: 800, lineHeight: 1.2 }}>
                      Booking request first
                    </Typography>
                    <Typography sx={{ mt: 0.8, color: 'rgba(255,255,255,0.72)' }}>
                      {requestGuidance}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" size="large" onClick={handleBookNow} sx={{ borderRadius: 999, px: 4, py: 1.35, fontWeight: 800 }}>
                  Book Now
                </Button>
                <Button component={RouterLink} to="/Services" variant="outlined" size="large" sx={{ borderRadius: 999, px: 4, py: 1.35, color: 'common.white', borderColor: 'rgba(255,255,255,0.4)' }}>
                  Back to results
                </Button>
              </Stack>
            </Stack>
          </Box>

          {error && <Alert severity="warning">{error}</Alert>}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7.5 }}>
              <Stack spacing={3}>
                <Paper variant="outlined" sx={{ borderRadius: 5, p: { xs: 2.5, md: 3.5 } }}>
                  <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={800}>Before you send a request</Typography>
                    <Typography color="text.secondary">
                      Use this page as the final review point before opening the request form. The goal is to make the workshop feel credible, clarify how the booking flow works, and surface the key information a driver needs at a glance.
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
                          <Box sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                              <ScheduleIcon color="primary" />
                              <Typography fontWeight={800}>Availability</Typography>
                            </Stack>
                            <Typography color="text.secondary">
                              {workshop.isOpen ? 'This workshop is currently open based on Google Places operating hours.' : 'This workshop is currently shown as closed. Users can still send a booking request.'}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
                          <Box sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                              <PaidOutlinedIcon color="primary" />
                              <Typography fontWeight={800}>Price positioning</Typography>
                            </Stack>
                            <Typography color="text.secondary">
                              {workshop.priceText} pricing tier from Google Places metadata. Final quotes still happen directly with the workshop.
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 5, p: { xs: 2.5, md: 3.5 } }}>
                  <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={800}>How the request works</Typography>
                    <Typography color="text.secondary">
                      The booking button below starts a request, not an instant confirmed appointment. That gives the workshop room to review the issue and reply with the right next step.
                    </Typography>
                    <Grid container spacing={2}>
                      {SERVICE_HIGHLIGHTS.map(item => (
                        <Grid key={item} size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ p: 2.25, borderRadius: 4, bgcolor: 'action.hover', height: '100%' }}>
                            <Stack direction="row" spacing={1.25} alignItems="flex-start">
                              <BuildCircleOutlinedIcon sx={{ color: 'primary.main', mt: 0.2 }} />
                              <Typography fontWeight={600}>{item}</Typography>
                            </Stack>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4.5 }}>
              <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: 110 }}>
                <Paper variant="outlined" sx={{ borderRadius: 5, p: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'text.secondary', fontWeight: 800 }}>
                      Booking snapshot
                    </Typography>
                    <Divider />
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Workshop</Typography>
                        <Typography fontWeight={700}>{workshop.title}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography fontWeight={600}>{workshop.location}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Google rating</Typography>
                        <Typography fontWeight={700}>{ratingValue}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Google reviews</Typography>
                        <Typography fontWeight={600}>{reviewSummary}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Estimated service pricing</Typography>
                        <Typography fontWeight={600}>from ${workshop.displayPrice}</Typography>
                      </Box>
                    </Stack>
                    <Button variant="contained" size="large" onClick={handleBookNow} sx={{ mt: 1, borderRadius: 3, py: 1.4, fontWeight: 800 }}>
                      Continue to booking
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        workshop={{ id: workshop.id, title: workshop.title, location: workshop.location }}
      />
    </>
  );
}