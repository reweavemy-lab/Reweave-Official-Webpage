import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth'
import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addressController'

const router = Router()

// Validation middleware
const createAddressValidation = [
  body('label').isLength({ min: 1, max: 50 }).withMessage('Label is required and must be less than 50 characters'),
  body('recipientName').isLength({ min: 1, max: 100 }).withMessage('Recipient name is required and must be less than 100 characters'),
  body('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('addressLine1').isLength({ min: 1, max: 255 }).withMessage('Address line 1 is required and must be less than 255 characters'),
  body('addressLine2').optional().isLength({ max: 255 }),
  body('city').isLength({ min: 1, max: 100 }).withMessage('City is required and must be less than 100 characters'),
  body('state').isLength({ min: 1, max: 100 }).withMessage('State is required and must be less than 100 characters'),
  body('postalCode').isLength({ min: 1, max: 20 }).withMessage('Postal code is required and must be less than 20 characters'),
  body('country').optional().isLength({ min: 2, max: 2 }).withMessage('Country must be 2 character code'),
  body('isDefault').optional().isBoolean()
]

const updateAddressValidation = [
  body('label').optional().isLength({ min: 1, max: 50 }),
  body('recipientName').optional().isLength({ min: 1, max: 100 }),
  body('phone').optional().isMobilePhone('any'),
  body('addressLine1').optional().isLength({ min: 1, max: 255 }),
  body('addressLine2').optional().isLength({ max: 255 }),
  body('city').optional().isLength({ min: 1, max: 100 }),
  body('state').optional().isLength({ min: 1, max: 100 }),
  body('postalCode').optional().isLength({ min: 1, max: 20 }),
  body('country').optional().isLength({ min: 2, max: 2 }),
  body('isDefault').optional().isBoolean()
]

// Routes
router.get('/', requireAuth, getAddresses)
router.get('/:addressId', requireAuth, getAddress)
router.post('/', requireAuth, createAddressValidation, createAddress)
router.put('/:addressId', requireAuth, updateAddressValidation, updateAddress)
router.delete('/:addressId', requireAuth, deleteAddress)

export default router