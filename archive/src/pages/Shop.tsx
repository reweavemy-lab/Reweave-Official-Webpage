import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Filter, 
  Grid, 
  List, 
  Search,
  ChevronDown,
  Calendar,
  Clock,
  Info,
  Plus,
  Minus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  rating: number;
  review_count: number;
  is_preorder: boolean;
  preorder_end_date?: string;
  estimated_delivery_date?: string;
  inventory_quantity: number;
  low_stock_threshold: number;
  category: string;
  created_at?: string;
  tags: string[];
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inventory_quantity: number;
  option1?: string;
  option2?: string;
  option3?: string;
}

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  tags: string[];
  availability: string[];
  sortBy: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Heritage Batik Tote',
    slug: 'heritage-batik-tote',
    description: 'Traditional Malaysian batik patterns meet modern functionality in this spacious tote bag. Handcrafted by local artisans using authentic batik techniques.',
    short_description: 'Authentic batik tote with traditional patterns',
    price: 285,
    compare_at_price: 350,
    images: ['/api/placeholder/400/400'],
    rating: 4.8,
    review_count: 124,
    is_preorder: false,
    inventory_quantity: 15,
    low_stock_threshold: 5,
    category: 'Tote Bags',
    tags: ['heritage', 'handmade', 'sustainable', 'traditional'],
    variants: [
      { id: 'v1', name: 'Navy Blue', price: 285, inventory_quantity: 8, option1: 'Navy Blue' },
      { id: 'v2', name: 'Burgundy', price: 285, inventory_quantity: 7, option1: 'Burgundy' }
    ]
  },
  {
    id: '2',
    name: 'Traditional Clutch Premium',
    slug: 'traditional-clutch-premium',
    description: 'Elegant clutch featuring premium batik fabric with gold accents. Perfect for special occasions and cultural events. Limited edition design.',
    short_description: 'Premium batik clutch with gold accents',
    price: 450,
    images: ['/api/placeholder/400/400'],
    rating: 4.9,
    review_count: 89,
    is_preorder: true,
    preorder_end_date: '2024-02-15',
    estimated_delivery_date: '2024-03-30',
    inventory_quantity: 0,
    low_stock_threshold: 3,
    category: 'Clutches',
    tags: ['premium', 'traditional', 'limited', 'special-occasion'],
    variants: [
      { id: 'v3', name: 'Gold on Black', price: 450, inventory_quantity: 0, option1: 'Gold on Black' },
      { id: 'v4', name: 'Silver on Navy', price: 450, inventory_quantity: 0, option1: 'Silver on Navy' }
    ]
  },
  {
    id: '3',
    name: 'Cultural Crossbody Bag',
    slug: 'cultural-crossbody-bag',
    description: 'Versatile crossbody bag featuring cultural batik motifs. Adjustable strap and multiple compartments for everyday use.',
    short_description: 'Cultural batik crossbody for everyday use',
    price: 195,
    images: ['/api/placeholder/400/400'],
    rating: 4.7,
    review_count: 156,
    is_preorder: false,
    inventory_quantity: 25,
    low_stock_threshold: 5,
    category: 'Crossbody Bags',
    tags: ['cultural', 'everyday', 'versatile', 'adjustable'],
    variants: [
      { id: 'v5', name: 'Earth Tones', price: 195, inventory_quantity: 12, option1: 'Earth Tones' },
      { id: 'v6', name: 'Ocean Blues', price: 195, inventory_quantity: 13, option1: 'Ocean Blues' }
    ]
  },
  {
    id: '4',
    name: 'Artisan Shoulder Piece',
    slug: 'artisan-shoulder-piece',
    description: 'Handcrafted shoulder bag by master batik artisans. Features unique patterns and premium leather accents.',
    short_description: 'Master artisan shoulder bag with leather accents',
    price: 320,
    images: ['/api/placeholder/400/400'],
    rating: 4.6,
    review_count: 78,
    is_preorder: false,
    inventory_quantity: 3,
    low_stock_threshold: 5,
    category: 'Shoulder Bags',
    tags: ['artisan', 'shoulder', 'premium', 'leather-accents'],
    variants: [
      { id: 'v7', name: 'Tan Leather', price: 320, inventory_quantity: 1, option1: 'Tan Leather' },
      { id: 'v8', name: 'Black Leather', price: 320, inventory_quantity: 2, option1: 'Black Leather' }
    ]
  }
];

