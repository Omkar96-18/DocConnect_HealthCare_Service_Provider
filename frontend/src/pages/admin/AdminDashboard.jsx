import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../api/admin';
import { Users, Building2, Calendar, FileText, CheckCircle, Clock, ShieldCheck, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getAdminStats();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading system statistics...</div>;
  }

  const users = stats?.users || {};
  const appointments = stats?.appointments || {};
  const prescriptions = stats?.prescriptions || {};

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>System Administration Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Comprehensive oversight of medical centers, healthcare providers, patients, and clinical workflows.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>TOTAL PLATFORM USERS</span>
            <Users size={20} color="#0ea5e9" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{users.total || 0}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            {users.doctor || 0} Doctors • {users.assistant || 0} Assistants • {users.patient || 0} Patients
          </div>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>MEDICAL CENTERS</span>
            <Building2 size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{stats?.medical_centers || 0}</div>
          <a href="/admin/medical-centers" style={{ color: '#10b981', fontSize: 12, fontWeight: 600, display: 'inline-block', marginTop: 6 }}>
            Manage centers →
          </a>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>TOTAL APPOINTMENTS</span>
            <Calendar size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{stats?.appointments_total || 0}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            {appointments.completed || 0} Completed • {appointments.approved || 0} Active
          </div>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>PRESCRIPTIONS VALIDATED</span>
            <FileText size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{prescriptions.validated || 0}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            {prescriptions.not_validated || 0} Awaiting Assistant Scan
          </div>
        </div>
      </div>

      {/* Breakdown Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* User Distribution Card */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>User Roles Overview</h2>
            <a href="/admin/users" style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 600 }}>Manage Users →</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Doctors</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{users.doctor || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Assistants</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{users.assistant || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Patients</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{users.patient || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Administrators</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{users.admin || 0}</span>
            </div>
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>Appointments Breakdown</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Pending Assistant Approval</span>
              <span style={{ fontWeight: 700, color: '#d97706' }}>{appointments.pending_assistant || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Direct Doctor Requested</span>
              <span style={{ fontWeight: 700, color: '#d97706' }}>{appointments.requested || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Approved / Scheduled</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>{appointments.approved || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Completed</span>
              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{appointments.completed || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
