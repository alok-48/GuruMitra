import { useState, useEffect } from 'react';
import { Heart, Landmark, FileText, Car, HelpCircle, Send, Clock, CheckCircle, AlertTriangle, Phone } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import SOSButton from '../shared/SOSButton';

const HELP_TYPES = [
  { id: 'health', icon: Heart, label: 'स्वास्थ्य मदद', desc: 'डॉक्टर, दवाई, अस्पताल', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 'bank', icon: Landmark, label: 'बैंक मदद', desc: 'पेंशन, खाता, ATM', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'document', icon: FileText, label: 'दस्तावेज़ मदद', desc: 'फॉर्म, प्रमाणपत्र, आवेदन', color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'transport', icon: Car, label: 'यात्रा मदद', desc: 'गाड़ी, अस्पताल जाना', color: 'bg-purple-50 text-purple-600 border-purple-200' },
];

export default function HelpScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/help/my').then(d => setRequests(d.requests || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submitRequest = async () => {
    if (!selectedType && !description) return;
    setSubmitting(true);
    try {
      const result = await api.post('/help', { category: selectedType, description: description || undefined });
      alert(result.message);
      setShowForm(false);
      setDescription('');
      setSelectedType('');
      const data = await api.get('/help/my');
      setRequests(data.requests || []);
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const statusColors = {
    open: 'badge-orange',
    assigned: 'badge-blue',
    in_progress: 'badge-blue',
    resolved: 'badge-green',
    closed: 'bg-gray-100 text-gray-600',
  };
  const statusLabels = {
    open: '⏳ अनुरोध भेजा',
    assigned: '👤 कोई आ रहा है',
    in_progress: '🔄 मदद जारी',
    resolved: '✅ हल हो गया',
    closed: '📋 बंद',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pb-4 space-y-5">
      {/* Emergency SOS */}
      <div className="card bg-red-50 border-2 border-red-200">
        <h2 className="text-elder-lg font-bold text-red-700 mb-3 flex items-center gap-2"><Phone size={24} /> आपातकालीन मदद</h2>
        <SOSButton size="large" />
        <p className="text-elder-sm text-red-600 mt-3 text-center">यह बटन दबाने पर तुरंत मदद भेजी जाएगी</p>
      </div>

      {/* Quick Help */}
      {!showForm ? (
        <div className="space-y-4">
          <h3 className="text-elder-lg font-bold">किस तरह की मदद चाहिए?</h3>
          <div className="grid grid-cols-2 gap-3">
            {HELP_TYPES.map(({ id, icon: Icon, label, desc, color }) => (
              <button key={id}
                onClick={() => { setSelectedType(id); setShowForm(true); }}
                className={`card flex flex-col items-center gap-3 py-5 border-2 hover:shadow-lg transition ${color}`}>
                <Icon size={36} />
                <div className="text-center">
                  <p className="text-elder-base font-bold">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { setSelectedType('general'); setShowForm(true); }}
            className="btn-secondary w-full">
            <HelpCircle size={22} /> अन्य मदद
          </button>
        </div>
      ) : (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-saffron-500 rounded-full flex items-center justify-center">
              {(() => { const type = HELP_TYPES.find(t => t.id === selectedType); return type ? <type.icon size={24} className="text-white" /> : <HelpCircle size={24} className="text-white" />; })()}
            </div>
            <div>
              <h3 className="text-elder-lg font-bold">{HELP_TYPES.find(t => t.id === selectedType)?.label || 'अन्य मदद'}</h3>
              <p className="text-elder-sm text-gray-500">अपनी ज़रूरत बताएं</p>
            </div>
          </div>

          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="input-elder min-h-[120px]" placeholder="बताएं क्या मदद चाहिए... (जितना हो सके विस्तार से लिखें)" />

          <div className="flex gap-3">
            <button onClick={submitRequest} disabled={submitting} className="btn-primary flex-1">
              <Send size={20} /> {submitting ? 'भेज रहे हैं...' : 'मदद माँगें'}
            </button>
            <button onClick={() => { setShowForm(false); setDescription(''); setSelectedType(''); }} className="btn-secondary flex-1">
              वापस
            </button>
          </div>
        </div>
      )}

      {/* Past Requests */}
      {requests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-elder-lg font-bold flex items-center gap-2"><Clock size={22} /> मेरे अनुरोध</h3>
          {requests.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-elder-base font-bold capitalize">
                    {HELP_TYPES.find(t => t.id === r.category)?.label || r.category}
                  </p>
                  {r.description && <p className="text-elder-sm text-gray-600 mt-1">{r.description}</p>}
                  {r.volunteer_name && <p className="text-elder-sm text-blue-600 mt-1">सहायक: {r.volunteer_name}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString('hi-IN')}</p>
                </div>
                <span className={statusColors[r.status] || 'badge-orange'}>{statusLabels[r.status] || r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