const categories = ['All', 'Tote Bags', 'Clutches', 'Crossbody Bags', 'Shoulder Bags'];
const tags = ['heritage', 'handmade', 'sustainable', 'traditional', 'premium', 'limited', 'special-occasion', 'cultural', 'everyday', 'versatile', 'adjustable', 'artisan', 'leather-accents'];
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 1000],
    tags: [],
    availability: [],
    sortBy: 'featured'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Initialize filters from URL params
    const category = searchParams.get('category');
    const preorder = searchParams.get('preorder');
    const search = searchParams.get('search');
    
    if (category) {
      setFilters(prev => ({
        ...prev,
        categories: [category]
      }));
    }
    
    if (preorder === 'true') {
      setFilters(prev => ({
        ...prev,
        availability: ['preorder']
      }));
    }
    
    if (search) {
      setSearchQuery(search);
    }

    // Load cart count
    const savedCart = localStorage.getItem('reweave-cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, products]);

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes('All')) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    // Price filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(product =>
        filters.tags.some(tag => product.tags.includes(tag))
      );
    }

    // Availability filter
    if (filters.availability.length > 0) {
      if (filters.availability.includes('preorder')) {
        filtered = filtered.filter(product => product.is_preorder);
      }
      if (filters.availability.includes('in-stock')) {
        filtered = filtered.filter(product => !product.is_preorder && product.inventory_quantity > 0);
      }
      if (filters.availability.includes('low-stock')) {
        filtered = filtered.filter(product => !product.is_preorder && product.inventory_quantity <= product.low_stock_threshold && product.inventory_quantity > 0);
      }
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product, variant: ProductVariant, qty: number) => {
    const cart = JSON.parse(localStorage.getItem('reweave-cart') || '[]');
    const existingItem = cart.find((item: any) => 
      item.productId === product.id && item.variantId === variant.id
    );
    
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        price: variant.price,
        quantity: qty,
        image: product.images[0] || '/api/placeholder/100/100'
      });
    }
    
    localStorage.setItem('reweave-cart', JSON.stringify(cart));
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    
    // Show success notification
    alert(`Added ${qty} x ${product.name} (${variant.name}) to cart!`);
  };

  const isInStock = (product: Product, variant: ProductVariant) => {
    if (product.is_preorder) return true;
    return variant.inventory_quantity > 0;
  };

  const getStockStatus = (product: Product, variant: ProductVariant) => {
    if (product.is_preorder) {
      return { text: 'Available for Preorder', color: 'text-gold' };
    }
    if (variant.inventory_quantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-500' };
    }
    if (variant.inventory_quantity <= product.low_stock_threshold) {
      return { text: `Only ${variant.inventory_quantity} left`, color: 'text-terracotta' };
    }
    return { text: 'In Stock', color: 'text-sage' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sand/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-display font-bold text-indigo">Reweave</span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search batik bags, clutches, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pebble" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/account" className="p-2 text-indigo hover:text-sage transition-colors">
                Account
              </Link>
              <Link to="/cart" className="relative p-2 text-indigo hover:text-sage transition-colors">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-indigo">Shop Collection</h1>
            <p className="text-pebble mt-2">Handcrafted batik bags that carry culture and create impact</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-sand rounded-xl hover:border-sage transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-sage text-white' : 'bg-white text-pebble border border-sand'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-sage text-white' : 'bg-white text-pebble border border-sand'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-soft space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-indigo mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                categories: [...prev.categories, category]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                categories: prev.categories.filter(c => c !== category)
                              }));
                            }
                          }}
                          className="rounded border-sand text-sage focus:ring-sage"
                        />
                        <span className="text-sm text-indigo">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-bold text-indigo mb-3">Availability</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes('in-stock')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              availability: [...prev.availability, 'in-stock']
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              availability: prev.availability.filter(a => a !== 'in-stock')
                            }));
                          }
                        }}
                        className="rounded border-sand text-sage focus:ring-sage"
                      />
                      <span className="text-sm text-indigo">In Stock</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes('preorder')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              availability: [...prev.availability, 'preorder']
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              availability: prev.availability.filter(a => a !== 'preorder')
                            }));
                          }
                        }}
                        className="rounded border-sand text-sage focus:ring-sage"
                      />
                      <span className="text-sm text-indigo">Available for Preorder</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes('low-stock')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              availability: [...prev.availability, 'low-stock']
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              availability: prev.availability.filter(a => a !== 'low-stock')
                            }));
                          }
                        }}
                        className="rounded border-sand text-sage focus:ring-sage"
                      />
                      <span className="text-sm text-indigo">Low Stock</span>
                    </label>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-indigo mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                      className="w-full accent-sage"
                    />
                    <div className="flex justify-between text-sm text-pebble">
                      <span>RM {filters.priceRange[0]}</span>
                      <span>RM {filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-bold text-indigo mb-3">Sort By</h3>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    categories: [],
                    priceRange: [0, 1000],
                    tags: [],
                    availability: [],
                    sortBy: 'featured'
                  })}
                  className="w-full btn btn-outline text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-pebble">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Products */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={() => {
                      setSelectedProduct(product);
                      setSelectedVariant(product.variants[0]);
                    }}
                    onAddToCart={() => {
                      setSelectedProduct(product);
                      setSelectedVariant(product.variants[0]);
                    }}
                    isInStock={isInStock}
                    getStockStatus={getStockStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    onSelect={() => {
                      setSelectedProduct(product);
                      setSelectedVariant(product.variants[0]);
                    }}
                    onAddToCart={() => {
                      setSelectedProduct(product);
                      setSelectedVariant(product.variants[0]);
                    }}
                    isInStock={isInStock}
                    getStockStatus={getStockStatus}
                  />
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-pebble mx-auto mb-4" />
                <h3 className="text-lg font-bold text-indigo mb-2">No products found</h3>
                <p className="text-pebble">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          selectedVariant={selectedVariant}
          quantity={quantity}
          onClose={() => {
            setSelectedProduct(null);
            setSelectedVariant(null);
            setQuantity(1);
          }}
          onVariantChange={setSelectedVariant}
          onQuantityChange={setQuantity}
          onAddToCart={() => addToCart(selectedProduct, selectedVariant!, quantity)}
          isInStock={isInStock}
          getStockStatus={getStockStatus}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  onSelect, 
  onAddToCart,
  isInStock,
  getStockStatus
}: { 
  product: Product;
  onSelect: () => void;
  onAddToCart: () => void;
  isInStock: (product: Product, variant: ProductVariant) => boolean;
  getStockStatus: (product: Product, variant: ProductVariant) => { text: string; color: string };
}) {
  const defaultVariant = product.variants[0];
  const stockStatus = getStockStatus(product, defaultVariant);
  const inStock = isInStock(product, defaultVariant);

  return (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-strong transition-all duration-300 overflow-hidden group">
      <div className="relative aspect-square bg-sand/20">
        <div className="w-full h-full bg-gradient-to-br from-sage/10 to-gold/10 flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-pebble/50" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {product.is_preorder && (
            <span className="inline-block px-3 py-1 bg-gold text-white text-xs font-bold rounded-full">
              PREORDER
            </span>
          )}
          {!product.is_preorder && defaultVariant.inventory_quantity <= product.low_stock_threshold && defaultVariant.inventory_quantity > 0 && (
            <span className="inline-block px-3 py-1 bg-terracotta text-white text-xs font-bold rounded-full">
              LOW STOCK
            </span>
          )}
          {product.compare_at_price && (
            <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              SALE
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add to wishlist logic
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-medium hover:bg-white transition-colors"
          >
            <Heart className="w-4 h-4 text-pebble hover:text-red-500" />
          </button>
        </div>

        {/* Category Tag */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-indigo">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-indigo group-hover:text-sage transition-colors cursor-pointer" onClick={onSelect}>
            {product.name}
          </h3>
          <p className="text-sm text-pebble line-clamp-2">{product.short_description}</p>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) ? 'text-gold fill-current' : 'text-pebble'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-pebble">({product.review_count})</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-indigo">
                  RM {product.price}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-pebble line-through">
                    RM {product.compare_at_price}
                  </span>
                )}
              </div>
              {product.compare_at_price && (
                <span className="text-xs text-terracotta font-medium">
                  Save RM {product.compare_at_price - product.price}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className={`text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </div>
            {product.is_preorder && (
              <div className="text-xs text-pebble">
                <Calendar className="w-3 h-3 inline mr-1" />
                Order by {product.preorder_end_date} • Delivery by {product.estimated_delivery_date}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onSelect}
              className="flex-1 btn btn-outline text-sm"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={!inStock}
              className={`flex-1 btn btn-primary text-sm ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product List Item Component
function ProductListItem({ 
  product, 
  onSelect, 
  onAddToCart,
  isInStock,
  getStockStatus
}: { 
  product: Product;
  onSelect: () => void;
  onAddToCart: () => void;
  isInStock: (product: Product, variant: ProductVariant) => boolean;
  getStockStatus: (product: Product, variant: ProductVariant) => { text: string; color: string };
}) {
  const defaultVariant = product.variants[0];
  const stockStatus = getStockStatus(product, defaultVariant);
  const inStock = isInStock(product, defaultVariant);

  return (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 p-6">
      <div className="flex gap-6">
        <div className="w-32 h-32 bg-sand/20 rounded-xl flex-shrink-0 flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-pebble/50" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-indigo hover:text-sage transition-colors cursor-pointer" onClick={onSelect}>
                {product.name}
              </h3>
              <p className="text-pebble">{product.short_description}</p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'text-gold fill-current' : 'text-pebble'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-pebble">({product.review_count})</span>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="space-y-1">
                <span className="text-2xl font-bold text-indigo">
                  RM {product.price}
                </span>
                {product.compare_at_price && (
                  <div className="text-sm text-pebble line-through">
                    RM {product.compare_at_price}
                  </div>
                )}
              </div>
              <div className={`text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-sand/20 rounded-full text-xs font-medium text-indigo">
                {product.category}
              </span>
              {product.is_preorder && (
                <div className="flex items-center space-x-1 text-xs text-gold">
                  <Calendar className="w-3 h-3" />
                  <span>Preorder until {product.preorder_end_date}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onSelect}
                className="btn btn-outline text-sm"
              >
                View Details
              </button>
              <button
                onClick={onAddToCart}
                disabled={!inStock}
                className={`btn btn-primary text-sm ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Modal Component
function ProductModal({ 
  product, 
  selectedVariant, 
  quantity, 
  onClose, 
  onVariantChange, 
  onQuantityChange, 
  onAddToCart,
  isInStock,
  getStockStatus
}: { 
  product: Product;
  selectedVariant: ProductVariant | null;
  quantity: number;
  onClose: () => void;
  onVariantChange: (variant: ProductVariant) => void;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  isInStock: (product: Product, variant: ProductVariant) => boolean;
  getStockStatus: (product: Product, variant: ProductVariant) => { text: string; color: string };
}) {
  const stockStatus = selectedVariant ? getStockStatus(product, selectedVariant) : { text: '', color: '' };
  const inStock = selectedVariant ? isInStock(product, selectedVariant) : false;
  const maxQuantity = product.is_preorder ? 10 : (selectedVariant?.inventory_quantity || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-sand">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-indigo">{product.name}</h2>
            <button
              onClick={onClose}
              className="p-2 text-pebble hover:text-indigo rounded-lg hover:bg-sand/20"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-sand/20 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-pebble/50" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-sand/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-pebble/30" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating) ? 'text-gold fill-current' : 'text-pebble'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-pebble">({product.review_count} reviews)</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-indigo">
                      RM {selectedVariant?.price || product.price}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-lg text-pebble line-through">
                        RM {product.compare_at_price}
                      </span>
                    )}
                  </div>
                  {product.compare_at_price && (
                    <span className="text-sm text-terracotta font-medium">
                      Save RM {product.compare_at_price - product.price}
                    </span>
                  )}
                </div>

                <p className="text-indigo leading-relaxed">{product.description}</p>

                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-sand/20 rounded-full text-sm font-medium text-indigo">
                    {product.category}
                  </span>
                  {product.is_preorder && (
                    <span className="px-3 py-1 bg-gold/20 rounded-full text-sm font-medium text-gold">
                      Available for Preorder
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Selection */}
              <div className="space-y-4">
                <h3 className="font-bold text-indigo">Choose Variant</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => onVariantChange(variant)}
                      className={`p-3 border rounded-xl text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-sage bg-sage/10 text-sage'
                          : 'border-sand text-indigo hover:border-sage'
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-pebble">RM {variant.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <h3 className="font-bold text-indigo">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 border border-sand rounded-lg hover:border-sage disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold text-indigo min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    className="p-2 border border-sand rounded-lg hover:border-sage disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.is_preorder && (
                  <div className="text-sm text-pebble">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Preorder ends: {product.preorder_end_date} • Delivery by: {product.estimated_delivery_date}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              {selectedVariant && (
                <div className={`text-sm font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onAddToCart}
                  disabled={!inStock || !selectedVariant}
                  className={`w-full btn btn-lg ${!inStock || !selectedVariant ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {inStock && selectedVariant ? 'Add to Cart' : 'Not Available'}
                </button>
                
                <button
                  onClick={() => {
                    // Add to wishlist logic
                    alert('Added to wishlist!');
                  }}
                  className="w-full btn btn-outline"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Add to Wishlist
                </button>
              </div>

              {/* Product Tags */}
              <div className="space-y-2">
                <h4 className="font-medium text-indigo">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-sand/20 rounded-full text-xs text-indigo">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}