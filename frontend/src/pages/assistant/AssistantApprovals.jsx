import React, { useEffect, useState } from 'react';
import { getAccessList, approveAccess } from '../../api/doctors';
import { getAppointments, approveAppointment, rejectAppointment } from '../../api/appointments';
import { Check, X, ShieldCheck, ShieldAlert, Calendar, User, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AssistantApprovals() {
  const [accessRequests, setAccessRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, appRes] = await Promise.all([
        getAccessList(),
        getAppointments(),
      ]);
      setAccessRequests(accRes.data || []);
      setAppointments(appRes.data || []);
    } catch (err) {
      toast.error('Failed to load approval queues');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDecision = async (accessId, decision) => {
    try {
      await approveAccess(accessId, decision);
      toast.success(`Patient request ${decision === 'approve' ? 'approved' : 'rejected'}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${decision} request`);
    }
  };

  const handleApproveAppointment = async (apptId) => {
    try {
      await approveAppointment(apptId);
      toast.success('Appointment approved successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleRejectAppointment = async (apptId) => {
    try {
      await rejectAppointment(apptId);
      toast.success('Appointment rejected');
      fetchData();
    } catch (err) {
      toast.error('Failed to reject appointment');
    }
  };

  const pendingAccess = accessRequests.filter((a) => a.status === 'pending');
  const pendingAppointments = appointments.filter((a) => a.status === 'pending_assistant');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Clinical Approval Queue</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Review and approve patient consultations and appointment bookings for your assigned doctor.
        </p>
      </div>

      {/* Section 1: Patient Consultation Access Requests */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
            1. Patient Consultation Requests ({pendingAccess.length})
          </h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Approving unlocks direct patient-doctor messaging and consultation booking.
          </span>
        </div>

        {pendingAccess.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            No pending patient consultation requests.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {pendingAccess.map((req) => {
              const pat = req.patient_info || {};
              const patName = pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${req.patient}`);
              const isAllowed = req.assistant_permission_granted;

              return (
                <div
                  key={req.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    background: '#f8fafc',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        {patName}
                      </span>
                      <span style={{ fontSize: 12, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                        For {req.doctor_info?.name || 'Assigned Doctor'}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: isAllowed ? '#dcfce7' : '#fee2e2',
                          color: isAllowed ? '#166534' : '#991b1b',
                        }}
                      >
                        {isAllowed ? 'Doctor Permission: Granted' : 'Doctor Permission: Revoked'}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Email: {pat.email || 'N/A'} • Phone: {pat.phone || 'N/A'} • Requested on {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      disabled={!isAllowed}
                      onClick={() => handleAccessDecision(req.id, 'approve')}
                      style={{
                        background: isAllowed ? '#10b981' : '#cbd5e1',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: isAllowed ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                      title={!isAllowed ? 'Doctor has revoked permission to approve' : ''}
                    >
                      <Check size={16} /> Approve Consultation
                    </button>

                    <button
                      onClick={() => handleAccessDecision(req.id, 'reject')}
                      style={{
                        background: '#fff',
                        color: '#ef4444',
                        border: '1px solid #fca5a5',
                        padding: '8px 14px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Appointment Booking Approvals */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
          2. Appointment Bookings Awaiting Assistant Confirmation ({pendingAppointments.length})
        </h2>

        {pendingAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            No appointments currently awaiting assistant confirmation.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {pendingAppointments.map((appt) => {
              const pat = appt.patient_info || {};
              const patName = pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${appt.patient}`);

              return (
                <div
                  key={appt.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    background: '#f8fafc',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        {patName}
                      </span>
                      <span style={{ fontSize: 12, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                        {appt.doctor_info?.name ? `with Dr. ${appt.doctor_info.name}` : ''}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>
                        {appt.mode.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Scheduled for: <strong>{new Date(appt.scheduled_at).toLocaleString()}</strong>
                      {pat.phone ? ` • Contact: ${pat.phone}` : ''}
                    </div>

                    {appt.patient_notes && (
                      <div style={{ fontSize: 13, color: '#334155', marginTop: 6 }}>
                        <em>Note: "{appt.patient_notes}"</em>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => handleApproveAppointment(appt.id)}
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Check size={16} /> Confirm Appointment
                    </button>

                    <button
                      onClick={() => handleRejectAppointment(appt.id)}
                      style={{
                        background: '#fff',
                        color: '#ef4444',
                        border: '1px solid #fca5a5',
                        padding: '8px 14px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
