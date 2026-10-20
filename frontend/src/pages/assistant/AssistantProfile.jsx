import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import { User, Stethoscope, Building2, Save, MapPin, Phone, BadgeCheck, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const C = {
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  white: '#FFFFFF',
  soft: '#F5F8FA',
};

const inputStyle = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  padding: '12px 13px',
  color: C.ink,
  background: C.white,
  fontSize: 14,
  outline: 'none',
};

function ProfileField({ label, value, onChange, placeholder, icon: Icon, autoComplete }) {
  return (
    <label style={{ display: 'grid', gap: 7, minWidth: 0 }}>
      <span style={{ color: C.ink, fontSize: 11, fontWeight: 700, letterSpacing: '.07em', fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
      <span style={{ position: 'relative', display: 'block' }}>
        {Icon && <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ ...inputStyle, paddingLeft: Icon ? 38 : 13 }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = C.blue;
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(23,105,210,.10)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </span>
    </label>
  );
}

export default function AssistantProfile() {
  const { profile, reloadUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const assistantProfile = profile?.assistant_profile;
  const doctor = assistantProfile?.doctor;
  const medicalCenter = assistantProfile?.medical_center;

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

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
      toast.success('Assistant profile updated!');
      if (reloadUser) reloadUser();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'A';
  const doctorName = doctor
    ? `Dr. ${doctor.user?.first_name ? `${doctor.user.first_name} ${doctor.user.last_name || ''}`.trim() : doctor.user?.username || 'Assigned Doctor'}`
    : 'Not assigned yet';

  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '8px 0 36px', color: C.ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '.13em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
            <span style={{ width: 22, height: 2, background: C.orange, display: 'inline-block' }} />
            ACCOUNT / ASSISTANT
          </div>
          <h1 style={{ fontSize: 'clamp(27px, 4vw, 36px)', lineHeight: 1.12, letterSpacing: '-.045em', fontWeight: 750, margin: 0 }}>
            Assistant <span style={{ color: C.orange }}>Profile.</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: '10px 0 0', maxWidth: 570 }}>
            Keep your contact information current and review your clinical coordination assignment.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${C.border}`, padding: '10px 13px', background: C.white }}>
          <span style={{ width: 7, height: 7, background: '#26966B', borderRadius: '50%' }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.muted, fontSize: 10, letterSpacing: '.08em' }}>PROFILE SETTINGS</span>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 18, marginBottom: 22 }}>
        <article style={{ border: `1px solid ${C.border}`, background: C.white, minWidth: 0 }}>
          <div style={{ height: 4, background: C.blue }} />
          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{ width: 54, height: 54, flexShrink: 0, display: 'grid', placeItems: 'center', background: '#EAF2FC', border: '1px solid #C9DDF8', color: C.blue, fontSize: 17, fontWeight: 750 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 750, overflowWrap: 'anywhere' }}>{`${firstName} ${lastName}`.trim() || profile?.username || 'Assistant account'}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Clinical support account</div>
              </div>
              <User size={18} color={C.blue} style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <Stethoscope size={17} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '.09em', marginBottom: 5 }}>ASSIGNED DOCTOR</div>
                  <div style={{ fontSize: 14, fontWeight: 700, overflowWrap: 'anywhere' }}>{doctorName}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{doctor?.specialization ? `${doctor.specialization} specialist` : 'Awaiting doctor assignment'}</div>
                </div>
              </div>
              <div style={{ height: 1, background: C.border }} />
              <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <Building2 size={17} color={C.orange} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '.09em', marginBottom: 5 }}>MEDICAL CENTER</div>
                  <div style={{ fontSize: 14, fontWeight: 700, overflowWrap: 'anywhere' }}>{medicalCenter?.name || 'City Health Hospital'}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                    <MapPin size={13} style={{ flexShrink: 0, marginTop: 1 }} />{medicalCenter?.address || 'Main Campus'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article style={{ border: `1px solid ${C.border}`, background: C.soft, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.muted, fontSize: 10, letterSpacing: '.12em', marginBottom: 12 }}>ASSIGNMENT STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              <BadgeCheck size={22} color={doctor && medicalCenter ? '#26966B' : C.orange} />
              <h2 style={{ fontSize: 20, lineHeight: 1.25, letterSpacing: '-.025em', margin: 0, fontWeight: 750 }}>{doctor && medicalCenter ? 'Assignment active' : 'Assignment pending'}</h2>
            </div>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.75, margin: 0 }}>
              {doctor && medicalCenter
                ? 'Your doctor and medical center details are available below. Contact your administrator if an assignment needs to change.'
                : 'Your clinical assignment details may not be complete yet. Contact your administrator for assistance.'}
            </p>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 15, display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
            <ShieldCheck size={16} color={C.blue} />
            ACCOUNT INFORMATION
            <ArrowUpRight size={15} style={{ marginLeft: 'auto' }} />
          </div>
        </article>
      </section>

      <section style={{ border: `1px solid ${C.border}`, background: C.white }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.blue, letterSpacing: '.11em', marginBottom: 5 }}>PERSONAL INFORMATION</div>
            <h2 style={{ fontSize: 18, fontWeight: 750, letterSpacing: '-.025em', margin: 0 }}>Contact details</h2>
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted }}>EDITABLE FIELDS · 04</span>
        </div>
        <form onSubmit={handleSave} style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 18, marginBottom: 20 }}>
            <ProfileField label="FIRST NAME" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter first name" autoComplete="given-name" />
            <ProfileField label="LAST NAME" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter last name" autoComplete="family-name" />
            <ProfileField label="PHONE NUMBER" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" icon={Phone} autoComplete="tel" />
            <ProfileField label="ADDRESS" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your address" icon={MapPin} autoComplete="street-address" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 12 }}>
              <ShieldCheck size={15} color={C.blue} /> Your details are used for clinical coordination.
            </div>
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '12px 18px', border: '1px solid #1769D2', borderRadius: 3, background: saving ? '#8BB4E8' : C.blue, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '.04em', cursor: saving ? 'wait' : 'pointer', minWidth: 160 }}>
              <Save size={16} /> {saving ? 'SAVING…' : 'SAVE PROFILE'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
