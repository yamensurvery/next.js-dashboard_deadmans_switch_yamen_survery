import secrets from 'secrets.js-grempe';

/**
 * Splits a Uint8Array (e.g. a raw AES key) into `total` shares,
 * requiring `threshold` shares to reconstruct.
 *
 * Returns an array of hex strings — one per share.
 */
export function splitKey(
  keyBytes: Uint8Array,
  threshold: number,
  total: number
): string[] {
  // secrets.js works on hex strings
  const hex = bytesToHex(keyBytes);
  return secrets.share(hex, total, threshold);
}

/**
 * Reconstructs a Uint8Array from an array of shares (hex strings).
 * You only need `threshold` shares, but can pass more.
 */
export function combineShares(shares: string[]): Uint8Array {
  const hex = secrets.combine(shares);
  return hexToBytes(hex);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return result;
}