import React, { useEffect, useState } from 'react';
import {
  getMedicalCenters,
  createMedicalCenter,
  updateMedicalCenter,
  deleteMedicalCenter,
} from '../../api/admin';
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, Mail, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MedicalCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);

  // Form states
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

  const handleOpenCreate = () => {
    setEditingCenter(null);
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setPhone('');
    setEmail('');
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCenter(c);
    setName(c.name);
    setAddress(c.address);
    setLatitude(c.latitude ?? '');
    setLongitude(c.longitude ?? '');
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone,
      email,
    };

    try {
      if (editingCenter) {
        await updateMedicalCenter(editingCenter.id, payload);
        toast.success('Medical Center updated successfully');
      } else {
        await createMedicalCenter(payload);
        toast.success('Medical Center registered successfully');
      }
      setShowModal(false);
      fetchCenters();
    } catch (err) {
      toast.error('Failed to save medical center');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical center?')) return;
    try {
      await deleteMedicalCenter(id);
      toast.success('Medical Center deleted');
      fetchCenters();
    } catch (err) {
      toast.error('Failed to delete medical center');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Medical Centers Directory</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>
            Manage hospital branches, partner clinics, and geographical coordinates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Plus size={18} /> Add Medical Center
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading medical centers...</div>
      ) : centers.length === 0 ? (
        <div style={{ background: '#fff', padding: 60, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
          No medical centers registered yet. Click "Add Medical Center" above to add one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16 }}>
          {centers.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: '#e0f2fe', padding: 10, borderRadius: 8, color: '#0284c7' }}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{c.name}</h3>
                      <span style={{ fontSize: 12, color: '#64748b' }}>ID #{c.id}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px', cursor: 'pointer', color: '#475569' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '6px', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <MapPin size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{c.address}</span>
                  </div>
                  {c.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={16} color="#64748b" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={16} color="#64748b" />
                      <span>{c.email}</span>
                    </div>
                  )}
                  {c.latitude && c.longitude && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      Coordinates: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 520, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {editingCenter ? 'Edit Medical Center' : 'Add New Medical Center'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Center Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Full Address</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="28.6139"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="77.2090"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingCenter ? 'Update Center' : 'Save Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
