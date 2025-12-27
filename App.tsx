
import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { generateCampaignReply } from './services/geminiService.ts';

// Fix: Use ':' instead of 'as' for aliasing in object destructuring from LucideIcons
const { 
  MessageSquare, Send, Zap, Plus, X, Trash2, 
  CheckCircle2, Instagram, Smartphone, LayoutGrid, 
  MousePointer2, Settings2, BarChart3, RefreshCcw, 
  ShieldCheck, ArrowRight, ExternalLink, Image: ImageIcon
} = LucideIcons;

// ساختار داده‌ای یک پست
interface Post {
  id: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
}

// ساختار داده‌ای یک کمپین اتوماسیون
interface Campaign {
  id: string;
  postId: string;
  keyword: string;
  tone: 'friendly' | 'professional' | 'funny';
  status: 'active' | 'paused';
  repliesCount: number;
}

const MOCK_POSTS: Post[] = [
  { id: 'p1', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=300&fit=crop', caption: 'تکنولوژی‌های جدید در سال ۲۰۲۴! عدد ۱ را کامنت کنید.', likes: 120, comments: 45 },
  { id: 'p2', thumbnail: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=300&h=300&fit=crop', caption: 'تخفیف ویژه عیدانه فقط برای امروز. کلمه تخفیف را بفرستید.', likes: 340, comments: 89 },
  { id: 'p3', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop', caption: 'آموزش برنامه‌نویسی از صفر. عدد ۵ را کامنت کنید.', likes: 210, comments: 32 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'campaigns' | 'analytics'>('posts');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // States for new campaign modal
  const [showModal, setShowModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState<'friendly' | 'professional' | 'funny'>('friendly');
  const [isSaving, setIsSaving] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('roboka_v2_campaigns');
    if (saved) setCampaigns(JSON.parse(saved));
    const conn = localStorage.getItem('roboka_v2_connected');
    if (conn === 'true') setIsConnected(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('roboka_v2_campaigns', JSON.stringify(campaigns));
    localStorage.setItem('roboka_v2_connected', isConnected.toString());
  }, [campaigns, isConnected]);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const createCampaign = () => {
    if (!selectedPost || !keyword) return;
    setIsSaving(true);
    
    setTimeout(() => {
      const newCampaign: Campaign = {
        id: Math.random().toString(36).substr(2, 9),
        postId: selectedPost.id,
        keyword: keyword,
        tone: tone,
        status: 'active',
        repliesCount: 0
      };
      setCampaigns([...campaigns, newCampaign]);
      setKeyword('');
      setSelectedPost(null);
      setShowModal(false);
      setIsSaving(false);
      setActiveTab('campaigns');
    }, 1000);
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const getPostById = (id: string) => MOCK_POSTS.find(p => p.id === id);

  if (!isConnected) {
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
            disabled={isConnecting}
            className="w-full bg-indigo-600 py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30"
          >
            {isConnecting ? <RefreshCcw className="animate-spin" /> : <><ShieldCheck size={20}/> ورود با Facebook</>}
          </button>
          <p className="text-[10px] text-slate-600 mt-6 flex items-center justify-center gap-2">
            <ShieldCheck size={12}/> اطلاعات شما نزد ما محفوظ است.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-72 glass border-l border-white/5 p-8 flex flex-col z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Zap size={24} />
          </div>
          <h1 className="text-xl font-black">روبوکا کلیک</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'posts', icon: LayoutGrid, label: 'پست‌ها' },
            { id: 'campaigns', icon: Zap, label: 'کمپین‌های فعال' },
            { id: 'analytics', icon: BarChart3, label: 'آمار و گزارش' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5'}`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5">
           <button onClick={() => setIsConnected(false)} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 text-xs font-bold hover:bg-red-500/10 rounded-xl transition-all">
             <ArrowRight size={14} /> قطع اتصال پیج
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'posts' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-10">
              <div className="text-right">
                <h2 className="text-3xl font-black mb-2">انتخاب پست برای اتوماسیون</h2>
                <p className="text-slate-500 text-sm">پستی را که می‌خواهید برای آن پاسخ خودکار تعریف کنید انتخاب کنید.</p>
              </div>
              <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><RefreshCcw size={18}/></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_POSTS.map(post => (
                <div key={post.id} className="glass rounded-[40px] overflow-hidden group border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer shadow-xl" onClick={() => { setSelectedPost(post); setShowModal(true); }}>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="post" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-indigo-600 p-4 rounded-full text-white shadow-2xl">
                          <Plus size={24} />
                       </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8 text-right leading-relaxed">{post.caption}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                       <span className="flex items-center gap-1"><MessageSquare size={12}/> {post.comments} کامنت</span>
                       <span className="flex items-center gap-1"><Zap size={12} className="text-indigo-400"/> آماده اتوماسیون</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="animate-in slide-in-from-bottom-5">
            <h2 className="text-3xl font-black mb-10 text-right">مدیریت کمپین‌ها</h2>
            <div className="space-y-6">
              {campaigns.map(camp => {
                const post = getPostById(camp.postId);
                return (
                  <div key={camp.id} className="glass p-6 rounded-[35px] border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-indigo-500/20 transition-all">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={post?.thumbnail} className="w-full h-full object-cover" alt="thumb" />
                    </div>
                    <div className="flex-1 text-right">
                       <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-black text-lg">کلمه کلیدی: "{camp.keyword}"</h4>
                          <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
                       </div>
                       <p className="text-xs text-slate-500 mb-4 line-clamp-1">پست: {post?.caption}</p>
                       <div className="flex gap-6">
                          <div className="text-[11px] text-slate-400"><span className="text-white font-bold">{camp.repliesCount}</span> پاسخ ارسال شده</div>
                          <div className="text-[11px] text-slate-400"><span className="text-indigo-400 font-bold uppercase">{camp.tone}</span> لحن هوش مصنوعی</div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => deleteCampaign(camp.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                       <button className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Settings2 size={18}/></button>
                    </div>
                  </div>
                );
              })}
              {campaigns.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-[50px] border border-dashed border-white/10">
                   <Zap size={48} className="mx-auto mb-4 opacity-10" />
                   <p className="text-slate-500 font-bold">هیچ کمپین فعالی ندارید. از بخش پست‌ها شروع کنید.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-32 animate-in zoom-in-95">
             <BarChart3 size={64} className="mx-auto mb-6 text-slate-800" />
             <h3 className="text-2xl font-black mb-2">در حال جمع‌آوری داده‌ها...</h3>
             <p className="text-slate-600 text-sm">آمار دقیق تعاملات و تبدیل‌ها به زودی در اینجا نمایش داده می‌شود.</p>
          </div>
        )}
      </main>

      {/* Modal: Create Campaign */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-4xl glass rounded-[60px] overflow-hidden flex flex-col md:flex-row shadow-2xl border-white/10">
             <div className="md:w-1/2 bg-slate-900/50 p-10 flex flex-col justify-center border-l border-white/5">
                <div className="aspect-square rounded-[40px] overflow-hidden mb-6 shadow-2xl">
                   <img src={selectedPost.thumbnail} className="w-full h-full object-cover" alt="selected" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed text-right" dir="rtl">{selectedPost.caption}</p>
             </div>
             
             <div className="md:w-1/2 p-12 text-right">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-2xl font-black text-white">تنظیم اتوماسیون پست</h3>
                   <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X/></button>
                </div>

                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">کلمه کلیدی (Keyword)</label>
                      <div className="relative">
                        <input 
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          placeholder="مثلاً: ۱، قیمت، دانلود"
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-xl font-black text-indigo-400 outline-none focus:border-indigo-600 transition-all"
                        />
                        <Zap size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" />
                      </div>
                      <p className="text-[10px] text-slate-600 px-2">ربات فقط به کامنت‌هایی که شامل این کلمه باشند پاسخ می‌دهد.</p>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">لحن پاسخ هوش مصنوعی</label>
                      <div className="grid grid-cols-3 gap-3">
                         {[
                           { id: 'friendly', label: 'صمیمی', icon: '😊' },
                           { id: 'professional', label: 'رسمی', icon: '💼' },
                           { id: 'funny', label: 'طنز/خاکی', icon: '😂' },
                         ].map(t => (
                           <button 
                             key={t.id}
                             onClick={() => setTone(t.id as any)}
                             className={`py-4 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${tone === t.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                           >
                             <span className="text-xl">{t.icon}</span>
                             {t.label}
                           </button>
                         ))}
                      </div>
                   </div>

                   <button 
                    onClick={createCampaign}
                    disabled={!keyword || isSaving}
                    className="w-full bg-indigo-600 py-6 rounded-3xl font-black text-xl text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                   >
                     {isSaving ? <RefreshCcw className="animate-spin mx-auto" /> : 'ایجاد و فعال‌سازی کمپین'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
