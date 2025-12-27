
import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

// Simplified icons for brevity
const { MessageSquare, Send, Zap, Plus, X, Trash2, CheckCircle2, Instagram, Smartphone, LayoutGrid, MousePointer2, Settings2, BarChart3, RefreshCcw, ShieldCheck, ArrowRight, ExternalLink, Image: ImageIcon } = LucideIcons;

// Interfaces remain the same
interface Post {
  id: string;
  thumbnail_url?: string; // from Instagram API
  media_url: string;
  caption: string;
  likes: number; // Placeholder, not in basic media API
  comments: number; // Placeholder
}

interface Campaign {
  id: string;
  postId: string;
  keyword: string;
  tone: 'friendly' | 'professional' | 'funny';
  status: 'active' | 'paused';
  repliesCount: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'campaigns' | 'analytics'>('posts');
  const [isConnected, setIsConnected] = useState(false); // This will now be controlled by server auth
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState<'friendly' | 'professional' | 'funny'>('friendly');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if user is "connected" by trying to fetch data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const postsRes = await fetch('/api/posts');
        if (!postsRes.ok) throw new Error('Not authenticated');
        const postsData = await postsRes.json();
        // Map Instagram API response to our Post interface
        setPosts(postsData.map((p: any) => ({
          id: p.id,
          media_url: p.media_url,
          thumbnail_url: p.thumbnail_url || p.media_url, // Use media_url if thumbnail is not available (e.g., for videos)
          caption: p.caption || 'No caption for this media.',
          likes: 0, // Placeholder
          comments: 0 // Placeholder
        })));

        const campaignsRes = await fetch('/api/campaigns');
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData);

        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConnect = () => {
    // Redirect to backend OAuth route
    window.location.href = '/auth/facebook';
  };

  const createCampaign = async () => {
    if (!selectedPost || !keyword) return;
    setIsSaving(true);
    
    const newCampaignData = {
      id: Math.random().toString(36).substr(2, 9),
      postId: selectedPost.id,
      keyword: keyword,
      tone: tone,
      status: 'active',
      repliesCount: 0
    };

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaignData),
      });
      const savedCampaign = await response.json();
      setCampaigns([...campaigns, savedCampaign]);

      // Reset and close modal
      setKeyword('');
      setSelectedPost(null);
      setShowModal(false);
      setActiveTab('campaigns');
    } catch (error) {
      console.error("Failed to create campaign:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    }
  };

  const getPostById = (id: string) => posts.find(p => p.id === id);

  // The Login UI remains mostly the same, but the button action changes
  if (!isConnected && !isLoading) {
    return (
       <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full glass p-12 rounded-[50px] border-indigo-500/20 text-center shadow-2xl">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Instagram size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">اتصال به اینستاگرام</h1>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed">
            برای مدیریت هوشمند کامنت‌ها، باید از طریق فیس‌بوک به اکانت بیزنس خود متصل شوید.
          </p>
          <button 
            onClick={handleConnect}
            className="w-full bg-indigo-600 py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30"
          >
            <ShieldCheck size={20}/> ورود با Facebook
          </button>
        </div>
      </div>
    );
  }

  // A simple loading state
  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <RefreshCcw className="animate-spin text-indigo-500" size={48} />
        </div>
    );
  }

  // The main application UI (largely unchanged, but now powered by real data)
  return (
     <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col md:flex-row" dir="rtl">
      <aside className="w-full md:w-72 glass border-l border-white/5 p-8 flex flex-col z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Zap size={24} />
          </div>
          <h1 className="text-xl font-black">روبوکا کلیک</h1>
        </div>
        <nav className="flex-1 space-y-2">
           {[{ id: 'posts', icon: LayoutGrid, label: 'پست‌ها' }, { id: 'campaigns', icon: Zap, label: 'کمپین‌های فعال' }, { id: 'analytics', icon: BarChart3, label: 'آمار و گزارش' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5'}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'posts' && (
          <div>
            <h2 className="text-3xl font-black mb-10 text-right">انتخاب پست برای اتوماسیون</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <div key={post.id} className="glass rounded-[40px] overflow-hidden group border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer shadow-xl" onClick={() => { setSelectedPost(post); setShowModal(true); }}>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="post" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-indigo-600 p-4 rounded-full text-white shadow-2xl"><Plus size={24} /></div>
                    </div>
                  </div>
                   <div className="p-6">
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8 text-right leading-relaxed">{post.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

         {activeTab === 'campaigns' && (
          <div>
            <h2 className="text-3xl font-black mb-10 text-right">مدیریت کمپین‌ها</h2>
            <div className="space-y-6">
              {campaigns.map(camp => {
                const post = getPostById(camp.postId);
                return (
                  <div key={camp.id} className="glass p-6 rounded-[35px] border-white/5 flex items-center gap-8 group hover:border-indigo-500/20 transition-all">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={post?.thumbnail_url || post?.media_url} className="w-full h-full object-cover" alt="thumb" />
                    </div>
                    <div className="flex-1 text-right">
                       <h4 className="font-black text-lg">کلمه کلیدی: "{camp.keyword}"</h4>
                       <p className="text-xs text-slate-500 mb-4 line-clamp-1">پست: {post?.caption}</p>
                    </div>
                    <button onClick={() => deleteCampaign(camp.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                  </div>
                );
              })}
              {campaigns.length === 0 && <div className="text-center py-20"><p>هیچ کمپینی فعال نیست.</p></div>}
            </div>
          </div>
        )}
      </main>

      {showModal && selectedPost && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-4xl glass rounded-[60px] overflow-hidden flex">
             <div className="w-1/2 bg-slate-900/50 p-10 flex flex-col justify-center">
                <img src={selectedPost.media_url} className="rounded-[40px] object-cover" alt="selected" />
             </div>
             <div className="w-1/2 p-12 text-right">
                <h3 className="text-2xl font-black text-white mb-10">تنظیم اتوماسیون</h3>
                 <div className="space-y-8">
                   <div>
                      <label className="text-xs text-slate-500 px-2">کلمه کلیدی</label>
                      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full bg-slate-950 border-white/10 rounded-2xl p-4"/>
                   </div>
                   <div>
                      <label className="text-xs text-slate-500 px-2">لحن پاسخ</label>
                       <div className="grid grid-cols-3 gap-3">
                         {[ { id: 'friendly', label: 'صمیمی' }, { id: 'professional', label: 'رسمی' }, { id: 'funny', label: 'طنز' }].map(t => (
                           <button key={t.id} onClick={() => setTone(t.id as any)} className={`py-3 rounded-2xl text-xs font-bold ${tone === t.id ? 'bg-indigo-600' : 'bg-white/5'}`}>{t.label}</button>
                         ))}
                      </div>
                   </div>
                   <button onClick={createCampaign} disabled={isSaving} className="w-full bg-indigo-600 py-4 rounded-3xl font-bold">{isSaving ? 'در حال ذخیره...' : 'ایجاد کمپین'}</button>
                </div>
                 <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500"><X/></button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
