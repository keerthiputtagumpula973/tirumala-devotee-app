import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { AlertBanner } from './AlertBanner';
import { CreditCard, ArrowRight, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModuleProps {
  bookingDetails: {
    type: 'Darshan' | 'Accommodation' | 'Donation';
    cost: number;
    pilgrimIds: string[];
    pilgrimNames: string[];
    // Darshan details
    date?: string;
    timeSlot?: string;
    slotId?: string;
    // Accommodation details
    location?: 'Tirumala' | 'Tirupati';
    roomType?: string;
    checkInDate?: string;
    checkInSlot?: string;
    checkOutDate?: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

type PaymentStep = 'summary' | 'gateway' | 'processing' | 'success' | 'failure' | 'timeout';

export const CheckoutModule: React.FC<CheckoutModuleProps> = ({
  bookingDetails,
  onCancel,
  onSuccess,
}) => {
  const { addBooking, updateSlotQuota, user } = useApp();
  const [step, setStep] = useState<PaymentStep>('summary');
  
  // Payment methods
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankName, setBankName] = useState('SBI');
  
  // Error checks
  const [errorMsg, setErrorMsg] = useState('');

  // Middle-layer Transaction state generator (success/fail/timeout selector for mock ease!)
  const [simulatedOutcome, setSimulatedOutcome] = useState<'Success' | 'Failure' | 'Timeout'>('Success');

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleStartPayment = () => {
    setErrorMsg('');
    if (paymentMode === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g., devotee@ybl)');
        return;
      }
    } else if (paymentMode === 'Card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setErrorMsg('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setErrorMsg('Please enter card expiry in MM/YY format');
        return;
      }
      if (cardCvv.length !== 3) {
        setErrorMsg('Please enter a 3-digit CVV number');
        return;
      }
    }

    setStep('processing');
    
    // Simulate transaction delays
    setTimeout(() => {
      if (simulatedOutcome === 'Success') {
        // Complete the database allocation
        const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Quota updates for Darshan slots
        if (bookingDetails.type === 'Darshan' && bookingDetails.slotId) {
          updateSlotQuota(bookingDetails.slotId, bookingDetails.pilgrimIds.length);
        }

        const newBooking: Booking = {
          id: bookingId,
          userId: user?.id || '',
          type: bookingDetails.type,
          bookingDate: new Date().toISOString().split('T')[0],
          details: {
            date: bookingDetails.date || new Date().toISOString().split('T')[0],
            timeSlot: bookingDetails.timeSlot,
            pilgrimsCount: bookingDetails.pilgrimIds.length,
            pilgrimNames: bookingDetails.pilgrimNames,
            location: bookingDetails.location,
            roomType: bookingDetails.roomType as any,
            checkInDate: bookingDetails.checkInDate,
            checkInSlot: bookingDetails.checkInSlot,
            checkOutDate: bookingDetails.checkOutDate,
            cost: bookingDetails.cost,
            trustName: (bookingDetails as any).trustName,
            panCard: (bookingDetails as any).panCard
          },
          paymentStatus: 'Success',
          paymentMode,
          qrCodeData: `TTD-SECURE-PASS|ID:${bookingId}|TYPE:${bookingDetails.type}|QTY:${bookingDetails.pilgrimIds.length}|DATE:${bookingDetails.date || bookingDetails.checkInDate}`
        };

        addBooking(newBooking);
        setStep('success');
        triggerConfetti();
      } else if (simulatedOutcome === 'Failure') {
        setStep('failure');
      } else {
        setStep('timeout');
      }
    }, 2500);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setCardExpiry(formatted.slice(0, 5));
  };

  return (
    <div className="form-container-card" style={{ textAlign: 'left' }}>
      
      {step === 'summary' && (
        // Summary View
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-spiritual" style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>
              Checkout Summary
            </h3>
            <button
              onClick={onCancel}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
            >
              Back
            </button>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
              {bookingDetails.type === 'Darshan' ? '🎫 Special Entry Darshan Pass' : '🏠 Accommodation Room'}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginTop: '10px' }}>
              {bookingDetails.type === 'Darshan' ? (
                <>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong>{bookingDetails.date}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Time Slot:</span> <strong>{bookingDetails.timeSlot}</strong></div>
                </>
              ) : (
                <>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Location:</span> <strong>{bookingDetails.location}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Room Category:</span> <strong>{bookingDetails.roomType}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Check-In:</span> <strong>{bookingDetails.checkInDate} ({bookingDetails.checkInSlot})</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Check-Out:</span> <strong>{bookingDetails.checkOutDate}</strong></div>
                </>
              )}
            </div>
          </div>

          {/* Pilgrims detail review */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '8px' }}>
              Verified Guests ({bookingDetails.pilgrimIds.length}):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {bookingDetails.pilgrimNames.map((name, i) => (
                <div key={i} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-app)', paddingBottom: '4px' }}>
                  <span>{name}</span>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ ID Verified</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secure validation warning */}
          <div style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: 'var(--info-bg)',
            color: 'var(--info)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <span>Virtual Queue validated. Original government physical ID proof matching these credentials must be shown at the entrance.</span>
          </div>

          {/* Bill summary */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', color: 'var(--secondary)' }}>
              <span>Total Payable Amount</span>
              <span>₹{bookingDetails.cost}</span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setStep('gateway')}
            style={{ width: '100%' }}
            rightIcon={<ArrowRight size={16} />}
          >
            Confirm & Pay ₹{bookingDetails.cost}
          </Button>
        </>
      )}

      {step === 'gateway' && (
        // Payment gateway portal simulation
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={18} color="var(--primary)" />
              <span className="font-spiritual" style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 'bold' }}>
                Secure Payment Gateway
              </span>
            </div>
            <button
              onClick={() => setStep('summary')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
            >
              Back
            </button>
          </div>

          {errorMsg && <AlertBanner type="error" message={errorMsg} onClose={() => setErrorMsg('')} />}

          {/* Gateway selector modes */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '6px', border: '1px solid var(--border-color)' }}>
            {(['UPI', 'Card', 'NetBanking'] as const).map(mode => {
              const active = paymentMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {paymentMode === 'UPI' && (
              <Input
                label="Virtual Payment Address (VPA / UPI ID)"
                placeholder="E.g. devotee@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                hint="Enter your UPI address to request payment."
              />
            )}

            {paymentMode === 'Card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Input
                  label="Cardholder Number"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  type="tel"
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1.2 }}>
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      type="text"
                    />
                  </div>
                  <div style={{ flex: 0.8 }}>
                    <Input
                      label="CVV Code"
                      placeholder="xxx"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      type="password"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMode === 'NetBanking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Select Popular Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-sans)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    height: '45px',
                    outline: 'none'
                  }}
                >
                  <option value="SBI">State Bank of India (SBI)</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                </select>
              </div>
            )}
          </div>

          {/* Simulated middleware outcome controller */}
          <div style={{
            backgroundColor: 'var(--bg-surface-alt)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed var(--border-color)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
              <HelpCircle size={14} />
              <span>Simulated Payment Gateway Middleware:</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['Success', 'Failure', 'Timeout'] as const).map(outcome => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => setSimulatedOutcome(outcome)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontWeight: simulatedOutcome === outcome ? 'bold' : 'normal',
                    backgroundColor: simulatedOutcome === outcome ? 'var(--primary-light)' : 'var(--bg-surface)',
                    color: simulatedOutcome === outcome ? 'var(--primary-dark)' : 'var(--text-secondary)'
                  }}
                >
                  {outcome}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              Select target outcome to test positive and negative transaction handling.
            </span>
          </div>

          <Button
            variant="primary"
            onClick={handleStartPayment}
            style={{ width: '100%', marginTop: '6px' }}
          >
            Pay Securely ₹{bookingDetails.cost}
          </Button>
        </>
      )}

      {step === 'processing' && (
        // Transaction processing loader spinner
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          animation: 'fadeIn var(--transition-normal) forwards'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite'
          }} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>
              Processing Transaction
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Please do not refresh the page or click back. We are communicating with secure bank servers...
            </p>
          </div>
        </div>
      )}

      {step === 'success' && (
        // Transaction success check screen
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn var(--transition-normal) forwards'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--success)',
            boxShadow: '0 0 16px rgba(46, 125, 50, 0.2)'
          }}>
            <span style={{ fontSize: '32px' }}>✓</span>
          </div>
          <div>
            <h3 className="font-spiritual" style={{ fontSize: '18px', color: 'var(--success)', fontWeight: 'bold' }}>
              Booking Confirmed!
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Haridra / Saffron confirmation receipt generated. Your passes have been secured successfully!
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            width: '100%',
            textAlign: 'left',
            marginTop: '10px'
          }}>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Booking ID:</span>
              <span style={{ fontWeight: 'bold' }}>BK-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Service Type:</span>
              <span style={{ fontWeight: 'bold' }}>{bookingDetails.type} Ticket</span>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Paid:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>₹{bookingDetails.cost}</span>
            </div>
          </div>

          <Button variant="primary" onClick={onSuccess} style={{ width: '100%', marginTop: '16px' }}>
            Go to Bookings Dashboard
          </Button>
        </div>
      )}

      {step === 'failure' && (
        // Transaction Failure screen
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn var(--transition-normal) forwards'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--error)'
          }}>
            <span style={{ fontSize: '32px' }}>✗</span>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--error)', fontWeight: 'bold' }}>
              Transaction Declined
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              The payment attempt was declined by the bank network. Please check your card/VPA parameters or select an alternative mode.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setStep('gateway')} style={{ flex: 1 }}>
              Retry Pay
            </Button>
            <Button variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
              Cancel Order
            </Button>
          </div>
        </div>
      )}

      {step === 'timeout' && (
        // Transaction connection timeout screen
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn var(--transition-normal) forwards'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(158, 142, 131, 0.1)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--text-muted)'
          }}>
            <RefreshCw size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              Network Timeout
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              The connection to the bank portal timed out before authorization could complete. No funds have been debited.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setStep('gateway')} style={{ flex: 1 }}>
              Try Again
            </Button>
            <Button variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
