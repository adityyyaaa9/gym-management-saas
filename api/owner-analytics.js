import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function services() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!raw) throw new Error('Server is missing FIREBASE_SERVICE_ACCOUNT_KEY.')
    initializeApp({ credential: cert(JSON.parse(raw)) })
  }
  return { auth: getAuth(), db: getFirestore() }
}

function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }
  try {
    const { auth, db } = services()
    const match = (req.headers.authorization || '').match(/^Bearer (.+)$/)
    if (!match) return res.status(401).json({ error: 'Please sign in again.' })
    const decoded = await auth.verifyIdToken(match[1])
    const profileSnap = await db.collection('users').doc(decoded.uid).get()
    const profile = profileSnap.data()
    if (!profileSnap.exists || profile?.role !== 'gymOwner' || !profile?.gymId) return res.status(403).json({ error: 'Gym owner access is required.' })

    const gym = db.collection('gyms').doc(profile.gymId)
    const [membersSnap, membershipsSnap, plansSnap] = await Promise.all([
      gym.collection('members').get(),
      gym.collection('memberships').orderBy('createdAt', 'desc').limit(500).get(),
      gym.collection('membershipPlans').get()
    ])
    const today = indiaToday()
    const memberships = membershipsSnap.docs.map(doc => doc.data())
    const activeMemberships = memberships.filter(x => x.status !== 'Cancelled' && String(x.expiryDate || '') >= today).length
    const expiredMemberships = memberships.filter(x => x.status !== 'Cancelled' && String(x.expiryDate || '') < today).length
    const cancelledMemberships = memberships.filter(x => x.status === 'Cancelled').length
    const totalCollected = memberships.reduce((sum, x) => sum + Math.max(0, Number(x.amountPaid) || 0), 0)
    const totalOutstanding = memberships.reduce((sum, x) => sum + Math.max(0, Number(x.balance) || 0), 0)
    const totalPlanValue = memberships.reduce((sum, x) => sum + Math.max(0, Number(x.price) || 0), 0)

    return res.status(200).json({
      date: today,
      totalMembers: membersSnap.size,
      totalPlans: plansSnap.size,
      totalMemberships: memberships.length,
      recordsIncluded: memberships.length,
      activeMemberships,
      expiredMemberships,
      cancelledMemberships,
      totalCollected,
      totalOutstanding,
      totalPlanValue
    })
  } catch (error) {
    console.error('Owner analytics API error:', error)
    return res.status(500).json({ error: 'Unable to load gym analytics.' })
  }
}
