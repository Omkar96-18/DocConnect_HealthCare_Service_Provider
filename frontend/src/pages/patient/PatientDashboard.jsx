import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAppointments,
  createAppointment,
} from '../../api/appointments';
import { getConversations } from '../../api/messages';
import { getPrescriptions } from '../../api/prescriptions';
import { getAccessList } from '../../api/doctors';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  MessageCircle,
  FileText,
  ArrowUpRight,
  Search,
  X,
  Video,
  Phone,
  UserRound,
  AlertCircle,
  Plus,
  Clock3,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  MapPin,
  ChevronRight,
} from 'lucide-react';

const C = {
  lime: '#FFFFFF',
  limeSoft: '#F5F8FC',
  limeInk: '#1769D2',
  paper: '#FFFFFF',
  ink: '#101820',
  muted: '#6E7882',
  line: '#DCE2E7',
  white: '#FFFFFF',
  red: '#B42318',
  blue: '#1769D2',
  orange: '#F07838',
};

const STATUS_STYLES = {
  requested: { bg: '#FFF2E9', color: '#A84B16', label: 'Requested' },
  pending_assistant: { bg: '#FFF2E9', color: '#A84B16', label: 'Awaiting approval' },
  approved: { bg: '#EDF5FF', color: '#1769D2', label: 'Approved' },
  completed: { bg: '#EDF5FF', color: '#1769D2', label: 'Completed' },
  cancelled: { bg: '#F3F5F7', color: '#6E7882', label: 'Cancelled' },
  rejected: { bg: '#FDEBE9', color: '#B42318', label: 'Rejected' },
};

const cardStyle = {
  background: C.white,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  boxShadow: 'none',
};

const primaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9,
  border: 'none',
  borderRadius: 4,
  background: C.blue,
  color: C.white,
  padding: '12px 17px',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'transform 160ms ease, opacity 160ms ease',
};

const secondaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  background: C.white,
  color: C.ink,
  padding: '11px 15px',
  fontSize: 13,
  fontWeight: 750,
  cursor: 'pointer',
  textDecoration: 'none',
};

