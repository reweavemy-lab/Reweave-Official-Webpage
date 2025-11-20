import { useState } from 'react';
import { ShoppingCart, Mail, TrendingUp, Target, Eye, MousePointer, BarChart3, Download, Calendar } from 'lucide-react';

interface AbandonedCart {
  id: string;
  customer: string;
  email: string;
  items: number;
  value: number;
  abandonedAt: string;
  lastReminder: string;
  status: 'new' | 'reminded' | 'recovered';
}

interface EmailCampaign {
  id: string;
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  date: string;
  status: 'sent' | 'scheduled' | 'draft';
}

interface PixelEvent {
  event: string;
  count: number;
  status: 'healthy' | 'warning' | 'error';
  lastSeen: string;
}

const mockAbandonedCarts: AbandonedCart[] = [
  {
    id: 'CART-001',
    customer: 'Sarah Lim',
    email: 'sarah@email.com',
    items: 2,
    value: 285.00,
    abandonedAt: '2024-01-15 14:30',
    lastReminder: '2024-01-16 09:00',
    status: 'reminded'
  },
  {
    id: 'CART-002',
    customer: 'John Tan',
    email: 'john@email.com',
    items: 3,
    value: 450.00,
    abandonedAt: '2024-01-15 16:45',
    lastReminder: 'Never',
    status: 'new'
  },
  {
    id: 'CART-003',
    customer: 'Maria Wong',
    email: 'maria@email.com',
    items: 1,
    value: 195.00,
    abandonedAt: '2024-01-14 11:20',
    lastReminder: '2024-01-15 10:00',
    status: 'recovered'
  }
];

const mockEmailCampaigns: EmailCampaign[] = [
  {
    id: 'EMAIL-001',
    name: 'Welcome Series - New Customers',
    sent: 1247,
    opened: 892,
    clicked: 234,
    date: '2024-01-10',
    status: 'sent'
  },
  {
    id: 'EMAIL-002',
    name: 'Batik Heritage Collection Launch',
    sent: 2156,
    opened: 1567,
    clicked: 445,
    date: '2024-01-12',
    status: 'sent'
  },
  {
    id: 'EMAIL-003',
    name: 'Sustainable Fashion Tips',
    sent: 892,
    opened: 623,
    clicked: 156,
    date: '2024-01-14',
    status: 'scheduled'
  }
];

const mockPixelEvents: PixelEvent[] = [
  { event: 'PageView', count: 12450, status: 'healthy', lastSeen: '2 min ago' },
  { event: 'AddToCart', count: 2340, status: 'healthy', lastSeen: '5 min ago' },
  { event: 'Purchase', count: 567, status: 'healthy', lastSeen: '12 min ago' },
  { event: 'ViewContent', count: 8901, status: 'warning', lastSeen: '1 hour ago' },
  { event: 'InitiateCheckout', count: 1234, status: 'healthy', lastSeen: '8 min ago' }
];

const statusColors = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  reminded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  recovered: 'bg-green-100 text-green-800 border-green-200',
  sent: 'bg-green-100 text-green-800 border-green-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  healthy: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200'
};

