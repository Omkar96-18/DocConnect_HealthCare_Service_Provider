import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAccessList } from '../../api/doctors';
import { getAppointments } from '../../api/appointments';
import { getPrescriptions } from '../../api/prescriptions';
import {
  CheckSquare,
  Calendar,
  FileText,
  UserCheck,
  Stethoscope,
  AlertCircle,
  Users,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  LoaderCircle,
  ClipboardCheck,
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

function MetricCard({ label, value, detail, icon: Icon, accent, tint, href, linkText }) {
  return (
    <section style={{ border: `1px solid ${C.border}`, background: C.paper, padding: '18px 19px', position: 'relative', minWidth: 0 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 39, height: 3, background: accent }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.075em', textTransform: 'uppercase', color: C.muted, lineHeight: 1.5 }}>{label}</span>
        <span style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', color: accent, background: tint, flexShrink: 0 }}><Icon size={17} strokeWidth={1.8} /></span>
      </div>
      <div style={{ marginTop: 15, fontSize: 33, lineHeight: 1, letterSpacing: '-.055em', fontWeight: 700, color: C.ink }}>{value}</div>
      <p style={{ minHeight: 32, margin: '10px 0 0', fontSize: 11, lineHeight: 1.55, color: C.muted }}>{detail}</p>
      {href && <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7, color: C.blue, textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>{linkText} <ArrowUpRight size={13} /></a>}
    </section>
  );
}

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
      setAccessList(Array.isArray(accRes.data) ? accRes.data : accRes.data?.results || []);
      setAppointments(Array.isArray(appRes.data) ? appRes.data : appRes.data?.results || []);
      setPrescriptions(Array.isArray(rxRes.data) ? rxRes.data : rxRes.data?.results || []);
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

  if (loading) {
    return (
      <div style={{ maxWidth: 1240, margin: '0 auto', fontFamily: body, color: C.ink }}>
        <div style={{ height: 3, width: 54, background: C.orange, marginBottom: 24 }} />
        <div style={{ border: `1px solid ${C.border}`, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <LoaderCircle size={26} color={C.blue} style={{ animation: 'dc-assistant-spin 1s linear infinite' }} />
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.12em', color: C.muted }}>LOADING ASSISTANT WORKSPACE…</span>
          <style>{`@keyframes dc-assistant-spin { to { transform: rotate(360deg); } }`}</style>
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
            Assistant control desk<span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ color: C.muted, margin: '11px 0 0', maxWidth: 660, fontSize: 14, lineHeight: 1.65 }}>
            Welcome, {profile?.first_name || user?.username || 'Assistant'}. Coordinate patient access, appointment approvals, and prescription validation from one place.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 11px', border: `1px solid ${C.border}`, background: C.paper }}>
          <ClipboardCheck size={15} color={C.blue} />
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.05em', color: C.muted }}>CLINICAL OPERATIONS</span>
        </div>
      </header>

      <section style={{ border: `1px solid ${assignedDoctors.length > 0 ? '#CDE8D8' : '#F0DCC5'}`, background: assignedDoctors.length > 0 ? '#F5FBF7' : '#FFFAF3', padding: '18px 20px', marginBottom: 23, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', background: assignedDoctors.length > 0 ? C.greenSoft : C.orangeSoft, color: assignedDoctors.length > 0 ? C.green : C.amber }}>
          <Stethoscope size={21} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 14, letterSpacing: '-.02em' }}>{assignedDoctors.length > 0 ? `Assigned doctors (${assignedDoctors.length})` : 'No doctor assigned yet'}</h2>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.05em', padding: '4px 7px', background: assignedDoctors.length > 0 ? C.greenSoft : C.orangeSoft, color: assignedDoctors.length > 0 ? C.green : C.amber }}>
              {assignedDoctors.length > 0 ? 'ASSIGNMENT ACTIVE' : 'AWAITING ASSIGNMENT'}
            </span>
          </div>
          {assignedDoctors.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 7 }}>
                {assignedDoctors.map((doctor, index) => (
                  <span key={doctor.id || doctor.name || index} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.paper, border: `1px solid #CDE8D8`, padding: '6px 9px', fontSize: 11, fontWeight: 600, color: C.ink }}>
                    <Stethoscope size={12} color={C.green} />
                    Dr. {doctor.name}{doctor.specialization ? ` · ${doctor.specialization}` : ''}
                  </span>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>Coordinate patient requests, appointment approvals, and prescription barcode verification for your assigned doctors.</p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: C.amber, lineHeight: 1.6 }}>Your queue will populate after a doctor assigns you as their assistant.</p>
          )}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 13, marginBottom: 24 }}>
        <MetricCard label="Patient access requests" value={pendingApprovals.length} detail="Consultation requests awaiting review" icon={UserCheck} accent={C.orange} tint={C.orangeSoft} href="/assistant/approvals" linkText="Review access requests" />
        <MetricCard label="Appointments awaiting review" value={pendingAppointments.length} detail="Bookings pending assistant confirmation" icon={Calendar} accent={C.blue} tint={C.blueSoft} href="/assistant/approvals" linkText="Review schedule" />
        <MetricCard label="Prescriptions to validate" value={unvalidatedRx.length} detail="Prescriptions awaiting barcode verification" icon={FileText} accent={C.green} tint={C.greenSoft} href="/assistant/prescriptions" linkText="Validate prescriptions" />
      </div>

      <section style={{ border: `1px solid ${C.border}`, background: C.paper }}>
        <div style={{ padding: '17px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 33, height: 33, display: 'grid', placeItems: 'center', background: C.blueSoft, color: C.blue }}><Users size={16} /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 14, letterSpacing: '-.02em' }}>Recent patient consultation requests</h2>
              <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 11 }}>Patients waiting for access review</p>
            </div>
          </div>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, padding: '4px 7px', border: `1px solid ${C.border}` }}>{pendingApprovals.length} PENDING</span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div style={{ padding: '42px 20px', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 13px', width: 43, height: 43, display: 'grid', placeItems: 'center', background: C.greenSoft, color: C.green }}><CheckSquare size={20} /></div>
            <h3 style={{ margin: '0 0 6px', fontSize: 14 }}>No pending patient requests</h3>
            <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>New consultation access requests will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12, minWidth: 720 }}>
              <thead>
                <tr style={{ background: '#FBFCFD', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  <th style={{ padding: '13px 18px', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: '13px 15px', fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: '13px 15px', fontWeight: 600 }}>Doctor permission</th>
                  <th style={{ padding: '13px 15px', fontWeight: 600 }}>Requested</th>
                  <th style={{ padding: '13px 18px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((req) => {
                  const patient = req.patient_info || {};
                  const patientName = patient.first_name
                    ? `${patient.first_name} ${patient.last_name || ''}`.trim()
                    : patient.username || (req.patient ? `Patient #${req.patient}` : 'Patient');
                  const permitted = req.assistant_permission_granted;
                  return (
                    <tr key={req.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '14px 18px', minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 32, height: 32, flexShrink: 0, display: 'grid', placeItems: 'center', background: C.soft, border: `1px solid ${C.border}`, color: C.blue, fontWeight: 700 }}>
                            {(patientName || 'P').slice(0, 1).toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 700, color: C.ink }}>{patientName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 15px', color: C.muted, whiteSpace: 'nowrap' }}>{patient.phone || '—'}</td>
                      <td style={{ padding: '14px 15px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 7px', background: permitted ? C.greenSoft : C.orangeSoft, color: permitted ? C.green : C.amber, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {permitted ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                          {permitted ? 'Permission granted' : 'Awaiting consent'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 15px', color: C.muted, fontFamily: mono, fontSize: 10, whiteSpace: 'nowrap' }}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <a href="/assistant/approvals" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.blue, color: '#fff', padding: '8px 11px', fontFamily: mono, fontSize: 10, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          Review <ArrowUpRight size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '11px 18px', borderTop: `1px solid ${C.border}`, background: C.soft, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={14} color={C.blue} />
          <span style={{ fontSize: 10, color: C.muted }}>Patient access decisions remain subject to the assigned doctor's permission settings.</span>
        </div>
      </section>

      <style>{`@keyframes dc-assistant-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
