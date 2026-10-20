import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut } from 'lucide-react';

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

const ROLE_LABELS = {
  doctor: 'Doctor',
  assistant: 'Medical assistant',
  patient: 'Patient',
  admin: 'Administrator',
};

export default function Navbar() {
  const { user, profile, logout } = useAuth();

  const initials = (
    profile?.first_name?.[0] ||
    user?.first_name?.[0] ||
    user?.username?.[0] ||
    'U'
  ).toUpperCase();

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User';

  const roleLabel = ROLE_LABELS[user?.role] || 'User portal';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

        .dc-navbar, .dc-navbar * {
          box-sizing: border-box;
          font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
        }

        .dc-navbar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          min-height: 76px;
          padding: 12px clamp(14px, 2.2vw, 28px);
          flex-shrink: 0;
          z-index: 50;
          color: ${C.ink};
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid ${C.line};
        }

        .dc-navbar::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, ${C.blue} 0 72%, ${C.orange} 72% 100%);
          pointer-events: none;
        }

        .dc-navbar-context {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          min-width: 0;
        }

        .dc-navbar-brand {
          color: ${C.ink};
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -.045em;
          white-space: nowrap;
        }

        .dc-navbar-brand-period { color: ${C.orange}; }

        .dc-navbar-separator {
          color: ${C.line};
          font-size: 14px;
        }

        .dc-navbar-context-label {
          color: ${C.muted};
          font-size: 9px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .dc-navbar-role {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 7px;
          color: ${C.blue};
          background: ${C.active};
          border: 1px solid #D7E6FA;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: .025em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .dc-navbar-role-dot {
          width: 5px;
          height: 5px;
          background: ${C.orange};
        }

        .dc-navbar-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          min-width: 0;
        }

        .dc-navbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 5px 11px 5px 5px;
          border: 1px solid ${C.line};
          background: ${C.white};
        }

        .dc-navbar-avatar {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          color: ${C.white};
          background: ${C.ink};
          border-top: 2px solid ${C.orange};
          font-size: 11px;
          font-weight: 600;
        }

        .dc-navbar-user-details { min-width: 0; }

        .dc-navbar-user-name {
          max-width: 190px;
          overflow: hidden;
          color: ${C.ink};
          font-size: 10px;
          font-weight: 600;
          line-height: 1.5;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dc-navbar-username {
          max-width: 190px;
          overflow: hidden;
          color: ${C.muted};
          font-size: 9px;
          line-height: 1.5;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dc-navbar-logout {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 38px;
          padding: 8px 11px;
          color: ${C.muted};
          background: ${C.white};
          border: 1px solid ${C.line};
          font-size: 9px;
          font-weight: 600;
          cursor: pointer;
          transition: color .16s ease, border-color .16s ease, background .16s ease;
          white-space: nowrap;
        }

        .dc-navbar-logout:hover {
          color: #B42318;
          background: #FFF5F3;
          border-color: #F2C4BE;
        }

        .dc-navbar-logout:focus-visible,
        .dc-navbar-user:focus-visible {
          outline: 2px solid ${C.blue};
          outline-offset: 3px;
        }

        @media (max-width: 700px) {
          .dc-navbar {
            min-height: 68px;
            gap: 10px;
            padding: 10px 12px;
          }

          .dc-navbar-context-label,
          .dc-navbar-separator {
            display: none;
          }

          .dc-navbar-context { gap: 7px; }
          .dc-navbar-brand { font-size: 11px; }
          .dc-navbar-actions { gap: 7px; }
          .dc-navbar-user { gap: 7px; padding-right: 7px; }
          .dc-navbar-user-name { max-width: 110px; }
          .dc-navbar-username { max-width: 110px; }
          .dc-navbar-logout { width: 36px; min-width: 36px; padding: 0; }
          .dc-navbar-logout-label { display: none; }
        }

        @media (max-width: 440px) {
          .dc-navbar-role { display: none; }
          .dc-navbar-user-name { max-width: 88px; }
          .dc-navbar-username { max-width: 88px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dc-navbar-logout { transition: none; }
        }
      `}</style>

      <header className="dc-navbar">
        <div className="dc-navbar-context">
          <div className="dc-navbar-brand">
            DocConnect<span className="dc-navbar-brand-period">.</span>
          </div>
          <span className="dc-navbar-separator">/</span>
          <span className="dc-navbar-context-label">Secure healthcare portal</span>
          <span className="dc-navbar-role">
            <span className="dc-navbar-role-dot" />
            {roleLabel}
          </span>
        </div>

        <div className="dc-navbar-actions">
          <NotificationBell />

          <div className="dc-navbar-user" aria-label={`Signed in as ${displayName}`}>
            <div className="dc-navbar-avatar" aria-hidden="true">{initials}</div>
            <div className="dc-navbar-user-details">
              <div className="dc-navbar-user-name">{displayName}</div>
              <div className="dc-navbar-username">@{user?.username || 'user'}</div>
            </div>
          </div>

          <button
            type="button"
            className="dc-navbar-logout"
            onClick={logout}
            title="Sign out of your account"
            aria-label="Sign out of your account"
          >
            <LogOut size={14} />
            <span className="dc-navbar-logout-label">Sign out</span>
          </button>
        </div>
      </header>
    </>
  );
}
