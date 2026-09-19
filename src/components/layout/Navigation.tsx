import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Egg, ShoppingCart, Receipt, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/review', label: 'Review', Icon: BarChart2 },
  { path: '/daily-eggs', label: 'Daily Eggs', Icon: Egg },
  { path: '/sales', label: 'Sales', Icon: ShoppingCart },
  { path: '/expenses', label: 'Expenses', Icon: Receipt },
  { path: '/settings', label: 'Settings', Icon: Settings },
];

export default function Navigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active
                  ? 'text-green-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'text-green-700' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
