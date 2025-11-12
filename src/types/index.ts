// ===== CARD TYPES =====
export type CardType = 'PERSONAL' | 'BRAND' | 'ALLERGY' | 'FOOD' | 'HUSHH_ID';

export type CardStatus = 'NOT_CREATED' | 'ACTIVE' | 'UPDATE_AVAILABLE' | 'REVOKED';

// ===== UNIFIED HUSHH ID CARD =====
export type HushhCardPayload = {
  // Personal section
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  legalName: string;
  preferredName: string;
  phone: string; // E.164 format
  dob: string; // YYYY-MM-DD format
  
  // Food section  
  foodType: "omnivore" | "pescatarian" | "vegetarian" | "vegan" | "jain" | "eggitarian";
  spiceLevel: "no" | "mild" | "medium" | "hot" | "extra_hot";
  cuisines: string[];    // max 3
  dishes: string[];      // max 3  
  exclusions: string[];  // max 2
};

// ===== FIRESTORE DATA STRUCTURES =====
export type UserRecord = {
  profile: {
    preferredName: string;
    legalName: string;
    dob: string; // YYYY-MM-DD
    phone: string; // E.164 format
    gender?: string;
  };
  food: {
    foodType: string;
    spiceLevel: string;
    topCuisines: string[];
    dishStyles: string[];
    exclusions: string[];
  };
  card: {
    publicId: string; // UUID
    activeShareId: string; // Current QR target
    passSerial: string;
    platform?: { apple?: string; google?: string };
  };
  owner: {
    ownerTokenHash: string; // bcrypt hash
    recoveryKeyHash: string; // bcrypt hash
    createdAt: Date;
    lastSeenDevice?: string;
  };
  shareSettings: {
    visibility: "public_minimal" | "public_full" | "private";
    redactionPolicy?: object;
  };
  passGeneration?: {
    status: "pending" | "processing" | "completed" | "failed";
    jobId?: string;
    completedAt?: Date;
    failedAt?: Date;
    error?: string;
  };
};

export type PublicProfile = {
  sections: {
    personal: {
      preferredName: string;
      age: number; // computed from DOB
      maskedPhone: string; // "+91-••••-•••27"
    };
    food: {
      foodType: string;
      spiceLevel: string;
      topCuisines: string[];
      dishStyles: string[];
      exclusions: string[];
    };
  };
  lastUpdated: Date;
  version: number;
  redacted: boolean;
};

export type ShareLink = {
  publicId: string;
  status: "active" | "revoked";
  rotates: boolean;
  ttl?: Date;
  createdAt: Date;
};

export type ScanEvent = {
  shareId: string;
  publicId: string;
  timestamp: Date;
  userAgent?: string;
  anonymousId: string;
};

// ===== AUTH-LESS TOKENS =====
export type OwnerTokenClaim = {
  uid: string;
  deviceId: string;
  issued: number;
  expires: number;
};

export type RecoveryPhrase = {
  words: string[]; // 12-word BIP39 mnemonic
  checksum: string;
};

export type TokenValidationResult = {
  valid: boolean;
  uid?: string;
  deviceId?: string;
  error?: string;
};

// ===== FOOD CARD (existing, renamed for consistency) =====
export type FoodPayload = {
  foodType: "omnivore" | "pescatarian" | "vegetarian" | "vegan" | "jain" | "eggitarian";
  spice: "no" | "mild" | "medium" | "hot" | "extra_hot";
  cuisines: string[];    // len 0..3
  dishes: string[];      // len 0..3
  exclusions: string[];  // len 0..2
};

// Backward compatibility
export type TastePayload = FoodPayload;

// ===== PERSONAL DATA CARD =====
export type PersonalPayload = {
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  legalName: string;
  preferredName: string;
  phone: string;
  dob: string; // YYYY-MM-DD format
};

// ===== BRAND PREFERENCE CARD =====
export type BrandPayload = {
  styles: string[];         // 1-2 selections
  favBrands: string[];      // 0-3 selections
  budgetBand: string;       // required single selection
  sizes?: {
    tops?: string;
    bottoms?: string;
    footwear?: string;
    system?: string;
  };
  lean?: {
    color?: "neutrals" | "brights";
    material?: "cotton_first" | "mixed";
  };
};

