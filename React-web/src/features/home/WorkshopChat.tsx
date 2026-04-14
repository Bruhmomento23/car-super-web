import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../../backend/Firebase_config';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import type { ChatMessageRecord, ConversationRecord } from '../services/workshopFirestore';
import { sendConversationMessage } from '../services/workshopFirestore';

function formatMessageTime(ts: any): string {
  if (!ts) return '';
  try {
    return ts.toDate().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function WorkshopChat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [user, setUser] = React.useState<any>(null);
  const [conversation, setConversation] = React.useState<ConversationRecord | null>(null);
  const [messages, setMessages] = React.useState<ChatMessageRecord[]>([]);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [isOwnerView, setIsOwnerView] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, current => {
      if (!current) {
        navigate('/SignIn');
        return;
      }
      setUser(current);
    });
    return () => unsub();
  }, [navigate]);

  React.useEffect(() => {
    if (!conversationId) {
      setError('Conversation not found.');
      setLoading(false);
      return;
    }

    const conversationRef = doc(db, 'chats', conversationId);
    const unsubConversation = onSnapshot(
      conversationRef,
      snap => {
        if (!snap.exists()) {
          setError('Conversation no longer exists.');
          setConversation(null);
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() } as ConversationRecord;
        setConversation(data);
        setLoading(false);
      },
      () => {
        setError('Unable to load chat conversation.');
        setLoading(false);
      },
    );

    const messagesQ = query(
      collection(db, 'chats', conversationId, 'messages'),
      orderBy('timestamp', 'asc'),
    );
    const unsubMessages = onSnapshot(messagesQ, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessageRecord)));
    });

    return () => {
      unsubConversation();
      unsubMessages();
    };
  }, [conversationId]);

  React.useEffect(() => {
    if (!user || !conversation) return;
    const ownerMatch = conversation.ownerId === user.uid;
    const customerMatch = conversation.customerId === user.uid;
    setIsOwnerView(ownerMatch);
    if (!ownerMatch && !customerMatch) {
      setError('This chat is not available for your account.');
    }
  }, [user, conversation]);

  const bookingMessage = React.useMemo(
    () => messages.find(m => m.type === 'booking' && !!m.bookingData),
    [messages],
  );

  const handleSend = async () => {
    if (!conversation || !user || !draft.trim()) return;
    setSending(true);
    try {
      const profileCollection = isOwnerView ? 'workshop_owners' : 'users';
      const profileSnap = await getDoc(doc(db, profileCollection, user.uid));
      const profileName = profileSnap.exists() ? (profileSnap.data().fullName as string) : '';
      await sendConversationMessage({
        conversationId: conversation.id,
        senderId: user.uid,
        senderName: profileName || user.displayName || user.email || (isOwnerView ? 'Workshop Owner' : 'Customer'),
        text: draft,
      });
      setDraft('');
    } catch {
      setError('Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 8 }}>
        <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!conversation || !user || (conversation.customerId !== user.uid && conversation.ownerId !== user.uid)) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 12, md: 16 }, mb: 8 }}>
        <Alert severity="warning">{error || 'Conversation not accessible.'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 8 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4.2 }}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, position: { md: 'sticky' }, top: 110 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ChatBubbleOutlineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    {isOwnerView ? conversation.customerName : conversation.workshopName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isOwnerView ? conversation.workshopName : 'Workshop chat'}
                  </Typography>
                </Box>
              </Stack>
              <Divider />

              {bookingMessage?.bookingData ? (
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    borderColor: 'primary.light',
                  }}
                >
                  <Box sx={{ p: 1.4, bgcolor: 'primary.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography fontWeight={800} color="primary.main">Booking Request</Typography>
                      <Chip label={(bookingMessage.bookingData.status || 'pending').replace('_', ' ')} size="small" color="warning" />
                    </Stack>
                  </Box>
                  <Stack spacing={1.2} sx={{ p: 1.6 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BuildIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography fontWeight={700}>{bookingMessage.bookingData.serviceType}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DirectionsCarIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography color="text.secondary" fontWeight={600}>{bookingMessage.bookingData.vehicleName || 'No vehicle data'}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EventAvailableIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography color="text.secondary" fontWeight={600}>
                        {bookingMessage.bookingData.preferredDateTime
                          ? bookingMessage.bookingData.preferredDateTime.toDate().toLocaleDateString('en-SG')
                          : 'Date not set'}
                      </Typography>
                    </Stack>
                    {bookingMessage.bookingData.notes && (
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <InfoOutlinedIcon sx={{ fontSize: '1rem', color: 'text.secondary', mt: 0.2 }} />
                        <Typography color="text.secondary">{bookingMessage.bookingData.notes}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              ) : (
                <Alert severity="info" variant="outlined">Booking summary will appear here once available.</Alert>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7.8 }}>
          <Paper variant="outlined" sx={{ borderRadius: 4, minHeight: 540, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800}>Conversation</Typography>
              <Typography variant="caption" color="text.secondary">
                {isOwnerView
                  ? 'Reply to the customer and keep booking updates in one thread.'
                  : 'Send updates or ask questions directly to the workshop.'}
              </Typography>
            </Box>

            <Box sx={{ px: 2.5, py: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 420, overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <Typography color="text.secondary">No messages yet.</Typography>
              ) : (
                messages.map(message => {
                  const mine = message.senderId === user.uid;
                  return (
                    <Box key={message.id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <Paper
                        elevation={0}
                        sx={{
                          maxWidth: '78%',
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: mine ? 'primary.main' : 'action.hover',
                          color: mine ? 'primary.contrastText' : 'text.primary',
                        }}
                      >
                        {message.type === 'booking' && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.88, mb: 0.4 }}>
                            Booking request created
                          </Typography>
                        )}
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{message.message}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.6, opacity: 0.8 }}>
                          {formatMessageTime(message.timestamp)}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })
              )}
            </Box>

            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder={isOwnerView ? 'Type a message to the customer' : 'Type a message to the workshop'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                multiline
                maxRows={4}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                endIcon={<SendRoundedIcon />}
                sx={{
                  minWidth: 124,
                  borderRadius: 2.5,
                  px: 2.2,
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    boxShadow: '0 10px 24px rgba(29, 78, 216, 0.35)',
                  },
                  '&.Mui-disabled': {
                    background: '#cbd5e1',
                    color: '#64748b',
                    boxShadow: 'none',
                  },
                }}
              >
                {sending ? 'Sending' : 'Send'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
