import * as React from 'react';
import {
  Box, Button, Container, Paper, Stack, Typography, Chip,
  Select, MenuItem, FormControl, InputLabel, Table, TableBody,
  TableCell, TableHead, TableRow, Avatar, TextField,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, IconButton, Tooltip, AppBar, Toolbar, Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../backend/Firebase_config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, getDoc, collection, query, where, orderBy,
  onSnapshot, updateDoc, serverTimestamp, addDoc,
} from 'firebase/firestore';
import LogoutIcon from '@mui/icons-material/Logout';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import SearchIcon from '@mui/icons-material/Search';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BuildIcon from '@mui/icons-material/Build';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { getWorkshopsByIds, searchUnclaimedWorkshops } from '../services/workshopFirestore';
import type { BookingRequest, WorkshopRecord } from '../services/workshopFirestore';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#d97706', bg: '#fef3c7' },
  confirmed:   { label: 'Confirmed',   color: '#2563eb', bg: '#dbeafe' },
  in_progress: { label: 'In Progress', color: '#7c3aed', bg: '#ede9fe' },
  completed:   { label: 'Completed',   color: '#059669', bg: '#d1fae5' },
  cancelled:   { label: 'Cancelled',   color: '#dc2626', bg: '#fee2e2' },
};

const KPI_ITEMS = [
  { key: 'pending',     label: 'Pending',     icon: <HourglassEmptyIcon />, color: '#d97706' },
  { key: 'confirmed',   label: 'Confirmed',   icon: <ThumbUpIcon />,        color: '#2563eb' },
  { key: 'in_progress', label: 'In Progress', icon: <BuildIcon />,          color: '#7c3aed' },
  { key: 'completed',   label: 'Completed',   icon: <CheckCircleIcon />,    color: '#059669' },
  { key: 'cancelled',   label: 'Cancelled',   icon: <CancelIcon />,         color: '#dc2626' },
];

const NEXT_STATUSES: Record<string, string[]> = {
  pending:     ['confirmed', 'cancelled'],
  confirmed:   ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
};

