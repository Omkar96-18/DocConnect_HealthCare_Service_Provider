import React, { useEffect, useState } from 'react';
import { getUsers } from '../../api/admin';
import { Users, Search, UserCheck, Shield, Stethoscope, HeartPulse } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        return { label: 'Doctor', bg: '#e0f2fe', color: '#0369a1' };
      case 'assistant':
        return { label: 'Assistant', bg: '#fef3c7', color: '#92400e' };
      case 'patient':
        return { label: 'Patient', bg: '#dcfce7', color: '#166534' };
      case 'admin':
        return { label: 'Administrator', bg: '#f3e8ff', color: '#7e22ce' };
      default:
        return { label: role, bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>User Management</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Search, filter, and monitor doctors, medical assistants, patients, and staff.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#0ea5e9',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        {/* Role Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          {[
            { value: '', label: 'All Roles' },
            { value: 'doctor', label: 'Doctors' },
            { value: 'assistant', label: 'Assistants' },
            { value: 'patient', label: 'Patients' },
            { value: 'admin', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              style={{
                background: roleFilter === tab.value ? '#fff' : 'transparent',
                color: roleFilter === tab.value ? '#0ea5e9' : '#64748b',
                fontWeight: roleFilter === tab.value ? 600 : 500,
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: roleFilter === tab.value ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>No users match the criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>User</th>
                  <th style={{ padding: '14px 20px' }}>Role</th>
                  <th style={{ padding: '14px 20px' }}>Contact Phone</th>
                  <th style={{ padding: '14px 20px' }}>Address</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{fullName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>@{u.username} • {u.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>
                        {u.phone || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.address || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: u.is_active ? '#16a34a' : '#991b1b',
                          }}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.is_active ? '#16a34a' : '#ef4444' }} />
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b', textAlign: 'right', fontSize: 13 }}>
                        {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
