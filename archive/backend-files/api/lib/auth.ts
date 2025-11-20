import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development'
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m' as string
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d' as string
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

export interface JWTPayload {
  userId: string
  email?: string
  phone?: string
  firstName: string
  lastName: string
  role?: string
  permissions?: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export const generateTokens = (payload: JWTPayload): AuthTokens => {
  const accessToken = jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY as any,
    algorithm: 'HS256'
  })

  const refreshToken = jwt.sign(
    { ...payload, tokenId: uuidv4() },
    JWT_SECRET as string,
    {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRY as any,
      algorithm: 'HS256'
    }
  )

  return { accessToken, refreshToken }
}

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET as string) as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `RW${timestamp}${random}`
}