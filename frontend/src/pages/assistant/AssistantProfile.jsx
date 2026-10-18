import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import axiosInstance from '../../api/axiosInstance';
import { User, Stethoscope, Building2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AssistantProfile() {
  const { user, profile, reloadUser } = useAuth();
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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Assistant Profile</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Manage your personal details and view your clinical coordination assignments.
        </p>
      </div>

      {/* Assignment Info Card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
          Clinical Assignment
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0ea5e9', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              <Stethoscope size={18} /> Assigned Doctor
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {doctor
                ? `Dr. ${doctor.user?.first_name ? `${doctor.user.first_name} ${doctor.user.last_name}` : doctor.user?.username}`
                : 'Not Assigned Yet'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {doctor?.specialization ? `${doctor.specialization.toUpperCase()} SPECIALIST` : 'Awaiting doctor assignment'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              <Building2 size={18} /> Medical Center
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {medicalCenter?.name || 'City Health Hospital'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {medicalCenter?.address || 'Main Campus'}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>Contact & Personal Details</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
