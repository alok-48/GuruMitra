import { useState, useEffect } from 'react';
import { Users, MessageCircle, CalendarDays, ThumbsUp, Send, UserPlus } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function CommunityScreen() {
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/community/posts'),
      api.get('/community/groups'),
      api.get('/community/events'),
    ]).then(([postData, groupData, eventData]) => {
      setPosts(postData.posts || []);
      setMyGroups(groupData.myGroups || []);
      setSuggestedGroups(groupData.suggestedGroups || []);
      setEvents(eventData.events || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await api.post('/community/posts', { content: newPost, post_type: 'text' });
      setNewPost('');
      const data = await api.get('/community/posts');
      setPosts(data.posts || []);
    } catch (e) { alert(e.message); }
    finally { setPosting(false); }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    } catch (e) {}
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const result = await api.post(`/community/groups/${groupId}/join`);
      alert(result.message);
      const data = await api.get('/community/groups');
      setMyGroups(data.myGroups || []);
      setSuggestedGroups(data.suggestedGroups || []);
    } catch (e) { alert(e.message); }
  };

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: 'posts', icon: MessageCircle, label: 'पोस्ट' },
    { id: 'groups', icon: Users, label: 'समूह' },
    { id: 'events', icon: CalendarDays, label: 'कार्यक्रम' },
  ];

  return (
    <div className="pb-4 space-y-4">
      <div className="bg-purple-50 rounded-elder p-4">
        <h2 className="text-elder-lg font-bold text-purple-800">🏫 डिजिटल स्टाफ रूम</h2>
        <p className="text-elder-sm text-purple-600">अपने साथियों से जुड़ें, यादें साझा करें</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-elder font-semibold text-elder-sm flex-1 justify-center transition ${
              tab === id ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200'}`}>
            <Icon size={20} /> {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {tab === 'posts' && (
        <div className="space-y-4">
          <div className="card">
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
              className="input-elder min-h-[80px] !text-elder-base" placeholder="कुछ लिखें... अपनी यादें, विचार या शुभकामनाएं..." />
            <button onClick={handlePost} disabled={posting || !newPost.trim()} className="btn-primary w-full mt-3">
              <Send size={20} /> {posting ? 'भेज रहे हैं...' : 'पोस्ट करें'}
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="card text-center py-8">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-elder-base text-gray-500">अभी कोई पोस्ट नहीं है</p>
              <p className="text-elder-sm text-gray-400">पहली पोस्ट आप करें!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="text-elder-base font-bold">{post.author_name}</p>
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('hi-IN')}</p>
                  </div>
                  {post.post_type !== 'text' && <span className="badge-blue ml-auto">{post.post_type === 'memory' ? '📸 याद' : post.post_type === 'voice' ? '🎙️ आवाज़' : post.post_type}</span>}
                </div>
                <p className="text-elder-base leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition">
                    <ThumbsUp size={20} /> <span className="text-elder-sm">{post.likes_count || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Groups */}
      {tab === 'groups' && (
        <div className="space-y-4">
          {myGroups.length > 0 && (
            <>
              <h3 className="text-elder-lg font-bold">मेरे समूह</h3>
              {myGroups.map(g => (
                <div key={g.id} className="card flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><Users size={24} className="text-purple-600" /></div>
                  <div className="flex-1">
                    <p className="text-elder-base font-bold">{g.name}</p>
                    <p className="text-elder-sm text-gray-500">{g.member_count} सदस्य</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {suggestedGroups.length > 0 && (
            <>
              <h3 className="text-elder-lg font-bold">सुझाए गए समूह</h3>
              {suggestedGroups.map(g => (
                <div key={g.id} className="card flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><Users size={24} className="text-gray-500" /></div>
                  <div className="flex-1">
                    <p className="text-elder-base font-bold">{g.name}</p>
                    <p className="text-elder-sm text-gray-500">{g.description}</p>
                  </div>
                  <button onClick={() => handleJoinGroup(g.id)} className="p-3 bg-purple-100 rounded-full hover:bg-purple-200 transition">
                    <UserPlus size={20} className="text-purple-600" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Events */}
      {tab === 'events' && (
        <div className="space-y-4">
          <h3 className="text-elder-lg font-bold">कार्यक्रम</h3>
          {events.length === 0 ? (
            <div className="card text-center py-8">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-elder-base text-gray-500">अभी कोई कार्यक्रम नहीं</p>
            </div>
          ) : (
            events.map(e => (
              <div key={e.id} className="card">
                <p className="text-elder-lg font-bold">{e.content}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(e.created_at).toLocaleDateString('hi-IN')}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
