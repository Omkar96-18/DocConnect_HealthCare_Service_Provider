import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Save, User, ShieldCheck } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

.dc-profile, .dc-profile * {
  box-sizing: border-box;
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
}
.dc-profile {
  --dc-blue: #1769D2;
  --dc-orange: #F07838;
  --dc-ink: #101820;
  --dc-muted: #6E7882;
  --dc-line: #DCE2E7;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: var(--dc-ink);
  background: #fff;
  min-height: 100vh;
  padding: 0 5.2vw 34px;
}
.dc-profile:before {
  content: "";
  position: absolute;
  inset: 76px 0 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(16,24,32,.028) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(16,24,32,.028) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, #000, transparent 82%);
}
.dc-profile-topbar {
  height: 76px;
  border-bottom: 1px solid var(--dc-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.dc-profile-wordmark {
  color: var(--dc-ink);
  text-decoration: none;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -1.2px;
}
.dc-profile-wordmark span { color: var(--dc-orange); }
.dc-profile-top-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--dc-muted);
  font-size: 9px;
  letter-spacing: .07em;
}
.dc-profile-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dc-blue);
  display: inline-block;
}
.dc-profile-meta-divider { color: var(--dc-orange); }
.dc-profile-main {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: 42px 0 30px;
}
.dc-profile-footer {
  position: relative;
  z-index: 1;
  min-height: 54px;
  border-top: 1px solid var(--dc-line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--dc-muted);
  font-size: 8px;
  letter-spacing: .07em;
}
.dc-profile-footer strong { color: var(--dc-ink); font-weight: 600; }
.dc-profile-footer em { color: var(--dc-orange); font-style: normal; }
.dc-profile input, .dc-profile select, .dc-profile textarea {
  width: 100%;
  border: 1px solid #CFD7DE;
  border-radius: 0;
  padding: 12px 13px;
  color: var(--dc-ink);
  background: #fff;
  font-size: 11px;
  outline: none;
  transition: border-color .16s, box-shadow .16s;
}
.dc-profile input:focus, .dc-profile select:focus, .dc-profile textarea:focus {
  border-color: var(--dc-blue);
  box-shadow: 0 0 0 3px rgba(23,105,210,.08);
}
.dc-profile textarea { resize: vertical; min-height: 92px; line-height: 1.7; }
.dc-profile label {
  display: block;
  margin-bottom: 8px;
  color: #45515C;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
}
.dc-profile .dc-profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.dc-profile .dc-profile-field { min-width: 0; margin-bottom: 18px; }
.dc-profile .dc-profile-section {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 0 0 20px;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--dc-line);
}
.dc-profile .dc-profile-section-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: var(--dc-blue);
  border: 1px solid var(--dc-line);
  flex: 0 0 auto;
}
.dc-profile .dc-profile-section-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -.03em;
}
.dc-profile .dc-profile-section-caption {
  margin: 4px 0 0;
  color: var(--dc-muted);
  font-size: 9px;
}
.dc-profile .dc-profile-save {
  min-height: 43px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: var(--dc-ink);
  color: #fff;
  border: 1px solid var(--dc-ink);
  border-radius: 0;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .05em;
  transition: background .16s, border-color .16s;
}
.dc-profile .dc-profile-save:hover:not(:disabled) {
  background: var(--dc-blue);
  border-color: var(--dc-blue);
}
.dc-profile .dc-profile-save:disabled { opacity: .6; cursor: wait; }
.dc-profile .dc-profile-topline {
  color: var(--dc-muted);
  font-size: 9px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.dc-profile .dc-profile-title {
  margin: 10px 0 8px;
  font-size: clamp(25px, 3vw, 36px);
  line-height: 1.08;
  font-weight: 500;
  letter-spacing: -.075em;
}
.dc-profile .dc-profile-subtitle {
  margin: 0;
  max-width: 560px;
  color: var(--dc-muted);
  font-size: 11px;
  line-height: 1.8;
}
.dc-profile .dc-profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 270px);
  align-items: start;
  gap: 22px;
  margin-top: 28px;
}
.dc-profile .dc-profile-card {
  border: 1px solid var(--dc-line);
  background: rgba(255,255,255,.97);
  box-shadow: 10px 10px 0 rgba(23,105,210,.035);
  padding: clamp(18px, 2.5vw, 28px);
  min-width: 0;
  position: relative;
}
.dc-profile .dc-profile-card:before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  height: 3px;
  background: linear-gradient(90deg, var(--dc-blue) 0 68%, var(--dc-orange) 68% 100%);
}
.dc-profile .dc-profile-aside {
  border: 1px solid var(--dc-line);
  padding: 20px;
  background: #fff;
}
.dc-profile .dc-profile-aside h2 {
  margin: 12px 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -.04em;
}
.dc-profile .dc-profile-aside p {
  margin: 0;
  color: var(--dc-muted);
  font-size: 10px;
  line-height: 1.8;
}
.dc-profile .dc-profile-aside-note {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--dc-line);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--dc-muted);
  font-size: 9px;
  line-height: 1.7;
}
@media (max-width: 850px) {
  .dc-profile .dc-profile-layout { grid-template-columns: 1fr; }
  .dc-profile .dc-profile-aside { order: -1; }
}
@media (max-width: 700px) {
  .dc-profile { padding: 0 18px 24px; }
  .dc-profile-topbar { height: 66px; }
  .dc-profile-top-meta { font-size: 7px; gap: 7px; }
  .dc-profile-meta-divider, .dc-profile-top-meta span:last-child { display: none; }
  .dc-profile:before { inset: 66px 0 0; background-size: 42px 42px; }
  .dc-profile-main { padding-top: 32px; }
  .dc-profile-footer { font-size: 7px; }
  .dc-profile-footer span:nth-child(2) { display: none; }
}
@media (max-width: 560px) {
  .dc-profile .dc-profile-grid { grid-template-columns: 1fr; gap: 0; }
  .dc-profile { padding: 0 14px 20px; }
  .dc-profile-top-meta { max-width: 130px; }
}
`;

export default function PatientProfile() {
  const { user, profile, reloadUser } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    blood_group: '',
    allergies: '',
    medical_history: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          date_of_birth: data.patient_profile?.date_of_birth ?? '',
          blood_group: data.patient_profile?.blood_group ?? '',
          allergies: data.patient_profile?.allergies ?? '',
          medical_history: data.patient_profile?.medical_history ?? '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.date_of_birth) payload.date_of_birth = null;
      await updateProfile(payload);
      toast.success('Medical profile updated successfully!');
      if (reloadUser) reloadUser();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  const fullName = [form.first_name, form.last_name].filter(Boolean).join(' ') || user?.username || 'Patient';

  return (
    <>
      <style>{css}</style>
      <main className="dc-profile">
        <nav className="dc-profile-topbar" aria-label="Profile header">
          <Link className="dc-profile-wordmark" to="/patient/dashboard">DocConnect<span>.</span></Link>
          <div className="dc-profile-top-meta">
            <span className="dc-profile-status-dot" />
            SECURE HEALTHCARE PORTAL
            <span className="dc-profile-meta-divider">/</span>
            <span>PATIENT 01</span>
          </div>
        </nav>

        <div className="dc-profile-main">
          <header>
            <div className="dc-profile-topline"><span style={{ color: '#F07838' }}>01</span> / PATIENT PORTAL — MEDICAL PROFILE</div>
            <h1 className="dc-profile-title">Your profile<span style={{ color: '#F07838' }}>.</span></h1>
            <p className="dc-profile-subtitle">
              Keep your contact details and medical information up to date.
            </p>
          </header>

        <div className="dc-profile-layout">
          <section className="dc-profile-card">
            <form onSubmit={handleSubmit}>
              <div className="dc-profile-section">
                <span className="dc-profile-section-icon"><User size={17} /></span>
                <div>
                  <h2 className="dc-profile-section-title">Personal information</h2>
                  <p className="dc-profile-section-caption">Your identity and contact details</p>
                </div>
              </div>

              <div className="dc-profile-grid">
                <div className="dc-profile-field">
                  <label htmlFor="first_name">First name</label>
                  <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} autoComplete="given-name" />
                </div>
                <div className="dc-profile-field">
                  <label htmlFor="last_name">Last name</label>
                  <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} autoComplete="family-name" />
                </div>
                <div className="dc-profile-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
                </div>
                <div className="dc-profile-field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
                </div>
              </div>

              <div className="dc-profile-field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" value={form.address} onChange={handleChange} autoComplete="street-address" />
              </div>

              <div className="dc-profile-section" style={{ marginTop: 28 }}>
                <span className="dc-profile-section-icon"><ShieldCheck size={17} /></span>
                <div>
                  <h2 className="dc-profile-section-title">Medical information</h2>
                  <p className="dc-profile-section-caption">Details that help your care team support you</p>
                </div>
              </div>

              <div className="dc-profile-grid">
                <div className="dc-profile-field">
                  <label htmlFor="date_of_birth">Date of birth</label>
                  <input id="date_of_birth" type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} autoComplete="bday" />
                </div>
                <div className="dc-profile-field">
                  <label htmlFor="blood_group">Blood group</label>
                  <select id="blood_group" name="blood_group" value={form.blood_group} onChange={handleChange}>
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div className="dc-profile-field">
                <label htmlFor="allergies">Known allergies</label>
                <textarea id="allergies" name="allergies" placeholder="List any known allergies…" value={form.allergies} onChange={handleChange} />
              </div>

              <div className="dc-profile-field" style={{ marginBottom: 22 }}>
                <label htmlFor="medical_history">Medical history</label>
                <textarea id="medical_history" name="medical_history" placeholder="Previous conditions, surgeries, medications…" value={form.medical_history} onChange={handleChange} style={{ minHeight: 120 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', paddingTop: 18, borderTop: '1px solid #DCE2E7' }}>
                <span style={{ color: '#6E7882', fontSize: 9 }}>Changes apply to your patient record.</span>
                <button className="dc-profile-save" type="submit" disabled={saving}>
                  <Save size={15} />
                  {saving ? 'SAVING…' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </section>

          <aside className="dc-profile-aside">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', background: '#EEF5FF', color: '#1769D2', border: '1px solid #DCE2E7' }}>
                <User size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#6E7882', fontSize: 8, letterSpacing: '.1em' }}>PATIENT RECORD</div>
                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, overflowWrap: 'anywhere' }}>{fullName}</div>
              </div>
            </div>
            <h2>Keep it current.</h2>
            <p>Accurate contact and medical details help your care team coordinate consultations and review relevant information.</p>
            <div className="dc-profile-aside-note">
              <ShieldCheck size={15} color="#1769D2" style={{ flexShrink: 0 }} />
              <span>Only share medical information you are comfortable storing in your patient record.</span>
            </div>
          </aside>
        </div>
        </div>

        <footer className="dc-profile-footer">
          <span><strong>DocConnect<em>.</em></strong> <span style={{ color: '#9AA3AB' }}>CARE, IN CONTEXT.</span></span>
          <span>PRIVACY FIRST <em>•</em> BUILT FOR BETTER COORDINATION</span>
          <span>© 2026 / DC-01</span>
        </footer>
      </main>
    </>
  );
}
