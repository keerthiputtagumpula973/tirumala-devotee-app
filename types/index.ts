export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idProofType: 'Aadhaar' | 'Passport' | 'VoterID' | 'PAN';
  idNumber: string;
  authToken?: string;
  refreshToken?: string;
  tokenCreatedAt?: number; // timestamp in ms
}

export interface CoPilgrim {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idProofType: 'Aadhaar' | 'Passport' | 'VoterID' | 'PAN';
  idNumber: string;
}

export type SlotStatus = 'Available' | 'Full' | 'NotReleased' | 'Past';

export interface DarshanSlot {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 - 11:00"
  quotaTotal: number;
  quotaBooked: number;
  status: SlotStatus;
}

export type BookingType = 'Darshan' | 'Accommodation' | 'Donation';
export type PaymentStatus = 'Pending' | 'Processing' | 'Success' | 'Failure' | 'Timeout';

export interface Booking {
  id: string;
  userId: string;
  type: BookingType;
  bookingDate: string; // date of booking creation
  details: {
    // For Darshan
    date?: string;
    timeSlot?: string;
    pilgrimsCount?: number;
    pilgrimNames?: string[];
    
    // For Accommodation
    location?: 'Tirumala' | 'Tirupati';
    roomType?: 'Single' | 'Double' | 'AC' | 'Non-AC';
    checkInDate?: string;
    checkInSlot?: string;
    checkOutDate?: string;

    // For Donation
    trustName?: string;
    amount?: number;
    receiptNumber?: string;
    taxExempted?: boolean;
    cost?: number;
    panCard?: string;
  };
  paymentStatus: PaymentStatus;
  paymentMode?: 'UPI' | 'Card' | 'NetBanking';
  qrCodeData?: string; // encrypted or serialized validation string
}
