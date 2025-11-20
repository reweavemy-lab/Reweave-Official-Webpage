import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Package, 
  Star, 
  Gift, 
  Settings, 
  LogOut,
  ChevronRight,
  Calendar,
  Truck,
  CreditCard,
  Edit,
  Plus,
  Trash2,
  Eye,
  Download
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  totalOrders: number;
  totalSpent: number;
  memberSince: string;
  isVerified: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  isPreorder: boolean;
  inStock: boolean;
  addedAt: string;
}

interface Address {
  id: string;
  type: 'billing' | 'shipping';
  isDefault: boolean;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  description: string;
  createdAt: string;
}

const mockUserProfile: UserProfile = {
  id: 'user-123',
  firstName: 'Sarah',
  lastName: 'Lim',
  email: 'sarah.lim@email.com',
  phone: '+60 12-345 6789',
  loyaltyPoints: 2850,
  loyaltyTier: 'gold',
  totalOrders: 12,
  totalSpent: 3420,
  memberSince: '2023-06-15',
  isVerified: true
};

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-2024-001',
    status: 'delivered',
    paymentStatus: 'paid',
    totalAmount: 285,
    itemCount: 1,
    createdAt: '2024-01-10',
    estimatedDelivery: '2024-01-15',
    trackingNumber: 'TRK123456789',
    items: [
      {
        id: 'item-001',
        name: 'Heritage Batik Tote',
        variant: 'Navy Blue',
        price: 285,
        quantity: 1,
        image: '/api/placeholder/100/100'
      }
    ]
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-2024-002',
    status: 'shipped',
    paymentStatus: 'paid',
    totalAmount: 450,
    itemCount: 1,
    createdAt: '2024-01-05',
    estimatedDelivery: '2024-01-20',
    trackingNumber: 'TRK987654321',
    items: [
      {
        id: 'item-002',
        name: 'Traditional Clutch Premium',
        variant: 'Gold on Black',
        price: 450,
        quantity: 1,
        image: '/api/placeholder/100/100'
      }
    ]
  }
];

const mockWishlist: WishlistItem[] = [
  {
    id: 'wish-001',
    productId: 'prod-003',
    name: 'Cultural Crossbody Bag',
    price: 195,
    image: '/api/placeholder/100/100',
    isPreorder: false,
    inStock: true,
    addedAt: '2024-01-08'
  },
  {
    id: 'wish-002',
    productId: 'prod-004',
    name: 'Artisan Shoulder Piece',
    price: 320,
    image: '/api/placeholder/100/100',
    isPreorder: false,
    inStock: false,
    addedAt: '2024-01-03'
  }
];

const mockAddresses: Address[] = [
  {
    id: 'addr-001',
    type: 'shipping',
    isDefault: true,
    recipientName: 'Sarah Lim',
    phone: '+60 12-345 6789',
    addressLine1: '123 Jalan Batik',
    addressLine2: 'Apt 15B',
    city: 'Kuala Lumpur',
    state: 'Wilayah Persekutuan',
    postalCode: '50000',
    country: 'Malaysia'
  },
  {
    id: 'addr-002',
    type: 'billing',
    isDefault: false,
    recipientName: 'Sarah Lim',
    phone: '+60 12-345 6789',
    addressLine1: '456 Jalan Heritage',
    city: 'Petaling Jaya',
    state: 'Selangor',
    postalCode: '46000',
    country: 'Malaysia'
  }
];

