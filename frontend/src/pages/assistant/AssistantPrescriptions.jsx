import React, { useEffect, useState } from 'react';
import { getPrescriptions, validatePrescription } from '../../api/prescriptions';
import axiosInstance from '../../api/axiosInstance';
import { QrCode, CheckCircle, Clock, ShieldCheck, Search, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AssistantPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedBarcodeModal, setSelectedBarcodeModal] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getPrescriptions();
      setPrescriptions(res.data || []);
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateBarcode = async (codeToVerify) => {
    const code = (codeToVerify || barcodeInput).trim();
    if (!code) {
      toast.error('Please enter or scan the barcode/QR code');
      return;
    }
    setValidating(true);
    try {
      await axiosInstance.post('/prescriptions/validate-barcode/', { barcode: code });
      toast.success('✓ Prescription verified & validated successfully via Barcode Decoder!');
      setBarcodeInput('');
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid Barcode Data: verification failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleValidate = async (rxId, barcodeToVerify) => {
    setValidating(true);
    try {
      await validatePrescription(rxId, barcodeToVerify ? barcodeToVerify.trim() : '');
      toast.success('✓ Prescription validated successfully!');
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const unvalidatedList = prescriptions.filter((r) => !r.is_validated);
  const validatedList = prescriptions.filter((r) => r.is_validated);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Prescription Barcode Validation Desk
        </h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Assistants validate encoded doctor prescriptions using the secure QR / Barcode Decoder System.
        </p>
      </div>

      {/* Barcode Quick Scanner Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          borderRadius: 16,
          padding: 24,
          color: '#fff',
          marginBottom: 28,
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <QrCode size={26} color="#fff" />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Quick Barcode / QR Scanner Input</h2>
        </div>
        <p style={{ fontSize: 13, opacity: 0.9, margin: '0 0 16px', maxWidth: 700 }}>
          Scan the QR barcode presented by the patient or enter the unique Prescription Barcode Token to authenticate medicines at the clinic or pharmacy counter.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleValidateBarcode();
          }}
          style={{ display: 'flex', gap: 12, maxWidth: 650 }}
        >
          <input
            type="text"
            placeholder="Scan or enter Barcode Code (UUID / Token)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              outline: 'none',
              color: '#0f172a',
            }}
          />
          <button
            type="submit"
            disabled={validating}
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: validating ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {validating ? 'Validating...' : 'Decode & Validate'}
          </button>
        </form>
      </div>

      {/* Unvalidated Prescriptions */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
          Awaiting Verification ({unvalidatedList.length})
        </h2>

        {unvalidatedList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            All prescriptions have been verified and validated.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {unvalidatedList.map((rx) => {
              const pat = rx.patient_info || {};
              const patName = pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${rx.patient}`);
              const docName = rx.doctor_info?.name || 'Assigned Doctor';
              const qrUrl = rx.barcode_image_url || (rx.barcode_image?.startsWith('http') ? rx.barcode_image : (rx.barcode_image ? `http://localhost:8000${rx.barcode_image}` : null));

              return (
                <div
                  key={rx.id}
                  style={{
                    border: '1px solid #fde68a',
                    background: '#fffdf5',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        Patient: {patName}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>
                        AWAITING VALIDATION
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Prescribed by Dr. {docName} • Issued on {new Date(rx.created_at).toLocaleDateString()}
                    </div>

                    {rx.diagnosis && (
                      <div style={{ fontSize: 13, color: '#334155', marginTop: 8 }}>
                        <strong>Diagnosis:</strong> {rx.diagnosis}
                      </div>
                    )}

                    {/* Medicines Preview */}
                    <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: 10, border: '1px solid #fef3c7' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>MEDICINES LIST:</div>
                      {rx.medicines?.map((m, idx) => (
                        <div key={idx} style={{ fontSize: 13, color: '#1e293b' }}>
                          • <strong>{m.name}</strong> - {m.dosage} ({m.frequency}, {m.duration}) {m.instructions && `[${m.instructions}]`}
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                      Barcode Token: <code>{rx.barcode_data || rx.id}</code>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <button
                      onClick={() => handleValidateBarcode(rx.barcode_data || rx.id)}
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <ShieldCheck size={16} /> Validate Barcode
                    </button>
                    {qrUrl && (
                      <button
                        onClick={() => setSelectedBarcodeModal(rx)}
                        style={{
                          background: '#fff',
                          color: '#0284c7',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <QrCode size={14} /> View QR Code
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Validated Prescriptions History */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
          Validated Prescriptions ({validatedList.length})
        </h2>

        {validatedList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            No validated prescriptions yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Patient</th>
                  <th style={{ padding: '12px 16px' }}>Doctor</th>
                  <th style={{ padding: '12px 16px' }}>Diagnosis</th>
                  <th style={{ padding: '12px 16px' }}>Validated At</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {validatedList.map((rx) => {
                  const pat = rx.patient_info || {};
                  const patName = pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${rx.patient}`);
                  const docName = rx.doctor_info?.name || 'Doctor';

                  return (
                    <tr key={rx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                        {patName}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        Dr. {docName}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{rx.diagnosis || 'General'}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {rx.validated_at ? new Date(rx.validated_at).toLocaleString() : 'Validated'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
                          ✓ Validated
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedBarcodeModal && (
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
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Prescription QR Code</h3>
              <button onClick={() => setSelectedBarcodeModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            {selectedBarcodeModal.barcode_image_url || selectedBarcodeModal.barcode_image ? (
              <img
                src={
                  selectedBarcodeModal.barcode_image_url ||
                  (selectedBarcodeModal.barcode_image?.startsWith('http')
                    ? selectedBarcodeModal.barcode_image
                    : `http://localhost:8000${selectedBarcodeModal.barcode_image}`)
                }
                alt="Prescription QR"
                style={{ width: 220, height: 220, margin: '0 auto', display: 'block', borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            ) : (
              <div style={{ padding: 40, background: '#f8fafc', borderRadius: 8 }}>QR Image Generating...</div>
            )}
            <div style={{ marginTop: 14, fontSize: 12, color: '#64748b' }}>
              Barcode Token:
            </div>
            <code style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontSize: 13, display: 'inline-block', marginTop: 4 }}>
              {selectedBarcodeModal.barcode_data || selectedBarcodeModal.id}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
