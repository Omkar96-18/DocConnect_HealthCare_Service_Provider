import React, { useEffect, useState } from 'react';
import { getUsers } from '../../api/admin';
import {
  Users,
  Search,
  UserCheck,
  Shield,
  Stethoscope,
  HeartPulse,
  UserRound,
  SlidersHorizontal,
  LoaderCircle,
  ShieldCheck,
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
  purple: '#7956B8',
  purpleSoft: '#F4F0FB',
};

const mono = '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';
const body = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const roleTabs = [
  { value: '', label: 'All roles' },
  { value: 'doctor', label: 'Doctors' },
  { value: 'assistant', label: 'Assistants' },
  { value: 'patient', label: 'Patients' },
  { value: 'admin', label: 'Admins' },
];

const roleStyles = {
  doctor: { label: 'Doctor', bg: C.blueSoft, color: C.blue, icon: Stethoscope },
  assistant: { label: 'Assistant', bg: C.orangeSoft, color: C.amber, icon: UserCheck },
  patient: { label: 'Patient', bg: C.greenSoft, color: C.green, icon: HeartPulse },
  admin: { label: 'Administrator', bg: C.purpleSoft, color: C.purple, icon: Shield },
};

function getRoleBadge(role) {
  return roleStyles[role] || { label: role || 'Unknown', bg: C.soft, color: C.muted, icon: UserRound };
}

