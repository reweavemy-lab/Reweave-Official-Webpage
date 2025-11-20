import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Clock, Target, Calendar, MapPin, Star, Zap, BarChart3 } from 'lucide-react';

interface PopupEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  totalSales: number;
  totalOrders: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  conversionRate: number;
  topProducts: { name: string; sales: number }[];
  hourlySales: { hour: string; sales: number; orders: number }[];
  paymentMethods: { method: string; amount: number; count: number }[];
  customerTags: { tag: string; count: number }[];
  status: 'upcoming' | 'active' | 'completed';
}

interface RealTimeMetrics {
  currentSales: number;
  currentOrders: number;
  activeCustomers: number;
  salesPerMinute: number;
  topProductNow: string;
  busiestHour: string;
}

const mockPopupEvents: PopupEvent[] = [
  {
    id: 'POPUP-001',
    name: 'Batik Heritage Pop-up',
    date: '2024-01-15',
    location: 'Central Market, Kuala Lumpur',
    startTime: '10:00',
    endTime: '18:00',
    totalSales: 12500,
    totalOrders: 47,
    uniqueCustomers: 42,
    avgOrderValue: 266,
    conversionRate: 68.5,
    topProducts: [
      { name: 'Batik Heritage Tote', sales: 18 },
      { name: 'Traditional Clutch', sales: 12 },
      { name: 'Cultural Crossbody', sales: 8 }
    ],
    hourlySales: [
      { hour: '10:00', sales: 850, orders: 3 },
      { hour: '11:00', sales: 1200, orders: 4 },
      { hour: '12:00', sales: 1850, orders: 7 },
      { hour: '13:00', sales: 2100, orders: 8 },
      { hour: '14:00', sales: 1650, orders: 6 },
      { hour: '15:00', sales: 1950, orders: 7 },
      { hour: '16:00', sales: 1400, orders: 5 },
      { hour: '17:00', sales: 1100, orders: 4 }
    ],
    paymentMethods: [
      { method: 'Touch n Go', amount: 5200, count: 20 },
      { method: 'GrabPay', amount: 3800, count: 14 },
      { method: 'Boost', amount: 2400, count: 9 },
      { method: 'FPX', amount: 1100, count: 4 }
    ],
    customerTags: [
      { tag: 'VIP', count: 12 },
      { tag: 'New Customer', count: 28 },
      { tag: 'Instagram', count: 35 },
      { tag: 'Repeat Customer', count: 8 }
    ],
    status: 'completed'
  },
  {
    id: 'POPUP-002',
    name: 'Artisan Market Weekend',
    date: '2024-01-20',
    location: 'Publika, Kuala Lumpur',
    startTime: '11:00',
    endTime: '19:00',
    totalSales: 8900,
    totalOrders: 32,
    uniqueCustomers: 29,
    avgOrderValue: 278,
    conversionRate: 71.2,
    topProducts: [
      { name: 'Traditional Clutch', sales: 14 },
      { name: 'Batik Heritage Tote', sales: 9 },
      { name: 'Artisan Shoulder Bag', sales: 6 }
    ],
    hourlySales: [
      { hour: '11:00', sales: 650, orders: 2 },
      { hour: '12:00', sales: 980, orders: 4 },
      { hour: '13:00', sales: 1350, orders: 5 },
      { hour: '14:00', sales: 1100, orders: 4 },
      { hour: '15:00', sales: 1250, orders: 5 },
      { hour: '16:00', sales: 1580, orders: 6 },
      { hour: '17:00', sales: 1200, orders: 4 },
      { hour: '18:00', sales: 790, orders: 2 }
    ],
    paymentMethods: [
      { method: 'GrabPay', amount: 3500, count: 13 },
      { method: 'Touch n Go', amount: 2800, count: 10 },
      { method: 'Boost', amount: 1800, count: 6 },
      { method: 'FPX', amount: 800, count: 3 }
    ],
    customerTags: [
      { tag: 'Artist', count: 15 },
      { tag: 'Cultural Enthusiast', count: 22 },
      { tag: 'Instagram', count: 28 },
      { tag: 'Corporate', count: 5 }
    ],
    status: 'completed'
  }
];

