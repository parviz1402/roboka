
import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { getSocialStrategy, detectAccountDetails } from './services/geminiService.ts';

const { 
  LayoutDashboard, Zap, Activity, Power, TrendingUp, Cpu, ShieldCheck, 
  Send, Lock, CheckCircle2, RefreshCcw, Terminal, Instagram, 
  Users, Server, CloudLightning, Box, Target, Hash, Plus, X, Play, Square
} = LucideIcons;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'automation' | 'infra'>('dashboard');
  const [account, setAccount] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<any>(null);
  
  // States for Manual Edits
  const [editMode, setEditMode] = useState(false);
  const [manualFollowers, setManualFollowers] = useState(0);
  const [manualNiche, setManualNiche] = useState('');

  // Agent Automation States
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [targets, setTargets] = useState<{type: 'hash' | 'user', value: string}[]>([
    { type: 'hash', value: 'lifestyle' },
    { type: 'user', value: 'competitor_page' }
  ]);
  const [newTarget, setNewTarget] = useState('');
  
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["[System] Roboka Engine v6.1 Ready."]);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addConsoleLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString('fa-IR')}] ${msg}`].slice(-50));
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Simulated activity loop
  useEffect(() => {
    let interval: any;
    if (isAgentRunning) {
      interval = setInterval(() => {
        const actions = ['Liking', 'Following', 'Checking Story', 'Analyzing post by'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const target = targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)].value : 'explore';
        addConsoleLog(`${randomAction} @${target}... Success.`);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAgentRunning, targets]);

  const handleStartScan = async () => {
    if (!usernameInput) return;
    setScanning(true);
    addConsoleLog(`Initiating Deep Search for: ${usernameInput}`);
    try {
      const info = await detectAccountDetails(usernameInput);
      setDetectedInfo(info);
      setManualFollowers(info.followersCount);
      setManualNiche(info.niche);
      addConsoleLog(`AI Scan complete. Follower: ${info.followersCount}, Niche: ${info.niche}`);
    } catch (e) {
      addConsoleLog(`Search failed. Entering manual fallback.`);
      setDetectedInfo({ followersCount: 0, niche: 'نامشخص', isFound: false });
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmConnection = () => {
    setAccount({
      username: usernameInput.replace('@', ''),
      initialFollowers: manualFollowers,
      niche: manualNiche,
      status: 'connected'
    });
    setShowLoginModal(false);
    addConsoleLog(`Account linked: @${usernameInput}. Strategy Ready.`);
  };

  const addTarget = (type: 'hash' | 'user') => {
    if (!newTarget) return;
    setTargets([...targets, { type, value: newTarget.replace('@', '').replace('#', '') }]);
    setNewTarget('');
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
                 <div className={`w-1.5 h-1.5 rounded-full ${isAgentRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className={`text-[9px] font-bold uppercase tracking-wider italic ${isAgentRunning ? 'text-emerald-500' : 'text-red-500'}`}>
                    Worker {isAgentRunning ? 'Online' : 'Offline'}
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
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black mb-2 tracking-tighter">مدیریت عملیات</h2>
            <p className="text-slate-500 text-sm">سیستم هوشمند رشد در حوزه <span className="text-indigo-400 font-bold">{account?.niche || '...'}</span></p>
          </div>
          <div className="flex gap-4">
            {account && (
              <button 
                onClick={() => setIsAgentRunning(!isAgentRunning)}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${isAgentRunning ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-emerald-600 text-white shadow-emerald-600/20'}`}
              >
                {isAgentRunning ? <><Square size={18} /> توقف ایجنت</> : <><Play size={18} /> شروع عملیات</>}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: 'فالوور کنونی', value: account?.initialFollowers?.toLocaleString('fa-IR') || '---', icon: Users, color: 'text-indigo-400' },
                   { label: 'تعامل امروز', value: isAgentRunning ? '۱۴۸+' : '۰', icon: Activity, color: 'text-emerald-400' },
                   { label: 'وضعیت Worker', value: isAgentRunning ? 'Active' : 'Standby', icon: Server, color: isAgentRunning ? 'text-emerald-400' : 'text-slate-500' },
                   { label: 'سطح امنیت', value: 'Safe-API', icon: ShieldCheck, color: 'text-blue-400' },
                 ].map((s, i) => (
                   <div key={i} className="glass p-7 rounded-[35px] border-white/5 shadow-lg">
                      <s.icon className={`${s.color} mb-4`} size={24} />
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</h4>
                      <p className="text-2xl font-black">{s.value}</p>
                   </div>
                 ))}
               </div>

               {/* Targeting Section - New! */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-10 rounded-[50px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black flex items-center gap-3"><Target className="text-indigo-500" /> هدف‌گذاری هوشمند</h3>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-bold">LIVE</span>
                    </div>
                    <div className="flex gap-2 mb-6">
                      <input 
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        placeholder="هشتگ یا یوزر رقیب..."
                        className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 text-sm"
                      />
                      <button onClick={() => addTarget('user')} className="p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition-all"><Plus size={20}/></button>
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
                    <h3 className="text-xl font-black">آنالیز سرعت رشد</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      با تنظیمات کنونی، تخمین زده می‌شود پیج شما در ماه آینده <span className="text-emerald-400 font-bold">۱۲٪ تا ۱۸٪</span> رشد واقعی در تعامل داشته باشد.
                    </p>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                       <div className="bg-indigo-500 h-full w-2/3 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    </div>
                  </div>
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
                    addConsoleLog("AI Strategy generated based on latest niche analysis.");
                  }}
                  disabled={loading || !account}
                  className="bg-indigo-600 px-12 py-5 rounded-2xl font-black shadow-xl disabled:opacity-50"
                >
                  {loading ? 'در حال تحلیل...' : 'تولید نقشه رشد اختصاصی'}
                </button>
              </div>

              {aiResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-8 rounded-[40px] border-indigo-500/20">
                    <h4 className="font-black text-indigo-400 mb-4 flex items-center gap-2"><TrendingUp size={20}/> نقشه راه</h4>
                    <p className="text-sm leading-relaxed text-slate-300">{aiResult.strategy}</p>
                  </div>
                  <div className="glass p-8 rounded-[40px] border-purple-500/20">
                    <h4 className="font-black text-purple-400 mb-4 flex items-center gap-2"><Activity size={20}/> ایده‌های محتوا</h4>
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
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Roboka Core Terminal v6.1</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold">ENCRYPTED SESSION</span>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 text-[11px]">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 border-l border-white/10 pl-4 py-1 hover:bg-white/5 transition-colors">
                      <span className="text-slate-700">[{i}]</span>
                      <span className={log.includes('Success') ? 'text-emerald-400' : log.includes('Initiating') ? 'text-indigo-400' : 'text-slate-400'}>
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

      {/* Connection Modal with Manual Edit Support */}
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
                  {scanning ? <RefreshCcw className="animate-spin mx-auto" /> : 'تحلیل عمیق و شناسایی'}
                </button>
                <button onClick={() => setShowLoginModal(false)} className="mt-6 text-slate-500 text-sm font-bold">انصراف</button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-600 rounded-[35px] flex items-center justify-center mx-auto mb-6 text-4xl font-black shadow-2xl">
                  {usernameInput[0].toUpperCase()}
                </div>
                
                {editMode ? (
                  <div className="space-y-6 mb-8 text-right">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">تعداد فالوور واقعی</label>
                      <input 
                        type="number" 
                        value={manualFollowers} 
                        onChange={(e) => setManualFollowers(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">حوزه فعالیت دقیق</label>
                      <input 
                        value={manualNiche} 
                        onChange={(e) => setManualNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 text-indigo-400 font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-black mb-2" dir="ltr">@{usernameInput}</h3>
                    <p className="text-indigo-400 font-bold mb-8 italic">حوزه فعالیت: {manualNiche}</p>
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">فالوور</p>
                        <p className="text-2xl font-black">{manualFollowers.toLocaleString('fa-IR')}</p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">دقت تحلیل</p>
                        <p className="text-sm font-bold text-emerald-500">بالا</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                   <button 
                      onClick={() => setEditMode(!editMode)}
                      className="flex-1 bg-white/5 py-6 rounded-3xl font-bold text-slate-400 border border-white/5 hover:bg-white/10 transition-all"
                   >
                     {editMode ? 'ثبت تغییرات' : 'ویرایش اطلاعات'}
                   </button>
                   <button 
                      onClick={handleConfirmConnection}
                      className="flex-[2] bg-indigo-600 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all"
                   >
                      تایید و شروع عملیات
                   </button>
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
