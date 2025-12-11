// ========================================
// DỊCH VỤ XÁC THỰC (Authentication Service)
// ========================================
// Xử lý các chức năng liên quan đến đăng nhập, đăng ký,
// quên mật khẩu, reset mật khẩu, quản lý token JWT

import api from '../utils/api';
import type { LoginResponse, RegisterResponse } from '../types/auth.types';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export interface UpdateProfileData {
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      console.log('Sending login request:', data);
      const response = await api.post('/auth/login', data);
      console.log('Login response:', response.data);
      const loginResponse: LoginResponse = response.data;
      
      // Lưu token và user info vào localStorage
      localStorage.setItem('token', loginResponse.token);
      localStorage.setItem('user', JSON.stringify({
        id: loginResponse.userId,
        username: loginResponse.username,
        email: loginResponse.email,
        fullName: loginResponse.fullName,
        role: loginResponse.role
      }));
      
      return loginResponse;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Synchronous getter for AuthContext and UI guards
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // API-based profile fetcher for profile screen (fresh data)
  getCurrentUserApi: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post('/users/change-password', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  isAdmin: (): boolean => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.role === 'ADMIN';
  },

  isStaff: (): boolean => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.role === 'STAFF';
  },

  isAdminOrStaff: (): boolean => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.role === 'ADMIN' || user?.role === 'STAFF';
  },
};

export default authService;