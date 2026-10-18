import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silent
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silent
    }
  };

  const styles = {
    container: { position: 'relative' },
    btn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      padding: '6px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      background: '#ef4444',
      color: '#fff',
      borderRadius: '50%',
      width: 18,
      height: 18,
      fontSize: 11,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
    },
    dropdown: {
      position: 'absolute',
      top: '110%',
      right: 0,
      width: 340,
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      zIndex: 1000,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid #f0f0f0',
      fontWeight: 600,
      color: '#1e293b',
    },
    readAllBtn: {
      background: 'none',
      border: 'none',
      color: '#0ea5e9',
      cursor: 'pointer',
      fontSize: 13,
    },
    list: { maxHeight: 320, overflowY: 'auto' },
    item: (read) => ({
      padding: '12px 16px',
      borderBottom: '1px solid #f8f8f8',
      background: read ? '#fff' : '#f0f9ff',
      cursor: 'pointer',
    }),
    itemMsg: { fontSize: 13, color: '#374151', marginBottom: 4 },
    itemTime: { fontSize: 11, color: '#9ca3af' },
    empty: { padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 },
  };

  return (
    <div style={styles.container} ref={ref}>
      <button style={styles.btn} onClick={() => setOpen((o) => !o)}>
        <Bell size={22} color="#64748b" />
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button style={styles.readAllBtn} onClick={handleReadAll}>
                Mark all read
              </button>
            )}
          </div>
          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={styles.item(n.is_read)}
                  onClick={() => !n.is_read && handleRead(n.id)}
                >
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, marginBottom: 2 }}>
                    {n.title}
                  </div>
                  <div style={styles.itemMsg}>{n.body}</div>
                  <div style={styles.itemTime}>
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
