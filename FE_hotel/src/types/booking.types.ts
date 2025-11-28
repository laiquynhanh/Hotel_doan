export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingDetail {
  bookingId: number;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  imageUrl: string;
  description: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
}

export interface BookingCreateRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}
