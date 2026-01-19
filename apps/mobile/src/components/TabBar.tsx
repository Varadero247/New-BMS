import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building, Cpu, Bell, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buildings', icon: Building, label: 'Buildings' },
  { to: '/devices', icon: Cpu, label: 'Devices' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
                <span className="text-xs mt-1">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
