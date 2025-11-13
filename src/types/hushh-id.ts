// HUSHH ID Data Model Types

export type VisibilityLevel = 'public' | 'trusted' | 'private';

export interface IdentityData {
  fullName?: string;
  dateOfBirth?: string;
  shareYearOnly?: boolean;
  sexAtBirth?: 'female' | 'male' | 'intersex' | 'prefer-not-to-say';
  genderIdentity?: string[];
  customGenderIdentity?: string;
  pronouns?: string[];
  customPronouns?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  visibility: {
    fullName: VisibilityLevel;
    cityCountry: VisibilityLevel;
    yearOfBirth: VisibilityLevel;
    email: VisibilityLevel;
    phone: VisibilityLevel;
  };
}

export interface NetWorthData {
  // Assets (Q1-Q7)
  cashBank?: number;
  investments?: number;
  retirementAccounts?: number;
  realEstateEquity?: number;
  vehiclesEquity?: number;
  otherAssets?: number;
  
  // Liabilities (Q8-Q10)  
  mortgageBalance?: number;
  studentLoans?: number;
  creditCardsPersonalLoans?: number;
  otherLiabilities?: number;
  
  // Computed values
  totalAssets?: number;
  totalLiabilities?: number;
  netWorth?: number;
  
  // Display preferences
  shareMode: 'hide' | 'band' | 'exact';
  band?: '<10k' | '10k-100k' | '100k-1M' | '1M-10M' | '10M+';
  
  // Whether values are ranges or exact
  isRangeData: boolean;
}

export interface FoodPreferencesData {
  dietType?: 'vegetarian' | 'vegan' | 'eggetarian' | 'pescatarian' | 'halal' | 'kosher' | 'no-preference';
  
  // Big-9 allergens with severity
  allergens: {
    [key: string]: 'mild' | 'severe' | 'avoid-cross-contact';
  };
  
  intolerances?: string[];
  cuisineLikes?: string[];
  cuisineAvoids?: string[];
  spiceTolerance?: 'low' | 'medium' | 'high';
  
  // Taste preferences (0-10 scale)
  sweetPreference?: number;
  saltComfort?: number;
  
  mealPatterns?: string[];
  beverages?: string[];
  foodNotes?: string;
  
  showInQR: boolean;
}

export interface LifestyleData {
  // Drinking
  drinks?: 'yes' | 'no' | 'prefer-not-to-say';
  drinkingFrequency?: 'rarely' | 'occasionally' | 'weekly' | 'often';
  typicalQuantity?: '1' | '2-3' | '4-5' | '6+';
  drinkPreferences?: string[];
  drinkBudget?: '<$10' | '$10-$25' | '$25-$50' | '$50+';
  drinkDislikes?: string;
  
  // Smoking
  smokes?: 'no' | 'occasionally' | 'daily' | 'former';
  smokingTypes?: string[];
  smokingQuantity?: number;
  smokingPeriod?: 'per-day' | 'per-week';
  quitYear?: number;
  
  showInQR: boolean;
}

export interface BodyFitData {
  height?: number;
  heightUnit?: 'cm' | 'ft-in';
  weight?: number;
  weightUnit?: 'kg' | 'lb';
  
  shoeSize?: number;
  shoeSystem?: 'US' | 'UK' | 'EU' | 'CM';
  shoeWidth?: string;
  
  topSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  chestMeasurement?: number;
  
  waist?: number;
  waistUnit?: 'in' | 'cm';
  inseam?: number;
  inseamUnit?: 'in' | 'cm';
  
  ringSize?: number;
  ringSizeSystem?: 'US' | 'mm';
  wristCircumference?: number;
  
  fitPreference?: 'slim' | 'regular' | 'relaxed';
  bodyNotes?: string;
  
  fieldsVisibleInQR: string[];
}

export interface HushhCardData {
  hushhUid: string; // ULID
  qrVersion: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ShareToken {
  token: string;
  hushhUid: string;
  scope: 'public-minimal' | 'trusted' | 'full';
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
}

export interface ScanEvent {
  hushhUid: string;
  scannedAt: Date;
  userAgent?: string;
  scope: string;
  tokenUsed: string;
}

export type FormSection = 'identity' | 'networth' | 'food' | 'lifestyle' | 'bodyfit';

export interface FormCompletionStatus {
  identity: {
    completed: boolean;
    progress: number;
    lastUpdated?: Date;
  };
  networth: {
    completed: boolean;
    progress: number;
    lastUpdated?: Date;
  };
  food: {
    completed: boolean;
    progress: number;
    lastUpdated?: Date;
  };
  lifestyle: {
    completed: boolean;
    progress: number;
    lastUpdated?: Date;
  };
  bodyfit: {
    completed: boolean;
    progress: number;
    lastUpdated?: Date;
  };
  overall: number;
}

export interface HushhProfile {
  uid: string;
  identity?: IdentityData;
  netWorth?: NetWorthData;
  foodPreferences?: FoodPreferencesData;
  lifestyle?: LifestyleData;
  bodyFit?: BodyFitData;
  hushhCard?: HushhCardData;
  completion: FormCompletionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Form field definitions for dynamic rendering
export interface FormFieldDefinition {
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'textarea' | 'select' | 'multiselect' | 'segmented' | 'chips' | 'toggle' | 'slider';
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  options?: { value: string; label: string }[];
  visibilityControl?: boolean;
}

// Card definitions for home page
export interface CardDefinition {
  id: FormSection;
  title: string;
  description: string;
  fields: FormFieldDefinition[];
  completionWeight: number;
  minRequiredFields: number;
}
