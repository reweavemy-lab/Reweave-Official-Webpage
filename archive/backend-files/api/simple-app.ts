import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()

// Security middleware
app.use(helmet())

// CORS
app.use(cors({
  origin: ['https://trae3knsy6mu.vercel.app', 'https://reweave.shop'],
  credentials: true
}))

// Body parsing
app.use(express.json())

// Simple authentication routes for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }
  
  // Simple mock authentication for testing
  if (email === 'test@example.com' && password === 'test123') {
    return res.json({
      success: true,
      data: {
        userId: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        token: 'mock-jwt-token-for-testing',
        refreshToken: 'mock-refresh-token'
      }
    })
  }
  
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  })
})

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body
  
  if (!email || !password || !firstName) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and first name are required'
    })
  }
  
  // Mock successful registration
  return res.status(201).json({
    success: true,
    data: {
      userId: '456',
      email: email,
      firstName: firstName,
      lastName: lastName || '',
      token: 'mock-jwt-token-for-new-user',
      refreshToken: 'mock-refresh-token'
    }
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Reweave API is working!'
  })
})

export default app