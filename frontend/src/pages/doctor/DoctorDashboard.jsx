import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAppointments, updateAppointment } from '../../api/appointments';
import { getPatients } from '../../api/doctors';
import { getPrescriptions } from '../../api/prescriptions';
import { Calendar, Users, FileText, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setAppointments(appRes.data || []);
      setPatients(patRes.data || []);
      setPrescriptions(rxRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointment(id, { status });
      toast.success(`Appointment status updated to ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const doctorProfile = profile?.doctor_profile;
  const assistant = doctorProfile?.assistant;

  const pendingCount = appointments.filter((a) => a.status === 'requested' || a.status === 'pending_assistant').length;
  const approvedCount = appointments.filter((a) => a.status === 'approved').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Welcome, Dr. {profile?.first_name || user?.username}!
        </h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          {doctorProfile?.specialization ? `${doctorProfile.specialization.toUpperCase()} SPECIALIST` : 'General Physician'} • Here is your daily overview.
        </p>
      </div>

      {/* Assistant Status Banner */}
      <div
        style={{
          background: assistant ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${assistant ? '#bbf7d0' : '#fef3c7'}`,
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {assistant ? (
            <ShieldCheck size={28} color="#16a34a" />
          ) : (
            <AlertTriangle size={28} color="#d97706" />
          )}
          <div>
            <div style={{ fontWeight: 600, color: assistant ? '#166534' : '#92400e', fontSize: 15 }}>
              {assistant ? `Assigned Assistant: ${assistant.user?.first_name || assistant.user?.username || 'Priya'}` : 'Direct Patient Handling (No Assistant Appointed)'}
            </div>
            <div style={{ fontSize: 13, color: assistant ? '#15803d' : '#b45309' }}>
              {assistant
                ? 'Your assistant manages patient consultation requests and prescription verifications.'
                : 'Since no assistant is assigned, consultation requests are directly routed to you.'}
            </div>
          </div>
        </div>
        <a
          href="/doctor/profile"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: assistant ? '#166534' : '#b45309',
            textDecoration: 'underline',
          }}
        >
          Manage in Profile →
        </a>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>PENDING REQUESTS</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{pendingCount}</div>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>APPROVED APPOINTMENTS</span>
            <CheckCircle size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{approvedCount}</div>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>REGISTERED PATIENTS</span>
            <Users size={20} color="#0ea5e9" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{patients.length}</div>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>PRESCRIPTIONS ISSUED</span>
            <FileText size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{prescriptions.length}</div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Upcoming & Recent Appointments</h2>
          <a href="/doctor/appointments" style={{ color: '#0ea5e9', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            View all ({appointments.length}) →
          </a>
        </div>

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            No appointments scheduled yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Patient</th>
                  <th style={{ padding: '12px 16px' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px' }}>Mode</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>
                      {appt.patient_info?.first_name ? `${appt.patient_info.first_name} ${appt.patient_info.last_name}` : appt.patient_info?.username || (appt.patient ? `Patient #${appt.patient}` : 'Patient')}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {new Date(appt.scheduled_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                        {appt.mode.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            appt.status === 'approved' ? '#dcfce7' :
                            appt.status === 'completed' ? '#e0f2fe' :
                            appt.status === 'pending_assistant' ? '#fef3c7' : '#fee2e2',
                          color:
                            appt.status === 'approved' ? '#166534' :
                            appt.status === 'completed' ? '#0369a1' :
                            appt.status === 'pending_assistant' ? '#92400e' : '#991b1b',
                        }}
                      >
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {appt.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'completed')}
                          style={{
                            background: '#0ea5e9',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
