import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  Gift,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  MessageSquare,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Upload
} from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  registrationDate: string;
  lastActivityDate: string;
  status: 'active' | 'inactive' | 'blocked';
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lifetimeValue: number;
  customerLifetime: number;
  tags: string[];
  segments: string[];
  preferredCategories: string[];
  preferredPaymentMethods: string[];
  shippingAddresses: Address[];
  lastOrderDate?: string;
  lastOrderAmount?: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  marketingConsent: boolean;
  smsConsent: boolean;
  preferredCommunication: 'email' | 'sms' | 'both';
  notes?: string;
  customFields?: Record<string, any>;
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

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  customerCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  createdAt: string;
  isActive: boolean;
}

interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  churnRate: number;
  averageLifetimeValue: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  customerAcquisitionCost: number;
  totalRevenue: number;
  revenueGrowth: number;
  topSegments: CustomerSegment[];
  loyaltyDistribution: Record<string, number>;
  customerJourneyStages: Record<string, number>;
}

interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'call' | 'chat' | 'order' | 'review' | 'complaint';
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  status: 'pending' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  tags: string[];
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    firstName: 'Sarah',
    lastName: 'Lim',
    email: 'sarah.lim@email.com',
    phone: '+60 12-345 6789',
    registrationDate: '2023-06-15',
    lastActivityDate: '2024-01-15',
    status: 'active',
    loyaltyTier: 'gold',
    loyaltyPoints: 2850,
    totalOrders: 12,
    totalSpent: 3420,
    averageOrderValue: 285,
    lifetimeValue: 3420,
    customerLifetime: 214,
    tags: ['loyal', 'high-value', 'early-adopter'],
    segments: ['VIP Customers', 'High Spenders'],
    preferredCategories: ['Tote Bags', 'Clutches'],
    preferredPaymentMethods: ['Credit Card', 'FPX'],
    shippingAddresses: [
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
      }
    ],
    lastOrderDate: '2024-01-10',
    lastOrderAmount: 285,
    emailVerified: true,
    phoneVerified: true,
    marketingConsent: true,
    smsConsent: true,
    preferredCommunication: 'both'
  },
  {
    id: 'cust-002',
    firstName: 'Ahmad',
    lastName: 'Hassan',
    email: 'ahmad.hassan@email.com',
    phone: '+60 13-987 6543',
    registrationDate: '2023-08-22',
    lastActivityDate: '2024-01-14',
    status: 'active',
    loyaltyTier: 'silver',
    loyaltyPoints: 1240,
    totalOrders: 8,
    totalSpent: 2100,
    averageOrderValue: 262.5,
    lifetimeValue: 2100,
    customerLifetime: 146,
    tags: ['regular', 'bargain-hunter'],
    segments: ['Regular Customers', 'Price Sensitive'],
    preferredCategories: ['Crossbody Bags', 'Shoulder Bags'],
    preferredPaymentMethods: ['Bank Transfer', 'E-Wallet'],
    shippingAddresses: [
      {
        id: 'addr-002',
        type: 'shipping',
        isDefault: true,
        recipientName: 'Ahmad Hassan',
        phone: '+60 13-987 6543',
        addressLine1: '456 Jalan Heritage',
        city: 'Petaling Jaya',
        state: 'Selangor',
        postalCode: '46000',
        country: 'Malaysia'
      }
    ],
    lastOrderDate: '2024-01-05',
    lastOrderAmount: 450,
    emailVerified: true,
    phoneVerified: false,
    marketingConsent: true,
    smsConsent: false,
    preferredCommunication: 'email'
  }
];

const mockCustomerSegments: CustomerSegment[] = [
  {
    id: 'seg-001',
    name: 'VIP Customers',
    description: 'High-value customers with lifetime value > RM3000',
    criteria: { lifetime_value: { min: 3000 } },
    customerCount: 45,
    totalRevenue: 180000,
    averageOrderValue: 450,
    createdAt: '2023-01-01',
    isActive: true
  },
  {
    id: 'seg-002',
    name: 'Loyal Customers',
    description: 'Customers with 5+ orders and active in last 90 days',
    criteria: { total_orders: { min: 5 }, last_activity_days: { max: 90 } },
    customerCount: 156,
    totalRevenue: 420000,
    averageOrderValue: 320,
    createdAt: '2023-02-01',
    isActive: true
  },
  {
    id: 'seg-003',
    name: 'At Risk',
    description: 'Customers who haven\'t ordered in 90+ days',
    criteria: { last_order_days: { min: 90 }, status: 'active' },
    customerCount: 89,
    totalRevenue: 89000,
    averageOrderValue: 180,
    createdAt: '2023-03-01',
    isActive: true
  }
];

