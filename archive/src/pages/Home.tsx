import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowRight, 
  Award, 
  Users, 
  Leaf, 
  Play,
  Menu,
  X,
  Search,
  User,
  ShoppingCart
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isPreorder?: boolean;
  category: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Heritage Batik Tote',
    price: 285,
    originalPrice: 350,
    image: '/api/placeholder/400/400',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    category: 'Totes',
    tags: ['heritage', 'handmade', 'sustainable']
  },
  {
    id: '2',
    name: 'Traditional Clutch Premium',
    price: 450,
    image: '/api/placeholder/400/400',
    rating: 4.9,
    reviews: 89,
    isPreorder: true,
    category: 'Clutches',
    tags: ['premium', 'traditional', 'limited']
  },
  {
    id: '3',
    name: 'Cultural Crossbody Bag',
    price: 195,
    image: '/api/placeholder/400/400',
    rating: 4.7,
    reviews: 156,
    category: 'Crossbody',
    tags: ['cultural', 'everyday', 'versatile']
  },
  {
    id: '4',
    name: 'Artisan Shoulder Piece',
    price: 320,
    image: '/api/placeholder/400/400',
    rating: 4.6,
    reviews: 78,
    isNew: true,
    category: 'Shoulder Bags',
    tags: ['artisan', 'shoulder', 'elegant']
  }
];

const mockCategories: Category[] = [
  { id: '1', name: 'Tote Bags', image: '/api/placeholder/300/200', count: 24 },
  { id: '2', name: 'Clutches', image: '/api/placeholder/300/200', count: 18 },
  { id: '3', name: 'Crossbody', image: '/api/placeholder/300/200', count: 32 },
  { id: '4', name: 'Shoulder Bags', image: '/api/placeholder/300/200', count: 15 }
];

