import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AuthenticatedRequest } from '../middleware/auth'
import { hashPassword, comparePassword } from '../lib/auth'

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

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, phone, first_name, last_name, date_of_birth, gender, email_verified, phone_verified, avatar_url, loyalty_points, loyalty_tier, newsletter_opt_in, sms_opt_in, created_at, updated_at')
      .eq('id', req.user!.id)
      .single()

    if (error) {
      throw error
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        avatarUrl: user.avatar_url,
        loyaltyPoints: user.loyalty_points,
        loyaltyTier: user.loyalty_tier,
        newsletterOptIn: user.newsletter_opt_in,
        smsOptIn: user.sms_opt_in,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    })
  }
}

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
      return
    }

    const { firstName, lastName, dateOfBirth, gender, newsletter }: UpdateProfileRequest = req.body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (firstName !== undefined) updateData.first_name = firstName
    if (lastName !== undefined) updateData.last_name = lastName
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth
    if (gender !== undefined) updateData.gender = gender
    if (newsletter !== undefined) updateData.newsletter_opt_in = newsletter

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user!.id)
      .select('id, email, phone, first_name, last_name, date_of_birth, gender, email_verified, phone_verified, avatar_url, loyalty_points, loyalty_tier, newsletter_opt_in, sms_opt_in, created_at, updated_at')
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        avatarUrl: user.avatar_url,
        loyaltyPoints: user.loyalty_points,
        loyaltyTier: user.loyalty_tier,
        newsletterOptIn: user.newsletter_opt_in,
        smsOptIn: user.sms_opt_in,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    })
  }
}

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
      return
    }

    const { currentPassword, newPassword }: ChangePasswordRequest = req.body

    // Get current user with password hash
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user!.id)
      .single()

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password_hash)
    if (!isValidPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
      return
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user!.id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    })
  }
}

// Get user sessions
export const getSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, user_agent, ip_address, created_at, expires_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions'
    })
  }
}

// Delete session
export const deleteSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', req.user!.id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    })
  } catch (error) {
    console.error('Delete session error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    })
  }
}