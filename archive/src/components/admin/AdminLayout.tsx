import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Heart, 
  TrendingUp, 
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Route,
  Store
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Impact', href: '/admin/impact', icon: Heart },
  { name: 'Marketing', href: '/admin/marketing', icon: TrendingUp },
  { name: 'Automation', href: '/admin/automation', icon: Settings },
  { name: 'Journey', href: '/admin/journey', icon: Route },
  { name: 'Popup Sales', href: '/admin/popup', icon: Store },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-ivory font-body">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-strong">
            <div className="flex items-center justify-between p-6 border-b border-sand">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-lg font-display font-bold text-indigo">Reweave Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-sand">
                <X className="w-5 h-5 text-indigo" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-sage text-white shadow-medium'
                        : 'text-indigo hover:bg-sand hover:text-terracotta'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:shadow-strong lg:border-r lg:border-sand">
        <div className="flex items-center space-x-3 p-6 border-b border-sand">
          <div className="w-10 h-10 bg-sage rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="text-2xl font-display font-bold text-indigo">Reweave Admin</span>
        </div>
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-sage text-white shadow-medium'
                    : 'text-indigo hover:bg-sand hover:text-terracotta'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white/95 backdrop-blur-md shadow-soft border-b border-sand">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-sand text-indigo"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pebble" />
                <input
                  type="text"
                  placeholder="Search orders, customers, products..."
                  className="pl-10 pr-4 py-2 w-64 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg hover:bg-sand text-indigo">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-terracotta rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-indigo">Admin User</p>
                  <p className="text-xs text-pebble">Founder</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-sand text-pebble">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-ivory min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}