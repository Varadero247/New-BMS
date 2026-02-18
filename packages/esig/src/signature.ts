import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { createLogger } from '@ims/monitoring';
import { computeSignatureChecksum, verifySignatureChecksum } from './checksum';
import type {
  ElectronicSignature,
  SignatureRequest,
  SignatureVerification,
  SignatureMeaning,
} from './types';

const logger = createLogger('esig');

const VALID_MEANINGS: SignatureMeaning[] = [
  'APPROVED',
  'REVIEWED',
  'RELEASED',
  'VERIFIED',
  'REJECTED',
  'WITNESSED',
  'AUTHORED',
  'ACKNOWLEDGED',
];

/**
 * Create an electronic signature with password re-authentication.
 * Compliant with 21 CFR Part 11 requirements:
 * - Requires password re-entry for each signature
 * - Records meaning, timestamp, IP, and user agent
 * - Computes tamper-detection checksum
 */
export async function createSignature(
  request: SignatureRequest,
  passwordHash: string
): Promise<{ signature: ElectronicSignature | null; error?: string }> {
  // Validate meaning
  if (!VALID_MEANINGS.includes(request.meaning)) {
    return { signature: null, error: `Invalid signature meaning: ${request.meaning}` };
  }

  // Re-authenticate: verify password against stored hash
  const passwordValid = await bcrypt.compare(request.password, passwordHash);
  if (!passwordValid) {
    logger.warn('E-signature password re-authentication failed', {
      userId: request.userId,
      resourceType: request.resourceType,
      resourceId: request.resourceId,
    });
    return { signature: null, error: 'Password re-authentication failed' };
  }

  const now = new Date();
  const id = randomUUID();

  const checksum = computeSignatureChecksum({
    userId: request.userId,
    meaning: request.meaning,
    resourceType: request.resourceType,
    resourceId: request.resourceId,
    timestamp: now,
  });

  const signature: ElectronicSignature = {
    id,
    userId: request.userId,
    userEmail: request.userEmail,
    userFullName: request.userFullName,
    meaning: request.meaning,
    reason: request.reason,
    timestamp: now,
    ipAddress: request.ipAddress,
    userAgent: request.userAgent,
    resourceType: request.resourceType,
    resourceId: request.resourceId,
    resourceRef: request.resourceRef,
    checksum,
    valid: true,
  };

  logger.info('Electronic signature created', {
    signatureId: id,
    userId: request.userId,
    meaning: request.meaning,
    resourceType: request.resourceType,
    resourceId: request.resourceId,
  });

  return { signature };
}

/**
 * Verify an electronic signature's integrity.
 * Recomputes checksum and compares against stored value.
 */
export function verifySignature(signature: ElectronicSignature): SignatureVerification {
  const checksumMatch = verifySignatureChecksum({
    userId: signature.userId,
    meaning: signature.meaning,
    resourceType: signature.resourceType,
    resourceId: signature.resourceId,
    timestamp: signature.timestamp,
    storedChecksum: signature.checksum,
  });

  if (!checksumMatch) {
    logger.warn('Signature checksum mismatch — possible tampering', {
      signatureId: signature.id,
      userId: signature.userId,
    });
  }

  return {
    signatureId: signature.id,
    valid: checksumMatch && signature.valid,
    checksumMatch,
    userId: signature.userId,
    userEmail: signature.userEmail,
    meaning: signature.meaning,
    timestamp: signature.timestamp,
    resourceType: signature.resourceType,
    resourceId: signature.resourceId,
  };
}

/**
 * Validate that a signature meaning is valid.
 */
export function isValidMeaning(meaning: string): meaning is SignatureMeaning {
  return VALID_MEANINGS.includes(meaning as SignatureMeaning);
}

/**
 * Get all valid signature meanings.
 */
export function getValidMeanings(): SignatureMeaning[] {
  return [...VALID_MEANINGS];
}
