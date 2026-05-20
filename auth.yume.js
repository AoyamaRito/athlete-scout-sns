// @yume-format: 1

export const __block = {
  "id": "sns:auth",
  "type": "module",
  "schemaVersion": 2,
  "runtime": {
    "name": "yume",
    "version": "002"
  },
  "versions": [
    {
      "v": 1,
      "content": "",
      "ts": 1778951598747,
      "refs": [
        {
          "kind": "import",
          "target": "./vendor/id-auth.js"
        }
      ],
      "tags": [
        "auth"
      ],
      "applyId": null
    },
    {
      "content": "\n/**\n * Generate a new QR-based identity for a user.\n * Returns the recovery key string to be encoded in QR.\n */\nexport async function createNewUserIdentity() {\n  const identity = await idAuth.generateIdentity();\n  const recoveryKey = idAuth.encodeRecoveryKey(identity.ed25519Seed, identity.ed25519PublicRaw);\n  return {\n    recoveryKey: recoveryKey.full,\n    publicId: idAuth.bytesToHex(identity.ed25519PublicRaw),\n    identity\n  };\n}\n\n/**\n * Authenticate using a recovery key string (e.g., from a QR scan or file).\n */\nexport async function authenticateWithKey(keyString) {\n  try {\n    const { ed25519Seed, ed25519PublicRaw } = idAuth.decodeRecoveryKey(keyString);\n    const identity = await idAuth.restoreIdentityFromSeed(ed25519Seed, ed25519PublicRaw);\n    return {\n      success: true,\n      publicId: idAuth.bytesToHex(identity.ed25519PublicRaw),\n      identity\n    };\n  } catch (e) {\n    console.error('Auth failed:', e);\n    return { success: false, error: e.message };\n  }\n}\n",
      "ts": 1779249724181,
      "refs": [],
      "tags": [],
      "applyId": "apply-2026-05-20-67ffc6b7",
      "v": 2
    }
  ],
  "notes": {
    "apply:apply-2026-05-20-67ffc6b7": [
      {
        "id": "n-29cdcd44-e7a3-4839-81ac-ed25a1ecc0af",
        "author": "human",
        "ts": 1779249724183,
        "text": "Initial bootstrap"
      }
    ]
  }
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
