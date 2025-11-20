import { api } from './api'

export interface UserProfile {
  id: string
  email?: string
  phone?: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  emailVerified: boolean
  phoneVerified: boolean
  avatarUrl?: string
  loyaltyPoints: number
  loyaltyTier: string
  newsletterOptIn: boolean
  smsOptIn: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  newsletter?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface Session {
  id: string
  user_agent: string
  ip_address: string
  created_at: string
  expires_at: string
}

export const userService = {
  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const response = await api.get<{ success: boolean; data: UserProfile }>('/users/profile')
    return response
  },

  async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; data: UserProfile }> {
    const response = await api.put<{ success: boolean; data: UserProfile }>('/users/profile', data)
    return response
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>('/users/password', data)
    return response
  },

  async getSessions(): Promise<{ success: boolean; data: Session[] }> {
    const response = await api.get<{ success: boolean; data: Session[] }>('/users/sessions')
    return response
  },

  async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/sessions/${sessionId}`)
    return response
  }
}