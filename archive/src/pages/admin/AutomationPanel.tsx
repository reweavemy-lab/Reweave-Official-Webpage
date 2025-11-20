import { useState } from 'react';
import { Settings, Clock, Bell, Tag, Gift, AlertTriangle, Plus, Edit, Trash2, Play, Pause, BarChart3 } from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  type: 'discount' | 'campaign' | 'alert' | 'reminder';
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  lastRun: string;
  performance?: {
    totalRuns: number;
    successRate: number;
    revenue: number;
  };
}

interface DiscountCode {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  usage: number;
  limit: number;
  expiry: string;
  status: 'active' | 'expired' | 'paused';
}

const mockAutomations: Automation[] = [
  {
    id: 'AUTO-001',
    name: 'Abandoned Cart Recovery',
    type: 'reminder',
    status: 'active',
    trigger: 'Cart abandoned for 1 hour',
    lastRun: '2 hours ago',
    performance: {
      totalRuns: 1247,
      successRate: 18.5,
      revenue: 45600
    }
  },
  {
    id: 'AUTO-002',
    name: 'Low Stock Alert',
    type: 'alert',
    status: 'active',
    trigger: 'Stock below 10 units',
    lastRun: '1 day ago'
  },
  {
    id: 'AUTO-003',
    name: 'Welcome Discount 15%',
    type: 'discount',
    status: 'active',
    trigger: 'New customer signup',
    lastRun: '3 hours ago',
    performance: {
      totalRuns: 892,
      successRate: 67.3,
      revenue: 12500
    }
  },
  {
    id: 'AUTO-004',
    name: 'Preorder Reminder',
    type: 'reminder',
    status: 'paused',
    trigger: 'Preorder deadline approaching',
    lastRun: '1 week ago'
  }
];

