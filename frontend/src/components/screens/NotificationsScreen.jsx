import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, Clock, Siren } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const typeIcons = {
  info: { icon: Info, color: 'text-blue-500 bg-blue-100' },
  warning: { icon: AlertTriangle, color: 'text-orange-500 bg-orange-100' },
  alert: { icon: AlertTriangle, color: 'text-red-500 bg-red-100' },
  reminder: { icon: Clock, color: 'text-purple-500 bg-purple-100' },
  sos: { icon: Siren, color: 'text-red-600 bg-red-100' },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(d => {
      setNotifications(d.notifications || []);
      setUnreadCount(d.unreadCount || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-elder-lg font-bold">सूचनाएं ({unreadCount} नई)</h2>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-saffron-500 font-semibold text-elder-sm flex items-center gap-1">
            <CheckCheck size={18} /> सब पढ़ी
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-10">
          <Bell size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-elder-base text-gray-500">कोई सूचना नहीं</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const typeInfo = typeIcons[n.type] || typeIcons.info;
            const Icon = typeInfo.icon;
            return (
              <button key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                className={`card w-full text-left flex items-start gap-3 transition ${!n.is_read ? 'border-l-4 border-saffron-500 bg-orange-50/50' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className={`text-elder-base ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                  {n.body && <p className="text-elder-sm text-gray-600">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString('hi-IN')}</p>
                </div>
                {!n.is_read && <div className="w-3 h-3 bg-saffron-500 rounded-full mt-2 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
