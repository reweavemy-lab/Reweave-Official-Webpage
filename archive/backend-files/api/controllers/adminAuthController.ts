import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { hashPassword, comparePassword, generateTokens } from '../lib/auth'
import { AdminRequest } from '../middleware/adminAuth'

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminCreateRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'founder' | 'admin' | 'manager'
  permissions: string[]
}

// Admin login
export const adminLogin = async (req: AdminRequest, res: Response): Promise<void> => {
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

    const { email, password }: AdminLoginRequest = req.body

    // Find admin user
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
      return
    }

    // Check if admin is active
    if (!admin.is_active) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
      return
    }

    // Verify password
    const isValidPassword = await comparePassword(password, admin.password_hash)
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
      return
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      permissions: admin.permissions
    })

    // Create admin session
    await supabase
      .from('admin_sessions')
      .insert({
        admin_id: admin.id,
        token: tokens.accessToken,
        expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      })

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id)

    res.json({
      success: true,
      data: {
        adminId: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        permissions: admin.permissions,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to login admin'
    })
  }
}

// Create new admin (founder only)
export const createAdmin = async (req: AdminRequest, res: Response): Promise<void> => {
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

    const { email, password, firstName, lastName, role, permissions }: AdminCreateRequest = req.body

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      })
      return
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create admin
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role,
        permissions,
        is_active: true,
        created_by: req.admin!.id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      data: {
        adminId: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        permissions: admin.permissions
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create admin'
    })
  }
}

// Get admin profile
export const getAdminProfile = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, first_name, last_name, role, permissions, is_active, last_login_at, created_at')
      .eq('id', req.admin!.id)
      .single()

    if (error) {
      throw error
    }

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      })
      return
    }

    res.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.is_active,
        lastLoginAt: admin.last_login_at,
        createdAt: admin.created_at
      }
    })
  } catch (error) {
    console.error('Get admin profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get admin profile'
    })
  }
}

// Admin logout
export const adminLogout = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    // Delete admin session
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('admin_id', req.admin!.id)

    res.json({
      success: true,
      message: 'Admin logged out successfully'
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to logout admin'
    })
  }
}