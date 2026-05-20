// @yume-format: 1
/**
 * auth.yume.js - QR-based User Authentication
 * @tags: auth, qr, crypto
 */

import idAuth from '../qr-auth/id-auth.js';

export const __block = {
  id: 'sns:auth',
  type: 'module',
  versions: [{ hash: 'initial', content: '', ts: Date.now(), refs: [], tags: ['auth'] }]
};

// === HEAD ===

/**
 * Generate a new QR-based identity for a user.
 * Returns the recovery key string to be encoded in QR.
 */
export async function createNewUserIdentity() {
  const identity = await idAuth.generateIdentity();
  const recoveryKey = idAuth.encodeRecoveryKey(identity.ed25519Seed, identity.ed25519PublicRaw);
  return {
    recoveryKey: recoveryKey.full,
    publicId: idAuth.bytesToHex(identity.ed25519PublicRaw),
    identity
  };
}

/**
 * Authenticate using a recovery key string (e.g., from a QR scan or file).
 */
export async function authenticateWithKey(keyString) {
  try {
    const { ed25519Seed, ed25519PublicRaw } = idAuth.decodeRecoveryKey(keyString);
    const identity = await idAuth.restoreIdentityFromSeed(ed25519Seed, ed25519PublicRaw);
    return {
      success: true,
      publicId: idAuth.bytesToHex(identity.ed25519PublicRaw),
      identity
    };
  } catch (e) {
    console.error('Auth failed:', e);
    return { success: false, error: e.message };
  }
}

// === /HEAD ===
