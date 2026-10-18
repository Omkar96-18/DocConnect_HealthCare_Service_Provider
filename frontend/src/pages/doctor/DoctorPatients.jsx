import React, { useEffect, useState } from 'react';
import { getPatients, grantAssistantPermission, revokeAssistantPermission } from '../../api/doctors';
import { Users, ShieldCheck, ShieldAlert, MessageCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function DoctorPatients() {
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assistantPermitted, setAssistantPermitted] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccessList();
  }, []);

  const fetchAccessList = async () => {
    try {
      setLoading(true);
      const res = await getPatients();
      const list = res.data || [];
      setAccessList(list);
      if (list.length > 0) {
        setAssistantPermitted(list[0].assistant_permission_granted);
      }
    } catch (err) {
      toast.error('Failed to load patient access list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssistantPermission = async (grant) => {
    try {
      if (grant) {
        await grantAssistantPermission();
        toast.success('Permission granted: Assistant can now approve patients for you.');
        setAssistantPermitted(true);
      } else {
        await revokeAssistantPermission();
        toast.success('Permission revoked: Assistant cannot approve patients without your direct consent.');
        setAssistantPermitted(false);
      }
      fetchAccessList();
    } catch (err) {
      toast.error('Failed to update assistant permission');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Consulting Patients</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>
            Patients who have requested or received approval to consult with you.
          </p>
        </div>

        {/* Doctor to Assistant Permission Control Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {assistantPermitted ? <ShieldCheck size={20} color="#16a34a" /> : <ShieldAlert size={20} color="#dc2626" />}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                Assistant Authority: {assistantPermitted ? 'Enabled' : 'Disabled'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {assistantPermitted ? 'Assistant can approve consultation requests' : 'Assistant approval locked'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleToggleAssistantPermission(!assistantPermitted)}
            style={{
              background: assistantPermitted ? '#fee2e2' : '#dcfce7',
              color: assistantPermitted ? '#991b1b' : '#166534',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {assistantPermitted ? 'Revoke Authority' : 'Grant Authority'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading patients...</div>
      ) : accessList.length === 0 ? (
        <div style={{ background: '#fff', padding: 60, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
          No patient access records found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {accessList.map((item) => {
            const patient = item.patient_info || (typeof item.patient === 'object' ? item.patient : {});
            const isApproved = item.status === 'approved';

            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                        {patient?.first_name ? `${patient.first_name} ${patient.last_name}` : patient?.username}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        {patient?.email || 'No email provided'}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: isApproved ? '#dcfce7' : '#fef3c7',
                        color: isApproved ? '#166534' : '#92400e',
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginTop: 16, background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#64748b' }}>Phone:</span>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{patient?.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#64748b' }}>Messaging Access:</span>
                      <span style={{ fontWeight: 600, color: item.can_message ? '#16a34a' : '#d97706' }}>
                        {item.can_message ? 'Unlocked' : 'Locked (Pending Approval)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Requested On:</span>
                      <span style={{ color: '#1e293b' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    disabled={!item.can_message}
                    onClick={() => navigate('/doctor/messages')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: item.can_message ? '#0ea5e9' : '#e2e8f0',
                      color: item.can_message ? '#fff' : '#94a3b8',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: item.can_message ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <MessageCircle size={16} /> Chat
                  </button>
                  <button
                    onClick={() => navigate('/doctor/prescriptions')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: '#fff',
                      color: '#0ea5e9',
                      border: '1px solid #0ea5e9',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <FileText size={16} /> Prescribe
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
