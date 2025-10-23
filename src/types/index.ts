export type TastePayload = {
  foodType: "Vegetarian" | "Non-Vegetarian" | "Vegan" | "Jain" | "Eggetarian" | "Other";
  spice: "Mild" | "Medium" | "Spicy";
  cuisines: string[];  // len 0..3
  brands: string[];    // len 0..3
  lifestyle: string[]; // len 0..3
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
  brands: string[];
  lifestyle: string[];
};

export const PREFERENCE_GROUPS: PreferenceGroup[] = [
  {
    id: "foodType",
    label: "Food Type",
    required: true,
    maxSelections: 1,
    options: ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "Eggetarian", "Other"]
  },
  {
    id: "spice",
    label: "Spice",
    required: true,
    maxSelections: 1,
    options: ["Mild", "Medium", "Spicy"]
  },
  {
    id: "cuisines",
    label: "Cuisines",
    required: false,
    maxSelections: 3,
    options: ["North Indian", "South Indian", "Chinese", "Italian", "Mexican", "Thai", "Japanese", "American", "Mediterranean", "Continental"]
  },
  {
    id: "brands",
    label: "Brands",
    required: false,
    maxSelections: 3,
    options: ["Myntra", "Zara", "H&M", "Nike", "Adidas", "Puma", "Starbucks", "McDonald's", "KFC", "Domino's"]
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    required: false,
    maxSelections: 3,
    options: ["Fitness", "Travel", "Tech", "Fashion", "Food", "Music", "Sports", "Reading", "Gaming", "Art"]
  }
];
