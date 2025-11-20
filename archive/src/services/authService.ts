import { api } from './api'
import { User } from '@/stores/authStore'

export interface LoginRequest {
  email?: string
  phone?: string
  password?: string
  otp?: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email?: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  newsletter?: boolean
}

export interface SocialAuthRequest {
  provider: 'google' | 'apple'
  accessToken: string
}

export interface AuthResponse {
  success: boolean
  data: {
    userId: string
    email?: string
    phone?: string
    firstName: string
    lastName: string
    emailVerified: boolean
    phoneVerified: boolean
    loyaltyPoints: number
    loyaltyTier: string
    token: string
    refreshToken: string
  }
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response
  },

  async socialAuth(provider: 'google' | 'apple', accessToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/auth/social/${provider}`, {
      accessToken
    })
    return response
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', {
      email
    })
    return response
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      newPassword
    })
    return response
  },

  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/verify-otp', {
      phone,
      otp
    })
    return response
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/logout')
    return response
  },

  async refreshToken(refreshToken: string): Promise<{ success: boolean; data: { token: string; refreshToken: string } }> {
    const response = await api.post<{ success: boolean; data: { token: string; refreshToken: string } }>('/auth/refresh-token', {
      refreshToken
    })
    return response
  }
}