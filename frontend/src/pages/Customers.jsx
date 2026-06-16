import { useState, useEffect, useCallback } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/customerService';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Pagination from '../components/UI/Pagination';
import { useToast } from '../context/ToastContext';

const ITEMS_PER_PAGE = 5;
const emptyForm = { name: '', email: '', phone: '' };

export default function Customers() {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showDelete, setShowDelete] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Filter
  const filtered = customers.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Save
  const handleSave = async () => {
    try {
      await createCustomer(form);
      addToast('Customer added successfully');
      setShowModal(false);
      setForm(emptyForm);
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to add customer', 'error');
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await deleteCustomer(showDelete.id);
      addToast('Customer deleted successfully');
      setShowDelete(null);
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete customer', 'error');
    }
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
          <h2 className="text-headline-xl font-bold text-on-surface hidden md:block">Customers</h2>
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 h-10 bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white px-4 py-2 h-10 rounded-lg text-label-md flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Customer
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Table */}
          <div className={`bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex-1 transition-all duration-300 ${selectedCustomer ? 'lg:flex-[2]' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                    <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider w-16">#</th>
                    <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-table-header text-on-surface-variant uppercase tracking-wider text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-body-md">
                  {pageItems.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 px-6 text-center text-on-surface-variant">No customers found</td></tr>
                  ) : pageItems.map((c, i) => (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors group h-[56px] cursor-pointer ${selectedCustomer?.id === c.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedCustomer(c)}>
                      <td className="px-6 py-4 text-on-surface-variant">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="px-6 py-4 text-on-surface">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-md font-bold">{(c.name || 'U')[0].toUpperCase()}</div>
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{c.email}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{c.phone || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }} className="text-on-surface-variant hover:text-primary transition-colors p-1" title="View">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setShowDelete(c); }} className="text-on-surface-variant hover:text-error transition-colors p-1" title="Delete">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} />
          </div>

          {/* Detail Panel */}
          {selectedCustomer && (
            <div className="hidden lg:block w-[360px] bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-fit sticky top-24">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F1F5F9]">
                <h3 className="text-headline-md font-semibold text-on-surface">Customer Details</h3>
                <button onClick={() => setSelectedCustomer(null)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-headline-lg font-bold mb-3">{(selectedCustomer.name || 'U')[0].toUpperCase()}</div>
                  <h4 className="text-headline-md font-semibold text-on-surface">{selectedCustomer.name}</h4>
                  <p className="text-body-md text-on-surface-variant mt-1">{selectedCustomer.email}</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/50 space-y-3 text-body-md">
                  <div className="flex justify-between"><span className="text-on-surface-variant">Phone</span><span className="font-medium">{selectedCustomer.phone || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Customer ID</span><span className="font-medium">#{selectedCustomer.id}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Customer"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-label-md bg-white border border-[#E2E8F0] text-on-surface-variant hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-label-md bg-primary text-white hover:bg-primary-container transition-colors shadow-sm">Add Customer</button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">Full Name</label>
            <input className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="Enter full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">Email Address</label>
            <input type="email" className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface-variant block">Phone Number</label>
            <input type="tel" className="w-full h-[44px] px-3 border border-[#E2E8F0] rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${showDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
