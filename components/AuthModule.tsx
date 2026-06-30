import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Input } from './Input';
import { Button } from './Button';
import { AlertBanner } from './AlertBanner';
import { ShieldCheck, UserPlus, KeyRound, Smartphone } from 'lucide-react';

export const AuthModule: React.FC = () => {
  const { login, register, user } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Registration states
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regIdType, setRegIdType] = useState<'Aadhaar' | 'Passport' | 'VoterID' | 'PAN'>('Aadhaar');
  const [regIdNumber, setRegIdNumber] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateMobile = (num: string) => /^[6-9]\d{9}$/.test(num);

  const handleRequestOtp = () => {
    if (!validateMobile(mobile)) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      // Generate a mock OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
    }, 800);
  };

  const handleVerifyOtp = async () => {
    if (otp !== generatedOtp && otp !== '123456') {
      setErrorMsg('Invalid OTP. Use the code shown in the green banner above or "123456".');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const success = await login(mobile, otp);
      if (!success) {
        // Pre-fill verified mobile and redirect to registration page
        setRegMobile(mobile);
        setIsRegistering(true);
        setOtpSent(false);
        setErrorMsg('Mobile verified! Devotee profile not found. Please complete your registration details below.');
      }
    } catch (e) {
      setErrorMsg('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (regName.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!validateMobile(regMobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    const ageVal = parseInt(regAge);
    if (isNaN(ageVal) || ageVal < 5 || ageVal > 110) {
      newErrors.age = 'Age must be between 5 and 110 years';
    }
    if (regIdNumber.trim().length < 4) {
      newErrors.idNumber = 'Please enter a valid ID proof number';
    } else if (regIdType === 'Aadhaar') {
      const sanitized = regIdNumber.replace(/[-\s]/g, '');
      if (!/^\d{12}$/.test(sanitized)) {
        newErrors.idNumber = 'Aadhaar card must contain exactly 12 digits';
      }
    } else if (regIdType === 'PAN') {
      const sanitized = regIdNumber.trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(sanitized)) {
        newErrors.idNumber = 'PAN Card must be 10 characters (e.g., ABCDE1234F)';
      }
    } else if (regIdType === 'Passport') {
      const sanitized = regIdNumber.trim().toUpperCase();
      if (!/^[A-Z][0-9]{7}$/.test(sanitized)) {
        newErrors.idNumber = 'Passport must be 1 letter followed by 7 digits (e.g., A1234567)';
      }
    } else if (regIdType === 'VoterID') {
      const sanitized = regIdNumber.trim().toUpperCase();
      if (!/^[A-Z]{3}[0-9]{7}$/.test(sanitized) && sanitized.length < 5) {
        newErrors.idNumber = 'Voter ID format is invalid (e.g., ABC1234567)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await register({
        name: regName,
        mobile: regMobile,
        age: parseInt(regAge),
        gender: regGender,
        idProofType: regIdType,
        idNumber: regIdNumber,
      });
    } catch (err) {
      setErrorMsg('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (user) return null;

  return (
    <div style={{
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      animation: 'fadeIn var(--transition-normal) forwards'
    }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 12px auto',
          border: '1.5px solid var(--primary)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <ShieldCheck size={32} color="var(--primary)" />
        </div>
        <h2 className="font-spiritual" style={{ fontSize: '18px', color: 'var(--secondary)' }}>
          Secure Portal Login
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Access Special Entry Darshan and Accommodation services
        </p>
      </div>

      {errorMsg && <AlertBanner type="error" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {!isRegistering ? (
        // Login Screen
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {otpSent && (
            <AlertBanner
              type="success"
              message={`🔑 OTP Code Sent! Enter simulated code: ${generatedOtp} (or "123456")`}
            />
          )}

          {!otpSent ? (
            <>
              <Input
                label="Registered Mobile Number"
                placeholder="Enter 10-digit number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                type="tel"
                leftIcon={<Smartphone size={16} />}
                hint="We will verify your mobile number using an OTP."
              />
              <Button
                variant="primary"
                onClick={handleRequestOtp}
                isLoading={loading}
                style={{ marginTop: '8px' }}
                width="100%"
              >
                Send OTP Verification
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Simulated OTP Code"
                placeholder="Enter 6-digit OTP code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                type="text"
                isPassword={true}
                leftIcon={<KeyRound size={16} />}
                hint="Verify using the 6-digit passcode sent above."
              />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <Button variant="outline" onClick={() => setOtpSent(false)} style={{ flex: 1 }}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleVerifyOtp} isLoading={loading} style={{ flex: 1.5 }}>
                  Verify & Log In
                </Button>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>New Devotee? </span>
            <button
              onClick={() => {
                setIsRegistering(true);
                setErrorMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                textDecoration: 'underline'
              }}
            >
              Sign Up / Register Here
            </button>
          </div>
        </div>
      ) : (
        // Registration Screen
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <Input
            label="Full Name (as in ID proof)"
            placeholder="E.g. ABCD"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            error={errors.name}
          />

          <Input
            label="Mobile Number"
            placeholder="10-digit number"
            value={regMobile}
            onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            type="tel"
            error={errors.mobile}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Age (Years)"
                placeholder="E.g. 35"
                value={regAge}
                onChange={(e) => setRegAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
                type="number"
                error={errors.age}
              />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Gender</label>
              <select
                value={regGender}
                onChange={(e) => setRegGender(e.target.value as any)}
                style={{
                  padding: '10px 14px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  height: '45px',
                  outline: 'none'
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>ID Proof Type</label>
              <select
                value={regIdType}
                onChange={(e) => setRegIdType(e.target.value as any)}
                style={{
                  padding: '10px 14px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  height: '45px',
                  outline: 'none'
                }}
              >
                <option value="Aadhaar">Aadhaar (12 Digits)</option>
                <option value="Passport">Passport</option>
                <option value="VoterID">Voter ID</option>
                <option value="PAN">PAN Card</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <Input
                label="ID Proof Number"
                placeholder="Enter ID details"
                value={regIdNumber}
                onChange={(e) => setRegIdNumber(e.target.value)}
                error={errors.idNumber}
              />
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            isLoading={loading}
            leftIcon={<UserPlus size={18} />}
            style={{ marginTop: '8px' }}
            width="100%"
          >
            Register & Sign In
          </Button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Already have an account? </span>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setErrorMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                textDecoration: 'underline'
              }}
            >
              Log In here
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
