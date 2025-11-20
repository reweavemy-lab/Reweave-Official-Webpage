import { useState } from 'react';
import { Heart, ShoppingBag, DollarSign, Leaf, Users, TrendingUp, Download, Calendar } from 'lucide-react';

interface ImpactMetricProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

function ImpactMetric({ title, value, change, icon: Icon, color, description }: ImpactMetricProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border-l-4 border-sage hover:shadow-medium transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-sage" />
          ) : (
            <TrendingUp className="w-4 h-4 text-terracotta rotate-180" />
          )}
          <span className={`text-sm font-medium ${
            isPositive ? 'text-sage' : 'text-terracotta'
          }`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-pebble text-sm uppercase tracking-wide font-medium">{title}</p>
        <p className="text-3xl font-bold text-indigo mt-2">{value}</p>
        <p className="text-sm text-pebble mt-2">{description}</p>
      </div>
    </div>
  );
}

interface MonthlyData {
  month: string;
  orders: number;
  bagsSold: number;
  wagesPaid: number;
  materialsUpcycled: number;
}

const monthlyData: MonthlyData[] = [
  { month: 'Jul', orders: 145, bagsSold: 167, wagesPaid: 12500, materialsUpcycled: 234 },
  { month: 'Aug', orders: 167, bagsSold: 189, wagesPaid: 14200, materialsUpcycled: 267 },
  { month: 'Sep', orders: 189, bagsSold: 212, wagesPaid: 15800, materialsUpcycled: 298 },
  { month: 'Oct', orders: 212, bagsSold: 245, wagesPaid: 17500, materialsUpcycled: 334 },
  { month: 'Nov', orders: 234, bagsSold: 267, wagesPaid: 19200, materialsUpcycled: 367 },
  { month: 'Dec', orders: 267, bagsSold: 298, wagesPaid: 21800, materialsUpcycled: 412 },
];

export default function ImpactDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [showReportModal, setShowReportModal] = useState(false);

  const totalWagesPaid = monthlyData.reduce((sum, data) => sum + data.wagesPaid, 0);
  const totalMaterialsUpcycled = monthlyData.reduce((sum, data) => sum + data.materialsUpcycled, 0);
  const totalBagsSold = monthlyData.reduce((sum, data) => sum + data.bagsSold, 0);
  const totalOrders = monthlyData.reduce((sum, data) => sum + data.orders, 0);

  const handleGenerateReport = () => {
    setShowReportModal(true);
    // Simulate report generation
    setTimeout(() => {
      setShowReportModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Impact Dashboard</h1>
          <p className="text-pebble mt-2">Measuring our positive impact on community and environment</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={handleGenerateReport}
            className="btn btn-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ImpactMetric
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          change={23.5}
          icon={ShoppingBag}
          color="bg-sage"
          description="Supporting artisan livelihoods"
        />
        <ImpactMetric
          title="Bags Sold"
          value={totalBagsSold.toLocaleString()}
          change={18.2}
          icon={ShoppingBag}
          color="bg-gold"
          description="Handcrafted sustainable fashion"
        />
        <ImpactMetric
          title="Wages Paid"
          value={`RM ${(totalWagesPaid / 1000).toFixed(1)}k`}
          change={31.7}
          icon={DollarSign}
          color="bg-terracotta"
          description="Fair wages to artisans"
        />
        <ImpactMetric
          title="Materials Upcycled"
          value={`${totalMaterialsUpcycled} kg`}
          change={28.9}
          icon={Leaf}
          color="bg-indigo"
          description="Waste diverted from landfills"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Impact Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-indigo">Monthly Impact Trend</h2>
            <div className="flex items-center space-x-2 text-sm text-pebble">
              <div className="w-3 h-3 bg-sage rounded-full"></div>
              <span>Orders</span>
              <div className="w-3 h-3 bg-gold rounded-full ml-4"></div>
              <span>Bags Sold</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div className="flex space-x-1 w-full">
                  <div 
                    className="w-1/2 bg-sage rounded-t-lg transition-all duration-300 hover:bg-terracotta"
                    style={{ height: `${(data.orders / 300) * 200}px` }}
                  ></div>
                  <div 
                    className="w-1/2 bg-gold rounded-t-lg transition-all duration-300 hover:bg-terracotta"
                    style={{ height: `${(data.bagsSold / 350) * 200}px` }}
                  ></div>
                </div>
                <span className="text-xs text-pebble mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Artisan Impact */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-display font-bold text-indigo mb-6">Artisan Impact</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-sage/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-sage" />
                <div>
                  <p className="font-medium text-indigo">Active Artisans</p>
                  <p className="text-sm text-pebble">Currently working with us</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-indigo">47</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gold/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-gold" />
                <div>
                  <p className="font-medium text-indigo">Avg. Monthly Income</p>
                  <p className="text-sm text-pebble">Per artisan family</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-indigo">RM 2,150</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-terracotta/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-terracotta" />
                <div>
                  <p className="font-medium text-indigo">Families Supported</p>
                  <p className="text-sm text-pebble">Direct beneficiaries</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-indigo">189</span>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <h2 className="text-xl font-display font-bold text-indigo mb-6">Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-sage/10 rounded-xl">
            <Leaf className="w-12 h-12 text-sage mx-auto mb-4" />
            <p className="text-3xl font-bold text-indigo mb-2">{totalMaterialsUpcycled}</p>
            <p className="text-pebble font-medium">Kilograms of Waste Diverted</p>
            <p className="text-sm text-pebble mt-2">Equivalent to {Math.round(totalMaterialsUpcycled * 2.5)} plastic bottles</p>
          </div>
          <div className="text-center p-6 bg-gold/10 rounded-xl">
            <ShoppingBag className="w-12 h-12 text-gold mx-auto mb-4" />
            <p className="text-3xl font-bold text-indigo mb-2">{Math.round(totalBagsSold * 0.8)}</p>
            <p className="text-pebble font-medium">Kg CO₂ Emissions Saved</p>
            <p className="text-sm text-pebble mt-2">Compared to new material production</p>
          </div>
          <div className="text-center p-6 bg-terracotta/10 rounded-xl">
            <Heart className="w-12 h-12 text-terracotta mx-auto mb-4" />
            <p className="text-3xl font-bold text-indigo mb-2">{Math.round(totalMaterialsUpcycled * 0.6)}</p>
            <p className="text-pebble font-medium">Kg Water Saved</p>
            <p className="text-sm text-pebble mt-2">Through upcycling vs. new production</p>
          </div>
        </div>
      </div>

      {/* Monthly Report Generation */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-indigo mb-2">Automated Monthly Impact Report</h2>
            <p className="text-pebble">Comprehensive impact summary for stakeholders and partners</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn btn-outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </button>
            <button 
              onClick={handleGenerateReport}
              className="btn btn-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Now
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-sand/20 rounded-xl">
          <h3 className="font-medium text-indigo mb-3">Report Includes:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-pebble">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-sage rounded-full"></div>
              <span>Artisan income and employment statistics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-sage rounded-full"></div>
              <span>Environmental impact metrics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-sage rounded-full"></div>
              <span>Community development indicators</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-sage rounded-full"></div>
              <span>Product sustainability analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-sage" />
              </div>
              <h3 className="text-xl font-display font-bold text-indigo mb-2">Generating Report</h3>
              <p className="text-pebble">Please wait while we prepare your impact report...</p>
              <div className="mt-4">
                <div className="w-full bg-sand rounded-full h-2">
                  <div className="bg-sage h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}