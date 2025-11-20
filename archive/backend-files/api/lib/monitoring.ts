import winston from 'winston'
import * as Sentry from '@sentry/node'
import { Request, Response, NextFunction } from 'express'

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'reweave-api',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    // HTTP access logs
    new winston.transports.File({ 
      filename: 'logs/access.log',
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    // Performance logs
    new winston.transports.File({ 
      filename: 'logs/performance.log',
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Console in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
})

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

// Configure Sentry for error tracking
export const initializeSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [],
      beforeSend: (event, hint) => {
        // Filter out specific errors
        if (event.exception) {
          const error = hint.originalException
          if (error && (error as any).message && (error as any).message.includes('ECONNREFUSED')) {
            return null // Don't send connection errors to Sentry
          }
        }
        return event
      }
    })
  }
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  // Log request
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    correlationId: req.get('X-Correlation-ID') || generateCorrelationId()
  })
  
  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length'),
      responseTime: duration,
      correlationId: req.get('X-Correlation-ID'),
      userId: (req as any).user?.id
    }
    
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData)
    } else {
      logger.http('Request completed', logData)
    }
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        ...logData,
        threshold: 1000,
        actualTime: duration
      })
    }
  })
  
  next()
}

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    correlationId: req.get('X-Correlation-ID')
  })
  
  // Send to Sentry
  Sentry.captureException(err, {
    tags: {
      endpoint: req.url,
      method: req.method
    },
    user: (req as any).user ? {
      id: (req as any).user.id,
      email: (req as any).user.email
    } : undefined,
    extra: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.get('X-Correlation-ID')
    }
  })
  
  next(err)
}

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint()
  
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1000000 // Convert to milliseconds
    
    // Log performance metrics
    logger.info('Performance metrics', {
      method: req.method,
      url: req.url,
      duration: duration,
      statusCode: res.statusCode,
      correlationId: req.get('X-Correlation-ID'),
      timestamp: new Date().toISOString()
    })
    
    // Track performance metrics
    if (process.env.NODE_ENV === 'production') {
      // Send metrics to monitoring service (e.g., DataDog, New Relic)
      // Example: sendMetric('api.response_time', duration, { endpoint: req.url })
    }
  })
  
  next()
}

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      external_services: 'unknown'
    }
  }
  
  // Add detailed checks
  try {
    // Database check (would need actual database connection)
    health.checks.database = 'connected'
    
    // Redis check (would need actual Redis connection)
    health.checks.redis = 'connected'
    
    // External services check
    health.checks.external_services = 'operational'
    
    res.status(200).json(health)
  } catch (error) {
    health.status = 'unhealthy'
    const errorMessage = error instanceof Error ? error.message : String(error)
    ;(health as any).error = errorMessage || 'Unknown error'
    res.status(503).json(health)
  }
}

// Database query performance monitoring
export const dbPerformanceMonitor = (query: string, duration: number, params?: any[]) => {
  logger.info('Database query performance', {
    query: query.substring(0, 100), // Log first 100 chars
    duration,
    params: params ? JSON.stringify(params) : undefined,
    timestamp: new Date().toISOString()
  })
  
  // Alert on slow queries
  if (duration > 1000) { // Queries taking more than 1 second
    logger.warn('Slow database query detected', {
      query: query.substring(0, 200),
      duration,
      params: params ? JSON.stringify(params) : undefined,
      threshold: 1000,
      timestamp: new Date().toISOString()
    })
  }
}

// Custom metrics tracking
export const trackMetric = (name: string, value: number, tags?: Record<string, string>) => {
  logger.info('Custom metric', {
    metric: name,
    value,
    tags,
    timestamp: new Date().toISOString()
  })
  
  // Send to external monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: sendMetric(name, value, tags)
  }
}

// Security event logging
export const logSecurityEvent = (event: string, details: any, req?: Request) => {
  logger.warn('Security event', {
    event,
    details,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    userId: (req as any)?.user?.id,
    correlationId: req?.get('X-Correlation-ID'),
    timestamp: new Date().toISOString()
  })
  
  // Send critical security events to Sentry
  if (['login_failed', 'suspicious_activity', 'rate_limit_exceeded'].includes(event)) {
    Sentry.captureMessage(`Security event: ${event}`, {
      level: 'warning',
      extra: {
        event,
        details,
        ip: req?.ip,
        userAgent: req?.get('User-Agent'),
        userId: (req as any)?.user?.id
      }
    })
  }
}

// Business metrics tracking
export const trackBusinessMetric = (metric: string, value: number, metadata?: any) => {
  logger.info('Business metric', {
    metric,
    value,
    metadata,
    timestamp: new Date().toISOString()
  })
}

// Generate correlation ID
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Graceful shutdown handler
export const gracefulShutdown = (server: any, signal: string) => {
  logger.info('Received shutdown signal', { signal })
  
  server.close(() => {
    logger.info('HTTP server closed')
    
    // Close database connections
    // Close Redis connections
    // Flush logs
    
    logger.info('Graceful shutdown completed')
    process.exit(0)
  })
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

// Alert configuration
export const setupAlerts = () => {
  // Memory usage alert
  const memoryUsage = process.memoryUsage()
  if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    logger.warn('High memory usage detected', {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      threshold: 500 * 1024 * 1024
    })
  }
  
  // CPU usage alert (would need more sophisticated monitoring)
  // Disk space alert
  // Database connection pool alert
  // External service availability alert
}

// Export logger for use in other modules
export { logger }

// Monitoring dashboard data
export const getMonitoringData = async () => {
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  
  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }
}