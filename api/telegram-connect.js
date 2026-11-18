import { randomBytes } from 'node:crypto';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

function admin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error('Server is missing FIREBASE_SERVICE_ACCOUNT_KEY.');
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return { auth: getAuth(), db: getFirestore() };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const { auth, db } = admin();
    const match = (req.headers.authorization || '').match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: 'Please sign in again.' });
    const decoded = await auth.verifyIdToken(match[1]);
    const userRef = db.collection('users').doc(decoded.uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists || userSnap.data().role !== 'gymOwner' || !userSnap.data().gymId) {
      return res.status(403).json({ error: 'Gym owner access is required.' });
    }
    const botUsername = (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
    if (!botUsername) return res.status(500).json({ error: 'Set TELEGRAM_BOT_USERNAME in Vercel environment variables.' });
    const code = randomBytes(24).toString('hex');
    await userRef.set({
      telegramLinkToken: code,
      telegramLinkExpiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
      telegramLinkCreatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    return res.status(200).json({
      url: `https://t.me/${botUsername}?start=${code}`,
      expiresInMinutes: 10,
      connected: Boolean(userSnap.data().telegramChatId)
    });
  } catch (error) {
    console.error('Telegram connect API error:', error);
    return res.status(500).json({ error: 'Unable to create Telegram connection link.' });
  }
}
