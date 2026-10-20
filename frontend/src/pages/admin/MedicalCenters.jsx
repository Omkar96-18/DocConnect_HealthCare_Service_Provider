import React, { useEffect, useState } from 'react';
import {
  getMedicalCenters,
  createMedicalCenter,
  updateMedicalCenter,
  deleteMedicalCenter,
} from '../../api/admin';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  X,
  LocateFixed,
  Search,
  ArrowUpRight,
  LoaderCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const C = {
  paper: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  soft: '#F5F8FA',
  blueSoft: '#EEF5FF',
  orangeSoft: '#FFF3EB',
  danger: '#C83D42',
  dangerSoft: '#FFF1F1',
};

const mono = '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';
const body = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${C.border}`,
  borderRadius: 5,
  background: C.paper,
  color: C.ink,
  padding: '12px 13px',
  fontSize: 14,
  fontFamily: body,
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  marginBottom: 7,
  fontFamily: mono,
  fontSize: 10,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: C.muted,
};

const buttonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderRadius: 5,
  padding: '11px 15px',
  fontFamily: mono,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.035em',
  cursor: 'pointer',
  transition: 'background .18s ease, border-color .18s ease',
};

export default function MedicalCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await getMedicalCenters();
      setCenters(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      toast.error('Failed to load medical centers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingCenter(null);
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setPhone('');
    setEmail('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCenter(c);
    setName(c.name || '');
    setAddress(c.address || '');
    setLatitude(c.latitude ?? '');
    setLongitude(c.longitude ?? '');
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      address: address.trim(),
      latitude: latitude !== '' ? parseFloat(latitude) : null,
      longitude: longitude !== '' ? parseFloat(longitude) : null,
      phone: phone.trim(),
      email: email.trim(),
    };

    try {
      setSaving(true);
      if (editingCenter) {
        await updateMedicalCenter(editingCenter.id, payload);
        toast.success('Medical Center updated successfully');
      } else {
        await createMedicalCenter(payload);
        toast.success('Medical Center registered successfully');
      }
      setShowModal(false);
      resetForm();
      await fetchCenters();
    } catch (err) {
      toast.error('Failed to save medical center');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical center?')) return;
    try {
      await deleteMedicalCenter(id);
      toast.success('Medical Center deleted');
      await fetchCenters();
    } catch (err) {
      toast.error('Failed to delete medical center');
    }
  };

  const filteredCenters = centers.filter((c) => {
    const q = search.toLowerCase().trim();
    return !q || [c.name, c.address, c.phone, c.email, String(c.id)]
      .some((value) => String(value || '').toLowerCase().includes(q));
  });

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    resetForm();
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 0 36px', color: C.ink, fontFamily: body }}>
      <div style={{ height: 3, width: 54, background: C.orange, marginBottom: 24 }} />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, background: C.blue, display: 'inline-block' }} />
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted }}>
              Admin / Directory
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(27px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '-0.045em', fontWeight: 700, margin: 0 }}>
            Medical Centers<span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ margin: '11px 0 0', maxWidth: 590, color: C.muted, fontSize: 14, lineHeight: 1.65 }}>
            Manage hospitals, partner clinics, contact details, and location coordinates from one directory.
          </p>
        </div>
        <button onClick={handleOpenCreate} style={{ ...buttonBase, background: C.blue, border: `1px solid ${C.blue}`, color: '#fff', minHeight: 43 }}>
          <Plus size={16} /> Add medical center
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ border: `1px solid ${C.border}`, padding: '17px 18px', background: C.paper, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: 34, background: C.blue }} />
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Total centers</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 7 }}>{loading ? '—' : centers.length}</div>
        </div>
        <div style={{ border: `1px solid ${C.border}`, padding: '17px 18px', background: C.paper, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: 34, background: C.orange }} />
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em' }}>With coordinates</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 7 }}>
            {loading ? '—' : centers.filter((c) => c.latitude != null && c.latitude !== '' && c.longitude != null && c.longitude !== '').length}
          </div>
        </div>
        <div style={{ border: `1px solid ${C.border}`, padding: '17px 18px', background: C.paper, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: 34, background: '#8B98A5' }} />
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Contact records</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', marginTop: 7 }}>
            {loading ? '—' : centers.filter((c) => c.phone || c.email).length}
          </div>
        </div>
      </div>

      <section style={{ border: `1px solid ${C.border}`, background: C.paper }}>
        <div style={{ padding: '15px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Building2 size={17} color={C.blue} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Registered locations</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, border: `1px solid ${C.border}`, padding: '3px 7px' }}>{filteredCenters.length} records</span>
          </div>
          <div style={{ position: 'relative', width: 'min(100%, 300px)' }}>
            <Search size={15} color={C.muted} style={{ position: 'absolute', left: 11, top: 12 }} />
            <input
              aria-label="Search medical centers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, address, contact…"
              style={{ ...inputStyle, padding: '10px 12px 10px 34px', fontSize: 12 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '62px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: C.muted }}>
            <LoaderCircle size={25} color={C.blue} style={{ animation: 'dc-spin 1s linear infinite' }} />
            <span style={{ fontFamily: mono, fontSize: 11 }}>LOADING DIRECTORY…</span>
          </div>
        ) : filteredCenters.length === 0 ? (
          <div style={{ padding: '56px 20px', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 15px', width: 48, height: 48, display: 'grid', placeItems: 'center', background: C.blueSoft, color: C.blue }}>
              <Building2 size={22} />
            </div>
            <h3 style={{ margin: '0 0 7px', fontSize: 16, letterSpacing: '-0.02em' }}>
              {search ? 'No matching centers' : 'No centers registered yet'}
            </h3>
            <p style={{ margin: '0 auto 18px', color: C.muted, fontSize: 13, maxWidth: 390, lineHeight: 1.6 }}>
              {search ? 'Try another name, address, ID, phone number, or email.' : 'Add your first medical center to start building the directory.'}
            </p>
            {!search && <button onClick={handleOpenCreate} style={{ ...buttonBase, background: C.blue, color: '#fff', border: `1px solid ${C.blue}` }}><Plus size={15} /> Add medical center</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 0 }}>
            {filteredCenters.map((c, index) => (
              <article key={c.id} style={{ padding: 21, borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, minWidth: 0, background: C.paper }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', background: index % 2 === 0 ? C.blueSoft : C.orangeSoft, color: index % 2 === 0 ? C.blue : C.orange }}>
                      <Building2 size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: '1px 0 7px', fontSize: 15, lineHeight: 1.4, letterSpacing: '-0.025em', overflowWrap: 'anywhere' }}>{c.name}</h3>
                      <span style={{ fontFamily: mono, color: C.muted, fontSize: 10 }}>CENTER ID / {c.id}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button aria-label={`Edit ${c.name}`} title="Edit center" onClick={() => handleOpenEdit(c)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: `1px solid ${C.border}`, background: '#fff', color: C.blue, cursor: 'pointer' }}>
                      <Pencil size={14} />
                    </button>
                    <button aria-label={`Delete ${c.name}`} title="Delete center" onClick={() => handleDelete(c.id)} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: `1px solid #F0D8D8`, background: '#fff', color: C.danger, cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ height: 1, background: C.border, margin: '18px 0 15px' }} />
                <div style={{ display: 'grid', gap: 12, fontSize: 12, lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.ink }}>
                    <MapPin size={15} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ overflowWrap: 'anywhere' }}>{c.address || 'No address provided'}</span>
                  </div>
                  {c.phone && <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: C.muted }}><Phone size={14} color={C.muted} /><span>{c.phone}</span></div>}
                  {c.email && <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: C.muted, minWidth: 0 }}><Mail size={14} color={C.muted} /><span style={{ overflowWrap: 'anywhere' }}>{c.email}</span></div>}
                </div>

                <div style={{ marginTop: 17, padding: '10px 11px', background: C.soft, border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.muted }}>
                    <LocateFixed size={14} />
                    <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.04em' }}>GEO COORDINATES</span>
                  </div>
                  {c.latitude != null && c.latitude !== '' && c.longitude != null && c.longitude !== '' ? (
                    <span style={{ fontFamily: mono, fontSize: 10, color: C.ink }}>
                      {Number(c.latitude).toFixed(4)}, {Number(c.longitude).toFixed(4)}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: C.muted }}>Not added</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && centers.length > 0 && (
          <div style={{ padding: '11px 18px', borderTop: `1px solid ${C.border}`, background: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.08em', color: C.muted }}>DOCConnect / ADMIN DIRECTORY</span>
            <span style={{ fontSize: 11, color: C.muted }}>Showing {filteredCenters.length} of {centers.length} centers</span>
          </div>
        )}
      </section>

      {showModal && (
        <div
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,32,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="medical-center-modal-title" style={{ width: '100%', maxWidth: 570, maxHeight: '92vh', overflowY: 'auto', background: C.paper, border: `1px solid ${C.border}`, boxShadow: '0 24px 80px rgba(16,24,32,.2)' }}>
            <div style={{ padding: '20px 23px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.12em', color: C.blue, textTransform: 'uppercase', marginBottom: 8 }}>
                  {editingCenter ? 'Update directory record' : 'New directory record'}
                </div>
                <h2 id="medical-center-modal-title" style={{ margin: 0, fontSize: 22, letterSpacing: '-.04em' }}>
                  {editingCenter ? 'Edit medical center' : 'Add medical center'}<span style={{ color: C.orange }}>.</span>
                </h2>
                <p style={{ margin: '7px 0 0', fontSize: 12, lineHeight: 1.6, color: C.muted }}>Enter the location and contact information for this facility.</p>
              </div>
              <button type="button" aria-label="Close dialog" onClick={closeModal} disabled={saving} style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: '#fff', border: `1px solid ${C.border}`, color: C.muted, cursor: saving ? 'not-allowed' : 'pointer' }}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '22px 23px 24px', display: 'grid', gap: 17 }}>
                <div>
                  <label htmlFor="center-name" style={labelStyle}>Center name <span style={{ color: C.orange }}>*</span></label>
                  <input id="center-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Central Medical Clinic" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="center-address" style={labelStyle}>Full address <span style={{ color: C.orange }}>*</span></label>
                  <textarea id="center-address" rows={3} required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, city, postal code" style={{ ...inputStyle, resize: 'vertical', minHeight: 86, lineHeight: 1.5 }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                    <LocateFixed size={14} color={C.blue} />
                    <span style={{ ...labelStyle, marginBottom: 0 }}>Geographical coordinates</span>
                    <span style={{ fontSize: 10, color: C.muted }}>(optional)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div><label htmlFor="center-latitude" style={labelStyle}>Latitude</label><input id="center-latitude" type="number" step="any" min="-90" max="90" placeholder="18.5204" value={latitude} onChange={(e) => setLatitude(e.target.value)} style={inputStyle} /></div>
                    <div><label htmlFor="center-longitude" style={labelStyle}>Longitude</label><input id="center-longitude" type="number" step="any" min="-180" max="180" placeholder="73.8567" value={longitude} onChange={(e) => setLongitude(e.target.value)} style={inputStyle} /></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div><label htmlFor="center-phone" style={labelStyle}>Phone number</label><input id="center-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 00000 00000" style={inputStyle} /></div>
                  <div><label htmlFor="center-email" style={labelStyle}>Contact email</label><input id="center-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@clinic.com" style={inputStyle} /></div>
                </div>
              </div>
              <div style={{ padding: '15px 23px', background: C.soft, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '.07em', color: C.muted }}>FIELDS MARKED * ARE REQUIRED</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={closeModal} disabled={saving} style={{ ...buttonBase, background: '#fff', color: C.ink, border: `1px solid ${C.border}`, opacity: saving ? .6 : 1 }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ ...buttonBase, background: C.blue, color: '#fff', border: `1px solid ${C.blue}`, minWidth: 135, opacity: saving ? .7 : 1, cursor: saving ? 'wait' : 'pointer' }}>
                    {saving ? <LoaderCircle size={14} /> : editingCenter ? <Pencil size={14} /> : <Plus size={15} />}
                    {saving ? 'Saving…' : editingCenter ? 'Update center' : 'Save center'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dc-spin { to { transform: rotate(360deg); } }
        @media (max-width: 560px) {
          .medical-centers-responsive { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>
    </div>
  );
}
