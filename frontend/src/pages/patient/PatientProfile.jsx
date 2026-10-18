import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Save, User, ShieldCheck } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
      if (!payload.date_of_birth) {
        payload.date_of_birth = null;
      }
      await updateProfile(payload);
      toast.success('Medical profile updated successfully!');
      if (reloadUser) reloadUser();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const s = {
    h1: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
    sub: { color: '#64748b', marginBottom: 24, fontSize: 14 },
    card: {
      background: '#fff',
      borderRadius: 14,
      padding: 28,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      maxWidth: 700,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottom: '1px solid #f0f0f0',
    },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
    group: { marginBottom: 16 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 },
    input: {
      width: '100%',
      padding: '10px 13px',
      border: '1.5px solid #e2e8f0',
      borderRadius: 9,
      fontSize: 14,
      outline: 'none',
      color: '#1e293b',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '10px 13px',
      border: '1.5px solid #e2e8f0',
      borderRadius: 9,
      fontSize: 14,
      outline: 'none',
      background: '#fff',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '10px 13px',
      border: '1.5px solid #e2e8f0',
      borderRadius: 9,
      fontSize: 14,
      outline: 'none',
      resize: 'vertical',
      minHeight: 80,
      boxSizing: 'border-box',
    },
    saveBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '11px 24px',
      background: '#0ea5e9',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 14,
    },
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <div>
      <div style={s.h1}>My Profile</div>
      <div style={s.sub}>Update your personal and medical information</div>

      <div style={s.card}>
        <form onSubmit={handleSubmit}>
          <div style={s.sectionTitle}>Personal Information</div>
          <div style={s.grid2}>
            <div style={s.group}>
              <label style={s.label}>First Name</label>
              <input style={s.input} name="first_name" value={form.first_name} onChange={handleChange} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Last Name</label>
              <input style={s.input} name="last_name" value={form.last_name} onChange={handleChange} />
            </div>
          </div>
          <div style={s.grid2}>
            <div style={s.group}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Phone</label>
              <input style={s.input} name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>Address</label>
            <input style={s.input} name="address" value={form.address} onChange={handleChange} />
          </div>

          <div style={{ ...s.sectionTitle, marginTop: 24 }}>Medical Information</div>
          <div style={s.grid2}>
            <div style={s.group}>
              <label style={s.label}>Date of Birth</label>
              <input style={s.input} type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Blood Group</label>
              <select style={s.select} name="blood_group" value={form.blood_group} onChange={handleChange}>
                <option value="">Select…</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>Allergies</label>
            <textarea
              style={s.textarea}
              name="allergies"
              placeholder="List any known allergies…"
              value={form.allergies}
              onChange={handleChange}
            />
          </div>
          <div style={s.group}>
            <label style={s.label}>Medical History</label>
            <textarea
              style={{ ...s.textarea, minHeight: 110 }}
              name="medical_history"
              placeholder="Previous conditions, surgeries, medications…"
              value={form.medical_history}
              onChange={handleChange}
            />
          </div>

          <button style={s.saveBtn} type="submit" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
