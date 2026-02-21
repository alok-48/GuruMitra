import { NavLink } from 'react-router-dom';
import { Home, Heart, Landmark, FolderOpen, Users } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'होम' },
  { to: '/health', icon: Heart, label: 'स्वास्थ्य' },
  { to: '/pension', icon: Landmark, label: 'पेंशन' },
  { to: '/documents', icon: FolderOpen, label: 'दस्तावेज़' },
  { to: '/community', icon: Users, label: 'समुदाय' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 safe-bottom z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]" role="navigation" aria-label="मुख्य मेनू">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            aria-label={label}
          >
            <Icon size={26} strokeWidth={2} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
