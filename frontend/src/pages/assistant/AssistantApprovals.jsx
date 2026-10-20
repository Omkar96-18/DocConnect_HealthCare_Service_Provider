import React, { useEffect, useState } from 'react';
import { getAccessList, approveAccess } from '../../api/doctors';
import { getAppointments, approveAppointment, rejectAppointment } from '../../api/appointments';
import {
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  User,
  Clock,
  Users,
  Stethoscope,
  ClipboardCheck,
  LoaderCircle,
  MapPin,
  Phone,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const C = {
  paper: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  soft: '#F5F8FA',
  blueSoft: '#EEF5FF',
  orangeSoft: '#FFF3EB',
  green: '#16845B',
  greenSoft: '#ECF8F1',
  red: '#C83D42',
  redSoft: '#FFF1F1',
  amber: '#A96A10',
  amberSoft: '#FFF6E8',
};

const mono = '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';
const body = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: '10px 13px',
  fontFamily: mono,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '.035em',
  borderRadius: 4,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

function EmptyQueue({ title, description }) {
  return (
    <div style={{ padding: '38px 18px', textAlign: 'center' }}>
      <div style={{ width: 43, height: 43, margin: '0 auto 13px', display: 'grid', placeItems: 'center', background: C.greenSoft, color: C.green }}>
        <Check size={20} />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 14, color: C.ink }}>{title}</h3>
      <p style={{ margin: 0, color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function QueueCount({ children, tone = 'blue' }) {
  const styles = {
    blue: { background: C.blueSoft, color: C.blue },
    orange: { background: C.orangeSoft, color: C.amber },
    green: { background: C.greenSoft, color: C.green },
  };
  return <span style={{ ...styles[tone], fontFamily: mono, fontSize: 10, fontWeight: 600, padding: '4px 7px' }}>{children}</span>;
}

export default function AssistantApprovals() {
  const [accessRequests, setAccessRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, appRes] = await Promise.all([getAccessList(), getAppointments()]);
      setAccessRequests(Array.isArray(accRes.data) ? accRes.data : accRes.data?.results || []);
      setAppointments(Array.isArray(appRes.data) ? appRes.data : appRes.data?.results || []);
    } catch (err) {
      toast.error('Failed to load approval queues');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDecision = async (accessId, decision) => {
    const key = `access-${accessId}`;
    try {
      setWorking((current) => ({ ...current, [key]: true }));
      await approveAccess(accessId, decision);
      toast.success(`Patient request ${decision === 'approve' ? 'approved' : 'rejected'}`);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${decision} request`);
    } finally {
      setWorking((current) => ({ ...current, [key]: false }));
    }
  };

  const handleApproveAppointment = async (apptId) => {
    const key = `appointment-${apptId}`;
    try {
      setWorking((current) => ({ ...current, [key]: true }));
      await approveAppointment(apptId);
      toast.success('Appointment approved successfully!');
      await fetchData();
    } catch (err) {
      toast.error('Failed to approve appointment');
    } finally {
      setWorking((current) => ({ ...current, [key]: false }));
    }
  };

  const handleRejectAppointment = async (apptId) => {
    const key = `appointment-${apptId}`;
    try {
      setWorking((current) => ({ ...current, [key]: true }));
      await rejectAppointment(apptId);
      toast.success('Appointment rejected');
      await fetchData();
    } catch (err) {
      toast.error('Failed to reject appointment');
    } finally {
      setWorking((current) => ({ ...current, [key]: false }));
    }
  };

  const pendingAccess = accessRequests.filter((a) => a.status === 'pending');
  const pendingAppointments = appointments.filter((a) => a.status === 'pending_assistant');

  const getPatientName = (patientInfo, patientId) => {
    const patient = patientInfo || {};
    return patient.first_name
      ? `${patient.first_name} ${patient.last_name || ''}`.trim()
      : patient.username || `Patient #${patientId}`;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1240, margin: '0 auto', fontFamily: body, color: C.ink }}>
        <div style={{ height: 3, width: 54, background: C.orange, marginBottom: 24 }} />
        <div style={{ border: `1px solid ${C.border}`, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <LoaderCircle size={26} color={C.blue} style={{ animation: 'dc-approval-spin 1s linear infinite' }} />
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.12em', color: C.muted }}>LOADING APPROVAL QUEUES…</span>
          <style>{`@keyframes dc-approval-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 0 36px', color: C.ink, fontFamily: body }}>
      <div style={{ height: 3, width: 54, background: C.orange, marginBottom: 24 }} />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 25 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, background: C.blue, display: 'inline-block' }} />
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.13em', textTransform: 'uppercase', color: C.muted }}>DocConnect / Assistant workspace</span>
          </div>
          <h1 style={{ fontSize: 'clamp(27px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '-.045em', fontWeight: 700, margin: 0 }}>
            Clinical approvals<span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ color: C.muted, margin: '11px 0 0', maxWidth: 650, fontSize: 14, lineHeight: 1.65 }}>
            Review patient consultation access and confirm appointment requests on behalf of your assigned doctor.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 11px', border: `1px solid ${C.border}`, background: C.paper }}>
          <ShieldCheck size={15} color={C.blue} />
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.05em', color: C.muted }}>REVIEW QUEUE</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12, marginBottom: 23 }}>
        <div style={{ border: `1px solid ${C.border}`, background: C.paper, padding: '16px 18px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 3, background: C.blue }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.07em', color: C.muted }}>PATIENT ACCESS</span><Users size={17} color={C.blue} /></div>
          <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, letterSpacing: '-.05em' }}>{pendingAccess.length}</div>
          <div style={{ marginTop: 5, fontSize: 11, color: C.muted }}>Consultation requests awaiting review</div>
        </div>
        <div style={{ border: `1px solid ${C.border}`, background: C.paper, padding: '16px 18px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 3, background: C.orange }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.07em', color: C.muted }}>APPOINTMENTS</span><Calendar size={17} color={C.orange} /></div>
          <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, letterSpacing: '-.05em' }}>{pendingAppointments.length}</div>
          <div style={{ marginTop: 5, fontSize: 11, color: C.muted }}>Bookings awaiting confirmation</div>
        </div>
        <div style={{ border: `1px solid ${C.border}`, background: C.paper, padding: '16px 18px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 3, background: C.green }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.07em', color: C.muted }}>TOTAL PENDING</span><Clock size={17} color={C.green} /></div>
          <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, letterSpacing: '-.05em' }}>{pendingAccess.length + pendingAppointments.length}</div>
          <div style={{ marginTop: 5, fontSize: 11, color: C.muted }}>Items requiring assistant action</div>
        </div>
      </div>

      <section style={{ border: `1px solid ${C.border}`, background: C.paper, marginBottom: 17 }}>
        <div style={{ padding: '17px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: C.blueSoft, color: C.blue }}><ShieldCheck size={17} /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 14, letterSpacing: '-.02em' }}>Patient consultation access</h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>Approving grants access to direct patient–doctor messaging and consultation booking.</p>
            </div>
          </div>
          <QueueCount tone={pendingAccess.length ? 'blue' : 'green'}>{pendingAccess.length} PENDING</QueueCount>
        </div>

        {pendingAccess.length === 0 ? (
          <EmptyQueue title="All consultation requests reviewed" description="There are no pending patient access requests right now." />
        ) : (
          <div>
            {pendingAccess.map((req, index) => {
              const pat = req.patient_info || {};
              const patName = getPatientName(pat, req.patient);
              const isAllowed = req.assistant_permission_granted;
              const busy = working[`access-${req.id}`];
              return (
                <article key={req.id} style={{ padding: '18px 20px', borderBottom: index < pendingAccess.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
                  <div style={{ flex: '1 1 350px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 9 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{patName}</span>
                      <span style={{ background: C.blueSoft, color: C.blue, fontSize: 10, fontWeight: 600, padding: '4px 7px' }}>For {req.doctor_info?.name || 'Assigned Doctor'}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isAllowed ? C.greenSoft : C.redSoft, color: isAllowed ? C.green : C.red, fontSize: 9, fontWeight: 700, padding: '4px 7px' }}>
                        {isAllowed ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                        Doctor permission: {isAllowed ? 'Granted' : 'Revoked'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px 16px', fontSize: 11, color: C.muted }}>
                      <span>{pat.email || 'No email provided'}</span>
                      <span>{pat.phone || 'No phone provided'}</span>
                      <span>Requested {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'date unavailable'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button disabled={!isAllowed || busy} onClick={() => handleAccessDecision(req.id, 'approve')} title={!isAllowed ? 'Doctor has revoked permission to approve' : ''} style={{ ...btnBase, background: isAllowed ? C.green : C.soft, color: isAllowed ? '#fff' : C.muted, border: `1px solid ${isAllowed ? C.green : C.border}`, cursor: !isAllowed || busy ? 'not-allowed' : 'pointer', opacity: busy ? .7 : 1 }}>
                      {busy ? <LoaderCircle size={14} /> : <Check size={14} />} Approve access
                    </button>
                    <button disabled={busy} onClick={() => handleAccessDecision(req.id, 'reject')} style={{ ...btnBase, background: C.paper, color: C.red, border: `1px solid #EBCACA`, cursor: busy ? 'not-allowed' : 'pointer' }}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ border: `1px solid ${C.border}`, background: C.paper }}>
        <div style={{ padding: '17px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: C.orangeSoft, color: C.orange }}><Calendar size={17} /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 14, letterSpacing: '-.02em' }}>Appointment confirmations</h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>Review booking details before confirming or rejecting the request.</p>
            </div>
          </div>
          <QueueCount tone={pendingAppointments.length ? 'orange' : 'green'}>{pendingAppointments.length} PENDING</QueueCount>
        </div>

        {pendingAppointments.length === 0 ? (
          <EmptyQueue title="No appointments awaiting confirmation" description="New bookings requiring assistant review will appear here." />
        ) : (
          <div>
            {pendingAppointments.map((appt, index) => {
              const pat = appt.patient_info || {};
              const patName = getPatientName(pat, appt.patient);
              const busy = working[`appointment-${appt.id}`];
              return (
                <article key={appt.id} style={{ padding: '18px 20px', borderBottom: index < pendingAppointments.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 18 }}>
                  <div style={{ flex: '1 1 350px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{patName}</span>
                      {appt.doctor_info?.name && <span style={{ background: C.blueSoft, color: C.blue, fontSize: 10, fontWeight: 600, padding: '4px 7px' }}>with Dr. {appt.doctor_info.name}</span>}
                      <span style={{ background: C.soft, color: C.muted, border: `1px solid ${C.border}`, padding: '4px 7px', fontFamily: mono, fontSize: 9 }}>
                        {String(appt.mode || 'consultation').replaceAll('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 17px', fontSize: 11, color: C.muted }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Calendar size={13} color={C.blue} /> {appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleString() : 'Schedule not provided'}</span>
                      {pat.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> {pat.phone}</span>}
                    </div>
                    {appt.patient_notes && (
                      <div style={{ marginTop: 12, padding: '10px 12px', borderLeft: `3px solid ${C.orange}`, background: C.soft, color: C.ink, fontSize: 12, lineHeight: 1.6 }}>
                        <span style={{ display: 'block', fontFamily: mono, fontSize: 9, letterSpacing: '.08em', color: C.muted, marginBottom: 4 }}>PATIENT NOTE</span>
                        {appt.patient_notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button disabled={busy} onClick={() => handleApproveAppointment(appt.id)} style={{ ...btnBase, background: C.green, color: '#fff', border: `1px solid ${C.green}`, cursor: busy ? 'wait' : 'pointer', opacity: busy ? .7 : 1 }}>
                      {busy ? <LoaderCircle size={14} /> : <Check size={14} />} Confirm booking
                    </button>
                    <button disabled={busy} onClick={() => handleRejectAppointment(appt.id)} style={{ ...btnBase, background: C.paper, color: C.red, border: `1px solid #EBCACA`, cursor: busy ? 'wait' : 'pointer' }}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 10, lineHeight: 1.5 }}>
        <ShieldCheck size={14} color={C.blue} />
        <span>Access approvals respect the assigned doctor’s permission settings.</span>
      </div>

      <style>{`@keyframes dc-approval-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
