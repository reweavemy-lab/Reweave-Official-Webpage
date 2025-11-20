import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  QrCode, 
  User, 
  Phone, 
  Instagram, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  Clock,
  Download,
  Tag,
  DollarSign,
  CreditCard,
  Scan,
  Store,
  Users,
  BarChart3,
  Camera,
  Zap,
  Receipt,
  Star
} from 'lucide-react';

interface PopupProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  variants: PopupVariant[];
  category: string;
}

interface PopupVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface PopupCustomer {
  name: string;
  phone: string;
  instagram?: string;
  email?: string;
}

interface PopupOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
}

interface PopupOrder {
  id: string;
  items: PopupOrderItem[];
  customer: PopupCustomer;
  total: number;
  paymentMethod: string;
  qrCode?: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
  eventName: string;
}

const mockPopupProducts: PopupProduct[] = [
  {
    id: 'POP-001',
    name: 'Batik Heritage Tote',
    price: 285,
    stock: 15,
    category: 'Totes',
    image: '/api/placeholder/200/200',
    variants: [
      { id: 'VAR-001', name: 'Classic Brown', price: 285, stock: 8, sku: 'BHT-BROWN' },
      { id: 'VAR-002', name: 'Navy Blue', price: 285, stock: 7, sku: 'BHT-NAVY' }
    ]
  },
  {
    id: 'POP-002',
    name: 'Traditional Clutch',
    price: 450,
    stock: 8,
    category: 'Clutches',
    image: '/api/placeholder/200/200',
    variants: [
      { id: 'VAR-003', name: 'Premium Gold', price: 450, stock: 5, sku: 'TC-GOLD' },
      { id: 'VAR-004', name: 'Silver Edition', price: 450, stock: 3, sku: 'TC-SILVER' }
    ]
  },
  {
    id: 'POP-003',
    name: 'Cultural Crossbody',
    price: 195,
    stock: 12,
    category: 'Crossbody',
    image: '/api/placeholder/200/200',
    variants: [
      { id: 'VAR-005', name: 'Earth Tone', price: 195, stock: 7, sku: 'CC-EARTH' },
      { id: 'VAR-006', name: 'Forest Green', price: 195, stock: 5, sku: 'CC-FOREST' }
    ]
  }
];

const paymentMethods = [
  { id: 'touchngo', name: 'Touch n Go', icon: '🏪', color: 'bg-blue-500' },
  { id: 'grabpay', name: 'GrabPay', icon: '🟢', color: 'bg-green-500' },
  { id: 'boost', name: 'Boost', icon: '🟠', color: 'bg-orange-500' },
  { id: 'fpx', name: 'FPX', icon: '🏦', color: 'bg-purple-500' }
];

