import { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { Activity, ArrowRight, Bell, Check, ChevronRight, Dumbbell, ShieldCheck, Users, Zap, Menu, X, LogOut, LayoutDashboard, UserRound, CalendarDays, Settings, Search, CircleHelp, Plus, Building2, RefreshCw, Wallet, BadgeCheck, Clock3, IndianRupee } from 'lucide-react'

const portals = {
  owner: { label: 'Gym owner', role: 'gymOwner', title: 'Welcome back', subtitle: 'Sign in to manage your gym and members.', icon: Dumbbell },
  member: { label: 'Member', role: 'member', title: 'Your fitness, in focus', subtitle: 'Sign in to view your membership details.', icon: UserRound },
  superadmin: { label: 'Super admin', role: 'superAdmin', title: 'Platform control', subtitle: 'Authorized administrators only.', icon: ShieldCheck },
}

function Brand({ light = false }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-mark"><Activity size={19}/></span><span>gym<span className="brand-accent">flow</span></span></Link>
}

function Landing() {
  const [menu, setMenu] = useState(false)
  return <div className="site-shell">
    <header className="topbar"><div className="container nav-wrap"><Brand/><nav className={menu ? 'nav-links open' : 'nav-links'}><a href="#features" onClick={()=>setMenu(false)}>Features</a><a href="#how" onClick={()=>setMenu(false)}>How it works</a><a href="#why" onClick={()=>setMenu(false)}>Why GymFlow</a></nav><div className="nav-actions"><Link className="nav-login" to="/login/owner">Log in</Link><Link className="btn btn-small" to="/login/owner">Get started <ArrowRight size={15}/></Link></div><button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button></div></header>
    <main>
      <section className="hero"><div className="hero-glow"></div><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="pulse"></span> THE SMARTER WAY TO RUN YOUR GYM</div><h1>Less admin.<br/><span>More progress.</span></h1><p className="hero-text">The all-in-one workspace for independent gyms. Keep memberships organized, stay ahead of renewals, and spend more time building a stronger community.</p><div className="hero-buttons"><Link className="btn" to="/login/owner">Explore your dashboard <ArrowRight size={17}/></Link><a className="btn btn-ghost" href="#how">See how it works <ChevronRight size={16}/></a></div><div className="hero-proof"><div className="avatar-stack"><i>G</i><i>F</i><i>+</i></div><span>Built for gym owners and their communities</span></div></div>
      <div className="dashboard-preview"><div className="preview-top"><div className="window-dots"><i></i><i></i><i></i></div><span>GYMFLOW / OVERVIEW</span><span className="preview-live">LIVE PREVIEW</span></div><div className="preview-body"><aside className="preview-side"><div className="preview-logo"><Activity size={17}/></div><div className="side-active"><LayoutDashboard size={16}/></div><Users/><CalendarDays/><Bell/><Settings/></aside><div className="preview-main"><div className="preview-heading"><div><small>MONDAY, NOVEMBER 17</small><h3>Good morning, Alex</h3></div><div className="preview-avatar">A</div></div><div className="stat-grid"><div className="stat-card"><span>Total members</span><strong>248</strong><small className="positive">↑ 12 this month</small></div><div className="stat-card"><span>Active memberships</span><strong>216</strong><small>87% of members</small></div></div><div className="renewal-card"><div className="renewal-title"><b>Memberships expiring soon</b><span>Next 7 days</span></div>{[['RS','Rahul Sharma','Expires in 2 days'],['PK','Priya Kapoor','Expires in 4 days'],['AM','Arjun Mehta','Expires in 6 days']].map(x=><div className="renewal-row" key={x[1]}><div className="member-avatar">{x[0]}</div><div className="member-info"><b>{x[1]}</b><small>{x[2]}</small></div><span className="status-dot"></span></div>)}</div></div></div></div></div></section>
      <section className="trust-strip"><div className="container trust-inner"><span>ONE SIMPLE PLACE TO MANAGE</span><b><Users size={17}/> MEMBERS</b><b><CalendarDays size={17}/> MEMBERSHIPS</b><b><Bell size={17}/> RENEWAL ALERTS</b><b><Activity size={17}/> GYM OPERATIONS</b></div></section>
      <section className="section" id="features"><div className="container"><div className="section-kicker">EVERYTHING IN SYNC</div><div className="section-heading"><h2>Run your gym.<br/><span>Not your spreadsheets.</span></h2><p>All the essentials to keep your members, memberships and daily operations moving in the right direction.</p></div><div className="feature-grid"><Feature icon={Users} number="01" title="Member management" text="Keep member profiles and contact details organized in one searchable place."/><Feature icon={CalendarDays} number="02" title="Membership tracking" text="See active, expiring and expired memberships without digging through records."/><Feature icon={Bell} number="03" title="Renewal reminders" text="Get ahead of membership expirations with timely alerts for your team."/><Feature icon={ShieldCheck} number="04" title="Separate gym workspaces" text="Each gym gets its own secure workspace and member records."/><Feature icon={Zap} number="05" title="A clearer overview" text="Understand your gym at a glance with useful operational summaries."/><Feature icon={Activity} number="06" title="Made to grow with you" text="A focused foundation that can expand as your gym and team grow." /></div></div></section>
      <section className="how-section" id="how"><div className="container how-grid"><div><div className="section-kicker">SIMPLE BY DESIGN</div><h2>From sign-in to<br/><span>sorted.</span></h2><p>GymFlow gives every person the right place to do their part — from the platform team to the gym floor.</p><Link className="text-link" to="/login/owner">Go to owner login <ArrowRight size={16}/></Link></div><div className="steps"><div className="step"><span>01</span><div><b>Set up your gym</b><p>Your gym owner account gives you a dedicated workspace.</p></div></div><div className="step"><span>02</span><div><b>Add your members</b><p>Keep member information and membership dates together.</p></div></div><div className="step"><span>03</span><div><b>Stay ahead of renewals</b><p>Spot upcoming expirations and follow up at the right time.</p></div></div></div></div></section>
      <section className="cta-section" id="why"><div className="container cta-box"><div><div className="section-kicker">A BETTER WAY TO KEEP TRACK</div><h2>Your gym deserves<br/>a smoother day.</h2><p>Bring your membership operations into one clear, simple workspace.</p></div><Link className="btn" to="/login/owner">Access GymFlow <ArrowRight size={17}/></Link></div></section>
    </main><footer className="footer"><div className="container footer-inner"><Brand light/><span>© {new Date().getFullYear()} GymFlow. Built for stronger communities.</span><div><Link to="/login/superadmin">Platform admin</Link><Link to="/login/member">Member access</Link></div></div></footer>
  </div>
}
function Feature({icon:Icon,number,title,text}) { return <article className="feature-card"><div className="feature-top"><span className="feature-icon"><Icon size={20}/></span><span>{number}</span></div><h3>{title}</h3><p>{text}</p></article> }

function Login({ role }) {
  const portal = portals[role]
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const navigate = useNavigate()
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      const credential = await signInWithEmailAndPassword(auth,email.trim(),password)
      const snap = await getDoc(doc(db,'users',credential.user.uid))
      if (!snap.exists()) { await signOut(auth); throw new Error('Your account profile is not configured. Contact the platform administrator.') }
      const data = snap.data()
      if (data.role !== portal.role) { await signOut(auth); throw new Error(`This account does not have ${portal.label} access.`) }
      navigate(role === 'superadmin' ? '/dashboard/superadmin' : role === 'owner' ? '/dashboard/owner' : '/dashboard/member')
    } catch(err) { setError(err.code === 'auth/invalid-credential' ? 'Incorrect email or password.' : err.message || 'Unable to sign in. Please try again.') }
    finally { setBusy(false) }
  }
  const Icon = portal.icon
  return <div className="auth-page"><div className="auth-left"><Brand light/><div className="auth-promo"><div className="section-kicker">GYMFLOW WORKSPACE</div><h1>Make room for<br/><span>what matters.</span></h1><p>Less time managing the details. More time helping people get stronger.</p><div className="auth-points"><span><Check size={16}/> Clear membership overview</span><span><Check size={16}/> One secure workspace</span><span><Check size={16}/> Renewal visibility</span></div></div><div className="auth-left-foot">A smarter rhythm for your gym.</div></div><div className="auth-right"><div className="auth-mobile-brand"><Brand/></div><div className="auth-card"><Link to="/" className="back-link">← Back to home</Link><div className="auth-icon"><Icon size={23}/></div><div className="section-kicker">{portal.label.toUpperCase()} PORTAL</div><h2>{portal.title}</h2><p>{portal.subtitle}</p><form onSubmit={submit}><label>Email address</label><input type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/><div className="password-label"><label>Password</label><span>Secure sign-in</span></div><input type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="6"/>{error && <div className="form-error">{error}</div>}<button className="btn auth-submit" disabled={busy}>{busy?'Signing in…':'Sign in'} <ArrowRight size={17}/></button></form><div className="auth-divider"><span>OR ACCESS ANOTHER PORTAL</span></div><div className="portal-switch">{Object.keys(portals).filter(k=>k!==role).map(k=><Link key={k} to={`/login/${k}`}>{portals[k].label}<ChevronRight size={14}/></Link>)}</div><div className="auth-security"><ShieldCheck size={15}/> Your account is protected by Firebase Authentication.</div></div><div className="auth-copyright">© {new Date().getFullYear()} GymFlow</div></div></div>
}

