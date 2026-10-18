import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, Activity } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'doctor':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'assistant':
        return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'patient':
        return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'admin':
        return { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  const roleStyle = getRoleBadgeStyle(user?.role);
  const initials = (profile?.first_name?.[0] || user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase();
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User';

  return (
    <header
      style={{
        height: 64,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Portal Context Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
          DocConnect Platform
        </span>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '3px 8px',
            borderRadius: 6,
            background: roleStyle.bg,
            color: roleStyle.color,
            border: `1px solid ${roleStyle.border}`,
          }}
        >
          {user?.role} portal
        </span>
      </div>

      {/* Right: Actions & User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <NotificationBell />

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px 4px 4px',
            borderRadius: 999,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {initials}
          </div>
          <div style={{ paddingRight: 4 }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, lineHeight: 1.2 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
              @{user?.username}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out of your account"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '7px 12px',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = '#fca5a5';
            e.currentTarget.style.background = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = '#fff';
          }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
