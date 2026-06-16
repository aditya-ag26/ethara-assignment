import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Pagination from '../components/UI/Pagination';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';

const ITEMS_PER_PAGE = 5;
const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showDelete, setShowDelete] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Filter
  const filtered = products.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Open modal
  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (prod) => {
    setEditing(prod);
    setForm({ name: prod.name, sku: prod.sku, price: prod.price, quantity_in_stock: prod.quantity_in_stock });
    setShowModal(true);
  };

  // Save
  const handleSave = async () => {
    const payload = { ...form, price: parseFloat(form.price), quantity_in_stock: parseInt(form.quantity_in_stock) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        addToast('Product updated successfully');
      } else {
        await createProduct(payload);
        addToast('Product created successfully');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to save product', 'error');
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await deleteProduct(showDelete.id);
      addToast('Product deleted successfully');
      setShowDelete(null);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete product', 'error');
    }
  };

  const getStockBadge = (qty) => {
    if (qty <= 0) return { label: 'Out of Stock', cls: 'bg-red-50 text-red-700 border border-red-200' };
    if (qty <= 10) return { label: 'Low Stock', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
    return { label: 'In Stock', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  };

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
          <h2 className="text-headline-xl font-bold text-on-surface hidden md:block">Products</h2>
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 h-10 bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button onClick={openAdd} className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white px-4 py-2 h-10 rounded-lg text-label-md flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider text-right">Price</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-body-md">
                {pageItems.length === 0 ? (
                  <tr><td colSpan="7" className="py-12 px-6 text-center text-on-surface-variant">No products found</td></tr>
                ) : pageItems.map((p, i) => {
                  const badge = getStockBadge(p.quantity_in_stock);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group h-[56px]">
                      <td className="px-6 py-4 text-on-surface-variant">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="px-6 py-4 font-medium text-on-surface">{p.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{p.sku}</td>
                      <td className="px-6 py-4 text-on-surface text-right font-medium">{formatCurrency(p.price)}</td>
                      <td className="px-6 py-4 text-on-surface text-center font-medium">{p.quantity_in_stock}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)} className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => setShowDelete(p)} className="text-on-surface-variant hover:text-error transition-colors p-1" title="Delete">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-label-md bg-white border border-[#E2E8F0] text-on-surface-variant hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-label-md bg-primary text-white hover:bg-primary-container transition-colors shadow-sm">{editing ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">Product Name</label>
            <input className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="Enter product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">SKU</label>
            <input className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="e.g. PRD-001" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-label-md text-on-surface-variant block">Price (&#8377;)</label>
              <input type="number" step="0.01" min="0" className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-label-md text-on-surface-variant block">Quantity</label>
              <input type="number" min="0" className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="0" value={form.quantity_in_stock} onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${showDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