export default function PopupMode() {
  const [currentView, setCurrentView] = useState<'products' | 'cart' | 'customer' | 'payment' | 'success'>('products');
  const [cartItems, setCartItems] = useState<PopupOrderItem[]>([]);
  const [customer, setCustomer] = useState<PopupCustomer>({ name: '', phone: '', instagram: '' });
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [eventName, setEventName] = useState<string>('Batik Pop-up @ Central Market');
  const [orders, setOrders] = useState<PopupOrder[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [todayStats, setTodayStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProduct: 'Batik Heritage Tote'
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    // Calculate today's stats
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === new Date().toDateString()
    );
    const totalSales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = todayOrders.length > 0 ? totalSales / todayOrders.length : 0;
    
    setTodayStats({
      totalSales,
      totalOrders: todayOrders.length,
      avgOrderValue,
      topProduct: 'Batik Heritage Tote'
    });
  }, [orders]);

  const addToCart = (product: PopupProduct, variant: PopupVariant) => {
    const existingItem = cartItems.find(
      item => item.productId === product.id && item.variantId === variant.id
    );

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.productId === product.id && item.variantId === variant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        price: variant.price,
        quantity: 1,
        image: product.image
      }]);
    }
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.productId === productId && item.variantId === variantId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCartItems(cartItems.filter(item => 
      !(item.productId === productId && item.variantId === variantId)
    ));
  };

  const generateQRCode = async () => {
    setIsProcessing(true);
    // Simulate QR code generation
    setTimeout(() => {
      setQrCode(`PAYMENT-${Date.now()}-RM${totalAmount}`);
      setIsProcessing(false);
    }, 2000);
  };

  const processPayment = async () => {
    if (!selectedPayment || !customer.name || !customer.phone) {
      alert('Please fill in all required fields');
      return;
    }

    await generateQRCode();
    setCurrentView('success');

    // Create order
    const newOrder: PopupOrder = {
      id: `POP-${Date.now()}`,
      items: cartItems,
      customer,
      total: totalAmount,
      paymentMethod: selectedPayment,
      qrCode: `PAYMENT-${Date.now()}-RM${totalAmount}`,
      status: 'paid',
      createdAt: new Date().toISOString(),
      eventName
    };

    setOrders([...orders, newOrder]);
    
    // Auto-deduct inventory (simulate)
    console.log('Auto-deducting inventory...');
    
    // Reset for next order
    setCartItems([]);
    setCustomer({ name: '', phone: '', instagram: '' });
    setSelectedPayment('');
    setQrCode('');
  };

  const exportOrders = (format: 'csv' | 'crm') => {
    const popupOrders = orders.filter(order => order.eventName === eventName);
    
    if (format === 'csv') {
      const csvContent = [
        ['Order ID', 'Customer Name', 'Phone', 'Instagram', 'Total', 'Payment Method', 'Date'],
        ...popupOrders.map(order => [
          order.id,
          order.customer.name,
          order.customer.phone,
          order.customer.instagram || '',
          order.total,
          order.paymentMethod,
          new Date(order.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `popup-orders-${eventName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      // CRM sync simulation
      alert('Syncing to CRM... This would connect to your CRM system');
    }
  };

  if (currentView === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage/10 to-gold/10 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-strong">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-indigo mb-4">Payment Successful!</h2>
          <p className="text-pebble mb-6">Thank you for your purchase at {eventName}</p>
          <div className="bg-sand/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-pebble mb-2">Order Total</p>
            <p className="text-3xl font-bold text-indigo">RM {totalAmount.toFixed(2)}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => setCurrentView('products')}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </button>
            <button 
              onClick={() => setShowExportModal(true)}
              className="w-full btn btn-outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 to-gold/10">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-indigo">Popup Selling Mode</h1>
                <p className="text-sm text-pebble">{eventName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-pebble">Today's Sales</p>
                <p className="text-xl font-bold text-indigo">RM {todayStats.totalSales.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-pebble">Orders</p>
                <p className="text-xl font-bold text-sage">{todayStats.totalOrders}</p>
              </div>
              <button 
                onClick={() => setShowExportModal(true)}
                className="btn btn-outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {currentView === 'products' && (
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-indigo">Select Products</h2>
                  <div className="text-sm text-pebble">
                    Cart: {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPopupProducts.map(product => (
                    <div key={product.id} className="border border-sand rounded-xl p-4 hover:shadow-medium transition-all">
                      <div className="w-full h-32 bg-sand/30 rounded-lg mb-4 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-pebble" />
                      </div>
                      <h3 className="font-bold text-indigo mb-2">{product.name}</h3>
                      <p className="text-sm text-pebble mb-3">RM {product.price}</p>
                      <div className="space-y-2">
                        {product.variants.map(variant => (
                          <div key={variant.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo">{variant.name}</p>
                              <p className="text-xs text-pebble">Stock: {variant.stock}</p>
                            </div>
                            <button
                              onClick={() => addToCart(product, variant)}
                              className="btn btn-primary text-xs"
                              disabled={variant.stock === 0}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setCurrentView('cart')}
                      className="btn btn-primary"
                    >
                      Continue to Cart
                      <ShoppingBag className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {currentView === 'cart' && (
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-indigo">Shopping Cart</h2>
                  <button
                    onClick={() => setCurrentView('products')}
                    className="text-sage hover:text-terracotta font-medium"
                  >
                    ← Back to Products
                  </button>
                </div>
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex items-center space-x-4 p-4 bg-sand/20 rounded-xl">
                      <div className="w-16 h-16 bg-sand/30 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-pebble" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-indigo">{item.productName}</h4>
                        <p className="text-sm text-pebble">{item.variantName}</p>
                        <p className="text-sm font-bold text-sage">RM {item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="w-8 h-8 bg-sand rounded-lg flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-indigo">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-8 h-8 bg-sand rounded-lg flex items-center justify-center hover:bg-sage hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-sand pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-indigo">Total:</span>
                    <span className="text-2xl font-bold text-sage">RM {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentView('products')}
                      className="flex-1 btn btn-outline"
                    >
                      Add More Items
                    </button>
                    <button
                      onClick={() => setCurrentView('customer')}
                      className="flex-1 btn btn-primary"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Info */}
            {currentView === 'customer' && (
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-indigo">Customer Information</h2>
                  <button
                    onClick={() => setCurrentView('cart')}
                    className="text-sage hover:text-terracotta font-medium"
                  >
                    ← Back to Cart
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                      placeholder="+60 12-345 6789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo mb-2">
                      <Instagram className="w-4 h-4 inline mr-2" />
                      Instagram (Optional)
                    </label>
                    <input
                      type="text"
                      value={customer.instagram}
                      onChange={(e) => setCustomer({ ...customer, instagram: e.target.value })}
                      className="w-full px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                      placeholder="@username"
                    />
                  </div>
                  <div className="bg-sage/10 rounded-xl p-4">
                    <p className="text-sm text-sage font-medium mb-2">💡 Popup Customer Benefits</p>
                    <ul className="text-sm text-pebble space-y-1">
                      <li>• Automatic loyalty points registration</li>
                      <li>• Exclusive popup event notifications</li>
                      <li>• Early access to new collections</li>
                      <li>• Special discount codes for future events</li>
                    </ul>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setCurrentView('cart')}
                    className="flex-1 btn btn-outline"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={() => setCurrentView('payment')}
                    className="flex-1 btn btn-primary"
                    disabled={!customer.name || !customer.phone}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment */}
            {currentView === 'payment' && (
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-indigo">Payment Method</h2>
                  <button
                    onClick={() => setCurrentView('customer')}
                    className="text-sage hover:text-terracotta font-medium"
                  >
                    ← Back to Customer
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-pebble mb-4">Choose your payment method:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedPayment === method.id
                            ? 'border-sage bg-sage/10'
                            : 'border-sand hover:border-sage'
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <p className="text-sm font-medium text-indigo">{method.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {selectedPayment && (
                  <div className="bg-sand/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-indigo">Total Amount:</span>
                      <span className="text-2xl font-bold text-sage">RM {totalAmount.toFixed(2)}</span>
                    </div>
                    {qrCode ? (
                      <div className="text-center">
                        <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-indigo" />
                        </div>
                        <p className="text-sm text-pebble">Scan to pay with {paymentMethods.find(m => m.id === selectedPayment)?.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Scan className="w-16 h-16 text-sage mx-auto mb-4" />
                        <p className="text-sm text-pebble">QR Code will be generated for payment</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentView('customer')}
                    className="flex-1 btn btn-outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={!selectedPayment || isProcessing}
                    className="flex-1 btn btn-primary"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Generate QR & Complete
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="text-lg font-display font-bold text-indigo mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-indigo">{item.productName}</p>
                      <p className="text-pebble">{item.variantName} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sage">RM {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-sand pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-indigo">Total</span>
                  <span className="text-xl font-bold text-sage">RM {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="text-lg font-display font-bold text-indigo mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCartItems([])}
                  className="w-full btn btn-outline"
                  disabled={cartItems.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full btn btn-outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Orders
                </button>
                <button
                  onClick={() => alert('Camera mode would open for quick product scanning')}
                  className="w-full btn btn-outline"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Product
                </button>
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="text-lg font-display font-bold text-indigo mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-pebble">Total Sales</span>
                  <span className="font-bold text-indigo">RM {todayStats.totalSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pebble">Orders</span>
                  <span className="font-bold text-sage">{todayStats.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pebble">Avg. Order</span>
                  <span className="font-bold text-gold">RM {todayStats.avgOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pebble">Top Product</span>
                  <span className="font-bold text-terracotta text-sm">{todayStats.topProduct}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-display font-bold text-indigo mb-4">Export Popup Orders</h3>
            <p className="text-pebble mb-6">Choose export format for {eventName} orders</p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  exportOrders('csv');
                  setShowExportModal(false);
                }}
                className="w-full btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </button>
              <button
                onClick={() => {
                  exportOrders('crm');
                  setShowExportModal(false);
                }}
                className="w-full btn btn-outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Sync to CRM
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full text-pebble hover:text-indigo"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}