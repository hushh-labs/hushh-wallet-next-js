import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { UserRecord, PublicProfile, ShareLink, ScanEvent, HushhCardPayload } from '@/types';
import { 
  calculateAge, 
  maskPhoneNumber,
  shareIdManager,
  generateUUID
} from './tokenization';

// User operations
export async function createUser(uid: string, data: UserRecord): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    owner: {
      ...data.owner,
      createdAt: serverTimestamp()
    }
  });
}

export async function getUser(uid: string): Promise<UserRecord | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  const data = userSnap.data();
  // Convert Firestore timestamps back to Date objects
  if (data.owner?.createdAt?.toDate) {
    data.owner.createdAt = data.owner.createdAt.toDate();
  }
  
  return data as UserRecord;
}

export async function updateUser(uid: string, updates: Partial<UserRecord>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
}

export async function deleteUser(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
}

// Public profile operations
export async function createPublicProfile(publicId: string, userRecord: UserRecord): Promise<PublicProfile> {
  const publicProfile: PublicProfile = {
    sections: {
      personal: {
        preferredName: userRecord.profile.preferredName,
        age: calculateAge(userRecord.profile.dob),
        maskedPhone: maskPhoneNumber(userRecord.profile.phone)
      },
      food: {
        foodType: userRecord.food.foodType,
        spiceLevel: userRecord.food.spiceLevel,
        topCuisines: userRecord.food.topCuisines,
        dishStyles: userRecord.food.dishStyles,
        exclusions: userRecord.food.exclusions
      }
    },
    lastUpdated: new Date(),
    version: 1,
    redacted: userRecord.shareSettings.visibility === 'private'
  };

  const profileRef = doc(db, 'publicProfiles', publicId);
  await setDoc(profileRef, {
    ...publicProfile,
    lastUpdated: serverTimestamp()
  });

  return publicProfile;
}

export async function getPublicProfile(publicId: string): Promise<PublicProfile | null> {
  const profileRef = doc(db, 'publicProfiles', publicId);
  const profileSnap = await getDoc(profileRef);
  
  if (!profileSnap.exists()) {
    return null;
  }
  
  const data = profileSnap.data();
  // Convert Firestore timestamp back to Date
  if (data.lastUpdated?.toDate) {
    data.lastUpdated = data.lastUpdated.toDate();
  }
  
  return data as PublicProfile;
}

export async function updatePublicProfile(publicId: string, userRecord: UserRecord): Promise<void> {
  const updates: Partial<PublicProfile> = {
    sections: {
      personal: {
        preferredName: userRecord.profile.preferredName,
        age: calculateAge(userRecord.profile.dob),
        maskedPhone: maskPhoneNumber(userRecord.profile.phone)
      },
      food: {
        foodType: userRecord.food.foodType,
        spiceLevel: userRecord.food.spiceLevel,
        topCuisines: userRecord.food.topCuisines,
        dishStyles: userRecord.food.dishStyles,
        exclusions: userRecord.food.exclusions
      }
    },
    lastUpdated: serverTimestamp() as any,
    version: (await getPublicProfile(publicId))?.version || 0 + 1,
    redacted: userRecord.shareSettings.visibility === 'private'
  };

  const profileRef = doc(db, 'publicProfiles', publicId);
  await updateDoc(profileRef, updates);
}

// ShareLink operations
export async function createShareLink(shareId: string, publicId: string): Promise<ShareLink> {
  const shareLink: ShareLink = {
    publicId,
    status: 'active',
    rotates: false,
    createdAt: new Date()
  };

  const shareLinkRef = doc(db, 'shareLinks', shareId);
  await setDoc(shareLinkRef, {
    ...shareLink,
    createdAt: serverTimestamp()
  });

  return shareLink;
}

