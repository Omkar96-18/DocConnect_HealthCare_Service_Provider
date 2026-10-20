import React, { useEffect, useState } from 'react';
import { getPatients, grantAssistantPermission, revokeAssistantPermission } from '../../api/doctors';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  FileText,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  CalendarDays,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const colors = {
  paper: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  soft: '#F5F8FA',
  blueSoft: '#EEF5FD',
  green: '#16805D',
  greenSoft: '#EAF6F0',
  amber: '#9A6200',
  amberSoft: '#FFF5E5',
  red: '#B83B36',
  redSoft: '#FFF0EF',
};

const mono = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";
const ui = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const buttonBase = {
  minHeight: 40,
  borderRadius: 5,
  padding: '10px 13px',
  fontFamily: mono,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.025em',
  textTransform: 'uppercase',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: 'pointer',
  transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
};

function statusStyle(status) {
  if (status === 'approved') {
    return { background: colors.greenSoft, color: colors.green, border: `1px solid #C9E9DA` };
  }
  if (status === 'rejected') {
    return { background: colors.redSoft, color: colors.red, border: `1px solid #F2D0CE` };
  }
  return { background: colors.amberSoft, color: colors.amber, border: `1px solid #F0DFBD` };
}

function displayName(patient) {
  if (!patient) return 'Patient';
  const fullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim();
  return fullName || patient.username || 'Patient';
}

