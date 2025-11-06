import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Store,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/store-value', icon: Package, label: 'Store Value' },
  { to: '/shops', icon: Store, label: 'Shops' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Ugas Abdikadir Shop Tracker</h1>
            <p className="text-xs text-slate-500">Pro Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {user?.name?.charAt(0) || 'O'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
