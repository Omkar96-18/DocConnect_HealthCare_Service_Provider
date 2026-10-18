import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments } from '../../api/appointments';
import { getConversations } from '../../api/messages';
import { getPrescriptions } from '../../api/prescriptions';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, MessageCircle, FileText, ArrowRight, Search, Stethoscope, CheckCircle2, Clock } from 'lucide-react';

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
  const [appointments, setAppointments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAppointments(),
      getConversations(),
      getPrescriptions(),
    ])
      .then(([apptRes, convRes, prescRes]) => {
        setAppointments(Array.isArray(apptRes.data) ? apptRes.data : apptRes.data.results ?? []);
        setConversations(Array.isArray(convRes.data) ? convRes.data : convRes.data.results ?? []);
        setPrescriptions(Array.isArray(prescRes.data) ? prescRes.data : prescRes.data.results ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            Use geolocation to discover qualified doctors near your location, compare consultation fees, and submit direct or assistant-approved requests.
          </p>
        </div>
        <Link
          to="/patient/find-doctors"
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
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          <Search size={16} /> Explore Doctors
        </Link>
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
            No appointments scheduled yet. Click "Explore Doctors" to book a consultation.
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
                      {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Mode: {a.mode.replace('_', ' ').toUpperCase()}
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
                    {a.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
