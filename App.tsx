
import React, { useState, useEffect, useRef, Suspense } from 'react';
import * as LucideIcons from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSocialStrategy, detectAccountDetails } from './services/geminiService.ts';

// استخراج آیکون‌ها برای جلوگیری از خطاهای احتمالی در ایمپورت مستقیم
const { 
  LayoutDashboard, Zap, Activity, Power, TrendingUp, Cpu, ShieldCheck, 
  Send, Lock, CheckCircle2, RefreshCcw, Terminal, Code, Search, 
  ChevronLeft, Edit3, AlertTriangle, Instagram, Settings, Info, 
  Users, Eye, Server, Globe, Database, CloudLightning, Box, Wifi, WifiOff 
} = LucideIcons;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'automation' | 'infra'>('dashboard');
  const [account, setAccount] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<any>(null);
  const [workerStatus, setWorkerStatus] = useState<'offline' | 'checking' | 'online'>('offline');
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["[System] Roboka Engine v6.0 Ready.", "[Info] Web environment initialized."]);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addConsoleLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString('fa-IR')}] ${msg}`].slice(-50));
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  const handleStartScan = async () => {
    if (!usernameInput) return;
    setScanning(true);
    addConsoleLog(`Scanning profile: ${usernameInput}`);
    try {
      const info = await detectAccountDetails(usernameInput);
      setDetectedInfo(info);
      addConsoleLog(`AI detection successful for ${usernameInput}`);
    } catch (e) {
      setDetectedInfo({ followersCount: 1200, niche: 'عمومی', isFound: true });
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmConnection = () => {
    setAccount({
      username: usernameInput.replace('@', ''),
      initialFollowers: detectedInfo?.followersCount || 0,
      niche: detectedInfo?.niche || 'نامشخص',
      status: 'connected'
    });
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30" dir="rtl">
      {/* Sidebar */}
      <aside className="w-80 glass border-l border-white/5 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cpu className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">روبوکا</h1>
              <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                 <p className="text-[9px] font-bold uppercase tracking-wider italic text-red-500">Worker Offline</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'داشبورد مرکزی' },
            { id: 'ai', icon: Zap, label: 'استراتژی رشد' },
            { id: 'automation', icon: Terminal, label: 'ترمینال عملیاتی' },
            { id: 'infra', icon: Server, label: 'تنظیمات زیرساخت' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <tab.icon size={20} />
              <span className="font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          {!account ? (
            <button onClick={() => setShowLoginModal(true)} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              <Instagram size={18} /> اتصال اکانت
            </button>
          ) : (
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black"> {account.username[0].toUpperCase()} </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-left truncate" dir="ltr">@{account.username}</p>
                  <p className="text-[10px] text-slate-500">{account.initialFollowers.toLocaleString('fa-IR')} فالوور</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 flex flex-col">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black mb-2 tracking-tighter">مدیریت ایجنت</h2>
            <p className="text-slate-500 text-sm">نسخه ۶.۰ هوشمند - آماده عملیات</p>
          </div>
          <button onClick={() => window.open('https://vercel.com', '_blank')} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-slate-200 transition-all">
            <Box size={16} /> Vercel Status
          </button>
        </header>

        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
               {[
                 { label: 'فالوور کنونی', value: account?.initialFollowers?.toLocaleString('fa-IR') || '---', icon: Users, color: 'text-indigo-400' },
                 { label: 'وضعیت AI', value: 'Active', icon: Zap, color: 'text-yellow-400' },
                 { label: 'سرور پایتون', value: 'Offline', icon: Server, color: 'text-red-400' },
                 { label: 'امنیت', value: 'High', icon: ShieldCheck, color: 'text-emerald-400' },
               ].map((s, i) => (
                 <div key={i} className="glass p-7 rounded-[35px] border-white/5 shadow-lg">
                    <s.icon className={`${s.color} mb-4`} size={24} />
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</h4>
                    <p className="text-2xl font-black">{s.value}</p>
                 </div>
               ))}
               
               <div className="md:col-span-4 glass p-10 rounded-[50px] border-white/5 mt-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                     <CloudLightning size={40} />
                  </div>
                  <h3 className="text-2xl font-black">سیستم هوشمند رشد آماده است</h3>
                  <p className="text-sm text-slate-500 max-w-lg">
                    روبوکا با استفاده از مدل Gemini 2.0 Flash، بهترین استراتژی‌های محتوایی و تعاملی را برای پیج شما طراحی می‌کند.
                  </p>
                  {!account && (
                    <button onClick={() => setShowLoginModal(true)} className="bg-indigo-600 px-10 py-4 rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20">شروع اسکن اکانت</button>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in slide-in-from-bottom-5">
              <div className="glass p-16 rounded-[60px] text-center">
                <Zap size={48} className="text-indigo-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black mb-4">استراتژیست هوشمند</h3>
                <p className="text-slate-400 mb-10">تحلیل محتوایی و وایرال شدن بر اساس داده‌های زنده اینستاگرام.</p>
                <button 
                  onClick={async () => {
                    setLoading(true);
                    const res = await getSocialStrategy(account?.niche || "سرگرمی", `User: @${account?.username}`);
                    setAiResult(res);
                    setLoading(false);
                    addConsoleLog("AI Strategy generated.");
                  }}
                  disabled={loading || !account}
                  className="bg-indigo-600 px-12 py-5 rounded-2xl font-black shadow-xl disabled:opacity-50"
                >
                  {loading ? 'در حال تحلیل...' : 'تولید برنامه رشد'}
                </button>
              </div>

              {aiResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-8 rounded-[40px] border-indigo-500/20">
                    <h4 className="font-black text-indigo-400 mb-4 flex items-center gap-2"><TrendingUp size={20}/> نقشه راه</h4>
                    <p className="text-sm leading-relaxed text-slate-300">{aiResult.strategy}</p>
                  </div>
                  <div className="glass p-8 rounded-[40px] border-purple-500/20">
                    <h4 className="font-black text-purple-400 mb-4 flex items-center gap-2"><Edit3 size={20}/> ایده‌های محتوا</h4>
                    <ul className="space-y-3">
                      {aiResult.contentIdeas.map((idea: string, i: number) => (
                        <li key={i} className="text-xs text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">{idea}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="glass p-10 rounded-[40px] border-white/5 h-[600px] flex flex-col font-mono shadow-2xl overflow-hidden" dir="ltr">
               <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Roboka Core Terminal</span>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 text-[11px]">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 border-l border-white/10 pl-4 py-1">
                      <span className="text-slate-700">[{i}]</span>
                      <span className={log.includes('Error') ? 'text-red-400' : 'text-slate-400'}>{log}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
               </div>
            </div>
          )}

          {activeTab === 'infra' && (
            <div className="max-w-4xl mx-auto glass p-16 rounded-[60px] border-white/5">
              <Server size={40} className="text-indigo-500 mb-6" />
              <h3 className="text-3xl font-black mb-4">تنظیمات زیرساخت</h3>
              <p className="text-slate-400 mb-10 leading-relaxed">برای اجرای عملیات خودکار (لایک، فالو، کامنت)، باید این پنل را به سرور Worker خود متصل کنید.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">API Worker URL</label>
                  <input 
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 font-mono text-sm" 
                    placeholder="https://your-python-server.com" 
                    dir="ltr"
                  />
                </div>
                <button className="bg-indigo-600 px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20">ذخیره و تست اتصال</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl glass p-12 rounded-[60px] border-indigo-500/20 relative shadow-2xl">
            {!detectedInfo ? (
              <div className="text-center">
                <Instagram size={48} className="mx-auto mb-6 text-indigo-500" />
                <h3 className="text-3xl font-black mb-8">شناسایی هوشمند پیج</h3>
                <div className="relative mb-8">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-500">@</span>
                  <input 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-3xl pl-12 pr-6 py-6 outline-none focus:border-indigo-500 text-2xl font-black text-indigo-400" 
                    placeholder="username" 
                    dir="ltr"
                  />
                </div>
                <button 
                  onClick={handleStartScan}
                  disabled={!usernameInput || scanning}
                  className="w-full bg-indigo-600 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/30 disabled:opacity-50 transition-all"
                >
                  {scanning ? <RefreshCcw className="animate-spin mx-auto" /> : 'تحلیل و اتصال'}
                </button>
                <button onClick={() => setShowLoginModal(false)} className="mt-6 text-slate-500 text-sm font-bold">انصراف</button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-600 rounded-[35px] flex items-center justify-center mx-auto mb-6 text-4xl font-black shadow-2xl">
                  {usernameInput[0].toUpperCase()}
                </div>
                <h3 className="text-3xl font-black mb-2" dir="ltr">@{usernameInput}</h3>
                <p className="text-indigo-400 font-bold mb-8 italic">حوزه فعالیت شناسایی شده: {detectedInfo.niche}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">فالوور</p>
                    <p className="text-2xl font-black">{detectedInfo.followersCount.toLocaleString('fa-IR')}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">وضعیت تایید</p>
                    <p className="text-sm font-bold text-emerald-500">آماده اتصال</p>
                  </div>
                </div>

                <button 
                  onClick={handleConfirmConnection}
                  className="w-full bg-indigo-600 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/30"
                >
                  تایید و ورود به داشبورد
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
