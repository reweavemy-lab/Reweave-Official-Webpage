import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/auth'

export interface AdminRequest extends Request {
  admin?: {
    id: string
    email: string
    role: 'founder' | 'admin' | 'manager'
    permissions: string[]
  }
}

// Admin authentication middleware
export const authenticateAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Admin access token required'
      })
      return
    }

    // Verify token
    const payload = verifyToken(token)

    // Check if user has admin privileges
    if (!payload.role || !['founder', 'admin', 'manager'].includes(payload.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient privileges'
      })
      return
    }

    // Attach admin to request
    req.admin = {
      id: payload.userId,
      email: payload.email,
      role: payload.role as 'founder' | 'admin' | 'manager',
      permissions: payload.permissions || []
    }

    next()
  } catch (error) {
    console.error('Admin authentication error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token'
    })
  }
}

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      })
      return
    }

    if (!roles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient role privileges'
      })
      return
    }

    next()
  }
}

// Permission-based authorization middleware
export const requirePermission = (permissions: string[]) => {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      })
      return
    }

    const hasPermission = permissions.every(permission => 
      req.admin!.permissions.includes(permission)
    )

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
      return
    }

    next()
  }
}

export const requireFounder = requireRole(['founder'])
export const requireAdmin = requireRole(['founder', 'admin'])
export const requireManager = requireRole(['founder', 'admin', 'manager'])