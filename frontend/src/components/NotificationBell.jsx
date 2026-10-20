import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock3 } from 'lucide-react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notifications';

const C = {
  white: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  line: '#DCE2E7',
  active: '#EEF5FF',
};

const font = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

function formatNotificationTime(value) {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  return `${date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} · ${date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(Array.isArray(data) ? data : data?.results ?? []);
    } catch {
      // Keep notification polling silent so it does not interrupt the user.
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const escapeHandler = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escapeHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escapeHandler);
    };
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((previous) =>
        previous.map((item) => item.id === id ? { ...item, is_read: true } : item)
      );
    } catch {
      // Keep the current state if the request fails.
    }
  };

  const handleReadAll = async () => {
    setLoading(true);
    try {
      await markAllNotificationsRead();
      setNotifications((previous) => previous.map((item) => ({ ...item, is_read: true })));
    } catch {
      // Keep the current state if the request fails.
    } finally {
      setLoading(false);
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

    .dc-notifications, .dc-notifications * {
      box-sizing: border-box;
      font-family: ${font};
    }

    .dc-notifications { position: relative; color: ${C.ink}; }

    .dc-notification-trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      padding: 0;
      color: ${C.ink};
      background: ${C.white};
      border: 1px solid ${C.line};
      border-radius: 3px;
      cursor: pointer;
      transition: border-color .16s ease, background .16s ease;
    }

    .dc-notification-trigger:hover,
    .dc-notification-trigger[aria-expanded="true"] {
      background: ${C.active};
      border-color: ${C.blue};
    }

    .dc-notification-trigger:focus-visible,
    .dc-notification-action:focus-visible,
    .dc-notification-item:focus-visible {
      outline: 2px solid ${C.blue};
      outline-offset: 3px;
    }

    .dc-notification-count {
      position: absolute;
      top: -5px;
      right: -5px;
      display: grid;
      place-items: center;
      min-width: 17px;
      height: 17px;
      padding: 0 4px;
      color: ${C.white};
      background: ${C.orange};
      border: 2px solid ${C.white};
      font-size: 9px;
      font-weight: 700;
      line-height: 1;
    }

    .dc-notification-panel {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: min(370px, calc(100vw - 28px));
      background: ${C.white};
      border: 1px solid ${C.line};
      border-radius: 3px;
      box-shadow: 0 14px 40px rgba(16,24,32,.12);
      z-index: 1000;
      overflow: hidden;
      animation: dc-notification-enter .14s ease-out;
    }

    @keyframes dc-notification-enter {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dc-notification-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 15px 16px 13px;
      border-bottom: 1px solid ${C.line};
      border-top: 3px solid ${C.blue};
    }

    .dc-notification-eyebrow {
      margin: 0 0 5px;
      color: ${C.muted};
      font-size: 8px;
      line-height: 1.4;
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    .dc-notification-heading {
      margin: 0;
      color: ${C.ink};
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -.04em;
    }

    .dc-notification-action {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 0 6px 6px;
      color: ${C.blue};
      background: transparent;
      border: 0;
      font-size: 9px;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
    }

    .dc-notification-action:disabled {
      opacity: .45;
      cursor: wait;
    }

    .dc-notification-list {
      max-height: 360px;
      overflow-y: auto;
    }

    .dc-notification-item {
      display: block;
      width: 100%;
      padding: 13px 16px;
      text-align: left;
      color: inherit;
      background: ${C.white};
      border: 0;
      border-bottom: 1px solid ${C.line};
      border-left: 2px solid transparent;
      cursor: pointer;
      transition: background .14s ease;
    }

    .dc-notification-item:last-child { border-bottom: 0; }
    .dc-notification-item:hover { background: #F8FAFC; }
    .dc-notification-item.is-unread {
      background: ${C.active};
      border-left-color: ${C.orange};
    }

    .dc-notification-item-title {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      margin: 0 0 5px;
      color: ${C.ink};
      font-size: 10px;
      line-height: 1.55;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .dc-notification-unread-dot {
      width: 5px;
      height: 5px;
      flex: 0 0 5px;
      margin-top: 5px;
      background: ${C.orange};
    }

    .dc-notification-message {
      margin: 0 0 8px;
      color: #4F5B66;
      font-size: 10px;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    .dc-notification-time {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0;
      color: ${C.muted};
      font-size: 8px;
      line-height: 1.5;
      letter-spacing: .01em;
    }

    .dc-notification-empty {
      padding: 30px 18px;
      text-align: center;
    }

    .dc-notification-empty-mark {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      margin: 0 auto 12px;
      color: ${C.blue};
      background: ${C.active};
      border: 1px solid ${C.line};
    }

    .dc-notification-empty-title {
      margin: 0 0 5px;
      color: ${C.ink};
      font-size: 10px;
      font-weight: 600;
    }

    .dc-notification-empty-copy {
      margin: 0;
      color: ${C.muted};
      font-size: 9px;
      line-height: 1.6;
    }

    .dc-notification-panel-footer {
      padding: 9px 16px;
      color: ${C.muted};
      background: #FCFDFE;
      border-top: 1px solid ${C.line};
      font-size: 8px;
      letter-spacing: .04em;
      text-transform: uppercase;
    }

    @media (prefers-reduced-motion: reduce) {
      .dc-notification-panel { animation: none; }
      .dc-notification-trigger, .dc-notification-item { transition: none; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="dc-notifications" ref={ref}>
        <button
          ref={buttonRef}
          type="button"
          className="dc-notification-trigger"
          onClick={() => setOpen((current) => !current)}
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Bell size={18} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="dc-notification-count">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <section className="dc-notification-panel" role="dialog" aria-label="Notifications">
            <header className="dc-notification-panel-header">
              <div>
                <p className="dc-notification-eyebrow">DocConnect / Updates</p>
                <h2 className="dc-notification-heading">Notifications<span style={{ color: C.orange }}>.</span></h2>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="dc-notification-action"
                  onClick={handleReadAll}
                  disabled={loading}
                >
                  <CheckCheck size={13} />
                  {loading ? 'Updating…' : 'Mark all read'}
                </button>
              )}
            </header>

            <div className="dc-notification-list">
              {notifications.length === 0 ? (
                <div className="dc-notification-empty">
                  <div className="dc-notification-empty-mark"><Bell size={17} /></div>
                  <p className="dc-notification-empty-title">You’re all caught up.</p>
                  <p className="dc-notification-empty-copy">New updates will appear here when available.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`dc-notification-item${notification.is_read ? '' : ' is-unread'}`}
                    onClick={() => !notification.is_read && handleRead(notification.id)}
                    aria-label={`${notification.is_read ? 'Read' : 'Unread'} notification: ${notification.title}`}
                  >
                    <span className="dc-notification-item-title">
                      <span>{notification.title}</span>
                      {!notification.is_read && <span className="dc-notification-unread-dot" />}
                    </span>
                    <span className="dc-notification-message">{notification.body}</span>
                    <span className="dc-notification-time">
                      <Clock3 size={11} />
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </button>
                ))
              )}
            </div>

            <footer className="dc-notification-panel-footer">
              Secure healthcare portal / DC-01
            </footer>
          </section>
        )}
      </div>
    </>
  );
}
