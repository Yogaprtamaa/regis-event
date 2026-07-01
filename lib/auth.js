const encoder = new TextEncoder();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

function toBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET belum diset di .env");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = toBase64Url(encoder.encode(payload));

  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(signature));

  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token) {
  if (!token) return false;

  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return false;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64),
      encoder.encode(payloadB64),
    );
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