function formatTs(ts: any): string {
  if (!ts) return '—';
  try { return ts.toDate().toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkshopPortal() {
  const navigate = useNavigate();

  const [ownerData, setOwnerData] = React.useState<any>(null);
  const [authUser, setAuthUser]   = React.useState<any>(null);
  const [loading, setLoading]     = React.useState(true);
  const [workshops, setWorkshops] = React.useState<WorkshopRecord[]>([]);
  const [bookings, setBookings]   = React.useState<BookingRequest[]>([]);
  const [scopeId, setScopeId]           = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Claim dialog state
  const [claimOpen, setClaimOpen]           = React.useState(false);
  const [claimQuery, setClaimQuery]         = React.useState('');
  const [claimResults, setClaimResults]     = React.useState<WorkshopRecord[]>([]);
  const [claimSearching, setClaimSearching] = React.useState(false);
  const [claimSelected, setClaimSelected]   = React.useState<WorkshopRecord | null>(null);
  const [claimBizName, setClaimBizName]     = React.useState('');
  const [claimUEN, setClaimUEN]             = React.useState('');
  const [claimSubmitting, setClaimSubmitting] = React.useState(false);
  const [claimDone, setClaimDone]   = React.useState(false);
  const [claimError, setClaimError] = React.useState('');

  // Auth
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/SignIn'); return; }
      setAuthUser(user);
      const snap = await getDoc(doc(db, 'workshop_owners', user.uid));
      if (!snap.exists()) { navigate('/SignIn'); return; }
      setOwnerData({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  // Fetch owned workshop details
  React.useEffect(() => {
    const ids: string[] = ownerData?.ownedWorkshopIds ?? [];
    if (!ids.length) return;
    getWorkshopsByIds(ids).then(setWorkshops);
  }, [ownerData]);

  // Real-time bookings listener
  React.useEffect(() => {
    const ids: string[] = ownerData?.ownedWorkshopIds ?? [];
    if (!ids.length) return;
    const q = query(
      collection(db, 'booking_requests_test'),
      where('workshopId', 'in', ids.slice(0, 10)),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRequest)));
    });
    return () => unsub();
  }, [ownerData]);

  // Derived
  const scopedBookings  = scopeId === 'all' ? bookings : bookings.filter(b => b.workshopId === scopeId);
  const filteredBookings = scopedBookings.filter(b => statusFilter === 'all' || b.status === statusFilter);
  const kpi = Object.fromEntries(KPI_ITEMS.map(k => [k.key, scopedBookings.filter(b => b.status === k.key).length]));
  const hasWorkshops = !!(ownerData?.ownedWorkshopIds?.length);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    await updateDoc(doc(db, 'booking_requests_test', bookingId), {
      status: newStatus, updatedAt: serverTimestamp(),
    });
  };

  const handleSignOut = async () => { await signOut(auth); navigate('/SignIn'); };

  const handleClaimSearch = async () => {
    if (!claimQuery.trim()) return;
    setClaimSearching(true);
    try { setClaimResults(await searchUnclaimedWorkshops(claimQuery)); }
    finally { setClaimSearching(false); }
  };

  const handleClaimSubmit = async () => {
    if (!claimSelected || !claimBizName || !authUser) return;
    setClaimSubmitting(true); setClaimError('');
    try {
      await addDoc(collection(db, 'workshop_claims_test'), {
        workshopId: claimSelected.id, ownerId: authUser.uid,
        businessName: claimBizName, businessRegNumber: claimUEN,
        status: 'pending_review', createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'workshops_test', claimSelected.id), {
        claimStatus: 'pending_review', updatedAt: serverTimestamp(),
      });
      setClaimDone(true);
    } catch { setClaimError('Submission failed. Please try again.'); }
    finally { setClaimSubmitting(false); }
  };

  const resetClaimDialog = () => {
    setClaimOpen(false); setClaimQuery(''); setClaimResults([]);
    setClaimSelected(null); setClaimBizName(''); setClaimUEN('');
    setClaimDone(false); setClaimError('');
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* Top bar */}
      <AppBar position="static" elevation={0}
        sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <HomeWorkIcon sx={{ color: 'primary.main', fontSize: '1.6rem' }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', flexGrow: 1 }}>
            Workshop Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
            {ownerData?.fullName}
          </Typography>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
            {ownerData?.fullName?.[0] ?? 'W'}
          </Avatar>
          <Tooltip title="Sign out">
            <IconButton onClick={handleSignOut} size="small"><LogoutIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* No workshops claimed */}
        {!hasWorkshops ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <HomeWorkIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>No workshops claimed yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
              Claim your workshop listing to start receiving booking requests and managing your customer queue.
            </Typography>
            <Button variant="contained" size="large" startIcon={<AddBusinessIcon />} onClick={() => setClaimOpen(true)}>
              Claim a Workshop
            </Button>
          </Box>

        ) : (
          <Stack spacing={3}>

            {/* Header row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" fontWeight={800}>Overview</Typography>
                <Typography variant="body2" color="text.secondary">
                  Managing {ownerData.ownedWorkshopIds.length} workshop{ownerData.ownedWorkshopIds.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: 210 }}>
                <InputLabel>Workshop</InputLabel>
                <Select value={scopeId} label="Workshop" onChange={e => setScopeId(e.target.value)}>
                  <MenuItem value="all">All Workshops</MenuItem>
                  {workshops.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  {KPI_ITEMS.map(k => <MenuItem key={k.key} value={k.key}>{k.label}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="outlined" size="small" startIcon={<AddBusinessIcon />}
                onClick={() => setClaimOpen(true)} sx={{ whiteSpace: 'nowrap' }}>
                Add Workshop
              </Button>
            </Stack>

            {/* KPI cards */}
            <Grid container spacing={2}>
              {KPI_ITEMS.map(k => (
                <Grid key={k.key} size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Card variant="outlined"
                    onClick={() => setStatusFilter(prev => prev === k.key ? 'all' : k.key)}
                    sx={{
                      borderRadius: 3, cursor: 'pointer',
                      transition: 'transform .15s, box-shadow .15s',
                      border: statusFilter === k.key ? `2px solid ${k.color}` : '1px solid',
                      borderColor: statusFilter === k.key ? k.color : 'divider',
                      bgcolor: statusFilter === k.key ? `${k.color}11` : 'background.paper',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Box sx={{ color: k.color, mb: 1 }}>{k.icon}</Box>
                      <Typography variant="h4" fontWeight={800}>{kpi[k.key] ?? 0}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Bookings table */}
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <AssignmentIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>Booking Requests</Typography>
                <Chip label={filteredBookings.length} size="small" sx={{ ml: 'auto', fontWeight: 700 }} />
              </Box>

              {filteredBookings.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                  <Typography color="text.secondary" fontWeight={600}>No booking requests found</Typography>
                  <Typography variant="body2" color="text.disabled">
                    They will appear here as customers send requests
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f8fafc', fontSize: '0.78rem' } }}>
                        <TableCell>Customer</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Preferred Date</TableCell>
                        {scopeId === 'all' && <TableCell>Workshop</TableCell>}
                        <TableCell>Notes</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                        <TableCell>Received</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBookings.map(b => {
                        const cfg = STATUS_CFG[b.status] ?? STATUS_CFG.pending;
                        const nextSteps = NEXT_STATUSES[b.status] ?? [];
                        return (
                          <TableRow key={b.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, '& td': { py: 1.5 } }}>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', fontWeight: 700, bgcolor: 'primary.light' }}>
                                  {b.customerName?.[0] ?? '?'}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600} noWrap>{b.customerName || '—'}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <DirectionsCarIcon sx={{ fontSize: '0.9rem', color: 'text.disabled' }} />
                                <Typography variant="body2" fontFamily="monospace" fontWeight={700} letterSpacing={1}>
                                  {b.vehiclePlate || '—'}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell><Typography variant="body2">{b.serviceType}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{b.preferredDate || '—'}</Typography></TableCell>
                            {scopeId === 'all' && (
                              <TableCell>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 160 }}>
                                  {b.workshopName}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 180 }} title={b.notes}>
                                {b.notes || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={cfg.label} size="small"
                                sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, border: 'none', fontSize: '0.72rem' }} />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                {nextSteps.map(ns => {
                                  const nCfg = STATUS_CFG[ns];
                                  return (
                                    <Button key={ns} size="small" variant="outlined"
                                      onClick={() => handleStatusChange(b.id, ns)}
                                      sx={{ fontSize: '0.68rem', py: 0.3, px: 1, color: nCfg.color,
                                        borderColor: nCfg.color, textTransform: 'none',
                                        '&:hover': { bgcolor: nCfg.bg } }}>
                                      {nCfg.label}
                                    </Button>
                                  );
                                })}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">{formatTs(b.createdAt)}</Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>

          </Stack>
        )}
      </Container>

      {/* Claim Workshop Dialog */}
      <Dialog open={claimOpen} onClose={resetClaimDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Claim a Workshop</DialogTitle>
        <DialogContent>
          {claimDone ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              <strong>Claim submitted!</strong> Our team will verify your ownership within 1–3 business days.
              Once approved, bookings from this workshop will appear in your dashboard.
            </Alert>
          ) : claimSelected ? (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Alert severity="info">
                Claiming: <strong>{claimSelected.name}</strong>
                <br /><Typography variant="caption">{claimSelected.address}</Typography>
              </Alert>
              {claimError && <Alert severity="error">{claimError}</Alert>}
              <TextField label="Business Name" value={claimBizName}
                onChange={e => setClaimBizName(e.target.value)} fullWidth required
                helperText="As registered with ACRA / relevant authority" />
              <TextField label="Business Reg. No. / UEN" value={claimUEN}
                onChange={e => setClaimUEN(e.target.value)} fullWidth placeholder="e.g. 202312345A"
                helperText="Used for verification purposes only" />
              <Button variant="text" size="small" onClick={() => setClaimSelected(null)}
                sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
                ← Back to search
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Search for your workshop by name. If it does not appear, a record is created automatically
                the first time a customer finds you through our platform.
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField label="Workshop name" value={claimQuery}
                  onChange={e => setClaimQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleClaimSearch(); }}
                  fullWidth size="small" />
                <Button variant="contained" onClick={handleClaimSearch} disabled={claimSearching}
                  startIcon={claimSearching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}>
                  Search
                </Button>
              </Stack>
              {!claimSearching && claimQuery && claimResults.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No unclaimed workshops matched. Try a broader term.
                </Typography>
              )}
              <Stack spacing={1}>
                {claimResults.map(w => (
                  <Paper key={w.id} variant="outlined"
                    sx={{ p: 2, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => { setClaimSelected(w); setClaimBizName(w.name ?? ''); }}>
                    <Typography fontWeight={700}>{w.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{w.address}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={resetClaimDialog} color="inherit">{claimDone ? 'Close' : 'Cancel'}</Button>
          {!claimDone && claimSelected && (
            <Button variant="contained" onClick={handleClaimSubmit}
              disabled={claimSubmitting || !claimBizName}
              startIcon={claimSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {claimSubmitting ? 'Submitting…' : 'Submit Claim'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );

}
