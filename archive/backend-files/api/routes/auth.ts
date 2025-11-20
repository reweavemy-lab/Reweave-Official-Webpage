import { Router } from 'express'
import { body } from 'express-validator'
import {
  register,
  login,
  socialAuth,
  forgotPassword,
  resetPassword,
  verifyOTP,
  logout,
  refreshToken
} from '../controllers/authController'

const router = Router()

// Validation middleware
const registerValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
]

const loginValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('password').optional().isLength({ min: 1 }),
  body('otp').optional().isLength({ min: 6, max: 6 }).isNumeric()
]

const socialAuthValidation = [
  body('provider').isIn(['google', 'apple']).withMessage('Provider must be google or apple'),
  body('accessToken').isLength({ min: 1 }).withMessage('Access token is required')
]

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail()
]

const resetPasswordValidation = [
  body('token').isLength({ min: 1 }).withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
]

const verifyOTPValidation = [
  body('phone').isMobilePhone('any'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
]

// Routes
router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.post('/social/:provider', socialAuthValidation, socialAuth)
router.post('/forgot-password', forgotPasswordValidation, forgotPassword)
router.post('/reset-password', resetPasswordValidation, resetPassword)
router.post('/verify-otp', verifyOTPValidation, verifyOTP)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)

export default router