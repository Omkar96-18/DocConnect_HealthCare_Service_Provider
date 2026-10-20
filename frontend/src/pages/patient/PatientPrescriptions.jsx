import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getPrescriptions } from '../../api/prescriptions';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FileText, CheckCircle, Clock, QrCode, X, ShieldCheck } from 'lucide-react';

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

  const styles = {
    page: {
      maxWidth: 1100,
      margin: '0 auto',
      color: COLORS.ink,
      fontFamily: mono,
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
      marginBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1.25,
      margin: 0,
      color: COLORS.ink,
    },
    subtitle: {
      color: COLORS.muted,
      fontSize: 12,
      lineHeight: 1.8,
      margin: '7px 0 0',
      maxWidth: 720,
    },
    label: {
      color: COLORS.muted,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    primaryButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '10px 12px',
      border: `1px solid ${COLORS.blue}`,
      borderRadius: 2,
      background: COLORS.blue,
      color: COLORS.paper,
      fontFamily: mono,
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
    },
    card: {
      background: COLORS.paper,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 2,
      padding: 19,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minWidth: 0,
    },
  };

  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <main style={styles.page}>
      <header style={{ marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={styles.eyebrow}>
          <span style={{ width: 20, height: 2, background: COLORS.orange }} />
          PATIENT PORTAL / MEDICATIONS
        </div>
        <h1 style={styles.title}>My Prescriptions<span style={{ color: COLORS.orange }}>.</span></h1>
        <p style={styles.subtitle}>
          Digital prescriptions issued by your doctors. Show the encoded QR barcode to your medical assistant for validation.
        </p>
      </header>

      {prescriptions.length === 0 ? (
        <section style={{ border: `1px solid ${COLORS.border}`, background: COLORS.paper, padding: '50px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `1px solid ${COLORS.border}`, background: COLORS.soft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 17, color: COLORS.blue }}>
            <FileText size={22} />
          </div>
          <div style={styles.eyebrow}>NO RECORDS FOUND</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink, margin: '0 0 8px' }}>
            No prescriptions issued yet
          </h2>
          <p style={{ ...styles.subtitle, margin: '0 auto', maxWidth: 440 }}>
            When your doctor writes a prescription, you will see the medicine regimen and encoded verification barcode here.
          </p>
        </section>
      ) : (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 13 }}>
          {prescriptions.map((prescription) => {
            const doctorName = prescription.doctor_info?.name
              ? (prescription.doctor_info.name.startsWith('Dr.') ? prescription.doctor_info.name : `Dr. ${prescription.doctor_info.name}`)
              : `Dr. #${prescription.doctor?.id || prescription.doctor}`;

            const validated = prescription.is_validated;

            return (
              <article key={prescription.id} style={styles.card}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.6, color: COLORS.ink, margin: 0, overflowWrap: 'anywhere' }}>
                        {doctorName}
                      </h2>
                      <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>
                        ISSUED / {new Date(prescription.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      flexShrink: 0,
                      padding: '5px 7px',
                      border: `1px solid ${validated ? '#B9D3F5' : '#F2D3A2'}`,
                      background: validated ? '#EEF5FF' : '#FFF7E8',
                      color: validated ? COLORS.blue : '#B66A12',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}>
                      {validated ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {validated ? 'Validated' : 'Pending Assistant'}
                    </span>
                  </div>

                  {prescription.diagnosis && (
                    <div style={{ borderLeft: `2px solid ${COLORS.orange}`, background: COLORS.soft, padding: '9px 11px', marginBottom: 13, fontSize: 11, lineHeight: 1.7, overflowWrap: 'anywhere' }}>
                      <div style={{ ...styles.label, marginBottom: 4 }}>Diagnosis</div>
                      {prescription.diagnosis}
                    </div>
                  )}

                  {prescription.medicines && prescription.medicines.length > 0 && (
                    <div style={{ marginBottom: 13 }}>
                      <div style={{ ...styles.label, marginBottom: 8 }}>
                        Prescribed Medicines [{prescription.medicines.length}]
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {prescription.medicines.map((medicine, index) => (
                          <div key={index} style={{ border: `1px solid ${COLORS.border}`, background: COLORS.paper, padding: '9px 10px' }}>
                            <div style={{ fontWeight: 700, fontSize: 11, color: COLORS.blue, overflowWrap: 'anywhere' }}>
                              {medicine.name}
                            </div>
                            <div style={{ color: COLORS.ink, fontSize: 10, marginTop: 5, lineHeight: 1.7 }}>
                              {medicine.dosage} · {medicine.frequency} · {medicine.duration}
                            </div>
                            {medicine.instructions && (
                              <div style={{ color: COLORS.muted, fontSize: 10, lineHeight: 1.7, marginTop: 5 }}>
                                {medicine.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.notes && (
                    <div style={{ fontSize: 10, lineHeight: 1.8, color: COLORS.muted, marginBottom: 12, overflowWrap: 'anywhere' }}>
                      <strong style={{ color: COLORS.ink }}>DOCTOR'S NOTE / </strong>{prescription.notes}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 13, marginTop: 8 }}>
                  <button onClick={() => setSelectedBarcode(prescription)} style={styles.primaryButton}>
                    <QrCode size={15} /> Present Validation Barcode
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selectedBarcode && (
        <div
          role="presentation"
          onClick={() => setSelectedBarcode(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(16, 24, 32, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="prescription-qr-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              padding: 24,
              textAlign: 'center',
              background: COLORS.paper,
              borderTop: `3px solid ${COLORS.orange}`,
              boxShadow: '0 22px 60px rgba(16, 24, 32, 0.2)',
              fontFamily: mono,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18, textAlign: 'left' }}>
              <div>
                <div style={{ ...styles.eyebrow, marginBottom: 7 }}>PRESCRIPTION / VERIFICATION</div>
                <h2 id="prescription-qr-title" style={{ margin: 0, fontSize: 16, color: COLORS.ink }}>
                  Digital Prescription QR<span style={{ color: COLORS.orange }}>.</span>
                </h2>
              </div>
              <button
                aria-label="Close QR dialog"
                onClick={() => setSelectedBarcode(null)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 7, border: `1px solid ${COLORS.border}`, borderRadius: 2, background: COLORS.paper, color: COLORS.ink, cursor: 'pointer' }}
              >
                <X size={16} />
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
                  maxWidth: '100%',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block',
                  border: `1px solid ${COLORS.border}`,
                  padding: 8,
                  boxSizing: 'border-box',
                  background: COLORS.paper,
                }}
              />
            ) : (
              <div style={{ padding: 32, border: `1px dashed ${COLORS.border}`, background: COLORS.soft, color: COLORS.muted, fontSize: 11 }}>
                QR Image Generating...
              </div>
            )}

            <div style={{ marginTop: 16, ...styles.label }}>Validation Barcode Code</div>
            <code style={{ display: 'inline-block', maxWidth: '100%', overflowWrap: 'anywhere', marginTop: 7, padding: '8px 10px', border: `1px solid ${COLORS.border}`, background: COLORS.soft, color: COLORS.ink, fontSize: 11 }}>
              {selectedBarcode.barcode_data || selectedBarcode.id}
            </code>

            <div style={{
              marginTop: 17,
              padding: '11px 12px',
              border: `1px solid ${selectedBarcode.is_validated ? '#B9D3F5' : '#F2D3A2'}`,
              background: selectedBarcode.is_validated ? '#EEF5FF' : '#FFF7E8',
              color: selectedBarcode.is_validated ? COLORS.blue : '#805015',
              fontSize: 10,
              lineHeight: 1.8,
              fontWeight: 600,
              textAlign: 'left',
            }}>
              {selectedBarcode.is_validated
                ? 'VALIDATED / Clinical assistant has verified this prescription.'
                : 'PENDING VALIDATION / Present this QR barcode to your medical assistant at the dispensary or counter.'}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
