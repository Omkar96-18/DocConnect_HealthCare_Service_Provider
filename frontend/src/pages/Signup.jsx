import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerApi } from '../api/auth';
import { Stethoscope, User, ShieldCheck, UserCheck, Eye, EyeOff, ArrowRight, Lock, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

const ROLES = [
  {
    value: 'patient',
    title: 'Patient',
    subtitle: 'Consult doctors, book visits & view verified prescriptions',
    icon: User,
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  {
    value: 'doctor',
    title: 'Doctor',
    subtitle: 'Manage patient consultations & generate secure QR prescriptions',
    icon: Stethoscope,
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  {
    value: 'assistant',
    title: 'Medical Assistant',
    subtitle: 'Middle layer coordinator: approve access & decode/validate barcodes',
    icon: ShieldCheck,
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleRoleSelect = (roleValue) => {
    setForm((f) => ({ ...f, role: roleValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.username.trim() || !form.email.trim() || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await registerApi({
        ...form,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
      });
      toast.success('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        const msg = Array.isArray(val) ? val[0] : typeof val === 'string' ? val : JSON.stringify(val);
        toast.error(`${firstKey}: ${msg}`);
      } else {
        toast.error('Registration failed. Please check the entered information.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #f0fdf4 0%, #f8fafc 50%, #f1f5f9 100%)',
        padding: '32px 16px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.02)',
          padding: '36px 32px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.3)',
              marginBottom: 16,
            }}
          >
            <Stethoscope size={26} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Create Your Account
          </h1>
          <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 4 }}>
            Join DocConnect to manage appointments, consultations, and verified prescriptions
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Role */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              Select Account Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = form.role === r.value;
                return (
                  <div
                    key={r.value}
                    onClick={() => handleRoleSelect(r.value)}
                    style={{
                      border: `2px solid ${isSelected ? r.color : '#e2e8f0'}`,
                      background: isSelected ? r.bgColor : '#fff',
                      borderRadius: 12,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <CheckCircle2 size={16} color={r.color} />
                      </div>
                    )}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isSelected ? '#fff' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: r.color,
                        marginBottom: 8,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{r.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, lineHeight: 1.35 }}>
                      {r.subtitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Personal Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                First Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="e.g. John"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Last Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="e.g. Doe"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Username <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8', fontSize: 13 }}>@</span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 28px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Password <span style={{ color: '#ef4444' }}>*</span> (min. 6 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Choose a strong password"
                required
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 36px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }}>
                  <Phone size={16} />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 555-0199"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Address / City
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }}>
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Sector 18, City Center"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 10,
              background: loading ? '#6ee7b7' : '#059669',
              color: '#ffffff',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Creating Account...' : <><span>Complete Registration</span> <ArrowRight size={17} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}