import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getDoctors } from '../../api/doctors';
import { createAppointment } from '../../api/appointments';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, MapPin, Filter, X, DollarSign, Video, Phone, User } from 'lucide-react';

const SPECIALIZATIONS = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Oncology',
];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    min_fee: '',
    max_fee: '',
    accepts_patients: false,
  });
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  
  // Modal State
  const [modal, setModal] = useState(null); // { doctor }
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('in_person');
  const [patientNotes, setPatientNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await getDoctors(params);
      setDoctors(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (filters.specialization) params.specialization = filters.specialization;
    if (filters.min_fee) params.min_fee = filters.min_fee;
    if (filters.max_fee) params.max_fee = filters.max_fee;
    if (filters.accepts_patients) params.is_accepting_patients = true;
    if (location) {
      params.lat = location.lat;
      params.lon = location.lon;
    }
    load(params);
  };

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocLoading(false);
        toast.success('Location enabled');
      },
      () => {
        toast.error('Could not get location');
        setLocLoading(false);
      }
    );
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error('Please pick a date and time for the appointment');
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        doctor: modal.doctor.id,
        scheduled_at: new Date(scheduledAt).toISOString(),
        mode,
        patient_notes: patientNotes,
      });
      toast.success('Consultation requested successfully!');
      
      // Reset Modal State
      setModal(null);
      setScheduledAt('');
      setMode('in_person');
      setPatientNotes('');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to request consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    h1: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
    sub: { color: '#64748b', marginBottom: 24, fontSize: 14 },
    searchBar: {
      display: 'flex',
      gap: 10,
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    searchInput: {
      flex: 1,
      minWidth: 200,
      padding: '10px 14px 10px 38px',
      border: '1.5px solid #e2e8f0',
      borderRadius: 10,
      fontSize: 14,
      outline: 'none',
    },
    searchWrap: { position: 'relative', flex: 1, minWidth: 200 },
    searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' },
    filtersPanel: {
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      alignItems: 'flex-end',
    },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
    filterLabel: { fontSize: 12, fontWeight: 600, color: '#64748b' },
    select: {
      padding: '8px 12px',
      border: '1.5px solid #e2e8f0',
      borderRadius: 8,
      fontSize: 13,
      outline: 'none',
      background: '#fff',
    },
    input: {
      padding: '8px 12px',
      border: '1.5px solid #e2e8f0',
      borderRadius: 8,
      fontSize: 13,
      width: 90,
      outline: 'none',
    },
    locBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      background: location ? '#dcfce7' : '#f1f5f9',
      color: location ? '#166534' : '#374151',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
    },
    searchBtn: {
      padding: '8px 20px',
      background: '#0ea5e9',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 14,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 16,
    },
    card: {
      background: '#fff',
      borderRadius: 14,
      padding: 20,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: '#0ea5e9',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 20,
    },
    cardHeader: { display: 'flex', gap: 12, alignItems: 'center' },
    docName: { fontWeight: 700, fontSize: 16, color: '#1e293b' },
    spec: { fontSize: 13, color: '#64748b' },
    badge: {
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: '#dcfce7',
      color: '#166534',
    },
    meta: { display: 'flex', gap: 16, fontSize: 13, color: '#64748b' },
    bio: {
      fontSize: 13,
      color: '#475569',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    reqBtn: {
      marginTop: 4,
      padding: '9px',
      background: '#0ea5e9',
      color: '#fff',
      border: 'none',
      borderRadius: 9,
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 14,
    },
    empty: { textAlign: 'center', color: '#94a3b8', padding: 40 },
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    },
    modal: {
      background: '#fff',
      borderRadius: 18,
      padding: '28px 24px',
      width: '100%',
      maxWidth: 520,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    },
    modalTitle: { fontSize: 18, fontWeight: 800, color: '#0f172a' },
    checkLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' },
  };

  return (
    <div>
      <div style={s.h1}>Find Doctors</div>
      <div style={s.sub}>Search and connect with healthcare professionals</div>

      <form onSubmit={handleSearch}>
        <div style={s.searchBar}>
          <div style={s.searchWrap}>
            <Search size={16} color="#94a3b8" style={s.searchIcon} />
            <input
              style={s.searchInput}
              placeholder="Search by doctor name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={s.filtersPanel}>
          <Filter size={16} color="#64748b" />
          <div style={s.filterGroup}>
            <span style={s.filterLabel}>Specialization</span>
            <select
              style={s.select}
              value={filters.specialization}
              onChange={(e) => setFilters((f) => ({ ...f, specialization: e.target.value }))}
            >
              <option value="">Any</option>
              {SPECIALIZATIONS.map((sp) => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>
          <div style={s.filterGroup}>
            <span style={s.filterLabel}>Min Fee ($)</span>
            <input
              style={s.input}
              type="number"
              min="0"
              value={filters.min_fee}
              onChange={(e) => setFilters((f) => ({ ...f, min_fee: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div style={s.filterGroup}>
            <span style={s.filterLabel}>Max Fee ($)</span>
            <input
              style={s.input}
              type="number"
              min="0"
              value={filters.max_fee}
              onChange={(e) => setFilters((f) => ({ ...f, max_fee: e.target.value }))}
              placeholder="500"
            />
          </div>
          <label style={s.checkLabel}>
            <input
              type="checkbox"
              checked={filters.accepts_patients}
              onChange={(e) => setFilters((f) => ({ ...f, accepts_patients: e.target.checked }))}
            />
            Accepting patients
          </label>
          <button
            type="button"
            style={s.locBtn}
            onClick={getLocation}
            disabled={locLoading}
          >
            <MapPin size={14} />
            {location ? 'Location on' : locLoading ? 'Getting…' : 'Use my location'}
          </button>
          <button style={s.searchBtn} type="submit">Search</button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner fullscreen={false} />
      ) : doctors.length === 0 ? (
        <div style={s.empty}>No doctors found. Try adjusting your filters.</div>
      ) : (
        <div style={s.grid}>
          {doctors.map((doc) => {
            const initials = (doc.user?.first_name?.[0] ?? 'D').toUpperCase();
            return (
              <div key={doc.id} style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.avatar}>{initials}</div>
                  <div>
                    <div style={s.docName}>
                      Dr. {doc.user?.first_name} {doc.user?.last_name}
                    </div>
                    <div style={s.spec}>{doc.specialization}</div>
                  </div>
                </div>
                {doc.is_accepting_patients && (
                  <span style={s.badge}>Accepting patients</span>
                )}
                <div style={s.meta}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <DollarSign size={13} /> ${doc.consultation_fee}
                  </span>
                  {doc.experience_years && (
                    <span>{doc.experience_years}yr exp</span>
                  )}
                  {doc.distance_km && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {doc.distance_km.toFixed(1)} km
                    </span>
                  )}
                </div>
                {doc.bio && <div style={s.bio}>{doc.bio}</div>}
                {doc.available_days && (
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Available: {doc.available_days}
                  </div>
                )}
                <button
                  style={s.reqBtn}
                  onClick={() => {
                    setModal({ doctor: doc });
                    setScheduledAt('');
                    setMode('in_person');
                    setPatientNotes('');
                  }}
                >
                  Request Consultation
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Booking Modal */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={s.modalTitle}>
                Request Consultation
              </h2>
              <button
                onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequest}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Selected Doctor
                </label>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  Dr. {modal.doctor.user?.first_name} {modal.doctor.user?.last_name} ({modal.doctor.specialization})
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Date & Time <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Consultation Mode <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { value: 'in_person', label: 'In Person', icon: User },
                    { value: 'video', label: 'Video Call', icon: Video },
                    { value: 'phone', label: 'Phone', icon: Phone },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = mode === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMode(m.value)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 8,
                          border: `1.5px solid ${active ? '#0ea5e9' : '#e2e8f0'}`,
                          background: active ? '#f0f9ff' : '#fff',
                          color: active ? '#0ea5e9' : '#475569',
                          fontWeight: active ? 700 : 500,
                          fontSize: 12.5,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Icon size={16} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Reason for Consultation / Notes
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Briefly describe your symptoms or routine checkup requirement..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5, boxSizing: 'border-box', resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Scheduling...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}