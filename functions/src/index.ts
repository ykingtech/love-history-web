import { createCipheriv, createHmac, randomBytes } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Request, Response } from 'express';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();
const NIC_HMAC_KEY = defineSecret('NIC_HMAC_KEY');
const NIC_ENCRYPTION_KEY = defineSecret('NIC_ENCRYPTION_KEY');
const RATE_LIMIT_HMAC_KEY = defineSecret('RATE_LIMIT_HMAC_KEY');
const FIREBASE_WEB_API_KEY = defineSecret('FIREBASE_WEB_API_KEY');
const ALLOWED_ORIGIN = defineSecret('ALLOWED_ORIGIN');

const SESSION_COOKIE = '__Host-session';
const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
const secrets = [NIC_HMAC_KEY, NIC_ENCRYPTION_KEY, RATE_LIMIT_HMAC_KEY, FIREBASE_WEB_API_KEY, ALLOWED_ORIGIN];

type JsonRecord = Record<string, unknown>;

function normalizeNic(value: unknown): string {
  if (typeof value !== 'string') throw new PublicError(400, 'Invalid credentials.');
  const normalized = value.trim().replace(/[\s-]/g, '').toUpperCase();
  if (!/^(?:\d{9}[VX]|\d{12})$/.test(normalized)) throw new PublicError(400, 'Invalid credentials.');
  return normalized;
}

function lookupToken(nic: string): string {
  return createHmac('sha256', NIC_HMAC_KEY.value()).update(`nic:v1:${nic}`, 'utf8').digest('hex');
}

function encryptNic(nic: string) {
  const key = Buffer.from(NIC_ENCRYPTION_KEY.value(), 'base64');
  if (key.length !== 32) throw new Error('NIC_ENCRYPTION_KEY must decode to exactly 32 bytes.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from('love-history:nic:v1', 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(nic, 'utf8'), cipher.final()]);
  return {
    algorithm: 'AES-256-GCM',
    keyVersion: 1,
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  };
}

function syntheticEmail(token: string): string {
  return `${token}@nic.lovehistory.invalid`;
}

function parseCookies(value = ''): Record<string, string> {
  return Object.fromEntries(value.split(';').map((item) => item.trim().split('=').map(decodeURIComponent)).filter((pair) => pair.length === 2));
}

function clientFingerprint(req: Request): string {
  const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
  const ip = forwarded || req.ip || 'unknown';
  const agent = String(req.headers['user-agent'] ?? '').slice(0, 180);
  return createHmac('sha256', RATE_LIMIT_HMAC_KEY.value()).update(`${ip}|${agent}`).digest('hex');
}

async function enforceRateLimit(req: Request, bucket: string, max = 6, windowMinutes = 15) {
  const key = createHmac('sha256', RATE_LIMIT_HMAC_KEY.value()).update(`${bucket}:${clientFingerprint(req)}`).digest('hex');
  const ref = db.collection('_rateLimits').doc(key);
  const now = Timestamp.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const resetAt = data?.resetAt as Timestamp | undefined;
    if (!snap.exists || !resetAt || resetAt.toMillis() <= now.toMillis()) {
      tx.set(ref, { count: 1, resetAt: Timestamp.fromMillis(now.toMillis() + windowMinutes * 60_000) });
      return;
    }
    if (Number(data?.count ?? 0) >= max) throw new PublicError(429, 'Too many attempts. Please try again later.');
    tx.update(ref, { count: FieldValue.increment(1) });
  });
}

function assertSameOrigin(req: Request) {
  const allowed = ALLOWED_ORIGIN.value().replace(/\/$/, '');
  const origin = String(req.headers.origin ?? '').replace(/\/$/, '');
  if (!origin || origin !== allowed) throw new PublicError(403, 'Request rejected.');
}

function passwordFrom(body: JsonRecord): string {
  const password = body.password;
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw new PublicError(400, 'Invalid credentials.');
  }
  return password;
}

function displayNameFrom(body: JsonRecord): string {
  const value = typeof body.displayName === 'string' ? body.displayName.trim() : '';
  if (value.length < 2 || value.length > 60 || /[<>]/.test(value)) throw new PublicError(400, 'Invalid profile details.');
  return value;
}

async function signInWithPassword(email: string, password: string): Promise<string> {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_WEB_API_KEY.value())}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!response.ok) throw new PublicError(401, 'Invalid credentials.');
  const payload = await response.json() as { idToken?: string };
  if (!payload.idToken) throw new PublicError(401, 'Invalid credentials.');
  return payload.idToken;
}

