import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Star, 
  Eye, 
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Leaf,
  Globe,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Truck
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  avgOrderValue: number;
  conversionRate: number;
  customerRetention: number;
  inventoryTurnover: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: number;
}

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
  image: string;
  category: string;
}

interface ImpactMetrics {
  artisansSupported: number;
  plasticBagsSaved: number;
  culturalPatterns: number;
  sustainabilityScore: number;
  communityImpact: number;
  environmentalImpact: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

const mockStats: DashboardStats = {
  totalRevenue: 284750,
  totalOrders: 1247,
  totalCustomers: 892,
  totalProducts: 48,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  productsGrowth: 6.7,
  avgOrderValue: 228,
  conversionRate: 3.4,
  customerRetention: 68.5,
  inventoryTurnover: 4.2
};

const mockRecentOrders: RecentOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'Sarah Lim',
    totalAmount: 285,
    status: 'delivered',
    createdAt: '2024-01-15',
    items: 2
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Ahmad Hassan',
    totalAmount: 450,
    status: 'shipped',
    createdAt: '2024-01-14',
    items: 1
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: 'Mei Chen',
    totalAmount: 195,
    status: 'processing',
    createdAt: '2024-01-13',
    items: 3
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: 'Raj Kumar',
    totalAmount: 320,
    status: 'confirmed',
    createdAt: '2024-01-12',
    items: 1
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerName: 'Lisa Wong',
    totalAmount: 175,
    status: 'pending',
    createdAt: '2024-01-11',
    items: 2
  }
];

const mockTopProducts: TopProduct[] = [
  {
    id: '1',
    name: 'Heritage Batik Tote',
    revenue: 45600,
    unitsSold: 160,
    image: '/api/placeholder/100/100',
    category: 'Tote Bags'
  },
  {
    id: '2',
    name: 'Traditional Clutch Premium',
    revenue: 38250,
    unitsSold: 85,
    image: '/api/placeholder/100/100',
    category: 'Clutches'
  },
  {
    id: '3',
    name: 'Cultural Crossbody Bag',
    revenue: 33150,
    unitsSold: 170,
    image: '/api/placeholder/100/100',
    category: 'Crossbody'
  },
  {
    id: '4',
    name: 'Artisan Shoulder Piece',
    revenue: 28800,
    unitsSold: 90,
    image: '/api/placeholder/100/100',
    category: 'Shoulder Bags'
  }
];

const mockImpactMetrics: ImpactMetrics = {
  artisansSupported: 127,
  plasticBagsSaved: 15432,
  culturalPatterns: 89,
  sustainabilityScore: 8.7,
  communityImpact: 9.2,
  environmentalImpact: 8.5
};

const mockRevenueChart: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Revenue (RM)',
      data: [18500, 22100, 25800, 24200, 28900, 31200, 33500, 29800, 27600, 32100, 35400, 38200],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    }
  ]
};

