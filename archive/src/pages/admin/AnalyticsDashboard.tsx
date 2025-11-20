import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target, Eye, Calendar } from 'lucide-react';
import FunnelAnalytics from '@/components/admin/FunnelAnalytics';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border-l-4 border-sage hover:shadow-medium transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-pebble text-sm uppercase tracking-wide font-medium">{title}</p>
          <p className="text-3xl font-bold text-indigo mt-2">{value}</p>
          <div className="flex items-center mt-3 space-x-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-sage" />
            ) : (
              <TrendingDown className="w-4 h-4 text-terracotta" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-sage' : 'text-terracotta'
            }`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-pebble">vs last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface ChartData {
  name: string;
  revenue: number;
  orders: number;
}

const chartData: ChartData[] = [
  { name: 'Jan', revenue: 45000, orders: 120 },
  { name: 'Feb', revenue: 52000, orders: 145 },
  { name: 'Mar', revenue: 48000, orders: 132 },
  { name: 'Apr', revenue: 61000, orders: 178 },
  { name: 'May', revenue: 58000, orders: 165 },
  { name: 'Jun', revenue: 67000, orders: 195 },
];

export default function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [realTimeRevenue, setRealTimeRevenue] = useState(67320);

  // Simulate real-time revenue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeRevenue(prev => prev + Math.floor(Math.random() * 100));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Analytics Overview</h1>
          <p className="text-pebble mt-2">Real-time insights into your business performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary">
            <Calendar className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Real-time Revenue"
          value={`RM ${realTimeRevenue.toLocaleString()}`}
          change={12.5}
          icon={DollarSign}
          color="bg-sage"
        />
        <MetricCard
          title="Daily Orders"
          value="24"
          change={8.2}
          icon={ShoppingCart}
          color="bg-gold"
        />
        <MetricCard
          title="Conversion Rate"
          value="3.2%"
          change={-2.1}
          icon={Target}
          color="bg-terracotta"
        />
        <MetricCard
          title="AOV"
          value="RM 285"
          change={5.7}
          icon={TrendingUp}
          color="bg-indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-indigo">Revenue Trend</h2>
            <div className="flex items-center space-x-2 text-sm text-pebble">
              <div className="w-3 h-3 bg-sage rounded-full"></div>
              <span>Revenue</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={data.name} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-sage rounded-t-lg transition-all duration-300 hover:bg-terracotta"
                  style={{ height: `${(data.revenue / 70000) * 200}px` }}
                ></div>
                <span className="text-xs text-pebble mt-2">{data.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-display font-bold text-indigo mb-6">Customer Segments</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-sage rounded-full"></div>
                <span className="text-indigo font-medium">New Customers</span>
              </div>
              <span className="font-bold text-indigo">68%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gold rounded-full"></div>
                <span className="text-indigo font-medium">Returning Customers</span>
              </div>
              <span className="font-bold text-indigo">32%</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-sand">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo">1,247</p>
                <p className="text-sm text-pebble">Total Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sage">2.3x</p>
                <p className="text-sm text-pebble">LTV Multiplier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h2 className="text-xl font-display font-bold text-indigo mb-6">Top Performing Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand">
                <th className="text-left py-3 text-pebble font-medium">Product</th>
                <th className="text-right py-3 text-pebble font-medium">Revenue</th>
                <th className="text-right py-3 text-pebble font-medium">Units Sold</th>
                <th className="text-right py-3 text-pebble font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              <tr className="hover:bg-sand/20">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-sage rounded-lg"></div>
                    <div>
                      <p className="font-medium text-indigo">Batik Heritage Tote</p>
                      <p className="text-sm text-pebble">Handcrafted</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-right font-bold text-indigo">RM 12,450</td>
                <td className="py-4 text-right text-indigo">45</td>
                <td className="py-4 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sage/10 text-sage">
                    4.2%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-sand/20">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gold rounded-lg"></div>
                    <div>
                      <p className="font-medium text-indigo">Traditional Clutch</p>
                      <p className="text-sm text-pebble">Premium</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-right font-bold text-indigo">RM 8,920</td>
                <td className="py-4 text-right text-indigo">32</td>
                <td className="py-4 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold">
                    3.8%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Journey & Funnel Analytics */}
      <FunnelAnalytics />

      {/* Traffic Sources */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h2 className="text-xl font-display font-bold text-indigo mb-6">Traffic Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-sand/20 rounded-xl">
            <Eye className="w-8 h-8 text-sage mx-auto mb-3" />
            <p className="text-2xl font-bold text-indigo">2,847</p>
            <p className="text-sm text-pebble">Organic Search</p>
            <p className="text-xs text-pebble mt-1">45% of total</p>
          </div>
          <div className="text-center p-4 bg-sand/20 rounded-xl">
            <Users className="w-8 h-8 text-gold mx-auto mb-3" />
            <p className="text-2xl font-bold text-indigo">1,523</p>
            <p className="text-sm text-pebble">Social Media</p>
            <p className="text-xs text-pebble mt-1">24% of total</p>
          </div>
          <div className="text-center p-4 bg-sand/20 rounded-xl">
            <Target className="w-8 h-8 text-terracotta mx-auto mb-3" />
            <p className="text-2xl font-bold text-indigo">892</p>
            <p className="text-sm text-pebble">Direct Traffic</p>
            <p className="text-xs text-pebble mt-1">14% of total</p>
          </div>
        </div>
      </div>
    </div>
  );
}