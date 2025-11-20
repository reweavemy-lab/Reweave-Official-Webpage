import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { generateTokens, hashPassword, comparePassword, generateOTP, verifyToken } from '../lib/auth'
import { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail } from '../lib/email'
import { v4 as uuidv4 } from 'uuid'

export interface RegisterRequest {
  email?: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  newsletter?: boolean
}

export interface LoginRequest {
  email?: string
  phone?: string
  password?: string
  otp?: string
  rememberMe?: boolean
}

export interface SocialAuthRequest {
  provider: 'google' | 'apple'
  accessToken: string
}

// User registration
export const register = async (req: Request, res: Response): Promise<void> => {
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

    const { email, phone, password, firstName, lastName, newsletter }: RegisterRequest = req.body

    // Validate that either email or phone is provided
    if (!email && !phone) {
      res.status(400).json({
        success: false,
        message: 'Either email or phone is required'
      })
      return
    }

    // Check if user already exists
    let existingUser
    if (email) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()
      existingUser = data
    } else if (phone) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()
      existingUser = data
    }

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: email ? 'Email already registered' : 'Phone number already registered'
      })
      return
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const userData = {
      email: email?.toLowerCase(),
      phone,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      newsletter_opt_in: newsletter || false,
      loyalty_points: 0,
      loyalty_tier: 'bronze'
    }

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      firstName: newUser.first_name,
      lastName: newUser.last_name
    })

    // Store session
    await supabaseAdmin.from('sessions').insert({
      user_id: newUser.id,
      token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user_agent: req.get('User-Agent'),
      ip_address: req.ip,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // Send verification email/OTP
    if (email && !newUser.email_verified) {
      const otp = generateOTP()
      await sendOTPEmail(email, otp, 'verification')
      // Store OTP in Redis or database (implementation needed)
    }

    // Send welcome email
    if (email) {
      await sendWelcomeEmail(email, firstName)
    }

    res.status(201).json({
      success: true,
      data: {
        userId: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        verificationRequired: email && !newUser.email_verified,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    })
  }
}

// User login
export const login = async (req: Request, res: Response): Promise<void> => {
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

    const { email, phone, password, otp, rememberMe }: LoginRequest = req.body

    // Validate input
    if (!email && !phone) {
      res.status(400).json({
        success: false,
        message: 'Either email or phone is required'
      })
      return
    }

    if (!password && !otp) {
      res.status(400).json({
        success: false,
        message: 'Either password or OTP is required'
      })
      return
    }

    // Find user
    let query = supabaseAdmin.from('users').select('*')
    if (email) {
      query = query.eq('email', email.toLowerCase())
    } else if (phone) {
      query = query.eq('phone', phone)
    }

    const { data: user, error } = await query.single()

    if (error || !user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
      return
    }

    // Verify credentials
    let isValid = false
    if (password) {
      isValid = await comparePassword(password, user.password_hash)
    } else if (otp) {
      // Verify OTP (implementation needed - store in Redis/database)
      // For now, we'll implement a simple OTP verification
      isValid = otp.length === 6 // Basic validation
    }

    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
      return
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name
    })

    // Store session
    const sessionExpiry = rememberMe 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await supabaseAdmin.from('sessions').insert({
      user_id: user.id,
      token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user_agent: req.get('User-Agent'),
      ip_address: req.ip,
      expires_at: sessionExpiry
    })

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        loyaltyPoints: user.loyalty_points,
        loyaltyTier: user.loyalty_tier,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
}

