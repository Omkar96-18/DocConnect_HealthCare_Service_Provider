import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../api/admin';
import {
  Users,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  ShieldCheck,
  Stethoscope,
  ArrowUpRight,
  Activity,
  LoaderCircle,
  UserRound,
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
  purple: '#7956B8',
  purpleSoft: '#F4F0FB',
  amber: '#A96A10',
  amberSoft: '#FFF6E8',
};

const mono = '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';
const body = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const panel = {
  background: C.paper,
  border: `1px solid ${C.border}`,
  minWidth: 0,
};

function MetricCard({ label, value, detail, icon: Icon, accent, tint, footer }) {
  return (
    <section style={{ ...panel, position: 'relative', padding: '19px 20px 18px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: 42, background: accent }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ color: C.muted, fontFamily: mono, fontSize: 10, letterSpacing: '.08em', lineHeight: 1.5, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center', color: accent, background: tint }}>
          <Icon size={17} strokeWidth={1.8} />
        </span>
      </div>
      <div style={{ marginTop: 16, fontSize: 34, lineHeight: 1, letterSpacing: '-.055em', fontWeight: 700, color: C.ink }}>{value}</div>
      <div style={{ marginTop: 11, fontSize: 11, lineHeight: 1.55, color: C.muted }}>{detail}</div>
      {footer && <div style={{ marginTop: 14, paddingTop: 11, borderTop: `1px solid ${C.border}` }}>{footer}</div>}
    </section>
  );
}

function BreakdownRow({ label, value, color = C.ink, tint = C.soft, total }) {
  const percent = total > 0 ? Math.min(100, Math.round((Number(value || 0) / total) * 100)) : 0;
  return (
    <div style={{ padding: '13px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 9 }}>
        <span style={{ color: C.ink, fontSize: 12, lineHeight: 1.5 }}>{label}</span>
        <span style={{ color, fontFamily: mono, fontWeight: 600, fontSize: 12, padding: '3px 7px', background: tint, minWidth: 30, textAlign: 'center' }}>{value || 0}</span>
      </div>
      <div style={{ height: 4, background: C.soft, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, transition: 'width .25s ease' }} />
      </div>
    </div>
  );
}

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

  const users = stats?.users || {};
  const appointments = stats?.appointments || {};
  const prescriptions = stats?.prescriptions || {};

  if (loading) {
    return (
      <div style={{ maxWidth: 1240, margin: '0 auto', fontFamily: body, color: C.ink }}>
        <div style={{ height: 3, width: 54, background: C.orange, marginBottom: 24 }} />
        <div style={{ border: `1px solid ${C.border}`, background: C.paper, minHeight: 290, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 13 }}>
          <LoaderCircle size={27} color={C.blue} style={{ animation: 'dc-admin-spin 1s linear infinite' }} />
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.12em', color: C.muted }}>LOADING SYSTEM STATISTICS…</span>
          <style>{`@keyframes dc-admin-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 0 36px', color: C.ink, fontFamily: body }}>
      <div style={{ height: 3, width: 54, background: C.orange, marginBottom: 24 }} />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, background: C.blue, display: 'inline-block' }} />
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.13em', textTransform: 'uppercase', color: C.muted }}>DocConnect / Administration</span>
          </div>
          <h1 style={{ fontSize: 'clamp(27px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '-.045em', fontWeight: 700, margin: 0 }}>
            System overview<span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ color: C.muted, margin: '11px 0 0', maxWidth: 640, fontSize: 14, lineHeight: 1.65 }}>
            A live snapshot of platform users, medical centers, appointments, and prescription workflows.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, padding: '9px 11px', background: C.paper }}>
          <Activity size={14} color={C.green} />
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.05em', color: C.muted }}>ADMIN CONSOLE</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 235px), 1fr))', gap: 13, marginBottom: 25 }}>
        <MetricCard
          label="Total platform users"
          value={users.total || 0}
          detail={`${users.doctor || 0} doctors · ${users.assistant || 0} assistants · ${users.patient || 0} patients`}
          icon={Users}
          accent={C.blue}
          tint={C.blueSoft}
        />
        <MetricCard
          label="Medical centers"
          value={stats?.medical_centers || 0}
          detail="Registered hospitals and partner clinics"
          icon={Building2}
          accent={C.green}
          tint={C.greenSoft}
          footer={<a href="/admin/medical-centers" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: C.green, textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>Manage centers <ArrowUpRight size={13} /></a>}
        />
        <MetricCard
          label="Total appointments"
          value={stats?.appointments_total || 0}
          detail={`${appointments.completed || 0} completed · ${appointments.approved || 0} approved / scheduled`}
          icon={Calendar}
          accent={C.blue}
          tint={C.blueSoft}
        />
        <MetricCard
          label="Validated prescriptions"
          value={prescriptions.validated || 0}
          detail={`${prescriptions.not_validated || 0} awaiting assistant scan`}
          icon={FileText}
          accent={C.purple}
          tint={C.purpleSoft}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 16 }}>
        <section style={panel}>
          <div style={{ padding: '17px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: C.blue, background: C.blueSoft }}><Users size={16} /></span>
              <div>
                <h2 style={{ margin: 0, fontSize: 14, letterSpacing: '-.02em' }}>User roles overview</h2>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>Platform account distribution</p>
              </div>
            </div>
            <a href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.blue, textDecoration: 'none', fontWeight: 700 }}>Manage users <ArrowUpRight size={13} /></a>
          </div>
          <div style={{ padding: '4px 20px 10px' }}>
            <BreakdownRow label="Doctors" value={users.doctor} color={C.blue} tint={C.blueSoft} total={users.total} />
            <BreakdownRow label="Assistants" value={users.assistant} color={C.orange} tint={C.orangeSoft} total={users.total} />
            <BreakdownRow label="Patients" value={users.patient} color={C.green} tint={C.greenSoft} total={users.total} />
            <BreakdownRow label="Administrators" value={users.admin} color={C.purple} tint={C.purpleSoft} total={users.total} />
          </div>
        </section>

        <section style={panel}>
          <div style={{ padding: '17px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: C.orange, background: C.orangeSoft }}><Calendar size={16} /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 14, letterSpacing: '-.02em' }}>Appointments breakdown</h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>Workflow status at a glance</p>
            </div>
          </div>
          <div style={{ padding: '4px 20px 10px' }}>
            <BreakdownRow label="Pending assistant approval" value={appointments.pending_assistant} color={C.amber} tint={C.amberSoft} total={stats?.appointments_total} />
            <BreakdownRow label="Direct doctor requested" value={appointments.requested} color={C.amber} tint={C.amberSoft} total={stats?.appointments_total} />
            <BreakdownRow label="Approved / scheduled" value={appointments.approved} color={C.green} tint={C.greenSoft} total={stats?.appointments_total} />
            <BreakdownRow label="Completed" value={appointments.completed} color={C.blue} tint={C.blueSoft} total={stats?.appointments_total} />
          </div>
        </section>
      </div>

      <div style={{ marginTop: 16, padding: '12px 15px', border: `1px solid ${C.border}`, background: C.soft, display: 'flex', alignItems: 'center', gap: 9 }}>
        <ShieldCheck size={15} color={C.blue} />
        <span style={{ fontSize: 11, lineHeight: 1.5, color: C.muted }}>Administrative metrics are sourced from the platform statistics endpoint. Counts reflect the latest successful response.</span>
      </div>
    </div>
  );
}
