import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', icon: 'dashboard', label: 'Dashboard' },
  { path: '/products', icon: 'inventory_2', label: 'Products' },
  { path: '/customers', icon: 'group', label: 'Customers' },
  { path: '/orders', icon: 'shopping_cart', label: 'Orders' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-sidebar-width bg-sidebar border-r border-outline-variant shadow-md flex flex-col py-6 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="px-6 mb-8 flex flex-col">
          <h1 className="text-headline-lg font-bold text-white">IMS</h1>
          <p className="text-label-md text-surface-variant/70 mt-1">
            Inventory Management System
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all duration-200 text-body-md ${
                  isActive
                    ? 'bg-primary text-white scale-95 shadow-sm font-semibold'
                    : 'text-on-secondary-container hover:text-white hover:bg-surface-variant/10'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 text-on-secondary-container hover:text-white hover:bg-surface-variant/10 transition-colors duration-200 text-body-md"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
