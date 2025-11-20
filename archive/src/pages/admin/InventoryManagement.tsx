import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Truck,
  MapPin,
  DollarSign
} from 'lucide-react';

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  sku: string;
  location_id: string;
  location_name: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_committed: number;
  quantity_incoming: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost: number;
  total_value: number;
  last_counted_at?: string;
  last_adjusted_at?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
  days_of_supply: number;
  turnover_rate: number;
}

interface PreorderBatch {
  id: string;
  name: string;
  product_id: string;
  product_name: string;
  batch_number: string;
  preorder_start_date: string;
  preorder_end_date: string;
  estimated_delivery_date: string;
  minimum_order_quantity: number;
  maximum_order_quantity?: number;
  price: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  total_slots: number;
  reserved_slots: number;
  sold_slots: number;
  status: 'draft' | 'active' | 'closed' | 'cancelled' | 'delivered';
  created_at: string;
  updated_at: string;
}

interface InventoryMovement {
  id: string;
  inventory_id: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'reserve' | 'release' | 'commit';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_type?: string;
  reference_id?: string;
  reason: string;
  notes?: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'damaged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  product_id: string;
  product_name: string;
  variant_name?: string;
  current_stock: number;
  threshold: number;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    product_id: 'prod-001',
    product_name: 'Heritage Batik Tote',
    variant_name: 'Navy Blue',
    sku: 'HBT-NAVY-001',
    location_id: 'loc-001',
    location_name: 'Main Warehouse',
    quantity_available: 15,
    quantity_reserved: 3,
    quantity_committed: 2,
    quantity_incoming: 0,
    reorder_point: 10,
    reorder_quantity: 25,
    unit_cost: 120,
    total_value: 1800,
    last_counted_at: '2024-01-10',
    last_adjusted_at: '2024-01-08',
    status: 'in_stock',
    days_of_supply: 45,
    turnover_rate: 8.2
  },
  {
    id: '2',
    product_id: 'prod-001',
    product_name: 'Heritage Batik Tote',
    variant_name: 'Burgundy',
    sku: 'HBT-BURG-001',
    location_id: 'loc-001',
    location_name: 'Main Warehouse',
    quantity_available: 7,
    quantity_reserved: 2,
    quantity_committed: 1,
    quantity_incoming: 0,
    reorder_point: 10,
    reorder_quantity: 25,
    unit_cost: 120,
    total_value: 840,
    last_counted_at: '2024-01-10',
    last_adjusted_at: '2024-01-08',
    status: 'low_stock',
    days_of_supply: 21,
    turnover_rate: 12.5
  },
  {
    id: '3',
    product_id: 'prod-002',
    product_name: 'Traditional Clutch Premium',
    variant_name: 'Gold on Black',
    sku: 'TCP-GOLD-001',
    location_id: 'loc-001',
    location_name: 'Main Warehouse',
    quantity_available: 0,
    quantity_reserved: 0,
    quantity_committed: 0,
    quantity_incoming: 50,
    reorder_point: 5,
    reorder_quantity: 20,
    unit_cost: 200,
    total_value: 0,
    last_counted_at: '2024-01-10',
    last_adjusted_at: '2024-01-05',
    status: 'out_of_stock',
    days_of_supply: 0,
    turnover_rate: 0
  }
];

const mockPreorderBatches: PreorderBatch[] = [
  {
    id: 'pre-001',
    name: 'Traditional Clutch Premium - Batch 1',
    product_id: 'prod-002',
    product_name: 'Traditional Clutch Premium',
    batch_number: 'TCP-BATCH-001',
    preorder_start_date: '2024-01-01',
    preorder_end_date: '2024-02-15',
    estimated_delivery_date: '2024-03-30',
    minimum_order_quantity: 1,
    maximum_order_quantity: 5,
    price: 450,
    early_bird_price: 405,
    early_bird_end_date: '2024-01-15',
    total_slots: 100,
    reserved_slots: 15,
    sold_slots: 35,
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-15'
  }
];

const mockInventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-001',
    inventory_id: '1',
    type: 'in',
    quantity: 25,
    previous_quantity: 0,
    new_quantity: 25,
    reference_type: 'purchase_order',
    reference_id: 'po-001',
    reason: 'New stock received from supplier',
    user_id: 'user-001',
    user_name: 'John Admin',
    created_at: '2024-01-08'
  },
  {
    id: 'mov-002',
    inventory_id: '2',
    type: 'out',
    quantity: -3,
    previous_quantity: 10,
    new_quantity: 7,
    reference_type: 'order',
    reference_id: 'ord-001',
    reason: 'Order fulfillment',
    user_id: 'user-002',
    user_name: 'Sarah Staff',
    created_at: '2024-01-10'
  }
];

