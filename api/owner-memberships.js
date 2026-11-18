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
function dateOnly(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) }
function addMonths(dateString, months) {
  const [y, m, d] = dateString.split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, last))
  return target.toISOString().slice(0, 10)
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
    if (!profileSnap.exists || profile?.role !== 'gymOwner' || !profile?.gymId) return res.status(403).json({ error: 'Gym owner access is required.' })

    const gym = db.collection('gyms').doc(profile.gymId)
    const plans = gym.collection('membershipPlans')
    const memberships = gym.collection('memberships')
    const members = gym.collection('members')

    if (req.method === 'GET') {
      const [planSnap, membershipSnap, memberSnap] = await Promise.all([
        plans.orderBy('createdAt', 'desc').get(), memberships.orderBy('createdAt', 'desc').limit(500).get(), members.get()
      ])
      const memberMap = new Map(memberSnap.docs.map(d => [d.id, d.data()]))
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
      const rows = membershipSnap.docs.map(d => {
        const x = d.data()
        const status = x.status === 'Cancelled' ? 'Cancelled' : (x.expiryDate < today ? 'Expired' : 'Active')
        return { id: d.id, ...x, status, memberName: memberMap.get(x.memberId)?.name || 'Deleted member', memberPhone: memberMap.get(x.memberId)?.phone || '' }
      })
      return res.status(200).json({ plans: planSnap.docs.map(d => ({ id: d.id, ...d.data() })), memberships: rows, members: memberSnap.docs.map(d => ({ id: d.id, ...d.data() })) })
    }

    if (req.method === 'POST') {
      const { action } = req.body || {}
      if (action === 'createPlan') {
        const { name, durationMonths, price } = req.body || {}
        const months = Number(durationMonths), amount = Number(price)
        if (!name?.trim() || !Number.isInteger(months) || months < 1 || months > 36 || !Number.isFinite(amount) || amount < 0) return res.status(400).json({ error: 'Enter a plan name, duration (1–36 months), and valid price.' })
        const ref = await plans.add({ name: name.trim().slice(0, 80), durationMonths: months, price: amount, active: true, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: decoded.uid })
        const saved = await ref.get()
        return res.status(201).json({ plan: { id: ref.id, ...saved.data() } })
      }
      if (action === 'assignMembership') {
        const { memberId, planId, startDate, amountPaid, paymentMethod, paymentNote } = req.body || {}
        if (!memberId || !planId || !dateOnly(startDate)) return res.status(400).json({ error: 'Select a member, plan and valid start date.' })
        const [memberSnap, planSnap] = await Promise.all([members.doc(String(memberId)).get(), plans.doc(String(planId)).get()])
        if (!memberSnap.exists || !planSnap.exists || planSnap.data()?.active !== true) return res.status(400).json({ error: 'The selected member or active plan could not be found.' })
        const plan = planSnap.data(), paid = Number(amountPaid ?? 0)
        if (!Number.isFinite(paid) || paid < 0 || paid > Number(plan.price)) return res.status(400).json({ error: 'Amount paid must be between zero and the plan price.' })
        const expiryDate = addMonths(startDate, Number(plan.durationMonths))
        const ref = await memberships.add({ memberId: String(memberId), planId: String(planId), planName: plan.name, durationMonths: plan.durationMonths, price: plan.price, startDate, expiryDate, amountPaid: paid, balance: Math.max(0, Number(plan.price) - paid), paymentStatus: paid >= Number(plan.price) ? 'Paid' : paid > 0 ? 'Partially paid' : 'Unpaid', paymentMethod: String(paymentMethod || '').slice(0, 40), paymentNote: String(paymentNote || '').slice(0, 200), status: 'Active', gymId: profile.gymId, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), createdBy: decoded.uid })
        const saved = await ref.get()
        return res.status(201).json({ membership: { id: ref.id, ...saved.data() } })
      }
      return res.status(400).json({ error: 'Unknown membership action.' })
    }
    if (req.method === 'PATCH') {
      const { id, status } = req.body || {}
      if (!id || !['Active', 'Cancelled'].includes(status)) return res.status(400).json({ error: 'A valid membership and status are required.' })
      const ref = memberships.doc(String(id)), snap = await ref.get()
      if (!snap.exists) return res.status(404).json({ error: 'Membership not found.' })
      await ref.update({ status, updatedAt: FieldValue.serverTimestamp() })
      return res.status(200).json({ success: true })
    }
    res.setHeader('Allow', 'GET, POST, PATCH')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    console.error('Owner memberships API error:', error)
    return res.status(500).json({ error: 'Unable to process membership request.' })
  }
}
