import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AuthenticatedRequest } from '../middleware/auth'

export interface AddressRequest {
  label: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country?: string
  isDefault?: boolean
}

// Get all addresses
export const getAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: addresses || []
    })
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get addresses'
    })
  }
}

// Get single address
export const getAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { addressId } = req.params

    const { data: address, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', req.user!.id)
      .single()

    if (error) {
      throw error
    }

    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      })
      return
    }

    res.json({
      success: true,
      data: address
    })
  } catch (error) {
    console.error('Get address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get address'
    })
  }
}

// Create address
export const createAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      label,
      recipientName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = 'MY',
      isDefault = false
    }: AddressRequest = req.body

    // If this is the default address, unset other default addresses
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user!.id)
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        user_id: req.user!.id,
        label,
        recipient_name: recipientName,
        phone,
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
        is_default: isDefault
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      data: address
    })
  } catch (error) {
    console.error('Create address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create address'
    })
  }
}

// Update address
export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { addressId } = req.params
    const {
      label,
      recipientName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    }: AddressRequest = req.body

    // Check if address exists and belongs to user
    const { data: existingAddress } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', req.user!.id)
      .single()

    if (!existingAddress) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      })
      return
    }

    // If setting as default, unset other default addresses
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user!.id)
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (label !== undefined) updateData.label = label
    if (recipientName !== undefined) updateData.recipient_name = recipientName
    if (phone !== undefined) updateData.phone = phone
    if (addressLine1 !== undefined) updateData.address_line_1 = addressLine1
    if (addressLine2 !== undefined) updateData.address_line_2 = addressLine2
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (postalCode !== undefined) updateData.postal_code = postalCode
    if (country !== undefined) updateData.country = country
    if (isDefault !== undefined) updateData.is_default = isDefault

    const { data: address, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', addressId)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: address
    })
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update address'
    })
  }
}

// Delete address
export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { addressId } = req.params

    // Check if address exists and belongs to user
    const { data: address } = await supabase
      .from('addresses')
      .select('id, is_default')
      .eq('id', addressId)
      .eq('user_id', req.user!.id)
      .single()

    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found'
      })
      return
    }

    // Delete address
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)

    if (error) {
      throw error
    }

    // If this was the default address, set another address as default
    if (address.is_default) {
      const { data: otherAddresses } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', req.user!.id)
        .limit(1)

      if (otherAddresses && otherAddresses.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', otherAddresses[0].id)
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    })
  }
}