export default function MarketingDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'carts' | 'emails' | 'pixels'>('overview');
  const [selectedCarts, setSelectedCarts] = useState<string[]>([]);

  const handleRecoverCart = (cartId: string) => {
    console.log('Sending recovery email for cart:', cartId);
    // Implement cart recovery logic
  };

  const handleBulkRecover = () => {
    console.log('Recovering selected carts:', selectedCarts);
    setSelectedCarts([]);
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    return sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0';
  };

  const calculateClickRate = (clicked: number, sent: number) => {
    return sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Marketing Dashboard</h1>
          <p className="text-pebble mt-2">Track marketing performance and customer engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <Target className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
          <button className="btn btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl p-2 shadow-soft">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'carts', label: 'Abandoned Carts', icon: ShoppingCart },
            { id: 'emails', label: 'Email Performance', icon: Mail },
            { id: 'pixels', label: 'Pixel Health', icon: Target }
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

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm font-medium">Conversion Rate</p>
                  <p className="text-3xl font-bold text-indigo mt-2">3.2%</p>
                  <p className="text-sm text-sage mt-1">+0.5% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-sage" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm font-medium">Email Open Rate</p>
                  <p className="text-3xl font-bold text-indigo mt-2">72.8%</p>
                  <p className="text-sm text-sage mt-1">+2.1% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-gold" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm font-medium">Cart Recovery Rate</p>
                  <p className="text-3xl font-bold text-indigo mt-2">18.5%</p>
                  <p className="text-sm text-sage mt-1">+1.8% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-terracotta" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm font-medium">Avg. Session Duration</p>
                  <p className="text-3xl font-bold text-indigo mt-2">4m 32s</p>
                  <p className="text-sm text-sage mt-1">+12s vs last month</p>
                </div>
                <div className="w-12 h-12 bg-indigo/10 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-indigo" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <h2 className="text-xl font-display font-bold text-indigo mb-6">Best Performing Products</h2>
            <div className="space-y-4">
              {[
                { name: 'Batik Heritage Tote', views: 2450, clicks: 156, ctr: 6.4 },
                { name: 'Traditional Clutch Premium', views: 1890, clicks: 134, ctr: 7.1 },
                { name: 'Cultural Crossbody', views: 1678, clicks: 98, ctr: 5.8 },
                { name: 'Artisan Shoulder Bag', views: 1234, clicks: 89, ctr: 7.2 }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-sand/20 rounded-xl">
                  <div>
                    <p className="font-medium text-indigo">{product.name}</p>
                    <p className="text-sm text-pebble">{product.views.toLocaleString()} views</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo">{product.ctr}% CTR</p>
                    <p className="text-sm text-pebble">{product.clicks} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <h2 className="text-xl font-display font-bold text-indigo mb-6">UTM Source Breakdown</h2>
            <div className="space-y-4">
              {[
                { source: 'Instagram', visits: 3456, conversions: 89, rate: 2.6 },
                { source: 'Facebook', visits: 2890, conversions: 67, rate: 2.3 },
                { source: 'Google Ads', visits: 2134, conversions: 123, rate: 5.8 },
                { source: 'Email Campaign', visits: 1567, conversions: 98, rate: 6.3 },
                { source: 'Organic Search', visits: 4456, conversions: 156, rate: 3.5 }
              ].map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-sage rounded-full"></div>
                    <span className="font-medium text-indigo">{source.source}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="text-pebble">{source.visits.toLocaleString()} visits</span>
                    <span className="text-pebble">{source.conversions} conversions</span>
                    <span className="font-bold text-sage">{source.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Abandoned Carts Tab */}
      {selectedTab === 'carts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-indigo">Abandoned Carts</h2>
              <p className="text-pebble mt-1">Recover lost sales opportunities</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBulkRecover}
                disabled={selectedCarts.length === 0}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4 mr-2" />
                Recover Selected ({selectedCarts.length})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand/20">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCarts.length === mockAbandonedCarts.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCarts(mockAbandonedCarts.map(cart => cart.id));
                          } else {
                            setSelectedCarts([]);
                          }
                        }}
                        className="rounded border-sand text-sage focus:ring-sage"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Customer</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Items</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Value</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Abandoned</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {mockAbandonedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-sand/20">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCarts.includes(cart.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCarts([...selectedCarts, cart.id]);
                            } else {
                              setSelectedCarts(selectedCarts.filter(id => id !== cart.id));
                            }
                          }}
                          className="rounded border-sand text-sage focus:ring-sage"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-indigo">{cart.customer}</p>
                          <p className="text-sm text-pebble">{cart.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-indigo">{cart.items} items</td>
                      <td className="px-6 py-4 font-bold text-indigo">RM {cart.value.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[cart.status]}`}>
                          {cart.status.charAt(0).toUpperCase() + cart.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-pebble text-sm">{cart.abandonedAt}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleRecoverCart(cart.id)}
                          className="btn btn-primary text-xs"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Recover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Email Performance Tab */}
      {selectedTab === 'emails' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-indigo">Email Campaign Performance</h2>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Campaign</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Sent</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Open Rate</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Click Rate</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {mockEmailCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-sand/20">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-indigo">{campaign.name}</p>
                          <p className="text-sm text-pebble">Email Campaign</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[campaign.status]}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-indigo">{campaign.sent.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-indigo">{calculateOpenRate(campaign.opened, campaign.sent)}%</span>
                          <p className="text-sm text-pebble">{campaign.opened.toLocaleString()} opened</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-indigo">{calculateClickRate(campaign.clicked, campaign.sent)}%</span>
                          <p className="text-sm text-pebble">{campaign.clicked.toLocaleString()} clicked</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-pebble text-sm">{campaign.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pixel Health Tab */}
      {selectedTab === 'pixels' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-indigo">Pixel Events Health Check</h2>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Event</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Count (24h)</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-pebble font-medium">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {mockPixelEvents.map((event) => (
                    <tr key={event.event} className="hover:bg-sand/20">
                      <td className="px-6 py-4 font-medium text-indigo">{event.event}</td>
                      <td className="px-6 py-4 text-indigo">{event.count.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-pebble text-sm">{event.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}