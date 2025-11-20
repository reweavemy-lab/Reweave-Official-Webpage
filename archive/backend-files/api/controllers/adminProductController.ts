import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AdminRequest } from '../middleware/adminAuth'

export interface ProductRequest {
  name: string
  description: string
  category: string
  price: number
  originalPrice?: number
  sku: string
  isActive: boolean
  isPreorder: boolean
  preorderStartDate?: string
  preorderEndDate?: string
  estimatedDelivery?: string
  images?: string[]
  variants?: ProductVariant[]
  inventory?: InventoryData
}

export interface ProductVariant {
  name: string
  options: string[]
  priceModifier?: number
}

export interface InventoryData {
  stock: number
  lowStockThreshold: number
  materialConsumption?: MaterialConsumption[]
}

export interface MaterialConsumption {
  materialId: string
  quantity: number
  unit: string
}

// Get all products
export const getAllProducts = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      isActive, 
      isPreorder, 
      search 
    } = req.query

    let query = supabase
      .from('products')
      .select(`
        *,
        inventory(*),
        product_variants(*),
        product_images(*)
      `)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive)
    }

    if (isPreorder !== undefined) {
      query = query.eq('is_preorder', isPreorder)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit)
    const to = from + Number(limit) - 1
    query = query.range(from, to)

    const { data: products, error, count } = await query

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('Get all products error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get products'
    })
  }
}

// Get single product
export const getProduct = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        inventory(*),
        product_variants(*),
        product_images(*)
      `)
      .eq('id', productId)
      .single()

    if (error) {
      throw error
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      })
      return
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get product'
    })
  }
}

// Create product
export const createProduct = async (req: AdminRequest, res: Response): Promise<void> => {
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
      name,
      description,
      category,
      price,
      originalPrice,
      sku,
      isActive,
      isPreorder,
      preorderStartDate,
      preorderEndDate,
      estimatedDelivery,
      images,
      variants,
      inventory
    }: ProductRequest = req.body

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        category,
        price,
        original_price: originalPrice,
        sku,
        is_active: isActive,
        is_preorder: isPreorder,
        preorder_start_date: preorderStartDate,
        preorder_end_date: preorderEndDate,
        estimated_delivery: estimatedDelivery,
        created_by: req.admin!.id
      })
      .select()
      .single()

    if (productError) {
      throw productError
    }

    // Create inventory record
    if (inventory) {
      await supabase
        .from('inventory')
        .insert({
          product_id: product.id,
          stock: inventory.stock,
          low_stock_threshold: inventory.lowStockThreshold,
          reserved_stock: 0,
          available_stock: inventory.stock
        })
    }

    // Create product variants
    if (variants && variants.length > 0) {
      const variantData = variants.map(variant => ({
        product_id: product.id,
        name: variant.name,
        options: variant.options,
        price_modifier: variant.priceModifier || 0
      }))

      await supabase
        .from('product_variants')
        .insert(variantData)
    }

    // Create product images
    if (images && images.length > 0) {
      const imageData = images.map((image, index) => ({
        product_id: product.id,
        image_url: image,
        position: index + 1,
        is_primary: index === 0
      }))

      await supabase
        .from('product_images')
        .insert(imageData)
    }

    res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    })
  }
}

// Update product
export const updateProduct = async (req: AdminRequest, res: Response): Promise<void> => {
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

    const { productId } = req.params
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      sku,
      isActive,
      isPreorder,
      preorderStartDate,
      preorderEndDate,
      estimatedDelivery,
      images,
      variants,
      inventory
    }: Partial<ProductRequest> = req.body

    // Update product
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (price !== undefined) updateData.price = price
    if (originalPrice !== undefined) updateData.original_price = originalPrice
    if (sku !== undefined) updateData.sku = sku
    if (isActive !== undefined) updateData.is_active = isActive
    if (isPreorder !== undefined) updateData.is_preorder = isPreorder
    if (preorderStartDate !== undefined) updateData.preorder_start_date = preorderStartDate
    if (preorderEndDate !== undefined) updateData.preorder_end_date = preorderEndDate
    if (estimatedDelivery !== undefined) updateData.estimated_delivery = estimatedDelivery

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      })
      return
    }

    // Update inventory if provided
    if (inventory) {
      const inventoryUpdate: any = {}
      if (inventory.stock !== undefined) inventoryUpdate.stock = inventory.stock
      if (inventory.lowStockThreshold !== undefined) inventoryUpdate.low_stock_threshold = inventory.lowStockThreshold

      await supabase
        .from('inventory')
        .update(inventoryUpdate)
        .eq('product_id', productId)
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    })
  }
}

// Delete product
export const deleteProduct = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('products')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    })
  }
}

// Upload product image
export const uploadProductImage = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params
    const { imageUrl, isPrimary } = req.body

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Image URL is required'
      })
      return
    }

    // If this is the primary image, unset other primary images
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
    }

    // Get next position
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('position')
      .eq('product_id', productId)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = existingImages && existingImages.length > 0 ? existingImages[0].position + 1 : 1

    // Create product image
    const { data: image, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        position: nextPosition,
        is_primary: isPrimary || false
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      data: image
    })
  } catch (error) {
    console.error('Upload product image error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload product image'
    })
  }
}

// Update inventory
export const updateInventory = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params
    const { stock, lowStockThreshold, reservedStock }: {
      stock?: number
      lowStockThreshold?: number
      reservedStock?: number
    } = req.body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (stock !== undefined) {
      updateData.stock = stock
      updateData.available_stock = stock - (reservedStock || 0)
    }

    if (lowStockThreshold !== undefined) updateData.low_stock_threshold = lowStockThreshold
    if (reservedStock !== undefined) {
      updateData.reserved_stock = reservedStock
      // Recalculate available stock
      const { data: currentInventory } = await supabase
        .from('inventory')
        .select('stock')
        .eq('product_id', productId)
        .single()

      updateData.available_stock = (currentInventory?.stock || 0) - reservedStock
    }

    const { data: inventory, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('product_id', productId)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: inventory
    })
  } catch (error) {
    console.error('Update inventory error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory'
    })
  }
}

// Get low stock products
export const getLowStockProducts = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        inventory(*)
      `)
      .lt('inventory.available_stock', 'inventory.low_stock_threshold')
      .eq('is_active', true)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: products || []
    })
  } catch (error) {
    console.error('Get low stock products error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock products'
    })
  }
}