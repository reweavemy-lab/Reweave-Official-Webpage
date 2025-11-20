import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AuthenticatedRequest } from '../middleware/auth'

export interface WishlistItem {
  productId: string
}

// Get wishlist
export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: wishlist, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: wishlist || []
    })
  } catch (error) {
    console.error('Get wishlist error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist'
    })
  }
}

// Add to wishlist
export const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { productId }: WishlistItem = req.body

    // Check if item already exists
    const { data: existingItem } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      })
      return
    }

    // Add to wishlist
    const { data: wishlistItem, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: req.user!.id,
        product_id: productId
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      data: wishlistItem
    })
  } catch (error) {
    console.error('Add to wishlist error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist'
    })
  }
}

// Remove from wishlist
export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('product_id', productId)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    })
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    })
  }
}

// Clear wishlist
export const clearWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', req.user!.id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Wishlist cleared'
    })
  } catch (error) {
    console.error('Clear wishlist error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist'
    })
  }
}