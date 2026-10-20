import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAppointments, updateAppointment } from '../../api/appointments';
import { getPatients } from '../../api/doctors';
import { getPrescriptions } from '../../api/prescriptions';
import { Calendar, Users, FileText, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const C = {
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  paper: '#FFFFFF',
  soft: '#F6F8FA',
};
const mono = '"IBM Plex Mono", monospace';

const STATUS = {
  requested: { label: 'Requested', color: '#B66A12', bg: '#FFF7E8', border: '#F2D3A2' },
  pending_assistant: { label: 'Pending review', color: '#B66A12', bg: '#FFF7E8', border: '#F2D3A2' },
  approved: { label: 'Approved', color: C.blue, bg: '#EEF5FF', border: '#B9D3F5' },
  completed: { label: 'Completed', color: C.blue, bg: '#EEF5FF', border: '#B9D3F5' },
  cancelled: { label: 'Cancelled', color: C.muted, bg: '#F4F6F8', border: C.border },
  rejected: { label: 'Rejected', color: '#B42318', bg: '#FFF1F0', border: '#F4C7C3' },
};

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, patRes, rxRes] = await Promise.all([
        getAppointments(),
        getPatients(),
        getPrescriptions(),
      ]);
      const appData = appRes.data;
      const patData = patRes.data;
      const rxData = rxRes.data;
      setAppointments(Array.isArray(appData) ? appData : appData?.results ?? []);
      setPatients(Array.isArray(patData) ? patData : patData?.results ?? []);
      setPrescriptions(Array.isArray(rxData) ? rxData : rxData?.results ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);
      await updateAppointment(id, { status });
      toast.success(`Appointment status updated to ${status}`);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const doctorProfile = profile?.doctor_profile;
  const assistant = doctorProfile?.assistant;
  const pendingCount = appointments.filter((a) => a.status === 'requested' || a.status === 'pending_assistant').length;
  const approvedCount = appointments.filter((a) => a.status === 'approved').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  const styles = {
    page: { maxWidth: 1200, margin: '0 auto', color: C.ink, fontFamily: mono },
    eyebrow: { display: 'flex', alignItems: 'center', gap: 9, color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 10 },
    title: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.25 },
    subtitle: { color: C.muted, fontSize: 12, lineHeight: 1.7, margin: '7px 0 0' },
    panel: { background: C.paper, border: `1px solid ${C.border}`, borderRadius: 2 },
    statLabel: { fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', lineHeight: 1.6 },
    statValue: { fontSize: 30, fontWeight: 700, color: C.ink, marginTop: 12, letterSpacing: '-0.04em' },
    actionButton: { border: `1px solid ${C.blue}`, background: C.blue, color: C.paper, padding: '7px 10px', borderRadius: 2, fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer' },
  };

  return (
    <main style={styles.page}>
      <header style={{ marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}` }}>
        <div style={styles.eyebrow}><span style={{ width: 20, height: 2, background: C.orange }} /> DOCTOR PORTAL / OVERVIEW</div>
        <h1 style={styles.title}>Welcome, Dr. {profile?.first_name || user?.username}<span style={{ color: C.orange }}>.</span></h1>
        <p style={styles.subtitle}>
          {doctorProfile?.specialization ? `${doctorProfile.specialization.toUpperCase()} SPECIALIST` : 'GENERAL PHYSICIAN'} · Here is your daily overview.
        </p>
      </header>

      <section style={{
        ...styles.panel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        padding: '15px 17px',
        marginBottom: 22,
        borderLeft: `3px solid ${assistant ? C.blue : C.orange}`,
        background: C.paper,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0, flex: '1 1 360px' }}>
          {assistant ? <ShieldCheck size={24} color={C.blue} /> : <AlertTriangle size={24} color={C.orange} />}
          <div>
            <div style={{ fontWeight: 600, color: C.ink, fontSize: 12, lineHeight: 1.7 }}>
              {assistant ? `ASSIGNED ASSISTANT / ${assistant.user?.first_name || assistant.user?.username || 'Assistant'}` : 'DIRECT PATIENT HANDLING / NO ASSISTANT APPOINTED'}
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.7, color: C.muted, marginTop: 3 }}>
              {assistant
                ? 'Your assistant manages patient consultation requests and prescription verifications.'
                : 'Consultation requests are routed directly to you until an assistant is assigned.'}
            </div>
          </div>
        </div>
        <a href="/doctor/profile" style={{ color: C.blue, fontSize: 10, fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${C.blue}`, paddingBottom: 3 }}>
          Manage Profile →
        </a>
      </section>

      <section aria-label="Doctor dashboard statistics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12, marginBottom: 25 }}>
        {[
          { label: 'PENDING REQUESTS', value: pendingCount, icon: Clock, accent: C.orange, note: 'Awaiting action' },
          { label: 'APPROVED APPOINTMENTS', value: approvedCount, icon: CheckCircle, accent: C.blue, note: 'Scheduled consultations' },
          { label: 'REGISTERED PATIENTS', value: patients.length, icon: Users, accent: C.blue, note: 'Patient records' },
          { label: 'PRESCRIPTIONS ISSUED', value: prescriptions.length, icon: FileText, accent: C.orange, note: 'Digital prescriptions' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} style={{ ...styles.panel, padding: 17, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', background: stat.accent }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={styles.statLabel}>{stat.label}</span>
                <Icon size={18} color={stat.accent} />
              </div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>{stat.note}</div>
            </article>
          );
        })}
      </section>

      <section style={{ ...styles.panel, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={styles.eyebrow}>SCHEDULE / ACTIVITY</div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>Upcoming &amp; Recent Appointments</h2>
          </div>
          <a href="/doctor/appointments" style={{ color: C.blue, fontSize: 10, fontWeight: 600, textDecoration: 'none' }}>View all ({appointments.length}) →</a>
        </div>

        {loading ? (
          <div role="status" style={{ padding: 36, textAlign: 'center', color: C.muted, fontSize: 11 }}>Loading dashboard data...</div>
        ) : appointments.length === 0 ? (
          <div style={{ padding: 38, textAlign: 'center', color: C.muted, fontSize: 11 }}>No appointments scheduled yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 11, minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', background: C.soft }}>
                  {['Patient', 'Date & Time', 'Mode', 'Status', 'Actions'].map((heading) => <th key={heading} style={{ padding: '12px 14px', fontWeight: 600, textAlign: heading === 'Actions' ? 'right' : 'left' }}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((appointment) => {
                  const patient = appointment.patient_info || {};
                  const patientName = patient.first_name
                    ? `${patient.first_name} ${patient.last_name || ''}`.trim()
                    : patient.username || (appointment.patient ? `Patient #${appointment.patient}` : 'Patient');
                  const status = appointment.status || 'requested';
                  const badge = STATUS[status] || { label: status.replaceAll('_', ' '), color: C.muted, bg: C.soft, border: C.border };
                  const mode = (appointment.mode || 'in_person').replaceAll('_', ' ').toUpperCase();
                  return (
                    <tr key={appointment.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '13px 14px', fontWeight: 600, color: C.ink }}>{patientName}</td>
                      <td style={{ padding: '13px 14px', color: C.muted }}>{appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString() : 'Not Scheduled'}</td>
                      <td style={{ padding: '13px 14px' }}><span style={{ color: C.muted, fontSize: 9 }}>{mode}</span></td>
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 6px', border: `1px solid ${badge.border}`, background: badge.bg, color: badge.color, fontSize: 9, fontWeight: 600, textTransform: 'uppercase' }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                        {status === 'approved' && (
                          <button disabled={updatingId === appointment.id} onClick={() => handleStatusChange(appointment.id, 'completed')} style={{ ...styles.actionButton, opacity: updatingId === appointment.id ? 0.6 : 1, cursor: updatingId === appointment.id ? 'wait' : 'pointer' }}>
                            {updatingId === appointment.id ? 'Updating...' : 'Mark Completed'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
