import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAppointments, createAppointment, cancelAppointment } from '../../api/appointments';
import { getAccessList } from '../../api/doctors';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Plus, X, Video, Phone, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_BADGES = {
  requested: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Requested' },
  pending_assistant: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'Pending Assistant Review' },
  approved: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Confirmed' },
  completed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Completed' },
  cancelled: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', label: 'Cancelled' },
  rejected: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Rejected' },
};

const MODE_ICONS = {
  in_person: { label: 'In Person', icon: User },
  video: { label: 'Video Call', icon: Video },
  phone: { label: 'Phone Call', icon: Phone },
};

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  // New Appointment Form
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('in_person');
  const [patientNotes, setPatientNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, accRes] = await Promise.all([
        getAppointments(),
        getAccessList(),
      ]);
      setAppointments(Array.isArray(appRes.data) ? appRes.data : appRes.data.results ?? []);
      const accesses = Array.isArray(accRes.data) ? accRes.data : accRes.data.results ?? [];
      const approved = accesses.filter((a) => a.status === 'approved');
      setApprovedDoctors(approved);
      if (approved.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(approved[0].doctor);
      }
    } catch {
      toast.error('Failed to load appointments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      toast.success('Appointment booked successfully!');
      setShowBookModal(false);
      setPatientNotes('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(id);
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Cannot cancel appointment');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            My Appointments
          </h1>
          <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 4 }}>
            Schedule and track your medical consultations and clinic visits.
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          style={{
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
          }}
        >
          <Plus size={17} /> Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: '60px 24px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: '#f1f5f9',
              color: '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Calendar size={26} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            No appointments booked yet
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 400, margin: '0 auto 20px' }}>
            Once you have access to a doctor, you can book an appointment in-person, over video, or via phone call.
          </p>
          <button
            onClick={() => setShowBookModal(true)}
            style={{
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Schedule Consultation
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {appointments.map((a) => {
            const docName = a.doctor_info?.name || `Dr. #${a.doctor}`;
            const specialization = a.doctor_info?.specialization ? `${a.doctor_info.specialization.toUpperCase()} SPECIALIST` : 'GENERAL PHYSICIAN';
            const badge = STATUS_BADGES[a.status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', label: a.status };
            const modeObj = MODE_ICONS[a.mode] || { label: a.mode, icon: User };
            const ModeIcon = modeObj.icon;
            const scheduledDate = new Date(a.scheduled_at);

            return (
              <div
                key={a.id}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                      {docName}
                    </span>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0284c7', marginTop: 2 }}>
                    {specialization}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, fontSize: 13, color: '#475569', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={15} color="#64748b" />
                      <span>{scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={15} color="#64748b" />
                      <span>{scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>
                      <ModeIcon size={14} color="#0284c7" />
                      <span style={{ fontWeight: 600 }}>{modeObj.label}</span>
                    </div>
                  </div>

                  {a.patient_notes && (
                    <div style={{ marginTop: 8, fontSize: 12.5, color: '#64748b', fontStyle: 'italic' }}>
                      Note: "{a.patient_notes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div>
                  {['requested', 'pending_assistant', 'approved'].includes(a.status) && (
                    <button
                      onClick={() => handleCancel(a.id)}
                      disabled={cancelling === a.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        borderRadius: 8,
                        padding: '7px 14px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: cancelling === a.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <X size={15} />
                      {cancelling === a.id ? 'Cancelling...' : 'Cancel Appointment'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Appointment Modal */}
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
                Book New Appointment
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
                      <a href="/patient/find-doctors" style={{ color: '#0284c7', fontWeight: 700 }}>
                        Browse Doctors & Request Access →
                      </a>
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
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14 }}
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
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
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
                    {booking ? 'Scheduling...' : 'Confirm Booking'}
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
