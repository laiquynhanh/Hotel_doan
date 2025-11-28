export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN' | 'STAFF';
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN' | 'STAFF';
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN' | 'STAFF';
}
