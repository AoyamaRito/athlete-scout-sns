// id-auth.js — Core cryptographic logic (v2: recovery-key only)
//
// v2 設計: ユーザーが管理する秘密はリカバリーキー1つだけ。
//   電話番号は廃止。サーバーは public_key ↔ hmac_secret だけを保管する軽量リレー。
//
// Bible §0.1 Heavy Functions / No-Shared Helpers / Inline > Extract:
//   各機能はインラインで自己完結。共有ヘルパー禁止。
//
// Bible §5 Attestation Over Auth + 軽量合成型:
//   Ed25519 公開鍵署名 + HMAC-SHA256 共有鍵検証の二重認証。
//
// Bible §0.2 Web標準のみ:
//   crypto.subtle (Web Crypto API) のみ使用。
//
// L3 Logic 層: DOM/event/描画には触れない。純粋ロジックのみ。
// Browser ESM / Node 21+ で動作。

const ID_AUTH_VERSION = "v2-ed25519-hmac";
const PBKDF2_ITERS_PASSWORD = 600_000;
const HMAC_SECRET_BYTES = 32;
const ED25519_SEED_BYTES = 32;
const ED25519_PUBKEY_BYTES = 32;
const SALT_BYTES = 16;
const IV_BYTES = 12;

// PKCS#8 ASN.1 prefix for Ed25519 seed (32 bytes follow this prefix → valid PKCS8 private key)
//   SEQUENCE { INTEGER 0, AlgorithmIdentifier(1.3.101.112), OCTET STRING (OCTET STRING (32B)) }
const PKCS8_ED25519_PREFIX = new Uint8Array([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06,
  0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

// Base32 (RFC 4648 no padding) アルファベット
const BASE32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";


// 新規アカウントの全秘密素材を生成する自己完結関数。
// crypto.subtle.generateKey で Ed25519 を作り、PKCS8 から末尾32バイトを seed として取り出す。
// hmacSecret は HKDF(seed, "hmac") で seed から決定論的に派生（v1 のような独立乱数ではない）。
// これにより、リカバリーキーに seed と pubkey を入れるだけで完全復元可能になる。
//
// 戻り値:
//   { ed25519Seed: Uint8Array(32), ed25519PublicRaw: Uint8Array(32),
//     hmacSecret: Uint8Array(32), ed25519PrivateRaw: Uint8Array(48) (PKCS8) }
// @tags: SPEC
async function generateIdentity() {
  const kp = await crypto.subtle.generateKey(
    { name: "Ed25519" }, true, ["sign", "verify"]
  );
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", kp.privateKey));
  const publicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  // PKCS8 の末尾32バイトが Ed25519 seed
  const seed = pkcs8.slice(pkcs8.length - ED25519_SEED_BYTES);

  // HMAC共有鍵を seed から HKDF 派生
  // 共有禁止のため HKDF 呼び出しはこの関数内に閉じる（restore 側でも独立に書く）
  const ikm = await crypto.subtle.importKey(
    "raw", seed, { name: "HKDF" }, false, ["deriveBits"]
  );
  const hmacBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF", hash: "SHA-256",
      salt: new Uint8Array(0),
      info: new TextEncoder().encode("id-auth-v2-hmac"),
    },
    ikm, HMAC_SECRET_BYTES * 8
  );

  return {
    ed25519Seed: seed,
    ed25519PublicRaw: publicRaw,
    hmacSecret: new Uint8Array(hmacBits),
    ed25519PrivateRaw: pkcs8,
  };
}