const mockRealTimeMetrics: RealTimeMetrics = {
  currentSales: 2847,
  currentOrders: 12,
  activeCustomers: 8,
  salesPerMinute: 47.5,
  topProductNow: 'Batik Heritage Tote',
  busiestHour: '14:00-15:00'
};

export default function PopupAnalytics() {
  const [selectedEvent, setSelectedEvent] = useState<string>('POPUP-001');
  const [timeframe, setTimeframe] = useState<string>('current');
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>(mockRealTimeMetrics);
  const [isLive, setIsLive] = useState<boolean>(true);

  const currentEvent = mockPopupEvents.find(event => event.id === selectedEvent) || mockPopupEvents[0];

  useEffect(() => {
    // Simulate real-time updates
    if (isLive) {
      const interval = setInterval(() => {
        setRealTimeMetrics(prev => ({
          ...prev,
          currentSales: prev.currentSales + Math.floor(Math.random() * 50),
          currentOrders: prev.currentOrders + (Math.random() > 0.7 ? 1 : 0),
          activeCustomers: Math.max(1, prev.activeCustomers + (Math.random() > 0.5 ? 1 : -1)),
          salesPerMinute: prev.salesPerMinute + (Math.random() - 0.5) * 10
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const exportEventReport = (format: 'pdf' | 'csv' | 'presentation') => {
    const event = currentEvent;
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      const csvContent = [
        ['Event Name', 'Date', 'Location', 'Total Sales', 'Orders', 'Customers', 'Avg Order', 'Conversion Rate'],
        [
          event.name,
          event.date,
          event.location,
          event.totalSales,
          event.totalOrders,
          event.uniqueCustomers,
          event.avgOrderValue,
          `${event.conversionRate}%`
        ]
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `popup-report-${event.name.replace(/\s+/g, '-')}-${timestamp}.csv`;
      a.click();
    } else {
      alert(`${format.toUpperCase()} report generation would be implemented with a reporting library`);
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Popup Event Analytics</h1>
          <p className="text-pebble mt-2">Track performance and insights from popup events</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              isLive 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">{isLive ? 'Live' : 'Paused'}</span>
          </button>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-white border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            {mockPopupEvents.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <button 
            onClick={() => exportEventReport('csv')}
            className="btn btn-primary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {timeframe === 'current' && (
        <div className="bg-gradient-to-r from-sage/10 to-gold/10 rounded-2xl p-6 border border-sage/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-indigo">Real-time Event Metrics</h2>
            <div className="flex items-center space-x-2 text-sm text-pebble">
              <Clock className="w-4 h-4" />
              <span>Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pebble text-sm">Current Sales</span>
                <TrendingUp className="w-4 h-4 text-sage" />
              </div>
              <p className="text-2xl font-bold text-indigo">RM {realTimeMetrics.currentSales.toLocaleString()}</p>
              <p className="text-xs text-pebble mt-1">RM {realTimeMetrics.salesPerMinute.toFixed(1)}/min</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pebble text-sm">Orders</span>
                <Zap className="w-4 h-4 text-gold" />
              </div>
              <p className="text-2xl font-bold text-indigo">{realTimeMetrics.currentOrders}</p>
              <p className="text-xs text-pebble mt-1">Active customers: {realTimeMetrics.activeCustomers}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pebble text-sm">Top Product</span>
                <Star className="w-4 h-4 text-terracotta" />
              </div>
              <p className="text-lg font-bold text-indigo truncate">{realTimeMetrics.topProductNow}</p>
              <p className="text-xs text-pebble mt-1">Busiest: {realTimeMetrics.busiestHour}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pebble text-sm">Conversion</span>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-indigo">{currentEvent.conversionRate}%</p>
              <p className="text-xs text-pebble mt-1">Event average</p>
            </div>
          </div>
        </div>
      )}

      {/* Event Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-indigo mt-2">RM {currentEvent.totalSales.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-sage" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-sage" />
            <span className="text-sage font-medium">+12.5%</span>
            <span className="text-pebble">vs last event</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-indigo mt-2">{currentEvent.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gold" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-sage" />
            <span className="text-sage font-medium">+8.3%</span>
            <span className="text-pebble">vs last event</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold text-indigo mt-2">RM {currentEvent.avgOrderValue}</p>
            </div>
            <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-terracotta" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingDown className="w-4 h-4 text-terracotta" />
            <span className="text-terracotta font-medium">-2.1%</span>
            <span className="text-pebble">vs last event</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-indigo mt-2">{currentEvent.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-sage" />
            <span className="text-sage font-medium">+5.7%</span>
            <span className="text-pebble">vs last event</span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-indigo">Event Details</h2>
          <div className="flex items-center space-x-4 text-sm text-pebble">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{currentEvent.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{currentEvent.startTime} - {currentEvent.endTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{currentEvent.location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div>
            <h3 className="text-lg font-bold text-indigo mb-4">Top Performing Products</h3>
            <div className="space-y-3">
              {currentEvent.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sand/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-indigo">{product.name}</p>
                      <p className="text-sm text-pebble">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sage">{product.sales}</p>
                    <p className="text-xs text-pebble">units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-bold text-indigo mb-4">Payment Method Breakdown</h3>
            <div className="space-y-3">
              {currentEvent.paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sand/20 rounded-xl">
                  <div>
                    <p className="font-medium text-indigo">{method.method}</p>
                    <p className="text-sm text-pebble">{method.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sage">RM {method.amount.toLocaleString()}</p>
                    <p className="text-xs text-pebble">{((method.amount / currentEvent.totalSales) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h2 className="text-xl font-display font-bold text-indigo mb-6">Hourly Sales Performance</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {currentEvent.hourlySales.map((hour, index) => {
            const maxSales = Math.max(...currentEvent.hourlySales.map(h => h.sales));
            const height = (hour.sales / maxSales) * 200;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex space-x-1 w-full">
                  <div 
                    className="w-1/2 bg-sage rounded-t-lg"
                    style={{ height: `${height}px` }}
                  ></div>
                  <div 
                    className="w-1/2 bg-gold rounded-t-lg"
                    style={{ height: `${(hour.orders / 10) * 200}px` }}
                  ></div>
                </div>
                <span className="text-xs text-pebble mt-2">{hour.hour}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-sage rounded-full"></div>
            <span className="text-sm text-pebble">Sales (RM)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gold rounded-full"></div>
            <span className="text-sm text-pebble">Orders</span>
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-bold text-indigo mb-4">Customer Tags Distribution</h3>
          <div className="space-y-3">
            {currentEvent.customerTags.map((tag, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-sage rounded-full"></div>
                  <span className="text-sm text-indigo">{tag.tag}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-sand rounded-full h-2">
                    <div 
                      className="bg-sage h-2 rounded-full"
                      style={{ width: `${(tag.count / currentEvent.uniqueCustomers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-indigo">{tag.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-bold text-indigo mb-4">Event Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-sand/20 rounded-xl">
              <span className="text-pebble">Total Visitors</span>
              <span className="font-bold text-indigo">{Math.round(currentEvent.totalOrders / (currentEvent.conversionRate / 100))}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-sand/20 rounded-xl">
              <span className="text-pebble">Sales per Customer</span>
              <span className="font-bold text-sage">RM {Math.round(currentEvent.totalSales / currentEvent.uniqueCustomers)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-sand/20 rounded-xl">
              <span className="text-pebble">Peak Hour</span>
              <span className="font-bold text-gold">{currentEvent.hourlySales.reduce((max, hour) => hour.sales > max.sales ? hour : max, currentEvent.hourlySales[0]).hour}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-sand/20 rounded-xl">
              <span className="text-pebble">Customer Retention</span>
              <span className="font-bold text-terracotta">
                {Math.round((currentEvent.uniqueCustomers / currentEvent.totalOrders) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}