const mockLoyaltyTransactions: LoyaltyTransaction[] = [
  {
    id: 'loy-001',
    points: 285,
    type: 'earned',
    description: 'Purchase - Heritage Batik Tote',
    createdAt: '2024-01-10'
  },
  {
    id: 'loy-002',
    points: 450,
    type: 'earned',
    description: 'Purchase - Traditional Clutch Premium',
    createdAt: '2024-01-05'
  }
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses' | 'loyalty' | 'settings'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(mockWishlist);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>(mockLoyaltyTransactions);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-indigo-600 bg-indigo-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-gray-300';
      case 'diamond': return 'text-blue-300';
      default: return 'text-gray-600';
    }
  };

  const addToCart = (productId: string) => {
    // Add to cart logic
    alert('Added to cart!');
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlist(wishlist.filter(item => item.id !== itemId));
    alert('Removed from wishlist!');
  };

  const setDefaultAddress = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    alert('Default address updated!');
  };

  const deleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      alert('Address deleted!');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'loyalty', name: 'Loyalty Points', icon: Star },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sand/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-display font-bold text-indigo">Reweave</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/shop" className="text-indigo hover:text-sage font-medium">Shop</Link>
              <Link to="/cart" className="text-indigo hover:text-sage font-medium">Cart</Link>
              <button className="text-indigo hover:text-sage">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              {/* User Profile Card */}
              <div className="mb-6 p-4 bg-gradient-to-br from-sage/10 to-gold/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-sage rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-indigo truncate">
                      {userProfile.firstName} {userProfile.lastName}
                    </p>
                    <p className="text-xs text-pebble truncate">{userProfile.email}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className={`w-3 h-3 ${getLoyaltyTierColor(userProfile.loyaltyTier)}`} />
                      <span className="text-xs font-medium capitalize text-indigo">
                        {userProfile.loyaltyTier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-sage text-white'
                          : 'text-indigo hover:bg-sand/20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="text-2xl font-display font-bold text-indigo mb-6">Account Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-sage/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pebble text-sm">Loyalty Points</p>
                          <p className="text-2xl font-bold text-indigo">{userProfile.loyaltyPoints.toLocaleString()}</p>
                        </div>
                        <Star className={`w-8 h-8 ${getLoyaltyTierColor(userProfile.loyaltyTier)}`} />
                      </div>
                    </div>
                    
                    <div className="bg-gold/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pebble text-sm">Total Orders</p>
                          <p className="text-2xl font-bold text-indigo">{userProfile.totalOrders}</p>
                        </div>
                        <Package className="w-8 h-8 text-gold" />
                      </div>
                    </div>
                    
                    <div className="bg-terracotta/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pebble text-sm">Total Spent</p>
                          <p className="text-2xl font-bold text-indigo">RM {userProfile.totalSpent.toLocaleString()}</p>
                        </div>
                        <Gift className="w-8 h-8 text-terracotta" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pebble text-sm">Member Since</p>
                          <p className="text-lg font-bold text-indigo">
                            {new Date(userProfile.memberSince).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <Calendar className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-indigo">Recent Orders</h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-sage hover:text-sage/80 font-medium text-sm"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="border border-sand rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-bold text-indigo">{order.orderNumber}</p>
                              <p className="text-sm text-pebble">{new Date(order.createdAt).toLocaleDateString('en-MY')}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-pebble">{order.itemCount} items</p>
                            <p className="font-bold text-indigo">RM {order.totalAmount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Wishlist Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-indigo">Wishlist</h3>
                      <button
                        onClick={() => setActiveTab('wishlist')}
                        className="text-sage hover:text-sage/80 font-medium text-sm"
                      >
                        View All ({wishlist.length})
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.slice(0, 3).map(item => (
                        <div key={item.id} className="border border-sand rounded-xl p-4">
                          <div className="aspect-square bg-sand/20 rounded-lg mb-3 flex items-center justify-center">
                            <Package className="w-8 h-8 text-pebble/50" />
                          </div>
                          <h4 className="font-medium text-indigo mb-1">{item.name}</h4>
                          <p className="text-sm text-pebble mb-3">RM {item.price}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => addToCart(item.productId)}
                              disabled={!item.inStock}
                              className={`flex-1 btn btn-sm ${!item.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="text-2xl font-display font-bold text-indigo mb-6">Order History</h2>
                  
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order.id} className="border border-sand rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-indigo text-lg">{order.orderNumber}</h3>
                            <p className="text-sm text-pebble">Placed on {new Date(order.createdAt).toLocaleDateString('en-MY')}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="font-bold text-indigo mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {order.items.map(item => (
                                <div key={item.id} className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-sand/20 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-pebble/50" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-indigo">{item.name}</p>
                                    <p className="text-sm text-pebble">{item.variant}</p>
                                    <p className="text-sm font-bold text-indigo">RM {item.price} x {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-indigo mb-3">Order Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-pebble">Payment Status:</span>
                                <span className={`font-medium ${
                                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-pebble">Total Amount:</span>
                                <span className="font-bold text-indigo">RM {order.totalAmount}</span>
                              </div>
                              {order.estimatedDelivery && (
                                <div className="flex justify-between">
                                  <span className="text-pebble">Est. Delivery:</span>
                                  <span className="font-medium text-indigo">{new Date(order.estimatedDelivery).toLocaleDateString('en-MY')}</span>
                                </div>
                              )}
                              {order.trackingNumber && (
                                <div className="flex justify-between">
                                  <span className="text-pebble">Tracking:</span>
                                  <span className="font-medium text-indigo">{order.trackingNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button className="btn btn-outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                          {order.trackingNumber && (
                            <button className="btn btn-primary">
                              <Truck className="w-4 h-4 mr-2" />
                              Track Order
                            </button>
                          )}
                          <button className="btn btn-outline">
                            <Download className="w-4 h-4 mr-2" />
                            Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-indigo">My Wishlist</h2>
                    <p className="text-pebble">{wishlist.length} items</p>
                  </div>
                  
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-pebble mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-indigo mb-2">Your wishlist is empty</h3>
                      <p className="text-pebble mb-6">Start adding products you love to your wishlist!</p>
                      <Link to="/shop" className="btn btn-primary">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map(item => (
                        <div key={item.id} className="border border-sand rounded-xl p-4">
                          <div className="aspect-square bg-sand/20 rounded-lg mb-4 flex items-center justify-center">
                            <Package className="w-12 h-12 text-pebble/50" />
                          </div>
                          <h4 className="font-bold text-indigo mb-2">{item.name}</h4>
                          <p className="text-lg font-bold text-indigo mb-3">RM {item.price}</p>
                          
                          {item.isPreorder && (
                            <div className="text-sm text-gold font-medium mb-3">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Available for Preorder
                            </div>
                          )}
                          
                          {!item.inStock && (
                            <div className="text-sm text-red-500 font-medium mb-3">
                              Currently Out of Stock
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => addToCart(item.productId)}
                              disabled={!item.inStock}
                              className={`flex-1 btn btn-sm ${!item.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="btn btn-outline btn-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-indigo">My Addresses</h2>
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {addresses.map(address => (
                      <div key={address.id} className={`border rounded-xl p-6 ${
                        address.isDefault ? 'border-sage bg-sage/5' : 'border-sand'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              address.type === 'shipping' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                            </span>
                            {address.isDefault && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-sage text-white">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingAddress(address)}
                              className="p-2 text-pebble hover:text-indigo rounded-lg hover:bg-sand/20"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAddress(address.id)}
                              className="p-2 text-pebble hover:text-red-500 rounded-lg hover:bg-sand/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p className="font-bold text-indigo">{address.recipientName}</p>
                          <p className="text-indigo">{address.phone}</p>
                          <p className="text-indigo">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-indigo">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-indigo">{address.country}</p>
                        </div>
                        
                        {!address.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(address.id)}
                            className="mt-4 w-full btn btn-outline text-sm"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="text-2xl font-display font-bold text-indigo mb-6">Loyalty Program</h2>
                  
                  {/* Current Tier */}
                  <div className="bg-gradient-to-r from-sage/10 to-gold/10 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-indigo mb-2">Current Tier: {userProfile.loyaltyTier.charAt(0).toUpperCase() + userProfile.loyaltyTier.slice(1)}</h3>
                        <p className="text-pebble mb-4">You have {userProfile.loyaltyPoints.toLocaleString()} points</p>
                        <div className="w-full bg-white/50 rounded-full h-2">
                          <div className="bg-sage h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <p className="text-sm text-pebble mt-2">350 points to next tier</p>
                      </div>
                      <div className="text-right">
                        <Star className={`w-12 h-12 ${getLoyaltyTierColor(userProfile.loyaltyTier)}`} />
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-indigo mb-4">Your Benefits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-sand rounded-xl p-4">
                        <h4 className="font-bold text-indigo mb-2">Early Access</h4>
                        <p className="text-sm text-pebble">Get early access to new collections and limited editions</p>
                      </div>
                      <div className="border border-sand rounded-xl p-4">
                        <h4 className="font-bold text-indigo mb-2">Birthday Bonus</h4>
                        <p className="text-sm text-pebble">Special birthday discount and bonus points</p>
                      </div>
                      <div className="border border-sand rounded-xl p-4">
                        <h4 className="font-bold text-indigo mb-2">Free Shipping</h4>
                        <p className="text-sm text-pebble">Free shipping on orders over RM200</p>
                      </div>
                      <div className="border border-sand rounded-xl p-4">
                        <h4 className="font-bold text-indigo mb-2">Exclusive Events</h4>
                        <p className="text-sm text-pebble">Invitations to exclusive artisan events</p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div>
                    <h3 className="text-lg font-bold text-indigo mb-4">Points History</h3>
                    <div className="space-y-3">
                      {loyaltyTransactions.map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between border border-sand rounded-xl p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'earned' ? 'bg-green-100 text-green-600' :
                              transaction.type === 'redeemed' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <Star className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-indigo">{transaction.description}</p>
                              <p className="text-sm text-pebble">{new Date(transaction.createdAt).toLocaleDateString('en-MY')}</p>
                            </div>
                          </div>
                          <div className={`font-bold ${
                            transaction.type === 'earned' ? 'text-green-600' :
                            transaction.type === 'redeemed' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {transaction.type === 'earned' ? '+' : transaction.type === 'redeemed' ? '-' : ''}
                            {transaction.points} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h2 className="text-2xl font-display font-bold text-indigo mb-6">Account Settings</h2>
                  
                  {/* Profile Settings */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-indigo">Profile Information</h3>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="btn btn-outline text-sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-indigo mb-2">First Name</label>
                        <input
                          type="text"
                          value={userProfile.firstName}
                          disabled={!isEditingProfile}
                          className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage disabled:bg-sand/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo mb-2">Last Name</label>
                        <input
                          type="text"
                          value={userProfile.lastName}
                          disabled={!isEditingProfile}
                          className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage disabled:bg-sand/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo mb-2">Email</label>
                        <input
                          type="email"
                          value={userProfile.email}
                          disabled={!isEditingProfile}
                          className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage disabled:bg-sand/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo mb-2">Phone</label>
                        <input
                          type="tel"
                          value={userProfile.phone}
                          disabled={!isEditingProfile}
                          className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage disabled:bg-sand/20"
                        />
                      </div>
                    </div>
                    
                    {isEditingProfile && (
                      <div className="flex space-x-3 mt-4">
                        <button className="btn btn-primary">Save Changes</button>
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Security Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-indigo mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-sand rounded-xl">
                        <div>
                          <p className="font-medium text-indigo">Change Password</p>
                          <p className="text-sm text-pebble">Update your account password</p>
                        </div>
                        <button className="btn btn-outline text-sm">Change</button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-sand rounded-xl">
                        <div>
                          <p className="font-medium text-indigo">Two-Factor Authentication</p>
                          <p className="text-sm text-pebble">Add an extra layer of security</p>
                        </div>
                        <button className="btn btn-outline text-sm">Enable</button>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-bold text-indigo mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-sand rounded-xl">
                        <div>
                          <p className="font-medium text-indigo">Order Updates</p>
                          <p className="text-sm text-pebble">Receive notifications about your orders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-sand peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sage/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-sand rounded-xl">
                        <div>
                          <p className="font-medium text-indigo">Marketing Emails</p>
                          <p className="text-sm text-pebble">Receive updates about new products and promotions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-sand peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sage/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}