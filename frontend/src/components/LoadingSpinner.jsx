import React from 'react';

export default function LoadingSpinner({ fullscreen = true, size = 48 }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    ...(fullscreen
      ? { minHeight: '100vh', width: '100%', background: '#FFFFFF' }
      : { padding: '2rem', width: '100%' }),
    color: '#101820',
    fontFamily: '"IBM Plex Mono", monospace',
  };

  const spinnerStyle = {
    width: size,
    height: size,
    boxSizing: 'border-box',
    border: '3px solid #DCE2E7',
    borderTopColor: '#1769D2',
    borderRightColor: '#F07838',
    borderRadius: '50%',
    animation: 'docconnect-spin 0.85s linear infinite',
  };

  return (
    <div style={containerStyle} role="status" aria-live="polite" aria-label="Loading">
      <style>{`
        @keyframes docconnect-spin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .docconnect-loading-spinner {
            animation-duration: 2.5s !important;
          }
        }
      `}</style>

      <div className="docconnect-loading-spinner" style={spinnerStyle} aria-hidden="true" />

      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#6E7882',
        }}
      >
        Loading
      </span>
    </div>
  );
}
