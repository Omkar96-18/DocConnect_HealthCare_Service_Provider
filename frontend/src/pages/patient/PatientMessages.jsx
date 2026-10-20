import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  getConversations,
  getMessages,
  sendMessage as sendMsgApi,
  startConversation,
} from '../../api/messages';
import { ChatWebSocket } from '../../utils/websocket';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Send, MessageCircle } from 'lucide-react';

const COLORS = {
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  paper: '#FFFFFF',
  soft: '#F6F8FA',
};

const mono = '"IBM Plex Mono", monospace';

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

    setMessages([]);
    setMsgLoading(true);
    getMessages(activeConv.id)
      .then(({ data }) => {
        setMessages(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setMsgLoading(false));

    if (wsRef.current) wsRef.current.close();
    wsRef.current = new ChatWebSocket(activeConv.id, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      wsRef.current?.close();
    };
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

  const getConversationName = (conversation) => {
    const other = conversation.participants?.find((participant) => participant.id !== user?.id);
    return other ? `${other.first_name} ${other.last_name}`.trim() : 'Conversation';
  };

  const styles = {
    page: {
      color: COLORS.ink,
      fontFamily: mono,
      minWidth: 0,
    },
    eyebrow: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      color: COLORS.muted,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.13em',
      textTransform: 'uppercase',
      marginBottom: 9,
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: '-0.04em',
      margin: 0,
      color: COLORS.ink,
    },
    subtitle: {
      color: COLORS.muted,
      fontSize: 12,
      lineHeight: 1.7,
      margin: '7px 0 20px',
    },
    panel: {
      display: 'flex',
      height: 'calc(100vh - 205px)',
      minHeight: 420,
      maxHeight: 760,
      background: COLORS.paper,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 2,
      overflow: 'hidden',
    },
    conversationList: {
      width: 285,
      flex: '0 0 285px',
      borderRight: `1px solid ${COLORS.border}`,
      overflowY: 'auto',
      background: COLORS.paper,
    },
    listHeader: {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      padding: '14px 15px',
      borderBottom: `1px solid ${COLORS.border}`,
      background: COLORS.paper,
      color: COLORS.ink,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    conversationItem: (active) => ({
      width: '100%',
      boxSizing: 'border-box',
      display: 'block',
      textAlign: 'left',
      padding: '14px 15px',
      border: 0,
      borderBottom: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${active ? COLORS.blue : 'transparent'}`,
      background: active ? '#EEF5FF' : COLORS.paper,
      cursor: 'pointer',
      fontFamily: mono,
    }),
    conversationName: {
      color: COLORS.ink,
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.6,
      overflowWrap: 'anywhere',
    },
    preview: {
      marginTop: 5,
      color: COLORS.muted,
      fontSize: 10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    chatArea: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      background: COLORS.paper,
    },
    chatHeader: {
      minHeight: 51,
      boxSizing: 'border-box',
      padding: '13px 18px',
      borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 12,
      fontWeight: 600,
      color: COLORS.ink,
    },
    chatMessages: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'linear-gradient(#DCE2E720 1px, transparent 1px)',
      backgroundSize: '100% 32px',
    },
    messageRow: (mine) => ({
      display: 'flex',
      justifyContent: mine ? 'flex-end' : 'flex-start',
      marginBottom: 3,
    }),
    bubble: (mine) => ({
      maxWidth: 'min(75%, 520px)',
      overflowWrap: 'anywhere',
      padding: '10px 12px',
      border: `1px solid ${mine ? COLORS.blue : COLORS.border}`,
      borderRadius: 2,
      background: mine ? COLORS.blue : COLORS.paper,
      color: mine ? COLORS.paper : COLORS.ink,
      fontSize: 12,
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',
    }),
    messageTime: (mine) => ({
      fontSize: 9,
      color: COLORS.muted,
      marginBottom: 10,
      textAlign: mine ? 'right' : 'left',
      letterSpacing: '0.02em',
    }),
    inputBar: {
      padding: '12px',
      borderTop: `1px solid ${COLORS.border}`,
      display: 'flex',
      gap: 9,
      background: COLORS.paper,
    },
    messageInput: {
      flex: 1,
      minWidth: 0,
      padding: '11px 12px',
      border: `1px solid ${COLORS.border}`,
      borderRadius: 2,
      outlineColor: COLORS.blue,
      fontFamily: mono,
      fontSize: 11,
      color: COLORS.ink,
      background: COLORS.paper,
    },
    sendButton: {
      flex: '0 0 auto',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '10px 13px',
      border: `1px solid ${COLORS.blue}`,
      borderRadius: 2,
      background: COLORS.blue,
      color: COLORS.paper,
      cursor: 'pointer',
      fontFamily: mono,
      fontSize: 11,
      fontWeight: 600,
    },
    empty: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLORS.muted,
      flexDirection: 'column',
      gap: 12,
      padding: 24,
      textAlign: 'center',
      fontSize: 11,
      lineHeight: 1.8,
    },
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <main style={styles.page}>
      <header style={{ marginBottom: 18, paddingBottom: 17, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={styles.eyebrow}>
          <span style={{ width: 20, height: 2, background: COLORS.orange }} />
          PATIENT PORTAL / COMMUNICATION
        </div>
        <h1 style={styles.title}>Messages<span style={{ color: COLORS.orange }}>.</span></h1>
        <p style={styles.subtitle}>Private conversations with your healthcare team.</p>
      </header>

      <section className="docconnect-messages-panel" style={styles.panel} aria-label="Patient messaging">
        <aside className="docconnect-conversation-list" style={styles.conversationList}>
          <div style={styles.listHeader}>Conversations <span style={{ color: COLORS.orange }}>[{conversations.length}]</span></div>
          {conversations.length === 0 && (
            <div style={{ padding: 16, color: COLORS.muted, fontSize: 11, lineHeight: 1.7 }}>
              No conversations yet.
            </div>
          )}
          {conversations.map((conversation) => {
            const active = activeConv?.id === conversation.id;
            const name = getConversationName(conversation);
            return (
              <button
                type="button"
                key={conversation.id}
                style={styles.conversationItem(active)}
                onClick={() => setActiveConv(conversation)}
                aria-pressed={active}
              >
                <div style={styles.conversationName}>
                  {name}
                  {conversation.unread_count > 0 && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: 7,
                        padding: '2px 6px',
                        background: COLORS.orange,
                        color: COLORS.paper,
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <div style={styles.preview}>
                  {conversation.last_message?.content ?? 'No messages yet'}
                </div>
              </button>
            );
          })}
        </aside>

        {activeConv ? (
          <div className="docconnect-chat-area" style={styles.chatArea}>
            <div style={styles.chatHeader}>
              <span style={{ width: 8, height: 8, background: COLORS.orange, display: 'inline-block' }} />
              <span>{getConversationName(activeConv)}</span>
            </div>
            <div style={styles.chatMessages}>
              {msgLoading ? (
                <LoadingSpinner fullscreen={false} size={32} />
              ) : messages.length === 0 ? (
                <div style={styles.empty}>
                  <MessageCircle size={34} color={COLORS.border} />
                  <div>No messages yet. Start the conversation below.</div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const mine = message.sender === user?.id || message.sender?.id === user?.id;
                  return (
                    <div key={message.id ?? index}>
                      <div style={styles.messageRow(mine)}>
                        <div style={styles.bubble(mine)}>{message.content}</div>
                      </div>
                      <div style={styles.messageTime(mine)}>
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <form style={styles.inputBar} onSubmit={handleSend}>
              <input
                aria-label="Type a message"
                style={styles.messageInput}
                placeholder="Write a message..."
                value={newMsg}
                onChange={(event) => setNewMsg(event.target.value)}
              />
              <button style={styles.sendButton} type="submit" disabled={!newMsg.trim()}>
                <Send size={15} /> Send
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.empty}>
            <MessageCircle size={38} color={COLORS.border} />
            <div>Select a conversation to start chatting.</div>
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 700px) {
          .docconnect-messages-panel {
            flex-direction: column !important;
            height: auto !important;
            min-height: 70vh !important;
          }
          .docconnect-conversation-list {
            width: 100% !important;
            flex: 0 0 auto !important;
            max-height: 190px;
            border-right: 0 !important;
            border-bottom: 1px solid ${COLORS.border};
          }
          .docconnect-chat-area {
            min-height: 360px;
          }
        }
      `}</style>
    </main>
  );
}
