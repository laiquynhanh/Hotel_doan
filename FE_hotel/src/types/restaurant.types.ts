export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SEATED = 'SEATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface RestaurantTable {
  id: number;
  tableNumber: string;
  capacity: number;
  location: string;
  status: TableStatus;
}

export interface TableReservationCreate {
  bookingId?: number;
  tableId: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  reservationDate: string; // yyyy-mm-dd
  reservationTime: string; // HH:mm:ss
  partySize: number;
  specialRequests?: string;
}

export interface TableReservation {
  id: number;
  tableId: number;
  tableNumber?: string;
  bookingId?: number;
  userId?: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  reservationDate: string; // yyyy-mm-dd
  reservationTime: string; // HH:mm:ss
  partySize: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string; // ISO datetime string
}
