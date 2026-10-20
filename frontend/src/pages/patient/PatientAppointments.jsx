import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAppointments, createAppointment, cancelAppointment } from '../../api/appointments';
import { getAccessList } from '../../api/doctors';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Calendar,
  Plus,
  X,
  Video,
  Phone,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const STATUS_BADGES = {
  requested: { label: 'Requested', color: '#B66A12', bg: '#FFF7E8', border: '#F2D3A2' },
  pending_assistant: { label: 'Pending Assistant Review', color: '#B66A12', bg: '#FFF7E8', border: '#F2D3A2' },
  approved: { label: 'Confirmed', color: '#1769D2', bg: '#EEF5FF', border: '#B9D3F5' },
  completed: { label: 'Completed', color: '#1769D2', bg: '#EEF5FF', border: '#B9D3F5' },
  cancelled: { label: 'Cancelled', color: '#6E7882', bg: '#F4F6F8', border: '#DCE2E7' },
  rejected: { label: 'Rejected', color: '#B42318', bg: '#FFF1F0', border: '#F4C7C3' },
};

const MODE_ICONS = {
  in_person: { label: 'In Person', icon: User },
  video: { label: 'Video Call', icon: Video },
  phone: { label: 'Phone Call', icon: Phone },
};

const COLORS = {
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  paper: '#FFFFFF',
  soft: '#F6F8FA',
};

const buttonBase = {
  borderRadius: 2,
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  cursor: 'pointer',
  transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
};

