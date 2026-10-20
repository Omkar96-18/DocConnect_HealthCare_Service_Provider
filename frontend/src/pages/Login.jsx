
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  LockKeyhole,
  Mail,
  ChevronRight,
} from 'lucide-react';

const demoAccounts = [
  { label: 'Patient', username: 'patient_rahul', password: 'patient123', id: '01', color: 'blue' },
  { label: 'Dr. Sharma', username: 'dr_sharma', password: 'doctor123', id: '02', color: 'orange' },
  { label: 'Dr. Patel', username: 'dr_patel', password: 'doctor123', id: '03', color: 'blue' },
  { label: 'Assistant Priya', username: 'assistant_priya', password: 'assistant123', id: '04', color: 'orange' },
  { label: 'Admin', username: 'admin', password: 'admin123', id: '05', color: 'black' },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

.dc-login, .dc-login * { box-sizing: border-box; }
.dc-login {
  --paper: #fff;
  --ink: #101820;
  --muted: #6e7882;
  --line: #dce2e7;
  --blue: #1769d2;
  --orange: #f07838;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 0 5.2vw;
  color: var(--ink);
  background: var(--paper);
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
}
.dc-topbar {
  height: 76px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}
.dc-wordmark {
  color: var(--ink);
  text-decoration: none;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -1.2px;
}
.dc-wordmark span, .dc-panel h2 span, .dc-footer-period { color: var(--orange); }
.dc-top-meta, .dc-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 9px;
  letter-spacing: .07em;
}
.dc-status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--blue); display: inline-block;
}
.dc-meta-divider { color: var(--orange); }
.dc-grid {
  pointer-events: none;
  position: absolute;
  inset: 76px 5.2vw 50px;
  background-image:
    linear-gradient(to right, rgba(16,24,32,.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(16,24,32,.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, #000, transparent 88%);
}
.dc-grid-label, .dc-coordinate {
  position: absolute;
  color: #9aa3ab;
  font-size: 8px;
  letter-spacing: .1em;
}
.dc-grid-label { left: 0; }
.dc-grid-label.top { top: 20px; }
.dc-grid-label.bottom { bottom: 18px; }
.dc-coordinate { right: 0; top: 20px; line-height: 1.7; text-align: right; }
.dc-cross {
  position: absolute; color: var(--blue);
  font-size: 25px; opacity: .8;
}
.dc-cross.one { left: 42%; top: 16%; }
.dc-cross.two { right: 5%; bottom: 23%; color: var(--orange); }

.dc-layout {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  min-height: calc(100vh - 136px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(350px, 430px);
  align-items: center;
  gap: clamp(45px, 7vw, 110px);
  padding: 50px 0 60px;
}
.dc-intro { max-width: 570px; }
.dc-eyebrow, .dc-panel-kicker, .dc-panel-number, .dc-field > span,
.dc-demo-heading, .dc-panel-footer > span {
  font-size: 9px; letter-spacing: .12em; font-weight: 600;
}
.dc-eyebrow { color: var(--muted); margin: 0 0 27px; }
.dc-eyebrow span { color: var(--orange); margin-right: 9px; }
.dc-intro h1 {
  margin: 0;
  max-width: 620px;
  font-size: clamp(48px, 6vw, 82px);
  line-height: .99;
  letter-spacing: -.085em;
  font-weight: 500;
}
.dc-intro h1 em { color: var(--blue); font-style: normal; }
.dc-intro-copy {
  max-width: 410px;
  margin: 26px 0 35px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.9;
}
.dc-features { border-top: 1px solid var(--line); max-width: 480px; }
.dc-feature {
  min-height: 63px;
  display: grid;
  grid-template-columns: 32px 1fr 20px;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}
.dc-feature-index { color: var(--orange); font-size: 10px; }
.dc-feature-text { display: grid; gap: 5px; }
.dc-feature-text strong { font-size: 11px; font-weight: 600; }
.dc-feature-text small { color: var(--muted); font-size: 9px; }
.dc-feature > svg { color: #a2abb3; }
.dc-annotation {
  margin-top: 26px; display: flex; align-items: center;
  gap: 10px; color: #89939c; font-size: 8px; letter-spacing: .1em;
}
.dc-annotation-line { width: 44px; height: 1px; background: var(--orange); }

.dc-panel {
  background: rgba(255,255,255,.97);
  border: 1px solid var(--line);
  box-shadow: 12px 12px 0 rgba(23,105,210,.045);
  padding: 27px 28px 0;
  position: relative;
}
.dc-panel:before {
  content: ''; height: 3px;
  background: linear-gradient(90deg, var(--blue) 0 68%, var(--orange) 68% 100%);
  position: absolute; top: -1px; left: -1px; right: -1px;
}
.dc-panel-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px;
}
.dc-panel-kicker { color: var(--muted); }
.dc-panel-number { color: #9aa3ab; font-size: 8px; }
.dc-panel h2 {
  font-size: 35px; letter-spacing: -.07em; line-height: 1;
  margin: 0; font-weight: 500;
}
.dc-subtitle { font-size: 10px; color: var(--muted); margin: 12px 0 28px; }
.dc-form { display: grid; gap: 19px; }
.dc-field { display: grid; gap: 8px; }
.dc-field > span { color: #45515c; font-size: 8px; }
.dc-input {
  min-height: 46px; display: flex; align-items: center; gap: 10px;
  border: 1px solid #cfd7de; padding: 0 12px;
  transition: border-color .18s, box-shadow .18s;
}
.dc-input:focus-within {
  border-color: var(--blue); box-shadow: 0 0 0 3px rgba(23,105,210,.08);
}
.dc-input > svg { color: #87929d; flex: 0 0 auto; }
.dc-input input {
  border: 0; outline: 0; background: transparent; min-width: 0;
  width: 100%; font: 10px 'IBM Plex Mono', monospace; color: var(--ink);
}
.dc-input input::placeholder { color: #a0a8b0; }
.dc-toggle {
  border: 0; background: transparent; padding: 4px;
  display: flex; color: #77828c; cursor: pointer;
}
.dc-toggle:hover { color: var(--blue); }
.dc-submit {
  min-height: 48px; margin-top: 3px; border: 1px solid var(--ink);
  background: var(--ink); color: white; display: flex;
  align-items: center; justify-content: space-between;
  padding: 0 14px 0 16px; cursor: pointer;
  font: 600 9px 'IBM Plex Mono', monospace; letter-spacing: .08em;
  transition: background .18s, border-color .18s;
}
.dc-submit svg { color: #8fc1ff; }
.dc-submit:hover:not(:disabled) { background: var(--blue); border-color: var(--blue); }
.dc-submit:disabled { opacity: .6; cursor: wait; }

.dc-demo { margin-top: 27px; padding-top: 17px; border-top: 1px solid var(--line); }
.dc-demo-heading {
  display: flex; justify-content: space-between; color: var(--muted);
  font-size: 8px; margin-bottom: 9px;
}
.dc-demo-heading span:last-child { color: var(--orange); }
.dc-demo-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.dc-demo-account {
  border: 1px solid #e0e5e9; background: white; min-height: 36px;
  display: flex; align-items: center; gap: 8px; padding: 5px 8px;
  text-align: left; color: var(--ink); cursor: pointer;
  font: 9px 'IBM Plex Mono', monospace;
  transition: border-color .18s, background .18s;
}
.dc-demo-account:hover { border-color: var(--blue); background: #edf5ff; }
.dc-demo-account > svg { margin-left: auto; color: #98a2ab; }
.dc-demo-id { font-size: 8px; font-weight: 600; }
.dc-demo-id.blue { color: var(--blue); }
.dc-demo-id.orange { color: var(--orange); }
.dc-demo-id.black { color: var(--ink); }
.dc-panel-footer {
  margin: 24px -28px 0; min-height: 54px; border-top: 1px solid var(--line);
  padding: 0 28px; display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}
.dc-panel-footer > span { color: var(--muted); font-size: 8px; }
.dc-panel-footer a {
  color: var(--blue); text-decoration: none; font-size: 9px;
  display: inline-flex; align-items: center; gap: 5px;
}
.dc-panel-footer a:hover { color: var(--orange); }

.dc-footer {
  position: relative; z-index: 2; min-height: 60px;
  border-top: 1px solid var(--line); justify-content: space-between;
  font-size: 8px;
}
.dc-footer > span:first-child { color: var(--ink); font-weight: 600; }
.dc-footer-muted { color: #9aa3ab; font-weight: 400; margin-left: 10px; }
.dc-footer i {
  width: 5px; height: 5px; display: inline-block;
  border-radius: 50%; background: var(--orange); margin: 0 4px 1px;
}

@media (max-width: 900px) {
  .dc-login { padding: 0 24px; }
  .dc-grid { left: 24px; right: 24px; }
  .dc-layout { gap: 35px; grid-template-columns: minmax(0, 1fr) minmax(320px, 390px); }
  .dc-intro h1 { font-size: clamp(43px, 6vw, 62px); }
  .dc-footer > span:nth-child(2) { display: none; }
}
@media (max-width: 700px) {
  .dc-login { padding: 0 18px; }
  .dc-topbar { height: 66px; }
  .dc-top-meta { font-size: 7px; gap: 7px; }
  .dc-top-meta .dc-meta-divider, .dc-top-meta span:last-child { display: none; }
  .dc-grid { inset: 66px 18px 50px; background-size: 42px 42px; }
  .dc-grid-label, .dc-coordinate { font-size: 7px; }
  .dc-layout { min-height: auto; grid-template-columns: 1fr; gap: 35px; padding: 46px 0 42px; }
  .dc-eyebrow { margin-bottom: 20px; }
  .dc-intro h1 { font-size: clamp(46px, 13vw, 68px); }
  .dc-intro-copy { margin: 20px 0 24px; max-width: 440px; }
  .dc-feature { min-height: 57px; }
  .dc-feature-text small { font-size: 8px; }
  .dc-annotation { margin-top: 18px; }
  .dc-panel { padding: 24px 20px 0; }
  .dc-panel-footer { margin-left: -20px; margin-right: -20px; padding: 0 20px; }
  .dc-footer { min-height: 54px; gap: 8px; font-size: 7px; }
  .dc-footer > span:last-child { text-align: right; }
  .dc-footer-muted { display: none; }
}
@media (max-width: 380px) {
  .dc-demo-list { grid-template-columns: 1fr; }
  .dc-panel h2 { font-size: 31px; }
  .dc-panel-footer { align-items: flex-start; flex-direction: column; justify-content: center; gap: 6px; padding-top: 10px; padding-bottom: 10px; }
}
`;

export default function LoginPage() {
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
      const payload = identifier.includes('@')
        ? { email: identifier.trim(), password }
        : { username: identifier.trim(), password };

      const { data } = await loginApi(payload);
      await login(data.access, data.refresh, data.user);

      toast.success(
        `Welcome back, ${data.user?.first_name || data.user?.username}!`
      );

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
    <>
      <style>{css}</style>

      <main className="dc-login">
        <header className="dc-topbar">
          <Link to="/" className="dc-wordmark">
            DocConnect<span>.</span>
          </Link>

          <div className="dc-top-meta">
            <span className="dc-status-dot" />
            SECURE HEALTHCARE PORTAL
            <span className="dc-meta-divider">/</span>
            <span>AUTH 01</span>
          </div>
        </header>

        <div className="dc-grid" aria-hidden="true">
          <span className="dc-grid-label top">DC / ACCESS LAYER</span>
          <span className="dc-grid-label bottom">
            PATIENT · CLINICIAN · CARE TEAM
          </span>
          <span className="dc-cross one">+</span>
          <span className="dc-cross two">+</span>
          <span className="dc-coordinate">
            18°31&apos; N<br />
            73°51&apos; E
          </span>
        </div>

        <section className="dc-layout">
          <div className="dc-intro">
            <p className="dc-eyebrow">
              <span>01</span> / HEALTHCARE, CONNECTED
            </p>

            <h1>
              Care moves
              <br />
              better <em>together.</em>
            </h1>

            <p className="dc-intro-copy">
              One considered space for appointments, patient access,
              prescriptions and the people behind every visit.
            </p>

            <div className="dc-features">
              <div className="dc-feature">
                <span className="dc-feature-index">A.</span>
                <div className="dc-feature-text">
                  <strong>Coordinated care</strong>
                  <small>Patients, doctors and assistants in sync.</small>
                </div>
                <ChevronRight size={16} />
              </div>

              <div className="dc-feature">
                <span className="dc-feature-index">B.</span>
                <div className="dc-feature-text">
                  <strong>Controlled access</strong>
                  <small>Patient records shared with permission.</small>
                </div>
                <ChevronRight size={16} />
              </div>

              <div className="dc-feature">
                <span className="dc-feature-index">C.</span>
                <div className="dc-feature-text">
                  <strong>Clear records</strong>
                  <small>Appointments and prescriptions in one flow.</small>
                </div>
                <ChevronRight size={16} />
              </div>
            </div>

            <div className="dc-annotation">
              <span className="dc-annotation-line" />
              DESIGNED AROUND THE CARE JOURNEY
            </div>
          </div>

          <section className="dc-panel">
            <div className="dc-panel-top">
              <span className="dc-panel-kicker">ACCOUNT ACCESS</span>
              <span className="dc-panel-number">01 — 05</span>
            </div>

            <h2>
              Sign in<span>.</span>
            </h2>

            <p className="dc-subtitle">
              Enter your account details to continue.
            </p>

            <form onSubmit={handleSubmit} className="dc-form">
              <label className="dc-field">
                <span>USERNAME OR EMAIL</span>
                <div className="dc-input">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@clinic.com or username"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="dc-field">
                <span>PASSWORD</span>
                <div className="dc-input">
                  <LockKeyhole size={16} aria-hidden="true" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    className="dc-toggle"
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="dc-submit"
                disabled={loading}
              >
                <span>
                  {loading ? 'AUTHENTICATING…' : 'CONTINUE TO PORTAL'}
                </span>
                <ArrowUpRight size={18} />
              </button>
            </form>

            <div className="dc-demo">
              <div className="dc-demo-heading">
                <span>DEMO ACCESS</span>
                <span>CLICK TO FILL</span>
              </div>

              <div className="dc-demo-list">
                {demoAccounts.map((account) => (
                  <button
                    type="button"
                    key={account.id}
                    className="dc-demo-account"
                    onClick={() =>
                      handleDemoFill(account.username, account.password)
                    }
                  >
                    <span className={`dc-demo-id ${account.color}`}>
                      {account.id}
                    </span>
                    <span>{account.label}</span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className="dc-panel-footer">
              <span>NEW TO DOCCONNECT?</span>
              <Link to="/signup">
                Create an account <ArrowUpRight size={14} />
              </Link>
            </div>
          </section>
        </section>

        <footer className="dc-footer">
          <span>
            DocConnect<span className="dc-footer-period">.</span>
            <span className="dc-footer-muted"> CARE, IN CONTEXT.</span>
          </span>
          <span>
            PRIVACY FIRST <i /> BUILT FOR BETTER COORDINATION
          </span>
          <span>© 2026 / DC-01</span>
        </footer>
      </main>
    </>
  );
}
