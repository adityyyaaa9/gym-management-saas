import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

function services() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) throw new Error('Server is missing FIREBASE_SERVICE_ACCOUNT_KEY.')
    initializeApp({ credential: cert(JSON.parse(raw)) })
  }
  return { auth: getAuth(), db: getFirestore() }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const { auth, db } = services()
    const match = (req.headers.authorization || '').match(/^Bearer (.+)$/)
    if (!match) return res.status(401).json({ error: 'Please sign in again.' })
    const decoded = await auth.verifyIdToken(match[1])
    const profileSnap = await db.collection('users').doc(decoded.uid).get()
    const profile = profileSnap.data()
    if (!profileSnap.exists || profile?.role !== 'gymOwner' || !profile?.gymId) {
      return res.status(403).json({ error: 'Gym owner access is required.' })
    }

    const members = db.collection('gyms').doc(profile.gymId).collection('members')
    if (req.method === 'GET') {
      const snap = await members.orderBy('createdAt', 'desc').limit(500).get()
      return res.status(200).json({ members: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    }
    if (req.method === 'POST') {
      const { name, phone, age, gender } = req.body || {}
      if (!name?.trim() || !phone?.trim()) return res.status(400).json({ error: 'Member name and phone number are required.' })
      const clean = {
        name: name.trim().slice(0, 100), phone: phone.trim().slice(0, 30),
        age: age === '' || age == null ? null : Math.max(1, Math.min(120, Number(age))),
        gender: ['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender) ? gender : '',
        gymId: profile.gymId, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
        createdBy: decoded.uid
      }
      if (clean.age !== null && !Number.isFinite(clean.age)) return res.status(400).json({ error: 'Enter a valid age.' })
      const ref = await members.add(clean)
      const saved = await ref.get()
      return res.status(201).json({ member: { id: ref.id, ...saved.data() } })
    }
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const id = String(req.query.id || req.body?.id || '')
      if (!id || id.includes('/')) return res.status(400).json({ error: 'A valid member ID is required.' })
      const ref = members.doc(id)
      const existing = await ref.get()
      if (!existing.exists) return res.status(404).json({ error: 'Member not found.' })
      if (req.method === 'DELETE') {
        await ref.delete()
        return res.status(200).json({ success: true })
      }
      const { name, phone, age, gender } = req.body || {}
      if (!name?.trim() || !phone?.trim()) return res.status(400).json({ error: 'Member name and phone number are required.' })
      const clean = {
        name: name.trim().slice(0, 100), phone: phone.trim().slice(0, 30),
        age: age === '' || age == null ? null : Math.max(1, Math.min(120, Number(age))),
        gender: ['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender) ? gender : '',
        updatedAt: FieldValue.serverTimestamp()
      }
      if (clean.age !== null && !Number.isFinite(clean.age)) return res.status(400).json({ error: 'Enter a valid age.' })
      await ref.update(clean)
      const saved = await ref.get()
      return res.status(200).json({ member: { id: ref.id, ...saved.data() } })
    }
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    console.error('Owner members API error:', error)
    return res.status(500).json({ error: 'Unable to process member request.' })
  }
}
