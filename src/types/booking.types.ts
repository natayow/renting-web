export enum BookingStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export type PaymentMethod = 'BANK_TRANSFER' | 'PAYMENT_GATEWAY';

export interface BookingPriceBreakdown {
  nightlySubtotalIdr: number;
  cleaningFeeIdr: number;
  serviceFeeIdr: number;
  discountIdr: number;
  totalPriceIdr: number;
  nightlyRates: Array<{
    date: string;
    pricePerNightIdr: number;
  }>;
}

export interface AvailableRoom {
  id: string;
  name: string;
  description: string | null;
  maxGuests: number;
  beds: number;
  bathrooms: number;
  basePricePerNightIdr: number;
  isAvailable: boolean;
  facilities: Array<{
    id: string;
    name: string;
    icon: string | null;
  }>;
}

export interface BookingFormData {
  propertyId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  paymentMethod: PaymentMethod;
}

export interface BookingResponse {
  id: string;
  userId: string;
  propertyId: string;
  roomId: string | null;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  status: BookingStatus;
  nightlySubtotalIdr: number;
  cleaningFeeIdr: number;
  serviceFeeIdr: number;
  discountIdr: number;
  totalPriceIdr: number;
  createdAt: string;
  paymentDueAt: string | null;
  property: {
    id: string;
    title: string;
    location: {
      city: string;
      country: string;
      address: string;
    };
  };
  room: {
    id: string;
    name: string;
    maxGuests: number;
    beds: number;
    bathrooms: number;
  } | null;
  payments: Array<{
    id: string;
    amountIdr: number;
    paymentStatus: PaymentStatus;
    paymentMethod: string | null;
    paidAt: string | null;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
