import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAccessList } from '../../api/doctors';
import { getAppointments } from '../../api/appointments';
import { getPrescriptions } from '../../api/prescriptions';
import { CheckSquare, Calendar, FileText, UserCheck, Stethoscope, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AssistantDashboard() {
  const { user, profile } = useAuth();
  const [accessList, setAccessList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, appRes, rxRes] = await Promise.all([
        getAccessList(),
        getAppointments(),
        getPrescriptions(),
      ]);
      setAccessList(accRes.data || []);
      setAppointments(appRes.data || []);
      setPrescriptions(rxRes.data || []);
    } catch (err) {
      toast.error('Failed to load assistant dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const assistantProfile = profile?.assistant_profile;
  const assignedDoctors = assistantProfile?.doctors || (assistantProfile?.doctor_info ? [assistantProfile.doctor_info] : []);
  const primaryDoctor = assistantProfile?.doctor_info || assignedDoctors[0];

  const pendingApprovals = accessList.filter((a) => a.status === 'pending');
  const pendingAppointments = appointments.filter((a) => a.status === 'pending_assistant');
  const unvalidatedRx = prescriptions.filter((r) => !r.is_validated);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Assistant Control Desk
        </h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Welcome, {profile?.first_name || user?.username}! You act as the clinical coordination layer for patient access & pharmacy validation.
        </p>
      </div>

      {/* Doctor Assignment Card */}
      <div
        style={{
          background: assignedDoctors.length > 0 ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${assignedDoctors.length > 0 ? '#bbf7d0' : '#fef3c7'}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Stethoscope size={32} color={assignedDoctors.length > 0 ? '#16a34a' : '#d97706'} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: assignedDoctors.length > 0 ? '#166534' : '#92400e' }}>
            {assignedDoctors.length > 0
              ? `Assigned Doctors (${assignedDoctors.length}): ${assignedDoctors.map(d => `Dr. ${d.name} (${d.specialization})`).join(', ')}`
              : 'No Doctor Assigned Yet'}
          </div>
          <div style={{ fontSize: 13, color: assignedDoctors.length > 0 ? '#15803d' : '#b45309', marginTop: 2 }}>
            {assignedDoctors.length > 0
              ? 'You coordinate patient requests, appointment approvals, and prescription barcode verifications for your assigned doctors.'
              : 'You will receive patient requests once a doctor appoints you as their assistant.'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>PENDING PATIENT APPROVALS</span>
            <UserCheck size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{pendingApprovals.length}</div>
          <a href="/assistant/approvals" style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 600, display: 'inline-block', marginTop: 8 }}>
            Review approvals →
          </a>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>APPOINTMENTS AWAITING REVIEW</span>
            <Calendar size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{pendingAppointments.length}</div>
          <a href="/assistant/approvals" style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 600, display: 'inline-block', marginTop: 8 }}>
            Review schedule →
          </a>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>PRESCRIPTIONS TO VALIDATE</span>
            <FileText size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>{unvalidatedRx.length}</div>
          <a href="/assistant/prescriptions" style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 600, display: 'inline-block', marginTop: 8 }}>
            Validate barcodes →
          </a>
        </div>
      </div>

      {/* Pending Access Requests Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
          Recent Patient Consultation Requests
        </h2>

        {pendingApprovals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            No pending patient access requests at this time.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Patient</th>
                  <th style={{ padding: '12px 16px' }}>Phone</th>
                  <th style={{ padding: '12px 16px' }}>Doctor Permission Status</th>
                  <th style={{ padding: '12px 16px' }}>Requested At</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {req.patient_info?.first_name ? `${req.patient_info.first_name} ${req.patient_info.last_name}` : req.patient_info?.username || (req.patient ? `Patient #${req.patient}` : 'Patient')}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {req.patient_info?.phone || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: req.assistant_permission_granted ? '#dcfce7' : '#fee2e2',
                          color: req.assistant_permission_granted ? '#166534' : '#991b1b',
                        }}
                      >
                        {req.assistant_permission_granted ? 'Permitted by Doctor' : 'Awaiting Doctor Consent'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <a
                        href="/assistant/approvals"
                        style={{
                          background: '#0ea5e9',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Review
                      </a>
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
