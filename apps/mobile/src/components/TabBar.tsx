import { NavLink } from 'react-router-dom';
import { LayoutDashboard, HardHat, Leaf, Award, ClipboardCheck } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hs', icon: HardHat, label: 'H&S', color: 'text-red-500' },
  { to: '/environment', icon: Leaf, label: 'Environment', color: 'text-green-500' },
  { to: '/quality', icon: Award, label: 'Quality', color: 'text-blue-500' },
  { to: '/actions', icon: ClipboardCheck, label: 'Actions' },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full ${
                isActive ? (tab.color || 'text-primary-600') : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
                <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
