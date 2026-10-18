import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getPrescriptions } from '../../api/prescriptions';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FileText, CheckCircle, Clock, QrCode, X, ShieldCheck } from 'lucide-react';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarcode, setSelectedBarcode] = useState(null);

  useEffect(() => {
    getPrescriptions()
      .then(({ data }) => setPrescriptions(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          My Prescriptions
        </h1>
        <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 4 }}>
          Digital prescriptions issued by your doctors. Show the encoded QR barcode to your medical assistant for validation.
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: '60px 24px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: '#f1f5f9',
              color: '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <FileText size={26} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            No prescriptions issued yet
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
            When your doctor writes a prescription, you will see the medicine regimen and encoded verification barcode here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {prescriptions.map((p) => {
            const docName = p.doctor_info?.name
              ? (p.doctor_info.name.startsWith('Dr.') ? p.doctor_info.name : `Dr. ${p.doctor_info.name}`)
              : `Dr. #${p.doctor?.id || p.doctor}`;

            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{docName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Issued on {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 9px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: p.is_validated ? '#ecfdf5' : '#fffbeb',
                        color: p.is_validated ? '#047857' : '#b45309',
                        border: `1px solid ${p.is_validated ? '#a7f3d0' : '#fde68a'}`,
                      }}
                    >
                      {p.is_validated ? (
                        <><CheckCircle size={13} /> Validated</>
                      ) : (
                        <><Clock size={13} /> Pending Assistant</>
                      )}
                    </span>
                  </div>

                  {p.diagnosis && (
                    <div style={{ fontSize: 13, color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>
                      <strong>Diagnosis:</strong> {p.diagnosis}
                    </div>
                  )}

                  {/* Medicines List */}
                  {p.medicines && p.medicines.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                        Prescribed Medicines ({p.medicines.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {p.medicines.map((m, i) => (
                          <div key={i} style={{ padding: '8px 10px', background: '#f0f9ff', borderRadius: 8, fontSize: 12.5 }}>
                            <div style={{ fontWeight: 600, color: '#0369a1' }}>{m.name}</div>
                            <div style={{ color: '#475569', marginTop: 2 }}>
                              {m.dosage} · {m.frequency} · {m.duration}
                            </div>
                            {m.instructions && (
                              <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                                {m.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.notes && (
                    <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 12 }}>
                      Doctor's Note: {p.notes}
                    </div>
                  )}
                </div>

                {/* Show Barcode Action */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 6 }}>
                  <button
                    onClick={() => setSelectedBarcode(p)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <QrCode size={16} /> Present Validation Barcode
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barcode QR Modal */}
      {selectedBarcode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
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
              borderRadius: 20,
              padding: 28,
              maxWidth: 420,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                Digital Prescription QR
              </h3>
              <button
                onClick={() => setSelectedBarcode(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
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
                style={{
                  width: 220,
                  height: 220,
                  margin: '0 auto',
                  display: 'block',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  padding: 8,
                  background: '#fff',
                }}
              />
            ) : (
              <div style={{ padding: 40, background: '#f8fafc', borderRadius: 8, color: '#64748b' }}>
                QR Image Generating...
              </div>
            )}

            <div style={{ marginTop: 14, fontSize: 12, color: '#64748b' }}>
              Validation Barcode Code:
            </div>
            <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, fontSize: 12.5, display: 'inline-block', marginTop: 4 }}>
              {selectedBarcode.barcode_data || selectedBarcode.id}
            </code>

            <div
              style={{
                marginTop: 16,
                padding: '10px 12px',
                borderRadius: 8,
                background: selectedBarcode.is_validated ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${selectedBarcode.is_validated ? '#a7f3d0' : '#fde68a'}`,
                fontSize: 12.5,
                color: selectedBarcode.is_validated ? '#047857' : '#92400e',
                fontWeight: 600,
              }}
            >
              {selectedBarcode.is_validated
                ? '✓ Validated by Clinical Assistant'
                : 'Present this QR barcode to your medical assistant at dispensary/counter'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
