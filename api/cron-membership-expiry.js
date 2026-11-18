import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

function services() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) throw new Error('Server is missing FIREBASE_SERVICE_ACCOUNT_KEY.')
    initializeApp({ credential: cert(JSON.parse(raw)) })
  }
  return getFirestore()
}

function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date())
}

async function sendTelegram(chatId, text) {
  if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error('Telegram bot is not configured.')
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.ok !== true) throw new Error(result.description || `Telegram API returned ${response.status}`)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }
  const expected = process.env.CRON_SECRET
  if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }

  try {
    const db = services()
    const today = indiaToday()
    const gymsSnap = await db.collection('gyms').get()
    let expired = 0
    let sent = 0
    let skipped = 0
    let failed = 0

    for (const gymDoc of gymsSnap.docs) {
      const gym = gymDoc.data()
      const ownerUid = gym.ownerUid
      if (!ownerUid) continue
      const ownerSnap = await db.collection('users').doc(ownerUid).get()
      const owner = ownerSnap.data() || {}
      const chatId = owner.telegramChatId
      const membershipsSnap = await gymDoc.ref.collection('memberships').get()

      for (const membershipDoc of membershipsSnap.docs) {
        const membershipRef = membershipDoc.ref
        let claimed = false
        let membership = null
        try {
          await db.runTransaction(async tx => {
            const fresh = await tx.get(membershipRef)
            if (!fresh.exists) return
            const data = fresh.data()
            if (data.status === 'Cancelled' || !data.expiryDate || data.expiryDate > today || data.expiryNotificationSentAt) return
            const claimMillis = data.expiryNotificationClaimedAt?.toMillis?.() || 0
            if (claimMillis && Date.now() - claimMillis < 10 * 60 * 1000) return
            tx.update(membershipRef, {
              status: 'Expired',
              expiryNotificationClaimedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp()
            })
            membership = data
            claimed = true
          })
        } catch (error) {
          console.error('Could not claim membership expiry:', membershipDoc.id, error)
          failed++
          continue
        }
        if (!claimed) continue
        expired++
        if (!chatId) {
          await membershipRef.update({
            expiryNotificationClaimedAt: FieldValue.delete(),
            expiryNotificationError: 'Gym owner has not connected Telegram.',
            updatedAt: FieldValue.serverTimestamp()
          })
          skipped++
          continue
        }

        const memberSnap = await gymDoc.ref.collection('members').doc(String(membership.memberId || '')).get()
        const memberName = memberSnap.exists ? (memberSnap.data().name || 'Member') : 'Deleted member'
        const gymName = gym.name || owner.gymName || 'Your gym'
        const message = [
          'GymFlow – Membership Expired',
          '',
          `Gym: ${gymName}`,
          `Member: ${memberName}`,
          `Plan: ${membership.planName || 'Membership'}`,
          `Expiry date: ${membership.expiryDate}`,
          '',
          'Please contact the member regarding renewal.'
        ].join('\n')

        try {
          await sendTelegram(chatId, message)
          await membershipRef.update({
            expiryNotificationSentAt: FieldValue.serverTimestamp(),
            expiryNotificationClaimedAt: FieldValue.delete(),
            expiryNotificationError: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp()
          })
          sent++
        } catch (error) {
          console.error('Telegram expiry notification failed:', membershipDoc.id, error)
          await membershipRef.update({
            expiryNotificationClaimedAt: FieldValue.delete(),
            expiryNotificationError: String(error.message || 'Telegram send failed').slice(0, 300),
            updatedAt: FieldValue.serverTimestamp()
          })
          failed++
        }
      }
    }

    return res.status(200).json({ ok: true, date: today, expired, sent, skipped, failed })
  } catch (error) {
    console.error('Membership expiry cron failed:', error)
    return res.status(500).json({ error: 'Membership expiry processing failed.' })
  }
}
