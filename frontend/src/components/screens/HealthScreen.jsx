import { useState, useEffect } from 'react';
import { Pill, Plus, FileHeart, Activity, Clock, Check, X, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import SOSButton from '../shared/SOSButton';

export default function HealthScreen() {
  const [tab, setTab] = useState('medicines');
  const [medicines, setMedicines] = useState([]);
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', times: '08:00', frequency: 'daily' });

  useEffect(() => {
    Promise.all([
      api.get('/health/medicines'),
      api.get('/health/records'),
      api.get('/health/alerts'),
      api.get('/health/timeline'),
    ]).then(([medData, recData, alertData, tlData]) => {
      setMedicines(medData.medicines || []);
      setRecords(recData.records || []);
      setAlerts(alertData);
      setTimeline(tlData.timeline || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAddMedicine = async () => {
    if (!newMed.name) return;
    try {
      await api.post('/health/medicines', newMed);
      const data = await api.get('/health/medicines');
      setMedicines(data.medicines || []);
      setShowAddMedicine(false);
      setNewMed({ name: '', dosage: '', times: '08:00', frequency: 'daily' });
    } catch (e) { alert(e.message); }
  };

  const logIntake = async (medicineId, status) => {
    try {
      await api.post('/health/medicines/log', { medicine_id: medicineId, status });
    } catch (e) { alert(e.message); }
  };

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: 'medicines', icon: Pill, label: 'दवाइयाँ' },
    { id: 'records', icon: FileHeart, label: 'रिकॉर्ड' },
    { id: 'timeline', icon: Clock, label: 'टाइमलाइन' },
  ];

  return (
    <div className="pb-4 space-y-4">
      <SOSButton />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-elder font-semibold text-elder-sm whitespace-nowrap transition ${
              tab === id ? 'bg-saffron-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <Icon size={20} /> {label}
          </button>
        ))}
      </div>

      {/* Health Alerts */}
      {alerts?.alerts?.length > 0 && (
        <div className="card border-l-4 border-red-500 bg-red-50">
          <h3 className="text-elder-base font-bold text-red-700 flex items-center gap-2 mb-2"><AlertTriangle size={20} /> स्वास्थ्य चेतावनी</h3>
          {alerts.alerts.map((a, i) => (
            <p key={i} className="text-elder-sm text-red-600">{a.message}</p>
          ))}
          {alerts.adherenceScore !== undefined && (
            <div className="mt-3">
              <p className="text-elder-sm text-gray-700">दवाई नियमितता: <strong>{alerts.adherenceScore}%</strong></p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div className={`h-3 rounded-full ${alerts.adherenceScore > 70 ? 'bg-green-500' : alerts.adherenceScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${alerts.adherenceScore}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medicines Tab */}
      {tab === 'medicines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-elder-lg font-bold">मेरी दवाइयाँ</h2>
            <button onClick={() => setShowAddMedicine(true)} className="btn-primary !py-3 !px-4 !text-elder-sm">
              <Plus size={20} /> नई दवाई
            </button>
          </div>

          {showAddMedicine && (
            <div className="card border-2 border-saffron-500 space-y-4">
              <h3 className="text-elder-lg font-bold">नई दवाई जोड़ें</h3>
              <div>
                <label className="label-elder">दवाई का नाम *</label>
                <input value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))}
                  className="input-elder" placeholder="जैसे: Amlodipine" />
              </div>
              <div>
                <label className="label-elder">खुराक</label>
                <input value={newMed.dosage} onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))}
                  className="input-elder" placeholder="जैसे: 5mg" />
              </div>
              <div>
                <label className="label-elder">समय</label>
                <input type="time" value={newMed.times} onChange={e => setNewMed(p => ({ ...p, times: e.target.value }))}
                  className="input-elder" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddMedicine} className="btn-primary flex-1">जोड़ें</button>
                <button onClick={() => setShowAddMedicine(false)} className="btn-secondary flex-1">रद्द करें</button>
              </div>
            </div>
          )}

          {medicines.length === 0 ? (
            <div className="card text-center py-8">
              <Pill size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-elder-base text-gray-500">अभी कोई दवाई नहीं जोड़ी गई</p>
            </div>
          ) : (
            medicines.map(m => (
              <div key={m.id} className="card flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Pill size={28} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-elder-lg font-bold">{m.name}</p>
                  <p className="text-elder-sm text-gray-600">{m.dosage} | {m.frequency === 'daily' ? 'रोज़' : m.frequency === 'twice_daily' ? 'दिन में दो बार' : m.frequency}</p>
                  <p className="text-elder-sm text-gray-500">समय: {m.times}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => logIntake(m.id, 'taken')} className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition" aria-label="दवाई ली">
                    <Check size={24} className="text-green-600" />
                  </button>
                  <button onClick={() => logIntake(m.id, 'skipped')} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition" aria-label="छोड़ दी">
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Records Tab */}
      {tab === 'records' && (
        <div className="space-y-4">
          <h2 className="text-elder-lg font-bold">स्वास्थ्य रिकॉर्ड</h2>
          {records.length === 0 ? (
            <div className="card text-center py-8">
              <FileHeart size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-elder-base text-gray-500">अभी कोई रिकॉर्ड नहीं है</p>
            </div>
          ) : (
            records.map(r => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-elder-lg font-bold">{r.title}</p>
                    <p className="text-elder-sm text-gray-600">{r.record_type} | {r.record_date}</p>
                    {r.doctor_name && <p className="text-elder-sm text-gray-500">डॉक्टर: {r.doctor_name}</p>}
                  </div>
                  <span className="badge-blue">{r.record_type}</span>
                </div>
                {r.description && <p className="text-elder-sm text-gray-600 mt-2">{r.description}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {tab === 'timeline' && (
        <div className="space-y-3">
          <h2 className="text-elder-lg font-bold flex items-center gap-2"><Activity size={22} /> स्वास्थ्य टाइमलाइन</h2>
          {timeline.length === 0 ? (
            <div className="card text-center py-8">
              <Clock size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-elder-base text-gray-500">अभी कोई गतिविधि नहीं</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-2 ${t.source === 'medicine' ? 'bg-red-400' : 'bg-blue-400'}`} />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
                  </div>
                  <div className="card flex-1 !p-3">
                    <p className="text-elder-base font-semibold">{t.title}</p>
                    <p className="text-elder-sm text-gray-500">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(t.date).toLocaleString('hi-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
