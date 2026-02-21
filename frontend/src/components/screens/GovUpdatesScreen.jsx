import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Newspaper, AlertTriangle, ChevronRight, ArrowLeft, CheckCircle2, BookOpen, Filter } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const CATEGORIES = [
  { id: 'all', label: 'सभी' },
  { id: 'pension', label: 'पेंशन' },
  { id: 'health', label: 'स्वास्थ्य' },
  { id: 'tax', label: 'कर' },
  { id: 'welfare', label: 'कल्याण' },
];

function UpdatesList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();

  const loadUpdates = (cat) => {
    api.get(`/gov-updates?category=${cat}`).then(setData).catch(() => {});
  };

  useEffect(() => {
    api.get('/gov-updates').then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const changeCategory = (cat) => {
    setCategory(cat);
    loadUpdates(cat);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pb-4 space-y-5">
      {/* Action Required */}
      {data?.actionRequired?.length > 0 && (
        <div className="card border-l-4 border-red-500 bg-red-50">
          <h3 className="text-elder-lg font-bold text-red-700 flex items-center gap-2 mb-3">
            <AlertTriangle size={22} /> कार्रवाई ज़रूरी
          </h3>
          {data.actionRequired.map(u => (
            <button key={u.id} onClick={() => navigate(`/gov-updates/${u.id}`)}
              className="w-full flex items-center justify-between p-3 bg-white rounded-lg mb-2 hover:bg-red-50 transition text-left">
              <div>
                <p className="text-elder-base font-semibold">{u.title}</p>
                {u.action_deadline && <p className="text-elder-sm text-red-600">अंतिम तिथि: {u.action_deadline}</p>}
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => changeCategory(cat.id)}
            className={`px-4 py-2.5 rounded-elder font-medium text-elder-sm whitespace-nowrap transition ${
              category === cat.id ? 'bg-yellow-500 text-white shadow' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Updates */}
      {(!data?.updates || data.updates.length === 0) ? (
        <div className="card text-center py-8">
          <Newspaper size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-elder-base text-gray-500">इस श्रेणी में कोई अपडेट नहीं</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.updates.map(u => (
            <button key={u.id} onClick={() => navigate(`/gov-updates/${u.id}`)}
              className="card w-full text-left hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-elder-lg font-bold">{u.title}</p>
                  {u.simplified_text && <p className="text-elder-sm text-gray-600 mt-1 line-clamp-2">{u.simplified_text}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-blue text-xs">{u.category}</span>
                    {u.action_required ? <span className="badge-red text-xs">कार्रवाई ज़रूरी</span> : null}
                    <span className="text-xs text-gray-400">{new Date(u.published_at).toLocaleDateString('hi-IN')}</span>
                  </div>
                </div>
                <ChevronRight size={22} className="text-gray-400 mt-2" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UpdateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/gov-updates/${id}`).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center p-8 text-elder-lg">अपडेट नहीं मिला</p>;

  const u = data.update;
  const ai = data.aiAnalysis;

  return (
    <div className="pb-4 space-y-5">
      <div className="card">
        <h2 className="text-elder-xl font-bold mb-3">{u.title}</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="badge-blue">{u.category}</span>
          {u.action_required ? <span className="badge-red">कार्रवाई ज़रूरी</span> : <span className="badge-green">जानकारी</span>}
          <span className="text-xs text-gray-400">{new Date(u.published_at).toLocaleDateString('hi-IN')}</span>
        </div>

        {/* Simplified Text */}
        <div className="bg-green-50 border border-green-200 rounded-elder p-4 mb-4">
          <h3 className="text-elder-base font-bold text-green-700 flex items-center gap-2 mb-2"><BookOpen size={20} /> सरल भाषा में</h3>
          <p className="text-elder-lg leading-relaxed">{u.simplified_text}</p>
        </div>

        {/* Action Steps */}
        {u.action_steps?.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-elder p-4 mb-4">
            <h3 className="text-elder-base font-bold text-orange-700 mb-3">आपको क्या करना है:</h3>
            <div className="space-y-2">
              {u.action_steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-elder-base">{step}</p>
                </div>
              ))}
            </div>
            {u.action_deadline && <p className="text-elder-base text-red-600 font-bold mt-3">अंतिम तिथि: {u.action_deadline}</p>}
          </div>
        )}

        {/* AI Analysis */}
        {ai && (
          <div className="bg-blue-50 border border-blue-200 rounded-elder p-4">
            <h3 className="text-elder-base font-bold text-blue-700 mb-2">AI विश्लेषण</h3>
            {ai.impact && (
              <p className="text-elder-sm">
                प्रभाव:{' '}
                <span className={ai.impact === 'positive' ? 'text-green-700 font-bold' : ai.impact === 'negative' ? 'text-red-700 font-bold' : 'text-orange-700 font-bold'}>
                  {ai.impact === 'positive' ? '✅ सकारात्मक' : ai.impact === 'negative' ? '❌ नकारात्मक' : ai.impact === 'action_needed' ? '⚠️ कार्रवाई ज़रूरी' : 'ℹ️ सूचना'}
                </span>
              </p>
            )}
            {ai.whatChanged?.length > 0 && (
              <div className="mt-2">
                <p className="text-elder-sm font-semibold">क्या बदला:</p>
                {ai.whatChanged.map((c, i) => (
                  <p key={i} className="text-elder-sm">{c.from} → <strong>{c.to}</strong></p>
                ))}
              </div>
            )}
            {ai.glossary?.length > 0 && (
              <div className="mt-3">
                <p className="text-elder-sm font-semibold mb-1">शब्दावली:</p>
                {ai.glossary.map((g, i) => (
                  <p key={i} className="text-elder-sm text-gray-600"><strong>{g.term}:</strong> {g.explanation}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Original */}
        {u.original_text && (
          <details className="mt-4">
            <summary className="text-elder-sm text-gray-500 cursor-pointer hover:text-gray-700">मूल पाठ देखें (Original Text)</summary>
            <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg">{u.original_text}</p>
          </details>
        )}
      </div>
    </div>
  );
}

export { UpdatesList, UpdateDetail };
export default UpdatesList;
