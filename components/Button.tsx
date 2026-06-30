import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  width?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  width,
  ...props
}) => {
  // Styles based on variants
  const getStyles = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontFamily: 'var(--font-sans)',
      borderRadius: 'var(--radius-md)',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      transition: 'all var(--transition-fast)',
      border: '1px solid transparent',
      gap: '8px',
      outline: 'none',
      width: width ? width : 'auto'
    };

    let variantStyles = {};
    if (variant === 'primary') {
      variantStyles = {
        backgroundColor: 'var(--primary)',
        color: 'var(--text-on-primary)',
        boxShadow: 'var(--shadow-sm)'
      };
    } else if (variant === 'secondary') {
      variantStyles = {
        backgroundColor: 'var(--secondary)',
        color: '#ffffff',
        boxShadow: 'var(--shadow-sm)'
      };
    } else if (variant === 'outline') {
      variantStyles = {
        backgroundColor: 'transparent',
        borderColor: 'var(--border-color)',
        color: 'var(--primary)'
      };
    } else if (variant === 'ghost') {
      variantStyles = {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)'
      };
    }

    let sizeStyles = {};
    if (size === 'sm') {
      sizeStyles = {
        padding: '6px 12px',
        fontSize: '13px'
      };
    } else if (size === 'md') {
      sizeStyles = {
        padding: '10px 18px',
        fontSize: '15px'
      };
    } else if (size === 'lg') {
      sizeStyles = {
        padding: '14px 24px',
        fontSize: '17px'
      };
    }

    return { ...base, ...variantStyles, ...sizeStyles };
  };

  const buttonStyle = getStyles();

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...buttonStyle, ...style } as React.CSSProperties}
      className={`btn-premium ${props.className || ''}`}
      {...props}
    >
      {isLoading && (
        <span style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {!isLoading && leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}

      {/* Inject style for spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
