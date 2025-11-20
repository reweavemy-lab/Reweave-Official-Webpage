import { useState, useEffect } from 'react';
import { Store, ShoppingBag, Users, DollarSign, TrendingUp, Calendar, QrCode, BarChart3, Settings, Plus, Eye } from 'lucide-react';
import PopupMode from './PopupMode';
import PopupCustomerManager from '@/components/admin/PopupCustomerManager';
import PopupAnalytics from '@/components/admin/PopupAnalytics';

interface PopupEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'upcoming' | 'active' | 'completed';
  totalSales: number;
  totalOrders: number;
  uniqueCustomers: number;
}

const mockEvents: PopupEvent[] = [
  {
    id: 'EVENT-001',
    name: 'Batik Heritage Pop-up',
    date: '2024-01-15',
    location: 'Central Market, KL',
    status: 'completed',
    totalSales: 12500,
    totalOrders: 47,
    uniqueCustomers: 42
  },
  {
    id: 'EVENT-002',
    name: 'Artisan Market Weekend',
    date: '2024-01-20',
    location: 'Publika, KL',
    status: 'active',
    totalSales: 3200,
    totalOrders: 12,
    uniqueCustomers: 10
  },
  {
    id: 'EVENT-003',
    name: 'Weekend Pop-up @ Bangsar',
    date: '2024-01-25',
    location: 'Bangsar Village',
    status: 'upcoming',
    totalSales: 0,
    totalOrders: 0,
    uniqueCustomers: 0
  }
];

export default function PopupDashboard() {
  const [activeTab, setActiveTab] = useState<'selling' | 'customers' | 'analytics' | 'events'>('selling');
  const [currentEvent, setCurrentEvent] = useState<PopupEvent>(mockEvents[1]);
  const [showEventSelector, setShowEventSelector] = useState<boolean>(false);
  const [todayStats, setTodayStats] = useState({
    totalSales: 3200,
    totalOrders: 12,
    avgOrderValue: 267,
    conversionRate: 68.5
  });

  const tabs = [
    { id: 'selling', name: 'Popup Selling', icon: Store },
    { id: 'customers', name: 'Customer Manager', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'events', name: 'Event Manager', icon: Calendar }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 to-gold/10">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-indigo">Popup Selling Dashboard</h1>
                <p className="text-sm text-pebble">Fast event sales with QR payments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowEventSelector(!showEventSelector)}
                  className="flex items-center space-x-2 px-4 py-2 bg-ivory border border-sand rounded-xl hover:border-sage transition-colors"
                >
                  <Calendar className="w-4 h-4 text-sage" />
                  <span className="text-indigo font-medium">{currentEvent.name}</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentEvent.status)}`}>
                    {currentEvent.status}
                  </div>
                </button>
                
                {showEventSelector && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-strong border border-sand z-50">
                    <div className="p-4 border-b border-sand">
                      <h3 className="font-bold text-indigo">Select Event</h3>
                    </div>
                    <div className="p-2">
                      {mockEvents.map(event => (
                        <button
                          key={event.id}
                          onClick={() => {
                            setCurrentEvent(event);
                            setShowEventSelector(false);
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-sand/20 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-indigo">{event.name}</p>
                              <p className="text-sm text-pebble">{event.date} • {event.location}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 border-t border-sand">
                      <button className="w-full btn btn-outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-sand/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm">Today's Sales</p>
                  <p className="text-2xl font-bold text-indigo">RM {todayStats.totalSales.toLocaleString()}</p>
                </div>
                <DollarSign className="w-6 h-6 text-sage" />
              </div>
            </div>
            <div className="bg-sand/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm">Orders</p>
                  <p className="text-2xl font-bold text-indigo">{todayStats.totalOrders}</p>
                </div>
                <ShoppingBag className="w-6 h-6 text-gold" />
              </div>
            </div>
            <div className="bg-sand/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm">Avg Order</p>
                  <p className="text-2xl font-bold text-indigo">RM {todayStats.avgOrderValue}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-terracotta" />
              </div>
            </div>
            <div className="bg-sand/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pebble text-sm">Conversion</p>
                  <p className="text-2xl font-bold text-indigo">{todayStats.conversionRate}%</p>
                </div>
                <QrCode className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-2 shadow-soft">
          <div className="flex space-x-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-sage text-white shadow-medium'
                      : 'text-pebble hover:text-indigo hover:bg-sand/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'selling' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-indigo mb-2">Popup Selling Mode</h2>
                <p className="text-pebble">Fast checkout interface for {currentEvent.name}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentEvent.status)}`}>
                  {currentEvent.status === 'active' && (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 animate-pulse"></div>
                      Live Event
                    </>
                  )}
                  {currentEvent.status === 'completed' && 'Event Completed'}
                  {currentEvent.status === 'upcoming' && 'Upcoming Event'}
                </div>
                <button className="btn btn-primary">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Mode
                </button>
              </div>
            </div>
            <PopupMode />
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-indigo mb-2">Popup Customer Manager</h2>
              <p className="text-pebble">Manage and analyze popup event customers</p>
            </div>
            <PopupCustomerManager />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-indigo mb-2">Popup Analytics</h2>
              <p className="text-pebble">Track performance and insights from popup events</p>
            </div>
            <PopupAnalytics />
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-indigo mb-2">Event Manager</h2>
                <p className="text-pebble">Manage your popup events and locations</p>
              </div>
              <button className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create New Event
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEvents.map(event => (
                <div key={event.id} className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </div>
                    <button className="p-2 text-pebble hover:text-indigo rounded-lg hover:bg-sand/20">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-indigo mb-2">{event.name}</h3>
                  <p className="text-sm text-pebble mb-1">{event.date}</p>
                  <p className="text-sm text-pebble mb-4">{event.location}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-pebble">Sales:</span>
                      <span className="font-bold text-sage">RM {event.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-pebble">Orders:</span>
                      <span className="font-bold text-indigo">{event.totalOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-pebble">Customers:</span>
                      <span className="font-bold text-terracotta">{event.uniqueCustomers}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setCurrentEvent(event);
                        setActiveTab('selling');
                      }}
                      className="flex-1 btn btn-outline text-sm"
                    >
                      Manage
                    </button>
                    <button className="flex-1 btn btn-primary text-sm">
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}