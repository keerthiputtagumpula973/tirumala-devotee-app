import React from 'react';

export type BadgeState = 'Available' | 'Full' | 'NotReleased' | 'Past' | 'Success' | 'Pending' | 'Cancelled';

interface StatusBadgeProps {
  state: BadgeState;
  customText?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  state,
  customText,
}) => {
  const getConfig = () => {
    switch (state) {
      case 'Available':
        return {
          bg: 'var(--success-bg)',
          color: 'var(--success)',
          text: 'Available'
        };
      case 'Full':
        return {
          bg: 'var(--error-bg)',
          color: 'var(--error)',
          text: 'Full'
        };
      case 'NotReleased':
        return {
          bg: 'var(--info-bg)',
          color: 'var(--info)',
          text: 'Not Released'
        };
      case 'Past':
        return {
          bg: 'rgba(158, 142, 131, 0.1)',
          color: 'var(--text-muted)',
          text: 'Blocked / Past'
        };
      case 'Success':
        return {
          bg: 'var(--success-bg)',
          color: 'var(--success)',
          text: 'Confirmed'
        };
      case 'Pending':
        return {
          bg: 'var(--warning-bg)',
          color: 'var(--warning)',
          text: 'Pending'
        };
      case 'Cancelled':
        return {
          bg: 'var(--error-bg)',
          color: 'var(--error)',
          text: 'Cancelled'
        };
      default:
        return {
          bg: 'var(--border-color)',
          color: 'var(--text-secondary)',
          text: 'Unknown'
        };
    }
  };

  const config = getConfig();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: config.bg,
      color: config.color,
      fontFamily: 'var(--font-sans)',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      transition: 'all var(--transition-fast)'
    }}>
      {customText || config.text}
    </span>
  );
};
