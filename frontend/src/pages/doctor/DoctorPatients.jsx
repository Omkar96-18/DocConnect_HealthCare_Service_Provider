import React, { useEffect, useState } from 'react';
import { getPrescriptions, createPrescription } from '../../api/prescriptions';
import { getPatients } from '../../api/doctors';
import { FileText, Plus, QrCode, CheckCircle, Clock, Trash2, X, CalendarDays, UserRound, Pill, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const C = {
  paper: '#FFFFFF',
  ink: '#101820',
  blue: '#1769D2',
  orange: '#F07838',
  muted: '#6E7882',
  border: '#DCE2E7',
  soft: '#F5F8FA',
  blueSoft: '#EEF5FD',
  green: '#16805D',
  greenSoft: '#EAF6F0',
  amber: '#9A6200',
  amberSoft: '#FFF5E5',
  red: '#B83B36',
};
const mono = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";
const ui = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 40,
  padding: '10px 14px',
  borderRadius: 5,
  fontFamily: mono,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.025em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'background 150ms ease, border-color 150ms ease',
};

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  background: C.paper,
  color: C.ink,
  fontFamily: ui,
  fontSize: 13,
  outlineColor: C.blue,
};

const labelStyle = {
  display: 'block',
  marginBottom: 7,
  fontFamily: mono,
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.07em',
  color: C.muted,
};