// リカバリーキーから ID を復元する。
// 入力: ed25519Seed (32B), ed25519PublicRaw (32B) ※どちらもQRに同梱されている
// 出力: { ed25519Seed, ed25519PublicRaw, hmacSecret, ed25519PrivateRaw (PKCS8 reconstructed) }
//
// PKCS8 を seed + ASN.1 prefix で再構築し、Web Crypto に importKey で読み込ませる。
// hmacSecret は generateIdentity と同じ HKDF を再計算（共有禁止なのでロジックは独立に書く）。
// @tags: SPEC
async function restoreIdentityFromSeed(ed25519Seed, ed25519PublicRaw) {
  if (ed25519Seed.length !== ED25519_SEED_BYTES) {
    throw new Error(`seed must be ${ED25519_SEED_BYTES} bytes`);
  }
  if (ed25519PublicRaw.length !== ED25519_PUBKEY_BYTES) {
    throw new Error(`pubkey must be ${ED25519_PUBKEY_BYTES} bytes`);
  }

  // PKCS8 を再構築
  const pkcs8 = new Uint8Array(PKCS8_ED25519_PREFIX.length + ED25519_SEED_BYTES);
  pkcs8.set(PKCS8_ED25519_PREFIX, 0);
  pkcs8.set(ed25519Seed, PKCS8_ED25519_PREFIX.length);

  // 形式チェックを兼ねて importKey でロードできることを確認
  await crypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, true, ["sign"]);

  // HMAC共有鍵を seed から HKDF 派生
  const ikm = await crypto.subtle.importKey(
    "raw", ed25519Seed, { name: "HKDF" }, false, ["deriveBits"]
  );
  const hmacBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF", hash: "SHA-256",
      salt: new Uint8Array(0),
      info: new TextEncoder().encode("id-auth-v2-hmac"),
    },
    ikm, HMAC_SECRET_BYTES * 8
  );

  return {
    ed25519Seed,
    ed25519PublicRaw,
    hmacSecret: new Uint8Array(hmacBits),
    ed25519PrivateRaw: pkcs8,
  };
}


// localStorage 永続化用に {ed25519Seed, ed25519PublicRaw} をパスワードで暗号化する。
// hmacSecret は seed から派生できるため保存しない（最小化）。
// 戻り値: { ciphertext, salt, iv }
// @tags: SPEC
async function encryptSecretsForPassword(ed25519Seed, ed25519PublicRaw, password) {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  const iv = new Uint8Array(IV_BYTES);
  crypto.getRandomValues(iv);

  const enc = new TextEncoder();
  const ikm = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  const passwordKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERS_PASSWORD, hash: "SHA-256" },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // payload = seed(32) || pubkey(32)  64バイト固定
  const payload = new Uint8Array(ED25519_SEED_BYTES + ED25519_PUBKEY_BYTES);
  payload.set(ed25519Seed, 0);
  payload.set(ed25519PublicRaw, ED25519_SEED_BYTES);

  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, passwordKey, payload
  ));
  return { ciphertext: ct, salt, iv };
}


// localStorage の暗号化blobをパスワードで復号。失敗時 throw。
// 戻り値: { ed25519Seed, ed25519PublicRaw }
// @tags: SPEC
async function decryptSecretsWithPassword(ciphertext, salt, iv, password) {
  const enc = new TextEncoder();
  const ikm = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  const passwordKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERS_PASSWORD, hash: "SHA-256" },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const plain = new Uint8Array(await crypto.subtle.decrypt(
    { name: "AES-GCM", iv }, passwordKey, ciphertext
  ));
  if (plain.length !== ED25519_SEED_BYTES + ED25519_PUBKEY_BYTES) {
    throw new Error("invalid local blob format");
  }
  return {
    ed25519Seed: plain.slice(0, ED25519_SEED_BYTES),
    ed25519PublicRaw: plain.slice(ED25519_SEED_BYTES),
  };
}


// サーバーの challenge に対して Ed25519署名 + HMAC を作る。両方を verify して初めて認証成立。
// @tags: SPEC
async function signAuthChallenge(ed25519PrivateRawPkcs8, hmacSecret, challenge, ts) {
  // payload = challenge(32) || ts(8 LE)
  const payload = new Uint8Array(challenge.length + 8);
  payload.set(challenge, 0);
  const dv = new DataView(payload.buffer);
  dv.setBigUint64(challenge.length, BigInt(ts), true);

  const privKey = await crypto.subtle.importKey(
    "pkcs8", ed25519PrivateRawPkcs8, { name: "Ed25519" }, false, ["sign"]
  );
  const ed_sig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, privKey, payload));

  const hmacKey = await crypto.subtle.importKey(
    "raw", hmacSecret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const hmac = new Uint8Array(await crypto.subtle.sign({ name: "HMAC" }, hmacKey, payload));

  return { ed_sig, hmac, payload };
}


