import { useState, useEffect } from 'react';
import { User, Phone, Instagram, Mail, Calendar, Tag, Users, Download, Search, Filter, Star, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

interface PopupCustomer {
  id: string;
  name: string;
  phone: string;
  instagram?: string;
  email?: string;
  firstPurchaseDate: string;
  totalPurchases: number;
  totalSpent: number;
  eventName: string;
  tags: string[];
  loyaltyPoints: number;
  lastPurchaseDate: string;
  isVip: boolean;
  notes?: string;
}

interface PopupEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  totalCustomers: number;
  totalRevenue: number;
  status: 'upcoming' | 'active' | 'completed';
}

const mockPopupCustomers: PopupCustomer[] = [
  {
    id: 'CUST-001',
    name: 'Sarah Lim',
    phone: '+60 12-345 6789',
    instagram: '@sarahlim_batik',
    email: 'sarah@email.com',
    firstPurchaseDate: '2024-01-15',
    totalPurchases: 3,
    totalSpent: 850,
    eventName: 'Batik Pop-up @ Central Market',
    tags: ['VIP', 'Instagram', 'Repeat Customer'],
    loyaltyPoints: 850,
    lastPurchaseDate: '2024-01-15',
    isVip: true,
    notes: 'Loves traditional patterns, prefers earth tones'
  },
  {
    id: 'CUST-002',
    name: 'John Tan',
    phone: '+60 16-987 6543',
    instagram: '@jtan_style',
    email: 'john.tan@email.com',
    firstPurchaseDate: '2024-01-15',
    totalPurchases: 1,
    totalSpent: 285,
    eventName: 'Batik Pop-up @ Central Market',
    tags: ['New Customer', 'Male', 'Corporate'],
    loyaltyPoints: 285,
    lastPurchaseDate: '2024-01-15',
    isVip: false,
    notes: 'Corporate buyer, interested in bulk orders'
  },
  {
    id: 'CUST-003',
    name: 'Maria Wong',
    phone: '+60 11-234 5678',
    instagram: '@mariawong_art',
    email: 'maria@artmail.com',
    firstPurchaseDate: '2024-01-14',
    totalPurchases: 2,
    totalSpent: 675,
    eventName: 'Artisan Market @ Publika',
    tags: ['Artist', 'Instagram', 'Cultural Enthusiast'],
    loyaltyPoints: 675,
    lastPurchaseDate: '2024-01-14',
    isVip: false,
    notes: 'Art enthusiast, loves cultural stories behind products'
  }
];

const mockEvents: PopupEvent[] = [
  {
    id: 'EVENT-001',
    name: 'Batik Pop-up @ Central Market',
    date: '2024-01-15',
    location: 'Central Market, KL',
    totalCustomers: 47,
    totalRevenue: 12500,
    status: 'completed'
  },
  {
    id: 'EVENT-002',
    name: 'Artisan Market @ Publika',
    date: '2024-01-14',
    location: 'Publika, KL',
    totalCustomers: 32,
    totalRevenue: 8900,
    status: 'completed'
  },
  {
    id: 'EVENT-003',
    name: 'Weekend Pop-up @ Bangsar',
    date: '2024-01-20',
    location: 'Bangsar Village',
    totalCustomers: 0,
    totalRevenue: 0,
    status: 'upcoming'
  }
];

const predefinedTags = [
  'VIP', 'New Customer', 'Repeat Customer', 'Instagram', 'Corporate',
  'Artist', 'Cultural Enthusiast', 'Male', 'Female', 'Bulk Buyer',
  'Eco-conscious', 'Traditional', 'Modern', 'Gift Buyer', 'Collector'
];