function patientName(patient, fallback) {
  if (patient?.first_name) return `${patient.first_name} ${patient.last_name || ''}`.trim();
  return patient?.username || fallback || 'Patient';
}

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rxRes, patRes] = await Promise.all([getPrescriptions(), getPatients()]);
      const rxList = Array.isArray(rxRes.data) ? rxRes.data : (rxRes.data?.results ?? []);
      const patList = Array.isArray(patRes.data) ? patRes.data : (patRes.data?.results ?? []);
      setPrescriptions(rxList);
      setPatients(patList);
      if (patList.length > 0 && !selectedPatientId) {
        const firstId = patList[0].patient_info?.id || patList[0].patient;
        setSelectedPatientId(firstId ? String(firstId) : '');
      }
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines((current) => [
      ...current,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines((current) => current.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((current) => current.map((medicine, i) => (
      i === index ? { ...medicine, [field]: value } : medicine
    )));
  };

  const resetForm = () => {
    setDiagnosis('');
    setNotes('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    const validMeds = medicines.filter((medicine) => medicine.name.trim() !== '');
    if (validMeds.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    setSubmitting(true);
    try {
      await createPrescription({
        patient: selectedPatientId,
        diagnosis,
        notes,
        medicines: validMeds,
      });
      toast.success('Prescription generated with secure QR/Barcode!');
      setShowCreateModal(false);
      resetForm();
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const closeCreateModal = () => {
    if (submitting) return;
    setShowCreateModal(false);
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 0 32px', color: C.ink, fontFamily: ui }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        .dprx-card { transition: border-color 150ms ease, transform 150ms ease; }
        .dprx-card:hover { border-color: #AABED0 !important; transform: translateY(-1px); }
        .dprx-action:focus-visible, .dprx-field:focus-visible { outline: 2px solid ${C.blue}; outline-offset: 2px; }
        .dprx-action:disabled { opacity: .6; cursor: not-allowed; }
        .dprx-overlay { animation: dprx-fade 140ms ease-out; }
        @keyframes dprx-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 760px) {
          .dprx-header { align-items: flex-start !important; flex-direction: column !important; }
          .dprx-rx-header { align-items: flex-start !important; flex-direction: column !important; }
          .dprx-med-grid { grid-template-columns: 1fr 1fr !important; }
          .dprx-modal { padding: 18px !important; }
          .dprx-modal-inner { padding: 18px !important; }
        }
        @media (max-width: 460px) {
          .dprx-med-grid { grid-template-columns: 1fr !important; }
          .dprx-medicine-title { align-items: flex-start !important; flex-direction: column !important; }
        }
      `}</style>

      <header className="dprx-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 25 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <span style={{ height: 3, width: 22, background: C.orange, display: 'inline-block' }} />
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '.13em', color: C.muted, textTransform: 'uppercase' }}>Doctor workspace / medication records</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(26px, 3vw, 33px)', lineHeight: 1.2, letterSpacing: '-.04em', fontWeight: 800 }}>
            Prescriptions<span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ margin: '9px 0 0', color: C.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 650 }}>
            Create digital prescriptions and review assistant validation status and secure QR/barcode details.
          </p>
        </div>
        <button
          className="dprx-action"
          type="button"
          onClick={() => setShowCreateModal(true)}
          style={{ ...buttonStyle, background: C.blue, color: '#FFFFFF', border: `1px solid ${C.blue}`, whiteSpace: 'nowrap' }}
        >
          <Plus size={16} /> Generate prescription
        </button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Issued prescriptions', value: prescriptions.length, icon: <FileText size={17} />, accent: C.blue },
          { label: 'Validated', value: prescriptions.filter((rx) => rx.is_validated).length, icon: <CheckCircle size={17} />, accent: C.green },
          { label: 'Awaiting validation', value: prescriptions.filter((rx) => !rx.is_validated).length, icon: <Clock size={17} />, accent: C.orange },
        ].map((stat) => (
          <div key={stat.label} style={{ position: 'relative', overflow: 'hidden', border: `1px solid ${C.border}`, background: C.paper, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase' }}>{stat.label}</span>
              <span style={{ color: stat.accent }}>{stat.icon}</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 29, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.04em' }}>{stat.value}</div>
            <span style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: 42, background: stat.accent }} />
          </div>
        ))}
      </section>

      <section style={{ border: `1px solid ${C.border}`, background: C.paper }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '17px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 750 }}>Issued prescription records</h2>
            <p style={{ margin: '5px 0 0', fontSize: 12, color: C.muted }}>QR/barcode validation is handled by authorized assistants.</p>
          </div>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>{prescriptions.length} record{prescriptions.length === 1 ? '' : 's'}</span>
        </div>

        {loading ? (
          <div style={{ padding: 58, textAlign: 'center', color: C.muted, fontFamily: mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading prescription records…</div>
        ) : prescriptions.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, display: 'grid', placeItems: 'center', margin: '0 auto 14px', background: C.soft, border: `1px solid ${C.border}`, color: C.muted }}><FileText size={23} /></div>
            <h3 style={{ margin: 0, fontSize: 16 }}>No prescriptions issued yet</h3>
            <p style={{ margin: '7px 0 18px', fontSize: 13, color: C.muted }}>Create a prescription to add a record to this list.</p>
            <button className="dprx-action" type="button" onClick={() => setShowCreateModal(true)} style={{ ...buttonStyle, background: C.blue, color: '#FFFFFF', border: `1px solid ${C.blue}` }}><Plus size={15} /> Generate prescription</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
            {prescriptions.map((rx) => {
              const name = patientName(rx.patient_info, `Patient #${rx.patient}`);
              const validated = Boolean(rx.is_validated);
              const medicineList = Array.isArray(rx.medicines) ? rx.medicines : [];
              return (
                <article className="dprx-card" key={rx.id} style={{ padding: 20, borderBottom: `1px solid ${C.border}` }}>
                  <div className="dprx-rx-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 9 }}>
                        <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.4, fontWeight: 750, overflowWrap: 'anywhere' }}>Rx for {name}</h3>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 8px', background: validated ? C.greenSoft : C.amberSoft, color: validated ? C.green : C.amber, border: `1px solid ${validated ? '#C9E9DA' : '#F0DFBD'}`, fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.035em' }}>
                          {validated ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {validated ? 'Validated by assistant' : 'Pending validation'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 7, fontSize: 11, color: C.muted }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CalendarDays size={13} /> {dateLabel(rx.created_at)}</span>
                        <span style={{ color: C.border }}>•</span>
                        <span>Prescription ID: <code style={{ color: C.ink, background: C.soft, border: `1px solid ${C.border}`, padding: '3px 5px', overflowWrap: 'anywhere' }}>{rx.id}</code></span>
                      </div>
                    </div>
                    <button className="dprx-action" type="button" onClick={() => setSelectedBarcode(rx)} style={{ ...buttonStyle, flex: '0 0 auto', background: C.paper, color: C.blue, border: `1px solid #B9D1F0` }}><QrCode size={15} /> View QR / barcode</button>
                  </div>

                  {rx.diagnosis && (
                    <div style={{ display: 'flex', gap: 9, marginTop: 17, padding: '11px 13px', borderLeft: `3px solid ${C.orange}`, background: '#FFFAF6', fontSize: 13, lineHeight: 1.5 }}>
                      <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', flex: '0 0 auto', paddingTop: 2 }}>Diagnosis</span>
                      <span>{rx.diagnosis}</span>
                    </div>
                  )}

                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                      <Pill size={15} color={C.blue} />
                      <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em' }}>Prescribed medicines</span>
                    </div>
                    {medicineList.length ? (
                      <div style={{ overflowX: 'auto', border: `1px solid ${C.border}` }}>
                        <div style={{ minWidth: 650 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr .8fr 1fr .8fr 1.5fr', gap: 12, padding: '9px 12px', background: C.soft, borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Duration</span><span>Instructions</span>
                          </div>
                          {medicineList.map((med, idx) => (
                            <div key={`${rx.id}-med-${idx}`} style={{ display: 'grid', gridTemplateColumns: '1.35fr .8fr 1fr .8fr 1.5fr', gap: 12, padding: '11px 12px', borderBottom: idx < medicineList.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 12, lineHeight: 1.5 }}>
                              <span style={{ fontWeight: 700, color: C.ink }}>{med.name || '—'}</span><span>{med.dosage || '—'}</span><span>{med.frequency || '—'}</span><span>{med.duration || '—'}</span><span style={{ color: C.muted }}>{med.instructions || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <p style={{ fontSize: 12, color: C.muted }}>No medicine details available.</p>}
                  </div>
                  {rx.notes && <div style={{ marginTop: 14, padding: '12px 14px', background: C.soft, border: `1px solid ${C.border}`, fontSize: 12, lineHeight: 1.6 }}><strong style={{ color: C.ink }}>Doctor advice: </strong><span style={{ color: C.muted }}>{rx.notes}</span></div>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: C.muted, fontSize: 11, lineHeight: 1.5 }}>
        <ShieldCheck size={14} color={C.blue} />
        <span>Barcode validation status is displayed from the prescription record returned by the server.</span>
      </div>

      {selectedBarcode && (
        <div className="dprx-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedBarcode(null); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(16,24,32,.56)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, overflowY: 'auto' }}>
          <section role="dialog" aria-modal="true" aria-labelledby="dprx-barcode-title" style={{ background: C.paper, border: `1px solid ${C.border}`, width: '100%', maxWidth: 460, maxHeight: 'calc(100vh - 36px)', overflowY: 'auto', padding: 24, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 19 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.orange, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Prescription security</div>
                <h2 id="dprx-barcode-title" style={{ margin: 0, fontSize: 19, letterSpacing: '-.025em' }}>Validation barcode<span style={{ color: C.orange }}>.</span></h2>
              </div>
              <button className="dprx-action" type="button" aria-label="Close barcode dialog" onClick={() => setSelectedBarcode(null)} style={{ background: C.paper, color: C.muted, border: `1px solid ${C.border}`, minHeight: 34, padding: 7, cursor: 'pointer' }}><X size={17} /></button>
            </div>
            {selectedBarcode.barcode_image_url || selectedBarcode.barcode_image ? (
              <img
                src={selectedBarcode.barcode_image_url || (selectedBarcode.barcode_image?.startsWith('http') ? selectedBarcode.barcode_image : `http://localhost:8000${selectedBarcode.barcode_image}`)}
                alt="Prescription QR Code"
                style={{ width: 220, height: 220, objectFit: 'contain', margin: '0 auto', display: 'block', border: `1px solid ${C.border}`, padding: 8, boxSizing: 'border-box' }}
              />
            ) : (
              <div style={{ minHeight: 220, display: 'grid', placeItems: 'center', padding: 20, background: C.soft, border: `1px dashed ${C.border}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>QR image is being generated or is unavailable.</div>
            )}
            <div style={{ marginTop: 20 }}>
              <label style={labelStyle}>Barcode data code</label>
              <code style={{ display: 'block', overflowWrap: 'anywhere', padding: 12, background: C.soft, border: `1px solid ${C.border}`, fontSize: 12, color: C.ink }}>{selectedBarcode.barcode_data || selectedBarcode.id}</code>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 15, padding: 12, background: C.greenSoft, border: '1px solid #C9E9DA', color: C.green, fontSize: 11, lineHeight: 1.55 }}>
              <ShieldCheck size={15} style={{ flex: '0 0 auto', marginTop: 1 }} />
              <span>Only authorized assistants can decode and validate this barcode at the pharmacy/counter.</span>
            </div>
          </section>
        </div>
      )}

      {showCreateModal && (
        <div className="dprx-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closeCreateModal(); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(16,24,32,.56)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, overflowY: 'auto' }}>
          <section className="dprx-modal-inner" role="dialog" aria-modal="true" aria-labelledby="dprx-create-title" style={{ background: C.paper, border: `1px solid ${C.border}`, width: '100%', maxWidth: 800, maxHeight: 'calc(100vh - 36px)', overflowY: 'auto', padding: 25, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 15, marginBottom: 22 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}><span style={{ width: 20, height: 3, background: C.orange }} /><span style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase' }}>New medication record</span></div>
                <h2 id="dprx-create-title" style={{ margin: 0, fontSize: 22, letterSpacing: '-.035em' }}>Generate prescription<span style={{ color: C.orange }}>.</span></h2>
                <p style={{ margin: '7px 0 0', fontSize: 12, lineHeight: 1.5, color: C.muted }}>Enter the patient, diagnosis, medicines, and clinical advice.</p>
              </div>
              <button className="dprx-action" type="button" aria-label="Close create prescription dialog" disabled={submitting} onClick={closeCreateModal} style={{ background: C.paper, color: C.muted, border: `1px solid ${C.border}`, minHeight: 34, padding: 7 }}><X size={17} /></button>
            </div>

            <form onSubmit={handleCreatePrescription}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Select patient</label>
                  <select className="dprx-field" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} style={fieldStyle} required>
                    <option value="">— Choose patient —</option>
                    {patients.map((p) => {
                      const pat = p.patient_info || {};
                      const patId = pat.id || p.patient;
                      const patName = patientName(pat, `Patient #${p.patient}`);
                      return <option key={p.id} value={patId}>{patName} ({pat.email || 'No email'})</option>;
                    })}
                  </select>
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Clinical diagnosis</label>
                  <input className="dprx-field" type="text" placeholder="e.g. Hypertension, viral bronchitis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} style={fieldStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div className="dprx-medicine-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14 }}>Prescribed medicines</h3>
                    <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 11 }}>Add at least one medicine name before issuing.</p>
                  </div>
                  <button className="dprx-action" type="button" onClick={handleAddMedicine} style={{ ...buttonStyle, minHeight: 34, padding: '7px 10px', background: C.blueSoft, color: C.blue, border: '1px solid #C9DDF6' }}><Plus size={14} /> Add medicine</button>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {medicines.map((med, idx) => (
                    <div key={idx} style={{ padding: 13, border: `1px solid ${C.border}`, background: C.paper }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 11 }}>
                        <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em' }}>Medicine {String(idx + 1).padStart(2, '0')}</span>
                        {medicines.length > 1 && <button className="dprx-action" type="button" aria-label={`Remove medicine ${idx + 1}`} onClick={() => handleRemoveMedicine(idx)} style={{ minHeight: 30, padding: '5px 8px', background: C.paper, border: '1px solid #F0D1CF', color: C.red, fontSize: 10 }}><Trash2 size={13} /> Remove</button>}
                      </div>
                      <div className="dprx-med-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 10 }}>
                        <div><label style={labelStyle}>Medicine name *</label><input className="dprx-field" type="text" placeholder="Medicine name" value={med.name} onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)} style={fieldStyle} required /></div>
                        <div><label style={labelStyle}>Dosage</label><input className="dprx-field" type="text" placeholder="e.g. 500 mg" value={med.dosage} onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)} style={fieldStyle} /></div>
                        <div><label style={labelStyle}>Frequency</label><input className="dprx-field" type="text" placeholder="e.g. Twice daily" value={med.frequency} onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)} style={fieldStyle} /></div>
                        <div><label style={labelStyle}>Duration</label><input className="dprx-field" type="text" placeholder="e.g. 5 days" value={med.duration} onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)} style={fieldStyle} /></div>
                        <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Instructions</label><input className="dprx-field" type="text" placeholder="e.g. After meals" value={med.instructions} onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)} style={fieldStyle} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Doctor advice / instructions</label>
                <textarea className="dprx-field" rows={3} placeholder="Additional lifestyle advice, dietary precautions, follow-up date…" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.55 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${C.border}`, paddingTop: 17 }}>
                <button className="dprx-action" type="button" disabled={submitting} onClick={closeCreateModal} style={{ ...buttonStyle, background: C.paper, color: C.ink, border: `1px solid ${C.border}` }}>Cancel</button>
                <button className="dprx-action" type="submit" disabled={submitting} style={{ ...buttonStyle, background: C.blue, color: '#FFFFFF', border: `1px solid ${C.blue}` }}>
                  <Plus size={15} /> {submitting ? 'Issuing…' : 'Generate barcode & issue'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}