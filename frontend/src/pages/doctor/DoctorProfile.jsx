import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorProfile, updateDoctorProfile } from '../../api/doctors';
import { updateProfile } from '../../api/auth';
import axiosInstance from '../../api/axiosInstance';
import {
  User,
  Stethoscope,
  Clock,
  ShieldCheck,
  Save,
  DollarSign,
  Phone,
  MapPin,
  BadgeCheck,
  CalendarDays,
  UserRound,
  UserPlus,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SPECIALIZATIONS = [
  { value: 'general', label: 'General Physician' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'gynecology', label: 'Gynecology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'ent', label: 'ENT' },
  { value: 'dentistry', label: 'Dentistry' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const C = {
  paper: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  soft: '#F5F8FA',
  blueSoft: '#EEF5FD',
  green: '#16805D',
  greenSoft: '#EAF6F0',
  amber: '#9A6200',
  amberSoft: '#FFF5E5',
  red: '#B83B36',
  redSoft: '#FFF0EF',
};

const mono = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";
const ui = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  background: C.paper,
  color: C.ink,
  fontFamily: ui,
  fontSize: 13,
  outlineColor: C.blue,
};

const labelStyle = {
  display: 'block',
  marginBottom: 7,
  fontFamily: mono,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: C.muted,
};

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 40,
  padding: '10px 14px',
  borderRadius: 5,
  fontFamily: mono,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.025em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

export default function DoctorProfile() {
  const { user, profile, reloadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [permissionBusy, setPermissionBusy] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [specialization, setSpecialization] = useState('general');
  const [experienceYears, setExperienceYears] = useState(0);
  const [consultationFee, setConsultationFee] = useState(0);
  const [bio, setBio] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isAccepting, setIsAccepting] = useState(true);
  const [availableDays, setAvailableDays] = useState([]);

  const [assistant, setAssistant] = useState(null);
  const [assistantCanApprove, setAssistantCanApprove] = useState(true);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState('');

  useEffect(() => {
    fetchProfileData();
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const res = await axiosInstance.get('/assistants/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      setAvailableAssistants(list);
      if (list.length > 0) {
        setSelectedAssistantId(String(list[0].id || list[0].user_id || ''));
      }
    } catch {
      // Keep the profile usable if assistant discovery fails.
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getDoctorProfile();
      const doc = res.data;
      setSpecialization(doc.specialization || 'general');
      setExperienceYears(doc.experience_years ?? 0);
      setConsultationFee(doc.consultation_fee ?? 0);
      setBio(doc.bio || '');
      setLicenseNumber(doc.license_number || '');
      setIsAccepting(doc.is_accepting_patients ?? true);
      setAvailableDays(doc.available_days || []);
      setAssistant(doc.assistant || null);
      setAssistantCanApprove(doc.assistant_can_approve ?? true);

      if (profile) {
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
      }
    } catch (err) {
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setAvailableDays((current) => (
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    ));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
      });

      await updateDoctorProfile({
        specialization,
        experience_years: Number(experienceYears),
        consultation_fee: Number(consultationFee),
        bio,
        license_number: licenseNumber,
        is_accepting_patients: isAccepting,
        available_days: availableDays,
        assistant_can_approve: assistantCanApprove,
      });

      toast.success('Profile updated successfully!');
      if (reloadUser) reloadUser();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignAssistant = async (e) => {
    e.preventDefault();
    if (!selectedAssistantId) {
      toast.error('Please select an assistant from the list');
      return;
    }
    setAssistantBusy(true);
    try {
      const res = await axiosInstance.post('/assistant/assign-doctor/', {
        assistant_user_id: selectedAssistantId,
      });
      toast.success(res.data.message || 'Assistant appointed successfully!');
      await fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to appoint assistant');
    } finally {
      setAssistantBusy(false);
    }
  };

  const handleRemoveAssistant = async () => {
    if (!window.confirm('Are you sure you want to remove your appointed assistant? Consultation requests will be handled directly by you.')) return;
    setAssistantBusy(true);
    try {
      await axiosInstance.post('/assistant/assign-doctor/', { action: 'remove' });
      toast.success('Assistant removed. You now handle consultation requests directly.');
      await fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove assistant');
    } finally {
      setAssistantBusy(false);
    }
  };

  const handleTogglePermission = async () => {
    if (permissionBusy) return;
    const nextState = !assistantCanApprove;
    setPermissionBusy(true);
    try {
      await axiosInstance.post('/access/grant-assistant-permission/', { grant: nextState });
      setAssistantCanApprove(nextState);
      toast.success(`Assistant permission to approve patients ${nextState ? 'GRANTED' : 'REVOKED'}`);
    } catch (err) {
      toast.error('Failed to update assistant permission');
    } finally {
      setPermissionBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '70px 20px', textAlign: 'center', color: C.muted, fontFamily: mono, fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
        Loading doctor profile…
      </div>
    );
  }

  const sectionTitle = (number, title, subtitle) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <span style={{ fontFamily: mono, color: C.orange, fontSize: 11, fontWeight: 700, paddingTop: 3 }}>{number}</span>
      <div>
        <h2 style={{ margin: 0, fontSize: 16, lineHeight: 1.4, fontWeight: 750, color: C.ink }}>{title}</h2>
        {subtitle && <p style={{ margin: '5px 0 0', fontSize: 12, lineHeight: 1.5, color: C.muted }}>{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '8px 0 36px', color: C.ink, fontFamily: ui }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        .dprof-field:focus-visible, .dprof-action:focus-visible { outline: 2px solid ${C.blue}; outline-offset: 2px; }
        .dprof-action:disabled { opacity: .55; cursor: not-allowed !important; }
        .dprof-card { border: 1px solid ${C.border}; background: ${C.paper}; }
        .dprof-section { padding: 24px; }
        .dprof-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .dprof-day { transition: background 120ms ease, border-color 120ms ease; }
        @media (max-width: 760px) {
          .dprof-grid2 { grid-template-columns: 1fr; }
          .dprof-section { padding: 18px !important; }
          .dprof-assistant-head { align-items: flex-start !important; flex-direction: column !important; }
          .dprof-assistant-actions { width: 100%; }
          .dprof-assistant-actions button { flex: 1; }
        }
      `}</style>

      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
          <span style={{ height: 3, width: 22, background: C.orange }} />
          <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '.13em', color: C.muted, textTransform: 'uppercase' }}>Doctor workspace / account configuration</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(26px, 3vw, 34px)', lineHeight: 1.2, letterSpacing: '-.045em', fontWeight: 800 }}>
          Practice settings<span style={{ color: C.orange }}>.</span>
        </h1>
        <p style={{ color: C.muted, margin: '9px 0 0', maxWidth: 660, fontSize: 14, lineHeight: 1.6 }}>
          Manage your professional details, consultation availability, and delegated patient access.
        </p>
      </header>

      <section className="dprof-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '17px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: C.blueSoft, color: C.blue }}><ShieldCheck size={18} /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 750 }}>Assistant appointment & delegation</h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>Manage your assigned clinical assistant and approval authority.</p>
            </div>
          </div>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, padding: '6px 8px', border: `1px solid ${C.border}`, background: C.soft }}>MAX. 1 ASSISTANT / DOCTOR</span>
        </div>

        <div style={{ padding: 22 }}>
          {assistant ? (
            <div style={{ border: `1px solid ${assistantCanApprove ? '#C9E9DA' : '#F0DFBD'}`, background: assistantCanApprove ? C.greenSoft : C.amberSoft, padding: 18 }}>
              <div className="dprof-assistant-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
                <div style={{ display: 'flex', gap: 13, minWidth: 0 }}>
                  <div style={{ width: 46, height: 46, flex: '0 0 auto', display: 'grid', placeItems: 'center', background: C.paper, border: `1px solid ${C.border}`, color: C.blue }}><UserRound size={21} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 750, color: C.ink }}>{assistant.name || assistant.username}</div>
                    <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 4 }}>@{assistant.username}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 7, overflowWrap: 'anywhere' }}>
                      {assistant.email || 'No email provided'} <span style={{ color: C.border }}>·</span> {assistant.phone || 'No phone provided'}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '5px 8px', border: `1px solid ${assistantCanApprove ? '#B6DECB' : '#E9D4A9'}`, background: C.paper, color: assistantCanApprove ? C.green : C.amber, fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                      {assistantCanApprove ? <Check size={12} /> : <AlertCircle size={12} />}
                      {assistantCanApprove ? 'Approval permission granted' : 'Approval permission revoked'}
                    </span>
                  </div>
                </div>
                <div className="dprof-assistant-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="dprof-action" type="button" disabled={permissionBusy || assistantBusy} onClick={handleTogglePermission} style={{ ...buttonStyle, background: assistantCanApprove ? C.paper : C.blue, color: assistantCanApprove ? C.red : '#FFFFFF', border: `1px solid ${assistantCanApprove ? '#E6C7C4' : C.blue}` }}>
                    {permissionBusy ? 'Updating…' : assistantCanApprove ? 'Revoke approval' : 'Grant approval'}
                  </button>
                  <button className="dprof-action" type="button" disabled={assistantBusy || permissionBusy} onClick={handleRemoveAssistant} style={{ ...buttonStyle, background: C.paper, color: C.red, border: '1px solid #E6C7C4' }}>
                    <Trash2 size={13} /> {assistantBusy ? 'Updating…' : 'Remove assistant'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 11, padding: 14, marginBottom: 17, background: C.amberSoft, border: '1px solid #F0DFBD' }}>
                <AlertCircle size={17} color={C.amber} style={{ flex: '0 0 auto', marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 750, color: C.ink }}>No assistant currently appointed</div>
                  <p style={{ margin: '5px 0 0', fontSize: 12, lineHeight: 1.6, color: C.muted }}>You will handle consultation requests directly. Select a registered clinical assistant to delegate patient intake and scheduling.</p>
                </div>
              </div>
              <form onSubmit={handleAssignAssistant} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <select className="dprof-field" value={selectedAssistantId} onChange={(e) => setSelectedAssistantId(e.target.value)} style={{ ...fieldStyle, flex: '1 1 300px', minWidth: 0 }} disabled={availableAssistants.length === 0}>
                  {availableAssistants.length === 0 ? <option value="">No registered assistants found</option> : availableAssistants.map((ast) => <option key={ast.id} value={ast.user_id || ast.id}>{ast.name} (@{ast.username}) - {ast.email}</option>)}
                </select>
                <button className="dprof-action" type="submit" disabled={availableAssistants.length === 0 || assistantBusy} style={{ ...buttonStyle, background: C.blue, color: '#FFFFFF', border: `1px solid ${C.blue}` }}>
                  <UserPlus size={15} /> {assistantBusy ? 'Appointing…' : 'Appoint assistant'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <form onSubmit={handleSave} className="dprof-card">
        <div style={{ padding: '17px 22px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 750 }}>Doctor profile</h2>
          <p style={{ margin: '5px 0 0', color: C.muted, fontSize: 12 }}>Keep your contact details and clinical credentials current.</p>
        </div>

        <section className="dprof-section">
          {sectionTitle('01', 'Personal & contact details', 'Your name and the best way for patients to reach your practice.')}
          <div className="dprof-grid2">
            <div><label style={labelStyle}>First name</label><input className="dprof-field" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Last name</label><input className="dprof-field" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}><Phone size={11} style={{ display: 'inline', marginRight: 5 }} />Contact phone</label><input className="dprof-field" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}><MapPin size={11} style={{ display: 'inline', marginRight: 5 }} />Clinic / chamber address</label><input className="dprof-field" type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={fieldStyle} /></div>
          </div>
        </section>

        <div style={{ height: 1, background: C.border }} />

        <section className="dprof-section">
          {sectionTitle('02', 'Professional information', 'Credentials and details about your medical practice.')}
          <div className="dprof-grid2" style={{ marginBottom: 16 }}>
            <div><label style={labelStyle}><Stethoscope size={11} style={{ display: 'inline', marginRight: 5 }} />Medical specialization</label><select className="dprof-field" value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={fieldStyle}>{SPECIALIZATIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div><label style={labelStyle}><BadgeCheck size={11} style={{ display: 'inline', marginRight: 5 }} />Medical license / registration no.</label><input className="dprof-field" type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}><Clock size={11} style={{ display: 'inline', marginRight: 5 }} />Years of clinical experience</label><input className="dprof-field" type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}><DollarSign size={11} style={{ display: 'inline', marginRight: 5 }} />Consultation fee ($ / ₹)</label><input className="dprof-field" type="number" min="0" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} style={fieldStyle} /></div>
          </div>
          <div><label style={labelStyle}>Professional bio</label><textarea className="dprof-field" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Describe your clinical experience, areas of focus, and approach to patient care." /></div>
        </section>

        <div style={{ height: 1, background: C.border }} />

        <section className="dprof-section">
          {sectionTitle('03', 'Consultation availability', 'Choose the days you are available and whether you are accepting new requests.')}
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...labelStyle, marginBottom: 11 }}><CalendarDays size={11} style={{ display: 'inline', marginRight: 5 }} />Available consultation days</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DAYS.map((day) => {
                const active = availableDays.includes(day);
                return (
                  <button className="dprof-day dprof-action" type="button" key={day} aria-pressed={active} onClick={() => handleDayToggle(day)} style={{ ...buttonStyle, minHeight: 36, padding: '8px 11px', background: active ? C.blueSoft : C.paper, color: active ? C.blue : C.muted, border: `1px solid ${active ? '#B9D1F0' : C.border}` }}>
                    {active && <Check size={12} />} {day}
                  </button>
                );
              })}
            </div>
          </div>

          <label htmlFor="dprof-accepting" style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: 14, border: `1px solid ${isAccepting ? '#C9E9DA' : C.border}`, background: isAccepting ? C.greenSoft : C.soft, cursor: 'pointer' }}>
            <input id="dprof-accepting" type="checkbox" checked={isAccepting} onChange={(e) => setIsAccepting(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: C.blue }} />
            <span>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 750, color: C.ink }}>Accepting new patient consultations</span>
              <span style={{ display: 'block', marginTop: 4, fontSize: 12, lineHeight: 1.5, color: C.muted }}>Turn this off when you are not accepting new consultation requests.</span>
            </span>
          </label>
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '17px 22px', borderTop: `1px solid ${C.border}`, background: C.soft }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.muted, fontSize: 11 }}><ShieldCheck size={14} color={C.blue} /> Your profile details are saved to your DocConnect account.</span>
          <button className="dprof-action" type="submit" disabled={saving} style={{ ...buttonStyle, minHeight: 43, padding: '12px 18px', background: C.blue, color: '#FFFFFF', border: `1px solid ${C.blue}` }}>
            <Save size={15} /> {saving ? 'Saving changes…' : 'Save profile changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