// ===== ALLERGY SAFETY CARD =====
export type AllergyPayload = {
  allergens: string[];                    // min 1
  severity: "severe_doctor_diagnosed" | "mild_intolerance";
  xcontam: "yes" | "no";
  emergencyNote?: string;                 // max 240 chars
  frontConsent: "show_alert_large" | "show_discreet" | "back_only";
};

// ===== UNIFIED CARD DATA TYPES =====
export type CardData = {
  type: CardType;
  status: CardStatus;
  answers: PersonalPayload | BrandPayload | AllergyPayload | FoodPayload;
  lastSerial?: string;
  lastIssued?: Date;
  version: number;
};

// ===== SCREEN CONFIGURATION =====
export type ScreenType = 'radio' | 'text' | 'phone' | 'date' | 'textarea' | 'chips' | 'toggles';

export type ScreenConfig = {
  id: string;
  title: string;
  type: ScreenType;
  options?: string[];
  required?: boolean;
  maxSelections?: number;
  helper: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  errorMessage?: string;
};

export type PreferenceGroup = {
  id: string;
  label: string;
  required: boolean;
  maxSelections: number;
  options: string[];
};

export type TokenClaim = {
  v: number;
  serial: string;
  prefs: TastePayload;
  exp: number;
};

export type PassResponse = {
  url: string;
};

export type PreferenceState = {
  [key: string]: string[];
} & {
  foodType: string[];
  spice: string[];
  cuisines: string[];
  dishes: string[];
  exclusions: string[];
};

// ===== FOOD CARD CONFIGURATION =====
export const FOOD_PREFERENCE_GROUPS: PreferenceGroup[] = [
  {
    id: "foodType",
    label: "Food Type",
    required: true,
    maxSelections: 1,
    options: ["omnivore", "pescatarian", "vegetarian", "vegan", "jain", "eggitarian"]
  },
  {
    id: "spice",
    label: "Spice Level",
    required: true,
    maxSelections: 1,
    options: ["no", "mild", "medium", "hot", "extra_hot"]
  },
  {
    id: "cuisines",
    label: "Top Cuisines",
    required: false,
    maxSelections: 3,
    options: [
      "Indian", "Italian", "Pan-Asian", "Chinese", "Japanese", "Korean", "Thai", 
      "Mediterranean", "Mexican", "Middle-Eastern", "American", "Continental", 
      "French", "Spanish", "Greek", "Lebanese", "Vietnamese", "Burmese", 
      "African", "Turkish", "Persian", "Fusion"
    ]
  },
  {
    id: "dishes",
    label: "Dish Styles",
    required: false,
    maxSelections: 3,
    options: [
      "bowls", "grills", "curries", "baked", "salads", "soups", "stir-fries", 
      "noodles", "rice-based", "sandwiches", "wraps", "barbecue", "pasta", "dessert"
    ]
  },
  {
    id: "exclusions",
    label: "Dietary Exclusions",
    required: false,
    maxSelections: 2,
    options: [
      "gluten-free", "lactose-free", "eggless", "nut-free", "onion-garlic-free", 
      "soy-free", "sugar-free", "low-salt", "keto"
    ]
  }
];

// Backward compatibility
export const PREFERENCE_GROUPS: PreferenceGroup[] = FOOD_PREFERENCE_GROUPS;

