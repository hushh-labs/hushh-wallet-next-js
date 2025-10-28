import { TastePayload } from '@/types';

// Simplified version to avoid TypeScript issues in production build
export function generatePass(serial: string, prefs: TastePayload): any {
  // For now, return a placeholder buffer
  // This function is not used in the current implementation
  // We're using simplePassGenerator.ts instead
  throw new Error('PKPass library has compatibility issues. Use simplePassGenerator.ts instead.');
}

export function formatPreferencesForPass(prefs: TastePayload): {
  primaryValue: string;
  cuisinesValue: string;
  brandValue: string;
  backFieldValue: string;
} {
  return {
    primaryValue: `${prefs.foodType} · ${prefs.spice}`,
    cuisinesValue: prefs.cuisines.length > 0 
      ? prefs.cuisines.slice(0, 2).join(", ") + (prefs.cuisines.length > 2 ? "..." : "")
      : "—",
    brandValue: prefs.dishes.length > 0 ? prefs.dishes[0] : "—",
    backFieldValue: [
      `Food: ${prefs.foodType}`,
      `Spice: ${prefs.spice}`,
      ...(prefs.cuisines.length > 0 ? [`Cuisines: ${prefs.cuisines.join(", ")}`] : []),
      ...(prefs.dishes.length > 0 ? [`Dish Types: ${prefs.dishes.join(", ")}`] : []),
      ...(prefs.exclusions.length > 0 ? [`Dietary: ${prefs.exclusions.join(", ")}`] : [])
    ].join("; ")
  };
}
