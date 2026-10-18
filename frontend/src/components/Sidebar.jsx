import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageCircle,
  FileText,
  UserCircle,
  Building2,
  UserCog,
  CheckSquare,
  Search,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/medical-centers', label: 'Medical Centers', icon: Building2 },
    { to: '/admin/users', label: 'User Directory', icon: UserCog },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/patients', label: 'Consulting Patients', icon: Users },
    { to: '/doctor/messages', label: 'Messages', icon: MessageCircle },
    { to: '/doctor/prescriptions', label: 'Prescriptions (Rx)', icon: FileText },
    { to: '/doctor/profile', label: 'Practice Profile', icon: UserCircle },
  ],
  assistant: [
    { to: '/assistant/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/assistant/approvals', label: 'Approvals Queue', icon: CheckSquare },
    { to: '/assistant/prescriptions', label: 'Barcode Validation', icon: FileText },
    { to: '/assistant/profile', label: 'My Profile', icon: UserCircle },
  ],
  patient: [
    { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/patient/find-doctors', label: 'Find Nearby Doctors', icon: Search },
    { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/patient/messages', label: 'Doctor Messages', icon: MessageCircle },
    { to: '/patient/prescriptions', label: 'My Prescriptions', icon: FileText },
    { to: '/patient/profile', label: 'Medical Profile', icon: UserCircle },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = NAV_ITEMS[user?.role] ?? [];

  return (
    <aside
      style={{
        width: 250,
        background: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
          }}
        >
          <Stethoscope size={20} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            DocConnect
          </div>
          <div style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 600, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {user?.role} Portal
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 10px 8px' }}>
          Navigation
        </div>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 4,
              color: isActive ? '#ffffff' : '#94a3b8',
              background: isActive ? '#0284c7' : 'transparent',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
            })}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / System Status */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }}
        />
        <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
          Connected to <strong style={{ color: '#e2e8f0' }}>DocConnect Core</strong>
        </div>
      </div>
    </aside>
  );
}
