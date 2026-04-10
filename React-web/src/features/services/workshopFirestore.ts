import { db } from '../../backend/Firebase_config';
import {
  doc, setDoc, getDoc, collection, addDoc, updateDoc,
  serverTimestamp, query, where, getDocs, orderBy, Timestamp,
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
  workshopId: string;
  workshopName: string;
  customerId: string;
  customerName: string;
  vehiclePlate: string;
  serviceType: string;
  notes: string;
  preferredDate: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// ─── Workshop upsert ──────────────────────────────────────────────────────────

/**
 * Ensures a workshop record exists in workshops_test.
 * Called on first user interaction (chat, booking) with a Places-sourced workshop.
 * Idempotent: if the record already exists it is not overwritten.
 */
export async function upsertWorkshop(place: {
  id: string;
  title: string;
  location: string;
}): Promise<string> {
  const ref = doc(db, 'workshops_test', place.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      googlePlaceId: place.id,
      name: place.title,
      address: place.location,
      claimStatus: 'unclaimed',
      ownerId: null,
      ownerIds: [],
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
  vehiclePlate: string;
  serviceType: string;
  notes: string;
  preferredDate: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'booking_requests_test'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBookingStatus(
  requestId: string,
  status: BookingRequest['status'],
): Promise<void> {
  await updateDoc(doc(db, 'booking_requests_test', requestId), {
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
  await updateDoc(doc(db, 'workshops_test', data.workshopId), {
    claimStatus: 'pending_review',
    updatedAt: serverTimestamp(),
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fetch all unclaimed + pending_review workshops for the claim search dialog. */
export async function searchUnclaimedWorkshops(nameQuery: string): Promise<WorkshopRecord[]> {
  const snap = await getDocs(collection(db, 'workshops_test'));
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
    const snap = await getDoc(doc(db, 'workshops_test', id));
    if (snap.exists()) results.push({ id: snap.id, ...snap.data() } as WorkshopRecord);
  }
  return results;
}
