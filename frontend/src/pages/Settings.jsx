import { useState } from 'react';
import { useToast } from '../context/ToastContext';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'company', label: 'Company' },
  { id: 'users', label: 'Users', badge: 2 },
];

const mockUsers = [
  { name: 'Admin User', email: 'admin@ims.example.com', role: 'Administrator', status: 'Active' },
  { name: 'Sarah Connor', email: 's.connor@ims.example.com', role: 'Staff', status: 'Active' },
];

export default function Settings() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: 'Admin User', email: 'admin@ims.example.com', role: 'System Administrator' });
  const [company, setCompany] = useState({ name: 'Acme Logistics Corp.', address: '123 Industrial Parkway\nSuite 400\nMetropolis, NY 10001', currency: 'USD', taxId: 'US-123456789' });

  const handleSaveProfile = () => addToast('Profile updated successfully');
  const handleSaveCompany = () => addToast('Company info updated successfully');

  return (
    <div className="p-gutter md:p-8 lg:px-12 xl:px-24 max-w-[1440px] mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-headline-xl font-bold text-on-surface tracking-tight mb-2">Settings</h2>
        <p className="text-body-lg text-on-surface-variant">Manage your account settings, company profile, and team members.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Inner Nav */}
        <nav className="lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left block px-4 py-2.5 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-surface-container-highest text-primary text-label-md font-semibold'
                  : 'text-on-surface hover:bg-surface-container-high text-body-md'
              } ${tab.badge ? 'flex justify-between items-center' : ''}`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-surface-dim text-on-surface-variant px-2 py-0.5 rounded-full text-xs">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-10">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 sm:p-8 shadow-sm">
              <h3 className="text-headline-md font-semibold text-on-surface border-b border-outline-variant pb-4 mb-6">
                Profile Settings
              </h3>
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-full border border-outline-variant bg-primary-container text-on-primary-container flex items-center justify-center text-headline-xl font-bold group cursor-pointer overflow-hidden">
                    <span className="group-hover:opacity-50 transition-opacity">{(profile.name || 'A')[0]}</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <span className="material-symbols-outlined text-white">photo_camera</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-body-lg text-on-surface font-semibold">Profile Photo</h4>
                  <p className="text-body-md text-on-surface-variant text-sm">Recommended size: 256x256px. Max file size: 2MB.</p>
                  <div className="flex gap-3 mt-3">
                    <button className="bg-surface border border-outline-variant text-on-surface px-4 py-2 rounded text-label-md hover:bg-surface-container-high transition-colors">Upload New</button>
                    <button className="text-error hover:bg-error-container/20 px-4 py-2 rounded text-label-md transition-colors">Remove</button>
                  </div>
                </div>
              </div>
              {/* Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-label-md text-on-surface">Full Name</label>
                    <input className="w-full h-10 px-3 py-2 bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-label-md text-on-surface">Email Address</label>
                    <input type="email" className="w-full h-10 px-3 py-2 bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-label-md text-on-surface">Role</label>
                    <input className="w-full h-10 px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded text-body-md text-on-surface-variant cursor-not-allowed" disabled value={profile.role} />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={handleSaveProfile} className="bg-primary text-white px-5 py-2 rounded-lg text-label-md hover:bg-primary/90 transition-colors shadow-sm hover:shadow">Save Changes</button>
                </div>
              </div>
            </section>
          )}

          {/* Company Section */}
          {activeTab === 'company' && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 sm:p-8 shadow-sm">
              <h3 className="text-headline-md font-semibold text-on-surface border-b border-outline-variant pb-4 mb-6">
                Company Details
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-label-md text-on-surface">Company Name</label>
                  <input className="w-full h-10 px-3 py-2 bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="block text-label-md text-on-surface">Registered Address</label>
                  <textarea className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow" rows="3" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-label-md text-on-surface">Default Currency</label>
                    <select className="w-full h-10 px-3 py-2 bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow" value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-label-md text-on-surface">Tax ID / VAT Number</label>
                    <input className="w-full h-10 px-3 py-2 bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow" value={company.taxId} onChange={(e) => setCompany({ ...company, taxId: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={handleSaveCompany} className="bg-primary text-white px-5 py-2 rounded-lg text-label-md hover:bg-primary/90 transition-colors shadow-sm hover:shadow">Update Company Info</button>
                </div>
              </div>
            </section>
          )}

          {/* Users Section */}
          {activeTab === 'users' && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-0 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-headline-md font-semibold text-on-surface">User Management</h3>
                  <p className="text-body-md text-on-surface-variant text-sm mt-1">Manage team members and their access levels.</p>
                </div>
                <button className="bg-surface border border-outline-variant text-primary px-4 py-2 rounded-lg text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Invite User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-outline-variant">
                      <th className="text-table-header text-on-surface-variant uppercase py-3 px-6">User</th>
                      <th className="text-table-header text-on-surface-variant uppercase py-3 px-6 hidden sm:table-cell">Role</th>
                      <th className="text-table-header text-on-surface-variant uppercase py-3 px-6 hidden md:table-cell">Status</th>
                      <th className="text-table-header text-on-surface-variant uppercase py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {mockUsers.map((user) => (
                      <tr key={user.email} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-md font-bold flex-shrink-0">
                              {user.name[0]}
                            </div>
                            <div>
                              <p className="text-body-md font-medium text-on-surface">{user.name}</p>
                              <p className="text-xs text-on-surface-variant">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden sm:table-cell">
                          <span className="inline-block px-2 py-1 bg-surface-variant text-on-surface-variant text-xs rounded font-medium">{user.role}</span>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-[#059669]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#059669]"></div>
                            {user.status}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Edit User">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