const mockDiscountCodes: DiscountCode[] = [
  {
    id: 'CODE-001',
    code: 'WELCOME15',
    discount: 15,
    type: 'percentage',
    usage: 234,
    limit: 500,
    expiry: '2024-12-31',
    status: 'active'
  },
  {
    id: 'CODE-002',
    code: 'BATIK20',
    discount: 20,
    type: 'percentage',
    usage: 89,
    limit: 200,
    expiry: '2024-02-15',
    status: 'active'
  },
  {
    id: 'CODE-003',
    code: 'HERITAGE25',
    discount: 25,
    type: 'percentage',
    usage: 156,
    limit: 300,
    expiry: '2024-01-30',
    status: 'expired'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  expired: 'bg-red-100 text-red-800 border-red-200'
};

const typeIcons = {
  discount: Gift,
  campaign: BarChart3,
  alert: AlertTriangle,
  reminder: Clock
};

export default function AutomationPanel() {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(mockDiscountCodes);
  const [selectedTab, setSelectedTab] = useState<'automations' | 'discounts' | 'campaigns'>('automations');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const handleToggleAutomation = (automationId: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === automationId 
        ? { 
            ...automation, 
            status: automation.status === 'active' ? 'paused' : 'active' as Automation['status']
          }
        : automation
    ));
  };

  const handleGenerateReferralCode = () => {
    const newCode: DiscountCode = {
      id: `CODE-${Date.now()}`,
      code: `REFERRAL${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      discount: 10,
      type: 'percentage',
      usage: 0,
      limit: 100,
      expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    };
    setDiscountCodes(prev => [...prev, newCode]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Automation Panel</h1>
          <p className="text-pebble mt-2">Streamline operations with automated workflows</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowDiscountModal(true)}
            className="btn btn-secondary"
          >
            <Tag className="w-4 h-4 mr-2" />
            Create Discount
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Automation
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl p-2 shadow-soft">
        <div className="flex space-x-2">
          {[
            { id: 'automations', label: 'Automations', icon: Settings },
            { id: 'discounts', label: 'Discount Codes', icon: Tag },
            { id: 'campaigns', label: 'Campaigns', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                selectedTab === tab.id
                  ? 'bg-sage text-white shadow-medium'
                  : 'text-indigo hover:bg-sand hover:text-terracotta'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Automations Tab */}
      {selectedTab === 'automations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automations.map((automation) => {
              const TypeIcon = typeIcons[automation.type];
              return (
                <div key={automation.id} className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center`}>
                        <TypeIcon className="w-5 h-5 text-sage" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-indigo">{automation.name}</h3>
                        <p className="text-sm text-pebble">{automation.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[automation.status]}`}>
                        {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                      </span>
                      <button 
                        onClick={() => handleToggleAutomation(automation.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          automation.status === 'active' 
                            ? 'bg-terracotta text-white hover:bg-terracotta/80' 
                            : 'bg-sage text-white hover:bg-sage/80'
                        }`}
                      >
                        {automation.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pebble">Last Run:</span>
                      <span className="text-indigo font-medium">{automation.lastRun}</span>
                    </div>
                    
                    {automation.performance && (
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-sand">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo">{automation.performance.totalRuns}</p>
                          <p className="text-xs text-pebble">Total Runs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-sage">{automation.performance.successRate}%</p>
                          <p className="text-xs text-pebble">Success Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gold">RM {automation.performance.revenue.toLocaleString()}</p>
                          <p className="text-xs text-pebble">Revenue</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <button className="p-2 rounded-lg hover:bg-sand text-indigo">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-sand text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Discount Codes Tab */}
      {selectedTab === 'discounts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-indigo">Discount Codes</h2>
              <p className="text-pebble mt-1">Manage promotional codes and campaigns</p>
            </div>
            <button 
              onClick={handleGenerateReferralCode}
              className="btn btn-secondary"
            >
              <Gift className="w-4 h-4 mr-2" />
              Generate Referral Code
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Code</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Discount</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Usage</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Expiry</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {discountCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-sand/20">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono font-bold text-indigo text-lg">{code.code}</p>
                          <p className="text-sm text-pebble">
                            {code.type === 'percentage' ? `${code.discount}% off` : `RM ${code.discount} off`}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo">{code.discount}</p>
                          <p className="text-sm text-pebble">{code.type}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-indigo">{code.usage}/{code.limit}</p>
                          <div className="w-20 bg-sand rounded-full h-2 mt-1">
                            <div 
                              className="bg-sage h-2 rounded-full" 
                              style={{width: `${(code.usage / code.limit) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-indigo font-medium">
                        {new Date(code.expiry).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[code.status]}`}>
                          {code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg hover:bg-sand text-indigo">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-sand text-red-600">
                            <Trash2 className="w-4 h-4" />
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

      {/* Campaigns Tab */}
      {selectedTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="text-lg font-bold text-indigo mb-4">Time-Limited Campaign</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Campaign Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="Flash Sale Weekend"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo mb-2">Start Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo mb-2">End Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Discount Percentage</label>
                  <select className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage">
                    <option>10% off</option>
                    <option>15% off</option>
                    <option>20% off</option>
                    <option>25% off</option>
                    <option>30% off</option>
                  </select>
                </div>
                <button className="w-full btn btn-primary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Launch Campaign
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="text-lg font-bold text-indigo mb-4">Restock Alert Campaign</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Alert Threshold</label>
                  <select className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage">
                    <option>When stock drops below 10 units</option>
                    <option>When stock drops below 5 units</option>
                    <option>When stock drops below 3 units</option>
                    <option>When stock drops below 1 unit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo mb-2">Notification Recipients</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-sand text-sage focus:ring-sage" defaultChecked />
                      <span className="text-sm text-indigo">Admin Dashboard</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-sand text-sage focus:ring-sage" />
                      <span className="text-sm text-indigo">Email Notification</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-sand text-sage focus:ring-sage" />
                      <span className="text-sm text-indigo">SMS Alert</span>
                    </label>
                  </div>
                </div>
                <button className="w-full btn btn-secondary">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Up Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Automation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-indigo">Create New Automation</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-sand text-indigo"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-indigo mb-2">Automation Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="Enter automation name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo mb-2">Automation Type</label>
                <select className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage">
                  <option value="discount">Discount Code</option>
                  <option value="campaign">Marketing Campaign</option>
                  <option value="alert">System Alert</option>
                  <option value="reminder">Customer Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo mb-2">Trigger Condition</label>
                <select className="w-full px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage">
                  <option>Customer abandons cart for 1 hour</option>
                  <option>Stock drops below threshold</option>
                  <option>New customer signs up</option>
                  <option>Preorder deadline approaching</option>
                  <option>Customer birthday</option>
                </select>
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
                  Create Automation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}