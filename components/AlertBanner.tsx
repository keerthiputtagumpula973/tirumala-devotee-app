import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertBannerProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  message,
  onClose,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--success-bg)',
          border: 'var(--success)',
          color: 'var(--success)',
          icon: <CheckCircle size={18} />
        };
      case 'warning':
        return {
          bg: 'var(--warning-bg)',
          border: 'var(--warning)',
          color: 'var(--warning)',
          icon: <AlertCircle size={18} />
        };
      case 'error':
        return {
          bg: 'var(--error-bg)',
          border: 'var(--error)',
          color: 'var(--error)',
          icon: <AlertCircle size={18} />
        };
      case 'info':
      default:
        return {
          bg: 'var(--info-bg)',
          border: 'var(--info)',
          color: 'var(--info)',
          icon: <Info size={18} />
        };
    }
  };

  const config = getConfig();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: config.bg,
      borderLeft: `4px solid ${config.border}`,
      color: config.color,
      margin: '10px 0',
      fontFamily: 'var(--font-sans)',
      fontSize: '14px',
      position: 'relative',
      lineHeight: '1.4',
      boxShadow: 'var(--shadow-sm)',
      animation: 'fadeIn var(--transition-fast) forwards'
    }}>
      <span style={{ display: 'flex', marginTop: '1px' }}>
        {config.icon}
      </span>
      <div style={{ flex: 1, fontWeight: '500', paddingRight: onClose ? '20px' : '0' }}>
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '12px',
            top: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: config.color,
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
