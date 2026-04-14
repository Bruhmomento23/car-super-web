import { db } from '../../backend/Firebase_config';
import {
  doc, setDoc, getDoc, collection, addDoc, updateDoc,
  serverTimestamp, query, where, getDocs, Timestamp, arrayUnion,
} from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkshopRecord {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  claimStatus: 'unclaimed' | 'pending_review' | 'claimed';
  ownerId: string | null;
  ownerIds: string[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface BookingRequest {
  id: string;
  userId: string;
  workshopId: string;
  workshopName: string;
  customerId: string;
  customerName: string;
  vehiclePlate: string;
  serviceType: string;
  notes: string;
  preferredDate: string;
  status: 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled' | 'rejected';
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface ConversationRecord {
  id: string;
  bookingIds: string[];
  workshopId: string;
  workshopName: string;
  customerId: string;
  customerName: string;
  ownerId: string;
  ownerName: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp | null;
  lastMessageSenderId: string | null;
  unreadCounts: Record<string, number>;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface ChatMessageRecord {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: 'text' | 'image' | 'system' | 'booking';
  bookingData?: {
    bookingId: string;
    serviceType: string;
    vehicleName: string;
    preferredDateTime: Timestamp | null;
    status: string;
    notes?: string;
    estimatedPrice?: number | null;
  };
  isRead?: boolean;
  readAt?: Timestamp | null;
  timestamp: Timestamp | null;
}

// ─── Workshop upsert ──────────────────────────────────────────────────────────

/**
 * Ensures a workshop record exists in workshops.
 * Called on first user interaction (chat, booking) with a Places-sourced workshop.
 * Idempotent: if the record already exists it is not overwritten.
 */
export async function upsertWorkshop(place: {
  id: string;
  title: string;
  location: string;
}): Promise<string> {
  const ref = doc(db, 'workshops', place.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      googlePlaceId: place.id,
      name: place.title,
      address: place.location,
      claimStatus: 'unclaimed',
      isClaimed: false,
      ownerId: null,
      ownerIds: [],
      acceptsBookings: true,
      instantBooking: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return place.id;
}

// ─── Booking requests ─────────────────────────────────────────────────────────

export async function createBookingRequest(data: {
  workshopId: string;
  workshopName: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehiclePlate: string;
  serviceType: string;
  notes: string;
  preferredDate: string;
}): Promise<string> {
  const preferredDateTime = new Date(data.preferredDate);
  const ref = await addDoc(collection(db, 'bookings'), {
    userId: data.customerId,
    workshopId: data.workshopId,
    workshopName: data.workshopName,
    serviceType: data.serviceType,
    selectedServices: [data.serviceType],
    preferredDateTime: Timestamp.fromDate(
      Number.isNaN(preferredDateTime.getTime()) ? new Date() : preferredDateTime,
    ),
    vehicleMake: 'Unknown',
    vehicleModel: data.vehiclePlate || 'Unknown',
    vehiclePlateNumber: data.vehiclePlate,
    issueDescription: data.notes || `Booking request for ${data.serviceType}`,
    customerName: data.customerName,
    customerPhone: data.customerPhone || '',
    customerEmail: data.customerEmail || null,
    preferredContactMethod: 'email',
    status: 'pending',
    isInstantBooking: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function createConversationWithBookingMessage(data: {
  bookingRequestId: string;
  workshopId: string;
  workshopName: string;
  customerId: string;
  customerName: string;
  ownerId?: string;
  ownerName?: string;
  serviceType: string;
  vehiclePlate: string;
  preferredDate: string;
  notes: string;
}): Promise<string> {
  const workshopSnap = await getDoc(doc(db, 'workshops', data.workshopId));
  const workshopData = workshopSnap.exists() ? workshopSnap.data() as Record<string, any> : {};
  const resolvedOwnerId = data.ownerId || (workshopData.ownerId as string) || data.workshopId;
  const resolvedOwnerName = data.ownerName || (workshopData.name as string) || data.workshopName;
  const preferredDateTime = new Date(data.preferredDate);

  const chatRef = await addDoc(collection(db, 'chats'), {
    bookingIds: [data.bookingRequestId],
    workshopId: data.workshopId,
    workshopName: data.workshopName,
    customerId: data.customerId,
    customerName: data.customerName,
    ownerId: resolvedOwnerId,
    ownerName: resolvedOwnerName,
    participants: [data.customerId, resolvedOwnerId],
    unreadCounts: { [data.customerId]: 0, [resolvedOwnerId]: 0 },
    typingStatus: {},
    lastMessage: `Booking request: ${data.serviceType}`,
    lastMessageSenderId: data.customerId,
    lastMessageTime: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
    chatId: chatRef.id,
    senderId: data.customerId,
    senderName: data.customerName,
    message: data.notes || `Hi, I would like to book ${data.serviceType}.`,
    type: 'booking',
    bookingData: {
      bookingId: data.bookingRequestId,
      serviceType: data.serviceType,
      vehicleName: data.vehiclePlate || 'Unknown vehicle',
      preferredDateTime: Timestamp.fromDate(
        Number.isNaN(preferredDateTime.getTime()) ? new Date() : preferredDateTime,
      ),
      status: 'pending',
      notes: data.notes,
      estimatedPrice: null,
    },
    isRead: false,
    readAt: null,
    timestamp: serverTimestamp(),
  });

  return chatRef.id;
}

export async function sendConversationMessage(data: {
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
}): Promise<void> {
  const message = data.text.trim();
  if (!message) return;

  await addDoc(collection(db, 'chats', data.conversationId, 'messages'), {
    chatId: data.conversationId,
    senderId: data.senderId,
    senderName: data.senderName,
    message,
    type: 'text',
    isRead: false,
    readAt: null,
    timestamp: serverTimestamp(),
  });

  await updateDoc(doc(db, 'chats', data.conversationId), {
    lastMessage: message,
    lastMessageSenderId: data.senderId,
    lastMessageTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBookingStatus(
  requestId: string,
  status: BookingRequest['status'],
): Promise<void> {
  await updateDoc(doc(db, 'bookings', requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ─── Workshop claims ─────────────────────────────────────────────────────────

export async function submitWorkshopClaim(data: {
  workshopId: string;
  ownerId: string;
  businessName: string;
  businessRegNumber: string;
}): Promise<void> {
  await addDoc(collection(db, 'workshop_claims_test'), {
    ...data,
    status: 'pending_review',
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'workshops', data.workshopId), {
    claimStatus: 'pending_review',
    isClaimed: true,
    ownerId: data.ownerId,
    ownerIds: arrayUnion(data.ownerId),
    updatedAt: serverTimestamp(),
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fetch all unclaimed + pending_review workshops for the claim search dialog. */
export async function searchUnclaimedWorkshops(nameQuery: string): Promise<WorkshopRecord[]> {
  const snap = await getDocs(collection(db, 'workshops'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as WorkshopRecord))
    .filter(
      w =>
        w.claimStatus !== 'claimed' &&
        w.name?.toLowerCase().includes(nameQuery.toLowerCase()),
    );
}

/** Fetch workshops by a list of IDs (owner's claimed workshops). */
export async function getWorkshopsByIds(ids: string[]): Promise<WorkshopRecord[]> {
  const results: WorkshopRecord[] = [];
  for (const id of ids) {
    const snap = await getDoc(doc(db, 'workshops', id));
    if (snap.exists()) results.push({ id: snap.id, ...snap.data() } as WorkshopRecord);
  }
  return results;
}