function getArray(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getLocalDateTimeMinimum() {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localNow.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return 'Date not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusDetails(status) {
  return STATUS_STYLES[status] || {
    bg: '#F0F1ED',
    color: '#65685F',
    label: String(status || 'Unknown').replaceAll('_', ' '),
  };
}

function IconTile({ children, background = C.paper, color = C.ink, size = 44 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 15,
        background,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, note, icon: Icon, tint, link, linkLabel }) {
  const content = (
    <div
      style={{
        ...cardStyle,
        padding: 20,
        minHeight: 154,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 15,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.07em', color: C.muted, textTransform: 'uppercase' }}>
            {label}
          </p>
          <p style={{ margin: '12px 0 0', fontSize: 34, lineHeight: 1, fontWeight: 850, letterSpacing: '-0.045em', color: C.ink }}>
            {value}
          </p>
        </div>
        <IconTile background={tint || C.limeSoft} color={C.ink}>
          <Icon size={20} strokeWidth={2.1} />
        </IconTile>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, lineHeight: 1.45, color: C.muted }}>{note}</span>
        {linkLabel && <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: C.ink, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{linkLabel}<ArrowUpRight size={14} /></span>}
      </div>
    </div>
  );

  return link ? (
    <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  ) : content;
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div style={{ padding: '34px 18px', textAlign: 'center', borderRadius: 18, background: '#FFFFFF', border: `1px dashed ${C.line}` }}>
      <span style={{ width: 54, height: 54, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', borderRadius: 18, background: C.limeSoft, color: C.ink }}>
        <Icon size={24} />
      </span>
      <h3 style={{ margin: '14px 0 5px', fontSize: 16, color: C.ink, fontWeight: 800 }}>{title}</h3>
      <p style={{ maxWidth: 360, margin: '0 auto', fontSize: 13, lineHeight: 1.6, color: C.muted }}>{text}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', marginBottom: 7, color: C.ink, fontSize: 12, fontWeight: 800 }}>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 13px',
  borderRadius: 12,
  border: `1px solid ${C.line}`,
  background: '#FFFFFF',
  color: C.ink,
  fontSize: 13,
  outlineColor: C.blue,
};


const dashboardCss = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

.dc-dashboard, .dc-dashboard * {
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace !important;
  box-sizing: border-box;
}
.dc-dashboard {
  --dc-blue: #1769D2;
  --dc-orange: #F07838;
  --dc-ink: #101820;
  --dc-muted: #6E7882;
  --dc-line: #DCE2E7;
  position: relative;
  isolation: isolate;
  padding: 20px clamp(14px, 2.5vw, 30px) 34px !important;
  background: #FFFFFF;
  color: var(--dc-ink);
  min-height: 100vh;
}
.dc-dashboard:before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(16,24,32,.028) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(16,24,32,.028) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, #000, transparent 78%);
}
.dc-dashboard h1, .dc-dashboard h2, .dc-dashboard h3,
.dc-dashboard p, .dc-dashboard span, .dc-dashboard small,
.dc-dashboard label {
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace !important;
}
.dc-dashboard h1 { font-weight: 500 !important; letter-spacing: -.065em !important; }
.dc-dashboard h2, .dc-dashboard h3 { font-weight: 600 !important; letter-spacing: -.045em !important; }
.dc-dashboard [style*="border-radius"] { border-radius: 4px !important; }
.dc-dashboard [style*="box-shadow"] { box-shadow: none !important; }
.dc-dashboard [style*="border: 1px solid"] { border-color: var(--dc-line) !important; }
.dc-dashboard a { transition: color .16s ease, background .16s ease, border-color .16s ease; }
.dc-dashboard a:hover { color: var(--dc-blue) !important; }
.dc-dashboard button { font-family: 'IBM Plex Mono', monospace !important; transition: background .16s ease, border-color .16s ease, color .16s ease; }
.dc-dashboard button:hover:not(:disabled) { border-color: var(--dc-blue) !important; }
.dc-dashboard button:focus-visible, .dc-dashboard a:focus-visible,
.dc-dashboard input:focus-visible, .dc-dashboard select:focus-visible,
.dc-dashboard textarea:focus-visible {
  outline: 2px solid var(--dc-blue) !important;
  outline-offset: 3px;
}
.dc-dashboard input, .dc-dashboard select, .dc-dashboard textarea {
  border-radius: 4px !important;
  font-family: 'IBM Plex Mono', monospace !important;
}
.dc-dashboard input:focus, .dc-dashboard select:focus, .dc-dashboard textarea:focus {
  border-color: var(--dc-blue) !important;
  outline-color: var(--dc-blue) !important;
}
.dc-dashboard a[style*="background: rgb(16, 24, 32)"],
.dc-dashboard button[style*="background: rgb(16, 24, 32)"] {
  background: var(--dc-ink) !important;
}
.dc-dashboard [style*="background: rgb(237, 245, 255)"] { background: #EDF5FF !important; }
.dc-dashboard article { background: #FFFFFF !important; }
.dc-dashboard .dc-dashboard-label {
  color: var(--dc-muted);
  font-size: 9px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
@media (max-width: 700px) {
  .dc-dashboard { padding: 16px 12px 26px !important; }
  .dc-dashboard:before { background-size: 40px 40px; }
}

/* DocConnect master theme: restrained, precise, and consistent with auth screens. */
.dc-dashboard {
  --dc-blue: #1769D2;
  --dc-orange: #F07838;
  --dc-ink: #101820;
  --dc-muted: #6E7882;
  --dc-line: #DCE2E7;
  background: #fff !important;
  color: var(--dc-ink) !important;
}
.dc-dashboard h1, .dc-dashboard h2, .dc-dashboard h3 {
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace !important;
}
.dc-dashboard h1 { font-size: clamp(24px, 2.8vw, 32px) !important; }
.dc-dashboard p { line-height: 1.6; }
.dc-dashboard [style*="border-radius"] { border-radius: 4px !important; }
.dc-dashboard [style*="box-shadow"] { box-shadow: none !important; }
.dc-dashboard [style*="background: rgb(237, 245, 255)"],
.dc-dashboard [style*="background: rgb(238, 240, 231)"],
.dc-dashboard [style*="background: rgb(242, 237, 224)"] {
  background: #F5F8FC !important;
}
.dc-dashboard [style*="background: rgb(255, 255, 255)"] { background: #fff !important; }
.dc-dashboard [style*="border: 1px solid"] { border-color: var(--dc-line) !important; }
.dc-dashboard button, .dc-dashboard a {
  border-radius: 4px !important;
}
.dc-dashboard button:disabled { opacity: .58; cursor: not-allowed; }
.dc-dashboard button:focus-visible, .dc-dashboard a:focus-visible,
.dc-dashboard input:focus-visible, .dc-dashboard select:focus-visible,
.dc-dashboard textarea:focus-visible {
  outline: 2px solid var(--dc-blue) !important;
  outline-offset: 3px;
}
.dc-dashboard input, .dc-dashboard select, .dc-dashboard textarea {
  border: 1px solid var(--dc-line) !important;
  border-radius: 4px !important;
  background: #fff !important;
}
.dc-dashboard input:focus, .dc-dashboard select:focus, .dc-dashboard textarea:focus {
  border-color: var(--dc-blue) !important;
  box-shadow: 0 0 0 1px var(--dc-blue) !important;
}
.dc-dashboard article { border-radius: 4px !important; }
.dc-dashboard .dc-dashboard-label {
  color: var(--dc-muted);
  font-size: 9px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.dc-dashboard a:hover { color: var(--dc-blue) !important; }
.dc-dashboard button:hover:not(:disabled) { border-color: var(--dc-blue) !important; }
@media (max-width: 700px) {
  .dc-dashboard { padding: 16px 12px 26px !important; }
  .dc-dashboard:before { background-size: 40px 40px; }
}
`;

export default function PatientDashboard() {
  const { user, profile } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBookModal, setShowBookModal] = useState(false);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('in_person');
  const [patientNotes, setPatientNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apptRes, convRes, prescRes, accessRes] = await Promise.all([
        getAppointments(),
        getConversations(),
        getPrescriptions(),
        getAccessList(),
      ]);

      setAppointments(getArray(apptRes));
      setConversations(getArray(convRes));
      setPrescriptions(getArray(prescRes));

      const accesses = getArray(accessRes);
      const approved = accesses.filter((access) => access.status === 'approved');
      setApprovedDoctors(approved);

      if (approved.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(String(approved[0].doctor));
      }
    } catch (error) {
      console.error(error);
      toast.error('Some dashboard information could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // loadData is intentionally only run when the dashboard mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async (event) => {
    event.preventDefault();

    if (!selectedDoctorId) {
      toast.error('Please select a doctor with approved consultation access.');
      return;
    }
    if (!scheduledAt) {
      toast.error('Please pick a date and time for the appointment.');
      return;
    }
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      toast.error('Please select a future date and time.');
      return;
    }

    setBooking(true);
    try {
      await createAppointment({
        doctor: selectedDoctorId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        mode,
        patient_notes: patientNotes,
      });

      toast.success('Appointment requested successfully.');
      setShowBookModal(false);
      setPatientNotes('');
      setScheduledAt('');
      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Failed to book appointment.'
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: 260, display: 'grid', placeItems: 'center' }}>
        <LoadingSpinner fullscreen={false} />
      </div>
    );
  }

  const activeAppointments = appointments.filter((appointment) =>
    ['requested', 'pending_assistant', 'approved'].includes(appointment.status)
  );
  const pendingPrescriptions = prescriptions.filter((prescription) => !prescription.is_validated);
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime())
    .slice(0, 4);
  const firstName = profile?.first_name || user?.first_name || user?.username || 'there';

  return (
    <>
      <style>{dashboardCss}</style>
      <div className="dc-dashboard" style={{ maxWidth: 1240, margin: '0 auto', color: C.ink, fontFamily: 'inherit', padding: '4px 0 32px' }}>
        {/* Page heading */}
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
          <div>
            <p style={{ margin: '0 0 8px', color: C.muted, fontSize: 11, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Patient workspace / Overview
            </p>
            <h1 style={{ margin: 0, color: C.ink, fontSize: 'clamp(25px, 3vw, 34px)', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.045em' }}>
              Good to see you, {firstName}.
            </h1>
            <p style={{ margin: '9px 0 0', color: C.muted, fontSize: 13.5, lineHeight: 1.6, maxWidth: 600 }}>
              Keep track of your consultations, conversations, and prescriptions in one place.
            </p>
          </div>
          <button type="button" onClick={() => setShowBookModal(true)} style={primaryButton}>
            <Plus size={17} /> Request consultation
          </button>
        </header>

        {/* Hero / primary action */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 18,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              borderRadius: 28,
              background: C.lime,
              padding: 'clamp(22px, 3vw, 34px)',
              minHeight: 232,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
              overflow: 'hidden',
            }}
          >
            <div style={{ flex: '1 1 280px', maxWidth: 610 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, background: 'rgba(255,255,255,0.48)', padding: '7px 11px', color: '#1769D2', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <Sparkles size={13} /> Your care, organized
              </div>
              <h2 style={{ margin: '17px 0 9px', color: C.ink, fontSize: 'clamp(25px, 3.4vw, 38px)', lineHeight: 1.04, letterSpacing: '-0.05em', fontWeight: 900, maxWidth: 540 }}>
                Healthcare that feels a little simpler.
              </h2>
              <p style={{ margin: 0, maxWidth: 480, color: '#34414D', fontSize: 13.5, lineHeight: 1.65 }}>
                Find the right specialist, stay connected with your doctor, and keep your medical updates close at hand.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
                <Link to="/patient/find-doctors" style={primaryButton}>
                  <Search size={16} /> Explore doctors <ArrowUpRight size={15} />
                </Link>
                <button type="button" onClick={() => setShowBookModal(true)} style={{ ...secondaryButton, borderColor: 'rgba(23,25,20,0.12)', background: 'rgba(255,255,255,0.62)' }}>
                  Book a visit
                </button>
              </div>
            </div>
            <div style={{ width: 112, height: 112, borderRadius: 34, background: 'rgba(255,255,255,0.42)', display: 'grid', placeItems: 'center', flex: '0 0 auto', transform: 'rotate(5deg)' }}>
              <Stethoscope size={58} strokeWidth={1.5} color={C.ink} />
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 23, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <p style={{ margin: 0, color: C.muted, fontSize: 11, fontWeight: 850, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your care snapshot</p>
                <IconTile background={C.paper} size={38}><CalendarDays size={18} /></IconTile>
              </div>
              <p style={{ margin: '17px 0 5px', color: C.ink, fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em' }}>
                {activeAppointments.length} active
              </p>
              <p style={{ margin: 0, color: C.muted, fontSize: 12.5, lineHeight: 1.55 }}>
                {activeAppointments.length === 1 ? 'appointment needs your attention.' : 'appointments in progress or awaiting confirmation.'}
              </p>
            </div>
            <Link to="/patient/appointments" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: `1px solid ${C.line}`, paddingTop: 15, color: C.ink, textDecoration: 'none', fontSize: 12.5, fontWeight: 850 }}>
              Review appointments <ChevronRight size={17} />
            </Link>
          </div>
        </section>

        {/* Overview stats */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14, marginBottom: 22 }}>
          <StatCard
            label="Active appointments"
            value={activeAppointments.length}
            note="Bookings and pending requests"
            icon={CalendarDays}
            tint={C.limeSoft}
            link="/patient/appointments"
            linkLabel="View"
          />
          <StatCard
            label="Consultation chats"
            value={conversations.length}
            note="Conversations with your doctors"
            icon={MessageCircle}
            tint="#EEF0E7"
            link="/patient/messages"
            linkLabel="Open"
          />
          <StatCard
            label="Prescriptions"
            value={prescriptions.length}
            note={pendingPrescriptions.length ? `${pendingPrescriptions.length} awaiting validation` : 'Your digital prescription list'}
            icon={FileText}
            tint="#F2EDE0"
            link="/patient/prescriptions"
            linkLabel="Review"
          />
        </section>

        {/* Main content */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))', gap: 18, alignItems: 'start' }}>
          <div style={{ ...cardStyle, padding: 'clamp(18px, 2.5vw, 26px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <div>
                <p style={{ margin: '0 0 5px', color: C.muted, fontSize: 10.5, fontWeight: 850, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Your schedule</p>
                <h2 style={{ margin: 0, color: C.ink, fontSize: 19, fontWeight: 900, letterSpacing: '-0.03em' }}>Recent appointments</h2>
              </div>
              <Link to="/patient/appointments" style={{ ...secondaryButton, padding: '9px 12px', fontSize: 12 }}>
                View all <ArrowUpRight size={14} />
              </Link>
            </div>

            {recentAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing on your schedule yet"
                text="Once you request a consultation, your appointment details and status will appear here."
                action={<button type="button" onClick={() => setShowBookModal(true)} style={primaryButton}><Plus size={15} /> Request a consultation</button>}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentAppointments.map((appointment) => {
                  const doctorName = appointment.doctor_info?.name || `Doctor #${appointment.doctor}`;
                  const status = statusDetails(appointment.status);
                  const modeLabel = appointment.mode
                    ? appointment.mode.replaceAll('_', ' ')
                    : 'mode not set';

                  return (
                    <article key={appointment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', padding: 15, borderRadius: 17, border: `1px solid ${C.line}`, background: '#FFFFFF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 230px' }}>
                        <IconTile background={C.limeSoft} size={44}>
                          <Stethoscope size={19} />
                        </IconTile>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, color: C.ink, fontSize: 13.5, fontWeight: 850, overflowWrap: 'anywhere' }}>{doctorName}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px 10px', marginTop: 6, color: C.muted, fontSize: 11.5 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CalendarDays size={13} /> {formatDate(appointment.scheduled_at)}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock3 size={13} /> {formatTime(appointment.scheduled_at)}</span>
                            <span style={{ textTransform: 'capitalize' }}>{modeLabel}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ padding: '7px 10px', borderRadius: 999, background: status.bg, color: status.color, fontSize: 10.5, fontWeight: 850, whiteSpace: 'nowrap' }}>
                        {status.label}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ ...cardStyle, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 17 }}>
                <IconTile background={C.limeSoft}><Sparkles size={20} /></IconTile>
                <div>
                  <h2 style={{ margin: 0, color: C.ink, fontSize: 16, fontWeight: 900 }}>Quick actions</h2>
                  <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 11.5 }}>Pick up where you left off.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <QuickAction
                  icon={Search}
                  title="Find a specialist"
                  description="Browse doctors and request access"
                  to="/patient/find-doctors"
                />
                <QuickAction
                  icon={MessageCircle}
                  title="Message your doctor"
                  description={`${conversations.length} conversation${conversations.length === 1 ? '' : 's'} available`}
                  to="/patient/messages"
                />
                <QuickAction
                  icon={FileText}
                  title="View prescriptions"
                  description={pendingPrescriptions.length ? `${pendingPrescriptions.length} awaiting validation` : 'Check your digital records'}
                  to="/patient/prescriptions"
                />
              </div>
            </div>

            <div style={{ borderRadius: 24, padding: 22, background: C.ink, color: C.white }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconTile background={C.lime} color={C.ink} size={40}><MapPin size={19} /></IconTile>
                <p style={{ margin: 0, color: C.white, fontSize: 14, fontWeight: 850 }}>Care starts nearby</p>
              </div>
              <p style={{ margin: '13px 0 18px', color: 'rgba(255,255,255,0.68)', fontSize: 12.5, lineHeight: 1.65 }}>
                Find a specialist, compare consultation details, and request access before booking.
              </p>
              <Link to="/patient/find-doctors" style={{ ...primaryButton, width: '100%', boxSizing: 'border-box', background: C.lime, color: C.ink }}>
                Explore doctors <ArrowUpRight size={15} />
              </Link>
            </div>
          </aside>
        </section>

        {/* Consultation booking modal */}
        {showBookModal && (
          <div
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !booking) setShowBookModal(false);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              background: 'rgba(23,25,20,0.58)',
              backdropFilter: 'blur(7px)',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="consultation-modal-title"
              style={{
                width: 'min(100%, 570px)',
                maxHeight: 'min(90vh, 820px)',
                overflowY: 'auto',
                borderRadius: 26,
                background: C.white,
                padding: 'clamp(20px, 4vw, 30px)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.22)',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconTile background={C.lime} size={48}><CalendarDays size={22} /></IconTile>
                  <div>
                    <p style={{ margin: '0 0 4px', color: C.muted, fontSize: 10, fontWeight: 900, letterSpacing: '0.13em', textTransform: 'uppercase' }}>New appointment</p>
                    <h2 id="consultation-modal-title" style={{ margin: 0, color: C.ink, fontSize: 21, fontWeight: 900, letterSpacing: '-0.04em' }}>Request consultation</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !booking && setShowBookModal(false)}
                  disabled={booking}
                  aria-label="Close consultation form"
                  style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.line}`, background: C.white, color: C.ink, display: 'grid', placeItems: 'center', cursor: booking ? 'not-allowed' : 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {approvedDoctors.length === 0 ? (
                <div style={{ borderRadius: 18, padding: 18, background: '#FFF2E9', border: '1px solid #F5C7A9' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                    <AlertCircle size={20} color="#815600" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ margin: 0, color: '#8E4219', fontSize: 13, fontWeight: 850 }}>Consultation access required</p>
                      <p style={{ margin: '6px 0 13px', color: '#8E4219', fontSize: 12.5, lineHeight: 1.6 }}>
                        First request access to a doctor. Once your request is approved, you can book a consultation here.
                      </p>
                      <Link to="/patient/find-doctors" onClick={() => setShowBookModal(false)} style={{ ...primaryButton, padding: '10px 13px', fontSize: 12 }}>
                        Browse doctors <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBook}>
                  <div style={{ display: 'grid', gap: 17 }}>
                    <div>
                      <FieldLabel>Select doctor *</FieldLabel>
                      <select
                        value={selectedDoctorId}
                        onChange={(event) => setSelectedDoctorId(event.target.value)}
                        required
                        style={inputStyle}
                      >
                        {approvedDoctors.map((access) => (
                          <option key={access.id} value={access.doctor}>
                            {access.doctor_info?.name || `Doctor #${access.doctor}`} ({access.doctor_info?.specialization || 'General'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>Date and time *</FieldLabel>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={getLocalDateTimeMinimum()}
                        onChange={(event) => setScheduledAt(event.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <FieldLabel>Consultation mode *</FieldLabel>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: 9 }}>
                        {[
                          { value: 'in_person', label: 'In person', icon: UserRound },
                          { value: 'video', label: 'Video call', icon: Video },
                          { value: 'phone', label: 'Phone call', icon: Phone },
                        ].map((item) => {
                          const Icon = item.icon;
                          const selected = mode === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setMode(item.value)}
                              aria-pressed={selected}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                minHeight: 82,
                                padding: '12px 8px',
                                borderRadius: 14,
                                border: `1.5px solid ${selected ? C.ink : C.line}`,
                                background: selected ? C.limeSoft : C.white,
                                color: C.ink,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              <Icon size={19} />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Reason for consultation <span style={{ color: C.muted, fontWeight: 500 }}>(optional)</span></FieldLabel>
                      <textarea
                        rows={3}
                        value={patientNotes}
                        onChange={(event) => setPatientNotes(event.target.value)}
                        placeholder="Share a short note for the doctor..."
                        style={{ ...inputStyle, resize: 'vertical', minHeight: 86, lineHeight: 1.5 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, flexWrap: 'wrap', borderTop: `1px solid ${C.line}`, paddingTop: 18, marginTop: 22 }}>
                    <button type="button" onClick={() => setShowBookModal(false)} disabled={booking} style={{ ...secondaryButton, opacity: booking ? 0.6 : 1 }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={booking} style={{ ...primaryButton, minWidth: 160, opacity: booking ? 0.7 : 1, cursor: booking ? 'wait' : 'pointer' }}>
                      {booking ? 'Sending request…' : 'Confirm request'} <ArrowUpRight size={15} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function QuickAction({ icon: Icon, title, description, to }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: 12,
        borderRadius: 15,
        border: `1px solid ${C.line}`,
        background: '#FFFFFF',
        color: C.ink,
        textDecoration: 'none',
        transition: 'background 160ms ease, transform 160ms ease',
      }}
    >
      <IconTile background={C.paper} size={39}><Icon size={17} /></IconTile>
      <span style={{ display: 'block', minWidth: 0, flex: 1 }}>
        <span style={{ display: 'block', fontSize: 12.5, fontWeight: 850 }}>{title}</span>
        <span style={{ display: 'block', marginTop: 4, fontSize: 11, lineHeight: 1.4, color: C.muted }}>{description}</span>
      </span>
      <ChevronRight size={16} color={C.muted} />
    </Link>
  );
}