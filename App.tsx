import { useState } from 'react';
import { PhoneShell } from './components/PhoneShell';
import { AuthModule } from './components/AuthModule';
import { CoPilgrimModule } from './components/CoPilgrimModule';
import { Button } from './components/Button';
import { AlertBanner } from './components/AlertBanner';
import { DarshanBookingModule } from './components/DarshanBookingModule';
import { AccommodationBookingModule } from './components/AccommodationBookingModule';
import { CheckoutModule } from './components/CheckoutModule';
import { DonationModule } from './components/DonationModule';
import { MediaModule } from './components/MediaModule';
import { TicketPassCard } from './components/TicketPassCard';
import { useApp } from './context/AppContext';
import { LogOut, User } from 'lucide-react';
import tirumalaHeader from './assets/tirumala_header_top.png';
import { HundiIcon } from './components/HundiIcon';
import './App.css';

function App() {
  const { user, logout, coPilgrims, bookings } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [activeService, setActiveService] = useState<string | null>(null); // 'darshan' | 'accommodation' | 'media' | null
  const [checkoutDetails, setCheckoutDetails] = useState<any | null>(null);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your session?')) {
      logout();
      setActiveTab('home');
      setActiveService(null);
      setCheckoutDetails(null);
    }
  };

  const renderActiveService = () => {
    if (activeService === 'darshan') {
      return (
        <DarshanBookingModule
          onCancel={() => setActiveService(null)}
          onProceedToCheckout={(details) => setCheckoutDetails(details)}
        />
      );
    }
    if (activeService === 'accommodation') {
      return (
        <AccommodationBookingModule
          onCancel={() => setActiveService(null)}
          onProceedToCheckout={(details) => setCheckoutDetails(details)}
        />
      );
    }
    if (activeService === 'media') {
      return (
        <MediaModule
          onClose={() => setActiveService(null)}
        />
      );
    }
    return null;
  };

  if (!user) {
    return (
      <PhoneShell activeTab="home" setActiveTab={setActiveTab} showTabs={false}>
        <AuthModule />
      </PhoneShell>
    );
  }

  if (checkoutDetails) {
    return (
      <PhoneShell activeTab={activeTab} setActiveTab={setActiveTab} showTabs={false}>
        <CheckoutModule
          bookingDetails={checkoutDetails}
          onCancel={() => setCheckoutDetails(null)}
          onSuccess={() => {
            setCheckoutDetails(null);
            setActiveService(null);
            setActiveTab('bookings'); // Route to bookings dashboard
          }}
        />
      </PhoneShell>
    );
  }

  return (
    <PhoneShell activeTab={activeTab} setActiveTab={setActiveTab} showTabs={true}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Home Tab */}
        {activeTab === 'home' && (
          activeService ? (
            renderActiveService()
          ) : (
            <div className="desktop-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Devotee Profile Header */}
              <div style={{
                backgroundColor: 'var(--secondary-dark)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                minHeight: '140px'
              }}>
                {/* Left Side: Devotee Details */}
                <div style={{
                  flex: 1,
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  zIndex: 2,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid var(--gold)'
                    }}>
                      <User size={22} color="var(--primary)" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Welcome Devotee
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0', color: '#ffffff' }}>
                        {user.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '11px',
                    opacity: 0.95,
                    textAlign: 'left'
                  }}>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>Mobile:</span> {user.mobile}
                    </div>
                    <div>
                      <span style={{ color: 'var(--gold)' }}>ID:</span> {user.idProofType} ({user.idNumber})
                    </div>
                  </div>
                </div>

                {/* Right Side: Temple Image Container */}
                <div className="profile-temple-img-container">
                  <img 
                    src={tirumalaHeader} 
                    alt="Tirumala Temple Gopuram" 
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top'
                    }}
                  />
                  {/* Blending Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, var(--secondary-dark) 0%, rgba(74, 0, 0, 0.45) 60%, rgba(74, 0, 0, 0) 100%)',
                    zIndex: 1
                  }} />
                </div>
              </div>


              {/* Quick Info Alert */}
              <AlertBanner
                type="success"
                message="Your profile is verified. You can now book passes and register family members."
              />

              {/* Grid Services */}
              <div>
                <h3 className="font-spiritual" style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: 'var(--secondary)',
                  marginBottom: '12px',
                  textAlign: 'left'
                }}>
                  Devotee Services
                </h3>
                
                <div className="services-grid">
                  {[
                    { id: 'darshan', title: 'Special Entry Darshan', desc: 'slots availability', icon: <span style={{ fontSize: '28px' }}>🎫</span> },
                    { id: 'accommodation', title: 'Accommodation', desc: '', icon: <span style={{ fontSize: '28px' }}>🏠</span> },
                    { id: 'hundi', title: 'Digital Hundi', desc: 'Make dynamic donations', icon: <HundiIcon size={32} /> },
                    { id: 'media', title: 'Live TV & Media', desc: 'broadcast & chants', icon: <span style={{ fontSize: '28px' }}>📻</span> }
                  ].map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        if (service.id === 'hundi') {
                          setActiveTab('hundi');
                        } else {
                          setActiveService(service.id);
                        }
                      }}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', height: '32px', marginBottom: '8px' }}>
                        {service.icon}
                      </div>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {service.title}
                      </h4>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {service.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>


              {/* Status Section */}
              <div className="demo-section">
                <h3 className="demo-title">Active Enrollment Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Primary Pilgrim:</span>
                    <span style={{ fontWeight: 'bold' }}>{user.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Registered Co-Pilgrims:</span>
                    <span style={{ fontWeight: 'bold' }}>{coPilgrims.filter(p => p.userId === user?.id).length} / 5</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Recent Bookings:</span>
                    <span style={{ fontWeight: 'bold' }}>{bookings.filter(b => b.userId === user?.id).length} active</span>
                  </div>
                </div>
              </div>

            </div>
          )
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="desktop-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>🎫</span>
              <h3 className="font-spiritual" style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>
                My Bookings
              </h3>
            </div>
            
            {(() => {
              const devoteeBookings = bookings.filter((b) => b.userId === user?.id);
              if (devoteeBookings.length === 0) {
                return (
                  <div style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)'
                  }}>
                    <p style={{ fontSize: '13px' }}>No active bookings found.</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Bookings you reserve (Darshan, Accommodation, Hundi) will display here offline-first.
                    </p>
                  </div>
                );
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {devoteeBookings.map((booking) => (
                    <TicketPassCard key={booking.id} booking={booking} />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Hundi Tab */}
        {activeTab === 'hundi' && (
          <DonationModule />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="desktop-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Co Pilgrims Management */}
            <CoPilgrimModule />

            {/* Devotee Account options */}
            <div style={{ padding: '0 20px 20px 20px' }}>
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderBottom: '1px solid var(--border-color)',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>
                  Session Operations
                </div>
                
                <div style={{ padding: '12px 16px' }}>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    leftIcon={<LogOut size={16} />}
                    style={{
                      width: '100%',
                      color: 'var(--error)',
                      borderColor: 'var(--error-bg)',
                      backgroundColor: 'var(--error-bg)'
                    }}
                  >
                    Log Out Secure Session
                  </Button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </PhoneShell>
  );
}

export default App;
