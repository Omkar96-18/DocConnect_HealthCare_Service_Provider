import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerApi } from '../api/auth';
import {
  Stethoscope, User, ShieldCheck, Eye, EyeOff, ArrowRight,
  Lock, Mail, Phone, MapPin, CheckCircle2,
} from 'lucide-react';

const ROLES = [
  { value: 'patient', title: 'Patient', subtitle: 'Consult doctors, book visits & view verified prescriptions', icon: User },
  { value: 'doctor', title: 'Doctor', subtitle: 'Manage consultations & generate secure prescriptions', icon: Stethoscope },
  { value: 'assistant', title: 'Medical Assistant', subtitle: 'Coordinate access requests & validate prescriptions', icon: ShieldCheck },
];

const signupCss = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
.dc-signup, .dc-signup * { box-sizing: border-box; }
.dc-signup {
  --dc-ink:#101820; --dc-blue:#1769D2; --dc-orange:#F07838;
  --dc-muted:#6E7882; --dc-line:#DCE2E7; --dc-paper:#FFFFFF;
  min-height:100vh; background:#fff; color:var(--dc-ink);
  font-family:'IBM Plex Mono','SFMono-Regular',Consolas,monospace;
  position:relative; isolation:isolate; padding:0 24px 28px;
}
.dc-signup:before {
  content:""; position:fixed; inset:0; z-index:-1; pointer-events:none;
  background-image:linear-gradient(to right,rgba(16,24,32,.035) 1px,transparent 1px),linear-gradient(to bottom,rgba(16,24,32,.035) 1px,transparent 1px);
  background-size:64px 64px; mask-image:linear-gradient(to bottom,#000,transparent 82%);
}
.dc-signup input, .dc-signup button { font:inherit; }
.dc-signup input { width:100%; border:1px solid var(--dc-line); border-radius:3px; padding:12px 12px 12px 38px; color:var(--dc-ink); background:#fff; font-size:12px; outline:none; transition:border-color .15s,box-shadow .15s; }
.dc-signup input:focus { border-color:var(--dc-blue); box-shadow:0 0 0 3px rgba(23,105,210,.1); }
.dc-signup input::placeholder { color:#9AA3AB; }
.dc-signup label { display:block; margin-bottom:7px; color:var(--dc-ink); font-size:10px; font-weight:600; letter-spacing:.045em; }
.dc-signup .dc-role { display:flex; gap:10px; align-items:flex-start; text-align:left; width:100%; padding:14px 12px; background:#fff; border:1px solid var(--dc-line); border-radius:3px; color:var(--dc-ink); cursor:pointer; min-height:100px; }
.dc-signup .dc-role[aria-pressed="true"] { border-color:var(--dc-blue); box-shadow:inset 3px 0 0 var(--dc-blue); background:#F7FAFE; }
.dc-signup .dc-role:focus-visible, .dc-signup button:focus-visible, .dc-signup a:focus-visible { outline:2px solid var(--dc-blue); outline-offset:3px; }
.dc-signup .dc-primary { width:100%; min-height:46px; border:1px solid var(--dc-ink); border-radius:3px; background:var(--dc-ink); color:#fff; padding:12px 16px; display:flex; align-items:center; justify-content:center; gap:10px; font-size:11px; font-weight:600; cursor:pointer; transition:background .15s,border-color .15s; }
.dc-signup .dc-primary:hover:not(:disabled) { background:var(--dc-blue); border-color:var(--dc-blue); }
.dc-signup .dc-primary:disabled { opacity:.6; cursor:wait; }
.dc-signup .dc-topbar { height:76px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--dc-line); gap:14px; }
.dc-signup .dc-wordmark { color:var(--dc-ink); font-size:19px; font-weight:700; letter-spacing:-1.1px; text-decoration:none; white-space:nowrap; }
.dc-signup .dc-wordmark span { color:var(--dc-orange); }
.dc-signup .dc-meta { color:var(--dc-muted); font-size:9px; letter-spacing:.09em; text-transform:uppercase; }
.dc-signup .dc-panel { width:100%; max-width:760px; margin:32px auto 0; background:#fff; border:1px solid var(--dc-line); position:relative; }
.dc-signup .dc-panel:before { content:""; height:3px; position:absolute; top:-1px; left:-1px; right:-1px; background:linear-gradient(to right,var(--dc-blue) 0 72%,var(--dc-orange) 72% 100%); }
.dc-signup .dc-panel-inner { padding:clamp(22px,4vw,38px); }
.dc-signup .dc-field-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--dc-muted); display:flex; }
.dc-signup .dc-footer { max-width:760px; margin:18px auto 0; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; color:var(--dc-muted); font-size:9px; letter-spacing:.055em; }
@media(max-width:600px) {
 .dc-signup { padding:0 14px 22px; }
 .dc-signup .dc-topbar { height:64px; }
 .dc-signup .dc-meta { font-size:8px; text-align:right; }
 .dc-signup .dc-panel { margin-top:18px; }
 .dc-signup .dc-two-col { grid-template-columns:1fr !important; gap:13px !important; }
 .dc-signup .dc-role-grid { grid-template-columns:1fr !important; }
 .dc-signup .dc-footer { font-size:8px; }
}
`;

function SignupField({ label, name, type = 'text', placeholder, icon: Icon, required = false, value, onChange, extra }) {
  return (
    <div>
      <label htmlFor={`signup-${name}`}>{label}{required && <span style={{ color: '#F07838' }}> *</span>}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <span className="dc-field-icon"><Icon size={15} /></span>}
        <input id={`signup-${name}`} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} style={extra} />
      </div>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '',
    role: 'patient', phone: '', address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleRoleSelect = (roleValue) => setForm((f) => ({ ...f, role: roleValue }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.username.trim() || !form.email.trim() || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await registerApi({
        ...form,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
      });
      toast.success('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        const msg = Array.isArray(val) ? val[0] : typeof val === 'string' ? val : JSON.stringify(val);
        toast.error(`${firstKey}: ${msg}`);
      } else {
        toast.error('Registration failed. Please check the entered information.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dc-signup">
      <style>{signupCss}</style>
      <nav className="dc-topbar">
        <Link to="/login" className="dc-wordmark">DocConnect<span>.</span></Link>
        <span className="dc-meta">Secure healthcare portal / Auth 02</span>
      </nav>

      <section className="dc-panel">
        <div className="dc-panel-inner">
          <header style={{ marginBottom: 28 }}>
            <p className="dc-meta" style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, display: 'inline-block', background: '#F07838' }} />
              Account registration / 01
            </p>
            <h1 style={{ fontSize: 'clamp(25px,4vw,34px)', lineHeight: 1.15, letterSpacing: '-.07em', fontWeight: 500, margin: 0 }}>
              Create your account<span style={{ color: '#F07838' }}>.</span>
            </h1>
            <p style={{ color: '#6E7882', fontSize: 11, lineHeight: 1.8, margin: '10px 0 0', maxWidth: 560 }}>
              Join DocConnect to coordinate appointments, consultations, and verified prescriptions.
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 10 }}>
                <label style={{ margin: 0 }}>01 / Select account type<span style={{ color: '#F07838' }}> *</span></label>
                <span className="dc-meta">Choose one</span>
              </div>
              <div className="dc-role-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 9 }}>
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const selected = form.role === r.value;
                  return (
                    <button key={r.value} type="button" className="dc-role" aria-pressed={selected} onClick={() => handleRoleSelect(r.value)}>
                      <span style={{ display: 'grid', placeItems: 'center', flexShrink: 0, width: 30, height: 30, border: `1px solid ${selected ? '#1769D2' : '#DCE2E7'}`, color: selected ? '#1769D2' : '#6E7882', background: '#fff' }}>
                        <Icon size={16} />
                      </span>
                      <span style={{ display: 'block', minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
                          {r.title}
                          {selected && <CheckCircle2 size={13} color="#1769D2" />}
                        </span>
                        <span style={{ display: 'block', marginTop: 7, color: '#6E7882', fontSize: 9, lineHeight: 1.65 }}>{r.subtitle}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section style={{ borderTop: '1px solid #DCE2E7', paddingTop: 22 }}>
              <p className="dc-meta" style={{ margin: '0 0 16px' }}>02 / Personal information</p>
              <div className="dc-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 15 }}>
                <SignupField label="First name" name="first_name" placeholder="e.g. Alex" value={form.first_name} onChange={handleChange} required />
                <SignupField label="Last name" name="last_name" placeholder="e.g. Morgan" value={form.last_name} onChange={handleChange} required />
              </div>
              <div className="dc-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 15 }}>
                <SignupField label="Username" name="username" placeholder="alexmorgan" value={form.username} onChange={handleChange} required extra={{ paddingLeft: 30 }} />
                <SignupField label="Email address" name="email" type="email" placeholder="alex@example.com" icon={Mail} value={form.email} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label htmlFor="signup-password">Password<span style={{ color: '#F07838' }}> *</span> <span style={{ color: '#6E7882', fontWeight: 400 }}>/ min. 6 characters</span></label>
                <div style={{ position: 'relative' }}>
                  <span className="dc-field-icon"><Lock size={15} /></span>
                  <input id="signup-password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Choose a strong password" required style={{ paddingRight: 42 }} />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: '#6E7882', cursor: 'pointer', padding: 5, display: 'flex' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="dc-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <SignupField label="Phone number" name="phone" placeholder="+91 98765 43210" icon={Phone} value={form.phone} onChange={handleChange} />
                <SignupField label="Address / city" name="address" placeholder="City or locality" icon={MapPin} value={form.address} onChange={handleChange} />
              </div>
            </section>

            <button type="submit" className="dc-primary" disabled={loading}>
              {loading ? 'Creating account…' : <>Complete registration <ArrowRight size={15} /></>}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #DCE2E7', marginTop: 22, paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: '#6E7882', fontSize: 10 }}>Already registered?</span>
            <Link to="/login" style={{ color: '#1769D2', textDecoration: 'none', fontSize: 10, fontWeight: 600 }}>Sign in to DocConnect <ArrowRight size={12} style={{ verticalAlign: 'middle' }} /></Link>
          </div>
        </div>
      </section>

      <footer className="dc-footer">
        <span>DocConnect<span style={{ color: '#F07838' }}>.</span> / Care, in context.</span>
        <span>Privacy first • Built for better coordination</span>
        <span>© 2026 / DC-02</span>
      </footer>
    </main>
  );
}
