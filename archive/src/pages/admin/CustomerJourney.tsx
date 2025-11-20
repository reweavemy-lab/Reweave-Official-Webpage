import { useState, useEffect } from 'react';
import { Users, Eye, ShoppingCart, CreditCard, CheckCircle, Repeat, TrendingUp, TrendingDown, Target, Filter, BarChart3, Clock, ArrowRight, MousePointer } from 'lucide-react';
import { funnelService } from '@/services/funnelService';

interface JourneyStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
  avgTimeSpent: number;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface TrafficSourceJourney {
  source: string;
  visitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  repeatPurchases: number;
  conversionRate: number;
  avgOrderValue: number;
  totalRevenue: number;
}

interface ProductJourneyData {
  productId: string;
  name: string;
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
  avgTimeToPurchase: number;
  dropOffStage: string;
}

interface JourneyTrend {
  date: string;
  visitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  repeatPurchases: number;
  conversionRate: number;
}

const mockTrafficSources: TrafficSourceJourney[] = [
  {
    source: 'Organic Search',
    visitors: 3456,
    productViews: 2489,
    addToCart: 456,
    checkoutStarted: 234,
    purchases: 156,
    repeatPurchases: 23,
    conversionRate: 4.5,
    avgOrderValue: 285,
    totalRevenue: 44460
  },
  {
    source: 'Instagram Ads',
    visitors: 2890,
    productViews: 2134,
    addToCart: 412,
    checkoutStarted: 198,
    purchases: 145,
    repeatPurchases: 34,
    conversionRate: 5.0,
    avgOrderValue: 320,
    totalRevenue: 46400
  },
  {
    source: 'Facebook Ads',
    visitors: 2134,
    productViews: 1567,
    addToCart: 298,
    checkoutStarted: 145,
    purchases: 89,
    repeatPurchases: 12,
    conversionRate: 4.2,
    avgOrderValue: 295,
    totalRevenue: 26255
  },
  {
    source: 'QR Codes',
    visitors: 567,
    productViews: 456,
    addToCart: 123,
    checkoutStarted: 78,
    purchases: 45,
    repeatPurchases: 8,
    conversionRate: 7.9,
    avgOrderValue: 450,
    totalRevenue: 20250
  },
  {
    source: 'Direct Traffic',
    visitors: 1890,
    productViews: 1423,
    addToCart: 267,
    checkoutStarted: 134,
    purchases: 89,
    repeatPurchases: 18,
    conversionRate: 4.7,
    avgOrderValue: 310,
    totalRevenue: 27590
  }
];

const mockProductJourneyData: ProductJourneyData[] = [
  {
    productId: 'PROD-001',
    name: 'Batik Heritage Tote',
    views: 1245,
    addToCart: 189,
    purchases: 45,
    conversionRate: 3.6,
    revenue: 12825,
    avgTimeToPurchase: 2.3,
    dropOffStage: 'Add to Cart'
  },
  {
    productId: 'PROD-002',
    name: 'Traditional Clutch Premium',
    views: 987,
    addToCart: 156,
    purchases: 38,
    conversionRate: 3.9,
    revenue: 17100,
    avgTimeToPurchase: 1.8,
    dropOffStage: 'Checkout'
  },
  {
    productId: 'PROD-003',
    name: 'Cultural Crossbody',
    views: 756,
    addToCart: 98,
    purchases: 21,
    conversionRate: 2.8,
    revenue: 4095,
    avgTimeToPurchase: 3.1,
    dropOffStage: 'Product View'
  },
  {
    productId: 'PROD-004',
    name: 'Artisan Shoulder Bag',
    views: 654,
    addToCart: 89,
    purchases: 19,
    conversionRate: 2.9,
    revenue: 5890,
    avgTimeToPurchase: 2.7,
    dropOffStage: 'Add to Cart'
  }
];

const mockJourneyTrends: JourneyTrend[] = [
  { date: '2024-01-01', visitors: 1200, productViews: 856, addToCart: 156, checkoutStarted: 89, purchases: 45, repeatPurchases: 12, conversionRate: 3.8 },
  { date: '2024-01-02', visitors: 1350, productViews: 945, addToCart: 178, checkoutStarted: 98, purchases: 52, repeatPurchases: 15, conversionRate: 3.9 },
  { date: '2024-01-03', visitors: 1180, productViews: 823, addToCart: 145, checkoutStarted: 82, purchases: 41, repeatPurchases: 9, conversionRate: 3.5 },
  { date: '2024-01-04', visitors: 1420, productViews: 1023, addToCart: 189, checkoutStarted: 105, purchases: 58, repeatPurchases: 18, conversionRate: 4.1 },
  { date: '2024-01-05', visitors: 1380, productViews: 967, addToCart: 167, checkoutStarted: 93, purchases: 49, repeatPurchases: 14, conversionRate: 3.6 },
  { date: '2024-01-06', visitors: 1290, productViews: 887, addToCart: 156, checkoutStarted: 87, purchases: 46, repeatPurchases: 11, conversionRate: 3.6 }
];

