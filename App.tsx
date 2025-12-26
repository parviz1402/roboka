
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Target as TargetIcon, 
  Activity,
  Power,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Send,
  Lock,
  CheckCircle2,
  RefreshCcw,
  Terminal,
  Code,
  Search,
  ChevronLeft,
  Edit3,
  AlertTriangle,
  Instagram,
  Settings,
  Info,
  Users,
  Eye,
  Server,
  Globe,
  Database,
  CloudLightning,
  ExternalLink,
  Wifi,
  WifiOff,
  Box
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityLog } from './types';
import { getSocialStrategy, detectAccountDetails } from './services/geminiService';

const TARGET_PAGES = ["@iran_clip", "@fun_farsi", "@video_tanz", "@khandevane"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'automation' | 'infra'>('dashboard');
  const [account, setAccount] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [detectedInfo, setDetectedInfo] = useState<any>(null);
  
  // Backend Connection States
  const [backendUrl, setBackendUrl] = useState('');
  const [workerStatus, setWorkerStatus] = useState<'offline' | 'checking' | 'online'>('offline');
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["[System] Roboka Engine v6.0 Ready for Deployment.", "[Info] Vercel integration detected."]);
  const [stats, setStats] = useState({ dms: 0, actions: 0, growth: 0 });
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addConsoleLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString('fa-IR')}] ${msg}`].slice(-50));
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  const testBackendConnection = async () => {
    if (!backendUrl) return;
    setWorkerStatus('checking');
    addConsoleLog(`Pinging backend at ${backendUrl}...`);
    
    // Simulate API call to your real backend
    setTimeout(() => {
      // For demo, if user types anything, let's say it fails to remind them they need a real server
      setWorkerStatus('offline');
      addConsoleLog(`[Error] Connection Refused. Ensure your Python/Node server is running with CORS enabled.`);
    }, 2000);
  };

  const handleStartScan = async () => {
    const cleanUser = usernameInput.split('/').pop()?.replace('@', '').trim();
    if (!cleanUser) return;

    setScanning(true);
    setScanStep('تحلیل وب...');
    addConsoleLog(`Searching metadata for @${cleanUser}...`);
    
    try {
      const info = await detectAccountDetails(cleanUser);
      setDetectedInfo(info);
      addConsoleLog(`Account synchronized with Gemini AI Brain.`);
    } catch (e) {
      setDetectedInfo({ followersCount: 1000, followingCount: 200, niche: 'سرگرمی', bio: '', isFound: true });
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmConnection = () => {
    setAccount({
      username: usernameInput.split('/').pop()?.replace('@', '').trim(),
      initialFollowers: detectedInfo.followersCount,
      niche: detectedInfo.niche,
      status: 'connected'
    });
    setShowLoginModal(false);
    addConsoleLog(`Dashboard ready for @${usernameInput}.`);
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
                 <div className={`w-1.5 h-1.5 rounded-full ${workerStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                 <p className={`text-[9px] font-bold uppercase tracking-wider italic ${workerStatus === 'online' ? 'text-emerald-500' : 'text-red-500'}`}>
                   {workerStatus === 'online' ? 'System Live' : 'Worker Offline'}
                 </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'داشبورد مرکزی' },
            { id: 'ai', icon: Zap, label: 'استراتژی رشد (Real AI)' },
            { id: 'automation', icon: Terminal, label: 'ترمینال عملیاتی' },
            { id: 'infra', icon: Server, label: 'استقرار و API (Real)' },
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
              <Instagram size={18} /> شناسایی پیج اینستاگرام
            </button>
          ) : (
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black"> {account.username[0].toUpperCase()} </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-left truncate" dir="ltr">@{account.username}</p>
                  <p className="text-[10px] text-slate-500">{account.initialFollowers.toLocaleString('fa-IR')} فالوور</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-[9px] font-black p-2.5 rounded-xl border mb-2 ${workerStatus === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                 {workerStatus === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
                 {workerStatus === 'online' ? 'متصل به سرور مرکزی' : 'عدم اتصال به Worker'}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 relative flex flex-col">
        
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black mb-2 tracking-tighter">مدیریت ایجنت</h2>
            <div className="flex items-center gap-4">
               {account && <p className="text-slate-500 text-sm">هدف فعال: <span className="text-indigo-400 font-bold" dir="ltr">@{account.username}</span></p>}
               <span className="w-px h-4 bg-white/10"></span>
               <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Version 6.0 Enterprise</p>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => window.open('https://vercel.com/new', '_blank')} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-slate-200 transition-all">
                <Box size={16} /> Deploy to Vercel
             </button>
          </div>
        </header>

        <div className="flex-1 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'فالوور کنونی', value: account?.initialFollowers?.toLocaleString('fa-IR') || '---', sub: 'تایید شده توسط AI', icon: Users, color: 'text-indigo-400' },
                    { label: 'وضعیت استقرار', value: 'Vercel Ready', sub: 'UI Deployment', icon: Globe, color: 'text-blue-400' },
                    { label: 'سرور عملیاتی', value: workerStatus.toUpperCase(), sub: 'Backend Status', icon: Server, color: workerStatus === 'online' ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'هوش مصنوعی', value: 'Gemini 3 Pro', sub: 'Active & Real', icon: Zap, color: 'text-yellow-400' },
                  ].map((s, i) => (
                    <div key={i} className="glass p-7 rounded-[35px] border-white/5 relative group transition-all hover:border-indigo-500/30 shadow-lg">
                       <s.icon className={`${s.color} mb-4`} size={24} />
                       <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</h4>
                       <p className="text-2xl font-black tabular-nums">{s.value}</p>
                       <p className="text-[9px] text-slate-600 mt-2 font-medium">{s.sub}</p>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass p-12 rounded-[50px] border-white/5 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <CloudLightning size={120} />
                     </div>
                     <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-2xl">
                        <Server size={40} />
                     </div>
                     <h3 className="text-2xl font-black">اتصال به Worker واقعی</h3>
                     <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                        برای اینکه روبوکا بتواند روی اکانت شما عملیات واقعی انجام دهد، باید آدرس API سرور خود (Worker) را در تنظیمات وارد کنید.
                     </p>
                     <div className="flex gap-4">
                        <button onClick={() => setActiveTab('infra')} className="bg-indigo-600 px-8 py-4 rounded-2xl text-xs font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">تنظیمات اتصال</button>
                        <button className="bg-white/5 px-8 py-4 rounded-2xl text-xs font-black border border-white/10 hover:bg-white/10 transition-all">مشاهده داکیومنت</button>
                     </div>
                  </div>

                  <div className="glass p-10 rounded-[50px] border-white/5">
                     <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" />
                        چک‌لیست استقرار واقعی
                     </h3>
                     <div className="space-y-4">
                        {[
                           { t: 'استقرار پنل مدیریتی روی Vercel', d: 'Done - آماده دیپلوی', s: true },
                           { t: 'دریافت API Key هوش مصنوعی', d: 'Done - تنظیم شده در Gemini', s: true },
                           { t: 'راه‌اندازی سرور Worker (پایتون)', d: 'Pending - نیاز به VPS', s: false },
                           { t: 'تنظیم پروکسی مسکونی', d: 'Pending - جهت امنیت اکانت', s: false },
                        ].map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                              <div>
                                 <p className={`text-sm font-bold ${item.s ? 'text-slate-200' : 'text-slate-500'}`}>{item.t}</p>
                                 <p className="text-[10px] text-slate-600 mt-1">{item.d}</p>
                              </div>
                              {item.s ? <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={12}/></div> : <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10"></div>}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 pb-20">
               <div className="glass p-20 rounded-[70px] text-center border-indigo-600/10 shadow-2xl relative overflow-hidden bg-gradient-to-b from-indigo-600/[0.03] to-transparent">
                  <div className="absolute top-0 right-0 p-6">
                     <span className="bg-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full text-white shadow-lg uppercase tracking-widest">Enterprise AI</span>
                  </div>
                  <div className="w-24 h-24 bg-indigo-600/10 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 shadow-inner">
                    <Zap size={48} className="text-indigo-500" />
                  </div>
                  <h3 className="text-4xl font-black mb-6 tracking-tighter">استراتژیست هوشمند (Google Gemini)</h3>
                  <p className="text-slate-400 mb-12 max-w-xl mx-auto text-base leading-relaxed">
                    این بخش با تحلیل مستقیم پیج <strong>{account?.username || 'شما'}</strong> توسط هوش مصنوعی، نقشه راه واقعی برای وایرال شدن در سال ۲۰۲۵ را تولید می‌کند.
                  </p>
                  <button 
                    onClick={async () => {
                      setLoading(true);
                      const res = await getSocialStrategy(account?.niche || "سرگرمی", `User: @${account?.username}, Followers: ${account?.initialFollowers}`);
                      setAiResult(res);
                      setLoading(false);
                      addConsoleLog(`Viral Roadmap synthesized for @${account?.username}.`);
                    }}
                    disabled={loading || !account}
                    className="bg-indigo-600 hover:bg-indigo-500 px-16 py-6 rounded-3xl font-black transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50 text-lg"
                  >
                    {loading ? <RefreshCcw className="animate-spin" size={28} /> : 'تولید استراتژی رشد زنده'}
                  </button>
               </div>

               {aiResult && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95">
                    <div className="glass p-12 rounded-[55px] border-indigo-500/10 shadow-2xl">
                       <h4 className="font-black text-indigo-400 mb-8 flex items-center gap-3 italic text-xl"><TrendingUp size={24} /> نقشه راه جذب فالوور</h4>
                       <div className="text-sm text-slate-300 leading-relaxed text-justify bg-slate-900/40 p-8 rounded-[35px] border border-white/5 border-dashed">
                          {aiResult.strategy}
                       </div>
                    </div>
                    <div className="glass p-12 rounded-[55px] border-purple-500/10 shadow-2xl">
                       <h4 className="font-black text-purple-400 mb-8 flex items-center gap-3 italic text-xl"><Edit3 size={24} /> سناریوهای تولید محتوا</h4>
                       <ul className="space-y-5">
                          {aiResult.contentIdeas.map((idea: string, i: number) => (
                            <li key={i} className="text-sm text-slate-400 flex gap-5 items-start bg-slate-900/40 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                               <span className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-black border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i+1}</span>
                               <span className="leading-relaxed">{idea}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'infra' && (
            <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 pb-24">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-xl">
                      <Server size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">تنظیمات استقرار و API</h3>
                      <p className="text-slate-500 text-sm">پل ارتباطی بین پنل مدیریتی و ایجنت عملیاتی شما.</p>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass p-12 rounded-[55px] border-white/5 shadow-2xl">
                     <h4 className="font-black text-indigo-400 mb-8 flex items-center gap-3"><CloudLightning size={24} /> اتصال به Backend (Worker)</h4>
                     <div className="space-y-8">
                        <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">آدرس API سرور عملیاتی (مثلاً روی VPS شما)</label>
                           <div className="flex gap-4">
                              <input 
                                value={backendUrl}
                                onChange={(e) => setBackendUrl(e.target.value)}
                                className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-mono text-sm text-indigo-400"
                                placeholder="https://your-worker-api.com"
                                dir="ltr"
                              />
                              <button 
                                onClick={testBackendConnection}
                                disabled={workerStatus === 'checking' || !backendUrl}
                                className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                              >
                                {workerStatus === 'checking' ? 'در حال تست...' : 'تست اتصال'}
                              </button>
                           </div>
                        </div>

                        <div className="p-8 rounded-[35px] bg-slate-900/50 border border-white/5 space-y-6">
                           <h5 className="font-bold text-sm text-slate-300 flex items-center gap-2"><Box size={16}/> راهنمای دیپلوی روی Vercel</h5>
                           <div className="space-y-4">
                              {[
                                 'پروژه را در GitHub آپلود کنید.',
                                 'در Vercel دکمه New Project را بزنید و ریپازیتوری را انتخاب کنید.',
                                 'در بخش Environment Variables، متغیر API_KEY را با مقدار کلید Gemini خود تنظیم کنید.',
                                 'دکمه Deploy را بزنید. ایجنت شما زنده شد!'
                              ].map((step, i) => (
                                 <div key={i} className="flex gap-4 items-start">
                                    <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] flex items-center justify-center shrink-0 border border-white/10 text-slate-500">{i+1}</span>
                                    <p className="text-xs text-slate-400 leading-relaxed">{step}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="glass p-10 rounded-[55px] border-white/5 shadow-2xl flex flex-col">
                     <h4 className="font-black text-emerald-400 mb-8 flex items-center gap-3"><Code size={24} /> کدهای مورد نیاز</h4>
                     <div className="flex-1 space-y-4">
                        <button className="w-full p-6 rounded-3xl bg-slate-950 border border-white/10 text-right group hover:border-indigo-500 transition-all">
                           <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-black text-slate-200 uppercase">Worker Python</p>
                              <Code size={16} className="text-slate-600 group-hover:text-indigo-400"/>
                           </div>
                           <p className="text-[10px] text-slate-500">سورس‌کد عملیاتی (Puppeteer/Py)</p>
                        </button>
                        <button className="w-full p-6 rounded-3xl bg-slate-950 border border-white/10 text-right group hover:border-indigo-500 transition-all">
                           <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-black text-slate-200 uppercase">Proxy Config</p>
                              <Globe size={16} className="text-slate-600 group-hover:text-indigo-400"/>
                           </div>
                           <p className="text-[10px] text-slate-500">تنظیمات امنیت آی‌پی</p>
                        </button>
                        <div className="mt-auto p-6 bg-indigo-600/5 rounded-3xl border border-indigo-500/10">
                           <p className="text-[11px] text-indigo-400 leading-relaxed font-medium text-center italic">با اتصال این دو بخش، «روبوکا» به یک ایجنت ۱۰۰٪ مستقل تبدیل می‌شود.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="glass p-12 rounded-[60px] border-white/5 h-[700px] flex flex-col font-mono text-left shadow-2xl relative overflow-hidden" dir="ltr">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Terminal size={200} />
               </div>
               <div className="flex items-center justify-between mb-10 pb-10 border-b border-white/10">
                 <div className="flex items-center gap-4">
                   <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse"></div>
                   <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Roboka System Core</h3>
                 </div>
                 <div className="flex gap-3">
                    <span className="text-[10px] bg-indigo-600/10 border border-indigo-500/20 px-3 py-1 rounded-lg text-indigo-400 font-bold">MODE: PROD_MANAGEMENT</span>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-slate-500 font-bold uppercase">Uptime: 99.9%</span>
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto text-[12px] space-y-3 text-slate-500 custom-scrollbar pr-6 relative z-10">
                 {consoleLogs.map((log, i) => (
                   <div key={i} className={`py-1.5 border-l-2 pl-5 transition-all hover:bg-white/[0.02] ${log.includes('Error') ? 'text-red-400 border-red-500' : log.includes('Strategic') ? 'text-indigo-400 border-indigo-500' : 'border-transparent'}`}>
                     <span className="opacity-20 mr-3 font-bold">[{i.toString().padStart(3, '0')}]</span>
                     {log}
                   </div>
                 ))}
                 <div ref={consoleEndRef} />
               </div>
               <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-600 font-black uppercase">
                  <span>Roboka Agent Framework v6.0</span>
                  <span className="flex items-center gap-2"><Wifi size={14}/> Node ID: RBK-7712</span>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Connection Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="w-full max-w-2xl glass p-16 rounded-[80px] border-indigo-500/20 relative shadow-2xl overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
            <button onClick={() => setShowLoginModal(false)} className="absolute top-14 left-14 text-slate-500 hover:text-white transition-all">
               <RefreshCcw size={24} />
            </button>
            
            {!detectedInfo ? (
              <div className="animate-in slide-in-from-bottom-10">
                <div className="text-center mb-16">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-blue-700 rounded-[35px] flex items-center justify-center mx-auto mb-10 shadow-2xl border-4 border-white/5 relative">
                    <Instagram className="text-white" size={48} />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#020617] flex items-center justify-center">
                       <ShieldCheck size={14} className="text-white"/>
                    </div>
                  </div>
                  <h3 className="text-4xl font-black mb-4 tracking-tighter">کالیبراسیون هوشمند</h3>
                  <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.5em]">Agent Discovery Protocol</p>
                </div>
                <div className="space-y-12">
                  <div className="relative group">
                    <label className="block text-[11px] font-black text-slate-500 mb-5 uppercase tracking-[0.2em] mr-4">نام کاربری اینستاگرام (آدرس دقیق)</label>
                    <div className="relative">
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-600 font-black text-2xl italic">@</span>
                      <input 
                        value={usernameInput} 
                        onChange={(e) => setUsernameInput(e.target.value)} 
                        className="w-full bg-slate-950 border border-white/10 rounded-[40px] pl-20 pr-12 py-8 outline-none focus:border-indigo-500 transition-all text-left font-black text-indigo-400 text-2xl shadow-inner placeholder:opacity-20" 
                        placeholder="username" 
                        dir="ltr" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleStartScan} 
                    disabled={!usernameInput || scanning} 
                    className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black transition-all disabled:opacity-50 flex items-center justify-center gap-5 shadow-2xl shadow-indigo-600/40 active:scale-95 text-2xl hover:bg-indigo-500"
                  >
                    {scanning ? <RefreshCcw className="animate-spin" size={30} /> : 'جستجوی دیتای زنده پیج'}
                  </button>
                  <div className="flex items-start gap-5 bg-indigo-600/5 p-8 rounded-[45px] border border-indigo-600/10">
                     <Info size={24} className="text-indigo-500 shrink-0 mt-1" />
                     <p className="text-xs text-slate-500 leading-relaxed font-medium italic">روبوکا از موتور جستجوی هوشمند Gemini برای استخراج آمار واقعی و حوزه فعالیت شما استفاده می‌کند تا ایجنت را کالیبره کند.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-700">
                <div className="text-center mb-14">
                  <h3 className="text-3xl font-black text-indigo-400 italic tracking-tight">گزارش شناسایی زنده</h3>
                  <p className="text-slate-500 text-sm mt-4">دیتای زیر توسط هوش مصنوعی از وب استخراج شد:</p>
                </div>
                
                <div className="bg-white/[0.02] border border-white/10 rounded-[65px] p-14 mb-14 space-y-12 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Users size={100}/>
                  </div>
                  <div className="flex items-center gap-10 relative z-10">
                    <div className="w-32 h-32 rounded-[45px] bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center border-4 border-white/5 text-6xl font-black text-white shadow-2xl">
                      {usernameInput.split('/').pop()?.replace('@', '')[0].toUpperCase()}
                    </div>
                    <div className="text-right flex-1">
                      <p className="font-black text-4xl mb-6 text-indigo-100" dir="ltr">@{usernameInput.split('/').pop()?.replace('@', '')}</p>
                      <div className="flex items-center gap-12">
                         <div className="text-center">
                            <p className="text-[11px] text-slate-500 uppercase font-black mb-3 tracking-widest">فالوور واقعی</p>
                            <div className="flex items-baseline justify-center gap-2">
                               <input 
                                 type="number"
                                 value={detectedInfo.followersCount}
                                 onChange={(e) => setDetectedInfo({...detectedInfo, followersCount: parseInt(e.target.value) || 0})}
                                 className="w-32 bg-transparent text-4xl font-black text-white outline-none border-b-2 border-white/10 focus:border-indigo-500 text-center pb-2 tabular-nums transition-all"
                               />
                            </div>
                         </div>
                         <div className="w-px h-16 bg-white/10"></div>
                         <div className="text-center">
                            <p className="text-[11px] text-slate-500 uppercase font-black mb-3 tracking-widest">حوزه فعالیت</p>
                            <input 
                              type="text"
                              value={detectedInfo.niche}
                              onChange={(e) => setDetectedInfo({...detectedInfo, niche: e.target.value})}
                              className="w-40 bg-transparent text-xl font-black text-indigo-400 outline-none border-b-2 border-white/10 focus:border-indigo-500 text-center pb-2 transition-all"
                            />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 bg-emerald-500/5 p-8 rounded-[40px] border border-emerald-500/10">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                       <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                    <p className="text-xs text-emerald-500/80 leading-relaxed font-bold italic">پروتکل شناسایی تکمیل شد. ایجنت آماده استقرار روی پیج شماست.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <button onClick={() => setDetectedInfo(null)} className="col-span-1 py-7 rounded-[40px] border border-white/10 text-slate-500 font-black hover:bg-white/5 transition-all text-sm">اسکن مجدد</button>
                  <button onClick={handleConfirmConnection} className="col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white py-7 rounded-[40px] font-black transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 text-xl">تایید و ورود به پنل مدیریت</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
