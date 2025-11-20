import { Router } from 'express'
import { body } from 'express-validator'
import { authenticateAdmin, requireAdmin } from '../middleware/adminAuth'
import {
  getPageContent,
  updatePageContent,
  getLatestBackup,
  listBackups
} from '../controllers/pageController'

const router = Router()

// Validation middleware
const updatePageContentValidation = [
  body('content').isString().isLength({ min: 1 }).withMessage('Content is required'),
  body('createBackup').optional().isBoolean().withMessage('Create backup must be a boolean')
]

// All page content routes require admin authentication
router.use(authenticateAdmin)
router.use(requireAdmin)

// Page content routes
router.get('/page-content', getPageContent)
router.post('/page-content', updatePageContentValidation, updatePageContent)
router.get('/page-content/backup', getLatestBackup)
router.get('/page-content/backups', listBackups)

export default router