import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { TastePayload, TokenClaim } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'hushh-wallet-secret-key-change-in-production';
const TOKEN_EXPIRY = 5 * 60; // 5 minutes

export function generatePassToken(prefs: TastePayload): string {
  const serial = `hushh-${nanoid(8)}`;
  const claim: TokenClaim = {
    v: 1,
    serial,
    prefs,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY
  };

  return jwt.sign(claim, JWT_SECRET, { algorithm: 'HS256' });
}

export function verifyPassToken(token: string): TokenClaim | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as TokenClaim;
    
    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function getSerialFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as TokenClaim;
    return decoded?.serial || null;
  } catch {
    return null;
  }
}
