import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, CoPilgrim, Booking, DarshanSlot } from '../types';

interface AppContextType {
  user: UserProfile | null;
  coPilgrims: CoPilgrim[];
  bookings: Booking[];
  slots: DarshanSlot[];
  login: (mobile: string, otp: string, isAlreadyVerified?: boolean) => Promise<boolean>;
  register: (profile: Omit<UserProfile, 'id'>) => Promise<boolean>;
  logout: () => void;
  addCoPilgrim: (pilgrim: Omit<CoPilgrim, 'id' | 'userId'>) => Promise<boolean>;
  deleteCoPilgrim: (id: string) => Promise<boolean>;
  updateCoPilgrim: (id: string, pilgrim: Partial<CoPilgrim>) => Promise<boolean>;
  addBooking: (booking: Booking) => void;
  updateBookingPayment: (bookingId: string, status: Booking['paymentStatus'], mode?: Booking['paymentMode']) => void;
  initializeSlots: () => void;
  updateSlotQuota: (slotId: string, count: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate dummy slot data for booking simulation
const generateMockSlots = (): DarshanSlot[] => {
  const slots: DarshanSlot[] = [];
  const timeSlots = [
    '08:00 - 09:00',
    '10:00 - 11:00',
    '13:00 - 14:00',
    '15:00 - 16:00',
    '18:00 - 19:00'
  ];
  
  const today = new Date();
  
  // Generate slots for 15 days ahead
  for (let i = 0; i < 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    timeSlots.forEach((ts, index) => {
      let status: DarshanSlot['status'] = 'Available';
      let quotaTotal = 50;
      let quotaBooked = 0;
      
      // Slot state distribution rules:
      if (i === 0) {
        status = 'Past'; // Today's slots or blocked
      } else if (i === 1 && index < 2) {
        status = 'Full';
        quotaBooked = 50;
      } else if (i === 3) {
        status = 'NotReleased';
      } else {
        // Normal available slots
        quotaBooked = Math.floor(Math.random() * 40);
        status = quotaBooked >= quotaTotal ? 'Full' : 'Available';
      }
      
      slots.push({
        id: `slot-${dateStr}-${index}`,
        date: dateStr,
        timeSlot: ts,
        quotaTotal,
        quotaBooked,
        status
      });
    });
  }
  return slots;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ttd-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [coPilgrims, setCoPilgrims] = useState<CoPilgrim[]>(() => {
    const saved = localStorage.getItem('ttd-copilgrims');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('ttd-bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [slots, setSlots] = useState<DarshanSlot[]>([]);

  useEffect(() => {
    initializeSlots();
    
    // Clean up old auto-generated devotee profiles to force fresh registration
    const savedUserStr = localStorage.getItem('ttd-user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.name && /^Devotee-\d+$/.test(savedUser.name)) {
          localStorage.removeItem('ttd-user');
          setUser(null);
        }
      } catch (e) {}
    }

    // Pre-populate your mobile number in the persistent devotee database
    const defaultDevotee: UserProfile = {
      id: 'devotee-default-1',
      name: 'Srinivasa Rao',
      mobile: '7680020615',
      age: 35,
      gender: 'Male',
      idProofType: 'Aadhaar',
      idNumber: '123456789012',
      authToken: 'mock-jwt-header-token.xxxxx',
      refreshToken: 'mock-refresh-token.yyyyy',
      tokenCreatedAt: Date.now()
    };

    const registryStr = localStorage.getItem('ttd-devotee-registry');
    try {
      const registry = registryStr ? JSON.parse(registryStr) as UserProfile[] : [];
      if (!registry.some(r => r.mobile === '7680020615')) {
        registry.push(defaultDevotee);
        localStorage.setItem('ttd-devotee-registry', JSON.stringify(registry));
      }
    } catch (e) {
      localStorage.setItem('ttd-devotee-registry', JSON.stringify([defaultDevotee]));
    }
  }, []);

  // Simulate secure JWT session validation and silent token refresh rotation
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const saved = localStorage.getItem('ttd-user');
      if (!saved) return;
      
      try {
        const parsedUser = JSON.parse(saved) as UserProfile;
        if (!parsedUser.tokenCreatedAt) return;

        const sessionAge = Date.now() - parsedUser.tokenCreatedAt;
        
        // Token expires in 5 minutes (300,000 ms) for simulation purposes
        // Silent token refresh is triggered after 3 minutes (180,000 ms)
        if (sessionAge >= 300000) {
          console.warn('JWT session expired.');
          alert('Security Session Timeout: Your login token has expired. Please log in again.');
          logout();
        } else if (sessionAge >= 180000 && parsedUser.authToken?.startsWith('mock-jwt-header-token')) {
          console.log('JWT access token expiring soon. Initiating silent token rotation...');
          const rotatedUser: UserProfile = {
            ...parsedUser,
            authToken: `mock-jwt-header-token.rotated-${Math.random().toString(36).substr(2, 5)}`,
            tokenCreatedAt: Date.now() // Extend expiration lease
          };
          setUser(rotatedUser);
          localStorage.setItem('ttd-user', JSON.stringify(rotatedUser));
        }
      } catch (err) {
        console.error('Error during token validation check:', err);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [user]);

  const initializeSlots = () => {
    const cachedSlots = localStorage.getItem('ttd-slots');
    if (cachedSlots) {
      setSlots(JSON.parse(cachedSlots));
    } else {
      const newSlots = generateMockSlots();
      setSlots(newSlots);
      localStorage.setItem('ttd-slots', JSON.stringify(newSlots));
    }
  };

  const register = async (profile: Omit<UserProfile, 'id'>): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const newUser: UserProfile = {
      ...profile,
      id: `devotee-${Math.random().toString(36).substr(2, 9)}`,
      authToken: 'mock-jwt-header-token.xxxxx',
      refreshToken: 'mock-refresh-token.yyyyy',
      tokenCreatedAt: Date.now(),
    };
    
    // Save to active session
    setUser(newUser);
    localStorage.setItem('ttd-user', JSON.stringify(newUser));

    // Save to persistent devotee registry (mock database)
    const registryStr = localStorage.getItem('ttd-devotee-registry') || '[]';
    try {
      const registry = JSON.parse(registryStr) as UserProfile[];
      const filtered = registry.filter(r => r.mobile !== profile.mobile);
      filtered.push(newUser);
      localStorage.setItem('ttd-devotee-registry', JSON.stringify(filtered));
    } catch (e) {
      localStorage.setItem('ttd-devotee-registry', JSON.stringify([newUser]));
    }

    return true;
  };

  const login = async (mobile: string, otp: string, isAlreadyVerified?: boolean): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    console.log(`[AUTH] Login attempt for mobile: ${mobile}`);

    if (isAlreadyVerified || otp.length === 6) {
      const registryStr = localStorage.getItem('ttd-devotee-registry') || '[]';
      try {
        const registry = JSON.parse(registryStr) as UserProfile[];
        console.log('[AUTH] Current Devotee Registry:', registry);
        
        const matchedUser = registry.find(r => r.mobile === mobile);
        console.log('[AUTH] Matched user found:', matchedUser);
        
        if (matchedUser) {
          const targetUser: UserProfile = {
            ...matchedUser,
            authToken: 'mock-jwt-header-token.xxxxx',
            refreshToken: 'mock-refresh-token.yyyyy',
            tokenCreatedAt: Date.now(),
          };
          setUser(targetUser);
          localStorage.setItem('ttd-user', JSON.stringify(targetUser));
          console.log('[AUTH] Login successful for:', targetUser.name);
          return true;
        } else {
          console.warn(`[AUTH] No devotee profile matched mobile: ${mobile}`);
        }
      } catch (e) {
        console.error('[AUTH] Failed to parse devotee registry', e);
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ttd-user');
  };

  const addCoPilgrim = async (pilgrim: Omit<CoPilgrim, 'id' | 'userId'>): Promise<boolean> => {
    if (!user) return false;
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    if (coPilgrims.length >= 5) {
      return false; // Limit to max 5 family members
    }

    const newPilgrim: CoPilgrim = {
      ...pilgrim,
      id: `copilgrim-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id
    };

    const updated = [...coPilgrims, newPilgrim];
    setCoPilgrims(updated);
    localStorage.setItem('ttd-copilgrims', JSON.stringify(updated));
    return true;
  };

  const deleteCoPilgrim = async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const updated = coPilgrims.filter(p => p.id !== id);
    setCoPilgrims(updated);
    localStorage.setItem('ttd-copilgrims', JSON.stringify(updated));
    return true;
  };

  const updateCoPilgrim = async (id: string, pilgrim: Partial<CoPilgrim>): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const updated = coPilgrims.map(p => p.id === id ? { ...p, ...pilgrim } : p);
    setCoPilgrims(updated);
    localStorage.setItem('ttd-copilgrims', JSON.stringify(updated));
    return true;
  };

  const addBooking = (booking: Booking) => {
    const updated = [booking, ...bookings];
    setBookings(updated);
    localStorage.setItem('ttd-bookings', JSON.stringify(updated));
  };

  const updateBookingPayment = (bookingId: string, status: Booking['paymentStatus'], mode?: Booking['paymentMode']) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, paymentStatus: status, paymentMode: mode } : b);
    setBookings(updated);
    localStorage.setItem('ttd-bookings', JSON.stringify(updated));
  };

  const updateSlotQuota = (slotId: string, count: number): boolean => {
    let success = false;
    const updated = slots.map(s => {
      if (s.id === slotId) {
        const nextBooked = s.quotaBooked + count;
        if (nextBooked <= s.quotaTotal) {
          success = true;
          return {
            ...s,
            quotaBooked: nextBooked,
            status: nextBooked >= s.quotaTotal ? 'Full' as const : 'Available' as const
          };
        }
      }
      return s;
    });

    if (success) {
      setSlots(updated);
      localStorage.setItem('ttd-slots', JSON.stringify(updated));
    }
    return success;
  };

  return (
    <AppContext.Provider value={{
      user,
      coPilgrims,
      bookings,
      slots,
      login,
      register,
      logout,
      addCoPilgrim,
      deleteCoPilgrim,
      updateCoPilgrim,
      addBooking,
      updateBookingPayment,
      initializeSlots,
      updateSlotQuota
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