const impactMetrics = [
  { icon: Users, label: 'Artisans Supported', value: '127', color: 'text-sage' },
  { icon: Leaf, label: 'Plastic Bags Saved', value: '15,432', color: 'text-gold' },
  { icon: Award, label: 'Traditional Patterns', value: '89', color: 'text-terracotta' }
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Simulate cart count from localStorage
    const savedCart = localStorage.getItem('reweave-cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    }
  }, []);

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('reweave-cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    localStorage.setItem('reweave-cart', JSON.stringify(cart));
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    
    // Show success notification (would integrate with toast system)
    alert(`Added ${product.name} to cart!`);
  };

  const addToWishlist = (productId: string) => {
    const wishlist = JSON.parse(localStorage.getItem('reweave-wishlist') || '[]');
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      localStorage.setItem('reweave-wishlist', JSON.stringify(wishlist));
      alert('Added to wishlist!');
    } else {
      alert('Already in wishlist!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sand/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-display font-bold text-indigo">Reweave</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/shop" className="text-indigo hover:text-sage font-medium transition-colors">Shop</Link>
              <Link to="/story" className="text-indigo hover:text-sage font-medium transition-colors">Our Story</Link>
              <Link to="/culture" className="text-indigo hover:text-sage font-medium transition-colors">Culture</Link>
              <Link to="/impact" className="text-indigo hover:text-sage font-medium transition-colors">Impact</Link>
              <Link to="/journal" className="text-indigo hover:text-sage font-medium transition-colors">Journal</Link>
            </nav>

            {/* Search & User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-indigo hover:text-sage transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Account */}
              <Link to="/account" className="p-2 text-indigo hover:text-sage transition-colors">
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-indigo hover:text-sage transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-indigo hover:text-sage transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="pb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search batik bags, clutches, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pebble" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-sand">
            <div className="px-4 py-2 space-y-1">
              <Link to="/shop" className="block px-3 py-2 text-indigo hover:text-sage font-medium">Shop</Link>
              <Link to="/story" className="block px-3 py-2 text-indigo hover:text-sage font-medium">Our Story</Link>
              <Link to="/culture" className="block px-3 py-2 text-indigo hover:text-sage font-medium">Culture</Link>
              <Link to="/impact" className="block px-3 py-2 text-indigo hover:text-sage font-medium">Impact</Link>
              <Link to="/journal" className="block px-3 py-2 text-indigo hover:text-sage font-medium">Journal</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo to-sage text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  Heritage Crafted • Modern Designed
                </span>
                <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight">
                  Carry Culture,
                  <span className="block text-gold">Create Impact</span>
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  Handcrafted batik bags that preserve tradition, empower artisans, and protect our planet. Every purchase weaves a story of cultural heritage and sustainable fashion.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop" className="btn btn-primary btn-lg">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Collection
                </Link>
                <Link to="/story" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-indigo">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Our Story
                </Link>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                {impactMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                    <div className="text-sm text-white/80">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gold/30 to-terracotta/30 rounded-3xl p-8">
                <div className="w-full h-full bg-sand/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">Featured Collection</h3>
                      <p className="text-white/80">Discover our latest handcrafted pieces</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-indigo mb-4">
              Featured Collection
            </h2>
            <p className="text-xl text-pebble max-w-2xl mx-auto">
              Each piece tells a story of tradition, crafted with care by our artisan partners across Malaysia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-soft hover:shadow-strong transition-all duration-300 overflow-hidden">
                <div className="relative aspect-square bg-sand/20">
                  <div className="w-full h-full bg-gradient-to-br from-sage/10 to-gold/10 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-pebble/50" />
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {product.isNew && (
                      <span className="inline-block px-3 py-1 bg-sage text-white text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    {product.isPreorder && (
                      <span className="inline-block px-3 py-1 bg-gold text-white text-xs font-bold rounded-full">
                        PREORDER
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="inline-block px-3 py-1 bg-terracotta text-white text-xs font-bold rounded-full">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => addToWishlist(product.id)}
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
                    <h3 className="text-lg font-bold text-indigo group-hover:text-sage transition-colors">
                      {product.name}
                    </h3>
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
                      <span className="text-sm text-pebble">({product.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-indigo">
                          RM {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-pebble line-through">
                            RM {product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.originalPrice && (
                        <span className="text-xs text-terracotta font-medium">
                          Save RM {product.originalPrice - product.price}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-primary btn-sm"
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop" className="btn btn-primary btn-lg">
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gradient-to-br from-sand/10 to-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-indigo mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-pebble max-w-2xl mx-auto">
              Discover our collections, each celebrating different aspects of Malaysian batik heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockCategories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-strong transition-all duration-300"
              >
                <div className="aspect-video bg-sand/20">
                  <div className="w-full h-full bg-gradient-to-br from-sage/10 to-gold/10 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-pebble/50" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-indigo/80 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-white/80">{category.count} products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-indigo text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-display font-bold">
                  Every Purchase Creates Impact
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Your choice to carry a Reweave bag supports traditional artisans, reduces environmental waste, and preserves Malaysia's cultural heritage for future generations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-indigo" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Empower Artisans</h3>
                    <p className="text-white/80">Fair wages and sustainable partnerships with local craft communities</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Protect Environment</h3>
                    <p className="text-white/80">Upcycled materials and plastic-free packaging reduce environmental impact</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Preserve Culture</h3>
                    <p className="text-white/80">Traditional batik patterns and techniques passed down through generations</p>
                  </div>
                </div>
              </div>

              <Link to="/impact" className="btn btn-outline text-white border-white hover:bg-white hover:text-indigo">
                Learn More About Our Impact
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <div className="w-full h-full bg-gradient-to-br from-gold/20 to-terracotta/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center">
                      <Heart className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">Impact Dashboard</h3>
                      <p className="text-white/80">Track the difference your purchase makes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-indigo">
                Join the Reweave Community
              </h2>
              <p className="text-xl text-pebble max-w-2xl mx-auto">
                Get early access to new collections, exclusive stories from our artisans, and special member discounts.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                />
                <button className="btn btn-primary">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-pebble mt-3">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-xl font-display font-bold">Reweave</span>
              </Link>
              <p className="text-white/80">
                Preserving Malaysian batik heritage through sustainable fashion that empowers artisans and protects our planet.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Shop</h3>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/shop" className="hover:text-gold transition-colors">All Products</Link></li>
                <li><Link to="/shop?category=tote-bags" className="hover:text-gold transition-colors">Tote Bags</Link></li>
                <li><Link to="/shop?category=clutches" className="hover:text-gold transition-colors">Clutches</Link></li>
                <li><Link to="/shop?category=crossbody" className="hover:text-gold transition-colors">Crossbody</Link></li>
                <li><Link to="/shop?preorder=true" className="hover:text-gold transition-colors">Preorder</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">About</h3>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/story" className="hover:text-gold transition-colors">Our Story</Link></li>
                <li><Link to="/culture" className="hover:text-gold transition-colors">Batik Culture</Link></li>
                <li><Link to="/impact" className="hover:text-gold transition-colors">Our Impact</Link></li>
                <li><Link to="/artisans" className="hover:text-gold transition-colors">Meet Artisans</Link></li>
                <li><Link to="/journal" className="hover:text-gold transition-colors">Journal</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Support</h3>
              <ul className="space-y-2 text-white/80">
                <li><Link to="/account" className="hover:text-gold transition-colors">My Account</Link></li>
                <li><Link to="/account/orders" className="hover:text-gold transition-colors">Order Tracking</Link></li>
                <li><Link to="/account/addresses" className="hover:text-gold transition-colors">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-gold transition-colors">Returns</Link></li>
                <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/80">
            <p>&copy; 2024 Reweave. All rights reserved. | Preserving heritage, one bag at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}