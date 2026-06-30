import React, { useState } from 'react';
import type { CoPilgrim } from '../types';
import { useApp } from '../context/AppContext';
import { Input } from './Input';
import { Button } from './Button';
import { AlertBanner } from './AlertBanner';
import { Users, UserPlus, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export const CoPilgrimModule: React.FC = () => {
  const { user, coPilgrims, addCoPilgrim, deleteCoPilgrim, updateCoPilgrim } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [idProofType, setIdProofType] = useState<'Aadhaar' | 'Passport' | 'VoterID' | 'PAN'>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('Male');
    setIdProofType('Aadhaar');
    setIdNumber('');
    setErrors({});
    setEditingId(null);
  };

  const handleEditClick = (p: CoPilgrim) => {
    setName(p.name);
    setAge(p.age.toString());
    setGender(p.gender);
    setIdProofType(p.idProofType);
    setIdNumber(p.idNumber);
    setEditingId(p.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      await deleteCoPilgrim(id);
      setBannerMsg('Co-pilgrim profile removed successfully.');
      setTimeout(() => setBannerMsg(''), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    const ageVal = parseInt(age);
    if (isNaN(ageVal) || ageVal < 5 || ageVal > 110) {
      newErrors.age = 'Age must be between 5 and 110 years';
    }
    if (idNumber.trim().length < 4) {
      newErrors.idNumber = 'Please enter a valid ID proof number';
    } else if (idProofType === 'Aadhaar') {
      const sanitized = idNumber.replace(/[-\s]/g, '');
      if (!/^\d{12}$/.test(sanitized)) {
        newErrors.idNumber = 'Aadhaar card must contain exactly 12 digits';
      }
    } else if (idProofType === 'PAN') {
      const sanitized = idNumber.trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(sanitized)) {
        newErrors.idNumber = 'PAN Card must be 10 characters (e.g., ABCDE1234F)';
      }
    } else if (idProofType === 'Passport') {
      const sanitized = idNumber.trim().toUpperCase();
      if (!/^[A-Z][0-9]{7}$/.test(sanitized)) {
        newErrors.idNumber = 'Passport must be 1 letter followed by 7 digits (e.g., A1234567)';
      }
    } else if (idProofType === 'VoterID') {
      const sanitized = idNumber.trim().toUpperCase();
      if (!/^[A-Z]{3}[0-9]{7}$/.test(sanitized) && sanitized.length < 5) {
        newErrors.idNumber = 'Voter ID format is invalid (e.g., ABC1234567)';
      }
    }

    // Check for duplicate ID numbers across the group
    if (idNumber.trim()) {
      const cleanId = idNumber.replace(/[-\s]/g, '').toUpperCase();
      if (user && user.idNumber.replace(/[-\s]/g, '').toUpperCase() === cleanId) {
        newErrors.idNumber = 'ID proof number matches primary account owner';
      }
      const duplicate = coPilgrims.find(
        (p) => p.id !== editingId && p.idNumber.replace(/[-\s]/g, '').toUpperCase() === cleanId
      );
      if (duplicate) {
        newErrors.idNumber = `ID number is already registered to ${duplicate.name}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      if (editingId) {
        // Edit co-pilgrim
        await updateCoPilgrim(editingId, {
          name,
          age: ageVal,
          gender,
          idProofType,
          idNumber
        });
        setBannerMsg('Family member profile updated.');
      } else {
        // Add new co-pilgrim
        if (coPilgrims.length >= 5) {
          alert('You can add up to 5 family/co-pilgrim members.');
          setLoading(false);
          return;
        }
        await addCoPilgrim({
          name,
          age: ageVal,
          gender,
          idProofType,
          idNumber
        });
        setBannerMsg('Family member profile added.');
      }
      setTimeout(() => setBannerMsg(''), 3000);
      setIsEditing(false);
      resetForm();
    } catch (err) {
      alert('Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      animation: 'fadeIn var(--transition-normal) forwards'
    }}>
      
      {bannerMsg && <AlertBanner type="success" message={bannerMsg} />}

      {!isEditing ? (
        // List screen
        (() => {
          const devoteePilgrims = coPilgrims.filter(p => p.userId === user?.id);
          return (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--primary)" />
                  <span className="font-spiritual" style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--secondary)' }}>
                    Co-Pilgrims ({devoteePilgrims.length}/5)
                  </span>
                </div>
                
                {devoteePilgrims.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetForm();
                      setIsEditing(true);
                    }}
                    leftIcon={<UserPlus size={14} />}
                  >
                    Add Member
                  </Button>
                )}
              </div>

              {devoteePilgrims.length === 0 ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px dashed var(--border-color)',
                  color: 'var(--text-secondary)'
                }}>
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                    No family members added yet.
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Add up to 5 family/group pilgrims now to easily select them during Darshan and Accommodation ticket checkout.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {devoteePilgrims.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {p.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {p.gender}, Age: {p.age} | {p.idProofType}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', marginTop: '1px' }}>
                          ID: {p.idNumber}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEditClick(p)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            padding: '6px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            backgroundColor: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Edit Profile"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--error)',
                            padding: '6px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            backgroundColor: 'var(--error-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete Profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {devoteePilgrims.length >= 5 && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  backgroundColor: 'var(--warning-bg)',
                  color: 'var(--warning)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  alignItems: 'center',
                  fontWeight: '500'
                }}>
                  <ShieldAlert size={16} />
                  <span>You have reached the maximum quota of 5 registered co-pilgrims.</span>
                </div>
              )}
            </>
          );
        })()
      ) : (
        // Add / Edit form screen
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 className="font-spiritual" style={{
            fontSize: '14px',
            color: 'var(--secondary)',
            marginBottom: '4px',
            textAlign: 'left'
          }}>
            {editingId ? 'Edit Family Member' : 'Register Co-Pilgrim'}
          </h3>

          <Input
            label="Full Name"
            placeholder="As in physical ID proof"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Age (Years)"
                placeholder="E.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
                type="number"
                error={errors.age}
              />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'left' }}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                style={{
                  padding: '10px 14px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'var(--bg-app)',
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
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'left' }}>ID Proof Type</label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value as any)}
                style={{
                  padding: '10px 14px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'var(--bg-app)',
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
                label="ID Number"
                placeholder="Enter ID details"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                error={errors.idNumber}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsEditing(false);
                resetForm();
              }}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={loading}
              style={{ flex: 1.5 }}
            >
              Save Details
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
