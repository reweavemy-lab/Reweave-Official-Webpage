import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import cors from 'cors'
import { body, validationResult } from 'express-validator'

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://www.paypal.com",
        "https://www.google-analytics.com",
        "https://connect.facebook.net"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://res.cloudinary.com",
        "https://images.unsplash.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://api.paypal.com",
        "https://www.google-analytics.com",
        "https://api.reweave.my"
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://hooks.stripe.com",
        "https://www.paypal.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
})

// CORS configuration
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://reweave.shop',
      'https://www.reweave.shop',
      'https://admin.reweave.shop',
      'https://api.reweave.shop',
      'http://localhost:5173',
      'http://localhost:3001'
    ]
    
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
})

// Rate limiting configurations
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.round(windowMs / 1000)
      })
    }
  })
}

// Specific rate limiters
export const generalRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
)

export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window for auth endpoints
  'Too many authentication attempts, please try again later.'
)

export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per window for API
  'Too many API requests, please try again later.'
)

// Input validation middleware
export const validateInput = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)))
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      })
    }
    
    next()
  }
}

// Common validation rules
export const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .isLength({ max: 255 })
  .withMessage('Please provide a valid email address')

export const passwordValidation = body('password')
  .isLength({ min: 8, max: 128 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

export const phoneValidation = body('phone')
  .optional()
  .matches(/^\+?[1-9]\d{1,14}$/)
  .withMessage('Please provide a valid phone number')

// API key validation
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key']
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide a valid API key'
    })
  }
  
  // Validate API key against database or environment
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    })
  }
  
  next()
}

// CSRF protection
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // For now, we'll use a simple CSRF protection that validates the token
  // In production, implement proper CSRF token generation and validation
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf
  
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next()
  }
  
  // Simple validation - in production, implement proper token validation
  if (!csrfToken) {
    return res.status(403).json({ error: 'CSRF token required' })
  }
  
  next()
}

// Security audit logging
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /eval\(/i,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /\.\.\//,
    /etc\/passwd/,
    /windows\/system32/
  ]
  
  const checkForSuspiciousActivity = (data: any): boolean => {
    if (typeof data !== 'string') return false
    return suspiciousPatterns.some(pattern => pattern.test(data))
  }
  
  // Check request data
  const hasSuspiciousActivity = 
    checkForSuspiciousActivity(JSON.stringify(req.body)) ||
    checkForSuspiciousActivity(req.url) ||
    checkForSuspiciousActivity(req.headers['user-agent'] || '')
  
  if (hasSuspiciousActivity) {
    console.warn('Suspicious activity detected:', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    })
    
    // Optionally block the request or rate limit
    // return res.status(403).json({
    //   error: 'Security violation',
    //   message: 'Your request has been blocked for security reasons'
    // })
  }
  
  next()
}

// IP whitelist/blacklist
export const ipFilter = (whitelist: string[] = [], blacklist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress
    
    if (blacklist.length > 0 && blacklist.includes(clientIP || '')) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address has been blocked'
      })
    }
    
    if (whitelist.length > 0 && !whitelist.includes(clientIP || '')) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized'
      })
    }
    
    next()
  }
}

// Request size limiter
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const maxSizeInBytes = parseInt(maxSize) * 1024 * 1024
    
    let bodySize = 0
    req.on('data', (chunk) => {
      bodySize += chunk.length
      if (bodySize > maxSizeInBytes) {
        req.destroy()
        res.status(413).json({
          error: 'Request entity too large',
          message: `Request body cannot exceed ${maxSize}`
        })
      }
    })
    
    next()
  }
}

// Security headers for API responses
export const apiSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Powered-By', 'Reweave API')
  res.removeHeader('Server')
  
  next()
}

// Error handling wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Security middleware stack
export const applySecurityMiddleware = (app: any) => {
  // Apply security headers
  app.use(securityHeaders)
  app.use(apiSecurityHeaders)
  
  // Apply CORS
  app.use(corsConfig)
  
  // Apply rate limiting
  app.use('/api/', apiRateLimiter)
  app.use('/api/auth/', authRateLimiter)
  
  // Apply input sanitization
  app.use(mongoSanitize())
  app.use(xss())
  app.use(hpp())
  
  // Apply security logging
  app.use(securityLogger)
  
  // Apply request size limiting
  app.use(requestSizeLimiter())
  
  return app
}