const fieldBase = {
  boxSizing: 'border-box',
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 2,
  background: COLORS.paper,
  color: COLORS.ink,
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 12,
  outlineColor: COLORS.blue,
};

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('in_person');
  const [patientNotes, setPatientNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, accRes] = await Promise.all([getAppointments(), getAccessList()]);
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
      setScheduledAt('');
      setMode('in_person');
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

  const styles = {
    page: {
      maxWidth: 1100,
      margin: '0 auto',
      color: COLORS.ink,
      fontFamily: '"IBM Plex Mono", monospace',
    },
    eyebrow: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      color: COLORS.muted,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.13em',
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.04em',
      margin: 0,
      color: COLORS.ink,
    },
    subtitle: {
      margin: '7px 0 0',
      color: COLORS.muted,
      fontSize: 12,
      lineHeight: 1.7,
    },
    primaryButton: {
      ...buttonBase,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '11px 15px',
      border: `1px solid ${COLORS.blue}`,
      background: COLORS.blue,
      color: '#FFFFFF',
    },
    secondaryButton: {
      ...buttonBase,
      padding: '10px 14px',
      border: `1px solid ${COLORS.border}`,
      background: COLORS.paper,
      color: COLORS.ink,
    },
    card: {
      background: COLORS.paper,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 2,
      padding: '19px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 18,
    },
    fieldLabel: {
      display: 'block',
      fontSize: 10,
      fontWeight: 600,
      color: COLORS.muted,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      marginBottom: 7,
    },
    iconBox: {
      width: 42,
      height: 42,
      border: `1px solid ${COLORS.border}`,
      background: COLORS.soft,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLORS.blue,
      flexShrink: 0,
    },
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <main style={styles.page}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 25,
          paddingBottom: 19,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div>
          <div style={styles.eyebrow}>
            <span style={{ width: 20, height: 2, background: COLORS.orange }} />
            PATIENT PORTAL / CARE
          </div>
          <h1 style={styles.title}>My Appointments<span style={{ color: COLORS.orange }}>.</span></h1>
          <p style={styles.subtitle}>Schedule and track your medical consultations and clinic visits.</p>
        </div>
        <button style={styles.primaryButton} onClick={() => setShowBookModal(true)}>
          <Plus size={15} /> Book Appointment
        </button>
      </header>

      {appointments.length === 0 ? (
        <section
          style={{
            border: `1px solid ${COLORS.border}`,
            background: COLORS.paper,
            padding: '52px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ ...styles.iconBox, margin: '0 auto 17px', width: 48, height: 48 }}>
            <Calendar size={22} />
          </div>
          <div style={styles.eyebrow}>NO RECORDS FOUND</div>
          <h2 style={{ fontSize: 16, margin: '0 0 8px', color: COLORS.ink }}>No appointments booked yet</h2>
          <p style={{ ...styles.subtitle, maxWidth: 430, margin: '0 auto 20px' }}>
            Once you have access to a doctor, you can book an appointment in-person, over video, or via phone call.
          </p>
          <button style={styles.primaryButton} onClick={() => setShowBookModal(true)}>
            <Plus size={15} /> Schedule Consultation
          </button>
        </section>
      ) : (
        <section style={{ display: 'grid', gap: 12 }}>
          {appointments.map((appointment) => {
            const doctorName = appointment.doctor_info?.name || `Dr. #${appointment.doctor}`;
            const specialization = appointment.doctor_info?.specialization
              ? `${appointment.doctor_info.specialization.toUpperCase()} SPECIALIST`
              : 'GENERAL PHYSICIAN';
            const badge = STATUS_BADGES[appointment.status] || {
              label: appointment.status,
              color: COLORS.muted,
              bg: COLORS.soft,
              border: COLORS.border,
            };
            const modeInfo = MODE_ICONS[appointment.mode] || { label: appointment.mode, icon: User };
            const ModeIcon = modeInfo.icon;
            const date = new Date(appointment.scheduled_at);

            return (
              <article key={appointment.id} style={styles.card}>
                <div style={{ minWidth: 0, flex: '1 1 350px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <h2 style={{ fontSize: 14, lineHeight: 1.5, margin: 0, fontWeight: 700 }}>
                      {doctorName}
                    </h2>
                    <span
                      style={{
                        padding: '4px 7px',
                        color: badge.color,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ color: COLORS.blue, fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', marginTop: 5 }}>
                    {specialization}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 18px', marginTop: 14, fontSize: 11, color: COLORS.muted }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} /> {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${COLORS.border}`, padding: '5px 7px', background: COLORS.soft }}>
                      <ModeIcon size={13} color={COLORS.blue} /> {modeInfo.label}
                    </span>
                  </div>
                  {appointment.patient_notes && (
                    <p style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7, margin: '12px 0 0', overflowWrap: 'anywhere' }}>
                      <span style={{ color: COLORS.ink, fontWeight: 600 }}>NOTE / </span>
                      {appointment.patient_notes}
                    </p>
                  )}
                </div>
                {['requested', 'pending_assistant', 'approved'].includes(appointment.status) && (
                  <button
                    onClick={() => handleCancel(appointment.id)}
                    disabled={cancelling === appointment.id}
                    style={{
                      ...buttonBase,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 11px',
                      border: '1px solid #F4C7C3',
                      background: '#FFFFFF',
                      color: '#B42318',
                      cursor: cancelling === appointment.id ? 'not-allowed' : 'pointer',
                      opacity: cancelling === appointment.id ? 0.65 : 1,
                    }}
                  >
                    <X size={14} />
                    {cancelling === appointment.id ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                )}
              </article>
            );
          })}
        </section>
      )}

      {showBookModal && (
        <div
          role="presentation"
          onClick={() => setShowBookModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(16, 24, 32, 0.48)',
            backdropFilter: 'blur(3px)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-modal-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: COLORS.paper,
              borderTop: `3px solid ${COLORS.orange}`,
              padding: '24px',
              boxSizing: 'border-box',
              boxShadow: '0 22px 60px rgba(16, 24, 32, 0.2)',
              fontFamily: '"IBM Plex Mono", monospace',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingBottom: 17, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
              <div>
                <div style={styles.eyebrow}>NEW REQUEST / APPOINTMENT</div>
                <h2 id="appointment-modal-title" style={{ margin: 0, fontSize: 18, color: COLORS.ink }}>
                  Book New Appointment<span style={{ color: COLORS.orange }}>.</span>
                </h2>
              </div>
              <button aria-label="Close appointment dialog" onClick={() => setShowBookModal(false)} style={{ ...styles.secondaryButton, padding: 7, display: 'inline-flex' }}>
                <X size={17} />
              </button>
            </div>

            {approvedDoctors.length === 0 ? (
              <div style={{ border: '1px solid #F2D3A2', background: '#FFF7E8', padding: 15, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <AlertCircle size={19} color="#B66A12" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 11, lineHeight: 1.8, color: '#805015' }}>
                    <strong>ACCESS REQUIRED / </strong>
                    You must request and receive consultation approval from a doctor or their assistant before booking.
                    <div style={{ marginTop: 9 }}>
                      <a href="/patient/find-doctors" style={{ color: COLORS.blue, fontWeight: 700 }}>
                        Browse Doctors &amp; Request Access →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                <div style={{ marginBottom: 17 }}>
                  <label htmlFor="appointment-doctor" style={styles.fieldLabel}>Select Doctor *</label>
                  <select
                    id="appointment-doctor"
                    value={selectedDoctorId}
                    onChange={(event) => setSelectedDoctorId(event.target.value)}
                    required
                    style={fieldBase}
                  >
                    {approvedDoctors.map((access) => (
                      <option key={access.id} value={access.doctor}>
                        {access.doctor_info?.name || `Doctor #${access.doctor}`} ({access.doctor_info?.specialization || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 17 }}>
                  <label htmlFor="appointment-datetime" style={styles.fieldLabel}>Date &amp; Time *</label>
                  <input
                    id="appointment-datetime"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    required
                    style={fieldBase}
                  />
                </div>

                <fieldset style={{ border: 0, padding: 0, margin: '0 0 17px' }}>
                  <legend style={styles.fieldLabel}>Consultation Mode *</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                    {[
                      { value: 'in_person', label: 'In Person', icon: User },
                      { value: 'video', label: 'Video Call', icon: Video },
                      { value: 'phone', label: 'Phone', icon: Phone },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = mode === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setMode(item.value)}
                          style={{
                            ...buttonBase,
                            minWidth: 0,
                            padding: '12px 5px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 7,
                            border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
                            background: active ? '#EEF5FF' : COLORS.paper,
                            color: active ? COLORS.blue : COLORS.muted,
                          }}
                        >
                          <Icon size={17} />
                          <span style={{ fontSize: 10, textAlign: 'center' }}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="appointment-notes" style={styles.fieldLabel}>Reason for Consultation / Notes</label>
                  <textarea
                    id="appointment-notes"
                    rows={3}
                    value={patientNotes}
                    onChange={(event) => setPatientNotes(event.target.value)}
                    placeholder="Briefly describe your symptoms or routine checkup requirement..."
                    style={{ ...fieldBase, resize: 'vertical', minHeight: 86, lineHeight: 1.7 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 9, borderTop: `1px solid ${COLORS.border}`, paddingTop: 17 }}>
                  <button type="button" onClick={() => setShowBookModal(false)} style={styles.secondaryButton}>
                    Cancel
                  </button>
                  <button type="submit" disabled={booking} style={{ ...styles.primaryButton, opacity: booking ? 0.65 : 1, cursor: booking ? 'not-allowed' : 'pointer' }}>
                    {booking ? 'Scheduling...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