export async function getShareLink(shareId: string): Promise<ShareLink | null> {
  const shareLinkRef = doc(db, 'shareLinks', shareId);
  const shareLinkSnap = await getDoc(shareLinkRef);
  
  if (!shareLinkSnap.exists()) {
    return null;
  }
  
  const data = shareLinkSnap.data();
  // Convert Firestore timestamps back to Date
  if (data.createdAt?.toDate) {
    data.createdAt = data.createdAt.toDate();
  }
  if (data.ttl?.toDate) {
    data.ttl = data.ttl.toDate();
  }
  
  return data as ShareLink;
}

export async function updateShareLinkStatus(shareId: string, status: 'active' | 'revoked'): Promise<void> {
  const shareLinkRef = doc(db, 'shareLinks', shareId);
  await updateDoc(shareLinkRef, { status });
}

export async function rotateShareLink(uid: string, oldShareId: string): Promise<string> {
  // Get user record to get publicId
  const userRecord = await getUser(uid);
  if (!userRecord) {
    throw new Error('User not found');
  }

  // Generate new shareId
  const newShareId = shareIdManager.generateShareId();

  // Create new share link
  await createShareLink(newShareId, userRecord.card.publicId);

  // Revoke old share link
  await updateShareLinkStatus(oldShareId, 'revoked');

  // Update user record with new shareId
  await updateUser(uid, {
    card: {
      ...userRecord.card,
      activeShareId: newShareId
    }
  });

  return newShareId;
}

// Scan event logging
export async function logScanEvent(shareId: string, publicId: string, userAgent?: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const eventId = generateUUID();
  
  const scanEvent: ScanEvent = {
    shareId,
    publicId,
    timestamp: new Date(),
    userAgent,
    anonymousId: generateUUID() // Anonymous tracking
  };

  const eventRef = doc(db, 'scanEvents', today, 'events', eventId);
  await setDoc(eventRef, {
    ...scanEvent,
    timestamp: serverTimestamp()
  });
}

// Helper function to build UserRecord from HushhCardPayload
export function buildUserRecord(
  payload: HushhCardPayload,
  ownerTokenHash: string,
  recoveryKeyHash: string,
  deviceId: string
): UserRecord {
  const publicId = shareIdManager.generatePublicId();
  const shareId = shareIdManager.generateShareId();
  const passSerial = `HUSHH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  return {
    profile: {
      preferredName: payload.preferredName,
      legalName: payload.legalName,
      dob: payload.dob,
      phone: payload.phone,
      gender: payload.gender
    },
    food: {
      foodType: payload.foodType,
      spiceLevel: payload.spiceLevel,
      topCuisines: payload.cuisines,
      dishStyles: payload.dishes,
      exclusions: payload.exclusions
    },
    card: {
      publicId,
      activeShareId: shareId,
      passSerial
    },
    owner: {
      ownerTokenHash,
      recoveryKeyHash,
      createdAt: new Date(),
      lastSeenDevice: deviceId
    },
    shareSettings: {
      visibility: 'public_minimal'
    }
  };
}

// Validation helpers
export function validateHushhCardPayload(payload: any): payload is HushhCardPayload {
  return (
    typeof payload.legalName === 'string' &&
    typeof payload.preferredName === 'string' &&
    typeof payload.phone === 'string' &&
    typeof payload.dob === 'string' &&
    typeof payload.foodType === 'string' &&
    typeof payload.spiceLevel === 'string' &&
    Array.isArray(payload.cuisines) &&
    Array.isArray(payload.dishes) &&
    Array.isArray(payload.exclusions) &&
    payload.cuisines.length <= 3 &&
    payload.dishes.length <= 3 &&
    payload.exclusions.length <= 2
  );
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic E.164 validation
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

export function validateDateOfBirth(dob: string): boolean {
  const date = new Date(dob);
  const now = new Date();
  
  // Must be valid date, not in future, and person must be at least 13 years old
  return (
    date instanceof Date && 
    !isNaN(date.getTime()) &&
    date < now &&
    (now.getFullYear() - date.getFullYear()) >= 13
  );
}