const mockCustomerAnalytics: CustomerAnalytics = {
  totalCustomers: 892,
  activeCustomers: 678,
  newCustomersThisMonth: 45,
  churnRate: 12.5,
  averageLifetimeValue: 1250,
  averageOrderValue: 228,
  customerRetentionRate: 68.5,
  customerAcquisitionCost: 45,
  totalRevenue: 1247000,
  revenueGrowth: 15.2,
  topSegments: mockCustomerSegments.slice(0, 3),
  loyaltyDistribution: {
    bronze: 450,
    silver: 280,
    gold: 120,
    platinum: 35,
    diamond: 7
  },
  customerJourneyStages: {
    awareness: 1200,
    consideration: 450,
    purchase: 892,
    retention: 678,
    advocacy: 234
  }
};

export default function CustomerManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'segments' | 'analytics' | 'communications'>('overview');
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>(mockCustomerSegments);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics>(mockCustomerAnalytics);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-100';
      case 'silver': return 'text-gray-400 bg-gray-100';
      case 'gold': return 'text-yellow-500 bg-yellow-100';
      case 'platinum': return 'text-gray-300 bg-gray-200';
      case 'diamond': return 'text-blue-300 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesTier = tierFilter === 'all' || customer.loyaltyTier === tierFilter;
    const matchesSegment = segmentFilter === 'all' || customer.segments.includes(segmentFilter);
    
    return matchesSearch && matchesStatus && matchesTier && matchesSegment;
  });

  const handleExportCustomers = () => {
    // Simulate export
    alert('Customer data exported successfully!');
  };

  const handleSendCommunication = (customer: Customer, type: 'email' | 'sms') => {
    alert(`Sending ${type} to ${customer.firstName} ${customer.lastName}`);
  };

  const handleCreateSegment = () => {
    setSelectedSegment(null);
    setShowSegmentModal(true);
  };

  const handleEditSegment = (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setShowSegmentModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sand/20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-indigo">Customer Management</h1>
              <p className="text-pebble mt-1">Comprehensive customer relationship and segmentation management</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateSegment}
                className="btn btn-primary"
              >
                <Target className="w-4 h-4 mr-2" />
                New Segment
              </button>
              
              <button
                onClick={handleExportCustomers}
                className="btn btn-outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex bg-sand/20 rounded-xl p-1">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'customers', name: 'Customers', icon: Users },
              { id: 'segments', name: 'Segments', icon: Target },
              { id: 'analytics', name: 'Analytics', icon: PieChart },
              { id: 'communications', name: 'Communications', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo shadow-medium'
                      : 'text-pebble hover:text-indigo'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-indigo">{customerAnalytics.totalCustomers.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">{customerAnalytics.activeCustomers}</span>
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Active Customers</p>
                  <p className="text-2xl font-bold text-indigo">{customerAnalytics.activeCustomers.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Avg Lifetime Value</p>
                  <p className="text-2xl font-bold text-indigo">RM {customerAnalytics.averageLifetimeValue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-yellow-600">+{customerAnalytics.revenueGrowth}%</span>
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Revenue Growth</p>
                  <p className="text-2xl font-bold text-indigo">RM {customerAnalytics.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Customer Journey & Loyalty Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-bold text-indigo mb-4">Customer Journey Stages</h3>
                <div className="space-y-4">
                  {Object.entries(customerAnalytics.customerJourneyStages).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo capitalize">{stage}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-sand/20 rounded-full h-2">
                          <div 
                            className="bg-sage h-2 rounded-full" 
                            style={{ width: `${(count / customerAnalytics.totalCustomers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-indigo">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-bold text-indigo mb-4">Loyalty Tier Distribution</h3>
                <div className="space-y-4">
                  {Object.entries(customerAnalytics.loyaltyDistribution).map(([tier, count]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className={`w-4 h-4 ${getLoyaltyTierColor(tier)}`} />
                        <span className="text-sm font-medium text-indigo capitalize">{tier}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-sand/20 rounded-full h-2">
                          <div 
                            className="bg-gold h-2 rounded-full" 
                            style={{ width: `${(count / customerAnalytics.totalCustomers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-indigo">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pebble" />
                  <input
                    type="text"
                    placeholder="Search customers by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
                
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                >
                  <option value="all">All Tiers</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="diamond">Diamond</option>
                </select>
                
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                >
                  <option value="all">All Segments</option>
                  {customerSegments.map(segment => (
                    <option key={segment.id} value={segment.name}>{segment.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-sand">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-indigo">Customers</h3>
                  <p className="text-sm text-pebble">{filteredCustomers.length} customers found</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sand/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {filteredCustomers.map(customer => (
                      <tr key={customer.id} className="hover:bg-sand/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-indigo">{customer.firstName} {customer.lastName}</p>
                              <p className="text-sm text-pebble">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-indigo">
                            <p>{customer.phone}</p>
                            <p className="text-pebble">Malaysia</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLoyaltyTierColor(customer.loyaltyTier)}`}>
                            {customer.loyaltyTier.charAt(0).toUpperCase() + customer.loyaltyTier.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-indigo">
                            <p className="font-bold">{customer.totalOrders}</p>
                            <p className="text-pebble">orders</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-indigo">
                            <p className="font-bold">RM {customer.totalSpent.toLocaleString()}</p>
                            <p className="text-pebble">lifetime</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                            {customer.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-pebble">
                          {new Date(customer.lastActivityDate).toLocaleDateString('en-MY')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowCustomerModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendCommunication(customer, 'email')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendCommunication(customer, 'sms')}
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                              title="Send SMS"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-pebble hover:bg-sand/20 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-sand">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-indigo">Customer Segments</h3>
                  <button
                    onClick={handleCreateSegment}
                    className="btn btn-primary"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    New Segment
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-sand">
                {customerSegments.map(segment => (
                  <div key={segment.id} className="p-6 hover:bg-sand/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-indigo">{segment.name}</h4>
                        <p className="text-sm text-pebble">{segment.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          segment.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                        }`}>
                          {segment.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleEditSegment(segment)}
                          className="p-2 text-pebble hover:bg-sand/20 rounded-lg"
                          title="Edit Segment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-pebble">Customers</p>
                        <p className="font-bold text-indigo">{segment.customerCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-pebble">Total Revenue</p>
                        <p className="font-bold text-indigo">RM {segment.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-pebble">Avg Order Value</p>
                        <p className="font-bold text-indigo">RM {segment.averageOrderValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-pebble">Created</p>
                        <p className="font-bold text-indigo">{new Date(segment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">+{customerAnalytics.revenueGrowth}%</span>
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Revenue Growth</p>
                  <p className="text-2xl font-bold text-indigo">RM {customerAnalytics.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">+{customerAnalytics.newCustomersThisMonth}</span>
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">New Customers</p>
                  <p className="text-2xl font-bold text-indigo">{customerAnalytics.newCustomersThisMonth}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-600">{customerAnalytics.customerRetentionRate}%</span>
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Retention Rate</p>
                  <p className="text-2xl font-bold text-indigo">{customerAnalytics.customerRetentionRate}%</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-orange-600">{customerAnalytics.churnRate}%</span>
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-indigo">{customerAnalytics.churnRate}%</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-bold text-indigo mb-4">Customer Acquisition Trend</h3>
                <div className="h-64 bg-gradient-to-br from-sage/10 to-gold/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-pebble/50 mx-auto mb-2" />
                    <p className="text-sm text-pebble">Customer acquisition chart</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-bold text-indigo mb-4">Revenue by Customer Segment</h3>
                <div className="h-64 bg-gradient-to-br from-terracotta/10 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-pebble/50 mx-auto mb-2" />
                    <p className="text-sm text-pebble">Revenue distribution chart</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}