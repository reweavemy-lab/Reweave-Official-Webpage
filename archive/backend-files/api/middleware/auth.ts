import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { verifyToken } from '../lib/auth'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
    phone?: string
    firstName: string
    lastName: string
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      })
      return
    }

    // Verify token
    const payload = verifyToken(token)

    // Check if session exists and is not expired
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single()

    if (!session || new Date(session.expires_at) < new Date()) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      })
      return
    }

    // Attach user to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      phone: payload.phone,
      firstName: payload.firstName,
      lastName: payload.lastName
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      try {
        const payload = verifyToken(token)
        
        const { data: session } = await supabaseAdmin
          .from('sessions')
          .select('*')
          .eq('token', token)
          .single()

        if (session && new Date(session.expires_at) >= new Date()) {
          req.user = {
            id: payload.userId,
            email: payload.email,
            phone: payload.phone,
            firstName: payload.firstName,
            lastName: payload.lastName
          }
        }
      } catch (error) {
        // Token invalid, continue as guest
      }
    }

    next()
  } catch (error) {
    next()
  }
}

export const requireAuth = authenticateToken