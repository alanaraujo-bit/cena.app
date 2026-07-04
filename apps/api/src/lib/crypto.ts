import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';

/** Hash a plaintext password with argon2id (strong default for a fresh build). */
export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain).catch(() => false);
}

/** Opaque, high-entropy refresh token (not a JWT). */
export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

/** SHA-256 hex — used to store refresh tokens without keeping the raw value. */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
