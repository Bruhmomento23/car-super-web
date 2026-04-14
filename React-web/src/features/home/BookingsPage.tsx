import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
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
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BuildIcon from '@mui/icons-material/Build';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link as RouterLink } from 'react-router-dom';
import { auth, db } from '../../backend/Firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import type { BookingRequest, ConversationRecord } from '../services/workshopFirestore';

const STATUS_COLOR: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  confirmed: 'info',
  inProgress: 'primary',
  completed: 'success',
  cancelled: 'error',
  rejected: 'error',
};

function formatDate(value: any) {
  if (!value) return 'Date not set';
  try {
    const dateObj = value?.toDate ? value.toDate() : new Date(value);
    return dateObj.toLocaleDateString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

export default function BookingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [user, setUser] = React.useState<any>(null);
  const [bookings, setBookings] = React.useState<BookingRequest[]>([]);
  const [conversationMap, setConversationMap] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async current => {
      if (!current) {
        setUser(null);
        setBookings([]);
        setConversationMap({});
        setLoading(false);
        return;
      }

      setUser(current);
      setLoading(true);
      setError('');
      try {
        const bookingsQ = query(
          collection(db, 'bookings'),
          where('userId', '==', current.uid),
        );
        const bookingsSnap = await getDocs(bookingsQ);
        const bookingList = bookingsSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as BookingRequest))
          .sort((a: any, b: any) => {
            const aMs = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const bMs = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return bMs - aMs;
          });
        setBookings(bookingList);

        const conversationsQ = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', current.uid),
        );
        const conversationsSnap = await getDocs(conversationsQ);
        const mapping: Record<string, string> = {};
        conversationsSnap.docs.forEach(d => {
          const data = { id: d.id, ...d.data() } as ConversationRecord;
          (data.bookingIds || []).forEach((bookingId) => {
            mapping[bookingId] = data.id;
          });
        });
        bookingsSnap.docs.forEach(docSnap => {
          const bookingId = docSnap.id;
          if (!mapping[bookingId]) {
            conversationsSnap.docs.forEach(chatDoc => {
              const chatData = chatDoc.data() as Record<string, any>;
              if ((chatData.bookingIds || []).includes(bookingId)) {
                mapping[bookingId] = chatDoc.id;
              }
            });
          }
        });
        setConversationMap(mapping);
      } catch (err) {
        console.error(err);
        setError('Failed to load booking history. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const upcoming = bookings.filter((b: any) => ['pending', 'confirmed', 'inProgress'].includes(b.status));
  const past = bookings.filter((b: any) => ['completed', 'cancelled', 'rejected'].includes(b.status));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Alert severity="info">Please sign in to view your bookings.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3.8 }}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, position: { md: 'sticky' }, top: 110 }}>
            <Stack spacing={2.2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>{(user.email || 'U').slice(0, 1).toUpperCase()}</Avatar>
                <Box>
                  <Typography fontWeight={800}>{user.displayName || user.email}</Typography>
                  <Typography variant="caption" color="text.secondary">Customer account</Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total requests</Typography>
                  <Chip size="small" label={bookings.length} color="primary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Active</Typography>
                  <Chip size="small" label={upcoming.length} color="warning" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Completed / Closed</Typography>
                  <Chip size="small" label={past.length} color="success" />
                </Box>
              </Stack>

              <Button component={RouterLink} to="/Services" variant="contained" sx={{ mt: 0.5, borderRadius: 3 }}>
                Book another service
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8.2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={900}>Bookings and chats</Typography>
              <Typography color="text.secondary">
                Open each request to continue the conversation with your workshop.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {bookings.length === 0 ? (
              <Paper variant="outlined" sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>No booking requests yet</Typography>
                <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                  Start by finding a workshop and sending your first request.
                </Typography>
                <Button component={RouterLink} to="/Services" variant="contained">Browse workshops</Button>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {bookings.map(booking => {
                  const conversationId = conversationMap[booking.id];
                  const bookingAny = booking as any;
                  const status = bookingAny.status || 'pending';
                  const vehicleValue = bookingAny.vehiclePlate || bookingAny.vehiclePlateNumber || bookingAny.vehicleModel || 'No vehicle data';
                  const preferredDateValue = bookingAny.preferredDate || bookingAny.preferredDateTime;
                  const notesValue = bookingAny.notes || bookingAny.issueDescription || bookingAny.bookingNotes || '';

                  return (
                    <Card key={booking.id} variant="outlined" sx={{ borderRadius: 4, p: 2.3 }}>
                      <Stack spacing={1.4}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.2}>
                          <Box>
                            <Typography variant="h6" fontWeight={800}>{booking.workshopName}</Typography>
                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.2 }}>
                              <BuildIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography color="text.secondary">{bookingAny.serviceType || 'Service request'}</Typography>
                            </Stack>
                          </Box>
                          <Chip
                            label={status.replace('_', ' ')}
                            color={STATUS_COLOR[status] || 'default'}
                            sx={{ textTransform: 'capitalize', fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
                          />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.2}>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <DirectionsCarIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography>{vehicleValue}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <EventAvailableIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography>{formatDate(preferredDateValue)}</Typography>
                          </Stack>
                        </Stack>

                        {notesValue && (
                          <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.2, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary">Your note</Typography>
                            <Typography>{notesValue}</Typography>
                          </Paper>
                        )}

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          {conversationId ? (
                            <Button
                              component={RouterLink}
                              to={`/Chat/${conversationId}`}
                              variant="contained"
                              startIcon={<ChatOutlinedIcon />}
                              sx={{ borderRadius: 2.5 }}
                            >
                              Open chat
                            </Button>
                          ) : (
                            <Chip label="Chat link pending" variant="outlined" color="warning" />
                          )}
                          <Button component={RouterLink} to="/Services" variant="text" endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.75rem' }} />}>
                            Book another
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
