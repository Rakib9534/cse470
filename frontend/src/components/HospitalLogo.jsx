import React from 'react';

function HospitalLogo({ size = 40, showText = false }) {
  // Scale logo larger - for navbar match text, for login/signup make it prominent
  const logoSize = showText ? 120 : size;
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: showText ? '1rem' : '0'
    }}>
      <img
        src="/hospital-logo.jpeg"
        alt="Hospital Logo"
        style={{
          width: logoSize,
          height: 'auto',
          maxHeight: logoSize,
          objectFit: 'contain',
          display: 'block',
          imageRendering: 'high-quality',
          imageRendering: '-webkit-optimize-contrast',
          imageRendering: 'crisp-edges',
          filter: 'contrast(1.05)',
        }}
        loading="eager"
      />
      {showText && (
        <div style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: '#1A1A1A',
          letterSpacing: '0.1em',
          marginTop: '0.5rem',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
          lineHeight: '1.2'
        }}>
          HOSPITAL
        </div>
      )}
    </div>
  );
}

export default HospitalLogo;