// ===== PERSONAL DATA CARD CONFIGURATION =====
export const PERSONAL_SCREEN_CONFIGS: ScreenConfig[] = [
  {
    id: "gender",
    title: "How do you identify?",
    type: "radio",
    options: ["male", "female", "other", "prefer_not_to_say"],
    required: false,
    helper: "This helps us personalize your card. You can skip showing this on the card.",
    errorMessage: ""
  },
  {
    id: "legalName",
    title: "Legal name (as per ID)",
    type: "text",
    required: true,
    helper: "We keep this on the back of your card and in your account.",
    validation: { min: 2, max: 80 },
    errorMessage: "Enter a valid name (letters/spaces, 2–80 chars)."
  },
  {
    id: "preferredName",
    title: "What should we call you on the card?",
    type: "text",
    required: true,
    helper: "This will appear on the front of your card.",
    validation: { min: 1, max: 40 },
    errorMessage: "Add a short preferred name (1–40 chars)."
  },
  {
    id: "phone",
    title: "Your contact number",
    type: "phone",
    required: true,
    helper: "We never show this on the card face.",
    errorMessage: "Enter a valid phone number incl. country code."
  },
  {
    id: "dob",
    title: "Your birth date",
    type: "date",
    required: true,
    helper: "We display only your age on the card.",
    errorMessage: "Please choose a valid date of birth."
  }
];

// ===== BRAND PREFERENCE CARD CONFIGURATION =====
export const BRAND_SCREEN_CONFIGS: ScreenConfig[] = [
  {
    id: "styles",
    title: "Your style vibe",
    type: "chips",
    options: ["minimal", "classic", "street", "boho", "athleisure", "vintage", "formal"],
    required: true,
    maxSelections: 2,
    helper: "Pick one or two that feel most you.",
    errorMessage: "Pick 1–2 vibes."
  },
  {
    id: "favBrands",
    title: "Brands you reach for",
    type: "chips",
    options: ["Zudio", "Uniqlo", "H&M", "Mango", "Zara", "Levi's", "Nike", "Adidas", "Puma", "Max", "AJIO", "Lifestyle"],
    required: false,
    maxSelections: 3,
    helper: "Add up to three. We'll keep the full list on the back.",
    errorMessage: "You can add up to 3 brands."
  },
  {
    id: "budgetBand",
    title: "Comfort price band (per item)",
    type: "radio",
    options: ["₹500–₹1500", "₹1500–₹3000", "₹3000–₹6000", "₹6000+"],
    required: true,
    helper: "A rough comfort band helps stores guide you better.",
    errorMessage: "Select one comfort band."
  },
  {
    id: "sizes",
    title: "Your sizes (optional)",
    type: "text", // Will be custom component
    required: false,
    helper: "Stored privately. Shown on back only.",
    errorMessage: ""
  },
  {
    id: "lean",
    title: "Leanings",
    type: "toggles",
    required: false,
    helper: "Tiny hints that speed up curation.",
    errorMessage: ""
  }
];

// ===== ALLERGY SAFETY CARD CONFIGURATION =====
export const ALLERGY_SCREEN_CONFIGS: ScreenConfig[] = [
  {
    id: "allergens",
    title: "What are you allergic to?",
    type: "chips",
    options: ["peanuts", "tree_nuts", "dairy", "egg", "gluten", "soy", "shellfish", "fish", "sesame", "mustard", "sulphites"],
    required: true,
    helper: "Pick all that apply. Add 'Other' if needed.",
    errorMessage: "Pick at least one allergen."
  },
  {
    id: "severity",
    title: "How severe is it?",
    type: "radio",
    options: ["severe_doctor_diagnosed", "mild_intolerance"],
    required: true,
    helper: "This decides the alert tone on your card.",
    errorMessage: "Select severity."
  },
  {
    id: "xcontam",
    title: "Cross-contamination okay?",
    type: "radio",
    options: ["yes", "no"],
    required: true,
    helper: "Select 'No' if separate utensils/workspace required.",
    errorMessage: "Select an option."
  },
  {
    id: "emergencyNote",
    title: "Emergency instruction (optional)",
    type: "textarea",
    required: false,
    helper: "Example: 'Carry EpiPen', 'Lactaid in bag'. Shown on back only.",
    validation: { max: 240 },
    errorMessage: "Keep it under 240 characters."
  },
  {
    id: "frontConsent",
    title: "How visible should your alert be?",
    type: "radio",
    options: ["show_alert_large", "show_discreet", "back_only"],
    required: true,
    helper: "You stay in control of visibility.",
    errorMessage: "Pick a visibility option."
  }
];
