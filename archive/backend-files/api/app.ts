/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import testRoutes from './routes/test.js'
import userRoutes from './routes/users.js'
import orderRoutes from './routes/orders.js'
import wishlistRoutes from './routes/wishlist.js'
import addressRoutes from './routes/addresses.js'
import paymentRoutes from './routes/payments.js'
import loyaltyRoutes from './routes/loyalty.js'
import adminAuthRoutes from './routes/adminAuth.js'
import adminAnalyticsRoutes from './routes/adminAnalytics.js'
import adminOrderRoutes from './routes/adminOrders.js'
import adminProductRoutes from './routes/adminProducts.js'
import pageContentRoutes from './routes/pageContent.js'
import funnelAnalyticsRoutes from './routes/funnelAnalytics.js'
import popupSalesRoutes from './routes/popupSales.js'

// Customer-facing routes
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Logging
app.use(morgan('combined'))

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://reweave.shop',
  'https://www.reweave.shop'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/loyalty', loyaltyRoutes)

// Admin routes
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin/analytics', adminAnalyticsRoutes)
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/admin/products', adminProductRoutes)
app.use('/api/admin', pageContentRoutes)

// Funnel analytics routes
app.use('/api/analytics/funnel', funnelAnalyticsRoutes)

// Popup sales routes
app.use('/api/popup', popupSalesRoutes)

// Customer-facing routes
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
