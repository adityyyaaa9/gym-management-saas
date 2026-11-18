import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

function database() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error('Server is missing FIREBASE_SERVICE_ACCOUNT_KEY.');
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const supplied = req.headers['x-telegram-bot-api-secret-token'];
  if (!expected || supplied !== expected) return res.status(401).send('Unauthorized');
  try {
    const message = req.body?.message;
    const chat = message?.chat;
    const text = message?.text || '';
    const start = text.match(/^\/start\s+([a-f0-9]{48})$/i);
    if (!chat || chat.type !== 'private' || !start) return res.status(200).send('ok');

    const db = database();
    const token = start[1];
    const matches = await db.collection('users').where('telegramLinkToken', '==', token).limit(1).get();
    if (matches.empty) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat.id, text: 'This GymFlow connection link is invalid or has expired. Please generate a new link from your GymFlow dashboard.' })
      });
      return res.status(200).send('ok');
    }
    const ownerDoc = matches.docs[0];
    const owner = ownerDoc.data();
    const expiry = owner.telegramLinkExpiresAt?.toMillis?.() || 0;
    if (expiry < Date.now() || !owner.gymId) return res.status(200).send('ok');

    await ownerDoc.ref.set({
      telegramChatId: String(chat.id),
      telegramUsername: chat.username || '',
      telegramConnectedAt: FieldValue.serverTimestamp(),
      telegramLinkToken: FieldValue.delete(),
      telegramLinkExpiresAt: FieldValue.delete()
    }, { merge: true });

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat.id, text: `GymFlow notifications connected successfully for ${owner.gymName || 'your gym'}. You'll receive membership expiry alerts here.` })
    });
    return res.status(200).send('ok');
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return res.status(500).send('Webhook error');
  }
}
