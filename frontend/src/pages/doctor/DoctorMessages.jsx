import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { getConversations, getMessages, sendMessage as sendMsgApi } from '../../api/messages';
import { ChatWebSocket } from '../../utils/websocket';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Send, MessageCircle, User } from 'lucide-react';

export default function DoctorMessages() {
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
        const list = Array.isArray(data) ? data : data.results ?? [];
        setConversations(list);
        if (list.length > 0) {
          setActiveConv(list[0]);
        }
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

    // Connect WebSocket
    if (wsRef.current) wsRef.current.close();
    try {
      wsRef.current = new ChatWebSocket(activeConv.id, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } catch (e) {
      console.warn('WS fallback', e);
    }

    return () => {
      wsRef.current?.close();
    };
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    const content = newMsg.trim();
    setNewMsg('');

    // Try sending via WebSocket first
    let sentWs = false;
    try {
      if (wsRef.current && wsRef.current.ws && wsRef.current.ws.readyState === WebSocket.OPEN) {
        wsRef.current.send(content);
        sentWs = true;
      }
    } catch (err) {
      sentWs = false;
    }

    // Fallback to HTTP POST if WebSocket wasn't ready
    if (!sentWs) {
      try {
        const res = await sendMsgApi(activeConv.id, content);
        setMessages((prev) => [...prev, res.data]);
      } catch (err) {
        toast.error('Failed to send message');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Consultation Messages</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Live communication with your approved patients.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Conversations Sidebar */}
        <div style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#0f172a' }}>
            Conversations ({conversations.length})
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No active patient conversations. Patients can chat once consultation access is approved.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const patientName = conv.patient_info?.first_name
                  ? `${conv.patient_info.first_name} ${conv.patient_info.last_name}`
                  : conv.patient_info?.username || (conv.patient ? `Patient #${conv.patient}` : 'Patient');

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#e0f2fe' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: '#0ea5e9',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {patientName[0]?.toUpperCase() || 'P'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {patientName}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.last_message?.content || 'Click to open chat thread'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#fff',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    {activeConv.patient_info?.first_name
                      ? `${activeConv.patient_info.first_name} ${activeConv.patient_info.last_name}`
                      : activeConv.patient_info?.username || (activeConv.patient ? `Patient #${activeConv.patient}` : 'Patient')}
                  </div>
                  <div style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} /> Direct Medical Consultation
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {msgLoading ? (
                  <LoadingSpinner />
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8' }}>
                    <MessageCircle size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: 14 }}>No messages yet. Send a greeting or clinical note below!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender === user?.id || m.sender_id === user?.id || m.sender?.id === user?.id || m.sender_info?.id === user?.id || m.sender_info?.username === user?.username;
                    return (
                      <div
                        key={m.id || Math.random()}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: isMe ? '#0ea5e9' : '#fff',
                          color: isMe ? '#fff' : '#0f172a',
                          padding: '10px 14px',
                          borderRadius: 12,
                          borderBottomRightRadius: isMe ? 2 : 12,
                          borderBottomLeftRadius: isMe ? 12 : 2,
                          border: isMe ? 'none' : '1px solid #e2e8f0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ fontSize: 14, lineHeight: 1.4 }}>{m.content}</div>
                        <div
                          style={{
                            fontSize: 10,
                            color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                            marginTop: 4,
                            textAlign: 'right',
                          }}
                        >
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={handleSend}
                style={{
                  padding: 16,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: 12,
                  background: '#fff',
                }}
              >
                <input
                  type="text"
                  placeholder="Type advice or message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Send size={16} /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
