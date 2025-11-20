import { useState } from 'react';
import { Plus, Search, Upload, Edit, Trash2, Package, DollarSign, Calendar, AlertCircle, Eye, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'preorder';
  category: string;
  preorderStart?: string;
  preorderEnd?: string;
  eta?: string;
  image?: string;
  variants: number;
}

const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Batik Heritage Tote Bag',
    sku: 'BHB-001',
    price: 285.00,
    stock: 15,
    status: 'active',
    category: 'Tote Bags',
    variants: 3,
    image: '/api/placeholder/60/60'
  },
  {
    id: 'PROD-002',
    name: 'Traditional Clutch - Premium',
    sku: 'TCP-002',
    price: 450.00,
    stock: 8,
    status: 'preorder',
    category: 'Clutches',
    preorderStart: '2024-01-01',
    preorderEnd: '2024-01-31',
    eta: '2024-03-15',
    variants: 2,
    image: '/api/placeholder/60/60'
  },
  {
    id: 'PROD-003',
    name: 'Cultural Crossbody',
    sku: 'CCB-003',
    price: 195.00,
    stock: 0,
    status: 'inactive',
    category: 'Crossbody',
    variants: 4,
    image: '/api/placeholder/60/60'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  preorder: 'bg-blue-100 text-blue-800 border-blue-200'
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleStatusToggle = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            status: product.status === 'active' ? 'inactive' : 'active' as Product['status']
          }
        : product
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Product Management</h1>
          <p className="text-pebble mt-2">Manage your product catalog and inventory</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pebble" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="preorder">Preorder</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="all">All Categories</option>
            <option value="Tote Bags">Tote Bags</option>
            <option value="Clutches">Clutches</option>
            <option value="Crossbody">Crossbody</option>
          </select>
          <button className="btn btn-outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300">
            <div className="relative">
              <div className="w-full h-48 bg-sand/30 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-pebble" />
                )}
              </div>
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[product.status]}`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </div>
              {product.status === 'preorder' && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Calendar className="w-3 h-3 mr-1" />
                    Preorder
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-indigo mb-1">{product.name}</h3>
                  <p className="text-sm text-pebble font-mono">{product.sku}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-sand text-indigo">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sand text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-pebble text-sm">Price</span>
                  <span className="font-bold text-indigo">RM {product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-pebble text-sm">Stock</span>
                  <div className="flex items-center space-x-2">
                    {product.stock > 0 ? (
                      <>
                        <span className={`font-bold ${
                          product.stock < 10 ? 'text-terracotta' : 'text-sage'
                        }`}>
                          {product.stock}
                        </span>
                        {product.stock < 10 && (
                          <AlertCircle className="w-4 h-4 text-terracotta" />
                        )}
                      </>
                    ) : (
                      <span className="font-bold text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-pebble text-sm">Variants</span>
                  <span className="text-indigo font-medium">{product.variants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-pebble text-sm">Category</span>
                  <span className="text-indigo text-sm">{product.category}</span>
                </div>
              </div>

              {product.status === 'preorder' && product.preorderEnd && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 mb-1">Preorder ends: {product.preorderEnd}</p>
                  <p className="text-xs text-blue-700">ETA: {product.eta}</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleStatusToggle(product.id)}
                  className={`flex-1 btn ${
                    product.status === 'active' ? 'btn-outline' : 'btn-primary'
                  }`}
                >
                  {product.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button className="p-2 rounded-lg hover:bg-sand text-indigo">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-indigo">Add New Product</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-sand text-indigo"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">SKU</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Price (RM)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Initial Stock</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo mb-2">Category</label>
                <select className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage">
                  <option>Select category</option>
                  <option>Tote Bags</option>
                  <option>Clutches</option>
                  <option>Crossbody</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo mb-2">Product Image</label>
                <div className="border-2 border-dashed border-sand rounded-xl p-6 text-center hover:border-sage transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image"
                  />
                  <label htmlFor="product-image" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <ImageIcon className="w-12 h-12 text-sage mx-auto" />
                        <p className="text-sm text-indigo">{selectedFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 text-pebble mx-auto" />
                        <p className="text-sm text-pebble">Click to upload product image</p>
                        <p className="text-xs text-pebble">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Preorder Start</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Preorder End</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">ETA</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-indigo mt-2">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-sage" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Active</p>
              <p className="text-3xl font-bold text-indigo mt-2">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Preorder</p>
              <p className="text-3xl font-bold text-indigo mt-2">
                {products.filter(p => p.status === 'preorder').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Low Stock</p>
              <p className="text-3xl font-bold text-indigo mt-2">
                {products.filter(p => p.stock < 10 && p.stock > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-terracotta" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}