import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Sun, Moon, LogOut, User, Calendar, Home, UserCheck } from 'lucide-react';


interface PhoneShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showTabs?: boolean;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  showTabs = true,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useApp();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your session?')) {
      logout();
      setActiveTab('home');
    }
  };

  // 1. Non-authenticated view (e.g. AuthModule login/register)
  if (!user) {
    return (
      <div className="phone-frame-wrapper" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at 50% 50%, #201a15 0%, #0d0a08 100%)', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '480px', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.08)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          <div className="form-container-card" style={{ margin: 0, width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px' }}>🕉️</span>
              <span className="font-spiritual" style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--primary)',
                letterSpacing: '0.05em'
              }}>
                Devotee Portal
              </span>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // 2. Full laptop app shell view (Authenticated devotee)
  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={16} /> },
    { id: 'bookings', label: 'My Bookings', icon: <Calendar size={16} /> },
    { id: 'profile', label: 'Devotee Profile', icon: <User size={16} /> }
  ];

  return (
    <div className="phone-frame-wrapper">
      <div className="phone-device">
        {/* Desktop Sticky Navigation Header */}
        <header style={{
          height: '64px',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'background-color var(--transition-normal)',
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            <span style={{ fontSize: '22px' }}>🕉️</span>
            <span className="font-spiritual" style={{
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'var(--primary)',
              letterSpacing: '0.05em'
            }}>
              DEVOTEE PORTAL
            </span>
          </div>

          {/* Desktop Navigation Links */}
          {showTabs && (
            <nav style={{ display: 'flex', gap: '8px', height: '100%', alignItems: 'center' }}>
              {navItems.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '13.5px',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="btn-premium"
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Devotee Info, Theme and Logout Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--border-color)', paddingRight: '14px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid var(--gold)'
                }}>
                  <UserCheck size={14} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Namaste, {user.name.split(' ')[0]}
                </span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-app)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color var(--transition-fast)'
              }}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--error)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--error-bg)',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color var(--transition-fast)'
                }}
                title="Log Out Secure Session"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-app)',
          transition: 'background-color var(--transition-normal)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};
