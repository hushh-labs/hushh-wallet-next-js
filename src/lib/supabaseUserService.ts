import { supabaseAdmin } from './supabase';
import { generateUID } from './uid';
import { User } from './supabase';
import crypto from 'crypto';

export class SupabaseUserService {
  
  static async createOrGetUser(name: string, email: string, phone: string): Promise<{
    uid: string;
    addToWalletUrl: string;
    profileUrl: string;
    isNew: boolean;
  }> {
    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.replace(/\D/g, '');
    const normalizedName = name.trim();
    
    // Convert phone to E.164 format
    let phoneE164 = normalizedPhone;
    if (normalizedPhone.length === 10) {
      phoneE164 = `+1${normalizedPhone}`;
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      phoneE164 = `+${normalizedPhone}`;
    } else {
      phoneE164 = `+1${normalizedPhone}`;
    }
    
    // Generate deterministic UID
    const uid = generateUID(normalizedEmail, phoneE164, normalizedName);
    
    try {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('uid', uid)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        throw fetchError;
      }
      
      if (existingUser) {
        // Update last seen
        await supabaseAdmin
          .from('users')
          .update({
            updated_at: new Date().toISOString(),
            meta: {
              ...existingUser.meta,
              last_seen_at: new Date().toISOString()
            }
          })
          .eq('uid', uid);
        
        return {
          uid,
          addToWalletUrl: `/api/passes/gold?uid=${uid}`,
          profileUrl: existingUser.links.profile_url,
          isNew: false
        };
      }
      
      // Create new user
      const profileToken = crypto.randomBytes(32).toString('hex');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hushh-gold-pass-mvp.vercel.app';
      
      const newUser: Omit<User, 'created_at' | 'updated_at'> = {
        uid,
        identity: {
          name: normalizedName,
          email: normalizedEmail,
          phone_e164: phoneE164
        },
        profile: undefined,
        links: {
          public_url: `${baseUrl}/u/${uid}`,
          profile_url: `${baseUrl}/u/${uid}/complete?token=${profileToken}`
        },
        tokens: {
          profile_token: profileToken
        },
        pass: undefined,
        meta: {
          tier: 'gold',
          created_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString()
        }
      };
      
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert([newUser]);
      
      if (insertError) {
        throw insertError;
      }
      
      return {
        uid,
        addToWalletUrl: `/api/passes/gold?uid=${uid}`,
        profileUrl: newUser.links.profile_url,
        isNew: true
      };
      
    } catch (error) {
      console.error('Error in createOrGetUser:', error);
      throw new Error('Failed to create or retrieve user');
    }
  }
  
  static async getUserByUid(uid: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('uid', uid)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user by UID:', error);
      throw new Error('Failed to retrieve user');
    }
  }
  
  static async updateUserProfile(
    uid: string,
    token: string,
    profileData: {
      city: string;
      state: string;
      zip: string;
      gender: 'male' | 'female';
      age: number;
      street1?: string;
    }
  ): Promise<boolean> {
    try {
      // First verify the token
      const { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('tokens, meta')
        .eq('uid', uid)
        .single();
      
      if (fetchError || !user) {
        throw new Error('User not found');
      }
      
      if (user.tokens.profile_token !== token) {
        throw new Error('Invalid token');
      }
      
      // Update profile
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          profile: profileData,
          updated_at: new Date().toISOString(),
          meta: {
            ...user.meta,
            last_seen_at: new Date().toISOString()
          }
        })
        .eq('uid', uid);
      
      if (updateError) {
        throw updateError;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }
  
  static async updatePassInfo(uid: string, passSerial?: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          pass: {
            serial: passSerial,
            last_generated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('uid', uid);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating pass info:', error);
      throw new Error('Failed to update pass information');
    }
  }
}
