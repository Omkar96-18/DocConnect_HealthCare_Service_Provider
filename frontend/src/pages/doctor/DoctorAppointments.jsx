import React, { useEffect, useState } from 'react';
import { getAppointments, updateAppointment } from '../../api/appointments';
import { Calendar, Check, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const C = { ink: '#101820', blue: '#1769D2', orange: '#F07838', muted: '#6E7882', border: '#DCE2E7', paper: '#FFFFFF', soft: '#F6F8FA' };
const mono = '"IBM Plex Mono", monospace';
const statuses = {
  requested: ['Requested', '#B66A12', '#FFF7E8', '#F2D3A2'],
  pending_assistant: ['Pending Assistant', '#B66A12', '#FFF7E8', '#F2D3A2'],
  approved: ['Approved', '#1769D2', '#EEF5FF', '#B9D3F5'],
  completed: ['Completed', '#1769D2', '#EEF5FF', '#B9D3F5'],
  cancelled: ['Cancelled', '#6E7882', '#F4F6F8', '#DCE2E7'],
  rejected: ['Rejected', '#B42318', '#FFF1F0', '#F4C7C3'],
};
const baseButton = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 11px', borderRadius: 2, fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}` };

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAppointments();
      setAppointments(Array.isArray(res.data) ? res.data : res.data?.results ?? []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingId(id);
      await updateAppointment(id, { status });
      toast.success(`Appointment marked as ${status}`);
      await fetchAppointments();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleModeUpdate = async (id, mode) => {
    try {
      setUpdatingId(id);
      await updateAppointment(id, { mode });
      toast.success(`Consultation mode set to ${mode.replace('_', ' ')}`);
      await fetchAppointments();
    } catch {
      toast.error('Failed to update mode');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = appointments.filter((a) => filter === 'all' || a.status === filter);
  const filters = [
    ['all', 'All'], ['pending_assistant', 'Pending Review'], ['requested', 'Requested'],
    ['approved', 'Approved'], ['completed', 'Completed'], ['cancelled', 'Cancelled'],
  ];
  const eyebrow = { display: 'flex', alignItems: 'center', gap: 9, color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 10 };
  const field = { padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 2, background: C.paper, color: C.ink, fontFamily: mono, fontSize: 10, outlineColor: C.blue };

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', color: C.ink, fontFamily: mono }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 23, paddingBottom: 18, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={eyebrow}><span style={{ width: 20, height: 2, background: C.orange }} /> DOCTOR PORTAL / CARE MANAGEMENT</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>Appointments Management<span style={{ color: C.orange }}>.</span></h1>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, margin: '7px 0 0' }}>Manage appointment status and consultation mode for your patients.</p>
        </div>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em' }}>TOTAL RECORDS / <strong style={{ color: C.ink }}>{appointments.length}</strong></div>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        {filters.map(([value, label]) => {
          const active = filter === value;
          const count = value === 'all' ? appointments.length : appointments.filter((a) => a.status === value).length;
          return <button key={value} type="button" aria-pressed={active} onClick={() => setFilter(value)} style={{ ...baseButton, padding: '8px 10px', borderColor: active ? C.blue : C.border, background: active ? '#EEF5FF' : C.paper, color: active ? C.blue : C.muted }}>{label}<span style={{ fontSize: 9, opacity: 0.8 }}>{count}</span></button>;
        })}
      </div>

      {loading ? (
        <div role="status" style={{ border: `1px solid ${C.border}`, background: C.paper, padding: 42, textAlign: 'center', color: C.muted, fontSize: 11 }}>Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div style={{ border: `1px solid ${C.border}`, background: C.paper, padding: '50px 22px', textAlign: 'center', color: C.muted }}>
          <Calendar size={28} color={C.border} /><h2 style={{ fontSize: 14, color: C.ink, margin: '12px 0 6px' }}>No appointments found</h2><p style={{ fontSize: 11, margin: 0 }}>No appointments match the selected filter.</p>
        </div>
      ) : (
        <section style={{ display: 'grid', gap: 12 }}>
          {filtered.map((a) => {
            const p = a.patient_info || {};
            const name = p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : (p.username || `Patient #${a.patient}`);
            const status = a.status || 'requested';
            const badge = statuses[status] || [status.replaceAll('_', ' '), C.muted, C.soft, C.border];
            const updating = updatingId === a.id;
            return (
              <article key={a.id} style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 2, padding: '18px 19px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
                <div style={{ flex: '1 1 360px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, overflowWrap: 'anywhere' }}>{name}</h2>
                    <span style={{ padding: '4px 7px', border: `1px solid ${badge[3]}`, background: badge[2], color: badge[1], fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{badge[0]}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px 18px', marginTop: 12, color: C.muted, fontSize: 10, flexWrap: 'wrap', lineHeight: 1.8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Calendar size={13} color={C.blue} />{a.scheduled_at ? new Date(a.scheduled_at).toLocaleString() : 'Not Scheduled'}</span>
                    <span><strong style={{ color: C.ink }}>PHONE / </strong>{p.phone || 'N/A'}</span>
                    <span><strong style={{ color: C.ink }}>EMAIL / </strong>{p.email || 'N/A'}</span>
                  </div>
                  {a.patient_notes && <div style={{ marginTop: 12, padding: '9px 11px', borderLeft: `2px solid ${C.orange}`, background: C.soft, color: C.muted, fontSize: 11, lineHeight: 1.7, overflowWrap: 'anywhere' }}><strong style={{ color: C.ink }}>PATIENT NOTE / </strong>{a.patient_notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.muted, fontSize: 10 }}>MODE
                    <select value={a.mode || 'in_person'} onChange={(e) => handleModeUpdate(a.id, e.target.value)} disabled={updating} style={{ ...field, cursor: updating ? 'wait' : 'pointer' }}>
                      <option value="in_person">In Person</option><option value="video">Video Call</option><option value="phone">Phone Call</option>
                    </select>
                  </label>
                  {status !== 'approved' && status !== 'completed' && status !== 'cancelled' && <button type="button" disabled={updating} onClick={() => handleStatusUpdate(a.id, 'approved')} style={{ ...baseButton, borderColor: C.blue, background: C.blue, color: C.paper, opacity: updating ? 0.6 : 1 }}><Check size={13} />Approve</button>}
                  {status === 'approved' && <button type="button" disabled={updating} onClick={() => handleStatusUpdate(a.id, 'completed')} style={{ ...baseButton, borderColor: C.blue, background: '#EEF5FF', color: C.blue, opacity: updating ? 0.6 : 1 }}><CheckCircle size={13} />Mark Completed</button>}
                  {status !== 'cancelled' && status !== 'completed' && <button type="button" disabled={updating} onClick={() => handleStatusUpdate(a.id, 'cancelled')} style={{ ...baseButton, borderColor: '#F4C7C3', background: C.paper, color: '#B42318', opacity: updating ? 0.6 : 1 }}><X size={13} />Reject</button>}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