function StatCard({ label, value, icon: Icon, accent, tint }) {
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.border}`, padding: '16px 18px', position: 'relative', minWidth: 0 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 35, height: 3, background: accent }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: C.muted }}>{label}</span>
        <span style={{ width: 31, height: 31, display: 'grid', placeItems: 'center', background: tint, color: accent, flexShrink: 0 }}><Icon size={16} /></span>
      </div>
      <div style={{ marginTop: 12, fontSize: 27, fontWeight: 700, letterSpacing: '-.045em', color: C.ink }}>{value}</div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await getUsers(params);
      setUsers(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'doctor':
        return { label: 'Doctor', bg: C.blueSoft, color: C.blue };
      case 'assistant':
        return { label: 'Assistant', bg: C.orangeSoft, color: C.amber };
      case 'patient':
        return { label: 'Patient', bg: C.greenSoft, color: C.green };
      case 'admin':
        return { label: 'Administrator', bg: C.purpleSoft, color: C.purple };
      default:
        return { label: role, bg: C.soft, color: C.muted };
    }
  };

  const totalActive = users.filter((u) => u.is_active).length;
  const totalDisabled = users.length - totalActive;
  const totalClinicians = users.filter((u) => u.role === 'doctor' || u.role === 'assistant').length;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 0 36px', color: C.ink, fontFamily: body }}>
      <div style={{ height: 3, width: 54, background: C.orange, marginBottom: 24 }} />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, background: C.blue, display: 'inline-block' }} />
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.13em', textTransform: 'uppercase', color: C.muted }}>DocConnect / Administration</span>
          </div>
          <h1 style={{ fontSize: 'clamp(27px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '-.045em', fontWeight: 700, margin: 0 }}>
            User management<span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ color: C.muted, margin: '11px 0 0', maxWidth: 640, fontSize: 14, lineHeight: 1.65 }}>
            Search accounts, review roles, and monitor access status across the healthcare platform.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, padding: '9px 11px', background: C.paper }}>
          <ShieldCheck size={15} color={C.blue} />
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.05em', color: C.muted }}>ACCESS DIRECTORY</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, marginBottom: 23 }}>
        <StatCard label="Loaded accounts" value={loading ? '—' : users.length} icon={Users} accent={C.blue} tint={C.blueSoft} />
        <StatCard label="Active accounts" value={loading ? '—' : totalActive} icon={UserCheck} accent={C.green} tint={C.greenSoft} />
        <StatCard label="Disabled accounts" value={loading ? '—' : totalDisabled} icon={Shield} accent={C.orange} tint={C.orangeSoft} />
        <StatCard label="Care team" value={loading ? '—' : totalClinicians} icon={Stethoscope} accent={C.purple} tint={C.purpleSoft} />
      </div>

      <section style={{ background: C.paper, border: `1px solid ${C.border}` }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <SlidersHorizontal size={16} color={C.blue} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Find accounts</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: '.06em' }}>FILTERS & SEARCH</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: '1 1 300px', minWidth: 0 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <Search size={15} color={C.muted} style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  aria-label="Search users"
                  placeholder="Username, name, or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: body, outline: 'none', color: C.ink }}
                />
              </div>
              <button type="submit" style={{ padding: '10px 15px', background: C.blue, color: '#fff', border: `1px solid ${C.blue}`, borderRadius: 4, fontFamily: mono, fontSize: 10, letterSpacing: '.04em', fontWeight: 600, cursor: 'pointer' }}>SEARCH</button>
            </form>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: 4, background: C.soft, border: `1px solid ${C.border}` }}>
              {roleTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setRoleFilter(tab.value)}
                  aria-pressed={roleFilter === tab.value}
                  style={{
                    background: roleFilter === tab.value ? C.paper : 'transparent',
                    color: roleFilter === tab.value ? C.blue : C.muted,
                    fontWeight: roleFilter === tab.value ? 700 : 500,
                    border: roleFilter === tab.value ? `1px solid ${C.border}` : '1px solid transparent',
                    padding: '7px 10px',
                    fontFamily: body,
                    fontSize: 11,
                    cursor: 'pointer',
                    boxShadow: roleFilter === tab.value ? '0 1px 2px rgba(16,24,32,.05)' : 'none',
                  }}
                >{tab.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 18px', background: C.soft, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700 }}>
            <Users size={15} color={C.blue} /> User directory
          </span>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>{loading ? 'FETCHING…' : `${users.length} RECORD${users.length === 1 ? '' : 'S'}`}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 58, color: C.muted }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><LoaderCircle size={25} color={C.blue} style={{ animation: 'dc-users-spin 1s linear infinite' }} /></div>
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.1em' }}>LOADING USER DIRECTORY…</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '58px 20px', color: C.muted }}>
            <div style={{ margin: '0 auto 14px', width: 46, height: 46, display: 'grid', placeItems: 'center', background: C.blueSoft, color: C.blue }}><UserRound size={21} /></div>
            <h3 style={{ margin: '0 0 7px', color: C.ink, fontSize: 15 }}>{search || roleFilter ? 'No matching accounts' : 'No accounts found'}</h3>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>Try another search term or choose a different role filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12, minWidth: 860 }}>
              <thead>
                <tr style={{ background: '#FBFCFD', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  <th style={{ padding: '13px 18px', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '13px 15px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '13px 15px', fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: '13px 15px', fontWeight: 600 }}>Address</th>
                  <th style={{ padding: '13px 15px', fontWeight: 600 }}>Access status</th>
                  <th style={{ padding: '13px 18px', textAlign: 'right', fontWeight: 600 }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;
                  const RoleIcon = roleStyles[u.role]?.icon || UserRound;
                  return (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '15px 18px', minWidth: 220 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <div style={{ width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center', background: C.soft, border: `1px solid ${C.border}`, color: C.blue, fontSize: 11, fontWeight: 700 }}>
                            {(fullName || '?').slice(0, 1).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: C.ink, fontSize: 12, marginBottom: 4 }}>{fullName}</div>
                            <div style={{ fontSize: 10, color: C.muted, overflowWrap: 'anywhere' }}>@{u.username} · {u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 15px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          <RoleIcon size={12} /> {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '15px 15px', color: C.muted, whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                      <td title={u.address || ''} style={{ padding: '15px 15px', color: C.muted, maxWidth: 210, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                      <td style={{ padding: '15px 15px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: u.is_active ? C.green : C.red, fontSize: 11, fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.is_active ? C.green : C.red }} />
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '15px 18px', textAlign: 'right', color: C.muted, fontFamily: mono, fontSize: 10, whiteSpace: 'nowrap' }}>
                        {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 10, lineHeight: 1.5 }}>
        <ShieldCheck size={14} color={C.blue} />
        <span>Account information is displayed according to the data returned by the admin API.</span>
      </div>

      <style>{`@keyframes dc-users-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
