import React, { useEffect, useMemo, useState } from 'react';
import { getPrescriptions, validatePrescription } from '../../api/prescriptions';
import axiosInstance from '../../api/axiosInstance';
import {
  QrCode, CheckCircle, Clock, ShieldCheck, Search, FileText, X,
  ScanLine, ArrowUpRight, RefreshCw, CircleCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const styles = `
.aprx-page{max-width:1240px;margin:0 auto;color:#101820;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.aprx-page *{box-sizing:border-box}
.aprx-eyebrow{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6E7882}
.aprx-heading{font-size:clamp(25px,3vw,34px);line-height:1.12;letter-spacing:-.045em;font-weight:750;margin:8px 0;color:#101820}
.aprx-muted{color:#6E7882}
.aprx-mono{font-family:"IBM Plex Mono",ui-monospace,monospace}
.aprx-panel{border:1px solid #DCE2E7;background:#fff;border-radius:12px}
.aprx-scan{border:1px solid #1769D2;border-radius:12px;background:#F4F8FE;overflow:hidden}
.aprx-scan-top{height:4px;background:linear-gradient(90deg,#1769D2 0 72%,#F07838 72% 100%)}
.aprx-input{width:100%;min-width:0;padding:13px 14px;border:1px solid #DCE2E7;border-radius:7px;background:#fff;color:#101820;font-size:14px;outline:none;transition:border .15s,box-shadow .15s}
.aprx-input:focus{border-color:#1769D2;box-shadow:0 0 0 3px rgba(23,105,210,.10)}
.aprx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #101820;background:#101820;color:white;padding:11px 15px;border-radius:7px;font-size:12px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-weight:600;letter-spacing:.015em;cursor:pointer;transition:transform .15s,background .15s;white-space:nowrap}
.aprx-btn:hover:not(:disabled){background:#263746;transform:translateY(-1px)}
.aprx-btn:disabled{opacity:.55;cursor:not-allowed}
.aprx-btn-blue{background:#1769D2;border-color:#1769D2}
.aprx-btn-blue:hover:not(:disabled){background:#1058b6}
.aprx-btn-light{background:white;color:#101820;border-color:#DCE2E7}
.aprx-btn-light:hover:not(:disabled){background:#F7F9FB}
.aprx-section-title{font-size:16px;letter-spacing:-.025em;font-weight:700;margin:0;color:#101820}
.aprx-count{display:inline-flex;align-items:center;justify-content:center;min-width:27px;height:24px;padding:0 7px;border:1px solid #DCE2E7;border-radius:5px;font:11px "IBM Plex Mono",ui-monospace,monospace;color:#6E7882;background:#fff}
.aprx-status{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:4px;font:10px "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.045em;text-transform:uppercase}
.aprx-status-pending{color:#8B4A12;background:#FFF3E8;border:1px solid #F5D4B8}
.aprx-status-valid{color:#176344;background:#EAF7F0;border:1px solid #BFE6D0}
.aprx-pending-card{border:1px solid #DCE2E7;border-radius:9px;padding:18px;background:#fff;display:flex;justify-content:space-between;gap:20px;align-items:flex-start}
.aprx-pending-card:before{content:"";display:block;position:absolute}
.aprx-patient{font-size:15px;font-weight:700;letter-spacing:-.02em;margin:0}
.aprx-small{font-size:12px;line-height:1.6;color:#6E7882}
.aprx-medicine-box{background:#F7F9FB;border:1px solid #E7EBEF;border-radius:7px;padding:11px 12px;margin-top:13px}
.aprx-medicine-row{font-size:12px;line-height:1.65;color:#263746}
.aprx-token{overflow-wrap:anywhere;display:inline-block;max-width:100%;font-size:11px;color:#1769D2;background:#F0F6FF;border:1px solid #D5E5FA;border-radius:4px;padding:4px 7px}
.aprx-table-wrap{width:100%;overflow-x:auto}
.aprx-table{width:100%;border-collapse:collapse;text-align:left;min-width:650px}
.aprx-table th{padding:12px 16px;color:#6E7882;background:#F7F9FB;font:10px "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #DCE2E7}
.aprx-table td{padding:14px 16px;font-size:13px;border-bottom:1px solid #EDF0F2;vertical-align:middle}
.aprx-table tr:last-child td{border-bottom:0}
.aprx-empty{padding:35px 20px;text-align:center;color:#6E7882;font-size:13px}
.aprx-modal-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(16,24,32,.62);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.aprx-modal{width:min(100%,430px);background:#fff;border:1px solid #DCE2E7;border-radius:12px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.22)}
@media(max-width:680px){.aprx-pending-card{flex-direction:column;padding:15px}.aprx-actions{width:100%;display:flex;flex-direction:row!important;align-items:stretch!important;flex-wrap:wrap}.aprx-actions .aprx-btn{flex:1}.aprx-scan-body{padding:16px!important}.aprx-scan-form{flex-direction:column}.aprx-scan-form .aprx-btn{width:100%}.aprx-panel-pad{padding:16px!important}}
`;

export default function AssistantPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedBarcodeModal, setSelectedBarcodeModal] = useState(null);
  const [validating, setValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchPrescriptions(); }, []);

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
      toast.success('Prescription verified and validated successfully!');
      setBarcodeInput('');
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid barcode data: verification failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleValidate = async (rxId, barcodeToVerify) => {
    setValidating(true);
    try {
      await validatePrescription(rxId, barcodeToVerify ? barcodeToVerify.trim() : '');
      toast.success('Prescription validated successfully!');
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const unvalidatedList = useMemo(() => prescriptions.filter((r) => !r.is_validated), [prescriptions]);
  const validatedList = useMemo(() => prescriptions.filter((r) => r.is_validated), [prescriptions]);
  const filteredValidated = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return validatedList;
    return validatedList.filter((rx) => {
      const pat = rx.patient_info || {};
      const patientName = pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${rx.patient}`);
      const doctorName = rx.doctor_info?.name || 'Doctor';
      return [patientName, doctorName, rx.diagnosis, rx.barcode_data].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [validatedList, searchTerm]);

  const getPatientName = (rx) => {
    const pat = rx.patient_info || {};
    return pat.first_name ? `${pat.first_name} ${pat.last_name || ''}`.trim() : (pat.username || `Patient #${rx.patient}`);
  };
  const getQrUrl = (rx) => rx.barcode_image_url || (rx.barcode_image?.startsWith('http') ? rx.barcode_image : (rx.barcode_image ? `http://localhost:8000${rx.barcode_image}` : null));

  return (
    <div className="aprx-page">
      <style>{styles}</style>
      <header style={{ marginBottom: 25 }}>
        <div className="aprx-eyebrow">DOC CONNECT / CLINICAL OPERATIONS</div>
        <h1 className="aprx-heading">Prescription validation<span style={{ color: '#F07838' }}>.</span></h1>
        <p style={{ margin: '8px 0 0', maxWidth: 680, fontSize: 14, lineHeight: 1.7, color: '#6E7882' }}>
          Verify prescription tokens and review validation history at the clinic or pharmacy counter.
        </p>
      </header>

      <section className="aprx-scan" style={{ marginBottom: 25 }}>
        <div className="aprx-scan-top" />
        <div className="aprx-scan-body" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 17 }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, background: '#E5EFFD', color: '#1769D2', display: 'grid', placeItems: 'center', border: '1px solid #C8DDF8' }}>
              <ScanLine size={21} />
            </div>
            <div>
              <div className="aprx-eyebrow" style={{ color: '#1769D2', marginBottom: 4 }}>01 / SECURE SCAN</div>
              <h2 className="aprx-section-title">Quick barcode / QR validation</h2>
            </div>
          </div>
          <p className="aprx-small" style={{ margin: '0 0 16px', maxWidth: 700 }}>
            Scan the code presented by the patient or enter the unique prescription token to authenticate the prescription.
          </p>
          <form className="aprx-scan-form" onSubmit={(e) => { e.preventDefault(); handleValidateBarcode(); }} style={{ display: 'flex', gap: 10, maxWidth: 760 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <QrCode size={17} color="#6E7882" style={{ position: 'absolute', left: 13, top: 14 }} />
              <input className="aprx-input" style={{ paddingLeft: 40 }} type="text" placeholder="Scan or enter barcode token…" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} />
            </div>
            <button className="aprx-btn aprx-btn-blue" type="submit" disabled={validating}>
              {validating ? <RefreshCw size={15} className="aprx-spin" /> : <ShieldCheck size={15} />}
              {validating ? 'VALIDATING…' : 'DECODE & VALIDATE'}
            </button>
          </form>
          <div className="aprx-small" style={{ marginTop: 10 }}>Accepted input: prescription barcode token / UUID</div>
        </div>
      </section>

      <section className="aprx-panel aprx-panel-pad" style={{ padding: 22, marginBottom: 25 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 17, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: '#FFF3E8', color: '#F07838', borderRadius: 7 }}><Clock size={17} /></div>
            <div>
              <div className="aprx-eyebrow" style={{ marginBottom: 3 }}>02 / ACTION REQUIRED</div>
              <h2 className="aprx-section-title">Awaiting verification</h2>
            </div>
            <span className="aprx-count">{unvalidatedList.length}</span>
          </div>
          <span className="aprx-small aprx-mono">PENDING QUEUE</span>
        </div>

        {loading ? (
          <div className="aprx-empty"><RefreshCw size={20} style={{ marginBottom: 9, animation: 'aprx-rotate 1s linear infinite' }} /><div>Loading prescription records…</div></div>
        ) : unvalidatedList.length === 0 ? (
          <div className="aprx-empty" style={{ border: '1px dashed #DCE2E7', borderRadius: 8 }}>
            <CircleCheck size={25} color="#176344" style={{ marginBottom: 8 }} />
            <div style={{ color: '#101820', fontWeight: 650, marginBottom: 4 }}>Queue is clear</div>
            All prescriptions have been verified and validated.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {unvalidatedList.map((rx) => {
              const patName = getPatientName(rx);
              const docName = rx.doctor_info?.name || 'Assigned Doctor';
              const qrUrl = getQrUrl(rx);
              return (
                <article key={rx.id} className="aprx-pending-card">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 7 }}>
                      <h3 className="aprx-patient">{patName}</h3>
                      <span className="aprx-status aprx-status-pending"><Clock size={12} /> Awaiting validation</span>
                    </div>
                    <div className="aprx-small">Prescribed by <strong style={{ color: '#263746', fontWeight: 600 }}>Dr. {docName}</strong> <span style={{ margin: '0 5px', color: '#C1C8CE' }}>•</span> Issued {rx.created_at ? new Date(rx.created_at).toLocaleDateString() : '—'}</div>
                    {rx.diagnosis && <div style={{ marginTop: 9, fontSize: 12, color: '#263746' }}><span className="aprx-muted">DIAGNOSIS</span> <span style={{ marginLeft: 7 }}>{rx.diagnosis}</span></div>}
                    <div className="aprx-medicine-box">
                      <div className="aprx-eyebrow" style={{ marginBottom: 7 }}>Medicine list</div>
                      {rx.medicines?.length ? rx.medicines.map((m, idx) => (
                        <div key={idx} className="aprx-medicine-row">
                          <strong style={{ color: '#101820' }}>{m.name}</strong> — {m.dosage} <span style={{ color: '#6E7882' }}>({m.frequency}, {m.duration})</span>{m.instructions ? <div style={{ color: '#6E7882', paddingLeft: 2 }}>Instructions: {m.instructions}</div> : null}
                        </div>
                      )) : <div className="aprx-small">No medicine details available.</div>}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span className="aprx-eyebrow">Token</span>
                      <code className="aprx-token">{rx.barcode_data || rx.id}</code>
                    </div>
                  </div>
                  <div className="aprx-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', flexShrink: 0 }}>
                    <button className="aprx-btn" onClick={() => handleValidateBarcode(rx.barcode_data || rx.id)} disabled={validating}><ShieldCheck size={15} /> Validate token</button>
                    {qrUrl && <button className="aprx-btn aprx-btn-light" onClick={() => setSelectedBarcodeModal(rx)}><QrCode size={15} /> View QR code <ArrowUpRight size={13} /></button>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="aprx-panel" style={{ overflow: 'hidden' }}>
        <div className="aprx-panel-pad" style={{ padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 15, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: '#EAF7F0', color: '#176344', borderRadius: 7 }}><CheckCircle size={17} /></div>
            <div>
              <div className="aprx-eyebrow" style={{ marginBottom: 3 }}>03 / AUDIT TRAIL</div>
              <h2 className="aprx-section-title">Validated prescriptions</h2>
            </div>
            <span className="aprx-count">{validatedList.length}</span>
          </div>
          <div style={{ position: 'relative', width: 'min(100%, 270px)' }}>
            <Search size={15} color="#6E7882" style={{ position: 'absolute', left: 11, top: 13 }} />
            <input className="aprx-input" style={{ padding: '10px 12px 10px 34px', fontSize: 12 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search patient, doctor, diagnosis…" aria-label="Search validated prescriptions" />
          </div>
        </div>
        {loading ? <div className="aprx-empty">Loading validation history…</div> : filteredValidated.length === 0 ? (
          <div className="aprx-empty" style={{ borderTop: '1px solid #DCE2E7' }}>
            <FileText size={24} color="#9AA4AD" style={{ marginBottom: 8 }} />
            <div style={{ color: '#101820', fontWeight: 650, marginBottom: 4 }}>{searchTerm ? 'No matching records' : 'No validated prescriptions yet'}</div>
            <div>{searchTerm ? 'Try a different search term.' : 'Validated prescriptions will appear here for reference.'}</div>
          </div>
        ) : (
          <div className="aprx-table-wrap">
            <table className="aprx-table">
              <thead><tr><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Validated at</th><th>Status</th></tr></thead>
              <tbody>
                {filteredValidated.map((rx) => (
                  <tr key={rx.id}>
                    <td><div style={{ fontWeight: 650, color: '#101820' }}>{getPatientName(rx)}</div><div className="aprx-small aprx-mono" style={{ fontSize: 10, marginTop: 3 }}>RX-{String(rx.id).slice(0, 8)}</div></td>
                    <td style={{ color: '#263746' }}>Dr. {rx.doctor_info?.name || 'Doctor'}</td>
                    <td style={{ color: '#6E7882' }}>{rx.diagnosis || 'General'}</td>
                    <td style={{ color: '#6E7882' }}>{rx.validated_at ? new Date(rx.validated_at).toLocaleString() : 'Validated'}</td>
                    <td><span className="aprx-status aprx-status-valid"><CheckCircle size={12} /> Validated</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedBarcodeModal && (
        <div className="aprx-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedBarcodeModal(null); }}>
          <div className="aprx-modal" role="dialog" aria-modal="true" aria-labelledby="aprx-qr-title">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15, marginBottom: 18 }}>
              <div><div className="aprx-eyebrow" style={{ marginBottom: 5 }}>PRESCRIPTION TOKEN</div><h3 id="aprx-qr-title" style={{ margin: 0, fontSize: 19, letterSpacing: '-.03em' }}>QR code preview</h3></div>
              <button className="aprx-btn aprx-btn-light" style={{ padding: 7 }} aria-label="Close QR code preview" onClick={() => setSelectedBarcodeModal(null)}><X size={17} /></button>
            </div>
            {getQrUrl(selectedBarcodeModal) ? (
              <img src={getQrUrl(selectedBarcodeModal)} alt="Prescription QR code" style={{ width: 220, height: 220, maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block', border: '1px solid #DCE2E7', borderRadius: 8, padding: 8 }} />
            ) : <div className="aprx-empty" style={{ background: '#F7F9FB', borderRadius: 8 }}>QR image is being generated.</div>}
            <div className="aprx-eyebrow" style={{ marginTop: 18, marginBottom: 7 }}>Barcode token</div>
            <code className="aprx-token" style={{ display: 'block', textAlign: 'left' }}>{selectedBarcodeModal.barcode_data || selectedBarcodeModal.id}</code>
            <button className="aprx-btn aprx-btn-blue" style={{ width: '100%', marginTop: 18 }} onClick={() => setSelectedBarcodeModal(null)}>Close preview</button>
          </div>
        </div>
      )}
      <style>{`@keyframes aprx-rotate{to{transform:rotate(360deg)}} .aprx-spin{animation:aprx-rotate 1s linear infinite}`}</style>
    </div>
  );
}
