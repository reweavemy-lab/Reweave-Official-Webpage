import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AuthenticatedRequest } from '../middleware/auth'

export interface RedeemPointsRequest {
  points: number
  description?: string
}

// Get loyalty points balance
export const getBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('loyalty_points, loyalty_tier')
      .eq('id', req.user!.id)
      .single()

    if (error) {
      throw error
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    res.json({
      success: true,
      data: {
        points: user.loyalty_points,
        tier: user.loyalty_tier,
        tierProgress: getTierProgress(user.loyalty_points)
      }
    })
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get loyalty balance'
    })
  }
}

// Get loyalty points history
export const getHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query
    const pageNum = Number(page)
    const limitNum = Number(limit)

    const { data: transactions, error, count } = await supabase
      .from('loyalty_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        transactions: transactions || [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / parseInt(limit as string))
        }
      }
    })
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get loyalty history'
    })
  }
}

// Redeem loyalty points
export const redeemPoints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
      return
    }

    const { points, description }: RedeemPointsRequest = req.body

    if (points <= 0) {
      res.status(400).json({
        success: false,
        message: 'Points must be positive'
      })
      return
    }

    // Get current user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('loyalty_points')
      .eq('id', req.user!.id)
      .single()

    if (userError) {
      throw userError
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    if (user.loyalty_points < points) {
      res.status(400).json({
        success: false,
        message: 'Insufficient loyalty points'
      })
      return
    }

    // Deduct points from user
    const { error: updateError } = await supabase
      .from('users')
      .update({ loyalty_points: user.loyalty_points - points })
      .eq('id', req.user!.id)

    if (updateError) {
      throw updateError
    }

    // Create redemption transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: req.user!.id,
        points: -points,
        type: 'redeemed',
        description: description || 'Points redemption'
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    res.json({
      success: true,
      data: {
        transaction,
        newBalance: user.loyalty_points - points
      }
    })
  } catch (error) {
    console.error('Redeem points error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to redeem points'
    })
  }
}

// Helper function to calculate tier progress
function getTierProgress(points: number): {
  currentTier: string
  nextTier: string
  pointsToNextTier: number
  progress: number
} {
  const tiers = [
    { name: 'bronze', minPoints: 0, maxPoints: 999 },
    { name: 'silver', minPoints: 1000, maxPoints: 4999 },
    { name: 'gold', minPoints: 5000, maxPoints: 9999 },
    { name: 'platinum', minPoints: 10000, maxPoints: Infinity }
  ]

  const currentTierIndex = tiers.findIndex(tier => points >= tier.minPoints && points <= tier.maxPoints)
  const currentTier = tiers[currentTierIndex]
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null

  if (!nextTier) {
    return {
      currentTier: currentTier.name,
      nextTier: 'platinum',
      pointsToNextTier: 0,
      progress: 100
    }
  }

  const pointsToNextTier = nextTier.minPoints - points
  const progress = Math.min(100, Math.floor(((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100))

  return {
    currentTier: currentTier.name,
    nextTier: nextTier.name,
    pointsToNextTier,
    progress
  }
}