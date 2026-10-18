import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, createAppointment } from '../../api/appointments';
import { getConversations } from '../../api/messages';
import { getPrescriptions } from '../../api/prescriptions';
import { getAccessList } from '../../api/doctors';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Calendar, MessageCircle, FileText, ArrowRight, Search, 
  X, Video, Phone, User, AlertCircle, Plus 
} from 'lucide-react';

const STATUS_COLORS = {
  requested: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  pending_assistant: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  approved: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  completed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  cancelled: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  rejected: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};

export default function PatientDashboard() {
  const { user, profile } = useAuth();
  
  // Dashboard Data State
  const [appointments, setAppointments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('in_person');
  const [patientNotes, setPatientNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apptRes, convRes, prescRes, accRes] = await Promise.all([
        getAppointments(),
        getConversations(),
        getPrescriptions(),
        getAccessList(),
      ]);
      
      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : apptRes.data.results ?? []);
      setConversations(Array.isArray(convRes.data) ? convRes.data : convRes.data.results ?? []);
      setPrescriptions(Array.isArray(prescRes.data) ? prescRes.data : prescRes.data.results ?? []);
      
      // Load approved doctors for the booking modal
      const accesses = Array.isArray(accRes.data) ? accRes.data : accRes.data.results ?? [];
      const approved = accesses.filter((a) => a.status === 'approved');
      setApprovedDoctors(approved);
      if (approved.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(approved[0].doctor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error('Please select a doctor with approved consultation access');
      return;
    }
    if (!scheduledAt) {
      toast.error('Please pick a date and time for the appointment');
      return;
    }

    setBooking(true);
    try {
      await createAppointment({
        doctor: selectedDoctorId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        mode,
        patient_notes: patientNotes,
      });
      toast.success('Appointment requested successfully!');
      setShowBookModal(false);
      setPatientNotes('');
      loadData(); // Refresh dashboard data after booking
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  const activeAppts = appointments.filter((a) =>
    ['requested', 'pending_assistant', 'approved'].includes(a.status)
  );
  const pendingRx = prescriptions.filter((p) => !p.is_validated);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Welcome, {profile?.first_name || user?.first_name || user?.username}! 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Access nearby specialist doctors, track clinical consultations, and manage digital prescriptions.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ACTIVE APPOINTMENTS
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 10 }}>{activeAppts.length}</div>
          <Link to="/patient/appointments" style={{ color: '#0284c7', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            View appointments <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CONSULTATION CHATS
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <MessageCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 10 }}>{conversations.length}</div>
          <Link to="/patient/messages" style={{ color: '#059669', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            Open conversations <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              PRESCRIPTIONS
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 10 }}>{prescriptions.length}</div>
          <Link to="/patient/prescriptions" style={{ color: '#d97706', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            {pendingRx.length > 0 ? `${pendingRx.length} awaiting assistant scan` : 'View all prescriptions'} <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Quick Action Discovery Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 10px 20px -5px rgba(2, 132, 199, 0.3)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
            Find & Consult Nearby Doctors
          </h2>
          <p style={{ fontSize: 13.5, opacity: 0.9, margin: 0, maxWidth: 540 }}>
            Use geolocation to discover qualified doctors near your location, compare consultation fees, and request an appointment.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowBookModal(true)}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              padding: '11px 20px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          >
            <Plus size={16} /> Request Consultation
          </button>
          <Link
            to="/patient/find-doctors"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '11px 20px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none'
            }}
          >
            <Search size={16} /> Explore Doctors
          </Link>
        </div>
      </div>

      {/* Recent Appointments */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0f172a' }}>Recent Appointments</h2>
          <Link to="/patient/appointments" style={{ color: '#0284c7', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all ({appointments.length}) <ArrowRight size={13} />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 36, color: '#94a3b8', fontSize: 13.5 }}>
            No appointments scheduled yet. <br/><br/>
            <button
              onClick={() => setShowBookModal(true)}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Request a Consultation
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.slice(0, 4).map((a) => {
              const docName = a.doctor_info?.name || `Dr. #${a.doctor}`;
              const badge = STATUS_COLORS[a.status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

              return (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{docName}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {new Date(a.scheduled_at).toLocaleDateString()} at{' '}
                      {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' | '}Mode: {a.mode ? a.mode.replace('_', ' ').toUpperCase() : 'PENDING'}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      textTransform: 'capitalize',
                    }}
                  >
                    {(a.status || 'unknown').replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Appointment Modal (Imported from PatientAppointments) */}
      {showBookModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '28px 24px',
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Request Consultation
              </h2>
              <button
                onClick={() => setShowBookModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {approvedDoctors.length === 0 ? (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 13, color: '#92400e' }}>
                    <strong>Access Required:</strong> You must request and receive consultation approval from a doctor or their assistant before booking.
                    <div style={{ marginTop: 8 }}>
                      <Link to="/patient/find-doctors" onClick={() => setShowBookModal(false)} style={{ color: '#0284c7', fontWeight: 700 }}>
                        Browse Doctors & Request Access →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Select Doctor <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14 }}
                  >
                    {approvedDoctors.map((acc) => (
                      <option key={acc.id} value={acc.doctor}>
                        {acc.doctor_info?.name || `Doctor #${acc.doctor}`} ({acc.doctor_info?.specialization || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Date & Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Consultation Mode <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { value: 'in_person', label: 'In Person', icon: User },
                      { value: 'video', label: 'Video Call', icon: Video },
                      { value: 'phone', label: 'Phone', icon: Phone },
                    ].map((m) => {
                      const Icon = m.icon;
                      const active = mode === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMode(m.value)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 8,
                            border: `1.5px solid ${active ? '#0284c7' : '#e2e8f0'}`,
                            background: active ? '#f0f9ff' : '#fff',
                            color: active ? '#0284c7' : '#475569',
                            fontWeight: active ? 700 : 500,
                            fontSize: 12.5,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Icon size={16} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Reason for Consultation / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder="Briefly describe your symptoms or routine checkup requirement..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={booking}
                    style={{
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 20px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: booking ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {booking ? 'Scheduling...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}