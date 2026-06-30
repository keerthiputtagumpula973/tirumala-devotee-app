import React, { useState } from 'react';
import type { DarshanSlot } from '../types';
import { useApp } from '../context/AppContext';
import { Button } from './Button';
import { AlertBanner } from './AlertBanner';
import { StatusBadge } from './StatusBadge';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface DarshanBookingModuleProps {
  onCancel: () => void;
  onProceedToCheckout: (bookingDetails: any) => void;
}

export const DarshanBookingModule: React.FC<DarshanBookingModuleProps> = ({
  onCancel,
  onProceedToCheckout,
}) => {
  const { slots, coPilgrims, user } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DarshanSlot | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Select Slot, 2: Select Pilgrims
  
  // Selected pilgrims for this booking
  const [selectPrimary, setSelectPrimary] = useState(true);
  const [selectedCoPilgrimIds, setSelectedCoPilgrimIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');

  // Calendar dates setup (June 2026 & July 2026)
  const [currentMonth, setCurrentMonth] = useState<number>(6); // 6: June, 7: July (Year 2026)
  const currentYear = 2026;

  // Calendar rendering helper
  const daysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const startDayOfMonth = (month: number, year: number) => {
    // month is 0-indexed in JS Date: June is 5, July is 6
    return new Date(year, month - 1, 1).getDay();
  };

  const monthName = currentMonth === 6 ? 'June 2026' : 'July 2026';
  const totalDays = daysInMonth(currentMonth, currentYear);
  const startDay = startDayOfMonth(currentMonth, currentYear);

  // Group slots by date
  const getSlotsForDate = (dateStr: string) => {
    return slots.filter(s => s.date === dateStr);
  };

  // Determine the color/status of a specific calendar day
  const getDateStatus = (dateStr: string): DarshanSlot['status'] => {
    const dateSlots = getSlotsForDate(dateStr);
    if (dateSlots.length === 0) return 'Past';
    
    // Check if the date is in the past relative to the system date: 2026-06-26
    const todayStr = '2026-06-26';
    if (dateStr < todayStr) return 'Past';
    
    const allPast = dateSlots.every(s => s.status === 'Past');
    if (allPast) return 'Past';

    const allNotReleased = dateSlots.every(s => s.status === 'NotReleased');
    if (allNotReleased) return 'NotReleased';

    const allFull = dateSlots.every(s => s.status === 'Full');
    if (allFull) return 'Full';

    return 'Available'; // default if there are any available slots
  };

  const handleDateClick = (day: number) => {
    const dateStr = `2026-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const status = getDateStatus(dateStr);
    
    if (status === 'Past') {
      alert('This date is in the past or blocked.');
      return;
    }
    if (status === 'NotReleased') {
      alert('Slots for this date have not been released yet.');
      return;
    }
    
    setSelectedDate(dateStr);
    setSelectedSlot(null); // Reset selected slot
  };

  const handleCoPilgrimToggle = (id: string) => {
    setSelectedCoPilgrimIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleProceedToPilgrims = () => {
    if (!selectedSlot) {
      alert('Please select a time slot first.');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (!user) return;
    const selectedCount = (selectPrimary ? 1 : 0) + selectedCoPilgrimIds.length;
    
    if (selectedCount === 0) {
      setValidationError('Please select at least one pilgrim for this booking.');
      return;
    }

    // Secure Virtual Queue: Verify that every selected pilgrim has valid and loaded ID details
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

    // Capacity checking
    const remainingQuota = selectedSlot ? (selectedSlot.quotaTotal - selectedSlot.quotaBooked) : 0;
    if (selectedCount > remainingQuota) {
      setValidationError(`Insufficient slot quota. Only ${remainingQuota} seats left in this slot.`);
      return;
    }

    setValidationError('');
    
    // Package booking details
    const pilgrimNames: string[] = [];
    const pilgrimIds: string[] = [];

    if (selectPrimary) {
      pilgrimNames.push(`${user.name} (Self)`);
      pilgrimIds.push(user.id);
    }
    selectedCoPilgrimIds.forEach(id => {
      const pilgrim = coPilgrims.find(cp => cp.id === id);
      if (pilgrim) {
        pilgrimNames.push(`${pilgrim.name}`);
        pilgrimIds.push(pilgrim.id);
      }
    });

    onProceedToCheckout({
      type: 'Darshan',
      date: selectedDate,
      timeSlot: selectedSlot?.timeSlot,
      slotId: selectedSlot?.id,
      pilgrimIds,
      pilgrimNames,
      cost: selectedCount * 300
    });
  };

  // Compile calendar cells grid
  const calendarDays = [];
  // Empty slots for offset start day
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} />);
  }
  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `2026-${currentMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const status = getDateStatus(dateStr);
    const isSelected = selectedDate === dateStr;

    // Apply color-coded styling
    let cellStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '38px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '13px',
      fontWeight: '600',
      cursor: status === 'Past' || status === 'NotReleased' ? 'not-allowed' : 'pointer',
      transition: 'all var(--transition-fast)',
      border: isSelected ? '2px solid var(--primary-dark)' : '1px solid transparent'
    };

    if (status === 'Past') {
      cellStyle.backgroundColor = '#e0e0e0';
      cellStyle.color = '#9e9e9e';
    } else if (status === 'NotReleased') {
      cellStyle.backgroundColor = '#e3f2fd';
      cellStyle.color = '#1565c0';
    } else if (status === 'Full') {
      cellStyle.backgroundColor = '#ffebee';
      cellStyle.color = '#c62828';
    } else {
      // Available
      cellStyle.backgroundColor = '#e8f5e9';
      cellStyle.color = '#2e7d32';
      if (isSelected) {
        cellStyle.transform = 'scale(1.05)';
        cellStyle.boxShadow = 'var(--shadow-sm)';
      }
    }

    calendarDays.push(
      <button
        key={`day-${d}`}
        onClick={() => handleDateClick(d)}
        style={cellStyle}
        type="button"
        title={`Status: ${status}`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="form-container-card" style={{ textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="font-spiritual" style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>
          Darshan Booking (Step {step}/2)
        </h3>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
        >
          Cancel
        </button>
      </div>

      {step === 1 ? (
        // Step 1: Calendar and Slot selection
        <>
          <AlertBanner
            type="info"
            message="Legend: 🟢 Available | 🔴 Full | 🔵 Not Released | ⚪ Blocked / Past"
          />

          {/* Month Selector header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setCurrentMonth(6)}
              disabled={currentMonth === 6}
              style={{
                background: 'none',
                border: 'none',
                cursor: currentMonth === 6 ? 'not-allowed' : 'pointer',
                color: currentMonth === 6 ? 'var(--text-muted)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{monthName}</span>
            <button
              onClick={() => setCurrentMonth(7)}
              disabled={currentMonth === 7}
              style={{
                background: 'none',
                border: 'none',
                cursor: currentMonth === 7 ? 'not-allowed' : 'pointer',
                color: currentMonth === 7 ? 'var(--text-muted)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Days of week */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginBottom: '8px'
            }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx}>{day}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px'
            }}>
              {calendarDays}
            </div>
          </div>

          {/* Time Slots availability list for selected date */}
          {selectedDate && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              animation: 'fadeIn var(--transition-fast) forwards'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Clock size={16} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  Slots for {selectedDate}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getSlotsForDate(selectedDate).map((slot) => {
                  const isFull = slot.status === 'Full';
                  const isSlotSelected = selectedSlot?.id === slot.id;
                  const availableCount = slot.quotaTotal - slot.quotaBooked;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => !isFull && setSelectedSlot(slot)}
                      disabled={isFull}
                      style={{
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSlotSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        backgroundColor: isSlotSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        opacity: isFull ? 0.55 : 1,
                        transition: 'all var(--transition-fast)',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {slot.timeSlot}
                        </div>
                        <div style={{ fontSize: '11px', color: isFull ? 'var(--error)' : 'var(--success)', marginTop: '2px' }}>
                          {isFull ? 'Sold Out' : `${availableCount} slots available`}
                        </div>
                      </div>
                      <StatusBadge state={slot.status} />
                    </button>
                  );
                })}
              </div>

              <Button
                variant="primary"
                onClick={handleProceedToPilgrims}
                disabled={!selectedSlot}
                style={{ marginTop: '14px', width: '100%' }}
                rightIcon={<ArrowRight size={16} />}
              >
                Proceed to Pilgrim Selection
              </Button>
            </div>
          )}
        </>
      ) : (
        // Step 2: Pilgrim Selection
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {validationError && <AlertBanner type="error" message={validationError} />}

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Selected Slot:
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              📅 {selectedDate} | ⏰ {selectedSlot?.timeSlot}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--secondary)' }}>
              Select Pilgrims (Max 6 total):
            </h4>

            {/* Primary User Checkbox */}
            {user && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    {user.name} (Primary Devotee)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {user.idProofType}: {user.idNumber}
                  </div>
                </div>
              </label>
            )}

            {/* Co-pilgrims Checkbox List */}
            {coPilgrims.length === 0 ? (
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1.5px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  No co-pilgrims registered in profile.
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  You can register family members under your **Profile tab** first to add them to this booking.
                </p>
              </div>
            ) : (
              coPilgrims.map((pilgrim) => {
                const isSelected = selectedCoPilgrimIds.includes(pilgrim.id);
                return (
                  <label key={pilgrim.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--primary-light)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCoPilgrimToggle(pilgrim.id)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>
                        {pilgrim.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {pilgrim.idProofType}: {pilgrim.idNumber}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {/* Pricing summary */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
              <span>Special Entry Pass (₹300 × {(selectPrimary ? 1 : 0) + selectedCoPilgrimIds.length})</span>
              <span>₹{((selectPrimary ? 1 : 0) + selectedCoPilgrimIds.length) * 300}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Price includes free small laddu prasad pass per ticket.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <Button variant="outline" onClick={() => setStep(1)} style={{ flex: 1 }}>
              Back to Slots
            </Button>
            <Button variant="primary" onClick={handleFinalSubmit} style={{ flex: 1.5 }}>
              Proceed to payment
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
