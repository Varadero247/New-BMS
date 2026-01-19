import { ChevronRight, User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

const menuItems = [
  { icon: User, label: 'Account Settings', href: '/settings/account' },
  { icon: Bell, label: 'Notifications', href: '/settings/notifications' },
  { icon: Shield, label: 'Privacy & Security', href: '/settings/privacy' },
  { icon: HelpCircle, label: 'Help & Support', href: '/settings/help' },
];

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="px-4 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </header>

      {/* User Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-primary-600">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition ${
              index > 0 ? 'border-t border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-xl font-medium hover:bg-red-100 transition"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      {/* Version */}
      <p className="text-center text-xs text-gray-400 mt-6">BMS Mobile v1.0.0</p>
    </div>
  );
}
