import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AuthenticatedRequest } from '../middleware/auth'

export interface PaymentMethodRequest {
  type: 'card' | 'fpx' | 'wallet'
  provider: string
  token: string
  lastFour?: string
  expiryMonth?: string
  expiryYear?: string
  isDefault?: boolean
  metadata?: any
}

// Get payment methods
export const getPaymentMethods = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: paymentMethods || []
    })
  } catch (error) {
    console.error('Get payment methods error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods'
    })
  }
}

// Get single payment method
export const getPaymentMethod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { methodId } = req.params

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', methodId)
      .eq('user_id', req.user!.id)
      .single()

    if (error) {
      throw error
    }

    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      })
      return
    }

    res.json({
      success: true,
      data: paymentMethod
    })
  } catch (error) {
    console.error('Get payment method error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get payment method'
    })
  }
}

// Create payment method
export const createPaymentMethod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const {
      type,
      provider,
      token,
      lastFour,
      expiryMonth,
      expiryYear,
      isDefault = false,
      metadata
    }: PaymentMethodRequest = req.body

    // If this is the default payment method, unset other default methods
    if (isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', req.user!.id)
    }

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: req.user!.id,
        type,
        provider,
        token,
        last_four: lastFour,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        is_default: isDefault,
        metadata: metadata || {}
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      data: paymentMethod
    })
  } catch (error) {
    console.error('Create payment method error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create payment method'
    })
  }
}

// Update payment method
export const updatePaymentMethod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { methodId } = req.params
    const { isDefault, metadata }: PaymentMethodRequest = req.body

    // Check if payment method exists and belongs to user
    const { data: existingMethod } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('id', methodId)
      .eq('user_id', req.user!.id)
      .single()

    if (!existingMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      })
      return
    }

    // If setting as default, unset other default methods
    if (isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', req.user!.id)
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (isDefault !== undefined) updateData.is_default = isDefault
    if (metadata !== undefined) updateData.metadata = metadata

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .update(updateData)
      .eq('id', methodId)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: paymentMethod
    })
  } catch (error) {
    console.error('Update payment method error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method'
    })
  }
}

// Delete payment method
export const deletePaymentMethod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { methodId } = req.params

    // Check if payment method exists and belongs to user
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('id, is_default')
      .eq('id', methodId)
      .eq('user_id', req.user!.id)
      .single()

    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      })
      return
    }

    // Delete payment method
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', methodId)

    if (error) {
      throw error
    }

    // If this was the default method, set another method as default
    if (paymentMethod.is_default) {
      const { data: otherMethods } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', req.user!.id)
        .limit(1)

      if (otherMethods && otherMethods.length > 0) {
        await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', otherMethods[0].id)
      }
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    })
  } catch (error) {
    console.error('Delete payment method error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
    })
  }
}