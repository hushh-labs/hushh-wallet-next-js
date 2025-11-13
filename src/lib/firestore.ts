import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/config';
import { 
  HushhProfile, 
  IdentityData, 
  NetWorthData, 
  FoodPreferencesData, 
  LifestyleData, 
  BodyFitData,
  FormCompletionStatus,
  FormSection
} from '@/types/hushh-id';

// Generate ULID (for now using simple implementation, can be enhanced later)
export const generateULID = (): string => {
  const timestamp = Date.now().toString(36);
  const randomness = Math.random().toString(36).substr(2, 10);
  return (timestamp + randomness).toUpperCase().substr(0, 26);
};

// Collection references
const getProfileRef = (uid: string) => doc(db, 'profiles', uid);
const getIdentityRef = (uid: string) => doc(db, 'identity', uid);
const getNetWorthRef = (uid: string) => doc(db, 'netWorth', uid);
const getFoodPrefsRef = (uid: string) => doc(db, 'foodPreferences', uid);
const getLifestyleRef = (uid: string) => doc(db, 'lifestyle', uid);
const getBodyFitRef = (uid: string) => doc(db, 'bodyFit', uid);
const getHushhCardRef = (uid: string) => doc(db, 'hushhCards', uid);

// Helper function to calculate completion
const calculateSectionCompletion = (data: any, section: FormSection): number => {
  if (!data) return 0;
  
  const fieldCounts = {
    identity: 10, // name, dob, gender, pronouns, city, country, email, phone, etc.
    networth: 10, // 6 assets + 4 liabilities
    food: 8,     // diet, allergens, preferences, etc.
    lifestyle: 6, // drinking + smoking questions
    bodyfit: 8   // height, weight, shoe, top, bottom, etc.
  };
  
  const filledFields = Object.values(data).filter(value => 
    value !== null && 
    value !== undefined && 
    value !== '' && 
    !(Array.isArray(value) && value.length === 0) &&
    !(typeof value === 'object' && Object.keys(value).length === 0)
  ).length;
  
  return Math.min(100, Math.round((filledFields / fieldCounts[section]) * 100));
};

const calculateOverallCompletion = (completion: FormCompletionStatus): number => {
  const weights = { identity: 25, networth: 25, food: 20, lifestyle: 10, bodyfit: 20 };
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  const weightedSum = (
    completion.identity.progress * weights.identity +
    completion.networth.progress * weights.networth +
    completion.food.progress * weights.food +
    completion.lifestyle.progress * weights.lifestyle +
    completion.bodyfit.progress * weights.bodyfit
  ) / totalWeight;
  
  return Math.round(weightedSum);
};