const mockInventoryAlerts: InventoryAlert[] = [
  {
    id: 'alert-001',
    type: 'low_stock',
    severity: 'medium',
    product_id: 'prod-001',
    product_name: 'Heritage Batik Tote',
    variant_name: 'Burgundy',
    current_stock: 7,
    threshold: 10,
    message: 'Stock is running low. Consider reordering soon.',
    is_resolved: false,
    created_at: '2024-01-10'
  },
  {
    id: 'alert-002',
    type: 'out_of_stock',
    severity: 'high',
    product_id: 'prod-002',
    product_name: 'Traditional Clutch Premium',
    variant_name: 'Gold on Black',
    current_stock: 0,
    threshold: 5,
    message: 'Product is out of stock. Immediate action required.',
    is_resolved: false,
    created_at: '2024-01-09'
  }
];

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'preorders' | 'movements' | 'alerts'>('overview');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [preorderBatches, setPreorderBatches] = useState<PreorderBatch[]>(mockPreorderBatches);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(mockInventoryMovements);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>(mockInventoryAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showPreorderModal, setShowPreorderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedPreorder, setSelectedPreorder] = useState<PreorderBatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'overstock': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'out_of_stock': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'overstock': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || item.location_name === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const filteredAlerts = inventoryAlerts.filter(alert => {
    const matchesSearch = alert.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = statusFilter === 'all' || alert.severity === statusFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleAddStock = async (item: InventoryItem, quantity: number, reason: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update inventory
      const updatedItems = inventoryItems.map(inv => 
        inv.id === item.id 
          ? { 
              ...inv, 
              quantity_available: inv.quantity_available + quantity,
              total_value: (inv.quantity_available + quantity) * inv.unit_cost,
              status: inv.quantity_available + quantity <= inv.reorder_point ? 'low_stock' : 'in_stock'
            }
          : inv
      );
      
      setInventoryItems(updatedItems as InventoryItem[]);
      setShowAddStockModal(false);
      setSelectedItem(null);
      
      alert('Stock added successfully!');
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Failed to add stock. Please try again.');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInventoryAlerts(alerts => 
        alerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_resolved: true, resolved_at: new Date().toISOString() }
            : alert
        )
      );
      
      alert('Alert resolved successfully!');
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sand/20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-indigo">Inventory Management</h1>
              <p className="text-pebble mt-1">Real-time inventory tracking and preorder management</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddStockModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </button>
              
              <button
                onClick={() => setShowPreorderModal(true)}
                className="btn btn-outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                New Preorder
              </button>
              
              <button className="btn btn-outline">
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
              { id: 'inventory', name: 'Inventory', icon: Package },
              { id: 'preorders', name: 'Preorders', icon: Calendar },
              { id: 'movements', name: 'Movements', icon: Activity },
              { id: 'alerts', name: 'Alerts', icon: AlertTriangle }
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
                  {tab.id === 'alerts' && inventoryAlerts.filter(a => !a.is_resolved).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {inventoryAlerts.filter(a => !a.is_resolved).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pebble" />
              <input
                type="text"
                placeholder="Search products, SKUs, locations..."
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
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="overstock">Overstock</option>
            </select>
            
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
            >
              <option value="all">All Locations</option>
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Popup Inventory">Popup Inventory</option>
            </select>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Total Stock Value</p>
                  <p className="text-2xl font-bold text-indigo">RM 45,280</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{inventoryAlerts.filter(a => !a.is_resolved).length}</span>
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Active Alerts</p>
                  <p className="text-2xl font-bold text-indigo">{inventoryAlerts.filter(a => !a.is_resolved).length}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Active Preorders</p>
                  <p className="text-2xl font-bold text-indigo">{preorderBatches.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <TrendingDown className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-pebble mb-1">Avg Turnover Rate</p>
                  <p className="text-2xl font-bold text-indigo">8.7x</p>
                </div>
              </div>
            </div>

            {/* Stock Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-bold text-indigo mb-4">Stock Status Distribution</h3>
                <div className="h-64 bg-gradient-to-br from-sage/10 to-gold/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-pebble/50 mx-auto mb-2" />
                    <p className="text-sm text-pebble">Stock status chart</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-bold text-indigo mb-4">Recent Movements</h3>
                <div className="space-y-3">
                  {inventoryMovements.slice(0, 5).map(movement => (
                    <div key={movement.id} className="flex items-center justify-between p-3 border border-sand rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          movement.type === 'in' ? 'bg-green-100 text-green-600' :
                          movement.type === 'out' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {movement.type === 'in' ? <ArrowUp className="w-4 h-4" /> :
                           movement.type === 'out' ? <ArrowDown className="w-4 h-4" /> :
                           <RefreshCw className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-indigo">{movement.reason}</p>
                          <p className="text-sm text-pebble">by {movement.user_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo">{movement.quantity > 0 ? '+' : ''}{movement.quantity}</p>
                        <p className="text-xs text-pebble">{new Date(movement.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-sand">
                <h3 className="text-lg font-bold text-indigo">Inventory Items</h3>
                <p className="text-sm text-pebble mt-1">{filteredInventory.length} items found</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sand/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Available</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Reserved</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Incoming</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {filteredInventory.map(item => (
                      <tr key={item.id} className="hover:bg-sand/10">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-indigo">{item.product_name}</p>
                            {item.variant_name && (
                              <p className="text-sm text-pebble">{item.variant_name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-indigo font-mono">{item.sku}</td>
                        <td className="px-6 py-4 text-sm text-pebble">{item.location_name}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${
                            item.status === 'out_of_stock' ? 'text-red-600' :
                            item.status === 'low_stock' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.quantity_available}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-pebble">{item.quantity_reserved}</td>
                        <td className="px-6 py-4 text-sm text-pebble">{item.quantity_incoming}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo">RM {item.total_value.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowAddStockModal(true);
                              }}
                              className="p-2 text-sage hover:bg-sage/10 rounded-lg"
                              title="Add Stock"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
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

        {activeTab === 'preorders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-sand">
                <h3 className="text-lg font-bold text-indigo">Preorder Batches</h3>
                <p className="text-sm text-pebble mt-1">{preorderBatches.length} active batches</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sand/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Batch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Preorder Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pebble uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {preorderBatches.map(batch => (
                      <tr key={batch.id} className="hover:bg-sand/10">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-indigo">{batch.name}</p>
                            <p className="text-sm text-pebble">{batch.batch_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-indigo">{batch.product_name}</p>
                            <p className="text-sm text-pebble">Delivery: {new Date(batch.estimated_delivery_date).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            batch.status === 'active' ? 'text-green-600 bg-green-100' :
                            batch.status === 'closed' ? 'text-gray-600 bg-gray-100' :
                            batch.status === 'cancelled' ? 'text-red-600 bg-red-100' :
                            'text-blue-600 bg-blue-100'
                          }`}>
                            {batch.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-pebble">
                          <div>
                            <p>Start: {new Date(batch.preorder_start_date).toLocaleDateString()}</p>
                            <p>End: {new Date(batch.preorder_end_date).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-pebble">Progress</span>
                              <span className="font-bold text-indigo">{Math.round((batch.sold_slots / batch.total_slots) * 100)}%</span>
                            </div>
                            <div className="w-full bg-sand/20 rounded-full h-2">
                              <div 
                                className="bg-sage h-2 rounded-full" 
                                style={{ width: `${(batch.sold_slots / batch.total_slots) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-pebble">
                              <span>{batch.sold_slots} sold</span>
                              <span>{batch.total_slots - batch.sold_slots} remaining</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-indigo">RM {batch.price}</p>
                            {batch.early_bird_price && (
                              <p className="text-sm text-pebble">Early Bird: RM {batch.early_bird_price}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-pebble hover:bg-sand/20 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
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

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-sand">
                <h3 className="text-lg font-bold text-indigo">Inventory Alerts</h3>
                <p className="text-sm text-pebble mt-1">{filteredAlerts.filter(a => !a.is_resolved).length} active alerts</p>
              </div>
              
              <div className="divide-y divide-sand">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className={`p-6 ${alert.is_resolved ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getAlertTypeIcon(alert.type)}
                        <div>
                          <p className="font-medium text-indigo">{alert.message}</p>
                          <p className="text-sm text-pebble">{alert.product_name} {alert.variant_name && `- ${alert.variant_name}`}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        
                        {!alert.is_resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="btn btn-sm btn-primary"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </button>
                        )}
                        
                        {alert.is_resolved && (
                          <span className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-pebble">Current Stock</p>
                        <p className="font-bold text-indigo">{alert.current_stock}</p>
                      </div>
                      <div>
                        <p className="text-pebble">Threshold</p>
                        <p className="font-bold text-indigo">{alert.threshold}</p>
                      </div>
                      <div>
                        <p className="text-pebble">Created</p>
                        <p className="font-bold text-indigo">{new Date(alert.created_at).toLocaleDateString()}</p>
                      </div>
                      {alert.resolved_at && (
                        <div>
                          <p className="text-pebble">Resolved</p>
                          <p className="font-bold text-green-600">{new Date(alert.resolved_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddStockModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-indigo">Add Stock</h3>
              <button
                onClick={() => {
                  setShowAddStockModal(false);
                  setSelectedItem(null);
                }}
                className="p-2 text-pebble hover:text-indigo rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-pebble mb-1">Product</p>
                <p className="font-bold text-indigo">{selectedItem.product_name}</p>
                {selectedItem.variant_name && (
                  <p className="text-sm text-pebble">{selectedItem.variant_name}</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-pebble mb-1">Current Stock</p>
                <p className="font-bold text-indigo">{selectedItem.quantity_available}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  defaultValue="10"
                  className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo mb-2">
                  Reason
                </label>
                <select className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage">
                  <option value="purchase_order">Purchase Order</option>
                  <option value="return">Customer Return</option>
                  <option value="adjustment">Stock Adjustment</option>
                  <option value="transfer">Stock Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStockModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle add stock
                  handleAddStock(selectedItem, 10, 'Purchase Order');
                }}
                className="flex-1 btn btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}