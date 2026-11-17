import { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { Activity, ArrowRight, Bell, Check, ChevronRight, Dumbbell, ShieldCheck, Users, Zap, Menu, X, LogOut, LayoutDashboard, UserRound, CalendarDays, Settings, Search, CircleHelp } from 'lucide-react'

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

function Dashboard({type}) {
  const config = type==='superadmin' ? {role:'superAdmin',title:'Platform overview',desc:'Manage the GymFlow platform and registered gyms.',label:'SUPER ADMIN'} : type==='owner' ? {role:'gymOwner',title:'Your gym overview',desc:'Your membership operations, all in one place.',label:'GYM OWNER'} : {role:'member',title:'Your membership',desc:'Your gym membership information at a glance.',label:'MEMBER'}
  return <Protected expectedRole={config.role}>{({user,profile})=><div className="dashboard-page"><header className="dash-top"><Brand/><div className="dash-user"><span>{profile.name || user.email}</span><button onClick={()=>signOut(auth)} title="Sign out"><LogOut size={17}/></button></div></header><div className="dash-layout"><aside className="dash-sidebar"><div className="dash-label">{config.label}</div><div className="dash-nav-active"><LayoutDashboard size={17}/> Overview</div><div className="dash-nav-muted"><Users size={17}/> {type==='member'?'My details':'Members'}</div><div className="dash-nav-muted"><CalendarDays size={17}/> Memberships</div><div className="dash-nav-muted"><Bell size={17}/> Notifications</div><div className="dash-nav-muted"><CircleHelp size={17}/> Help & support</div></aside><main className="dash-content"><div className="dash-welcome"><div><div className="section-kicker">{config.label} WORKSPACE</div><h1>{config.title}</h1><p>{config.desc}</p></div><div className="dash-date">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div><div className="setup-notice"><ShieldCheck size={20}/><div><b>Your account is connected</b><p>This is the secure dashboard shell. We'll connect live gym and membership data in the next build step.</p></div></div><div className="dash-placeholder-grid"><div className="dash-placeholder"><span>ACCOUNT</span><b>{profile.name || 'Account holder'}</b><small>{user.email}</small></div><div className="dash-placeholder"><span>ACCESS ROLE</span><b>{config.label}</b><small>Verified account permission</small></div><div className="dash-placeholder"><span>WORKSPACE</span><b>{profile.gymName || (type==='superadmin'?'All gyms':'Not assigned')}</b><small>{profile.gymId || 'Workspace connection pending'}</small></div></div></main></div></div>}</Protected>
}

export default function App() {
  return <Routes><Route path="/" element={<Landing/>}/><Route path="/login/owner" element={<Login role="owner"/>}/><Route path="/login/member" element={<Login role="member"/>}/><Route path="/login/superadmin" element={<Login role="superadmin"/>}/><Route path="/dashboard/owner" element={<Dashboard type="owner"/>}/><Route path="/dashboard/member" element={<Dashboard type="member"/>}/><Route path="/dashboard/superadmin" element={<Dashboard type="superadmin"/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
