const admin = require('firebase-admin');

function getAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error('Server is missing FIREBASE_SERVICE_ACCOUNT_KEY.')
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  return admin;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const fb = getAdmin();
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: 'Please sign in again.' });

    const decoded = await fb.auth().verifyIdToken(match[1]);
    const adminProfile = await fb.firestore().collection('users').doc(decoded.uid).get();
    if (!adminProfile.exists || adminProfile.data().role !== 'superAdmin') {
      return res.status(403).json({ error: 'Super Admin access is required.' });
    }

    const db = fb.firestore();
    if (req.method === 'GET') {
      const snapshot = await db.collection('gyms').orderBy('createdAt', 'desc').get().catch(async () => db.collection('gyms').get());
      const gyms = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || '',
          ownerEmail: d.ownerEmail || '',
          ownerWhatsapp: d.ownerWhatsapp || '',
          address: d.address || '',
          active: d.active !== false
        };
      });
      return res.status(200).json({ gyms });
    }

    const { gymName, ownerName, ownerEmail, ownerPassword, ownerWhatsapp, address = '' } = req.body || {};
    if (![gymName, ownerName, ownerEmail, ownerPassword, ownerWhatsapp].every(v => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'Complete all required fields.' });
    }
    if (ownerPassword.length < 6) return res.status(400).json({ error: 'Temporary password must be at least 6 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) return res.status(400).json({ error: 'Enter a valid owner email.' });

    let owner;
    try {
      owner = await fb.auth().createUser({
        email: ownerEmail.trim().toLowerCase(),
        password: ownerPassword,
        displayName: ownerName.trim()
      });
      const gymRef = db.collection('gyms').doc();
      const batch = db.batch();
      batch.set(gymRef, {
        name: gymName.trim(),
        ownerUid: owner.uid,
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerWhatsapp: ownerWhatsapp.trim().replace(/[^\d+]/g, ''),
        address: address.trim(),
        active: true,
        createdAt: fb.firestore.FieldValue.serverTimestamp()
      });
      batch.set(db.collection('users').doc(owner.uid), {
        name: ownerName.trim(),
        email: ownerEmail.trim().toLowerCase(),
        role: 'gymOwner',
        gymId: gymRef.id,
        gymName: gymName.trim(),
        createdAt: fb.firestore.FieldValue.serverTimestamp()
      });
      await batch.commit();
      return res.status(201).json({ ok: true, gymId: gymRef.id, ownerUid: owner.uid });
    } catch (error) {
      if (owner) await fb.auth().deleteUser(owner.uid).catch(() => {});
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Admin gyms API error:', error);
    return res.status(500).json({ error: error.message || 'Server error while processing the request.' });
  }
};