export default function CustomerJourney() {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([]);
  const [currentData, setCurrentData] = useState({
    visitors: 10837,
    productViews: 7865,
    addToCart: 1456,
    checkoutStarted: 736,
    purchases: 427,
    repeatPurchases: 93
  });
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use mock data directly since API is not available in development
  useEffect(() => {
    setLoading(false);
    // Keep mock data for demo purposes
    setCurrentData({
      visitors: 10837,
      productViews: 7865,
      addToCart: 1456,
      checkoutStarted: 736,
      purchases: 427,
      repeatPurchases: 93
    });
  }, []);

  // Simulate real-time data updates (will be replaced with WebSocket in production)
  useEffect(() => {
    if (!liveUpdates || loading) return;
    
    const interval = setInterval(() => {
      setCurrentData(prev => ({
        visitors: prev.visitors + Math.floor(Math.random() * 15),
        productViews: prev.productViews + Math.floor(Math.random() * 12),
        addToCart: prev.addToCart + Math.floor(Math.random() * 5),
        checkoutStarted: prev.checkoutStarted + Math.floor(Math.random() * 3),
        purchases: prev.purchases + Math.floor(Math.random() * 2),
        repeatPurchases: prev.repeatPurchases + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [liveUpdates, loading]);

  useEffect(() => {
    const data = selectedSource === 'all' ? currentData : 
      mockTrafficSources.find(s => s.source === selectedSource) ? {
        visitors: mockTrafficSources.find(s => s.source === selectedSource)!.visitors,
        productViews: mockTrafficSources.find(s => s.source === selectedSource)!.productViews,
        addToCart: mockTrafficSources.find(s => s.source === selectedSource)!.addToCart,
        checkoutStarted: mockTrafficSources.find(s => s.source === selectedSource)!.checkoutStarted,
        purchases: mockTrafficSources.find(s => s.source === selectedSource)!.purchases,
        repeatPurchases: mockTrafficSources.find(s => s.source === selectedSource)!.repeatPurchases
      } : currentData;

    const stages: JourneyStage[] = [
      {
        id: 'visitors',
        name: 'Website Visitors',
        count: data.visitors,
        percentage: 100,
        dropOff: 0,
        avgTimeSpent: 2.5,
        icon: Users,
        color: 'bg-sage',
        description: 'Unique visitors to the website'
      },
      {
        id: 'productViews',
        name: 'Product Views',
        count: data.productViews,
        percentage: Math.round((data.productViews / data.visitors) * 100),
        dropOff: data.visitors - data.productViews,
        avgTimeSpent: 4.2,
        icon: Eye,
        color: 'bg-gold',
        description: 'Visitors who viewed product pages'
      },
      {
        id: 'addToCart',
        name: 'Add to Cart',
        count: data.addToCart,
        percentage: Math.round((data.addToCart / data.productViews) * 100),
        dropOff: data.productViews - data.addToCart,
        avgTimeSpent: 6.8,
        icon: ShoppingCart,
        color: 'bg-terracotta',
        description: 'Product viewers who added items to cart'
      },
      {
        id: 'checkoutStarted',
        name: 'Checkout Started',
        count: data.checkoutStarted,
        percentage: Math.round((data.checkoutStarted / data.addToCart) * 100),
        dropOff: data.addToCart - data.checkoutStarted,
        avgTimeSpent: 8.5,
        icon: CreditCard,
        color: 'bg-indigo',
        description: 'Cart users who started checkout process'
      },
      {
        id: 'purchases',
        name: 'Purchase Completed',
        count: data.purchases,
        percentage: Math.round((data.purchases / data.checkoutStarted) * 100),
        dropOff: data.checkoutStarted - data.purchases,
        avgTimeSpent: 12.3,
        icon: CheckCircle,
        color: 'bg-green-500',
        description: 'Checkouts that resulted in successful purchase'
      },
      {
        id: 'repeatPurchases',
        name: 'Repeat Purchases',
        count: data.repeatPurchases,
        percentage: Math.round((data.repeatPurchases / data.purchases) * 100),
        dropOff: data.purchases - data.repeatPurchases,
        avgTimeSpent: 168.5, // Hours
        icon: Repeat,
        color: 'bg-purple-500',
        description: 'Customers who made repeat purchases'
      }
    ];

    setJourneyStages(stages);
  }, [selectedSource, currentData]);

  const calculateConversionMetrics = () => {
    const overallConversion = journeyStages.length > 0 ? 
      ((journeyStages[4].count / journeyStages[0].count) * 100) : 0;
    
    const avgTimeToPurchase = journeyStages.reduce((sum, stage) => sum + stage.avgTimeSpent, 0) / journeyStages.length;
    const totalDropOff = journeyStages.reduce((sum, stage) => sum + stage.dropOff, 0);
    
    return { overallConversion, avgTimeToPurchase, totalDropOff };
  };

  const { overallConversion, avgTimeToPurchase, totalDropOff } = calculateConversionMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-sage animate-pulse" />
          </div>
          <p className="text-pebble">Loading journey analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-terracotta" />
          </div>
          <p className="text-terracotta font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Customer Journey Analytics</h1>
          <p className="text-pebble mt-2">Track the complete customer journey from discovery to loyalty</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setLiveUpdates(!liveUpdates)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              liveUpdates 
                ? 'bg-sage text-white shadow-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${liveUpdates ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">{liveUpdates ? 'Live' : 'Paused'}</span>
          </button>
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Overall Conversion</p>
              <p className="text-3xl font-bold text-indigo">{overallConversion.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-sage" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-sage" />
            <span className="text-sage font-medium">+0.8%</span>
            <span className="text-pebble">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Avg. Time to Purchase</p>
              <p className="text-3xl font-bold text-indigo">{avgTimeToPurchase.toFixed(1)}m</p>
            </div>
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-gold" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingDown className="w-4 h-4 text-terracotta" />
            <span className="text-terracotta font-medium">-2.3m</span>
            <span className="text-pebble">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Total Drop-offs</p>
              <p className="text-3xl font-bold text-indigo">{totalDropOff.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-terracotta" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingDown className="w-4 h-4 text-sage" />
            <span className="text-sage font-medium">-5.2%</span>
            <span className="text-pebble">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-pebble text-sm font-medium">Repeat Purchase Rate</p>
              <p className="text-3xl font-bold text-indigo">
                {journeyStages.length > 0 ? journeyStages[5].percentage : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Repeat className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-sage" />
            <span className="text-sage font-medium">+1.2%</span>
            <span className="text-pebble">vs last period</span>
          </div>
        </div>
      </div>

      {/* Journey Funnel Visualization */}
      <div className="bg-white rounded-2xl p-8 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-indigo">Customer Journey Funnel</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
            >
              <option value="all">All Traffic Sources</option>
              {mockTrafficSources.map(source => (
                <option key={source.source} value={source.source}>{source.source}</option>
              ))}
            </select>
            <div className="text-sm text-pebble">
              Total Visitors: <span className="font-bold text-indigo">{currentData.visitors.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {journeyStages.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === journeyStages.length - 1;
            const conversionRate = index > 0 ? 
              Math.round((stage.count / journeyStages[index - 1].count) * 100) : 100;
            const dropOffRate = index > 0 ? 
              Math.round(((journeyStages[index - 1].count - stage.count) / journeyStages[index - 1].count) * 100) : 0;
            
            return (
              <div key={stage.id} className="relative">
                <div className="flex items-center space-x-6">
                  {/* Stage Icon with Progress Ring */}
                  <div className="relative">
                    <div className={`w-20 h-20 ${stage.color} rounded-2xl flex items-center justify-center text-white shadow-strong`}>
                      <Icon className="w-10 h-10" />
                    </div>
                    {index > 0 && (
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-medium">
                        <div className="text-xs font-bold text-indigo">
                          {conversionRate}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-indigo">{stage.name}</h3>
                        <p className="text-sm text-pebble">{stage.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-indigo">{stage.count.toLocaleString()}</p>
                        <p className="text-sm text-pebble">{stage.percentage}% of total</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-sand rounded-full h-4 mb-3">
                      <div 
                        className={`${stage.color} h-4 rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-pebble" />
                          <span className="text-pebble">Avg: {stage.avgTimeSpent}{index === 5 ? 'h' : 'm'}</span>
                        </div>
                        {index > 0 && (
                          <div className="flex items-center space-x-1">
                            <TrendingDown className="w-3 h-3 text-terracotta" />
                            <span className="text-terracotta">{dropOffRate}% drop-off</span>
                          </div>
                        )}
                      </div>
                      <div className="text-pebble">
                        {index > 0 && (
                          <span>Lost: {stage.dropOff.toLocaleString()} visitors</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow between stages */}
                {!isLast && (
                  <div className="flex justify-center mt-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-sand"></div>
                      <ArrowRight className="w-5 h-5 text-sand" />
                      <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-sand"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Traffic Source Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h3 className="text-xl font-display font-bold text-indigo mb-6">Journey Performance by Traffic Source</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand/20">
              <tr>
                <th className="px-4 py-3 text-left text-pebble font-medium">Source</th>
                <th className="px-4 py-3 text-left text-pebble font-medium">Visitors</th>
                <th className="px-4 py-3 text-left text-pebble font-medium">Conversion</th>
                <th className="px-4 py-3 text-left text-pebble font-medium">AOV</th>
                <th className="px-4 py-3 text-left text-pebble font-medium">Revenue</th>
                <th className="px-4 py-3 text-left text-pebble font-medium">Repeat Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {mockTrafficSources.map((source, index) => (
                <tr key={index} className="hover:bg-sand/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-sage/10 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-sage" />
                      </div>
                      <span className="font-medium text-indigo">{source.source}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-indigo">{source.visitors.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-bold text-sage">{source.conversionRate}%</span>
                      <div className="text-xs text-pebble">{source.purchases} purchases</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-indigo">RM {source.avgOrderValue}</td>
                  <td className="px-4 py-3 font-bold text-indigo">RM {source.totalRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-purple-500">
                        {Math.round((source.repeatPurchases / source.purchases) * 100)}%
                      </span>
                      <div className="text-xs text-pebble">{source.repeatPurchases} repeat</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Journey Analysis */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h3 className="text-xl font-display font-bold text-indigo mb-6">Product Journey Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-indigo">Top Converting Products</h4>
            {mockProductJourneyData.slice(0, 3).map((product, index) => (
              <div key={product.productId} className="p-4 bg-sand/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-indigo">{product.name}</span>
                  <span className="text-sm font-bold text-sage">{product.conversionRate}%</span>
                </div>
                <div className="text-xs text-pebble mb-2">
                  {product.views.toLocaleString()} views → {product.purchases} purchases
                </div>
                <div className="text-xs text-pebble">
                  RM {product.revenue.toLocaleString()} revenue • Avg: {product.avgTimeToPurchase} days
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-indigo">Drop-off Analysis</h4>
            {mockProductJourneyData.slice(0, 3).map((product, index) => (
              <div key={product.productId} className="p-4 bg-terracotta/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-indigo">{product.name}</span>
                  <span className="text-sm font-bold text-terracotta">{product.dropOffStage}</span>
                </div>
                <div className="w-full bg-sand rounded-full h-2 mb-2">
                  <div 
                    className="bg-terracotta h-2 rounded-full"
                    style={{ width: `${product.conversionRate * 10}%` }}
                  ></div>
                </div>
                <div className="text-xs text-pebble">
                  Main drop-off at: {product.dropOffStage} stage
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journey Trends */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h3 className="text-xl font-display font-bold text-indigo mb-6">Journey Trends Over Time</h3>
        <div className="h-80 relative">
          {/* Multi-line trend chart */}
          <div className="flex items-end justify-between h-full space-x-1">
            {mockJourneyTrends.map((data, index) => {
              const maxVisitors = Math.max(...mockJourneyTrends.map(d => d.visitors));
              return (
                <div key={data.date} className="flex flex-col items-center flex-1 relative">
                  {/* Trend lines */}
                  <div className="absolute bottom-0 w-full flex items-end justify-center space-x-1">
                    <div 
                      className="bg-sage/70 rounded-t w-1"
                      style={{ height: `${(data.visitors / maxVisitors) * 200}px` }}
                    ></div>
                    <div 
                      className="bg-gold/70 rounded-t w-1"
                      style={{ height: `${(data.productViews / maxVisitors) * 200}px` }}
                    ></div>
                    <div 
                      className="bg-terracotta/70 rounded-t w-1"
                      style={{ height: `${(data.addToCart / maxVisitors) * 200}px` }}
                    ></div>
                    <div 
                      className="bg-indigo/70 rounded-t w-1"
                      style={{ height: `${(data.purchases / maxVisitors) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-pebble mt-2 absolute -bottom-6">{data.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-8">
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
            <div className="w-3 h-3 bg-indigo rounded-full"></div>
            <span className="text-sm text-pebble">Purchases</span>
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="bg-sage/10 border border-sage/20 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${liveUpdates ? 'bg-sage animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sage font-medium">
              {liveUpdates ? 'Live journey tracking active' : 'Updates paused'}
            </span>
          </div>
          <div className="text-sm text-pebble">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}