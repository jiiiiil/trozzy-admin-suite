import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { toast } from "sonner";

interface CustomerOrder {
  id: string;
  items: any[];
  total: number;
  shipping: any;
  date: string;
}

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'settings'>('orders');
  
  const customer = JSON.parse(localStorage.getItem('trozzy_customer') || 'null');
  const orders: CustomerOrder[] = JSON.parse(localStorage.getItem('trozzy_customer_orders') || '[]');

  if (!customer) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('trozzy_customer');
    toast.success("Logged out successfully");
    navigate('/');
  };

  const tabs = [
    { id: 'orders' as const, label: 'Orders' },
    { id: 'addresses' as const, label: 'Addresses' },
    { id: 'settings' as const, label: 'Account Settings' },
  ];

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 tracking-wide mb-2">
              My Account
            </h1>
            <p className="text-stone-500">Welcome back, {customer.firstName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 text-stone-600 text-sm tracking-widest uppercase border-b border-stone-400 pb-1 hover:text-stone-900 hover:border-stone-900 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`block w-full text-left py-3 border-l-2 pl-4 text-sm tracking-wide transition-colors ${
                    activeTab === tab.id
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <OrdersTab orders={orders} />
            )}
            {activeTab === 'addresses' && (
              <AddressesTab customer={customer} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab customer={customer} />
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

const OrdersTab = ({ orders }: { orders: CustomerOrder[] }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-stone-200">
        <p className="text-stone-500 mb-6">You have not placed any orders yet</p>
        <Link
          to="/shop"
          className="inline-block border border-stone-900 text-stone-900 px-8 py-3 text-sm tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl text-stone-900 mb-6">Order History</h2>
      {orders.map((order) => (
        <div key={order.id} className="border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <p className="text-stone-900 font-medium">{order.id}</p>
              <p className="text-stone-500 text-sm">
                {new Date(order.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-stone-900">${order.total.toFixed(2)}</p>
              <p className="text-stone-500 text-sm">{order.items.length} items</p>
            </div>
          </div>
          
          <div className="border-t border-stone-100 pt-6">
            <div className="flex flex-wrap gap-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="w-16 h-20 bg-stone-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="border-t border-stone-100 pt-6 mt-6">
            <p className="text-stone-500 text-xs tracking-widest uppercase mb-4">Order Status</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone-900">Order Placed</span>
              <span className="text-stone-300">→</span>
              <span className="text-stone-400">Processing</span>
              <span className="text-stone-300">→</span>
              <span className="text-stone-400">Shipped</span>
              <span className="text-stone-300">→</span>
              <span className="text-stone-400">Delivered</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AddressesTab = ({ customer }: { customer: any }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-xl text-stone-900">Saved Addresses</h2>
        <button className="text-stone-600 text-sm tracking-widest uppercase border-b border-stone-400 pb-1 hover:text-stone-900">
          Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-stone-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-stone-400 text-xs tracking-widest uppercase">Default</span>
            <button className="text-stone-500 text-sm hover:text-stone-900">Edit</button>
          </div>
          <p className="text-stone-900 mb-1">{customer.firstName} {customer.lastName}</p>
          <p className="text-stone-600 text-sm">
            123 Example Street<br />
            New York, NY 10001<br />
            United States
          </p>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ customer }: { customer: any }) => {
  const [formData, setFormData] = useState({
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    email: customer.email || '',
  });

  const handleSave = () => {
    const updatedCustomer = { ...customer, ...formData };
    localStorage.setItem('trozzy_customer', JSON.stringify(updatedCustomer));
    toast.success("Account updated");
  };

  return (
    <div>
      <h2 className="font-serif text-xl text-stone-900 mb-6">Account Settings</h2>
      
      <div className="max-w-md space-y-6">
        <div>
          <label className="block text-stone-500 text-xs tracking-widest uppercase mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
          />
        </div>
        <div>
          <label className="block text-stone-500 text-xs tracking-widest uppercase mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
          />
        </div>
        <div>
          <label className="block text-stone-500 text-xs tracking-widest uppercase mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-stone-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-stone-800 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
