import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { Toaster, toast } from 'sonner'
import AdminNavigation from '../../components/AdminNavigation'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  original_price?: number
  sku: string
  is_active: boolean
  is_preorder: boolean
  preorder_start_date?: string
  preorder_end_date?: string
  estimated_delivery?: string
  inventory?: {
    stock: number
    low_stock_threshold: number
    available_stock: number
  }
  product_images?: Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    isActive: '',
    isPreorder: '',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    sku: '',
    isActive: true,
    isPreorder: false,
    preorderStartDate: '',
    preorderEndDate: '',
    estimatedDelivery: '',
    stock: '',
    lowStockThreshold: ''
  })

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const response = await adminService.getAllProducts(filters)
      
      if (response.success) {
        setProducts(response.data.products)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        sku: formData.sku,
        isActive: formData.isActive,
        isPreorder: formData.isPreorder,
        preorderStartDate: formData.preorderStartDate || undefined,
        preorderEndDate: formData.preorderEndDate || undefined,
        estimatedDelivery: formData.estimatedDelivery || undefined,
        inventory: {
          stock: parseInt(formData.stock),
          lowStockThreshold: parseInt(formData.lowStockThreshold)
        }
      }

      if (editingProduct) {
        const response = await adminService.updateProduct(editingProduct.id, productData)
        if (response.success) {
          toast.success('Product updated successfully')
          setEditingProduct(null)
        }
      } else {
        const response = await adminService.createProduct(productData)
        if (response.success) {
          toast.success('Product created successfully')
        }
      }
      
      setShowAddModal(false)
      resetForm()
      loadProducts()
    } catch (error) {
      toast.error('Failed to save product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      originalPrice: '',
      sku: '',
      isActive: true,
      isPreorder: false,
      preorderStartDate: '',
      preorderEndDate: '',
      estimatedDelivery: '',
      stock: '',
      lowStockThreshold: ''
    })
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || '',
      sku: product.sku,
      isActive: product.is_active,
      isPreorder: product.is_preorder,
      preorderStartDate: product.preorder_start_date || '',
      preorderEndDate: product.preorder_end_date || '',
      estimatedDelivery: product.estimated_delivery || '',
      stock: product.inventory?.stock.toString() || '',
      lowStockThreshold: product.inventory?.low_stock_threshold.toString() || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await adminService.deleteProduct(productId)
      if (response.success) {
        toast.success('Product deleted successfully')
        loadProducts()
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleToggleStatus = async (product: Product) => {
    try {
      const response = await adminService.updateProduct(product.id, {
        isActive: !product.is_active
      })
      if (response.success) {
        toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`)
        loadProducts()
      }
    } catch (error) {
      toast.error('Failed to update product status')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-sage to-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-pebble">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Toaster position="top-right" />
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo" style={{ fontFamily: 'Playfair Display, serif' }}>
              Product Management
            </h1>
            <p className="text-pebble">Manage your batik products</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null)
              resetForm()
              setShowAddModal(true)
            }}
            className="bg-gradient-to-r from-sage to-gold text-white px-6 py-3 rounded-lg font-medium hover:from-terracotta hover:to-gold transition-all"
          >
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6 border border-sand">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="bags">Bags</option>
                <option value="accessories">Accessories</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Preorder</label>
              <select
                value={filters.isPreorder}
                onChange={(e) => setFilters(prev => ({ ...prev, isPreorder: e.target.value }))}
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              >
                <option value="">All Products</option>
                <option value="true">Preorder Only</option>
                <option value="false">Regular Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Product name, SKU..."
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-soft overflow-hidden border border-sand hover:shadow-medium transition-shadow">
              {/* Product Image */}
              <div className="aspect-w-4 aspect-h-3 bg-sage/10">
                {product.product_images && product.product_images.length > 0 ? (
                  <img
                    src={product.product_images[0].image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <svg className="w-12 h-12 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-indigo" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {product.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-pebble text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-indigo">
                    {formatCurrency(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="text-sm text-pebble line-through">
                      {formatCurrency(product.original_price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-pebble">SKU: {product.sku}</span>
                  {product.is_preorder && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Preorder
                    </span>
                  )}
                </div>

                {product.inventory && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pebble">Stock:</span>
                      <span className={`font-medium ${
                        product.inventory.available_stock <= product.inventory.low_stock_threshold
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {product.inventory.available_stock} available
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-sage text-white px-4 py-2 rounded-lg font-medium hover:bg-sage/90 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className="px-4 py-2 border border-sage text-sage rounded-lg font-medium hover:bg-sage/10 transition-colors"
                  >
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-soft p-6 border border-sand">
            <div className="flex items-center justify-between">
              <div className="text-sm text-pebble">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm font-medium text-indigo bg-white border border-sand rounded-lg hover:bg-sage/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-indigo">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-indigo bg-white border border-sand rounded-lg hover:bg-sage/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-sand">
              <h2 className="text-2xl font-bold text-indigo" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="bags">Bags</option>
                    <option value="accessories">Accessories</option>
                    <option value="clothing">Clothing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Price (MYR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Original Price (MYR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-sand text-sage focus:ring-sage"
                    />
                    <span className="ml-2 text-sm text-indigo">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPreorder}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPreorder: e.target.checked }))}
                      className="rounded border-sand text-sage focus:ring-sage"
                    />
                    <span className="ml-2 text-sm text-indigo">Preorder</span>
                  </label>
                </div>
              </div>

              {formData.isPreorder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-indigo mb-2">Preorder Start Date</label>
                    <input
                      type="date"
                      value={formData.preorderStartDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, preorderStartDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo mb-2">Preorder End Date</label>
                    <input
                      type="date"
                      value={formData.preorderEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, preorderEndDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-sand text-indigo rounded-lg font-medium hover:bg-sage/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-sage to-gold text-white rounded-lg font-medium hover:from-terracotta hover:to-gold transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}