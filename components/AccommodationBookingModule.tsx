import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './Button';
import { Input } from './Input';
import { AlertBanner } from './AlertBanner';
import { Home, ShieldAlert, ArrowRight, Check } from 'lucide-react';

interface AccommodationBookingModuleProps {
  onCancel: () => void;
  onProceedToCheckout: (bookingDetails: any) => void;
}

export const AccommodationBookingModule: React.FC<AccommodationBookingModuleProps> = ({
  onCancel,
  onProceedToCheckout,
}) => {
  const { bookings, user, coPilgrims } = useApp();
  const [location, setLocation] = useState<'Tirumala' | 'Tirupati'>('Tirumala');
  const [roomType, setRoomType] = useState<'Single' | 'Double' | 'AC' | 'Non-AC'>('Double');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInSlot, setCheckInSlot] = useState<'00:00 - 12:00' | '12:00 - 24:00'>('12:00 - 24:00');

  // Selected pilgrims for room allocation
  const [selectPrimary, setSelectPrimary] = useState(true);
  const [selectedCoPilgrimIds, setSelectedCoPilgrimIds] = useState<string[]>([]);
  
  const [quotaBlocked, setQuotaBlocked] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Cost mapping rules
  const getRoomCost = () => {
    switch (roomType) {
      case 'Single': return 100;
      case 'Non-AC': return 200;
      case 'Double': return 500;
      case 'AC': return 1000;
    }
  };

  // Run 30-day quota validation checker
  useEffect(() => {
    if (!user) return;
    
    // Find any accommodation booking in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const hasRecentBooking = bookings.some(b => {
      if (b.type !== 'Accommodation') return false;
      if (b.paymentStatus !== 'Success') return false;
      const bDate = b.bookingDate; // Creation date of booking
      return bDate >= thirtyDaysAgoStr;
    });

    if (hasRecentBooking) {
      setQuotaBlocked(true);
      setQuotaMessage('Quota Restricted: You have already booked an accommodation room in Tirumala/Tirupati in the last 30 days. TTD guidelines restrict bookings to once per 30 days per devotee.');
    } else {
      setQuotaBlocked(false);
      setQuotaMessage('');
    }
  }, [bookings, user]);

  const handleCoPilgrimToggle = (id: string) => {
    setSelectedCoPilgrimIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (quotaBlocked) {
      setValidationError('Cannot proceed. Quota restricted.');
      return;
    }

    if (!checkInDate) {
      setValidationError('Please select check-in date.');
      return;
    }

    // Set check-out date to 1 day after check-in automatically
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 1);
    const checkOutStr = checkOut.toISOString().split('T')[0];

    const selectedCount = (selectPrimary ? 1 : 0) + selectedCoPilgrimIds.length;
    if (selectedCount === 0) {
      setValidationError('Please select at least one pilgrim to reside in the room.');
      return;
    }
    if (selectedCount > 4) {
      setValidationError('Room booking allows a maximum of 4 pilgrims per room.');
      return;
    }

    // Verify all selected pilgrims have valid IDs for security check-in records
    if (selectPrimary && (!user.idProofType || !user.idNumber)) {
      setValidationError('Your profile (Primary Devotee) is missing required ID verification proof.');
      return;
    }
    for (const id of selectedCoPilgrimIds) {
      const pilgrim = coPilgrims.find(cp => cp.id === id);
      if (!pilgrim || !pilgrim.idProofType || !pilgrim.idNumber) {
        setValidationError(`Selected co-pilgrim "${pilgrim?.name || 'Unknown'}" is missing required ID verification proof.`);
        return;
      }
    }

    setValidationError('');
    
    const pilgrimNames: string[] = [];
    const pilgrimIds: string[] = [];

    if (selectPrimary) {
      pilgrimNames.push(`${user.name} (Self)`);
      pilgrimIds.push(user.id);
    }
    selectedCoPilgrimIds.forEach(id => {
      const pilgrim = coPilgrims.find(cp => cp.id === id);
      if (pilgrim) {
        pilgrimNames.push(pilgrim.name);
        pilgrimIds.push(pilgrim.id);
      }
    });

    onProceedToCheckout({
      type: 'Accommodation',
      location,
      roomType,
      checkInDate,
      checkInSlot,
      checkOutDate: checkOutStr,
      pilgrimIds,
      pilgrimNames,
      cost: getRoomCost()
    });
  };

  return (
    <div className="form-container-card" style={{ textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Home size={18} color="var(--primary)" />
          <span className="font-spiritual" style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>
            Room Accommodation
          </span>
        </div>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
        >
          Cancel
        </button>
      </div>

      {quotaBlocked ? (
        // Quota warnings block
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <AlertBanner type="error" message={quotaMessage} />
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)'
          }}>
            <ShieldAlert size={48} color="var(--error)" style={{ marginBottom: '10px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Booking Blocked
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              To ensure fair distribution, room allocations are capped. Please attempt booking after your 30-day window expires.
            </p>
          </div>
          <Button variant="outline" onClick={onCancel} style={{ width: '100%' }}>
            Go Back
          </Button>
        </div>
      ) : (
        // Reservation Form
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {validationError && <AlertBanner type="error" message={validationError} />}

          <AlertBanner
            type="info"
            message="Note: Accommodation is limited to 24 hours stay per booking. Extension is strictly not permitted."
          />

          {/* Location Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Select Location
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['Tirumala', 'Tirupati'] as const).map(loc => {
                const isActive = location === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                      backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: isActive ? 'var(--primary-dark)' : 'var(--text-primary)',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isActive && <Check size={16} />}
                    {loc} {loc === 'Tirumala' ? '(Hills)' : '(Downhill)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Type Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Room Category
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as any)}
              style={{
                padding: '10px 14px',
                fontSize: '15px',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                height: '45px'
              }}
            >
              <option value="Single">Single Room Non-AC (₹100)</option>
              <option value="Non-AC">Double Room Non-AC (₹200)</option>
              <option value="Double">Double Room AC (₹500)</option>
              <option value="AC">AC Suite / Deluxe (₹1000)</option>
            </select>
          </div>

          {/* Dates select grid */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1.2 }}>
              <Input
                label="Check-In Date"
                type="date"
                min="2026-06-27"
                max="2026-07-12"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Time Slot</label>
              <select
                value={checkInSlot}
                onChange={(e) => setCheckInSlot(e.target.value as any)}
                style={{
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  height: '45px',
                  outline: 'none'
                }}
              >
                <option value="00:00 - 12:00">Morning (00:00 - 12:00)</option>
                <option value="12:00 - 24:00">Evening (12:00 - 24:00)</option>
              </select>
            </div>
          </div>

          {/* Pilgrim Selection (Max 4 per room) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--secondary)' }}>
              Select Room Guests (Max 4):
            </label>
            
            {user && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={selectPrimary}
                  onChange={(e) => setSelectPrimary(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                  {user.name} (Self)
                </div>
              </label>
            )}

            {coPilgrims.map(p => {
              const isSelected = selectedCoPilgrimIds.includes(p.id);
              return (
                <label key={p.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCoPilgrimToggle(p.id)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    {p.name}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Checkout pricing summary */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
              <span>Room Tariff (24h stay)</span>
              <span>₹{getRoomCost()}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Security deposit of ₹200 extra is payable during physical check-in.
            </p>
          </div>

          <Button
            variant="primary"
            type="submit"
            style={{ width: '100%', marginTop: '10px' }}
            rightIcon={<ArrowRight size={16} />}
          >
            Proceed to checkout
          </Button>

        </form>
      )}

    </div>
  );
};