export default function PopupCustomerManager() {
  const [customers, setCustomers] = useState<PopupCustomer[]>(mockPopupCustomers);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<PopupCustomer | null>(null);
  const [newTag, setNewTag] = useState<string>('');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         (customer.instagram && customer.instagram.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEvent = selectedEvent === 'all' || customer.eventName === selectedEvent;
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => customer.tags.includes(tag));
    
    return matchesSearch && matchesEvent && matchesTags;
  });

  const exportToCSV = (format: 'detailed' | 'summary' | 'crm') => {
    let csvContent = '';
    
    if (format === 'detailed') {
      csvContent = [
        ['Customer ID', 'Name', 'Phone', 'Instagram', 'Email', 'Event', 'Total Spent', 'Purchases', 'Loyalty Points', 'Tags', 'First Purchase', 'Last Purchase', 'VIP Status', 'Notes'],
        ...filteredCustomers.map(customer => [
          customer.id,
          customer.name,
          customer.phone,
          customer.instagram || '',
          customer.email || '',
          customer.eventName,
          customer.totalSpent,
          customer.totalPurchases,
          customer.loyaltyPoints,
          customer.tags.join('; '),
          customer.firstPurchaseDate,
          customer.lastPurchaseDate,
          customer.isVip ? 'Yes' : 'No',
          customer.notes || ''
        ])
      ].map(row => row.join(',')).join('\n');
    } else if (format === 'summary') {
      csvContent = [
        ['Event Name', 'Total Customers', 'Total Revenue', 'Avg Spend per Customer', 'VIP Customers'],
        ...mockEvents.filter(event => selectedEvent === 'all' || event.name === selectedEvent).map(event => [
          event.name,
          event.totalCustomers,
          event.totalRevenue,
          event.totalCustomers > 0 ? (event.totalRevenue / event.totalCustomers).toFixed(2) : 0,
          customers.filter(c => c.eventName === event.name && c.isVip).length
        ])
      ].map(row => row.join(',')).join('\n');
    } else {
      // CRM format
      csvContent = [
        ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Tags', 'Notes'],
        ...filteredCustomers.map(customer => {
          const [firstName, ...lastName] = customer.name.split(' ');
          return [
            firstName,
            lastName.join(' '),
            customer.email || '',
            customer.phone,
            'Reweave Pop-up Customer',
            customer.tags.join('; '),
            customer.notes || `Popup customer from ${customer.eventName}`
          ];
        })
      ].map(row => row.join(',')).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popup-customers-${format}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const addTagToCustomer = (customerId: string, tag: string) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId
        ? { ...customer, tags: [...new Set([...customer.tags, tag])] }
        : customer
    ));
  };

  const removeTagFromCustomer = (customerId: string, tag: string) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId
        ? { ...customer, tags: customer.tags.filter(t => t !== tag) }
        : customer
    ));
  };

  const addNewTag = () => {
    if (newTag && selectedCustomer) {
      addTagToCustomer(selectedCustomer.id, newTag);
      setNewTag('');
    }
  };

  const getEventStats = () => {
    const eventCustomers = customers.filter(c => 
      selectedEvent === 'all' || c.eventName === selectedEvent
    );
    
    return {
      total: eventCustomers.length,
      totalRevenue: eventCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
      avgSpend: eventCustomers.length > 0 ? eventCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / eventCustomers.length : 0,
      vipCount: eventCustomers.filter(c => c.isVip).length,
      repeatCustomers: eventCustomers.filter(c => c.totalPurchases > 1).length
    };
  };

  const stats = getEventStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Popup Customer Manager</h1>
          <p className="text-pebble mt-2">Manage and analyze popup event customers</p>
        </div>
        <button 
          onClick={() => setShowExportModal(true)}
          className="btn btn-primary"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-indigo mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-sage" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-indigo mt-2">RM {stats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-gold" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Avg. Spend</p>
              <p className="text-3xl font-bold text-indigo mt-2">RM {stats.avgSpend.toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-terracotta" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">VIP Customers</p>
              <p className="text-3xl font-bold text-indigo mt-2">{stats.vipCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pebble" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="all">All Events</option>
            {mockEvents.map(event => (
              <option key={event.id} value={event.name}>{event.name}</option>
            ))}
          </select>
          <select
            value={selectedTags[0] || ''}
            onChange={(e) => setSelectedTags(e.target.value ? [e.target.value] : [])}
            className="px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="">All Tags</option>
            {predefinedTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedEvent('all');
              setSelectedTags([]);
            }}
            className="btn btn-outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand/20">
              <tr>
                <th className="px-6 py-4 text-left text-pebble font-medium">Customer</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Contact</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Event</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Spending</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Tags</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-sand/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-indigo">
                          {customer.name}
                          {customer.isVip && <Star className="inline w-4 h-4 text-gold ml-1" />}
                        </p>
                        <p className="text-sm text-pebble">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-indigo flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-pebble" />
                        {customer.phone}
                      </p>
                      {customer.instagram && (
                        <p className="text-sm text-indigo flex items-center">
                          <Instagram className="w-3 h-3 mr-1 text-pebble" />
                          {customer.instagram}
                        </p>
                      )}
                      {customer.email && (
                        <p className="text-sm text-indigo flex items-center">
                          <Mail className="w-3 h-3 mr-1 text-pebble" />
                          {customer.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-indigo">{customer.eventName}</p>
                      <p className="text-xs text-pebble">{customer.firstPurchaseDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-indigo">RM {customer.totalSpent}</p>
                      <p className="text-xs text-pebble">{customer.totalPurchases} orders</p>
                      <p className="text-xs text-sage">{customer.loyaltyPoints} pts</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sage/10 text-sage border border-sage/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowTagModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-sand text-sage"
                        title="Manage Tags"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Contact ${customer.name} via ${customer.phone}`)}
                        className="p-2 rounded-lg hover:bg-sand text-indigo"
                        title="Contact Customer"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-pebble mx-auto mb-4" />
            <p className="text-pebble">No customers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Tag Management Modal */}
      {showTagModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-indigo">Manage Tags - {selectedCustomer.name}</h3>
              <button 
                onClick={() => setShowTagModal(false)}
                className="p-2 rounded-lg hover:bg-sand text-indigo"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-indigo mb-3">Current Tags</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCustomer.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sage/10 text-sage border border-sage/20"
                    >
                      {tag}
                      <button
                        onClick={() => removeTagFromCustomer(selectedCustomer.id, tag)}
                        className="ml-2 text-sage hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-indigo mb-3">Add New Tag</h4>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter new tag"
                    className="flex-1 px-3 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                  <button
                    onClick={addNewTag}
                    disabled={!newTag}
                    className="btn btn-primary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.filter(tag => !selectedCustomer.tags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTagToCustomer(selectedCustomer.id, tag)}
                      className="px-3 py-1 rounded-full text-sm bg-sand hover:bg-sage hover:text-white transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-sage/10 rounded-xl p-4">
                <h4 className="font-medium text-indigo mb-2">Customer Insights</h4>
                <div className="space-y-2 text-sm text-pebble">
                  <p>• Total spent: RM {selectedCustomer.totalSpent}</p>
                  <p>• Loyalty points: {selectedCustomer.loyaltyPoints}</p>
                  <p>• Purchase frequency: {selectedCustomer.totalPurchases} orders</p>
                  <p>• Customer since: {selectedCustomer.firstPurchaseDate}</p>
                  {selectedCustomer.notes && (
                    <p>• Notes: {selectedCustomer.notes}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTagModal(false)}
                className="flex-1 btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-display font-bold text-indigo mb-4">Export Customer Data</h3>
            <p className="text-pebble mb-6">Choose export format for popup customer data</p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  exportToCSV('detailed');
                  setShowExportModal(false);
                }}
                className="w-full btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Detailed Customer Data
              </button>
              <button
                onClick={() => {
                  exportToCSV('summary');
                  setShowExportModal(false);
                }}
                className="w-full btn btn-outline"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Event Summary Report
              </button>
              <button
                onClick={() => {
                  exportToCSV('crm');
                  setShowExportModal(false);
                }}
                className="w-full btn btn-outline"
              >
                <Users className="w-4 h-4 mr-2" />
                CRM Import Format
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full text-pebble hover:text-indigo"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}