type FirebaseCompat = {
  initializeApp(config: Record<string, string>): void;
  apps: unknown[];
  auth(): any;
  firestore: (() => any) & { FieldValue: { serverTimestamp(): unknown } };
};

const firebase = (window as unknown as { firebase: FirebaseCompat }).firebase;

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyCf09ccxx3o-eG7puzJSrwmG_1yz6PqLkM',
    authDomain: 'love-history-app-20261109.firebaseapp.com',
    projectId: 'love-history-app-20261109',
    storageBucket: 'love-history-app-20261109.firebasestorage.app',
    messagingSenderId: '801162108855',
    appId: '1:801162108855:web:43c720b242ff87eda19232',
  });
}

const auth = firebase.auth();
const db = firebase.firestore();
const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

export type Profile = { uid: string; displayName: string; publicId: string; loveKeyMasked: string };
export type Relationship = { id: string; participantUids: string[]; participantNames: Record<string, string>; status: 'active' | 'ended_pending' | 'ended'; startedAt?: any; breakupAt?: any; finalizeAt?: any };
export type IncomingRequest = { id: string; fromUid: string; fromName: string; status: string };
export type DashboardData = { profile: Profile; active: Relationship | null; history: Relationship[]; incoming: IncomingRequest[] };

function normalizeLoveKey(value: string) {
  const key = value.trim().toLowerCase().replace(/\s/g, '');
  if (!/^\d{6,8}[a-z]{3}(?:-[a-z0-9]{3})?$/.test(key)) throw new Error('Enter your complete Love Key.');
  return key;
}

function accountEmail(loveKey: string) { return `${normalizeLoveKey(loveKey)}@users.lovehistory.app`; }

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes: Uint8Array) {
  let value = '';
  bytes.forEach((byte) => { value += String.fromCharCode(byte); });
  return btoa(value);
}

async function keyIndex(loveKey: string) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalizeLoveKey(loveKey)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode('love-history-public-index-v1'), iterations: 210_000, hash: 'SHA-256' }, material, 256);
  return bytesToHex(bits);
}

async function encryptPrivate(password: string, value: Record<string, string>) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(value)));
  return { algorithm: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iterations: 310_000, salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) };
}

function publicName(fullName: string) {
  const word = fullName.trim().split(/\s+/).find((item) => !item.includes('.') && item.replace(/[^a-z]/gi, '').length >= 3) ?? 'Member';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function randomId(length = 10) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((byte) => (byte % 36).toString(36)).join('').toUpperCase();
}

function maskKey(key: string) { return `${key.slice(0, 4)}••••${key.slice(-3)}`; }

export async function registerAccount(input: { loveKey: string; fullName: string; birthday: string; password: string }) {
  const fullName = input.fullName.trim().replace(/\s+/g, ' ');
  if (fullName.length < 3 || fullName.length > 100 || !/^[a-zA-Z.' -]+$/.test(fullName)) throw new Error('Enter a valid English full name.');
  const birthday = new Date(`${input.birthday}T00:00:00Z`);
  if (Number.isNaN(birthday.getTime()) || birthday.toISOString().slice(0, 10) !== input.birthday) throw new Error('Enter a valid birthday.');
  const today = new Date();
  let age = today.getUTCFullYear() - birthday.getUTCFullYear();
  if (today.getUTCMonth() < birthday.getUTCMonth() || (today.getUTCMonth() === birthday.getUTCMonth() && today.getUTCDate() < birthday.getUTCDate())) age -= 1;
  if (age < 18 || age > 100) throw new Error('Accounts are limited to adults aged 18 to 100.');
  if (input.password.length < 12 || input.password.length > 128) throw new Error('Password must contain 12 to 128 characters.');
  const base = normalizeLoveKey(input.loveKey);
  let loveKey = base;
  let credential: any;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      credential = await auth.createUserWithEmailAndPassword(accountEmail(loveKey), input.password);
      break;
    } catch (error: any) {
      if (error?.code !== 'auth/email-already-in-use') throw error;
      loveKey = `${base}-${randomId(3).toLowerCase()}`;
    }
  }
  if (!credential?.user) throw new Error('Unable to create a unique Love Key.');
  const uid = credential.user.uid;
  try {
    const displayName = publicName(fullName);
    await credential.user.updateProfile({ displayName });
    const lookupId = await keyIndex(loveKey);
    const batch = db.batch();
    batch.set(db.collection('profiles').doc(uid), {
      uid, displayName, publicId: `LH-${randomId(8)}`, loveKeyMasked: maskKey(loveKey),
      privateDetails: await encryptPrivate(input.password, { fullName, birthday: input.birthday }),
      createdAt: serverTimestamp(),
    });
    batch.set(db.collection('loveKeyIndex').doc(lookupId), { uid, displayName, createdAt: serverTimestamp() });
    await batch.commit();
    return loveKey;
  } catch (error) {
    await credential.user.delete().catch(() => undefined);
    throw error;
  }
}

