import React, { useState, useEffect } from 'react';
import type { Booking } from '../types';
import QRCode from 'qrcode';
import { QrCode, Calendar, Clock, MapPin, Users, Printer } from 'lucide-react';

interface TicketPassCardProps {
  booking: Booking;
}

export const TicketPassCard: React.FC<TicketPassCardProps> = ({ booking }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const generateQr = async () => {
      try {
        const text = booking.qrCodeData || `TTD-SECURE|ID:${booking.id}`;
        // Generate QR code with saffron colored modules matching theme!
        const url = await QRCode.toDataURL(text, {
          width: 140,
          margin: 1,
          color: {
            dark: '#800000', // Crimson/Maroon modules
            light: '#ffffff' // White background
          }
        });
        setQrUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    };

    generateQr();
  }, [booking]);

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1.5px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn var(--transition-normal) forwards',
      marginBottom: '16px'
    }}>
      
      {/* Header bar */}
      <div style={{
        backgroundColor: 'var(--secondary)',
        padding: '12px 16px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🕉️</span>
          <span className="font-spiritual" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '0.05em' }}>
            {booking.type === 'Darshan' 
              ? 'Darshan Entry Pass' 
              : booking.type === 'Donation' 
                ? 'Donation Receipt' 
                : 'Room Allocation Pass'}
          </span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--mono)', color: 'var(--gold)' }}>
          {booking.id}
        </span>
      </div>

      {/* Ticket Body */}
      <div style={{ padding: '16px', display: 'flex', gap: '14px' }}>
        
        {/* QR Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          width: '140px',
          flexShrink: 0
        }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)'
          }}>
            {qrUrl ? (
              <img src={qrUrl} alt="Secure Ticket QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <QrCode size={48} color="var(--text-muted)" />
            )}
          </div>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.2' }}>
            {booking.type === 'Donation'
              ? 'Scan to verify secure receipt authenticity.'
              : 'Scan at entry terminal for biometric validation.'}
          </span>
        </div>

        {/* Info Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
          
          {/* Main details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <Calendar size={13} color="var(--primary)" />
              <span>
                Date: <strong>{booking.details.date || booking.details.checkInDate}</strong>
              </span>
            </div>
            
            {booking.type === 'Darshan' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <Clock size={13} color="var(--primary)" />
                <span>
                  Slot: <strong>{booking.details.timeSlot}</strong>
                </span>
              </div>
            ) : booking.type === 'Donation' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <MapPin size={13} color="var(--primary)" />
                  <span>
                    Trust: <strong>{booking.details.trustName || 'General Srivari Hundi'}</strong>
                  </span>
                </div>
                {booking.details.panCard && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '11px', minWidth: '13px', textAlign: 'center' }}>PAN</span>
                    <span>
                      PAN Card: <strong style={{ fontFamily: 'var(--mono)' }}>{booking.details.panCard}</strong>
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--success)', marginTop: '2px' }}>
                  <span>✓ 80G Tax Exemption Claimable</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <MapPin size={13} color="var(--primary)" />
                  <span>
                    Location: <strong>{booking.details.location} ({booking.details.roomType} Room)</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <Clock size={13} color="var(--primary)" />
                  <span>
                    Check-in Slot: <strong>{booking.details.checkInSlot}</strong>
                  </span>
                </div>
              </>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />

          {/* Pilgrims List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--secondary)' }}>
              <Users size={12} />
              <span>{booking.type === 'Donation' ? 'Donor Name:' : `Pilgrims (${(booking.details.pilgrimNames || []).length}):`}</span>
            </div>
            <div style={{
              maxHeight: '44px',
              overflowY: 'auto',
              fontSize: '11px',
              color: 'var(--text-primary)',
              lineHeight: '1.4',
              paddingLeft: '18px',
              marginTop: '2px'
            }}>
              {(booking.details.pilgrimNames || []).map((name, index) => (
                <div key={index}>• {name}</div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Footer bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface-alt)',
        padding: '10px 16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ● Paid: ₹{booking.details.cost}
        </span>
        
        <button
          onClick={handlePrint}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Printer size={12} /> {booking.type === 'Donation' ? 'Print Receipt' : 'Print Pass'}
        </button>
      </div>

    </div>
  );
};
