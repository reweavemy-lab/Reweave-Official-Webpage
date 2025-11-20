import { Router } from 'express'
import { body, query } from 'express-validator'
import { authenticateAdmin, requireFounder, requireAdmin } from '../middleware/adminAuth'
import {
  adminLogin,
  createAdmin,
  getAdminProfile,
  adminLogout
} from '../controllers/adminAuthController'

const router = Router()

// Validation middleware
const adminLoginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

const createAdminValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('lastName').isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('role').isIn(['founder', 'admin', 'manager']).withMessage('Role must be founder, admin, or manager'),
  body('permissions').isArray().withMessage('Permissions must be an array')
]

// Public routes
router.post('/login', adminLoginValidation, adminLogin)

// Protected routes
router.use(authenticateAdmin)

router.get('/profile', getAdminProfile)
router.post('/logout', adminLogout)
router.post('/create', requireFounder, createAdminValidation, createAdmin)

export default router