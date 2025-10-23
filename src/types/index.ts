export type TastePayload = {
  foodType: "Omnivore" | "Pescatarian" | "Vegetarian" | "Vegan" | "Flexitarian";
  spice: "No Spice" | "Mild" | "Medium" | "Hot" | "Extra Hot";
  cuisines: string[];    // len 0..3
  dishTypes: string[];   // len 0..3
  dietary: string[];     // len 0..2
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
  dishTypes: string[];
  dietary: string[];
};

export const PREFERENCE_GROUPS: PreferenceGroup[] = [
  {
    id: "foodType",
    label: "Food Type",
    required: true,
    maxSelections: 1,
    options: ["Omnivore", "Pescatarian", "Vegetarian", "Vegan", "Flexitarian"]
  },
  {
    id: "spice",
    label: "Spice Level",
    required: true,
    maxSelections: 1,
    options: ["No Spice", "Mild", "Medium", "Hot", "Extra Hot"]
  },
  {
    id: "cuisines",
    label: "World Cuisines",
    required: false,
    maxSelections: 3,
    options: [
      "African", "American", "Brazilian", "Mexican", "Peruvian", 
      "British/Irish", "French", "Greek", "Italian", "Spanish", "Turkish",
      "Middle Eastern/Levantine", "Mediterranean", "Indian (pan-regional)", 
      "Pakistani", "Sri Lankan", "Chinese", "Japanese", "Korean", 
      "Thai", "Vietnamese", "Indonesian", "Malaysian"
    ]
  },
  {
    id: "dishTypes",
    label: "Dish Types",
    required: false,
    maxSelections: 3,
    options: [
      "BBQ/Grill", "Curry/Stew", "Dumplings", "Noodles", "Pasta", "Pizza",
      "Rice Dishes", "Salad", "Sandwich/Wrap", "Seafood", "Soup", "Sushi",
      "Tacos/Burritos", "Tapas/Small Plates"
    ]
  },
  {
    id: "dietary",
    label: "Dietary & Restrictions",
    required: false,
    maxSelections: 2,
    options: [
      "Dairy-free", "Egg-free", "Gluten-free", "Halal", "High-protein",
      "Kosher", "Low-carb", "Low-sugar", "Nut-free"
    ]
  }
];
