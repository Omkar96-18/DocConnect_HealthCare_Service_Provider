import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorProfile, updateDoctorProfile } from '../../api/doctors';
import { updateProfile } from '../../api/auth';
import axiosInstance from '../../api/axiosInstance';
import { User, Stethoscope, Clock, ShieldCheck, Save, DollarSign } from 'lucide-react';
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

export default function DoctorProfile() {
  const { user, profile, reloadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
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

  // Assistant states
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
      setAvailableAssistants(res.data || []);
      if (res.data?.length > 0) {
        setSelectedAssistantId(res.data[0].id || res.data[0].user_id);
      }
    } catch {
      // ignore
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getDoctorProfile();
      const doc = res.data;
      setSpecialization(doc.specialization || 'general');
      setExperienceYears(doc.experience_years || 0);
      setConsultationFee(doc.consultation_fee || 0);
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
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update basic user info
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
      });

      // 2. Update doctor profile
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
    try {
      const res = await axiosInstance.post('/assistant/assign-doctor/', {
        assistant_user_id: selectedAssistantId,
      });
      toast.success(res.data.message || 'Assistant appointed successfully!');
      fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to appoint assistant');
    }
  };

  const handleRemoveAssistant = async () => {
    if (!window.confirm('Are you sure you want to remove your appointed assistant? Consultation requests will be handled directly by you.')) return;
    try {
      await axiosInstance.post('/assistant/assign-doctor/', { action: 'remove' });
      toast.success('Assistant removed. You now handle consultation requests directly.');
      fetchProfileData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove assistant');
    }
  };

  const handleTogglePermission = async () => {
    const nextState = !assistantCanApprove;
    try {
      await axiosInstance.post('/access/grant-assistant-permission/', { grant: nextState });
      setAssistantCanApprove(nextState);
      toast.success(`Assistant permission to approve patients ${nextState ? 'GRANTED' : 'REVOKED'}`);
    } catch (err) {
      toast.error('Failed to update assistant permission');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading doctor profile...</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Doctor Profile & Practice Settings</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Keep your medical credentials, consultation fees, and assistant appointment up to date.
        </p>
      </div>

      {/* Assistant Status Card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={22} color="#0ea5e9" />
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Assistant Appointment & Delegation
            </h2>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: 6 }}>
            Rule: Max 1 assistant per doctor
          </span>
        </div>

        {assistant ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#166534' }}>
                  Current Assistant: {assistant.name || assistant.username}
                </div>
                <div style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>
                  Username: @{assistant.username} • Email: {assistant.email || 'N/A'} • Phone: {assistant.phone || 'N/A'}
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: assistantCanApprove ? '#dcfce7' : '#fee2e2',
                      color: assistantCanApprove ? '#166534' : '#991b1b',
                      border: `1px solid ${assistantCanApprove ? '#86efac' : '#fca5a5'}`,
                    }}
                  >
                    {assistantCanApprove ? '✓ Permission Granted to Approve Consultations' : '✕ Approval Permission Revoked'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleTogglePermission}
                  style={{
                    background: assistantCanApprove ? '#ea580c' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {assistantCanApprove ? 'Revoke Approval Permission' : 'Grant Approval Permission'}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAssistant}
                  style={{
                    background: '#fff',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Remove Assistant
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: '#92400e' }}>No Assistant Currently Appointed</div>
              <div style={{ fontSize: 13, color: '#b45309', marginTop: 4 }}>
                When no assistant is appointed, patient consultation requests are received and handled directly by you. Select a registered clinical assistant below to delegate patient intake and scheduling:
              </div>
            </div>

            <form onSubmit={handleAssignAssistant} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                style={{ flex: 1, minWidth: 260, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14 }}
              >
                {availableAssistants.length === 0 ? (
                  <option value="">No registered assistants found</option>
                ) : (
                  availableAssistants.map((ast) => (
                    <option key={ast.id} value={ast.user_id || ast.id}>
                      {ast.name} (@{ast.username}) - {ast.email}
                    </option>
                  ))
                )}
              </select>
              <button
                type="submit"
                disabled={availableAssistants.length === 0}
                style={{
                  background: '#0ea5e9',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Appoint Assistant
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>Personal & Contact Details</h2>

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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Clinic / Chamber Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 16px', color: '#0f172a', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          Professional Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Medical Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            >
              {SPECIALIZATIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Medical License / Registration No.</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Years of Clinical Experience</label>
            <input
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Consultation Fee ($ / ₹)</label>
            <input
              type="number"
              min="0"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Professional Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Available Consultation Days</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {DAYS.map((day) => {
              const active = availableDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${active ? '#0ea5e9' : '#cbd5e1'}`,
                    background: active ? '#0ea5e9' : '#fff',
                    color: active ? '#fff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="acceptingPatients"
            checked={isAccepting}
            onChange={(e) => setIsAccepting(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#0ea5e9' }}
          />
          <label htmlFor="acceptingPatients" style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', cursor: 'pointer' }}>
            Currently accepting new patient consultation requests
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