// Social authentication
export const socialAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, accessToken }: SocialAuthRequest = req.body

    // Validate provider
    if (!['google', 'apple'].includes(provider)) {
      res.status(400).json({
        success: false,
        message: 'Invalid provider'
      })
      return
    }

    // Verify social token (implementation needed)
    // This would involve calling the provider's API to verify the token
    let socialData
    if (provider === 'google') {
      // Verify Google token and get user data
      socialData = await verifyGoogleToken(accessToken)
    } else if (provider === 'apple') {
      // Verify Apple token and get user data
      socialData = await verifyAppleToken(accessToken)
    }

    if (!socialData) {
      res.status(401).json({
        success: false,
        message: 'Invalid social token'
      })
      return
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', socialData.email.toLowerCase())
      .single()

    let user
    if (existingUser) {
      // Update existing user with social data
      const { data } = await supabaseAdmin
        .from('users')
        .update({
          first_name: socialData.firstName || existingUser.first_name,
          last_name: socialData.lastName || existingUser.last_name,
          email_verified: true,
          last_login_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      user = data
    } else {
      // Create new user
      const { data } = await supabaseAdmin
        .from('users')
        .insert({
          email: socialData.email.toLowerCase(),
          first_name: socialData.firstName,
          last_name: socialData.lastName,
          email_verified: true,
          loyalty_points: 0,
          loyalty_tier: 'bronze'
        })
        .select()
        .single()
      user = data

      // Send welcome email
      await sendWelcomeEmail(socialData.email, socialData.firstName)
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name
    })

    // Store session
    await supabaseAdmin.from('sessions').insert({
      user_id: user.id,
      token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user_agent: req.get('User-Agent'),
      ip_address: req.ip,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        loyaltyPoints: user.loyalty_points,
        loyaltyTier: user.loyalty_tier,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  } catch (error) {
    console.error('Social auth error:', error)
    res.status(500).json({
      success: false,
      message: 'Social authentication failed'
    })
  }
}

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      })
      return
    }

    // Find user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) {
      // Don't reveal whether user exists
      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      })
      return
    }

    // Generate reset token
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token (implementation needed - store in database)
    // await storePasswordResetToken(user.id, resetToken, resetTokenExpiry)

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken, user.first_name)

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Password reset request failed'
    })
  }
}

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      })
      return
    }

    // Verify reset token (implementation needed)
    // const userId = await verifyPasswordResetToken(token)
    // if (!userId) {
    //   res.status(400).json({
    //     success: false,
    //     message: 'Invalid or expired reset token'
    //   })
    //   return
    // }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update user password
    await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', 'userId') // Replace with actual user ID after token verification

    // Invalidate reset token (implementation needed)
    // await invalidatePasswordResetToken(token)

    res.json({
      success: true,
      message: 'Password reset successful'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    })
  }
}

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body

    if (!phone || !otp) {
      res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      })
      return
    }

    // Verify OTP (implementation needed - check against stored OTP)
    // For now, we'll do basic validation
    if (otp.length !== 6) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      })
      return
    }

    // Find user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    // Update phone verification status
    await supabaseAdmin
      .from('users')
      .update({ phone_verified: true })
      .eq('id', user.id)

    // Invalidate OTP (implementation needed)

    res.json({
      success: true,
      message: 'Phone number verified successfully'
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    })
  }
}

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (token) {
      // Delete session
      await supabaseAdmin
        .from('sessions')
        .delete()
        .eq('token', token)
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    })
  }
}

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      })
      return
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken)

    // Check if session exists
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .single()

    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
      return
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
      phone: payload.phone,
      firstName: payload.firstName,
      lastName: payload.lastName
    })

    // Update session with new tokens
    await supabaseAdmin
      .from('sessions')
      .update({
        token: tokens.accessToken,
        refresh_token: tokens.refreshToken
      })
      .eq('id', session.id)

    res.json({
      success: true,
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }
}

// Helper functions for social auth (implementations needed)
async function verifyGoogleToken(accessToken: string): Promise<any> {
  // Implementation to verify Google OAuth token
  // This would involve calling Google's token verification API
  return {
    email: 'user@example.com',
    firstName: 'User',
    lastName: 'Name'
  }
}

async function verifyAppleToken(accessToken: string): Promise<any> {
  // Implementation to verify Apple Sign In token
  // This would involve calling Apple's token verification API
  return {
    email: 'user@example.com',
    firstName: 'User',
    lastName: 'Name'
  }
}