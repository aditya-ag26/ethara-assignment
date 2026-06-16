import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { getCustomers } from '../services/customerService';
import { getOrders } from '../services/orderService';

const LOW_STOCK_THRESHOLD = 10;

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, lowStock: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [products, customers, orders] = await Promise.all([
        getProducts().catch(() => []),
        getCustomers().catch(() => []),
        getOrders().catch(() => []),
      ]);

      const productList = Array.isArray(products) ? products : [];
      const customerList = Array.isArray(customers) ? customers : [];
      const orderList = Array.isArray(orders) ? orders : [];

      const lowStock = productList.filter((p) => p.quantity_in_stock <= LOW_STOCK_THRESHOLD);

      setStats({
        products: productList.length,
        customers: customerList.length,
        orders: orderList.length,
        lowStock: lowStock.length,
      });

      setLowStockProducts(lowStock.slice(0, 4));
      setRecentOrders(orderList.slice(0, 4));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    { label: 'Total Products', value: stats.products, icon: 'inventory_2', color: 'primary', bgGlow: 'bg-primary/5', bgGlowHover: 'group-hover:bg-primary/10', iconBg: 'bg-primary/10', iconBgHover: 'group-hover:bg-primary', iconColor: 'text-primary', iconColorHover: 'group-hover:text-white', link: '/products', linkText: 'View all products', linkColor: 'text-primary' },
    { label: 'Total Customers', value: stats.customers, icon: 'group', color: 'emerald', bgGlow: 'bg-emerald-500/5', bgGlowHover: 'group-hover:bg-emerald-500/10', iconBg: 'bg-emerald-50', iconBgHover: 'group-hover:bg-emerald-600', iconColor: 'text-emerald-600', iconColorHover: 'group-hover:text-white', link: '/customers', linkText: 'View all customers', linkColor: 'text-emerald-600' },
    { label: 'Total Orders', value: stats.orders, icon: 'receipt_long', color: 'purple', bgGlow: 'bg-purple-500/5', bgGlowHover: 'group-hover:bg-purple-500/10', iconBg: 'bg-purple-50', iconBgHover: 'group-hover:bg-purple-600', iconColor: 'text-purple-600', iconColorHover: 'group-hover:text-white', link: '/orders', linkText: 'View all orders', linkColor: 'text-purple-600' },
    { label: 'Low Stock Products', value: stats.lowStock, icon: 'warning', color: 'orange', bgGlow: 'bg-orange-500/5', bgGlowHover: 'group-hover:bg-orange-500/10', iconBg: 'bg-orange-50', iconBgHover: 'group-hover:bg-orange-500', iconColor: 'text-orange-500', iconColorHover: 'group-hover:text-white', link: '/products', linkText: 'View low stock', linkColor: 'text-orange-500' },
  ];

  const getStockStatus = (qty) => {
    if (qty <= 2) return { label: 'Critical', cls: 'bg-error-container text-on-error-container' };
    return { label: 'Low Stock', cls: 'bg-error-container text-on-error-container' };
  };

  const getOrderStatus = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed') return { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    if (s === 'processing') return { label: 'Processing', cls: 'bg-primary/10 text-primary border border-primary/20' };
    return { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-gutter pb-12 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto space-y-element-gap">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow duration-200 group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.bgGlow} rounded-full blur-2xl ${card.bgGlowHover} transition-colors`}></div>
              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-body-md text-on-surface-variant mb-1">{card.label}</p>
                  <h3 className="text-headline-xl font-bold text-on-surface">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center ${card.iconColor} ${card.iconBgHover} ${card.iconColorHover} transition-colors duration-300`}>
                  <span className="material-symbols-outlined filled">{card.icon}</span>
                </div>
              </div>
              <Link to={card.link} className={`text-label-md ${card.linkColor} mt-4 inline-flex items-center hover:underline z-10`}>
                {card.linkText} <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Low Stock Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="text-headline-md font-semibold text-on-surface">Low Stock Products</h3>
              <Link to="/products" className="px-4 py-2 bg-white border border-[#E2E8F0] text-on-surface-variant rounded-lg text-label-md hover:bg-surface-container-low hover:text-primary transition-colors">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9]">
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider">Product</th>
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider">SKU</th>
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider">Stock</th>
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-body-md">
                  {lowStockProducts.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 px-6 text-center text-on-surface-variant">No low stock products</td></tr>
                  ) : (
                    lowStockProducts.map((p) => {
                      const status = getStockStatus(p.quantity_in_stock);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 text-on-surface font-medium">{p.name}</td>
                          <td className="py-4 px-6 text-on-surface-variant">{p.sku}</td>
                          <td className={`py-4 px-6 font-semibold ${p.quantity_in_stock <= 2 ? 'text-error' : 'text-on-surface'}`}>{p.quantity_in_stock}</td>
                          <td className="py-4 px-6 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md ${status.cls}`}>{status.label}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="text-headline-md font-semibold text-on-surface">Recent Orders</h3>
              <Link to="/orders" className="px-4 py-2 bg-white border border-[#E2E8F0] text-on-surface-variant rounded-lg text-label-md hover:bg-surface-container-low hover:text-primary transition-colors">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9]">
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider">Order ID</th>
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider">Total</th>
                    <th className="py-3 px-6 text-table-header text-on-surface-variant uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-body-md">
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 px-6 text-center text-on-surface-variant">No orders yet</td></tr>
                  ) : (
                    recentOrders.map((o) => {
                      const status = getOrderStatus(o.status);
                      return (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 text-on-surface font-medium">ORD-{String(o.id).padStart(5, '0')}</td>
                          <td className="py-4 px-6 text-on-surface-variant">{o.customer_name || 'N/A'}</td>
                          <td className="py-4 px-6 text-on-surface font-semibold">${Number(o.total_amount || 0).toFixed(2)}</td>
                          <td className="py-4 px-6 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md ${status.cls}`}>{status.label}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
