import React, { useEffect, useState } from 'react';
import { getPrescriptions, createPrescription } from '../../api/prescriptions';
import { getPatients } from '../../api/doctors';
import { FileText, Plus, QrCode, CheckCircle, Clock, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);

  // New prescription form state
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
      const [rxRes, patRes] = await Promise.all([
        getPrescriptions(),
        getPatients(),
      ]);
      setPrescriptions(rxRes.data || []);
      const patList = patRes.data || [];
      setPatients(patList);
      if (patList.length > 0 && !selectedPatientId) {
        const firstId = patList[0].patient_info?.id || patList[0].patient;
        setSelectedPatientId(firstId);
      }
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    const validMeds = medicines.filter((m) => m.name.trim() !== '');
    if (validMeds.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    try {
      await createPrescription({
        patient: selectedPatientId,
        diagnosis,
        notes,
        medicines: validMeds,
      });
      toast.success('Prescription generated with secure QR/Barcode!');
      setShowCreateModal(false);
      // Reset form
      setDiagnosis('');
      setNotes('');
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create prescription');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Prescriptions</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>
            Generate digital prescriptions with encoded barcodes that only assistants can validate.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
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
          <Plus size={18} /> Generate Prescription
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div style={{ background: '#fff', padding: 60, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
          No prescriptions issued yet. Click "Generate Prescription" to issue one!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                      Rx for {rx.patient_info?.first_name ? `${rx.patient_info.first_name} ${rx.patient_info.last_name || ''}`.trim() : (rx.patient_info?.username || `Patient #${rx.patient}`)}
                    </span>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: rx.is_validated ? '#dcfce7' : '#fef3c7',
                        color: rx.is_validated ? '#166534' : '#92400e',
                      }}
                    >
                      {rx.is_validated ? 'Validated by Assistant' : 'Pending Assistant Validation'}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Prescription ID: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{rx.id}</code> • {new Date(rx.created_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBarcode(rx)}
                  style={{
                    background: '#f8fafc',
                    color: '#0ea5e9',
                    border: '1px solid #cbd5e1',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <QrCode size={16} /> View QR Barcode
                </button>
              </div>

              {rx.diagnosis && (
                <div style={{ marginTop: 12, fontSize: 14 }}>
                  <strong>Diagnosis:</strong> <span style={{ color: '#334155' }}>{rx.diagnosis}</span>
                </div>
              )}

              {/* Medicines List */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                  Prescribed Medicines
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
                  {rx.medicines?.map((med, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
                        gap: 10,
                        padding: '6px 0',
                        borderBottom: idx < rx.medicines.length - 1 ? '1px solid #e2e8f0' : 'none',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{med.name}</span>
                      <span style={{ color: '#475569' }}>{med.dosage || '-'}</span>
                      <span style={{ color: '#475569' }}>{med.frequency || '-'}</span>
                      <span style={{ color: '#475569' }}>{med.duration || '-'}</span>
                      <span style={{ color: '#64748b' }}>{med.instructions || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {rx.notes && (
                <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
                  <strong>Doctor Notes:</strong> {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR / Barcode Modal */}
      {selectedBarcode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 440, width: '90%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Prescription Validation Barcode</h3>
              <button onClick={() => setSelectedBarcode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            {selectedBarcode.barcode_image_url || selectedBarcode.barcode_image ? (
              <img
                src={
                  selectedBarcode.barcode_image_url ||
                  (selectedBarcode.barcode_image?.startsWith('http')
                    ? selectedBarcode.barcode_image
                    : `http://localhost:8000${selectedBarcode.barcode_image}`)
                }
                alt="Prescription QR Code"
                style={{ width: 220, height: 220, margin: '0 auto', display: 'block', borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            ) : (
              <div style={{ padding: 40, background: '#f8fafc', borderRadius: 8 }}>QR Image Generating...</div>
            )}

            <div style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
              Barcode Data Code:
            </div>
            <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, fontSize: 13, display: 'inline-block', marginTop: 4 }}>
              {selectedBarcode.barcode_data || selectedBarcode.id}
            </code>

            <p style={{ fontSize: 12, color: '#16a34a', marginTop: 14 }}>
              ✓ Only authorized assistants can decode and validate this barcode at the pharmacy/counter.
            </p>
          </div>
        </div>
      )}

      {/* Create Prescription Modal */}
      {showCreateModal && (
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
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              maxWidth: 700,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Create New Prescription</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription}>
              {/* Patient Selection */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Select Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => {
                    const pat = p.patient_info || {};
                    const patId = pat.id || p.patient;
                    const patName = pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${p.patient}`);
                    return (
                      <option key={p.id} value={patId}>
                        {patName} ({pat.email || 'No email'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Diagnosis */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Viral Bronchitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              {/* Medicines List */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Prescribed Medicines</label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Medicine
                  </button>
                </div>

                {medicines.map((med, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                    <input
                      type="text"
                      placeholder="Frequency (Twice daily)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                    <input
                      type="text"
                      placeholder="Instructions (After meals)"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Doctor Advice / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional lifestyle advice, dietary precautions, follow-up date..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 14 }}
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
                  Generate Barcode & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
