import { useState, useEffect, useRef } from 'react';
import { FolderOpen, Upload, FileText, Clock, Trash2, Tag, Search } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const CATEGORIES = [
  { id: 'all', label: 'सभी', emoji: '📁' },
  { id: 'identity', label: 'पहचान पत्र', emoji: '🪪' },
  { id: 'pension', label: 'पेंशन', emoji: '🏦' },
  { id: 'medical', label: 'मेडिकल', emoji: '🏥' },
  { id: 'property', label: 'संपत्ति', emoji: '🏠' },
  { id: 'education', label: 'शिक्षा', emoji: '🎓' },
  { id: 'legal', label: 'कानूनी', emoji: '⚖️' },
  { id: 'other', label: 'अन्य', emoji: '📄' },
];

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const loadDocuments = (category = 'all') => {
    api.get(`/documents?category=${category}`)
      .then(data => { setDocuments(data.documents || []); setCategoryCounts(data.categoryCounts || []); })
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      api.get('/documents?category=all'),
      api.get('/documents/deadlines'),
    ]).then(([docData, dlData]) => {
      setDocuments(docData.documents || []);
      setCategoryCounts(docData.categoryCounts || []);
      setDeadlines(dlData.deadlines || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.upload('/documents/upload', formData);
      alert(result.message || 'दस्तावेज़ जमा हो गया');
      loadDocuments(activeCategory);
    } catch (err) { alert(err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप यह दस्तावेज़ हटाना चाहते हैं?')) return;
    try {
      await api.delete(`/documents/${id}`);
      loadDocuments(activeCategory);
    } catch (e) { alert(e.message); }
  };

  const selectCategory = (cat) => {
    setActiveCategory(cat);
    loadDocuments(cat);
  };

  if (loading) return <LoadingSpinner />;

  const getCount = (cat) => categoryCounts.find(c => c.category === cat)?.count || 0;

  return (
    <div className="pb-4 space-y-5">
      {/* Upload */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50">
        <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="btn-primary w-full !bg-sage-600 hover:!bg-sage-700">
          <Upload size={24} /> {uploading ? 'अपलोड हो रहा है...' : 'नया दस्तावेज़ अपलोड करें'}
        </button>
        <p className="text-elder-sm text-gray-500 mt-2 text-center">PDF, JPG, PNG, DOC (अधिकतम 10MB)</p>
      </div>

      {/* Deadlines */}
      {deadlines.length > 0 && (
        <div className="card border-l-4 border-orange-500">
          <h3 className="text-elder-base font-bold flex items-center gap-2 mb-2"><Clock size={20} className="text-orange-500" /> आगामी समय-सीमा</h3>
          {deadlines.map(d => (
            <div key={d.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <p className="text-elder-sm font-medium">{d.title}</p>
              <span className="badge-orange">{d.expiry_date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => selectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-elder font-medium text-elder-sm whitespace-nowrap transition ${
              activeCategory === cat.id ? 'bg-saffron-500 text-white shadow' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <span>{cat.emoji}</span> {cat.label}
            {cat.id !== 'all' && getCount(cat.id) > 0 && (
              <span className="bg-white/30 rounded-full px-1.5 text-xs">{getCount(cat.id)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="card text-center py-10">
          <FolderOpen size={56} className="mx-auto text-gray-300 mb-3" />
          <p className="text-elder-lg text-gray-500">इस श्रेणी में कोई दस्तावेज़ नहीं</p>
          <p className="text-elder-sm text-gray-400">ऊपर बटन से अपलोड करें</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="card flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-elder-base font-bold truncate">{doc.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="badge-blue text-xs">{CATEGORIES.find(c => c.id === doc.category)?.label || doc.category}</span>
                  {doc.tags && (
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Tag size={12} />{JSON.parse(doc.tags).join(', ')}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{new Date(doc.created_at).toLocaleDateString('hi-IN')}</p>
              </div>
              <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-full hover:bg-red-50 transition" aria-label="हटाएं">
                <Trash2 size={20} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