const mockCategoryChart: ChartData = {
  labels: ['Tote Bags', 'Clutches', 'Crossbody', 'Shoulder Bags', 'Accessories'],
  datasets: [
    {
      label: 'Sales by Category',
      data: [35, 25, 20, 15, 5],
      backgroundColor: '#10B981'
    }
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(mockRecentOrders);
  const [topProducts, setTopProducts] = useState<TopProduct[]>(mockTopProducts);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics>(mockImpactMetrics);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const exportData = () => {
    // Simulate data export
    alert('Dashboard data exported successfully!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-indigo-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 
      <ArrowUp className="w-4 h-4 text-green-500" /> : 
      <ArrowDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sand/20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-indigo">Admin Command Center</h1>
              <p className="text-pebble mt-1">Comprehensive business intelligence and management dashboard</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-pebble">Last updated:</span>
                <span className="text-sm font-medium text-indigo">
                  {lastUpdated.toLocaleTimeString('en-MY')}
                </span>
              </div>
              
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="btn btn-outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={exportData}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-pebble" />
            <div className="flex bg-sand/20 rounded-xl p-1">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-white text-indigo shadow-medium'
                      : 'text-pebble hover:text-indigo'
                  }`}
                >
                  {range === '7d' ? '7 Days' : 
                   range === '30d' ? '30 Days' : 
                   range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(stats.revenueGrowth)}
                <span className={`text-sm font-medium ${
                  stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stats.revenueGrowth)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-pebble mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-indigo">RM {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(stats.ordersGrowth)}
                <span className={`text-sm font-medium ${
                  stats.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stats.ordersGrowth)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-pebble mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-indigo">{stats.totalOrders.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(stats.customersGrowth)}
                <span className={`text-sm font-medium ${
                  stats.customersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stats.customersGrowth)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-pebble mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-indigo">{stats.totalCustomers.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(stats.productsGrowth)}
                <span className={`text-sm font-medium ${
                  stats.productsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stats.productsGrowth)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-pebble mb-1">Total Products</p>
              <p className="text-2xl font-bold text-indigo">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo">Average Order Value</h3>
              <BarChart3 className="w-5 h-5 text-pebble" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-pebble">Current AOV</span>
                <span className="font-bold text-indigo">RM {stats.avgOrderValue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-pebble">Industry Average</span>
                <span className="font-medium text-pebble">RM 195</span>
              </div>
              <div className="w-full bg-sand/20 rounded-full h-2">
                <div 
                  className="bg-sage h-2 rounded-full" 
                  style={{ width: `${(stats.avgOrderValue / 250) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo">Conversion Rate</h3>
              <Target className="w-5 h-5 text-pebble" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-pebble">Current Rate</span>
                <span className="font-bold text-indigo">{stats.conversionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-pebble">Industry Average</span>
                <span className="font-medium text-pebble">2.8%</span>
              </div>
              <div className="w-full bg-sand/20 rounded-full h-2">
                <div 
                  className="bg-gold h-2 rounded-full" 
                  style={{ width: `${(stats.conversionRate / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo">Customer Retention</h3>
              <Award className="w-5 h-5 text-pebble" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-pebble">Retention Rate</span>
                <span className="font-bold text-indigo">{stats.customerRetention}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-pebble">Repeat Customers</span>
                <span className="font-medium text-pebble">612</span>
              </div>
              <div className="w-full bg-sand/20 rounded-full h-2">
                <div 
                  className="bg-terracotta h-2 rounded-full" 
                  style={{ width: `${stats.customerRetention}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-indigo">Revenue Trend</h3>
              <Activity className="w-5 h-5 text-pebble" />
            </div>
            <div className="h-64 bg-gradient-to-br from-sage/10 to-gold/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-pebble/50 mx-auto mb-2" />
                <p className="text-sm text-pebble">Revenue chart visualization</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-indigo">Sales by Category</h3>
              <PieChart className="w-5 h-5 text-pebble" />
            </div>
            <div className="h-64 bg-gradient-to-br from-terracotta/10 to-purple-500/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-pebble/50 mx-auto mb-2" />
                <p className="text-sm text-pebble">Category distribution chart</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-indigo">Recent Orders</h3>
              <Link to="/admin/orders" className="text-sage hover:text-sage/80 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-sand rounded-xl hover:bg-sand/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-indigo">{order.orderNumber}</p>
                      <p className="text-sm text-pebble">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo">RM {order.totalAmount}</p>
                    <p className="text-xs text-pebble">{order.items} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-indigo">Top Products</h3>
              <Link to="/admin/products" className="text-sage hover:text-sage/80 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-3 p-4 border border-sand rounded-xl hover:bg-sand/20 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-sage/20 to-gold/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-indigo">{product.name}</p>
                    <p className="text-sm text-pebble">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo">RM {product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-pebble">{product.unitsSold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-indigo">Impact Dashboard</h3>
            <Link to="/admin/impact" className="text-sage hover:text-sage/80 text-sm font-medium">
              View Impact Report
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-indigo mb-1">{impactMetrics.artisansSupported}</p>
              <p className="text-sm text-pebble">Artisans Supported</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-indigo mb-1">{impactMetrics.plasticBagsSaved.toLocaleString()}</p>
              <p className="text-sm text-pebble">Plastic Bags Saved</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-indigo mb-1">{impactMetrics.culturalPatterns}</p>
              <p className="text-sm text-pebble">Cultural Patterns Preserved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Environmental Impact</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{impactMetrics.environmentalImpact}/10</div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${impactMetrics.environmentalImpact * 10}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Community Impact</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{impactMetrics.communityImpact}/10</div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${impactMetrics.communityImpact * 10}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Sustainability Score</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">{impactMetrics.sustainabilityScore}/10</div>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${impactMetrics.sustainabilityScore * 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}