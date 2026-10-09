/**
 * Cryptographic Services for Digital Evidence Guardian.
 * Implements real SHA-256 digests via the W3C Web Cryptography API.
 * Ensures data integrity, file fingerprinting, and tamper-evident audit chaining.
 */

// Convert ArrayBuffer to hex string
export function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Compute SHA-256 digest of a text string
export async function sha256Text(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

// Compute SHA-256 of an ArrayBuffer or File
export async function sha256Buffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return sha256Buffer(buffer);
}

// Generate deterministic hash for an evidence record
export async function computeEvidenceRecordHash(payload: {
  id: string;
  caseId: string;
  evidenceType: string;
  description: string;
  collectionTimestamp: string;
  location: string;
  collectingOfficerBadge: string;
  fileHash?: string;
  version: number;
}): Promise<string> {
  const serialized = JSON.stringify({
    id: payload.id,
    caseId: payload.caseId,
    type: payload.evidenceType,
    desc: payload.description,
    timestamp: payload.collectionTimestamp,
    loc: payload.location,
    badge: payload.collectingOfficerBadge,
    fileHash: payload.fileHash || 'NONE',
    version: payload.version,
  });
  return sha256Text(serialized);
}

// Generate chained hash for an audit entry
export async function computeAuditEntryHash(
  previousHash: string,
  timestamp: string,
  action: string,
  userId: string,
  evidenceId: string | undefined,
  description: string
): Promise<string> {
  const message = `${previousHash}|${timestamp}|${action}|${userId}|${evidenceId || 'GLOBAL'}|${description}`;
  return sha256Text(message);
}

// Truncate hash for display (e.g. "a8f4b2...890c")
export function truncateHash(hash: string, length = 8): string {
  if (!hash) return '';
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}
