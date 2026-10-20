import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageCircle,
  FileText,
  UserRound,
  Building2,
  UserCog,
  CheckSquare,
  Search,
} from 'lucide-react';

const NAV_ITEMS = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/medical-centers', label: 'Medical Centers', icon: Building2 },
    { to: '/admin/users', label: 'User Directory', icon: UserCog },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/doctor/patients', label: 'Consulting Patients', icon: Users },
    { to: '/doctor/messages', label: 'Messages', icon: MessageCircle },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/doctor/profile', label: 'Practice Profile', icon: UserRound },
  ],
  assistant: [
    { to: '/assistant/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/assistant/approvals', label: 'Approvals Queue', icon: CheckSquare },
    { to: '/assistant/prescriptions', label: 'Barcode Validation', icon: FileText },
    { to: '/assistant/profile', label: 'My Profile', icon: UserRound },
  ],
  patient: [
    { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/patient/find-doctors', label: 'Find Doctors', icon: Search },
    { to: '/patient/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/patient/messages', label: 'Messages', icon: MessageCircle },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/patient/profile', label: 'Medical Profile', icon: UserRound },
  ],
};

const ROLE_LABELS = {
  admin: 'Administrator',
  doctor: 'Doctor',
  assistant: 'Medical assistant',
  patient: 'Patient',
};

const C = {
  white: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  line: '#DCE2E7',
  active: '#EEF5FF',
  green: '#2B9A66',
};

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'user';
  const items = NAV_ITEMS[role] ?? [];
  const roleLabel = ROLE_LABELS[role] || 'User portal';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

        .dc-sidebar, .dc-sidebar * {
          box-sizing: border-box;
          font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
        }

        .dc-sidebar {
          width: 248px;
          min-width: 248px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          background: ${C.white};
          color: ${C.ink};
          border-right: 1px solid ${C.line};
          z-index: 40;
          isolation: isolate;
          overflow: hidden;
        }

        .dc-sidebar::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(16,24,32,.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16,24,32,.025) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, #000, transparent 70%);
        }

        .dc-sidebar-brand {
          padding: 25px 20px 21px;
          border-bottom: 1px solid ${C.line};
          background: rgba(255,255,255,.94);
        }

        .dc-sidebar-brand-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .dc-sidebar-wordmark {
          display: inline-flex;
          align-items: baseline;
          color: ${C.ink};
          font-size: 19px;
          font-weight: 600;
          letter-spacing: -1.25px;
          line-height: 1.2;
          white-space: nowrap;
        }

        .dc-sidebar-wordmark-period { color: ${C.orange}; }

        .dc-sidebar-edition {
          color: ${C.muted};
          font-size: 8px;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        .dc-sidebar-brand-meta {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 17px;
          color: ${C.muted};
          font-size: 9px;
          line-height: 1.5;
          letter-spacing: .075em;
          text-transform: uppercase;
        }

        .dc-sidebar-brand-dot {
          width: 6px;
          height: 6px;
          flex: 0 0 6px;
          background: ${C.blue};
        }

        .dc-sidebar-nav {
          flex: 1;
          min-height: 0;
          padding: 25px 13px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${C.line} transparent;
        }

        .dc-sidebar-section-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 9px 13px;
          color: ${C.muted};
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .dc-sidebar-section-code { color: ${C.orange}; }

        .dc-sidebar-links { display: flex; flex-direction: column; gap: 4px; }

        .dc-sidebar-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 43px;
          padding: 10px 11px;
          border: 1px solid transparent;
          border-left: 2px solid transparent;
          border-radius: 2px;
          color: #596574;
          background: transparent;
          text-decoration: none;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: -.02em;
          transition: background .16s ease, color .16s ease, border-color .16s ease;
        }

        .dc-sidebar-link:hover {
          color: ${C.blue};
          background: rgba(23,105,210,.045);
        }

        .dc-sidebar-link[aria-current="page"] {
          color: ${C.blue};
          background: ${C.active};
          border-left-color: ${C.blue};
          font-weight: 600;
        }

        .dc-sidebar-link:focus-visible {
          outline: 2px solid ${C.blue};
          outline-offset: 2px;
        }

        .dc-sidebar-link-icon { flex: 0 0 auto; }
        .dc-sidebar-link-label { min-width: 0; flex: 1; }

        .dc-sidebar-active-marker {
          width: 5px;
          height: 5px;
          flex: 0 0 5px;
          background: ${C.orange};
        }

        .dc-sidebar-footer {
          padding: 15px 20px 17px;
          border-top: 1px solid ${C.line};
          background: rgba(255,255,255,.96);
        }

        .dc-sidebar-footer-label {
          margin-bottom: 8px;
          color: #929BA5;
          font-size: 8px;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .dc-sidebar-footer-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${C.muted};
          font-size: 9px;
        }

        .dc-sidebar-status-dot {
          width: 6px;
          height: 6px;
          flex: 0 0 6px;
          border-radius: 50%;
          background: ${C.green};
        }

        @media (max-width: 760px) {
          .dc-sidebar { width: 218px; min-width: 218px; }
          .dc-sidebar-brand { padding-left: 15px; padding-right: 15px; }
          .dc-sidebar-nav { padding-left: 9px; padding-right: 9px; }
          .dc-sidebar-footer { padding-left: 15px; padding-right: 15px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dc-sidebar-link { transition: none; }
        }
      `}</style>

      <aside className="dc-sidebar" aria-label="Main sidebar">
        <div className="dc-sidebar-brand">
          <div className="dc-sidebar-brand-top">
            <div className="dc-sidebar-wordmark" aria-label="DocConnect">
              DocConnect<span className="dc-sidebar-wordmark-period">.</span>
            </div>
            <span className="dc-sidebar-edition">DC / 01</span>
          </div>
          <div className="dc-sidebar-brand-meta">
            <span className="dc-sidebar-brand-dot" />
            <span>{roleLabel} / Secure healthcare portal</span>
          </div>
        </div>

        <nav className="dc-sidebar-nav" aria-label="Primary navigation">
          <div className="dc-sidebar-section-label">
            <span>Workspace</span>
            <span className="dc-sidebar-section-code">NAV / 01</span>
          </div>
          <div className="dc-sidebar-links">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="dc-sidebar-link">
                {({ isActive }) => (
                  <>
                    <Icon
                      className="dc-sidebar-link-icon"
                      size={16}
                      strokeWidth={isActive ? 2 : 1.7}
                      aria-hidden="true"
                    />
                    <span className="dc-sidebar-link-label">{label}</span>
                    {isActive && <span className="dc-sidebar-active-marker" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="dc-sidebar-footer">
          <div className="dc-sidebar-footer-label">System status</div>
          <div className="dc-sidebar-footer-status">
            <span className="dc-sidebar-status-dot" />
            <span>Secure workspace</span>
            <span style={{ marginLeft: 'auto', color: C.orange }}>●</span>
          </div>
        </div>
      </aside>
    </>
  );
}
