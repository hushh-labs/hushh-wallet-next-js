import { NextRequest, NextResponse } from 'next/server';
import { generatePassToken } from '@/lib/jwt';
import { TastePayload, PREFERENCE_GROUPS } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: TastePayload = await request.json();
    
    // Validate payload
    const validation = validateTastePayload(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate token
    const token = generatePassToken(body);
    
    // Return signed URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    return NextResponse.json({
      url: `${baseUrl}/api/wallet/${token}`
    }, { status: 201 });

  } catch (error) {
    console.error('Pass creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateTastePayload(payload: TastePayload): { valid: boolean; error?: string } {
  // Check required fields
  if (!payload.foodType || !payload.spice) {
    return { valid: false, error: 'Food Type and Spice are required' };
  }

  // Validate food type
  const foodTypeGroup = PREFERENCE_GROUPS.find(g => g.id === 'foodType');
  if (!foodTypeGroup?.options.includes(payload.foodType)) {
    return { valid: false, error: 'Invalid food type' };
  }

  // Validate spice level
  const spiceGroup = PREFERENCE_GROUPS.find(g => g.id === 'spice');
  if (!spiceGroup?.options.includes(payload.spice)) {
    return { valid: false, error: 'Invalid spice level' };
  }

  // Count total selections
  const totalSelections = 1 + 1 + // foodType + spice (required)
    payload.cuisines.length +
    payload.brands.length +
    payload.lifestyle.length;

  if (totalSelections !== 5) {
    return { valid: false, error: 'Exactly 5 preferences must be selected' };
  }

  // Validate array lengths
  if (payload.cuisines.length > 3 || payload.brands.length > 3 || payload.lifestyle.length > 3) {
    return { valid: false, error: 'Maximum 3 selections per category' };
  }

  return { valid: true };
}
