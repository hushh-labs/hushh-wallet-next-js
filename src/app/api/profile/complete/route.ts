import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyEditToken } from '@/lib/uid';

// Log event helper
async function logEvent(uid: string, type: string, meta: any = {}) {
  try {
    await supabaseAdmin
      .from('pass_events')
      .insert({
        uid,
        type,
        meta_json: meta
      });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

// Profile validation functions
function validateState(state: string): boolean {
  return /^[A-Z]{2}$/.test(state.toUpperCase());
}

function validateZip(zip: string): boolean {
  return /^\d{5}(-?\d{4})?$/.test(zip);
}

function validateGender(gender: string): boolean {
  return ['male', 'female', 'm', 'f'].includes(gender.toLowerCase());
}

function validateAge(age: number): boolean {
  return Number.isInteger(age) && age >= 13 && age <= 120;
}

function normalizeGender(gender: string): string {
  const normalized = gender.toLowerCase();
  if (normalized === 'm' || normalized === 'male') return 'male';
  if (normalized === 'f' || normalized === 'female') return 'female';
  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { uid, token, city, state, zip, gender, age, street1 } = body;

    // Validate required fields
    if (!uid || !token) {
      return NextResponse.json(
        { error: 'UID and token are required.' },
        { status: 400 }
      );
    }

    // Get member from database
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('uid, edit_token_hash, name')
      .eq('uid', uid)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found.' },
        { status: 404 }
      );
    }

    // Verify edit token with fallback for Apple Wallet broken tokens
    const isValidToken = verifyEditToken(token, member.edit_token_hash);
    const isValidBrokenToken = verifyEditToken(token.replace(/-/g, ''), member.edit_token_hash);
    
    if (!isValidToken && !isValidBrokenToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 403 }
      );
    }

    // Validate profile data if provided
    const updates: any = {};
    const validationErrors: string[] = [];

    if (city) {
      updates.profile_city = city.trim();
    }

    if (state) {
      if (!validateState(state)) {
        validationErrors.push('State must be a 2-letter US state code (e.g., CA, NY).');
      } else {
        updates.profile_state = state.toUpperCase();
      }
    }

    if (zip) {
      if (!validateZip(zip)) {
        validationErrors.push('ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789).');
      } else {
        updates.profile_zip = zip;
      }
    }

    if (gender) {
      if (!validateGender(gender)) {
        validationErrors.push('Gender must be male/female or M/F.');
      } else {
        updates.profile_gender = normalizeGender(gender);
      }
    }

    if (age !== undefined) {
      if (!validateAge(age)) {
        validationErrors.push('Age must be between 13 and 120.');
      } else {
        updates.profile_age = age;
      }
    }

    if (street1) {
      updates.profile_street1 = street1.trim();
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed.', details: validationErrors },
        { status: 400 }
      );
    }

    // If no updates provided, still mark as accessed
    if (Object.keys(updates).length === 0) {
      await logEvent(uid, 'profile_opened', {
        user_agent: request.headers.get('user-agent')
      });

      return NextResponse.json({
        ok: true,
        message: 'Profile accessed successfully.',
        member: member.name
      });
    }

    // Set profile update timestamp
    updates.profile_last_updated_at = new Date().toISOString();

    try {
      // Update member profile
      const { error: updateError } = await supabaseAdmin
        .from('members')
        .update(updates)
        .eq('uid', uid);

      if (updateError) {
        console.error('Failed to update member profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile.' },
          { status: 500 }
        );
      }

      // Log successful profile completion
      await logEvent(uid, 'profile_saved', {
        user_agent: request.headers.get('user-agent'),
        fields_updated: Object.keys(updates).filter(key => key !== 'profile_last_updated_at'),
        profile_complete: !!(updates.profile_city && updates.profile_state && 
                           updates.profile_zip && updates.profile_gender && updates.profile_age)
      });

      return NextResponse.json({
        ok: true,
        message: 'Profile updated successfully.',
        member: member.name,
        updated_fields: Object.keys(updates).filter(key => key !== 'profile_last_updated_at')
      });

    } catch (dbError) {
      console.error('Database error during profile update:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Profile completion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
