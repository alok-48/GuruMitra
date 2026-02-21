import { useState, useEffect } from 'react';
import { Landmark, TrendingUp, AlertTriangle, ShieldAlert, History, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function PensionScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFraudCheck, setShowFraudCheck] = useState(false);
  const [fraudMsg, setFraudMsg] = useState('');
  const [fraudResult, setFraudResult] = useState(null);

  useEffect(() => {
    api.get('/pension').then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const checkFraud = async () => {
    if (!fraudMsg.trim()) return;
    try {
      const result = await api.post('/pension/check-fraud', { message: fraudMsg });
      setFraudResult(result);
    } catch (e) { alert(e.message); }
  };

  const requestHelp = async () => {
    try {
      const result = await api.post('/pension/bank-help', { description: 'बैंक/पेंशन संबंधी मदद चाहिए' });
      alert(result.message);
    } catch (e) { alert(e.message); }
  };

  if (loading) return <LoadingSpinner />;

  if (!data?.pension) {
    return (
      <div className="card text-center py-12 mx-4 mt-4">
        <Landmark size={56} className="mx-auto text-gray-300 mb-4" />
        <p className="text-elder-lg text-gray-500">पेंशन जानकारी अभी उपलब्ध नहीं है</p>
        <p className="text-elder-sm text-gray-400 mt-2">कृपया व्यवस्थापक से संपर्क करें</p>
      </div>
    );
  }

  const p = data.pension;

  return (
    <div className="pb-4 space-y-5">
      {/* Pension Status Card */}
      <div className={`card border-l-4 ${p.status === 'active' ? 'border-green-500' : 'border-orange-500'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-elder-lg font-bold flex items-center gap-2"><Landmark size={24} className="text-blue-600" /> पेंशन स्थिति</h2>
          <span className={p.status === 'active' ? 'badge-green' : 'badge-orange'}>{p.statusText}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-elder-sm text-gray-600">मासिक पेंशन</p>
            <p className="text-elder-xl font-bold text-blue-700">₹{p.monthly_amount?.toLocaleString('hi-IN')}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-elder-sm text-gray-600">पिछली राशि</p>
            <p className="text-elder-xl font-bold text-green-700">₹{p.last_credited_amount?.toLocaleString('hi-IN')}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-elder-sm"><strong>PPO नंबर:</strong> {p.ppo_number}</p>
          <p className="text-elder-sm"><strong>बैंक:</strong> {p.bank_name}</p>
          <p className="text-elder-sm"><strong>खाता:</strong> {p.bank_account}</p>
          <p className="text-elder-sm"><strong>पिछली तारीख:</strong> {p.last_credited_date}</p>
        </div>
      </div>

      {/* Analysis Alerts */}
      {data.analysis && !data.analysis.isNormal && (
        <div className="card border-l-4 border-orange-500 bg-orange-50">
          <h3 className="text-elder-base font-bold text-orange-700 flex items-center gap-2 mb-2"><AlertTriangle size={20} /> विश्लेषण चेतावनी</h3>
          {data.analysis.anomalies?.map((a, i) => (
            <p key={i} className="text-elder-sm text-orange-600">{a.message}</p>
          ))}
        </div>
      )}

      {/* Payment History */}
      {data.payments?.length > 0 && (
        <div className="card">
          <h3 className="text-elder-lg font-bold flex items-center gap-2 mb-4"><History size={22} className="text-blue-600" /> भुगतान इतिहास</h3>
          <div className="space-y-3">
            {data.payments.map((pay, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-elder-base font-semibold">{pay.month_year}</p>
                  <p className="text-elder-sm text-gray-500">{pay.credited_date}</p>
                </div>
                <div className="text-right">
                  <p className="text-elder-lg font-bold text-green-700">₹{pay.amount?.toLocaleString('hi-IN')}</p>
                  <span className={pay.status === 'credited' ? 'badge-green' : 'badge-orange'}>{pay.status === 'credited' ? '✅ जमा' : '⏳ ' + pay.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fraud Check */}
      <div className="card">
        <h3 className="text-elder-lg font-bold flex items-center gap-2 mb-3"><ShieldAlert size={22} className="text-red-500" /> धोखाधड़ी जांच</h3>
        <p className="text-elder-sm text-gray-600 mb-3">कोई संदिग्ध मैसेज या कॉल आई है? यहाँ जांचें:</p>

        {!showFraudCheck ? (
          <button onClick={() => setShowFraudCheck(true)} className="btn-secondary w-full">
            <ShieldAlert size={20} /> संदिग्ध मैसेज जांचें
          </button>
        ) : (
          <div className="space-y-3">
            <textarea value={fraudMsg} onChange={e => setFraudMsg(e.target.value)}
              className="input-elder min-h-[100px]" placeholder="संदिग्ध मैसेज यहाँ पेस्ट करें..." />
            <button onClick={checkFraud} className="btn-primary w-full">जांचें</button>

            {fraudResult && (
              <div className={`p-4 rounded-elder ${fraudResult.isSafe ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-elder-base font-bold ${fraudResult.isSafe ? 'text-green-700' : 'text-red-700'}`}>
                  {fraudResult.isSafe ? '✅ यह मैसेज सुरक्षित लगता है' : '🚨 सावधान! यह संदिग्ध है'}
                </p>
                {fraudResult.alerts?.map((a, i) => (
                  <div key={i} className="mt-2 p-2 bg-white rounded-lg">
                    <p className="text-elder-sm text-red-600 font-semibold">{a.description}</p>
                  </div>
                ))}
                {fraudResult.advice && <p className="text-elder-sm text-red-600 mt-2 font-medium">{fraudResult.advice}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bank Help */}
      <button onClick={requestHelp} className="btn-secondary w-full">
        <HelpCircle size={22} /> बैंक संबंधी मदद चाहिए
      </button>
    </div>
  );
}
