
import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { generateSmartReply } from './services/geminiService.ts';

// Extracting required icons from LucideIcons library
const { 
  MessageSquare, Send, Zap, Settings, Plus, X, Trash2, Edit3, 
  CheckCircle2, Instagram, Smartphone, Cpu, ArrowLeftRight, Bell, Info,
  RefreshCcw
} = LucideIcons;

interface AutomationRule {
  id: string;
  keyword: string;
  actionType: 'reply_and_dm' | 'dm_only';
  customLink?: string;
  isActive: boolean;
}

const App: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newLink, setNewLink] = useState('');
  const [activeTab, setActiveTab] = useState<'rules' | 'logs' | 'preview'>('rules');
  const [simulatedLogs, setSimulatedLogs] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Rules from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('roboka_automation_rules');
    if (saved) setRules(JSON.parse(saved));
    
    const savedLogs = localStorage.getItem('roboka_automation_logs');
    if (savedLogs) setSimulatedLogs(JSON.parse(savedLogs));
  }, []);

  // Sync Rules with localStorage
  useEffect(() => {
    localStorage.setItem('roboka_automation_rules', JSON.stringify(rules));
  }, [rules]);

  // Sync Logs with localStorage
  useEffect(() => {
    localStorage.setItem('roboka_automation_logs', JSON.stringify(simulatedLogs));
  }, [simulatedLogs]);

  const addRule = () => {
    if (!newKeyword) return;
    const rule: AutomationRule = {
      id: Math.random().toString(36).substr(2, 9),
      keyword: newKeyword,
      actionType: 'reply_and_dm',
      customLink: newLink,
      isActive: true
    };
    setRules([...rules, rule]);
    setNewKeyword('');
    setNewLink('');
    setShowAddRule(false);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const simulateTrigger = async (rule: AutomationRule) => {
    setIsProcessing(true);
    try {
      const result = await generateSmartReply("سلام، من عدد " + rule.keyword + " رو فرستادم.", rule.keyword, "فروشگاهی/آموزشی");
      
      const newLog = {
        id: Date.now(),
        user: 'user_' + Math.floor(Math.random() * 1000),
        comment: `ارسال کلمه کلیدی: ${rule.keyword}`,
        reply: result.publicReply,
        dm: result.directMessage,
        time: new Date().toLocaleTimeString('fa-IR'),
        status: 'success'
      };

      setSimulatedLogs([newLog, ...simulatedLogs].slice(0, 10));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6 md:p-10" dir="rtl">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center gap-5 text-right">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <MessageSquare size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">روبوکا اتوماسیون</h1>
            <p className="text-slate-500 text-sm">مدیریت هوشمند کامنت و ارسال خودکار دایرکت</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <button onClick={() => setActiveTab('rules')} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>قوانین پاسخ‌دهی</button>
          <button onClick={() => setActiveTab('logs')} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>گزارشات زنده</button>
          <button onClick={() => setActiveTab('preview')} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>پیش‌نمایش موبایل</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {activeTab === 'rules' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black flex items-center gap-3"><Zap className="text-yellow-500" /> لیست کلمات کلیدی فعال</h3>
              <button onClick={() => setShowAddRule(true)} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                <Plus size={18} /> افزودن قانون جدید
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map(rule => (
                <div key={rule.id} className="glass p-8 rounded-[40px] border-white/5 group relative hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-xl">
                        {rule.keyword[0]}
                      </div>
                      <div className="text-right">
                         <h4 className="font-black text-lg text-white">کلمه کلیدی: "{rule.keyword}"</h4>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest">نوع عملیات: پاسخ + دایرکت هوشمند</p>
                      </div>
                    </div>
                    <button onClick={() => deleteRule(rule.id)} className="text-slate-700 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
                  </div>
                  
                  <div className="bg-slate-950/50 p-5 rounded-3xl border border-white/5 space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <CheckCircle2 size={14} className="text-emerald-500"/> پاسخ خودکار کامنت با هوش مصنوعی
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <CheckCircle2 size={14} className="text-emerald-500"/> ارسال دایرکت شامل لینک
                    </div>
                    {rule.customLink && <div className="text-[10px] text-indigo-400 font-mono truncate py-1 border-t border-white/5 mt-2" dir="ltr">{rule.customLink}</div>}
                  </div>

                  <button 
                    onClick={() => simulateTrigger(rule)}
                    disabled={isProcessing}
                    className="w-full py-4 bg-white/5 hover:bg-indigo-600/20 border border-white/5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <RefreshCcw className="animate-spin" size={14}/> : <><ArrowLeftRight size={14}/> تستِ عملکرد این قانون</>}
                  </button>
                </div>
              ))}

              {rules.length === 0 && (
                <div className="col-span-full h-64 border-2 border-dashed border-white/5 rounded-[50px] flex flex-col items-center justify-center text-slate-600">
                  <MessageSquare size={48} className="mb-4 opacity-10"/>
                  <p className="font-bold">هنوز هیچ قانون اتوماسیونی تعریف نکرده‌اید.</p>
                  <p className="text-xs">مثلاً کلمه «قیمت» یا عدد «۱» را اضافه کنید.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="glass p-10 rounded-[50px] border-white/5 animate-in slide-in-from-bottom-5">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white"><Smartphone className="text-indigo-400" /> گزارش تعاملات انجام شده</h3>
            <div className="space-y-4">
              {simulatedLogs.map(log => (
                <div key={log.id} className="bg-white/5 border border-white/5 p-6 rounded-[30px] text-right flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
                      <span className="font-bold text-sm text-white">@{log.user}</span>
                      <span className="text-[10px] text-slate-600 mr-auto">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 bg-black/20 p-3 rounded-xl">کامنت یوزر: <span className="text-white">"{log.comment}"</span></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                         <p className="text-[10px] font-bold text-indigo-400 mb-2 flex items-center gap-2"><MessageSquare size={12}/> پاسخ عمومی:</p>
                         <p className="text-[11px] leading-relaxed italic">{log.reply}</p>
                      </div>
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                         <p className="text-[10px] font-bold text-emerald-400 mb-2 flex items-center gap-2"><Send size={12}/> متن دایرکت (DM):</p>
                         <p className="text-[11px] leading-relaxed italic">{log.dm}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {simulatedLogs.length === 0 && (
                <div className="text-center py-20 text-slate-600">در انتظار اولین تعامل...</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex justify-center items-center py-10 animate-in zoom-in-95">
             <div className="w-[320px] h-[640px] bg-[#0f172a] rounded-[60px] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="h-14 bg-slate-900 flex items-center justify-between px-8 border-b border-white/5">
                   <div className="w-16 h-4 bg-slate-800 rounded-full"></div>
                   <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                   </div>
                </div>
                
                <div className="p-4 bg-indigo-600/10 border-b border-white/5 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">R</div>
                   <div>
                      <p className="text-[10px] font-bold text-white">Roboka_Official</p>
                      <p className="text-[8px] text-slate-500">Active now</p>
                   </div>
                </div>

                <div className="flex-1 p-6 space-y-4 flex flex-col justify-end">
                   <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none max-w-[80%] self-start">
                      <p className="text-[11px] leading-relaxed">سلام! خوشحالیم که عدد ۱ رو کامنت گذاشتی. این هم هدیه‌ای که قول داده بودیم: 🎁</p>
                   </div>
                   <div className="bg-indigo-600 p-4 rounded-2xl rounded-br-none max-w-[80%] self-end">
                      <p className="text-[11px] leading-relaxed">خیلی ممنونم! منتظرش بودم. عالیه ❤️</p>
                   </div>
                   <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none max-w-[80%] self-start animate-bounce">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      </div>
                   </div>
                </div>

                <div className="h-16 bg-slate-900 border-t border-white/5 p-4 flex items-center gap-3">
                   <div className="flex-1 h-8 bg-slate-800 rounded-full"></div>
                   <Send className="text-indigo-500" size={18}/>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass p-10 rounded-[50px] border-indigo-500/20 shadow-2xl">
             <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-black text-white">تعریف قانون اتوماسیون</h3>
               <button onClick={() => setShowAddRule(false)} className="text-slate-500 hover:text-white"><X/></button>
             </div>

             <div className="space-y-6 text-right">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 px-2 uppercase tracking-widest">کلمه کلیدی (Keyword)</label>
                   <input 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="مثال: قیمت، لینک، ۱، دانلود"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-xl font-black text-indigo-400 outline-none focus:border-indigo-600 transition-all"
                   />
                   <p className="text-[10px] text-slate-600 px-2">وقتی این کلمه کامنت شود، هوش مصنوعی فعال می‌شود.</p>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 px-2 uppercase tracking-widest">لینک ارسالی در دایرکت (اختیاری)</label>
                   <input 
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    dir="ltr"
                    placeholder="https://example.com/product"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-sm font-mono text-slate-400 outline-none focus:border-indigo-600 transition-all"
                   />
                </div>

                <button 
                  onClick={addRule}
                  disabled={!newKeyword}
                  className="w-full bg-indigo-600 py-6 rounded-3xl font-black text-xl text-white shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  ذخیره و فعال‌سازی آنی
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Floating Info */}
      <div className="fixed bottom-10 left-10 flex flex-col items-start gap-4 z-10 hidden md:flex">
         <div className="group relative">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur cursor-help">
              <Info size={20} className="text-slate-500"/>
           </div>
           <div className="absolute bottom-full left-0 w-80 p-6 bg-slate-900 border border-white/10 rounded-3xl mb-4 text-xs leading-relaxed hidden group-hover:block animate-in slide-in-from-bottom-2 shadow-2xl">
              <p className="font-bold text-white mb-2">چطور از این سیستم استفاده کنم؟</p>
              ۱. یک <b>کلمه کلیدی</b> (مثلاً "۱") در قوانین بسازید.<br/>
              ۲. در اینستاگرام پستی بگذارید و بگویید: «عدد ۱ را کامنت کنید».<br/>
              ۳. هوش مصنوعی روبوکا کامنت را شناسایی کرده و پاسخ هوشمند می‌دهد.<br/>
              ۴. لینک اختصاصی شما بلافاصله به دایرکت کاربر ارسال می‌شود.
           </div>
         </div>
      </div>
    </div>
  );
};

export default App;
