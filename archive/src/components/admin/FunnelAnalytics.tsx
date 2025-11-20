import { useState, useEffect } from 'react';
import { Users, Eye, ShoppingCart, CreditCard, CheckCircle, Repeat, TrendingUp, TrendingDown, Target, Filter } from 'lucide-react';

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface TrafficSource {
  source: string;
  visitors: number;
  conversionRate: number;
  revenue: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface TopProduct {
  name: string;
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
}

interface TrendData {
  date: string;
  visitors: number;
  productViews: number;
  addToCart: number;
  checkouts: number;
  purchases: number;
  repeatPurchases: number;
}

const mockTrafficSources: TrafficSource[] = [
  { source: 'Organic Search', visitors: 3456, conversionRate: 3.2, revenue: 12500, icon: Users, color: 'bg-sage' },
  { source: 'Instagram Ads', visitors: 2890, conversionRate: 4.1, revenue: 15800, icon: Target, color: 'bg-gold' },
  { source: 'Facebook Ads', visitors: 2134, conversionRate: 2.8, revenue: 9200, icon: Users, color: 'bg-terracotta' },
  { source: 'QR Codes', visitors: 567, conversionRate: 6.5, revenue: 4500, icon: Target, color: 'bg-indigo' },
  { source: 'Direct Traffic', visitors: 1890, conversionRate: 3.8, revenue: 7800, icon: Users, color: 'bg-pebble' }
];

const mockTopProducts: TopProduct[] = [
  { name: 'Batik Heritage Tote', views: 1245, addToCart: 89, purchases: 23, conversionRate: 1.8 },
  { name: 'Traditional Clutch Premium', views: 987, addToCart: 76, purchases: 19, conversionRate: 1.9 },
  { name: 'Cultural Crossbody', views: 756, addToCart: 54, purchases: 14, conversionRate: 1.9 },
  { name: 'Artisan Shoulder Bag', views: 654, addToCart: 43, purchases: 11, conversionRate: 1.7 }
];

const mockTrendData: TrendData[] = [
  { date: '2024-01-01', visitors: 1200, productViews: 856, addToCart: 156, checkouts: 89, purchases: 45, repeatPurchases: 12 },
  { date: '2024-01-02', visitors: 1350, productViews: 945, addToCart: 178, checkouts: 98, purchases: 52, repeatPurchases: 15 },
  { date: '2024-01-03', visitors: 1180, productViews: 823, addToCart: 145, checkouts: 82, purchases: 41, repeatPurchases: 9 },
  { date: '2024-01-04', visitors: 1420, productViews: 1023, addToCart: 189, checkouts: 105, purchases: 58, repeatPurchases: 18 },
  { date: '2024-01-05', visitors: 1380, productViews: 967, addToCart: 167, checkouts: 93, purchases: 49, repeatPurchases: 14 },
  { date: '2024-01-06', visitors: 1290, productViews: 887, addToCart: 156, checkouts: 87, purchases: 46, repeatPurchases: 11 }
];

export default function FunnelAnalytics() {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [currentData, setCurrentData] = useState({
    visitors: 1420,
    productViews: 1023,
    addToCart: 189,
    checkouts: 105,
    purchases: 58,
    repeatPurchases: 18
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setCurrentData(prev => ({
        visitors: prev.visitors + Math.floor(Math.random() * 10),
        productViews: prev.productViews + Math.floor(Math.random() * 8),
        addToCart: prev.addToCart + Math.floor(Math.random() * 3),
        checkouts: prev.checkouts + Math.floor(Math.random() * 2),
        purchases: prev.purchases + Math.floor(Math.random() * 1),
        repeatPurchases: prev.repeatPurchases + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const data = selectedSource === 'all' ? currentData : 
      mockTrafficSources.find(s => s.source === selectedSource) ? {
        visitors: mockTrafficSources.find(s => s.source === selectedSource)!.visitors,
        productViews: Math.floor(mockTrafficSources.find(s => s.source === selectedSource)!.visitors * 0.72),
        addToCart: Math.floor(mockTrafficSources.find(s => s.source === selectedSource)!.visitors * 0.13),
        checkouts: Math.floor(mockTrafficSources.find(s => s.source === selectedSource)!.visitors * 0.074),
        purchases: Math.floor(mockTrafficSources.find(s => s.source === selectedSource)!.visitors * 0.041),
        repeatPurchases: Math.floor(mockTrafficSources.find(s => s.source === selectedSource)!.visitors * 0.013)
      } : currentData;

    const stages: FunnelStage[] = [
      {
        name: 'Visitors',
        count: data.visitors,
        percentage: 100,
        dropOff: 0,
        icon: Users,
        color: 'bg-sage'
      },
      {
        name: 'Product Views',
        count: data.productViews,
        percentage: Math.round((data.productViews / data.visitors) * 100),
        dropOff: data.visitors - data.productViews,
        icon: Eye,
        color: 'bg-gold'
      },
      {
        name: 'Add to Cart',
        count: data.addToCart,
        percentage: Math.round((data.addToCart / data.productViews) * 100),
        dropOff: data.productViews - data.addToCart,
        icon: ShoppingCart,
        color: 'bg-terracotta'
      },
      {
        name: 'Checkout Started',
        count: data.checkouts,
        percentage: Math.round((data.checkouts / data.addToCart) * 100),
        dropOff: data.addToCart - data.checkouts,
        icon: CreditCard,
        color: 'bg-indigo'
      },
      {
        name: 'Payment Completed',
        count: data.purchases,
        percentage: Math.round((data.purchases / data.checkouts) * 100),
        dropOff: data.checkouts - data.purchases,
        icon: CheckCircle,
        color: 'bg-green-500'
      },
      {
        name: 'Repeat Purchases',
        count: data.repeatPurchases,
        percentage: Math.round((data.repeatPurchases / data.purchases) * 100),
        dropOff: data.purchases - data.repeatPurchases,
        icon: Repeat,
        color: 'bg-purple-500'
      }
    ];

    setFunnelData(stages);
  }, [selectedSource, currentData]);

  const calculateConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-indigo">Customer Journey & Funnel Analytics</h2>
          <p className="text-pebble mt-2">Track customer behavior from discovery to repeat purchase</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 bg-white border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 bg-white border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="all">All Traffic Sources</option>
            {mockTrafficSources.map(source => (
              <option key={source.source} value={source.source}>{source.source}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="bg-white rounded-2xl p-8 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-indigo">Conversion Funnel</h3>
          <div className="text-sm text-pebble">
            Overall Conversion Rate: <span className="font-bold text-sage">{funnelData.length > 0 ? funnelData[funnelData.length - 2].percentage : 0}%</span>
          </div>
        </div>

        <div className="space-y-4">
          {funnelData.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === funnelData.length - 1;
            const conversionRate = index > 0 ? 
              Math.round((stage.count / funnelData[index - 1].count) * 100) : 100;
            
            return (
              <div key={stage.name} className="relative">
                <div className="flex items-center space-x-6">
                  {/* Stage Icon */}
                  <div className={`w-16 h-16 ${stage.color} rounded-2xl flex items-center justify-center text-white shadow-medium`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-indigo">{stage.name}</h4>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo">{stage.count.toLocaleString()}</p>
                        <p className="text-sm text-pebble">{stage.percentage}% conversion</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-sand rounded-full h-3 mb-2">
                      <div 
                        className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>

                    {/* Conversion Rate */}
                    {index > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-pebble">
                          Drop-off: <span className="font-medium text-terracotta">{stage.dropOff.toLocaleString()}</span>
                        </span>
                        <span className="text-pebble">
                          Conversion: <span className="font-medium text-sage">{conversionRate}%</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow between stages */}
                {!isLast && (
                  <div className="flex justify-center mt-4 mb-2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-sand"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Traffic Source Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-xl font-display font-bold text-indigo mb-6">Traffic Source Performance</h3>
          <div className="space-y-4">
            {mockTrafficSources.map((source, index) => {
              const Icon = source.icon;
              const prevData = mockTrafficSources[index]; // In real app, compare with previous period
              const conversionChange = Math.random() * 20 - 10; // Mock change
              
              return (
                <div key={source.source} className="flex items-center justify-between p-4 bg-sand/20 rounded-xl hover:bg-sand/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${source.color} rounded-lg flex items-center justify-center text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo">{source.source}</p>
                      <p className="text-sm text-pebble">{source.visitors.toLocaleString()} visitors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo">{source.conversionRate}%</p>
                    <div className="flex items-center space-x-1 text-sm">
                      {conversionChange >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-sage" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-terracotta" />
                      )}
                      <span className={conversionChange >= 0 ? 'text-sage' : 'text-terracotta'}>
                        {Math.abs(conversionChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products by Funnel Stage */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-xl font-display font-bold text-indigo mb-6">Top Products by Funnel Stage</h3>
          <div className="space-y-3">
            {mockTopProducts.map((product, index) => (
              <div key={index} className="p-4 bg-sand/20 rounded-xl hover:bg-sand/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-indigo">{product.name}</p>
                  <span className="text-sm font-bold text-sage">{product.conversionRate}% conversion</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-indigo">{product.views}</p>
                    <p className="text-xs text-pebble">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gold">{product.addToCart}</p>
                    <p className="text-xs text-pebble">Add to Cart</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-sage">{product.purchases}</p>
                    <p className="text-xs text-pebble">Purchases</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h3 className="text-xl font-display font-bold text-indigo mb-6">Funnel Trends Over Time</h3>
        <div className="h-64 relative">
          {/* Simple line chart representation */}
          <div className="flex items-end justify-between h-full space-x-2">
            {mockTrendData.map((data, index) => {
              const maxVisitors = Math.max(...mockTrendData.map(d => d.visitors));
              const height = (data.visitors / maxVisitors) * 200;
              
              return (
                <div key={data.date} className="flex flex-col items-center flex-1">
                  <div className="relative w-full h-full flex items-end">
                    {/* Visitors */}
                    <div 
                      className="bg-sage/60 rounded-t w-full mr-1"
                      style={{ height: `${(data.visitors / maxVisitors) * 100}%` }}
                    ></div>
                    {/* Product Views */}
                    <div 
                      className="bg-gold/60 rounded-t w-full mr-1"
                      style={{ height: `${(data.productViews / maxVisitors) * 100}%` }}
                    ></div>
                    {/* Add to Cart */}
                    <div 
                      className="bg-terracotta/60 rounded-t w-full mr-1"
                      style={{ height: `${(data.addToCart / maxVisitors) * 100}%` }}
                    ></div>
                    {/* Purchases */}
                    <div 
                      className="bg-green-500/60 rounded-t w-full"
                      style={{ height: `${(data.purchases / maxVisitors) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-pebble mt-2">{data.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-sage rounded-full"></div>
            <span className="text-sm text-pebble">Visitors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gold rounded-full"></div>
            <span className="text-sm text-pebble">Product Views</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-terracotta rounded-full"></div>
            <span className="text-sm text-pebble">Add to Cart</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-pebble">Purchases</span>
          </div>
        </div>
      </div>

      {/* Real-time Updates Indicator */}
      <div className="bg-sage/10 border border-sage/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-sage rounded-full animate-pulse"></div>
          <span className="text-sage font-medium">Live data - Updates every 5 seconds</span>
          <span className="text-pebble text-sm ml-auto">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}