export async function login(loveKey: string, password: string) {
  await auth.signInWithEmailAndPassword(accountEmail(loveKey), password);
}

export async function logout() { await auth.signOut(); }

export function waitForSession() {
  return new Promise<any>((resolve) => { const unsubscribe = auth.onAuthStateChanged((user: any) => { unsubscribe(); resolve(user); }); });
}

export async function loadDashboard(): Promise<DashboardData> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in again.');
  const [profileSnap, relationshipSnap, requestSnap] = await Promise.all([
    db.collection('profiles').doc(user.uid).get(),
    db.collection('relationships').where('participantUids', 'array-contains', user.uid).get(),
    db.collection('relationshipRequests').where('toUid', '==', user.uid).get(),
  ]);
  if (!profileSnap.exists) throw new Error('Profile is missing.');
  const relationships = relationshipSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Relationship[];
  return {
    profile: profileSnap.data() as Profile,
    active: relationships.find((item) => item.status === 'active') ?? null,
    history: relationships.filter((item) => item.status !== 'active'),
    incoming: requestSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })).filter((item: IncomingRequest) => item.status === 'pending'),
  };
}

export async function sendRelationshipRequest(partnerLoveKey: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in again.');
  const lookupHash = await keyIndex(partnerLoveKey);
  const [profile, lookup] = await Promise.all([db.collection('profiles').doc(user.uid).get(), db.collection('loveKeyIndex').doc(lookupHash).get()]);
  if (!lookup.exists) throw new Error('No account matches that exact Love Key.');
  const target = lookup.data();
  if (target.uid === user.uid) throw new Error('You cannot connect your own account.');
  const active = await db.collection('relationships').where('participantUids', 'array-contains', user.uid).get();
  if (active.docs.some((doc: any) => doc.data().status === 'active')) throw new Error('End your current relationship before sending a new request.');
  await db.collection('relationshipRequests').add({ fromUid: user.uid, fromName: profile.get('displayName'), toUid: target.uid, toName: target.displayName, targetKeyHash: lookupHash, status: 'pending', createdAt: serverTimestamp() });
}

export async function respondToRequest(requestId: string, accept: boolean) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in again.');
  const requestRef = db.collection('relationshipRequests').doc(requestId);
  await db.runTransaction(async (tx: any) => {
    const request = await tx.get(requestRef);
    if (!request.exists || request.get('toUid') !== user.uid || request.get('status') !== 'pending') throw new Error('Request is no longer available.');
    tx.update(requestRef, { status: accept ? 'accepted' : 'declined', respondedAt: serverTimestamp() });
    if (accept) tx.set(db.collection('relationships').doc(requestId), { participantUids: [request.get('fromUid'), user.uid], participantNames: { [request.get('fromUid')]: request.get('fromName'), [user.uid]: request.get('toName') }, status: 'active', startedAt: serverTimestamp(), requestId });
  });
}

export async function endRelationship(relationshipId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in again.');
  const now = new Date();
  const finalizeAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  await db.collection('relationships').doc(relationshipId).update({ status: 'ended_pending', breakupRequestedBy: user.uid, breakupAt: serverTimestamp(), finalizeAt });
}
