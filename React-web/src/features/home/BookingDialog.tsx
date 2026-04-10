import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, Typography, Alert,
  CircularProgress, Divider, Stack, Chip,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { auth, db } from '../../backend/Firebase_config';
import { collection, getDocs } from 'firebase/firestore';
import { upsertWorkshop, createBookingRequest } from '../services/workshopFirestore';

const SERVICE_TYPES = [
  'Oil Change',
  'Brake Service',
  'Tire Rotation',
  'AC Repair',
  'Battery Replacement',
  'Engine Diagnostics',
  'Transmission Service',
  'Bodywork & Paint',
  'Full Service',
  'Other',
];

interface Props {
  open: boolean;
  onClose: () => void;
  workshop: { id: string; title: string; location: string } | null;
}

export default function BookingDialog({ open, onClose, workshop }: Props) {
  const [serviceType, setServiceType] = React.useState('');
  const [preferredDate, setPreferredDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [vehiclePlate, setVehiclePlate] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  // Pre-fill vehicle plate from user's primary vehicle
  React.useEffect(() => {
    if (!open || !auth.currentUser) return;
    const fetchVehicle = async () => {
      try {
        const snap = await getDocs(
          collection(db, 'users', auth.currentUser!.uid, 'vehicles'),
        );
        if (!snap.empty) {
          const primary =
            snap.docs.find(d => d.data().isPrimary) ?? snap.docs[0];
          setVehiclePlate(primary.data().licensePlate ?? '');
        }
      } catch {
        // Not critical — user can type manually
      }
    };
    fetchVehicle();
  }, [open]);

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setError('You must be signed in to make a booking.');
      return;
    }
    if (!workshop) return;
    if (!serviceType) { setError('Please select a service type.'); return; }
    if (!preferredDate) { setError('Please choose a preferred date.'); return; }

    setLoading(true);
    setError('');
    try {
      const workshopId = await upsertWorkshop({
        id: workshop.id,
        title: workshop.title,
        location: workshop.location,
      });
      await createBookingRequest({
        workshopId,
        workshopName: workshop.title,
        customerId: auth.currentUser.uid,
        customerName:
          auth.currentUser.displayName ??
          auth.currentUser.email ??
          'Customer',
        vehiclePlate,
        serviceType,
        notes,
        preferredDate,
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError('Failed to send booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setServiceType('');
    setPreferredDate('');
    setNotes('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Request a Booking
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            <strong>Request sent!</strong> The workshop will review your booking
            and confirm your appointment shortly.
          </Alert>
        ) : (
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Workshop info */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Booking at
              </Typography>
              <Typography fontWeight={700}>{workshop?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {workshop?.location}
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Divider />

            {/* Service type */}
            <TextField
              select
              label="Service Type"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              fullWidth
              required
              InputProps={{ startAdornment: <BuildIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.1rem' }} /> }}
            >
              {SERVICE_TYPES.map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            {/* Date */}
            <TextField
              label="Preferred Date"
              type="date"
              value={preferredDate}
              onChange={e => setPreferredDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: today }}
              InputProps={{ startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.1rem' }} /> }}
            />

            {/* Vehicle plate */}
            <TextField
              label="Vehicle Plate"
              value={vehiclePlate}
              onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
              fullWidth
              placeholder="e.g. SKA1234B"
              inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2 } }}
              InputProps={{ startAdornment: <DirectionsCarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.1rem' }} /> }}
            />

            {/* Notes */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}
              >
                Notes (optional)
              </Typography>
              <Box
                component="textarea"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder="Describe the issue or anything the workshop should know"
                maxLength={500}
                rows={4}
                sx={{
                  width: '100%',
                  resize: 'vertical',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  font: 'inherit',
                  lineHeight: 1.5,
                  px: 1.75,
                  py: 1.4,
                  boxSizing: 'border-box',
                  outline: 'none',
                  minHeight: 112,
                  '&::placeholder': {
                    color: 'text.disabled',
                    opacity: 1,
                  },
                  '&:focus': {
                    borderColor: 'primary.main',
                    boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}22`,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Free to request" size="small" color="success" variant="outlined" />
              <Chip label="No commitment" size="small" variant="outlined" />
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? 'Sending…' : 'Send Request'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
