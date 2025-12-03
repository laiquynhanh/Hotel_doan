export enum FoodCategory {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  DRINKS = 'DRINKS',
  DESSERT = 'DESSERT'
}

export enum FoodOrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface FoodItem {
  id: number;
  name: string;
  category: FoodCategory;
  price: number;
  description: string;
  imageUrl: string;
  available: boolean;
  stockQuantity: number;
}

export interface FoodOrderItem {
  id?: number; // Optional id for existing order items
  foodItemId: number;
  foodItemName?: string;
  quantity: number;
  price: number;
}

export interface FoodOrderCreate {
  bookingId?: number;
  roomNumber?: string;
  items: FoodOrderItem[];
  specialInstructions?: string;
}

export interface FoodOrder {
  id: number;
  userId: number;
  userName: string;
  bookingId?: number;
  roomNumber?: string;
  orderTime: string; // ISO datetime string
  deliveryTime?: string; // ISO datetime string
  status: FoodOrderStatus;
  totalPrice: number;
  specialInstructions?: string;
  createdAt: string; // ISO datetime string
  deliveredAt?: string; // ISO datetime string
  items: FoodOrderItem[];
}

// Cart item for frontend state management
export interface CartItem extends FoodItem {
  quantity: number;
}
