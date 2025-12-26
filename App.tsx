
import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { getSocialStrategy, detectAccountDetails } from './services/geminiService.ts';

const { 
  LayoutDashboard, Zap, Activity, Power, TrendingUp, Cpu, ShieldCheck, 
  Send, Lock, CheckCircle2, RefreshCcw, Terminal, Instagram, Info,
  Users, Server, CloudLightning, Box, Target, Hash, Plus, X, Play, Square, Edit3
} = LucideIcons;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'automation' | 'infra'>('dashboard');
  const [account, setAccount] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [scanning, setScanning] = useState(false);
  
  // Manual Edit States
  const [editMode, setEditMode] = useState(false);
  const [manualFollowers, setManualFollowers] = useState<number>(0);
  const [manualNiche, setManualNiche] = useState<string>('');
  const [hasScanned, setHasScanned] = useState(false);

  // Agent Automation States
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [targets, setTargets] = useState<{type: 'hash' | 'user', value: string}[]>([
    { type: 'hash', value: 'lifestyle' },
    { type: 'user', value: 'competitor_page' }
  ]);
  const [newTarget, setNewTarget] = useState('');
  
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["[سیستم] موتور روبوکا آماده فعالیت است."]);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addConsoleLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString('fa-IR')}] ${msg}`].slice(-50));
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Simulation of Worker activity
  useEffect(() => {
    let interval: any;
    if (isAgentRunning) {
      interval = setInterval(() => {
        const actions = ['در حال لایک کردن', 'بررسی استوری', 'آنالیز پست‌های جدید', 'تعامل با فالوورهای'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const target = targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)].value : 'اکسپلوور';
        addConsoleLog(`${randomAction} @${target}... موفقیت‌آمیز.`);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAgentRunning, targets]);

  const handleStartScan = async () => {
    if (!usernameInput) return;
    setScanning(true);
    addConsoleLog(`شروع جستجوی هوشمند برای اکانت: ${usernameInput}`);
    try {
      const info = await detectAccountDetails(usernameInput);
      setManualFollowers(info.followersCount || 0);
      setManualNiche(info.niche || '');
      setHasScanned(true);
      
      // If AI failed to find info, jump to edit mode automatically
      if (!info.followersCount || info.followersCount === 0 || info.niche === 'نامشخص') {
        setEditMode(true);
        addConsoleLog(`اطلاعات دقیق یافت نشد. لطفا مقادیر را دستی وارد کنید.`);
      } else {
        addConsoleLog(`اطلاعات شناسایی شد: ${info.followersCount} فالوور در حوزه ${info.niche}`);
      }
    } catch (e) {
      setHasScanned(true);
      setEditMode(true);
      addConsoleLog(`خطا در جستجو. وارد کردن اطلاعات به صورت دستی.`);
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmConnection = () => {
    if (manualFollowers <= 0 || !manualNiche) {
      alert("لطفا تعداد فالوور و حوزه فعالیت را وارد کنید.");
      return;
    }
    setAccount({
      username: usernameInput.replace('@', ''),
      initialFollowers: manualFollowers,
      niche: manualNiche,
      status: 'connected'
    });
    setShowLoginModal(false);
    addConsoleLog(`اکانت @${usernameInput} متصل شد. ورکر آماده شروع است.`);
  };

  const addTarget = (type: 'hash' | 'user') => {
    if (!newTarget) return;
    setTargets([...targets, { type, value: newTarget.replace('@', '').replace('#', '') }]);
    setNewTarget('');
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden" dir="rtl">
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
                 <div className={`w-1.5 h-1.5 rounded-full ${isAgentRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className={`text-[9px] font-bold uppercase tracking-wider italic ${isAgentRunning ? 'text-emerald-500' : 'text-red-500'}`}>
                    موتور (Worker) {isAgentRunning ? 'روشن' : 'خاموش'}
                 </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'داشبورد مرکزی' },
            { id: 'ai', icon: Zap, label: 'استراتژی هوشمند' },
            { id: 'automation', icon: Terminal, label: 'ترمینال عملیاتی' },
            { id: 'infra', icon: Server, label: 'زیرساخت سرور' },
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
            <button onClick={() => { setUsernameInput(''); setHasScanned(false); setEditMode(false); setShowLoginModal(true); }} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              <Instagram size={18} /> اتصال اکانت اینستاگرام
            </button>
          ) : (
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black"> {account.username[0].toUpperCase()} </div>
                <div className="flex-1 overflow-hidden text-right">
                  <p className="font-bold text-sm truncate" dir="ltr">@{account.username}</p>
                  <p className="text-[10px] text-slate-500">{account.initialFollowers.toLocaleString('fa-IR')} فالوور</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 flex flex-col">
        <header className="mb-10 flex justify-between items-center">
          <div className="text-right">
            <h2 className="text-4xl font-black mb-2 tracking-tighter">پنل مدیریت روبوکا</h2>
            <div className="flex items-center gap-2">
               <p className="text-slate-500 text-sm">ایجنت هوشمند رشد در حوزه <span className="text-indigo-400 font-bold">{account?.niche || 'نامشخص'}</span></p>
               <div className="group relative">
                  <Info size={14} className="text-slate-600 cursor-help" />
                  <div className="absolute top-full right-0 w-64 p-4 bg-slate-900 border border-white/10 rounded-2xl text-[10px] hidden group-hover:block z-50 shadow-2xl leading-relaxed">
                    <b>ورکر (Worker) چیست؟</b><br/>
                    ورکر ایجنت هوش مصنوعی شماست که روی سرورهای ما فعال می‌شود. این موتور با استفاده از هشتگ‌ها و رقبایی که تعیین می‌کنید، شروع به تعامل هدفمند می‌کند تا پیج شما را به مخاطبان واقعی معرفی کند.
                  </div>
               </div>
            </div>
          </div>
          <div className="flex gap-4">
            {account && (
              <button 
                onClick={() => setIsAgentRunning(!isAgentRunning)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${isAgentRunning ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-emerald-600 text-white shadow-emerald-600/20'}`}
              >
                {isAgentRunning ? <><Square size={18} /> توقف عملیات ورکر</> : <><Play size={18} /> فعال‌سازی ورکر</>}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right">
                 {[
                   { label: 'فالوور زمان اتصال', value: account?.initialFollowers?.toLocaleString('fa-IR') || '۰', icon: Users, color: 'text-indigo-400' },
                   { label: 'تعامل‌های امروز', value: isAgentRunning ? '۱۸۴+' : '۰', icon: Activity, color: 'text-emerald-400' },
                   { label: 'وضعیت موتور ایجنت', value: isAgentRunning ? 'در حال اجرا' : 'آماده به کار', icon: Server, color: isAgentRunning ? 'text-emerald-400' : 'text-slate-500' },
                   { label: 'امنیت اتصال', value: 'SSL-Safe', icon: ShieldCheck, color: 'text-blue-400' },
                 ].map((s, i) => (
                   <div key={i} className="glass p-7 rounded-[35px] border-white/5 shadow-lg">
                      <s.icon className={`${s.color} mb-4`} size={24} />
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</h4>
                      <p className="text-2xl font-black">{s.value}</p>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                  <div className="glass p-10 rounded-[50px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black flex items-center gap-3"><Target className="text-indigo-500" /> اهداف فعالیت (Targeting)</h3>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Live Setup</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">هشتگ‌ها یا پیج‌های رقیب را وارد کنید تا ایجنت بداند کجا باید تعامل کند.</p>
                    <div className="flex gap-2 mb-6">
                      <input 
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        placeholder="مثال: #آموزش یا @competitor"
                        className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 text-sm"
                      />
                      <button onClick={() => addTarget('user')} className="p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg"><Plus size={20}/></button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {targets.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-bold group">
                          {t.type === 'hash' ? <Hash size={14} className="text-slate-500" /> : <Instagram size={14} className="text-slate-500" />}
                          {t.value}
                          <button onClick={() => setTargets(targets.filter((_, idx) => idx !== i))} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-10 rounded-[50px] flex flex-col items-center justify-center text-center space-y-6">
                    <CloudLightning size={40} className="text-yellow-500 animate-pulse" />
                    <h3 className="text-xl font-black">گزارش لحظه‌ای رشد</h3>
                    <p className="text-xs text-slate-500 leading-relaxed px-10">
                      بر اساس تنظیمات هدف‌گذاری شما، ایجنت در حال جذب مخاطبان مشابه حوزه <span className="text-indigo-400 font-bold">{account?.niche || 'شما'}</span> است.
                    </p>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                       <div className="bg-indigo-500 h-full w-2/3 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"></div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in slide-in-from-bottom-5 text-center">
              <div className="glass p-16 rounded-[60px]">
                <Zap size={48} className="text-indigo-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">نقشه راه اختصاصی</h3>
                <p className="text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed text-sm">هوش مصنوعی با تحلیل رقبای شما، بهترین زمان انتشار پست و سبک محتوا را برای پیج @{account?.username || '...'} طراحی می‌کند.</p>
                <button 
                  onClick={async () => {
                    setLoading(true);
                    const res = await getSocialStrategy(account?.niche || "سرگرمی", `@${account?.username}`);
                    setAiResult(res);
                    setLoading(false);
                    addConsoleLog("استراتژی جدید بر اساس حوزه فعالیت شما ساخته شد.");
                  }}
                  disabled={loading || !account}
                  className="bg-indigo-600 px-12 py-5 rounded-3xl font-black shadow-2xl shadow-indigo-600/30 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {loading ? <RefreshCcw className="animate-spin mx-auto" /> : 'دریافت استراتژی رشد ایجنت'}
                </button>
              </div>

              {aiResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                  <div className="glass p-8 rounded-[40px] border-indigo-500/20">
                    <h4 className="font-black text-indigo-400 mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><TrendingUp size={20}/> خلاصه برنامه اجرایی</h4>
                    <p className="text-sm leading-relaxed text-slate-300">{aiResult.strategy}</p>
                  </div>
                  <div className="glass p-8 rounded-[40px] border-purple-500/20">
                    <h4 className="font-black text-purple-400 mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Activity size={20}/> ۳ ایده برای ریلز وایرال</h4>
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
               <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isAgentRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Roboka Core Engine v6.2</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold">LIVE ACTIVITY FEED</span>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 text-[11px]">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 border-l border-white/10 pl-4 py-1 hover:bg-white/5 transition-colors">
                      <span className="text-slate-700">[{i}]</span>
                      <span className={log.includes('موفقیت') ? 'text-emerald-400' : log.includes('شروع') ? 'text-indigo-400' : 'text-slate-400'}>
                        {log}
                      </span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Connection Modal - REWRITTEN FOR BETTER MANUAL CONTROL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl glass p-10 md:p-14 rounded-[60px] border-indigo-500/20 relative shadow-2xl">
            
            {!hasScanned ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Instagram size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">اتصال به روبوکا</h3>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed">یوزرنیم اینستاگرام خود را بدون @ وارد کنید تا هوش مصنوعی پیج شما را تحلیل کند.</p>
                <div className="relative mb-8 group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-600 text-xl">@</span>
                  <input 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-white/5 rounded-3xl pl-12 pr-6 py-6 outline-none focus:border-indigo-600 text-2xl font-black text-indigo-400 transition-all text-center" 
                    placeholder="username" 
                    dir="ltr"
                  />
                </div>
                <button 
                  onClick={handleStartScan}
                  disabled={!usernameInput || scanning}
                  className="w-full bg-indigo-600 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/40 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  {scanning ? <RefreshCcw className="animate-spin" /> : 'شروع آنالیز و اتصال'}
                </button>
                <button onClick={() => setShowLoginModal(false)} className="mt-8 text-slate-500 text-sm font-bold hover:text-white transition-colors">انصراف</button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-4xl font-black shadow-2xl rotate-3">
                  {usernameInput[0].toUpperCase()}
                </div>

                <div className="mb-10 text-right">
                   <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                      <h4 className="text-xl font-black">@ {usernameInput}</h4>
                      <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-2 text-indigo-400 text-xs font-black bg-indigo-500/10 px-4 py-2 rounded-full hover:bg-indigo-500/20 transition-all">
                        {editMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                        {editMode ? 'ثبت نهایی' : 'ویرایش دستی'}
                      </button>
                   </div>

                   {editMode ? (
                     <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">تعداد دقیق فالوور</label>
                           <input 
                             type="number"
                             value={manualFollowers}
                             onChange={(e) => setManualFollowers(Number(e.target.value))}
                             className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 font-bold"
                             placeholder="مثال: 1200"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">موضوع فعالیت پیج</label>
                           <input 
                             value={manualNiche}
                             onChange={(e) => setManualNiche(e.target.value)}
                             className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 font-bold text-right"
                             placeholder="مثال: آشپزی، تکنولوژی، فروشگاه"
                           />
                        </div>
                        <p className="text-[10px] text-indigo-500 italic bg-indigo-500/5 p-3 rounded-xl">نکته: وارد کردن دقیق این مقادیر به هوش مصنوعی کمک می‌کند استراتژی بهتری بسازد.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                           <p className="text-[10px] text-slate-500 uppercase mb-1">فالوور شناسایی شده</p>
                           <p className="text-2xl font-black">{manualFollowers.toLocaleString('fa-IR')}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                           <p className="text-[10px] text-slate-500 uppercase mb-1">موضوع شناسایی شده</p>
                           <p className="text-sm font-bold text-indigo-400">{manualNiche || 'نامشخص'}</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="flex gap-4">
                   {editMode ? (
                     <button 
                       onClick={() => setEditMode(false)}
                       className="flex-1 bg-indigo-600 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all"
                     >
                        تایید اطلاعات
                     </button>
                   ) : (
                     <>
                        <button 
                          onClick={() => setHasScanned(false)}
                          className="flex-1 bg-white/5 py-6 rounded-3xl font-bold text-slate-500 border border-white/5 hover:text-white transition-all"
                        >
                           تغییر یوزرنیم
                        </button>
                        <button 
                          onClick={handleConfirmConnection}
                          className="flex-[2] bg-indigo-600 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all"
                        >
                           ورود به داشبورد
                        </button>
                     </>
                   )}
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
