import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const titles = {
  '/': 'गुरुमित्र',
  '/health': 'स्वास्थ्य',
  '/pension': 'पेंशन एवं बैंक',
  '/documents': 'दस्तावेज़',
  '/community': 'डिजिटल स्टाफ रूम',
  '/gov-updates': 'सरकारी अपडेट',
  '/help': 'मदद / SOS',
  '/notifications': 'सूचनाएं',
};

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isHome = pathname === '/';
  const title = titles[pathname] || 'गुरुमित्र';

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-saffron-500 to-primary-500 text-white shadow-md">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition" aria-label="वापस जाएं">
              <ArrowLeft size={26} />
            </button>
          )}
          <div>
            <h1 className="text-elder-lg font-bold leading-tight">{title}</h1>
            {isHome && user && <p className="text-sm opacity-90">{user.name} जी</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/help')} className="p-2 rounded-full hover:bg-white/20 transition" aria-label="मदद">
            <HelpCircle size={24} />
          </button>
          <button onClick={() => navigate('/notifications')} className="p-2 rounded-full hover:bg-white/20 transition relative" aria-label="सूचनाएं">
            <Bell size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
