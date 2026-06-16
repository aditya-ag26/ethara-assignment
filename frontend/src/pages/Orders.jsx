import { useState, useEffect, useCallback } from 'react';
import { getOrders, createOrder, deleteOrder, getOrder } from '../services/orderService';
import { getProducts } from '../services/productService';
import { getCustomers } from '../services/customerService';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Pagination from '../components/UI/Pagination';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';

const ITEMS_PER_PAGE = 5;

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Create order
  const [showCreate, setShowCreate] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ product_id: '', quantity: 1 });

  // View details
  const [showDetails, setShowDetails] = useState(null);
  const [detailData, setDetailData] = useState(null);

  // Cancel order
  const [showCancel, setShowCancel] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Filter
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Open create modal
  const openCreate = async () => {
    try {
      const [c, p] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(Array.isArray(c) ? c : []);
      setProducts(Array.isArray(p) ? p : []);
    } catch { /* ignore */ }
    setSelectedCustomer('');
    setOrderItems([]);
    setCurrentItem({ product_id: '', quantity: 1 });
    setShowCreate(true);
  };

  // Add item to order
  const addItem = () => {
    if (!currentItem.product_id || currentItem.quantity < 1) return;
    const product = products.find((p) => String(p.id) === String(currentItem.product_id));
    if (!product) return;
    setOrderItems((prev) => [...prev, { ...currentItem, product_name: product.name, price: product.price }]);
    setCurrentItem({ product_id: '', quantity: 1 });
  };

  const removeItem = (idx) => setOrderItems((prev) => prev.filter((_, i) => i !== idx));

  // Submit order
  const handleCreateOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      addToast('Please select a customer and add at least one item', 'error');
      return;
    }
    try {
      await createOrder({
        customer_id: parseInt(selectedCustomer),
        items: orderItems.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      });
      addToast('Order created successfully');
      setShowCreate(false);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create order', 'error');
    }
  };

  // View details
  const openDetails = async (order) => {
    setShowDetails(order);
    try {
      const data = await getOrder(order.id);
      setDetailData(data);
    } catch {
      setDetailData(order);
    }
  };

  // Cancel order
  const handleCancel = async () => {
    try {
      await deleteOrder(showCancel.id);
      addToast('Order cancelled successfully');
      setShowCancel(null);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to cancel order', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed') return { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    if (s === 'processing') return { label: 'Processing', cls: 'bg-blue-50 text-blue-700 border border-blue-200' };
    if (s === 'cancelled') return { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border border-red-200' };
    return { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
  };

  const orderTotal = orderItems.reduce((s, item) => s + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-container-padding">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <h2 className="text-headline-xl font-bold text-on-surface hidden md:block">Orders</h2>
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 h-10 bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button onClick={openCreate} className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white px-4 py-2 h-10 rounded-lg text-label-md flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">add</span>
              Create Order
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-body-md">
                {pageItems.length === 0 ? (
                  <tr><td colSpan="7" className="py-12 px-6 text-center text-on-surface-variant">No orders found</td></tr>
                ) : pageItems.map((o, i) => {
                  const badge = getStatusBadge(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors group h-[56px]">
                      <td className="px-6 py-4 text-on-surface-variant">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="px-6 py-4 font-medium text-on-surface">ORD-{String(o.id).padStart(5, '0')}</td>
                      <td className="px-6 py-4 text-on-surface">{o.customer_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-on-surface text-right font-medium">{formatCurrency(o.total_amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{formatDate(o.created_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openDetails(o)} className="text-on-surface-variant hover:text-primary transition-colors p-1" title="View Details">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button onClick={() => setShowCancel(o)} className="text-on-surface-variant hover:text-error transition-colors p-1" title="Cancel Order">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} />
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Order"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-label-md bg-white border border-[#E2E8F0] text-on-surface-variant hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleCreateOrder} className="px-4 py-2 rounded-lg text-label-md bg-primary text-white hover:bg-primary-container transition-colors shadow-sm">Submit Order</button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">Customer</label>
            <div className="relative">
              <select className="w-full h-[44px] pl-3 pr-10 border border-[#E2E8F0] rounded-lg text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                <option disabled value="">Select customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">Product</label>
            <div className="relative">
              <select className="w-full h-[44px] pl-3 pr-10 border border-[#E2E8F0] rounded-lg text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" value={currentItem.product_id} onChange={(e) => setCurrentItem({ ...currentItem, product_id: e.target.value })}>
                <option disabled value="">Select product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">Quantity</label>
            <input type="number" min="1" className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" value={currentItem.quantity} onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <button onClick={addItem} className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 h-10 rounded-lg text-label-md transition-colors">Add Item</button>
          </div>

          {/* Items List */}
          {orderItems.length > 0 && (
            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                    <th className="px-4 py-2 text-table-header text-on-surface-variant">Product</th>
                    <th className="px-4 py-2 text-table-header text-on-surface-variant text-center">Qty</th>
                    <th className="px-4 py-2 text-table-header text-on-surface-variant text-right">Subtotal</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-body-md">
                  {orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-on-surface">{item.product_name}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => removeItem(idx)} className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-[#E2E8F0]">
                  <tr>
                    <td colSpan="2" className="px-4 py-2 text-right font-medium text-on-surface-variant">Total:</td>
                    <td className="px-4 py-2 text-right font-semibold text-primary">{formatCurrency(orderTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!showDetails}
        onClose={() => { setShowDetails(null); setDetailData(null); }}
        title={`Order Details — ORD-${String(showDetails?.id || 0).padStart(5, '0')}`}
        maxWidth="max-w-2xl"
        footer={
          <button onClick={() => { setShowDetails(null); setDetailData(null); }} className="px-4 py-2 rounded-lg text-label-md bg-white border border-[#E2E8F0] text-on-surface-variant hover:bg-slate-50 transition-colors">Close</button>
        }
      >
        {detailData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Info */}
            <div className="space-y-4">
              <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider">Order Information</h4>
              <div className="bg-slate-50 p-4 rounded-lg border border-[#E2E8F0] space-y-3 text-body-md">
                <div className="flex justify-between"><span className="text-on-surface-variant">Order ID</span><span className="font-medium">ORD-{String(detailData.id).padStart(5, '0')}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Customer</span><span className="font-medium">{detailData.customer_name || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Date</span><span>{formatDate(detailData.created_at)}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Status</span>
                  {(() => { const b = getStatusBadge(detailData.status); return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${b.cls}`}>{b.label}</span>; })()}
                </div>
                <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex justify-between items-center">
                  <span className="font-medium text-on-surface">Total</span>
                  <span className="font-semibold text-lg text-primary">{formatCurrency(detailData.total_amount)}</span>
                </div>
              </div>
            </div>
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider">Order Items</h4>
              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                      <th className="px-4 py-2 text-table-header text-on-surface-variant">Product</th>
                      <th className="px-4 py-2 text-table-header text-on-surface-variant text-right">Price</th>
                      <th className="px-4 py-2 text-table-header text-on-surface-variant text-center">Qty</th>
                      <th className="px-4 py-2 text-table-header text-on-surface-variant text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-body-md">
                    {(detailData.items || []).length === 0 ? (
                      <tr><td colSpan="4" className="py-6 px-4 text-center text-on-surface-variant">No items</td></tr>
                    ) : (detailData.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-on-surface">{item.product_name || `Product #${item.product_id}`}</td>
                        <td className="px-4 py-3 text-right text-on-surface-variant">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency((item.price || 0) * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-[#E2E8F0]">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-medium text-on-surface-variant">Total:</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(detailData.total_amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        )}
      </Modal>

      {/* Cancel Confirm */}
      <ConfirmDialog
        isOpen={!!showCancel}
        onClose={() => setShowCancel(null)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
      />
    </div>
  );
}
