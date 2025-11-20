import express from 'express'
import cors from 'cors'

const app = express()

// CORS
app.use(cors({
  origin: ['https://reweave.shop', 'https://www.reweave.shop'],
  credentials: true
}))

// Body parsing
app.use(express.json())

// Simple authentication routes
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
      userId: Math.random().toString(36).substr(2, 9),
      email: email,
      firstName: firstName,
      lastName: lastName || '',
      token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9),
      refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substr(2, 9)
    }
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }
  
  // Mock authentication for testing
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
  
  // Allow any email/password combo for testing
  return res.json({
    success: true,
    data: {
      userId: Math.random().toString(36).substr(2, 9),
      email: email,
      firstName: email.split('@')[0],
      lastName: 'User',
      token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9),
      refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substr(2, 9)
    }
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Reweave Auth API is working!'
  })
})

// Catch all other routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

export default app