// Profile CRUD operations
export const createProfile = async (uid: string): Promise<void> => {
  const profileRef = getProfileRef(uid);
  const hushhCardRef = getHushhCardRef(uid);
  
  const hushhUid = generateULID();
  const now = serverTimestamp();
  
  const initialProfile: Omit<HushhProfile, 'uid' | 'createdAt' | 'updatedAt'> = {
    completion: {
      identity: { completed: false, progress: 0 },
      networth: { completed: false, progress: 0 },
      food: { completed: false, progress: 0 },
      lifestyle: { completed: false, progress: 0 },
      bodyfit: { completed: false, progress: 0 },
      overall: 0
    },
    hushhCard: {
      hushhUid,
      qrVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  };
  
  await Promise.all([
    setDoc(profileRef, {
      ...initialProfile,
      uid,
      createdAt: now,
      updatedAt: now
    }),
    setDoc(hushhCardRef, {
      hushhUid,
      qrVersion: 1,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      ownerId: uid
    })
  ]);
};

export const getProfile = async (uid: string): Promise<HushhProfile | null> => {
  try {
    const profileDoc = await getDoc(getProfileRef(uid));
    if (!profileDoc.exists()) return null;
    
    const data = profileDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      hushhCard: data.hushhCard ? {
        ...data.hushhCard,
        createdAt: data.hushhCard.createdAt?.toDate() || new Date(),
        updatedAt: data.hushhCard.updatedAt?.toDate() || new Date()
      } : undefined
    } as HushhProfile;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

// Identity operations
export const saveIdentityData = async (uid: string, data: Partial<IdentityData>): Promise<void> => {
  try {
    const identityRef = getIdentityRef(uid);
    const profileRef = getProfileRef(uid);
    
    await setDoc(identityRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update profile completion
    const progress = calculateSectionCompletion(data, 'identity');
    const completed = progress >= 70;
    
    const profile = await getProfile(uid);
    if (profile) {
      const newCompletion = {
        ...profile.completion,
        identity: { completed, progress, lastUpdated: new Date() }
      };
      newCompletion.overall = calculateOverallCompletion(newCompletion);
      
      await updateDoc(profileRef, {
        'completion.identity': { completed, progress, lastUpdated: serverTimestamp() },
        'completion.overall': newCompletion.overall,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving identity data:', error);
    throw error;
  }
};

export const getIdentityData = async (uid: string): Promise<IdentityData | null> => {
  try {
    const doc = await getDoc(getIdentityRef(uid));
    return doc.exists() ? doc.data() as IdentityData : null;
  } catch (error) {
    console.error('Error getting identity data:', error);
    throw error;
  }
};

// Net Worth operations
export const saveNetWorthData = async (uid: string, data: Partial<NetWorthData>): Promise<void> => {
  try {
    const netWorthRef = getNetWorthRef(uid);
    const profileRef = getProfileRef(uid);
    
    await setDoc(netWorthRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update profile completion
    const progress = calculateSectionCompletion(data, 'networth');
    const completed = progress >= 60; // 6 out of 10 questions
    
    const profile = await getProfile(uid);
    if (profile) {
      const newCompletion = {
        ...profile.completion,
        networth: { completed, progress, lastUpdated: new Date() }
      };
      newCompletion.overall = calculateOverallCompletion(newCompletion);
      
      await updateDoc(profileRef, {
        'completion.networth': { completed, progress, lastUpdated: serverTimestamp() },
        'completion.overall': newCompletion.overall,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving net worth data:', error);
    throw error;
  }
};

export const getNetWorthData = async (uid: string): Promise<NetWorthData | null> => {
  try {
    const doc = await getDoc(getNetWorthRef(uid));
    return doc.exists() ? doc.data() as NetWorthData : null;
  } catch (error) {
    console.error('Error getting net worth data:', error);
    throw error;
  }
};

// Food Preferences operations
export const saveFoodPreferencesData = async (uid: string, data: Partial<FoodPreferencesData>): Promise<void> => {
  try {
    const foodRef = getFoodPrefsRef(uid);
    const profileRef = getProfileRef(uid);
    
    await setDoc(foodRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update profile completion
    const progress = calculateSectionCompletion(data, 'food');
    const completed = progress >= 50; // Diet type + allergens minimum
    
    const profile = await getProfile(uid);
    if (profile) {
      const newCompletion = {
        ...profile.completion,
        food: { completed, progress, lastUpdated: new Date() }
      };
      newCompletion.overall = calculateOverallCompletion(newCompletion);
      
      await updateDoc(profileRef, {
        'completion.food': { completed, progress, lastUpdated: serverTimestamp() },
        'completion.overall': newCompletion.overall,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving food preferences data:', error);
    throw error;
  }
};

export const getFoodPreferencesData = async (uid: string): Promise<FoodPreferencesData | null> => {
  try {
    const doc = await getDoc(getFoodPrefsRef(uid));
    return doc.exists() ? doc.data() as FoodPreferencesData : null;
  } catch (error) {
    console.error('Error getting food preferences data:', error);
    throw error;
  }
};

// Lifestyle operations
export const saveLifestyleData = async (uid: string, data: Partial<LifestyleData>): Promise<void> => {
  try {
    const lifestyleRef = getLifestyleRef(uid);
    const profileRef = getProfileRef(uid);
    
    await setDoc(lifestyleRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update profile completion
    const progress = calculateSectionCompletion(data, 'lifestyle');
    const completed = progress >= 30; // Basic drinking/smoking status
    
    const profile = await getProfile(uid);
    if (profile) {
      const newCompletion = {
        ...profile.completion,
        lifestyle: { completed, progress, lastUpdated: new Date() }
      };
      newCompletion.overall = calculateOverallCompletion(newCompletion);
      
      await updateDoc(profileRef, {
        'completion.lifestyle': { completed, progress, lastUpdated: serverTimestamp() },
        'completion.overall': newCompletion.overall,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving lifestyle data:', error);
    throw error;
  }
};

export const getLifestyleData = async (uid: string): Promise<LifestyleData | null> => {
  try {
    const doc = await getDoc(getLifestyleRef(uid));
    return doc.exists() ? doc.data() as LifestyleData : null;
  } catch (error) {
    console.error('Error getting lifestyle data:', error);
    throw error;
  }
};

// Body Fit operations
export const saveBodyFitData = async (uid: string, data: Partial<BodyFitData>): Promise<void> => {
  try {
    const bodyFitRef = getBodyFitRef(uid);
    const profileRef = getProfileRef(uid);
    
    await setDoc(bodyFitRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update profile completion
    const progress = calculateSectionCompletion(data, 'bodyfit');
    const completed = progress >= 50; // Height + shoe size minimum
    
    const profile = await getProfile(uid);
    if (profile) {
      const newCompletion = {
        ...profile.completion,
        bodyfit: { completed, progress, lastUpdated: new Date() }
      };
      newCompletion.overall = calculateOverallCompletion(newCompletion);
      
      await updateDoc(profileRef, {
        'completion.bodyfit': { completed, progress, lastUpdated: serverTimestamp() },
        'completion.overall': newCompletion.overall,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving body fit data:', error);
    throw error;
  }
};

export const getBodyFitData = async (uid: string): Promise<BodyFitData | null> => {
  try {
    const doc = await getDoc(getBodyFitRef(uid));
    return doc.exists() ? doc.data() as BodyFitData : null;
  } catch (error) {
    console.error('Error getting body fit data:', error);
    throw error;
  }
};

// Utility function to get all user data
export const getAllUserData = async (uid: string) => {
  try {
    const [profile, identity, netWorth, food, lifestyle, bodyFit] = await Promise.all([
      getProfile(uid),
      getIdentityData(uid),
      getNetWorthData(uid),
      getFoodPreferencesData(uid),
      getLifestyleData(uid),
      getBodyFitData(uid)
    ]);
    
    return {
      profile,
      identity,
      netWorth,
      food,
      lifestyle,
      bodyFit
    };
  } catch (error) {
    console.error('Error getting all user data:', error);
    throw error;
  }
};
