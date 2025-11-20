import { api } from './api'

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface AddToWishlistRequest {
  productId: string
}

export const wishlistService = {
  async getWishlist(): Promise<{
    success: boolean
    data: WishlistItem[]
  }> {
    const response = await api.get<{
      success: boolean
      data: WishlistItem[]
    }>('/wishlist')
    return response
  },

  async addToWishlist(data: AddToWishlistRequest): Promise<{
    success: boolean
    data: WishlistItem
  }> {
    const response = await api.post<{
      success: boolean
      data: WishlistItem
    }>('/wishlist', data)
    return response
  },

  async removeFromWishlist(productId: string): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.delete<{
      success: boolean
      message: string
    }>(`/wishlist/${productId}`)
    return response
  },

  async clearWishlist(): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.delete<{
      success: boolean
      message: string
    }>('/wishlist/clear')
    return response
  }
}