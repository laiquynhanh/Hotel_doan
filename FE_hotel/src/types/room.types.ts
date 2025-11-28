export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  FAMILY = 'FAMILY',
  PREMIUM = 'PREMIUM'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING'
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  status: RoomStatus;
  capacity: number;
  size: number;
  description: string;
  imageUrl: string;
  amenities: string;
  // Availability info returned by backend when searching
  available?: boolean;
  availableFrom?: string; // ISO date string yyyy-mm-dd
  daysUntilAvailable?: number;
  // Thông tin category (tùy chọn) - được thêm khi backend cung cấp category entity
  category?: {
    id: number;
    name: string;
    slug?: string;
    imageUrl?: string;
  };
}

export interface RoomSearchParams {
  checkInDate?: string;
  checkOutDate?: string;
  roomType?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
}
