import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth'
import {
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
  deleteSession
} from '../controllers/userController'

const router = Router()

// Validation middleware
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('newsletter').optional().isBoolean()
]

const changePasswordValidation = [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
]

// Routes (all require authentication)
router.get('/profile', requireAuth, getProfile)
router.put('/profile', requireAuth, updateProfileValidation, updateProfile)
router.put('/password', requireAuth, changePasswordValidation, changePassword)
router.get('/sessions', requireAuth, getSessions)
router.delete('/sessions/:sessionId', requireAuth, deleteSession)

export default router