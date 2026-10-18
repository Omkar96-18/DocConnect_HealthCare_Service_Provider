import React, { useEffect, useState } from 'react';
import { getAppointments, updateAppointment } from '../../api/appointments';
import { Calendar, Check, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointment(id, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleModeUpdate = async (id, mode) => {
    try {
      await updateAppointment(id, { mode });
      toast.success(`Consultation mode set to ${mode.replace('_', ' ')}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update mode');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Appointments Management</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Manage and update status and mode for patient consultations.</p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          {['all', 'pending_assistant', 'requested', 'approved', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                background: filter === st ? '#fff' : 'transparent',
                color: filter === st ? '#0ea5e9' : '#64748b',
                fontWeight: filter === st ? 600 : 500,
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: filter === st ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ background: '#fff', padding: 60, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
          No appointments found matching this filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredAppointments.map((appt) => {
            const pat = appt.patient_info || {};
            const patientName = pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${appt.patient}`);
            const currentStatus = appt.status || 'requested';

            return (
              <div
                key={appt.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                      {patientName}
                    </span>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          currentStatus === 'approved' ? '#dcfce7' :
                          currentStatus === 'completed' ? '#e0f2fe' :
                          currentStatus === 'pending_assistant' ? '#fef3c7' : '#fee2e2',
                        color:
                          currentStatus === 'approved' ? '#166534' :
                          currentStatus === 'completed' ? '#0369a1' :
                          currentStatus === 'pending_assistant' ? '#92400e' : '#991b1b',
                      }}
                    >
                      {currentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 20, marginTop: 8, color: '#64748b', fontSize: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={16} />
                      {appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleString() : 'Not Scheduled'}
                    </div>
                    <div>
                      <strong>Phone:</strong> {pat.phone || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {pat.email || 'N/A'}
                    </div>
                  </div>

                  {appt.patient_notes && (
                    <div style={{ marginTop: 10, background: '#f8fafc', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#334155' }}>
                      <strong>Patient Note:</strong> {appt.patient_notes}
                    </div>
                  )}
                </div>

              {/* Action Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Mode Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Mode:</span>
                  <select
                    value={appt.mode || 'in_person'}
                    onChange={(e) => handleModeUpdate(appt.id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#fff',
                      color: '#0f172a',
                    }}
                  >
                    <option value="in_person">In Person</option>
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                {/* Status action buttons */}
                {currentStatus !== 'approved' && currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate(appt.id, 'approved')}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
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
                    <Check size={16} /> Approve
                  </button>
                )}

                {currentStatus === 'approved' && (
                  <button
                    onClick={() => handleStatusUpdate(appt.id, 'completed')}
                    style={{
                      background: '#0ea5e9',
                      color: '#fff',
                      border: 'none',
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
                    <CheckCircle size={16} /> Mark Completed
                  </button>
                )}

                {currentStatus !== 'cancelled' && currentStatus !== 'completed' && (
                  <button
                    onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
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
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
 );
}