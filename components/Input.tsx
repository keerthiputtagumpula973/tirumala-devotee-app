import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  hint,
  leftIcon,
  style,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%',
      marginBottom: '14px',
      textAlign: 'left'
    }}>
      {label && (
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)'
        }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            {leftIcon}
          </span>
        )}
        <input
          type={inputType}
          style={{
            width: '100%',
            padding: '10px 14px',
            paddingLeft: leftIcon ? '38px' : '14px',
            paddingRight: isPassword ? '40px' : '14px',
            fontSize: '15px',
            fontFamily: 'var(--font-sans)',
            backgroundColor: 'var(--bg-surface)',
            border: `1.5px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--border-focus)';
              e.target.style.boxShadow = '0 0 0 3px rgba(194, 89, 0, 0.15)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0'
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{
          fontSize: '12px',
          color: 'var(--error)',
          fontWeight: '500',
          marginTop: '2px'
        }}>
          ⚠️ {error}
        </span>
      )}

      {!error && hint && (
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '2px'
        }}>
          {hint}
        </span>
      )}
    </div>
  );
};