function Protected({ expectedRole, children }) {
  const [state,setState] = useState({loading:true,user:null,profile:null})
  useEffect(()=>onAuthStateChanged(auth,async user=>{
    if(!user){setState({loading:false,user:null,profile:null});return}
    try { const s=await getDoc(doc(db,'users',user.uid)); setState({loading:false,user,profile:s.exists()?s.data():null}) }
    catch { setState({loading:false,user,profile:null}) }
  }),[])
  if(state.loading) return <div className="loading-screen">Loading your workspace…</div>
  if(!state.user) return <Navigate to={`/login/${expectedRole==='superAdmin'?'superadmin':expectedRole==='gymOwner'?'owner':'member'}`} replace/>
  if(!state.profile || state.profile.role!==expectedRole) return <div className="loading-screen"><p>This account is not authorized for this workspace.</p><button className="btn" onClick={()=>signOut(auth)}>Sign out</button></div>
  return children(state)
}


function SuperAdminWorkspace({user,profile}) {
  const [gyms,setGyms] = useState([])
  const [loading,setLoading] = useState(true)
  const [showForm,setShowForm] = useState(false)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  const [form,setForm] = useState({gymName:'',ownerName:'',ownerEmail:'',ownerPassword:'',ownerWhatsapp:'',address:''})

  async function api(path, options={}) {
    const token = await user.getIdToken()
    const response = await fetch(path,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...options.headers}})
    const data = await response.json().catch(()=>({}))
    if(!response.ok) throw new Error(data.error || 'Request failed')
    return data
  }
  async function loadGyms() {
    setLoading(true); setError('')
    try { const data=await api('/api/admin/gyms'); setGyms(data.gyms || []) }
    catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(()=>{loadGyms()},[])
  function update(field,value){setForm(old=>({...old,[field]:value}))}
  async function createGym(e) {
    e.preventDefault(); setBusy(true); setError(''); setSuccess('')
    try {
      const result=await api('/api/admin/gyms',{method:'POST',body:JSON.stringify(form)})
      setSuccess(`Gym created successfully. Gym ID: ${result.gymId}`)
      setForm({gymName:'',ownerName:'',ownerEmail:'',ownerPassword:'',ownerWhatsapp:'',address:''})
      setShowForm(false)
      await loadGyms()
    } catch(e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <div className="dashboard-page"><header className="dash-top"><Brand/><div className="dash-user"><span>{profile.name || user.email}</span><button onClick={()=>signOut(auth)} title="Sign out"><LogOut size={17}/></button></div></header>
    <div className="dash-layout"><aside className="dash-sidebar"><div className="dash-label">SUPER ADMIN</div><div className="dash-nav-active"><LayoutDashboard size={17}/> Overview</div><div className="dash-nav-muted"><Building2 size={17}/> Gyms</div><div className="dash-nav-muted"><Users size={17}/> Members</div><div className="dash-nav-muted"><CalendarDays size={17}/> Memberships</div><div className="dash-nav-muted"><Bell size={17}/> Notifications</div><div className="dash-nav-muted"><CircleHelp size={17}/> Help & support</div></aside>
    <main className="dash-content"><div className="dash-welcome"><div><div className="section-kicker">SUPER ADMIN WORKSPACE</div><h1>Platform overview</h1><p>Manage the GymFlow platform and registered gyms.</p></div><div className="dash-date">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div>
      <div className="admin-toolbar"><div><h2>Registered gyms</h2><p>{gyms.length} gym{gyms.length===1?'':'s'} on GymFlow</p></div><div className="admin-actions"><button className="admin-secondary" onClick={loadGyms} disabled={loading}><RefreshCw size={15}/> Refresh</button><button className="btn" onClick={()=>{setShowForm(!showForm);setError('');setSuccess('')}}><Plus size={16}/> Add Gym</button></div></div>
      {error && <div className="admin-alert error">{error}</div>}{success && <div className="admin-alert success">{success}</div>}
      {showForm && <form className="gym-form" onSubmit={createGym}><div className="gym-form-heading"><div><h3>Register a new gym</h3><p>Create the gym workspace and its owner's login.</p></div><button type="button" className="form-close" onClick={()=>setShowForm(false)}>×</button></div>
        <div className="gym-form-grid">
          <label>Gym name<input required value={form.gymName} onChange={e=>update('gymName',e.target.value)} placeholder="e.g. Iron Fitness"/></label>
          <label>Owner full name<input required value={form.ownerName} onChange={e=>update('ownerName',e.target.value)} placeholder="Owner's name"/></label>
          <label>Owner email<input type="email" required value={form.ownerEmail} onChange={e=>update('ownerEmail',e.target.value)} placeholder="owner@example.com"/></label>
          <label>Temporary password<input type="password" required minLength="6" value={form.ownerPassword} onChange={e=>update('ownerPassword',e.target.value)} placeholder="At least 6 characters"/></label>
          <label>Owner WhatsApp number<input required type="tel" value={form.ownerWhatsapp} onChange={e=>update('ownerWhatsapp',e.target.value)} placeholder="Country code + number"/></label>
          <label>Gym address<input value={form.address} onChange={e=>update('address',e.target.value)} placeholder="Area, city, state"/></label>
        </div><div className="gym-form-footer"><span>Owner can sign in using the email and temporary password.</span><button className="btn" disabled={busy}>{busy?'Creating gym…':'Create gym'} <ArrowRight size={15}/></button></div>
      </form>}
      <div className="gym-table-wrap"><table className="gym-table"><thead><tr><th>GYM</th><th>OWNER EMAIL</th><th>WHATSAPP</th><th>STATUS</th><th>GYM ID</th></tr></thead><tbody>
        {loading?<tr><td colSpan="5" className="empty-state">Loading gyms…</td></tr>:gyms.length===0?<tr><td colSpan="5" className="empty-state">No gyms registered yet. Select “Add Gym” to create the first one.</td></tr>:gyms.map(g=><tr key={g.id}><td><b>{g.name}</b><small>{g.address || 'Address not provided'}</small></td><td>{g.ownerEmail || '—'}</td><td>{g.ownerWhatsapp || '—'}</td><td><span className={g.active?'status-pill active':'status-pill'}>{g.active?'Active':'Inactive'}</span></td><td className="gym-id">{g.id}</td></tr>)}
      </tbody></table></div>
    </main></div></div>
}

function TelegramConnection({ user, profile }) {
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const connected = Boolean(profile.telegramChatId)

  async function createLink() {
    setBusy(true); setError(''); setUrl(''); setCopied(false)
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/telegram-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not create Telegram link.')
      setUrl(data.url)
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(url); setCopied(true) }
    catch { setError('Copy failed. Open the Telegram link using the button instead.') }
  }

  return <section className="telegram-card">
    <div className="telegram-card-icon"><Bell size={21}/></div>
    <div className="telegram-card-body">
      <div className="telegram-card-heading"><div><h2>Telegram notifications</h2><p>Connect your Telegram chat to receive alerts for your gym only.</p></div><span className={connected ? 'telegram-state connected' : 'telegram-state'}>{connected ? 'Connected' : 'Not connected'}</span></div>
      {connected ? <p className="telegram-connected-copy">Your gym is linked to Telegram{profile.telegramUsername ? ` (@${profile.telegramUsername})` : ''}. Expiry alerts will be sent to this chat.</p> : <p className="telegram-connected-copy">Generate a secure, single-use connection link. Open it in Telegram and press Start. The link expires after 10 minutes.</p>}
      {error && <div className="admin-alert error">{error}</div>}
      {url && <div className="telegram-link-box"><a href={url} target="_blank" rel="noreferrer">Open Telegram to connect <ArrowRight size={14}/></a><button type="button" className="admin-secondary" onClick={copyLink}>{copied ? 'Copied' : 'Copy link'}</button></div>}
      <div className="telegram-actions"><button type="button" className="btn" onClick={createLink} disabled={busy}>{busy ? 'Generating link…' : connected ? 'Reconnect Telegram' : 'Connect Telegram'}</button></div>
      <small className="telegram-note">Membership expiry alerts are sent automatically at 9:00 AM India time on the expiry date.</small>
    </div>
  </section>
}

function DashboardAnalytics({ user }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/owner-analytics', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not load dashboard analytics.')
      setSummary(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  const cards = summary ? [
    { label: 'TOTAL MEMBERS', value: summary.totalMembers, note: 'Registered in this gym', icon: Users },
    { label: 'ACTIVE MEMBERSHIPS', value: summary.activeMemberships, note: 'Currently active', icon: BadgeCheck },
    { label: 'EXPIRED MEMBERSHIPS', value: summary.expiredMemberships, note: 'Require renewal', icon: Clock3 },
    { label: 'PLANS AVAILABLE', value: summary.totalPlans, note: 'Gym membership plans', icon: CalendarDays },
    { label: 'COLLECTED', value: money(summary.totalCollected), note: 'Recorded against memberships', icon: Wallet },
    { label: 'OUTSTANDING', value: money(summary.totalOutstanding), note: 'Unpaid membership balance', icon: IndianRupee }
  ] : []
  const maxStatus = summary ? Math.max(summary.activeMemberships, summary.expiredMemberships, summary.cancelledMemberships, 1) : 1

  return <section className="analytics-section">
    <div className="analytics-heading"><div><h2>Business overview</h2><p>Live summary of your members, memberships and recorded payments.</p></div><button className="admin-secondary" onClick={load} disabled={loading}><RefreshCw size={14}/> Refresh</button></div>
    {error && <div className="admin-alert error">{error}</div>}
    {loading && !summary ? <div className="analytics-loading">Loading your gym performance…</div> : summary && <>
      <div className="analytics-grid">{cards.map(card => { const Icon = card.icon; return <article className="analytics-card" key={card.label}><div className="analytics-card-top"><span>{card.label}</span><Icon size={17}/></div><strong>{card.value}</strong><small>{card.note}</small></article> })}</div>
      <div className="analytics-detail-grid">
        <section className="analytics-panel"><div className="analytics-panel-title"><div><h3>Membership status</h3><p>Current breakdown across recorded memberships</p></div><span>{summary.totalMemberships} total</span></div>
          {[['Active', summary.activeMemberships, 'active'], ['Expired', summary.expiredMemberships, 'expired'], ['Cancelled', summary.cancelledMemberships, 'cancelled']].map(([label, value, cls]) => <div className="analytics-bar-row" key={label}><div><span>{label}</span><b>{value}</b></div><div className="analytics-bar-track"><i className={cls} style={{ width: `${Math.round((value / maxStatus) * 100)}%` }}/></div></div>)}
        </section>
        <section className="analytics-panel"><div className="analytics-panel-title"><div><h3>Payment snapshot</h3><p>Amounts saved on membership records</p></div><Wallet size={17}/></div><div className="analytics-money-row"><span>Total plan value</span><b>{money(summary.totalPlanValue)}</b></div><div className="analytics-money-row"><span>Amount collected</span><b>{money(summary.totalCollected)}</b></div><div className="analytics-money-row"><span>Balance outstanding</span><b>{money(summary.totalOutstanding)}</b></div><p className="analytics-footnote">This is a membership-record summary, not a dated cash ledger. Payment history can be added as a separate module.</p></section>
      </div>
      <p className="analytics-source-note">Updated just now · Based on up to {summary.recordsIncluded} latest membership records.</p>
    </>}
  </section>
}

function MembersWorkspace({ user }) {
  const empty = { name: '', phone: '', age: '', gender: '' }
  const [members, setMembers] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function request(method, body, id) {
    const token = await user.getIdToken()
    const response = await fetch(`/api/owner-members${id ? `?id=${encodeURIComponent(id)}` : ''}`, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      ...(body ? { body: JSON.stringify(body) } : {})
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Member request failed.')
    return data
  }
  async function load() {
    setLoading(true); setError('')
    try { const data = await request('GET'); setMembers(data.members || []) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  function startAdd() { setEditing(''); setForm(empty); setError(''); setSuccess(''); setShowForm(true) }
  function startEdit(member) { setEditing(member.id); setForm({ name: member.name || '', phone: member.phone || '', age: member.age ?? '', gender: member.gender || '' }); setError(''); setSuccess(''); setShowForm(true) }
  async function save(e) {
    e.preventDefault(); setBusy(true); setError(''); setSuccess('')
    try {
      const payload = { ...form, age: form.age === '' ? null : Number(form.age) }
      await request(editing ? 'PATCH' : 'POST', editing ? { ...payload, id: editing } : payload, editing || undefined)
      setSuccess(editing ? 'Member updated.' : 'Member added successfully.')
      setShowForm(false); setForm(empty); setEditing(''); await load()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  async function remove(member) {
    if (!window.confirm(`Delete ${member.name}'s member record? This cannot be undone.`)) return
    setError(''); setSuccess('')
    try { await request('DELETE', { id: member.id }, member.id); setMembers(list => list.filter(x => x.id !== member.id)); setSuccess('Member deleted.') }
    catch (e) { setError(e.message) }
  }
  const visible = members.filter(m => `${m.name} ${m.phone}`.toLowerCase().includes(search.toLowerCase()))
  return <section className="members-workspace">
    <div className="admin-toolbar"><div><h2>Members</h2><p>Add and manage the people who belong to your gym.</p></div><div className="admin-actions"><button className="admin-secondary" onClick={load} disabled={loading}><RefreshCw size={14}/> Refresh</button><button className="btn" onClick={startAdd}><Plus size={15}/> Add member</button></div></div>
    {error && <div className="admin-alert error">{error}</div>}{success && <div className="admin-alert success">{success}</div>}
    {showForm && <form className="gym-form" onSubmit={save}><div className="gym-form-heading"><div><h3>{editing ? 'Edit member' : 'Add a member'}</h3><p>Name and phone number are required.</p></div><button type="button" className="form-close" onClick={()=>setShowForm(false)}>×</button></div>
      <div className="gym-form-grid">
        <label>Full name<input required maxLength="100" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Member's full name"/></label>
        <label>Phone number<input required type="tel" maxLength="30" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="e.g. +91 98765 43210"/></label>
        <label>Age (optional)<input type="number" min="1" max="120" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="Age"/></label>
        <label>Gender (optional)<select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></label>
      </div><div className="gym-form-footer"><span>Member records are stored inside your gym's workspace.</span><button className="btn" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add member'} <ArrowRight size={15}/></button></div>
    </form>}
    <div className="members-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by member name or phone"/></div>
    <div className="gym-table-wrap"><table className="gym-table members-table"><thead><tr><th>MEMBER</th><th>PHONE</th><th>AGE</th><th>GENDER</th><th>ACTIONS</th></tr></thead><tbody>
      {loading ? <tr><td colSpan="5" className="empty-state">Loading members…</td></tr> : visible.length === 0 ? <tr><td colSpan="5" className="empty-state">{search ? 'No matching members.' : 'No members added yet. Select “Add member” to get started.'}</td></tr> : visible.map(m=><tr key={m.id}><td><b>{m.name}</b><small>Added to your gym</small></td><td>{m.phone}</td><td>{m.age || '—'}</td><td>{m.gender || '—'}</td><td><div className="member-row-actions"><button className="admin-secondary" onClick={()=>startEdit(m)}>Edit</button><button className="admin-secondary danger-action" onClick={()=>remove(m)}>Delete</button></div></td></tr>)}
    </tbody></table></div>
    <p className="telegram-note">Membership plans, payment records and expiry alerts will be added in the next module.</p>
  </section>
}


function MembershipWorkspace({ user }) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const [data, setData] = useState({ plans: [], memberships: [], members: [] })
  const [showPlan, setShowPlan] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [planForm, setPlanForm] = useState({ name: '', durationMonths: '1', price: '' })
  const [assignForm, setAssignForm] = useState({ memberId: '', planId: '', startDate: today, amountPaid: '', paymentMethod: '', paymentNote: '' })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')

  async function request(method, body) {
    const token = await user.getIdToken()
    const response = await fetch('/api/owner-memberships', { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, ...(body ? { body: JSON.stringify(body) } : {}) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || 'Membership request failed.')
    return result
  }
  async function load() {
    setLoading(true); setError('')
    try { setData(await request('GET')) } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  async function savePlan(e) {
    e.preventDefault(); setBusy(true); setError(''); setSuccess('')
    try { await request('POST', { action: 'createPlan', ...planForm, durationMonths: Number(planForm.durationMonths), price: Number(planForm.price) }); setPlanForm({ name: '', durationMonths: '1', price: '' }); setShowPlan(false); setSuccess('Membership plan created.'); await load() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function assign(e) {
    e.preventDefault(); setBusy(true); setError(''); setSuccess('')
    try { await request('POST', { action: 'assignMembership', ...assignForm, amountPaid: assignForm.amountPaid === '' ? 0 : Number(assignForm.amountPaid) }); setShowAssign(false); setAssignForm({ memberId: '', planId: '', startDate: today, amountPaid: '', paymentMethod: '', paymentNote: '' }); setSuccess('Membership assigned successfully.'); await load() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function cancel(row) {
    if (!window.confirm(`Cancel ${row.memberName}'s membership?`)) return
    try { await request('PATCH', { id: row.id, status: 'Cancelled' }); setSuccess('Membership cancelled.'); await load() } catch (e) { setError(e.message) }
  }
  const plan = data.plans.find(x => x.id === assignForm.planId)
  const rows = data.memberships.filter(x => `${x.memberName} ${x.planName} ${x.memberPhone}`.toLowerCase().includes(search.toLowerCase()))
  return <section className="members-workspace membership-workspace">
    <div className="admin-toolbar"><div><h2>Memberships & plans</h2><p>Create gym-specific plans, assign memberships and record payments.</p></div><div className="admin-actions"><button className="admin-secondary" onClick={load} disabled={loading}><RefreshCw size={14}/> Refresh</button><button className="admin-secondary" onClick={()=>{setShowPlan(!showPlan);setShowAssign(false)}}><Plus size={14}/> Create plan</button><button className="btn" onClick={()=>{setShowAssign(!showAssign);setShowPlan(false)}}><Plus size={14}/> Assign membership</button></div></div>
    {error && <div className="admin-alert error">{error}</div>}{success && <div className="admin-alert success">{success}</div>}
    {showPlan && <form className="gym-form" onSubmit={savePlan}><div className="gym-form-heading"><div><h3>Create membership plan</h3><p>Set the duration and price used by your gym.</p></div><button type="button" className="form-close" onClick={()=>setShowPlan(false)}>×</button></div><div className="gym-form-grid"><label>Plan name<input required maxLength="80" value={planForm.name} onChange={e=>setPlanForm({...planForm,name:e.target.value})} placeholder="e.g. Monthly"/></label><label>Duration (months)<input required type="number" min="1" max="36" value={planForm.durationMonths} onChange={e=>setPlanForm({...planForm,durationMonths:e.target.value})}/></label><label>Price (₹)<input required type="number" min="0" step="0.01" value={planForm.price} onChange={e=>setPlanForm({...planForm,price:e.target.value})} placeholder="1000"/></label></div><div className="gym-form-footer"><span>Plans are private to this gym.</span><button className="btn" disabled={busy}>{busy?'Saving…':'Save plan'} <ArrowRight size={15}/></button></div></form>}
    {showAssign && <form className="gym-form" onSubmit={assign}><div className="gym-form-heading"><div><h3>Assign membership</h3><p>Choose a member, plan and payment received.</p></div><button type="button" className="form-close" onClick={()=>setShowAssign(false)}>×</button></div><div className="gym-form-grid"><label>Member<select required value={assignForm.memberId} onChange={e=>setAssignForm({...assignForm,memberId:e.target.value})}><option value="">Select member</option>{data.members.map(m=><option key={m.id} value={m.id}>{m.name} · {m.phone}</option>)}</select></label><label>Membership plan<select required value={assignForm.planId} onChange={e=>setAssignForm({...assignForm,planId:e.target.value})}><option value="">Select plan</option>{data.plans.map(p=><option key={p.id} value={p.id}>{p.name} · ₹{Number(p.price).toLocaleString('en-IN')} / {p.durationMonths} mo</option>)}</select></label><label>Start date<input required type="date" value={assignForm.startDate} onChange={e=>setAssignForm({...assignForm,startDate:e.target.value})}/></label><label>Amount received (₹)<input type="number" min="0" step="0.01" max={plan?.price ?? undefined} value={assignForm.amountPaid} onChange={e=>setAssignForm({...assignForm,amountPaid:e.target.value})} placeholder={plan ? `Plan price ₹${plan.price}` : '0'}/></label><label>Payment method (optional)<select value={assignForm.paymentMethod} onChange={e=>setAssignForm({...assignForm,paymentMethod:e.target.value})}><option value="">Select method</option><option>Cash</option><option>UPI</option><option>Card</option><option>Bank transfer</option><option>Other</option></select></label><label>Payment note (optional)<input maxLength="200" value={assignForm.paymentNote} onChange={e=>setAssignForm({...assignForm,paymentNote:e.target.value})} placeholder="Reference or note"/></label></div>{plan && <p className="membership-calculation">Plan price: ₹{Number(plan.price).toLocaleString('en-IN')} · Duration: {plan.durationMonths} month(s) · Expiry date is calculated automatically.</p>}<div className="gym-form-footer"><span>Partial and unpaid memberships are supported.</span><button className="btn" disabled={busy || !data.members.length || !data.plans.length}>{busy?'Saving…':'Assign membership'} <ArrowRight size={15}/></button></div></form>}
    <div className="membership-plan-grid">{data.plans.map(p=><div className="membership-plan-card" key={p.id}><span>{p.durationMonths} MONTH{p.durationMonths===1?'':'S'}</span><b>{p.name}</b><strong>₹{Number(p.price).toLocaleString('en-IN')}</strong></div>)}{!loading && !data.plans.length && <div className="membership-empty">No plans yet. Create your first membership plan.</div>}</div>
    <div className="members-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by member, plan or phone"/></div>
    <div className="gym-table-wrap"><table className="gym-table membership-table"><thead><tr><th>MEMBER</th><th>PLAN</th><th>START</th><th>EXPIRY</th><th>STATUS</th><th>PAYMENT</th><th>ACTIONS</th></tr></thead><tbody>{loading?<tr><td colSpan="7" className="empty-state">Loading memberships…</td></tr>:rows.length===0?<tr><td colSpan="7" className="empty-state">{search?'No matching memberships.':'No memberships assigned yet.'}</td></tr>:rows.map(r=><tr key={r.id}><td><b>{r.memberName}</b><small>{r.memberPhone}</small></td><td>{r.planName}</td><td>{r.startDate}</td><td>{r.expiryDate}</td><td><span className={`status-pill ${r.status==='Active'?'active':''}`}>{r.status}</span></td><td><b>₹{Number(r.amountPaid||0).toLocaleString('en-IN')} / ₹{Number(r.price||0).toLocaleString('en-IN')}</b><small>{r.paymentStatus}{r.balance>0?` · Due ₹${Number(r.balance).toLocaleString('en-IN')}`:''}</small></td><td>{r.status==='Active'?<button className="admin-secondary danger-action" onClick={()=>cancel(r)}>Cancel</button>:'—'}</td></tr>)}</tbody></table></div>
    <p className="telegram-note">Membership expiry is processed daily at 9:00 AM India time. Connected gym owners receive one Telegram alert per expired membership.</p>
  </section>
}

function Dashboard({type}) {
  const config = type==='superadmin' ? {role:'superAdmin',title:'Platform overview',desc:'Manage the GymFlow platform and registered gyms.',label:'SUPER ADMIN'} : type==='owner' ? {role:'gymOwner',title:'Your gym overview',desc:'Your membership operations, all in one place.',label:'GYM OWNER'} : {role:'member',title:'Your membership',desc:'Your gym membership information at a glance.',label:'MEMBER'}
  return <Protected expectedRole={config.role}>{({user,profile})=>type==='superadmin' ? <SuperAdminWorkspace user={user} profile={profile}/> : type==='owner' ? <div className="dashboard-page"><header className="dash-top"><Brand/><div className="dash-user"><span>{profile.name || user.email}</span><button onClick={()=>signOut(auth)} title="Sign out"><LogOut size={17}/></button></div></header><div className="dash-layout"><aside className="dash-sidebar"><div className="dash-label">GYM OWNER</div><div className="dash-nav-active"><LayoutDashboard size={17}/> Overview</div><div className="dash-nav-muted"><Users size={17}/> Members</div><div className="dash-nav-muted"><CalendarDays size={17}/> Memberships</div><div className="dash-nav-muted"><Bell size={17}/> Notifications</div><div className="dash-nav-muted"><CircleHelp size={17}/> Help & support</div></aside><main className="dash-content"><div className="dash-welcome"><div><div className="section-kicker">GYM OWNER WORKSPACE</div><h1>Your gym overview</h1><p>Manage your gym and notification preferences.</p></div><div className="dash-date">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div><div className="setup-notice"><ShieldCheck size={20}/><div><b>Your account is connected</b><p>{profile.gymName || 'Your gym'} · {profile.gymId || 'Gym workspace'}</p></div></div><DashboardAnalytics user={user}/><TelegramConnection user={user} profile={profile}/><MembersWorkspace user={user}/><MembershipWorkspace user={user}/><div className="dash-placeholder-grid"><div className="dash-placeholder"><span>ACCOUNT</span><b>{profile.name || 'Account holder'}</b><small>{user.email}</small></div><div className="dash-placeholder"><span>GYM</span><b>{profile.gymName || 'Your gym'}</b><small>{profile.gymId || 'Gym workspace'}</small></div><div className="dash-placeholder"><span>TELEGRAM</span><b>{profile.telegramChatId ? 'Connected' : 'Not connected'}</b><small>Membership alerts setup</small></div></div></main></div></div> : <div className="dashboard-page"><header className="dash-top"><Brand/><div className="dash-user"><span>{profile.name || user.email}</span><button onClick={()=>signOut(auth)} title="Sign out"><LogOut size={17}/></button></div></header><div className="dash-layout"><aside className="dash-sidebar"><div className="dash-label">{config.label}</div><div className="dash-nav-active"><LayoutDashboard size={17}/> Overview</div><div className="dash-nav-muted"><Users size={17}/>{type==='member'?'My details':'Members'}</div><div className="dash-nav-muted"><CalendarDays size={17}/> Memberships</div><div className="dash-nav-muted"><Bell size={17}/> Notifications</div><div className="dash-nav-muted"><CircleHelp size={17}/> Help & support</div></aside><main className="dash-content"><div className="dash-welcome"><div><div className="section-kicker">{config.label} WORKSPACE</div><h1>{config.title}</h1><p>{config.desc}</p></div><div className="dash-date">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div><div className="setup-notice"><ShieldCheck size={20}/><div><b>Your account is connected</b><p>This workspace will be connected to live gym and membership data in the next build step.</p></div></div><div className="dash-placeholder-grid"><div className="dash-placeholder"><span>ACCOUNT</span><b>{profile.name || 'Account holder'}</b><small>{user.email}</small></div><div className="dash-placeholder"><span>ACCESS ROLE</span><b>{config.label}</b><small>Verified account permission</small></div><div className="dash-placeholder"><span>WORKSPACE</span><b>{profile.gymName || 'Not assigned'}</b><small>{profile.gymId || 'Workspace connection pending'}</small></div></div></main></div></div>}</Protected>
}

export default function App() {
  return <Routes><Route path="/" element={<Landing/>}/><Route path="/login/owner" element={<Login role="owner"/>}/><Route path="/login/member" element={<Login role="member"/>}/><Route path="/login/superadmin" element={<Login role="superadmin"/>}/><Route path="/dashboard/owner" element={<Dashboard type="owner"/>}/><Route path="/dashboard/member" element={<Dashboard type="member"/>}/><Route path="/dashboard/superadmin" element={<Dashboard type="superadmin"/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