// サーバー側で使う検証関数。Ed25519 と HMAC の両方が verify されないと false。
// @tags: SPEC
async function verifyAuthChallenge(publicRaw, storedHmacSecret, challenge, ts, ed_sig, hmac) {
  const payload = new Uint8Array(challenge.length + 8);
  payload.set(challenge, 0);
  const dv = new DataView(payload.buffer);
  dv.setBigUint64(challenge.length, BigInt(ts), true);

  const pubKey = await crypto.subtle.importKey(
    "raw", publicRaw, { name: "Ed25519" }, true, ["verify"]
  );
  const edOk = await crypto.subtle.verify({ name: "Ed25519" }, pubKey, ed_sig, payload);
  if (!edOk) return false;

  const hmacKey = await crypto.subtle.importKey(
    "raw", storedHmacSecret, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const hmacOk = await crypto.subtle.verify({ name: "HMAC" }, hmacKey, hmac, payload);
  if (!hmacOk) return false;

  return true;
}


// 64バイト (seed 32 + pubkey 32) → `IDAUTH-V2-XXXXX-...-CRC` 形式。
// QRに格納する内容、印刷物の表記、テキスト保管、すべての元になる単一文字列形式。
// 戻り値: { full: ハイフン整形版, raw: ハイフン無し版 }
// @tags: SPEC
function encodeRecoveryKey(ed25519Seed, ed25519PublicRaw) {
  if (ed25519Seed.length !== ED25519_SEED_BYTES) {
    throw new Error(`seed must be ${ED25519_SEED_BYTES} bytes`);
  }
  if (ed25519PublicRaw.length !== ED25519_PUBKEY_BYTES) {
    throw new Error(`pubkey must be ${ED25519_PUBKEY_BYTES} bytes`);
  }
  const combined = new Uint8Array(64);
  combined.set(ed25519Seed, 0);
  combined.set(ed25519PublicRaw, ED25519_SEED_BYTES);

  // Base32 (RFC 4648 no padding): 64バイト = 512bit → ceil(512/5) = 103 文字
  let bitBuffer = 0;
  let bitCount = 0;
  let b32 = "";
  for (let i = 0; i < combined.length; i++) {
    bitBuffer = (bitBuffer << 8) | combined[i];
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      b32 += BASE32_ALPHA[(bitBuffer >> bitCount) & 0x1f];
    }
  }
  if (bitCount > 0) {
    b32 += BASE32_ALPHA[(bitBuffer << (5 - bitCount)) & 0x1f];
  }

  // CRC-8 (poly 0x07) 計算: 入力誤りを検知する軽量チェックサム。
  // 共有禁止のためインライン記述。
  let crc = 0;
  for (let i = 0; i < combined.length; i++) {
    crc ^= combined[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  const crcStr = BASE32_ALPHA[(crc >> 5) & 0x1f] + BASE32_ALPHA[crc & 0x1f];

  const raw = `IDAUTH-V2-${b32}-${crcStr}`;

  // 5文字ごとにハイフンで人間可読に
  let grouped = "IDAUTH-V2-";
  for (let i = 0; i < b32.length; i += 5) {
    grouped += b32.slice(i, i + 5);
    if (i + 5 < b32.length) grouped += "-";
  }
  grouped += `-${crcStr}`;

  return { full: grouped, raw };
}


// `IDAUTH-V2-...-CRC` を { ed25519Seed, ed25519PublicRaw } に戻す。
// 失敗時は throw（プレフィックス違い、CRC不一致、長さ不正等）。
// @tags: SPEC
function decodeRecoveryKey(input) {
  const cleaned = input.toUpperCase().replace(/[\s-]/g, "");
  if (!cleaned.startsWith("IDAUTHV2")) {
    throw new Error("invalid prefix; expected IDAUTH-V2");
  }
  const body = cleaned.slice(8);
  // 末尾2文字 = CRC、それ以前103文字 = base32 ペイロード（64バイト分）
  if (body.length !== 103 + 2) {
    throw new Error(`invalid length: got ${body.length}, expected 105 chars after prefix`);
  }
  const b32 = body.slice(0, 103);
  const crcStr = body.slice(103);

  const combined = new Uint8Array(64);
  let bitBuffer = 0;
  let bitCount = 0;
  let outIdx = 0;
  for (let i = 0; i < b32.length; i++) {
    const c = b32[i];
    const v = BASE32_ALPHA.indexOf(c);
    if (v < 0) throw new Error(`invalid base32 char: ${c}`);
    bitBuffer = (bitBuffer << 5) | v;
    bitCount += 5;
    if (bitCount >= 8) {
      bitCount -= 8;
      combined[outIdx++] = (bitBuffer >> bitCount) & 0xff;
      if (outIdx === 64) break;
    }
  }
  if (outIdx !== 64) {
    throw new Error("decoded length mismatch");
  }

  // CRC 検証（同じ計算をインライン再掲）
  let crc = 0;
  for (let i = 0; i < combined.length; i++) {
    crc ^= combined[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  const expected = BASE32_ALPHA[(crc >> 5) & 0x1f] + BASE32_ALPHA[crc & 0x1f];
  if (crcStr !== expected) {
    throw new Error("checksum mismatch (CRC-8): possible typo or corruption");
  }

  return {
    ed25519Seed: combined.slice(0, ED25519_SEED_BYTES),
    ed25519PublicRaw: combined.slice(ED25519_SEED_BYTES),
  };
}


// バイト列 ↔ hex / base64 の変換ユーティリティ。L1（DOM・fetch）への引き渡しで使う。
function bytesToHex(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}
function hexToBytes(hex) {
  if (hex.length % 2 !== 0) throw new Error("invalid hex length");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
function bytesToBase64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function base64ToBytes(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}


// イベントを直列ハッシュチェーンで追記。サーバー・クライアント両側で使う想定。
// @tags: SPEC
async function appendEventLog(prevHash, type, body, ts) {
  const enc = new TextEncoder();
  const canonical = JSON.stringify({ type, body, ts });
  const buf = new Uint8Array(prevHash.length + enc.encode(canonical).length);
  buf.set(prevHash, 0);
  buf.set(enc.encode(canonical), prevHash.length);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const hash = new Uint8Array(hashBuf);
  return { type, body, ts, prevHash, hash };
}


// 直列ハッシュチェーンの整合性を検証。1件でも改ざんされていれば false。
// @tags: SPEC
async function verifyEventLog(events, genesisHash) {
  let expectedPrev = genesisHash;
  const enc = new TextEncoder();
  for (const ev of events) {
    if (ev.prevHash.length !== expectedPrev.length) return false;
    for (let i = 0; i < expectedPrev.length; i++) {
      if (ev.prevHash[i] !== expectedPrev[i]) return false;
    }
    const canonical = JSON.stringify({ type: ev.type, body: ev.body, ts: ev.ts });
    const buf = new Uint8Array(ev.prevHash.length + enc.encode(canonical).length);
    buf.set(ev.prevHash, 0);
    buf.set(enc.encode(canonical), ev.prevHash.length);
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hash = new Uint8Array(hashBuf);
    if (hash.length !== ev.hash.length) return false;
    for (let i = 0; i < hash.length; i++) {
      if (hash[i] !== ev.hash[i]) return false;
    }
    expectedPrev = hash;
  }
  return true;
}


const idAuth = {
  ID_AUTH_VERSION,
  generateIdentity,
  restoreIdentityFromSeed,
  encryptSecretsForPassword,
  decryptSecretsWithPassword,
  signAuthChallenge,
  verifyAuthChallenge,
  encodeRecoveryKey,
  decodeRecoveryKey,
  appendEventLog,
  verifyEventLog,
  bytesToHex,
  hexToBytes,
  bytesToBase64,
  base64ToBytes,
};
export default idAuth;
if (typeof module !== "undefined" && module.exports) {
  module.exports = idAuth;
} else if (typeof window !== "undefined") {
  window.idAuth = idAuth;
}
