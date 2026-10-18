import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Stethoscope, ShieldCheck, User, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error('Please enter your username/email and password');
      return;
    }
    setLoading(true);
    try {
      // Send username or email to CustomTokenObtainPairView
      const payload = identifier.includes('@')
        ? { email: identifier.trim(), password }
        : { username: identifier.trim(), password };

      const { data } = await loginApi(payload);
      await login(data.access, data.refresh, data.user);
      toast.success(`Welcome back, ${data.user?.first_name || data.user?.username}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid credentials. Please verify your username and password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (user, pass) => {
    setIdentifier(user);
    setPassword(pass);
    toast.success(`Loaded credentials for ${user}`, { icon: '🔑' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #f0fdf4 0%, #f8fafc 50%, #f1f5f9 100%)',
        padding: '24px 16px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)',
              marginBottom: 16,
            }}
          >
            <Stethoscope size={26} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Welcome to DocConnect
          </h1>
          <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 4 }}>
            Seamless medical coordination & prescription ecosystem
          </p>
        </div>

        {/* Quick Demo Logins Bar */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 8,
            }}
          >
            <Sparkles size={14} color="#0284c7" /> One-Click Demo Role Accounts:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              onClick={() => handleDemoFill('patient_rahul', 'patient123')}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#166534',
                cursor: 'pointer',
              }}
            >
              👤 Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('dr_sharma', 'doctor123')}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#0369a1',
                cursor: 'pointer',
              }}
            >
              👨‍⚕️ Dr. Sharma (with Asst)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('dr_patel', 'doctor123')}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#0284c7',
                cursor: 'pointer',
              }}
            >
              🩺 Dr. Patel (Direct)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('assistant_priya', 'assistant123')}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#92400e',
                cursor: 'pointer',
              }}
            >
              📋 Assistant Priya
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin', 'admin123')}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#7e22ce',
                cursor: 'pointer',
              }}
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username / Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8', pointerEvents: 'none' }}>
                <Mail size={17} />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. dr_sharma or user@example.com"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  background: '#fff',
                  color: '#0f172a',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8', pointerEvents: 'none' }}>
                <Lock size={17} />
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                required
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 40px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  background: '#fff',
                  color: '#0f172a',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
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
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              background: loading ? '#93c5fd' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Authenticating...' : <><span>Sign In to Portal</span> <ArrowRight size={17} /></>}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: '#64748b' }}>
          Don't have an account yet?{' '}
          <Link to="/signup" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