function setSessionCookie(res: Response, cookie: string) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(cookie)}; Max-Age=${Math.floor(FIVE_DAYS / 1000)}; Path=/; HttpOnly; Secure; SameSite=Strict`);
}

async function requireUser(req: Request) {
  const cookie = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!cookie) throw new PublicError(401, 'Authentication required.');
  try { return await getAuth().verifySessionCookie(cookie, true); }
  catch { throw new PublicError(401, 'Authentication required.'); }
}

function json(res: Response, status: number, payload: JsonRecord) {
  res.status(status).set({
    'Cache-Control': 'no-store, max-age=0',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  }).json(payload);
}

class PublicError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

async function requireAppCheck(req: Request) {
  const token = req.header('X-Firebase-AppCheck');
  if (!token) throw new PublicError(401, 'Request rejected.');
  try { await getAppCheck().verifyToken(token); }
  catch { throw new PublicError(401, 'Request rejected.'); }
}

export const authApi = onRequest({ region: 'asia-south1', secrets, invoker: 'public' }, async (req, res) => {
  try {
    assertSameOrigin(req);
    await requireAppCheck(req);
    const path = req.path.replace(/\/$/, '');
    const body = (req.body ?? {}) as JsonRecord;

    if (req.method === 'POST' && path === '/register') {
      await enforceRateLimit(req, 'register', 4, 30);
      const nic = normalizeNic(body.nic);
      const password = passwordFrom(body);
      const displayName = displayNameFrom(body);
      const token = lookupToken(nic);
      const lookupRef = db.collection('_identityLookup').doc(token);
      if ((await lookupRef.get()).exists) throw new PublicError(409, 'Unable to create account.');

      let uid: string | undefined;
      try {
        const user = await getAuth().createUser({ email: syntheticEmail(token), password, displayName, emailVerified: true });
        uid = user.uid;
        const createdUid = user.uid;
        await db.runTransaction(async (tx) => {
          if ((await tx.get(lookupRef)).exists) throw new PublicError(409, 'Unable to create account.');
          tx.create(lookupRef, { uid: createdUid, createdAt: FieldValue.serverTimestamp() });
          tx.create(db.collection('_privateIdentities').doc(createdUid), { nic: encryptNic(nic), createdAt: FieldValue.serverTimestamp() });
          tx.create(db.collection('profiles').doc(createdUid), { displayName, publicId: randomBytes(9).toString('base64url'), relationshipStatus: 'single', createdAt: FieldValue.serverTimestamp() });
          tx.create(db.collection('_auditEvents').doc(), { type: 'account.created', actorUid: createdUid, at: FieldValue.serverTimestamp() });
        });
        const idToken = await signInWithPassword(syntheticEmail(token), password);
        setSessionCookie(res, await getAuth().createSessionCookie(idToken, { expiresIn: FIVE_DAYS }));
        return json(res, 201, { ok: true });
      } catch (error) {
        if (uid) await getAuth().deleteUser(uid).catch(() => undefined);
        throw error;
      }
    }

    if (req.method === 'POST' && path === '/login') {
      await enforceRateLimit(req, 'login', 6, 15);
      const nic = normalizeNic(body.nic);
      const password = passwordFrom(body);
      const idToken = await signInWithPassword(syntheticEmail(lookupToken(nic)), password);
      setSessionCookie(res, await getAuth().createSessionCookie(idToken, { expiresIn: FIVE_DAYS }));
      return json(res, 200, { ok: true });
    }

    if (req.method === 'POST' && path === '/logout') {
      await requireUser(req);
      res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`);
      return json(res, 200, { ok: true });
    }

    if (req.method === 'GET' && path === '/me') {
      const user = await requireUser(req);
      const profile = await db.collection('profiles').doc(user.uid).get();
      return json(res, 200, { profile: profile.exists ? profile.data() ?? null : null });
    }

    if (req.method === 'POST' && path === '/search') {
      await requireUser(req);
      await enforceRateLimit(req, 'search', 12, 60);
      const token = lookupToken(normalizeNic(body.nic));
      const lookup = await db.collection('_identityLookup').doc(token).get();
      if (!lookup.exists) return json(res, 404, { found: false });
      const profile = await db.collection('profiles').doc(String(lookup.get('uid'))).get();
      return json(res, 200, { found: true, profile: { publicId: profile.get('publicId'), displayName: profile.get('displayName'), relationshipStatus: profile.get('relationshipStatus') } });
    }

    return json(res, 404, { error: 'Not found.' });
  } catch (error) {
    if (error instanceof PublicError) return json(res, error.status, { error: error.message });
    console.error('Request failed', { name: error instanceof Error ? error.name : 'UnknownError' });
    return json(res, 500, { error: 'Request could not be completed.' });
  }
});
