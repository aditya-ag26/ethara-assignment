import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login — no auth backend required for this assignment
    setTimeout(() => {
      setLoading(false);
      login();
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 antialiased bg-[#F8FAFC]">
      <div className="w-full max-w-[440px] bg-surface-container-lowest border border-[#E2E8F0] rounded-xl soft-shadow overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center border-b border-outline-variant/30">
          <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-primary-container filled">inventory_2</span>
          </div>
          <h1 className="text-headline-xl font-bold text-on-surface mb-1">IMS</h1>
          <p className="text-body-md text-on-surface-variant text-center">Inventory Management System</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-headline-md font-semibold text-on-surface">Welcome back</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5 uppercase" htmlFor="login-email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                </div>
                <input
                  className="block w-full h-[44px] pl-10 pr-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  id="login-email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5 uppercase" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <input
                  className="block w-full h-[44px] pl-10 pr-10 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
                  id="remember-me"
                  type="checkbox"
                />
                <label className="ml-2 block text-body-md text-on-surface-variant" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <a className="text-label-md text-primary hover:text-primary-fixed-dim transition-colors cursor-pointer">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-label-md text-white bg-primary-container hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container transition-colors duration-200 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-outline-variant/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-container-lowest text-body-md text-outline">Or continue with</span>
            </div>
          </div>

          {/* SSO */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-outline-variant rounded-lg shadow-sm bg-surface-container-lowest text-label-md text-on-surface hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">vpn_key</span>
              Single Sign-On (SSO)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low px-8 py-4 border-t border-outline-variant/30 text-center">
          <p className="text-body-md text-outline text-sm">
            Need help? <a className="text-primary hover:underline text-label-md cursor-pointer">Contact IT Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
