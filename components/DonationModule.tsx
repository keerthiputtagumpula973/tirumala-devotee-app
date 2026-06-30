import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './Button';
import { Input } from './Input';
import { CheckoutModule } from './CheckoutModule';
import { Award, Heart, ShieldCheck, Printer } from 'lucide-react';
import hundiBanner from '../assets/hundi_divine.png';
import { HundiIcon } from './HundiIcon';

export const DonationModule: React.FC = () => {
  const { user } = useApp();
  const [trustName, setTrustName] = useState('Srivari Annaprasadam Trust');
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [panCard, setPanCard] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkoutDetails, setCheckoutDetails] = useState<any | null>(null);
  
  // Completed donation receipt state
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  const trusts = [
    { name: 'Srivari Annaprasadam Trust', desc: 'Provides free blessed meals (Annaprasadam) to thousands of visiting pilgrims daily.' },
    { name: 'Sri Venkateswara Pranadana Trust', desc: 'Provides free medical treatment and cardiac surgeries to poor patients in TTD hospitals.' },
    { name: 'Sri Venkateswara Gosamrakshana Trust', desc: 'Promotes protection of cows, establishment of modern dairies, and Vedic farming.' },
    { name: 'Sri Venkateswara Vedic University Trust', desc: 'Supports Vedic studies, research projects, and preservation of ancient scriptures.' }
  ];

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal < 100) {
      newErrors.amount = 'Minimum donation amount is ₹100';
    }
    if (!donorName.trim()) {
      newErrors.donorName = 'Please enter donor name';
    }
    
    // For tax deductions PAN is required for amounts >= 2000
    if (amountVal >= 2000) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panCard.trim()) {
        newErrors.panCard = 'PAN card number is required for donations of ₹2,000 and above for 80G tax receipt.';
      } else if (!panRegex.test(panCard.toUpperCase())) {
        newErrors.panCard = 'Please enter a valid 10-digit alphanumeric PAN card number';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Package for CheckoutModule
    setCheckoutDetails({
      type: 'Donation',
      cost: amountVal,
      pilgrimIds: [user?.id || 'guest'],
      pilgrimNames: [donorName],
      trustName,
      panCard: panCard.toUpperCase(),
      address
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (activeReceipt) {
    return (
      <div className="form-container-card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="font-spiritual" style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>
            Donation Receipt
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setActiveReceipt(null)}>
            Close
          </Button>
        </div>

        {/* Instantly generated tax receipt card */}
        <div id="receipt-print-area" style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: 'var(--radius-md)',
          border: '2px solid #800000',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          fontFamily: 'var(--font-sans)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Spiritual watermark for print layout */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '140px',
            opacity: 0.04,
            pointerEvents: 'none',
            color: '#c25900'
          }}>
            🕉️
          </div>

          <div style={{ textAlign: 'center', borderBottom: '2px dashed #800000', paddingBottom: '14px', marginBottom: '14px' }}>
            <h2 className="font-spiritual" style={{ fontSize: '16px', color: '#800000', fontWeight: 'bold' }}>
              Tirumala Tirupati Devasthanams
            </h2>
            <p style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
              Sri Venkateswara Hundi & Donation Trusts Portal
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#555' }}>Receipt Number:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{activeReceipt.receiptNumber}</strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#555' }}>Date of Donation:</span>
              <strong>{activeReceipt.date}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#555' }}>Donation Trust:</span>
              <strong style={{ textAlign: 'right', maxWidth: '70%' }}>{activeReceipt.trustName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#555' }}>Donor Name:</span>
              <strong>{activeReceipt.donorName}</strong>
            </div>

            {activeReceipt.panCard && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#555' }}>Donor PAN Card:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{activeReceipt.panCard}</strong>
              </div>
            )}

            <div style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              borderTop: '1px solid #eee', 
              borderBottom: '1px solid #eee', 
              padding: '8px 0', 
              margin: '6px 0',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: 'bold', color: '#800000' }}>Donated Amount:</span>
              <strong style={{ color: '#2e7d32' }}>₹{activeReceipt.amount}</strong>
            </div>
          </div>

          {/* Tax exemption clause */}
          <div style={{
            marginTop: '12px',
            backgroundColor: '#f9f9f9',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            display: 'flex',
            gap: '8px',
            fontSize: '11px',
            lineHeight: '1.4'
          }}>
            <Award size={18} color="#c25900" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#c25900' }}>80G Tax Exemption Eligible</strong>
              <p style={{ color: '#666', marginTop: '2px' }}>
                This is a computer-generated tax receipt. Donations to this TTD trust are 50% exempted from Income Tax under Section 80G(5)(vi) of the Income Tax Act, 1961.
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#777' }}>
            May the blessings of Lord Sri Venkateswara be upon you.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <Button
            variant="outline"
            onClick={handlePrint}
            style={{ flex: 1 }}
            leftIcon={<Printer size={16} />}
          >
            Print Receipt
          </Button>
          <Button
            variant="primary"
            onClick={() => setActiveReceipt(null)}
            style={{ flex: 1.5 }}
          >
            Done / Donate Again
          </Button>
        </div>
      </div>
    );
  }

  if (checkoutDetails) {
    return (
      <CheckoutModule
        bookingDetails={checkoutDetails}
        onCancel={() => setCheckoutDetails(null)}
        onSuccess={() => {
          const recNo = `REC-${Math.floor(10000000 + Math.random() * 90000000)}`;
          const recDetails = {
            receiptNumber: recNo,
            date: new Date().toISOString().split('T')[0],
            trustName,
            donorName,
            panCard: panCard.toUpperCase(),
            amount
          };
          
          // Save in user profile / bookings simulation if desired, or just show receipt
          setActiveReceipt(recDetails);
          setCheckoutDetails(null);
          // Clear inputs
          setAmount('');
          setPanCard('');
          setAddress('');
        }}
      />
    );
  }

  return (
    <div className="form-container-card" style={{ textAlign: 'left' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <HundiIcon size={24} />
        <h3 className="font-spiritual" style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>
          Digital Hundi & Trust Donations
        </h3>
      </div>

      <div style={{
        backgroundImage: `linear-gradient(rgba(128, 0, 0, 0.4), rgba(64, 0, 0, 0.75)), url(${hundiBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '20px 16px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minHeight: '130px',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', zIndex: 1 }}>
          <Heart size={20} color="var(--gold)" />
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--gold)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            Support Sacred TTD Charities
          </span>
        </div>
        <p style={{ fontSize: '11.5px', opacity: 0.95, lineHeight: '1.4', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.8)', margin: 0 }}>
          Your digital contributions directly support free food distributions, medical care for the underprivileged, cow protection, and Vedic heritage education.
        </p>
      </div>

      <form onSubmit={handleDonateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Trust Selection dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Select Donation Trust / Cause
          </label>
          <select
            value={trustName}
            onChange={(e) => setTrustName(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              outline: 'none',
              height: '45px'
            }}
          >
            {trusts.map((t, idx) => (
              <option key={idx} value={t.name}>{t.name}</option>
            ))}
          </select>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px', lineHeight: '1.3' }}>
            {trusts.find(t => t.name === trustName)?.desc}
          </span>
        </div>

        {/* Amount Input */}
        <Input
          label="Donation Amount (INR)"
          placeholder="Enter amount (Minimum ₹100)"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
          type="number"
          error={errors.amount}
          hint="PAN number is required for contributions ₹2,000+ for tax deduction receipts."
        />

        {/* Donor details */}
        <Input
          label="Donor Full Name"
          placeholder="E.g. ABCD"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          error={errors.donorName}
        />

        {/* PAN Card field if amount >= 2000 */}
        {(parseFloat(amount) >= 2000) && (
          <Input
            label="PAN Card Number (10 Alphanumeric)"
            placeholder="E.g. ABCDE1234F"
            value={panCard}
            onChange={(e) => setPanCard(e.target.value.toUpperCase().slice(0, 10))}
            error={errors.panCard}
            hint="Mandatory under Section 80G of the IT Act for donations >= ₹2,000."
          />
        )}

        <Input
          label="Donor Residential Address (Optional)"
          placeholder="Enter address details for receipt records"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '11.5px',
          alignItems: 'center',
          fontWeight: '500'
        }}>
          <ShieldCheck size={16} />
          <span>All transactions are secured with 256-bit encryption.</span>
        </div>

        <Button
          variant="primary"
          type="submit"
          style={{ width: '100%', marginTop: '6px' }}
        >
          Donate Securely
        </Button>

      </form>

    </div>
  );
};
