import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Landmark, FileText, Users, Newspaper, Bell, AlertTriangle, Pill, CalendarDays, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import SOSButton from '../shared/SOSButton';

export default function HomeScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/home/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center p-8 text-elder-lg text-gray-500">डेटा लोड नहीं हो पाया</p>;

  const quickLinks = [
    { icon: Heart, label: 'स्वास्थ्य', to: '/health', color: 'bg-red-50 text-red-600' },
    { icon: Landmark, label: 'पेंशन', to: '/pension', color: 'bg-blue-50 text-blue-600' },
    { icon: FileText, label: 'दस्तावेज़', to: '/documents', color: 'bg-green-50 text-green-600' },
    { icon: Users, label: 'समुदाय', to: '/community', color: 'bg-purple-50 text-purple-600' },
    { icon: Newspaper, label: 'सरकारी अपडेट', to: '/gov-updates', color: 'bg-yellow-50 text-yellow-700' },
    { icon: Bell, label: 'सूचनाएं', to: '/notifications', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="pb-4 space-y-5">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-warm-100 to-primary-50 rounded-elder p-5">
        <h2 className="text-elder-xl font-bold text-gray-800">{data.greeting}</h2>
        <p className="text-elder-sm text-gray-600 mt-1">{data.date}</p>
      </div>

      {/* SOS */}
      <SOSButton size="large" />

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        {quickLinks.map(({ icon: Icon, label, to, color }) => (
          <button key={to} onClick={() => navigate(to)} className={`card flex flex-col items-center gap-2 py-4 hover:shadow-lg transition-shadow ${color.split(' ')[0]}`}>
            <Icon size={30} className={color.split(' ')[1]} />
            <span className="text-elder-sm font-semibold text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {/* Today's Reminders */}
      {data.reminders?.length > 0 && (
        <section className="card">
          <h3 className="text-elder-lg font-bold mb-3 flex items-center gap-2">
            <CalendarDays size={22} className="text-saffron-500" /> आज की याद दिलानेवाली बातें
          </h3>
          <div className="space-y-3">
            {data.reminders.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <span className="text-xl mt-0.5">{r.type === 'medicine' ? '💊' : r.type === 'pension' ? '🏦' : '📋'}</span>
                <div>
                  <p className="text-elder-base font-semibold">{r.title}</p>
                  {r.description && <p className="text-elder-sm text-gray-600">{r.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pension Status */}
      {data.pension && (
        <section className="card cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/pension')}>
          <div className="flex items-center justify-between">
            <h3 className="text-elder-lg font-bold flex items-center gap-2">
              <Landmark size={22} className="text-blue-600" /> पेंशन स्थिति
            </h3>
            <ChevronRight size={22} className="text-gray-400" />
          </div>
          <div className="mt-3 flex items-center justify-between bg-blue-50 rounded-lg p-4">
            <div>
              <p className="text-elder-sm text-gray-600">पिछली पेंशन</p>
              <p className="text-elder-xl font-bold text-blue-700">₹{data.pension.lastAmount?.toLocaleString('hi-IN')}</p>
            </div>
            <div className="text-right">
              <span className={`badge ${data.pension.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                {data.pension.statusText}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Medicines */}
      {data.medicines?.length > 0 && (
        <section className="card cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/health')}>
          <div className="flex items-center justify-between">
            <h3 className="text-elder-lg font-bold flex items-center gap-2">
              <Pill size={22} className="text-red-500" /> आज की दवाइयाँ
            </h3>
            <ChevronRight size={22} className="text-gray-400" />
          </div>
          <div className="mt-3 space-y-2">
            {data.medicines.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-xl">💊</span>
                <div>
                  <p className="text-elder-base font-semibold">{m.name} - {m.dosage}</p>
                  <p className="text-elder-sm text-gray-600">समय: {m.times}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Health Alerts */}
      {data.healthAlerts?.length > 0 && (
        <section className="card border-l-4 border-red-500">
          <h3 className="text-elder-lg font-bold text-red-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={22} /> स्वास्थ्य चेतावनी
          </h3>
          {data.healthAlerts.map((a, i) => (
            <p key={i} className="text-elder-base text-red-600 py-1">{a.message}</p>
          ))}
        </section>
      )}

      {/* Government Updates */}
      {data.governmentUpdates?.length > 0 && (
        <section className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-elder-lg font-bold flex items-center gap-2">
              <Newspaper size={22} className="text-yellow-600" /> ताज़ा सरकारी अपडेट
            </h3>
            <button onClick={() => navigate('/gov-updates')} className="text-saffron-500 font-semibold text-elder-sm">सभी देखें</button>
          </div>
          <div className="space-y-3">
            {data.governmentUpdates.map(u => (
              <div key={u.id} className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition" onClick={() => navigate(`/gov-updates/${u.id}`)}>
                <p className="text-elder-base font-semibold">{u.title}</p>
                {u.action_required ? <span className="badge-red text-xs mt-1">कार्रवाई आवश्यक</span> : null}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
