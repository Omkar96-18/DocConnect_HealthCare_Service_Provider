import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { getConversations, getMessages, sendMessage as sendMsgApi, startConversation } from '../../api/messages';
import { ChatWebSocket } from '../../utils/websocket';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Send, MessageCircle } from 'lucide-react';

export default function PatientMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    getConversations()
      .then(({ data }) => {
        setConversations(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    setMsgLoading(true);
    getMessages(activeConv.id)
      .then(({ data }) => {
        setMessages(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setMsgLoading(false));

    // WebSocket
    if (wsRef.current) wsRef.current.close();
    wsRef.current = new ChatWebSocket(activeConv.id, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => { wsRef.current?.close(); };
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    wsRef.current?.send(newMsg.trim());
    setNewMsg('');
  };

  const s = {
    container: {
      display: 'flex',
      height: 'calc(100vh - 130px)',
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    },
    convList: {
      width: 280,
      borderRight: '1px solid #f0f0f0',
      overflowY: 'auto',
      flexShrink: 0,
    },
    convHeader: {
      padding: '16px 16px 12px',
      fontWeight: 700,
      fontSize: 15,
      color: '#1e293b',
      borderBottom: '1px solid #f0f0f0',
    },
    convItem: (active) => ({
      padding: '14px 16px',
      cursor: 'pointer',
      borderBottom: '1px solid #f8f8f8',
      background: active ? '#f0f9ff' : '#fff',
      borderLeft: active ? '3px solid #0ea5e9' : '3px solid transparent',
    }),
    convName: { fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 3 },
    convPreview: {
      fontSize: 12,
      color: '#94a3b8',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
    chatHeader: {
      padding: '14px 20px',
      borderBottom: '1px solid #f0f0f0',
      fontWeight: 700,
      fontSize: 15,
      color: '#1e293b',
    },
    chatMessages: { flex: 1, overflowY: 'auto', padding: '16px 20px' },
    bubble: (mine) => ({
      maxWidth: '70%',
      padding: '10px 14px',
      borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
      background: mine ? '#0ea5e9' : '#f1f5f9',
      color: mine ? '#fff' : '#1e293b',
      fontSize: 14,
      marginBottom: 8,
      alignSelf: mine ? 'flex-end' : 'flex-start',
    }),
    msgRow: (mine) => ({
      display: 'flex',
      justifyContent: mine ? 'flex-end' : 'flex-start',
      marginBottom: 2,
    }),
    msgTime: (mine) => ({
      fontSize: 10,
      color: '#94a3b8',
      marginBottom: 8,
      textAlign: mine ? 'right' : 'left',
    }),
    chatInput: {
      padding: '12px 16px',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      gap: 10,
    },
    input: {
      flex: 1,
      padding: '10px 14px',
      border: '1.5px solid #e2e8f0',
      borderRadius: 10,
      fontSize: 14,
      outline: 'none',
    },
    sendBtn: {
      padding: '10px 16px',
      background: '#0ea5e9',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      flexDirection: 'column',
      gap: 10,
    },
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
        Messages
      </div>
      <div style={s.container}>
        {/* Conversation list */}
        <div style={s.convList}>
          <div style={s.convHeader}>Conversations</div>
          {conversations.length === 0 && (
            <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>No conversations yet</div>
          )}
          {conversations.map((c) => {
            const other = c.participants?.find((p) => p.id !== user?.id);
            return (
              <div
                key={c.id}
                style={s.convItem(activeConv?.id === c.id)}
                onClick={() => setActiveConv(c)}
              >
                <div style={s.convName}>
                  {other ? `${other.first_name} ${other.last_name}` : 'Conversation'}
                  {c.unread_count > 0 && (
                    <span style={{
                      marginLeft: 6,
                      background: '#0ea5e9',
                      color: '#fff',
                      borderRadius: 10,
                      padding: '1px 7px',
                      fontSize: 11,
                    }}>
                      {c.unread_count}
                    </span>
                  )}
                </div>
                <div style={s.convPreview}>
                  {c.last_message?.content ?? 'No messages yet'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat area */}
        {activeConv ? (
          <div style={s.chatArea}>
            <div style={s.chatHeader}>
              {(() => {
                const other = activeConv.participants?.find((p) => p.id !== user?.id);
                return other ? `${other.first_name} ${other.last_name}` : 'Chat';
              })()}
            </div>
            <div style={{ ...s.chatMessages, display: 'flex', flexDirection: 'column' }}>
              {msgLoading ? (
                <LoadingSpinner fullscreen={false} size={32} />
              ) : (
                messages.map((m, i) => {
                  const mine = m.sender === user?.id || m.sender?.id === user?.id;
                  return (
                    <div key={m.id ?? i}>
                      <div style={s.msgRow(mine)}>
                        <div style={s.bubble(mine)}>{m.content}</div>
                      </div>
                      <div style={s.msgTime(mine)}>
                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <form style={s.chatInput} onSubmit={handleSend}>
              <input
                style={s.input}
                placeholder="Type a message…"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
              />
              <button style={s.sendBtn} type="submit">
                <Send size={18} color="#fff" />
              </button>
            </form>
          </div>
        ) : (
          <div style={s.empty}>
            <MessageCircle size={48} color="#cbd5e1" />
            <div>Select a conversation to start chatting</div>
          </div>
        )}
      </div>
    </div>
  );
}