export default function DoctorPatients() {
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assistantPermitted, setAssistantPermitted] = useState(true);
  const [permissionBusy, setPermissionBusy] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccessList();
  }, []);

  const fetchAccessList = async () => {
    try {
      setLoading(true);
      const res = await getPatients();
      const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      setAccessList(list);
      if (list.length > 0) {
        setAssistantPermitted(Boolean(list[0].assistant_permission_granted));
      }
    } catch (err) {
      toast.error('Failed to load patient access list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssistantPermission = async (grant) => {
    if (permissionBusy) return;
    setPermissionBusy(true);
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
      await fetchAccessList();
    } catch (err) {
      toast.error('Failed to update assistant permission');
    } finally {
      setPermissionBusy(false);
    }
  };

  const filteredPatients = accessList.filter((item) => {
    const patient = item.patient_info || (typeof item.patient === 'object' ? item.patient : {});
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return [
      displayName(patient),
      patient?.email,
      patient?.phone,
      item?.status,
    ].some((value) => String(value || '').toLowerCase().includes(search));
  });

  const approvedCount = accessList.filter((item) => item.status === 'approved').length;
  const pendingCount = accessList.filter((item) => item.status === 'pending').length;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 0 32px', color: colors.ink, fontFamily: ui }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        .dp-patient-card { transition: border-color 150ms ease, transform 150ms ease; }
        .dp-patient-card:hover { border-color: #AABED0 !important; transform: translateY(-1px); }
        .dp-action:focus-visible, .dp-search:focus-visible { outline: 2px solid ${colors.blue}; outline-offset: 2px; }
        .dp-action:disabled { opacity: .55; cursor: not-allowed !important; }
        @media (max-width: 900px) {
          .dp-header { align-items: flex-start !important; flex-direction: column !important; }
          .dp-permission { width: 100%; box-sizing: border-box; flex-wrap: wrap; }
          .dp-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .dp-patient-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)) !important; }
        }
        @media (max-width: 560px) {
          .dp-stats { gap: 8px !important; }
          .dp-stat { padding: 13px !important; }
          .dp-patient-card-inner { padding: 16px !important; }
          .dp-permission { align-items: flex-start !important; }
        }
      `}</style>

      <div className="dp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <span style={{ width: 22, height: 3, background: colors.orange, display: 'inline-block' }} />
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', color: colors.muted, textTransform: 'uppercase' }}>Doctor workspace / patient access</span>
          </div>
          <h1 style={{ fontSize: 'clamp(25px, 3vw, 32px)', lineHeight: 1.2, letterSpacing: '-0.04em', fontWeight: 750, margin: 0, color: colors.ink }}>
            Consulting Patients<span style={{ color: colors.orange }}>.</span>
          </h1>
          <p style={{ margin: '9px 0 0', maxWidth: 600, fontSize: 14, lineHeight: 1.6, color: colors.muted }}>
            Manage consultation access, review patient requests, and control assistant approval authority.
          </p>
        </div>

        <div className="dp-permission" style={{ display: 'flex', alignItems: 'center', gap: 16, background: colors.paper, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${assistantPermitted ? colors.blue : colors.orange}`, padding: '14px 16px', minWidth: 330 }}>
          <div style={{ width: 38, height: 38, flex: '0 0 auto', display: 'grid', placeItems: 'center', background: assistantPermitted ? colors.blueSoft : colors.amberSoft, color: assistantPermitted ? colors.blue : colors.amber }}>
            {assistantPermitted ? <ShieldCheck size={19} /> : <ShieldAlert size={19} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Assistant authority</div>
            <div style={{ fontSize: 13, fontWeight: 750, color: colors.ink, marginBottom: 3 }}>{assistantPermitted ? 'Enabled' : 'Disabled'}</div>
            <div style={{ fontSize: 11, lineHeight: 1.45, color: colors.muted }}>{assistantPermitted ? 'Assistant can approve consultation requests' : 'Assistant approval is locked'}</div>
          </div>
          <button
            className="dp-action"
            type="button"
            disabled={permissionBusy}
            onClick={() => handleToggleAssistantPermission(!assistantPermitted)}
            style={{
              ...buttonBase,
              minHeight: 36,
              padding: '8px 10px',
              background: assistantPermitted ? colors.paper : colors.blue,
              color: assistantPermitted ? colors.red : '#FFFFFF',
              border: `1px solid ${assistantPermitted ? '#E6C7C4' : colors.blue}`,
              whiteSpace: 'nowrap',
            }}
          >
            {permissionBusy ? 'Updating…' : assistantPermitted ? 'Revoke' : 'Grant'}
          </button>
        </div>
      </div>

      <div className="dp-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total access records', value: accessList.length, icon: <Users size={17} />, accent: colors.blue },
          { label: 'Approved patients', value: approvedCount, icon: <CheckCircle size={17} />, accent: colors.green },
          { label: 'Pending requests', value: pendingCount, icon: <Clock size={17} />, accent: colors.orange },
        ].map((stat) => (
          <div className="dp-stat" key={stat.label} style={{ background: colors.paper, border: `1px solid ${colors.border}`, padding: '17px 19px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: 10, fontWeight: 600, color: colors.muted }}>{stat.label}</span>
              <span style={{ color: stat.accent }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: 29, lineHeight: 1.2, fontWeight: 750, letterSpacing: '-0.04em', marginTop: 12, color: colors.ink }}>{stat.value}</div>
            <div style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: 42, background: stat.accent }} />
          </div>
        ))}
      </div>

      <div style={{ background: colors.paper, border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '17px 20px', borderBottom: `1px solid ${colors.border}`, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 750, color: colors.ink }}>Patient access directory</h2>
            <p style={{ margin: '5px 0 0', fontSize: 12, color: colors.muted }}>Review status and open the appropriate care workflow.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, border: `1px solid ${colors.border}`, padding: '9px 11px', minWidth: 220, background: colors.paper }}>
            <Search size={15} color={colors.muted} />
            <input
              className="dp-search"
              aria-label="Search patients"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients..."
              style={{ width: '100%', border: 0, outline: 0, background: 'transparent', fontFamily: ui, fontSize: 12, color: colors.ink }}
            />
          </label>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: colors.muted }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span style={{ width: 7, height: 7, background: colors.blue, display: 'inline-block', borderRadius: '50%' }} />
              Loading patient records…
            </div>
          </div>
        ) : accessList.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, margin: '0 auto 15px', display: 'grid', placeItems: 'center', background: colors.soft, color: colors.muted, border: `1px solid ${colors.border}` }}>
              <Users size={23} />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, color: colors.ink }}>No patient access records</h3>
            <p style={{ margin: '7px 0 0', fontSize: 13, color: colors.muted }}>Patient consultation requests will appear here.</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ padding: '44px 20px', textAlign: 'center', color: colors.muted, fontSize: 13 }}>No patients match “{searchTerm}”.</div>
        ) : (
          <div className="dp-patient-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0 }}>
            {filteredPatients.map((item) => {
              const patient = item.patient_info || (typeof item.patient === 'object' ? item.patient : {});
              const isApproved = item.status === 'approved';
              const name = displayName(patient);
              const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
              const requestDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : '—';

              return (
                <article className="dp-patient-card" key={item.id} style={{ borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, minWidth: 0, background: colors.paper }}>
                  <div className="dp-patient-card-inner" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 43, height: 43, flex: '0 0 auto', display: 'grid', placeItems: 'center', background: colors.blueSoft, color: colors.blue, border: `1px solid #D5E5F9`, fontFamily: mono, fontWeight: 700, fontSize: 12 }}>
                          {initials || 'P'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ margin: '1px 0 5px', fontSize: 15, lineHeight: 1.35, fontWeight: 750, color: colors.ink, overflowWrap: 'anywhere' }}>{name}</h3>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: colors.muted, overflowWrap: 'anywhere' }}>
                            <Mail size={13} style={{ flex: '0 0 auto', marginTop: 2 }} />
                            <span>{patient?.email || 'No email provided'}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ ...statusStyle(item.status), flex: '0 0 auto', padding: '4px 7px', fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {item.status || 'unknown'}
                      </span>
                    </div>

                    <div style={{ marginTop: 19, padding: '13px 14px', background: colors.soft, border: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, marginBottom: 11 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: colors.muted }}><Phone size={13} /> Phone</span>
                        <span style={{ fontSize: 12, color: colors.ink, fontWeight: 600, textAlign: 'right', overflowWrap: 'anywhere' }}>{patient?.phone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, marginBottom: 11 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: colors.muted }}><MessageCircle size={13} /> Messaging access</span>
                        <span style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: item.can_message ? colors.green : colors.amber, textAlign: 'right' }}>{item.can_message ? 'UNLOCKED' : 'LOCKED'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: colors.muted }}><CalendarDays size={13} /> Requested on</span>
                        <span style={{ fontSize: 12, color: colors.ink, textAlign: 'right' }}>{requestDate}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 9, marginTop: 17, paddingTop: 2 }}>
                      <button
                        className="dp-action"
                        type="button"
                        disabled={!item.can_message}
                        onClick={() => navigate('/doctor/messages')}
                        style={{ ...buttonBase, flex: 1, background: item.can_message ? colors.blue : '#EEF0F2', color: item.can_message ? '#FFFFFF' : '#929BA3', border: `1px solid ${item.can_message ? colors.blue : colors.border}` }}
                      >
                        <MessageCircle size={14} /> Chat <ArrowUpRight size={13} />
                      </button>
                      <button
                        className="dp-action"
                        type="button"
                        onClick={() => navigate('/doctor/prescriptions')}
                        style={{ ...buttonBase, flex: 1, background: colors.paper, color: colors.blue, border: `1px solid #B9D1F0` }}
                      >
                        <FileText size={14} /> Prescribe <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: colors.muted, fontSize: 11 }}>
        <ShieldCheck size={14} color={colors.blue} />
        <span>Patient access and assistant authority are managed according to your consultation permissions.</span>
      </div>
    </div>
  );
}
