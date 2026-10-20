import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { getConversations, getMessages, sendMessage as sendMsgApi } from '../../api/messages';
import { ChatWebSocket } from '../../utils/websocket';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Send, MessageCircle, UserRound, Stethoscope, Search, ShieldCheck } from 'lucide-react';

const C = {
  paper: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  soft: '#F5F7F9',
  blueSoft: '#EDF4FC',
  green: '#25815D',
};

const mono = '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';

function patientNameOf(conv) {
  return conv?.patient_info?.first_name
    ? `${conv.patient_info.first_name} ${conv.patient_info.last_name || ''}`.trim()
    : conv?.patient_info?.username || (conv?.patient ? `Patient #${conv.patient}` : 'Patient');
}

function initials(name) {
  return (name || 'P').split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

export default function DoctorMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    getConversations()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.results ?? [];
        setConversations(list);
        if (list.length > 0) setActiveConv(list[0]);
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConv) {
      setMessages([]);
      return;
    }
    setMsgLoading(true);
    getMessages(activeConv.id)
      .then(({ data }) => setMessages(Array.isArray(data) ? data : data?.results ?? []))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setMsgLoading(false));

    if (wsRef.current) wsRef.current.close();
    try {
      wsRef.current = new ChatWebSocket(activeConv.id, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } catch (e) {
      console.warn('WS fallback', e);
    }

    return () => wsRef.current?.close();
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    const content = newMsg.trim();
    setNewMsg('');

    let sentWs = false;
    try {
      if (wsRef.current?.ws && wsRef.current.ws.readyState === WebSocket.OPEN) {
        wsRef.current.send(content);
        sentWs = true;
      }
    } catch (err) {
      sentWs = false;
    }

    if (!sentWs) {
      try {
        const res = await sendMsgApi(activeConv.id, content);
        setMessages((prev) => [...prev, res.data]);
      } catch (err) {
        toast.error('Failed to send message');
        setNewMsg(content);
      }
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    patientNameOf(conv).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  const activeName = patientNameOf(activeConv);
  const styles = {
    page: { maxWidth: 1440, margin: '0 auto', height: 'calc(100vh - 112px)', minHeight: 540, display: 'flex', flexDirection: 'column', color: C.ink, fontFamily: mono },
    eyebrow: { fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, margin: 0 },
    panel: { background: C.paper, border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden' },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        .dc-msg-conv:hover { background: #F5F7F9 !important; }
        .dc-msg-conv:focus-visible, .dc-msg-send:focus-visible, .dc-msg-input:focus-visible, .dc-msg-search:focus-visible { outline: 2px solid #1769D2; outline-offset: 2px; }
        .dc-msg-send:hover { background: #1059B8 !important; }
        .dc-msg-send:disabled { opacity: .45; cursor: not-allowed !important; }
        .dc-msg-search::placeholder, .dc-msg-input::placeholder { color: #89939C; }
        .dc-msg-scroll { scrollbar-width: thin; scrollbar-color: #CBD3DA transparent; }
        @media (max-width: 760px) {
          .dc-msg-layout { grid-template-columns: minmax(0, 1fr) !important; grid-template-rows: minmax(150px, 32%) minmax(300px, 1fr) !important; }
          .dc-msg-sidebar { border-right: 0 !important; border-bottom: 1px solid #DCE2E7; }
          .dc-msg-page { height: calc(100dvh - 100px) !important; min-height: 560px !important; }
          .dc-msg-bubble { max-width: 88% !important; }
        }
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <p style={styles.eyebrow}>DOCCONNECT / CLINICAL WORKSPACE</p>
          <h1 style={{ fontSize: 'clamp(21px, 3vw, 29px)', lineHeight: 1.2, letterSpacing: '-0.06em', margin: '9px 0 7px', fontWeight: 700 }}>
            Consultation <span style={{ color: C.blue }}>messages</span><span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ margin: 0, color: C.muted, fontSize: 11, lineHeight: 1.7 }}>Secure, direct communication with your patients.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, padding: '9px 11px', background: C.paper, fontSize: 10, letterSpacing: '.06em', color: C.muted }}>
          <ShieldCheck size={14} color={C.blue} /> CONSULTATION CHANNEL
        </div>
      </header>

      <section className="dc-msg-layout" style={{ ...styles.panel, flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(250px, 320px) minmax(0, 1fr)' }}>
        <aside className="dc-msg-sidebar" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: `1px solid ${C.border}`, background: '#FBFCFD' }}>
          <div style={{ padding: '17px 18px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 13 }}>
              <p style={{ ...styles.eyebrow, color: C.ink }}>PATIENT INBOX</p>
              <span style={{ fontSize: 10, color: C.blue, background: C.blueSoft, padding: '4px 7px', border: '1px solid #D8E6F8' }}>{String(conversations.length).padStart(2, '0')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, background: C.paper, padding: '0 10px' }}>
              <Search size={14} color={C.muted} />
              <input className="dc-msg-search" aria-label="Search patients" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients..." style={{ width: '100%', minWidth: 0, border: 0, outline: 0, padding: '10px 0', fontFamily: mono, fontSize: 10, color: C.ink, background: 'transparent' }} />
            </div>
          </div>

          <div className="dc-msg-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: C.muted }}>
                <MessageCircle size={23} style={{ margin: '0 auto 12px', color: '#AAB4BD' }} />
                <p style={{ fontSize: 10, lineHeight: 1.8, margin: 0 }}>{conversations.length ? 'No patients match your search.' : 'No active patient conversations. Patients can chat once consultation access is approved.'}</p>
              </div>
            ) : filteredConversations.map((conv, index) => {
              const selected = activeConv?.id === conv.id;
              const name = patientNameOf(conv);
              return (
                <button className="dc-msg-conv" type="button" key={conv.id} onClick={() => setActiveConv(conv)} aria-pressed={selected}
                  style={{ display: 'flex', textAlign: 'left', alignItems: 'center', width: '100%', gap: 11, padding: '14px 15px', border: 0, borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${selected ? C.blue : 'transparent'}`, background: selected ? C.blueSoft : 'transparent', cursor: 'pointer', fontFamily: mono, transition: 'background .15s' }}>
                  <div style={{ width: 38, height: 38, flexShrink: 0, display: 'grid', placeItems: 'center', background: selected ? C.blue : '#E8EDF1', color: selected ? '#fff' : '#43515D', fontSize: 11, fontWeight: 700 }}>
                    {initials(name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{name}</span>
                      {selected && <span style={{ width: 5, height: 5, background: C.orange, flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 9, color: C.muted, marginTop: 5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{conv.last_message?.content || 'Open conversation thread'}</div>
                  </div>
                  <span style={{ color: '#AAB4BD', fontSize: 9 }}>{String(index + 1).padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 15px', color: C.muted, fontSize: 9, letterSpacing: '.04em' }}>
            {conversations.length} TOTAL CONVERSATION{conversations.length === 1 ? '' : 'S'}
          </div>
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, background: C.paper }}>
          {activeConv ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', background: '#F0F4F7', border: `1px solid ${C.border}`, flexShrink: 0 }}>
                    <UserRound size={17} color={C.blue} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, overflowWrap: 'anywhere' }}>{activeName}</h2>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '5px 0 0', fontSize: 9, color: C.green }}>
                      <span style={{ width: 6, height: 6, background: C.green, borderRadius: '50%' }} /> DIRECT MEDICAL CONSULTATION
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 9, letterSpacing: '.04em' }}>
                  <Stethoscope size={14} color={C.orange} /> DOCTOR / PATIENT
                </div>
              </div>

              <div className="dc-msg-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px clamp(12px, 3vw, 28px)', display: 'flex', flexDirection: 'column', gap: 13, background: 'linear-gradient(#FFFFFF, #FBFCFD)' }}>
                <div style={{ textAlign: 'center', marginBottom: 4 }}>
                  <span style={{ display: 'inline-block', padding: '5px 9px', border: `1px solid ${C.border}`, color: C.muted, fontSize: 9, letterSpacing: '.08em', background: C.paper }}>CONSULTATION THREAD</span>
                </div>
                {msgLoading ? <div style={{ margin: 'auto' }}><LoadingSpinner /></div> : messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 290, padding: 20 }}>
                    <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: C.blue, background: C.blueSoft, border: '1px solid #D8E6F8' }}><MessageCircle size={22} /></div>
                    <p style={{ margin: '0 0 7px', color: C.ink, fontSize: 12, fontWeight: 700 }}>Start the conversation</p>
                    <p style={{ margin: 0, color: C.muted, fontSize: 10, lineHeight: 1.8 }}>Send a greeting, follow-up, or clinical note to this patient.</p>
                  </div>
                ) : messages.map((m, index) => {
                  const isMe = m.sender === user?.id || m.sender_id === user?.id || m.sender?.id === user?.id || m.sender_info?.id === user?.id || m.sender_info?.username === user?.username;
                  return (
                    <div className="dc-msg-bubble" key={m.id || `${m.created_at || 'message'}-${index}`} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', minWidth: 100 }}>
                      <div style={{ padding: '11px 13px', background: isMe ? C.blue : C.paper, color: isMe ? '#FFFFFF' : C.ink, border: isMe ? `1px solid ${C.blue}` : `1px solid ${C.border}`, borderLeft: isMe ? undefined : `3px solid ${C.orange}`, borderRadius: 2, boxShadow: '0 2px 5px rgba(16,24,32,.035)' }}>
                        <div style={{ fontSize: 11, lineHeight: 1.8, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.content}</div>
                        <div style={{ textAlign: 'right', marginTop: 7, fontSize: 9, color: isMe ? 'rgba(255,255,255,.72)' : C.muted }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                      <div style={{ marginTop: 4, textAlign: isMe ? 'right' : 'left', fontSize: 8, letterSpacing: '.08em', color: C.muted }}>{isMe ? 'YOU / DOCTOR' : 'PATIENT'}</div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} style={{ padding: '13px 16px', borderTop: `1px solid ${C.border}`, background: C.paper }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${C.border}`, padding: 5, background: '#FBFCFD' }}>
                  <input className="dc-msg-input" type="text" placeholder="Write a consultation message..." aria-label="Message" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} style={{ flex: 1, minWidth: 0, padding: '10px 9px', border: 0, outline: 0, background: 'transparent', color: C.ink, fontFamily: mono, fontSize: 11 }} />
                  <button className="dc-msg-send" type="submit" disabled={!newMsg.trim()} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 15px', border: 0, background: C.blue, color: '#FFFFFF', fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '.05em', cursor: 'pointer', transition: 'background .15s', flexShrink: 0 }}>
                    SEND <Send size={14} />
                  </button>
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', gap: 10, color: C.muted, fontSize: 8, letterSpacing: '.04em', flexWrap: 'wrap' }}>
                  <span>MESSAGES ARE FOR CONSULTATION FOLLOW-UP</span><span>ENTER MESSAGE TO SEND</span>
                </div>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', padding: 28, textAlign: 'center', maxWidth: 320 }}>
              <div style={{ width: 54, height: 54, display: 'grid', placeItems: 'center', margin: '0 auto 15px', border: `1px solid ${C.border}`, color: C.blue, background: C.blueSoft }}><MessageCircle size={24} /></div>
              <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Select a conversation</h2>
              <p style={{ fontSize: 10, color: C.muted, lineHeight: 1.8, margin: 0 }}>Choose a patient from the inbox to view messages and continue the consultation.</p>
            </div>
          )}
        </main>
      </section>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10, color: C.muted, fontSize: 8, letterSpacing: '.07em', flexWrap: 'wrap' }}>
        <span>DOCCONNECT / MESSAGES</span><span>CLINICAL COMMUNICATION WORKSPACE</span>
      </div>
    </div>
  );
}
