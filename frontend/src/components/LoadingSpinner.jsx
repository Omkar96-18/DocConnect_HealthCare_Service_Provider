import React from 'react';

export default function LoadingSpinner({ fullscreen = true, size = 48 }) {
  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullscreen ? { height: '100vh', width: '100%' } : { padding: '2rem' }),
  };

  const spinnerStyle = {
    width: size,
    height: size,
    border: '4px solid #e0f2fe',
    borderTop: '4px solid #0ea5e9',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <div style={style}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={spinnerStyle} />
    </div>
  );
}
