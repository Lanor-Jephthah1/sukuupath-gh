import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentActivities, getLibrary, addLibraryItem, syncLibraryFromDb } from '../utils/studyLibrary';
import StudentLayout from '../components/StudentLayout';
import { postJson } from '../utils/api';

// ─── Insight cache helpers ─────────────────────────────────────────────────
const INSIGHT_KEY = 'dashboardInsight';
const INSIGHT_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedInsight() {
  try {
    const raw = localStorage.getItem(INSIGHT_KEY);
    if (!raw) return null;
    const { text, ts } = JSON.parse(raw);
    if (Date.now() - ts > INSIGHT_TTL) return null;
    return text;
  } catch { return null; }
}

function setCachedInsight(text) {
  localStorage.setItem(INSIGHT_KEY, JSON.stringify({ text, ts: Date.now() }));
}

// ─── Component ────────────────────────────────────────────────────────────────

const StudentDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ sessionsCompleted: 0, quizzesGenerated: 0, savedNotes: 0 });
  const [userName, setUserName] = useState('Student');

  // Daily insight
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  // ── Load dashboard data ──────────────────────────────────────────────────
  const loadDashboardData = useCallback(() => {
    setStats(getDashboardStats());
    setActivities(getRecentActivities() || []);
    setMaterials(getLibrary().documents || []);
  }, []);

  // ── Fetch AI insight ─────────────────────────────────────────────────────
  const fetchInsight = useCallback(async (currentStats) => {
    const cached = getCachedInsight();
    if (cached) { setInsight(cached); return; }

    setInsightLoading(true);
    try {
      const lib = getLibrary();
      const recentTypes = [
        ...(lib.summaries?.length ? ['summaries'] : []),
        ...(lib.quizzes?.length ? ['quizzes'] : []),
        ...(lib.chats?.length ? ['AI chats'] : []),
      ];
      const data = await postJson('/api/ai/insight', {
        sessions_completed: currentStats.sessionsCompleted,
        quizzes_generated: currentStats.quizzesGenerated,
        saved_notes: currentStats.savedNotes,
        recent_types: recentTypes,
      });
      const text = data.insight || '';
      setInsight(text);
      setCachedInsight(text);
    } catch {
      setInsight('Keep going! Consistent study sessions build lasting academic momentum.');
    } finally {
      setInsightLoading(false);
    }
  }, []);

  // ── Mount & periodic refresh ─────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userAccount');
    if (stored) {
      const acc = JSON.parse(stored);
      setUserName(`${acc.first_name || acc.firstName || ''} ${acc.last_name || acc.lastName || ''}`.trim() || 'Student');
    }

    // Sync DB then load
    syncLibraryFromDb().then(() => {
      const s = getDashboardStats();
      setStats(s);
      setActivities(getRecentActivities() || []);
      setMaterials(getLibrary().documents || []);
      // Only fetch if no valid cache exists — never auto-refresh
      fetchInsight(s);
    });

    // Real-time activity via storage events only
    const onUpdate = () => loadDashboardData();
    window.addEventListener('studyLibraryUpdated', onUpdate);
    window.addEventListener('storage', onUpdate);

    return () => {
      window.removeEventListener('studyLibraryUpdated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [fetchInsight, loadDashboardData]);

  const handleSimulatedUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      addLibraryItem('documents', { title: file.name, size: file.size, type: file.type || 'application/pdf' });
      loadDashboardData();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const timeAgo = (dateStr) => {
    const diffMins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-12 space-y-10 animate-fade-in-up">

        {/* Welcome Hero */}
        <div className="relative overflow-hidden rounded-[24px] lg:rounded-[32px] bg-gradient-to-br from-[#00366c] to-[#004d95] p-8 lg:p-12 text-white shadow-md border border-transparent dark:border-[#004d95]">
          <div className="relative z-10 max-w-2xl w-full">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">Academic Dashboard</span>
            <h2 className="text-4xl font-headline font-extrabold mb-3 leading-tight truncate" title={`Hello, ${userName}`}>
              Hello, {userName} 👋
            </h2>
            <p className="text-[#9ac0ff] font-body text-base opacity-90 max-w-lg">
              Your AI-powered academic bridge is ready. Let's make today count.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-white overflow-hidden">
            <span className="material-symbols-outlined text-[150px] sm:text-[200px] translate-y-6">school</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Sessions Completed', value: stats.sessionsCompleted, icon: 'history_edu', color: 'text-[#00366c] dark:text-sky-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Quizzes Generated', value: stats.quizzesGenerated, icon: 'quiz', color: 'text-[#7b5800] dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Saved Notes', value: stats.savedNotes, icon: 'bookmark', color: 'text-[#005934] dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[20px] shadow-sm flex items-center gap-5 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>
                <span className={`material-symbols-outlined text-[24px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#434653] dark:text-slate-400 uppercase tracking-wide">{s.label}</p>
                <p className="text-3xl font-black text-[#1b1b1c] dark:text-white font-headline mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Tools + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[20px] font-headline font-bold text-[#00366c] dark:text-white tracking-tight">Core Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: 'g_translate', title: 'Translate', sub: 'Localize concepts', color: 'text-[#7b5800] dark:text-amber-500', route: '/translation' },
                { icon: 'auto_awesome', title: 'Simplify', sub: 'Break down jargon', color: 'text-[#00366c] dark:text-sky-400', route: '/simplify' },
                { icon: 'summarize', title: 'Summarize', sub: 'Quick highlights', color: 'text-[#ba1a1a] dark:text-red-500', route: '/summaries' },
                { icon: 'grading', title: 'Generate Quiz', sub: 'Test knowledge', color: 'text-[#434653] dark:text-slate-400', route: '/quiz' },
                { icon: 'psychology', title: 'Ask AI', sub: 'Deep academic chat', color: 'text-[#6e4f00] dark:text-amber-900', bg: 'bg-gradient-to-br from-[#ffbf2e] to-amber-200 dark:from-amber-500 dark:to-amber-300', route: '/ai-chat' },
                { icon: 'menu_book', title: 'My Library', sub: 'Saved materials', color: 'text-[#005934] dark:text-emerald-500', route: '/library' },
              ].map((act, i) => (
                <button key={i} onClick={() => navigate(act.route)}
                  className={`group p-5 rounded-[20px] transition-all border border-transparent active:scale-[0.98] text-left flex flex-col justify-center h-40
                    ${act.bg || 'bg-[#f6f3f2] hover:bg-white border-transparent hover:border-[#c3c6d5]/50 hover:shadow-lg dark:bg-slate-900 dark:hover:bg-slate-800'}`}>
                  <span className={`material-symbols-outlined text-[30px] mb-3 block ${act.color} group-hover:scale-110 transition-transform`} style={{ fontVariationSettings: "'FILL' 1" }}>{act.icon}</span>
                  <span className={`font-headline font-extrabold block mb-0.5 tracking-tight text-[14px] ${act.bg ? 'text-[#6e4f00] dark:text-amber-950' : 'text-[#1b1b1c] dark:text-white'}`}>{act.title}</span>
                  <span className={`text-[11px] font-medium leading-snug ${act.bg ? 'text-[#6e4f00]/80' : 'text-[#434653] dark:text-slate-400'}`}>{act.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Language widget */}
            <div className="bg-[#f0eded] dark:bg-slate-900 p-5 rounded-[24px] border border-transparent dark:border-slate-800">
              <h3 className="text-[15px] font-headline font-bold mb-3 flex items-center gap-2 text-[#1b1b1c] dark:text-white">
                <span className="material-symbols-outlined text-[18px]">language</span> Language Preference
              </h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 rounded-full bg-[#ffbf2e] text-[#6e4f00] text-xs font-bold dark:bg-amber-500 dark:text-amber-950 shadow-sm">English</button>
                {['Twi', 'Ewe', 'Ga', 'Fante'].map(l => (
                  <button key={l} className="px-3 py-1.5 rounded-full bg-white text-[#1b1b1c] text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">{l}</button>
                ))}
              </div>
            </div>

            {/* AI Daily Insight */}
            <div className="bg-[#005934] dark:bg-emerald-900 p-5 rounded-[24px] text-white relative overflow-hidden shadow-sm min-h-[120px] flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#79d09a] dark:text-emerald-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <h4 className="font-headline font-extrabold text-[#79d09a] dark:text-emerald-400 text-[13px] uppercase tracking-widest">Daily Insight</h4>
                </div>
                {insightLoading ? (
                  <div className="flex items-center gap-2 text-emerald-200/70 text-sm mt-2">
                    <div className="w-3 h-3 border-2 border-emerald-200/20 border-t-emerald-300 rounded-full animate-spin" />
                    <span className="font-medium text-xs italic">Generating insight…</span>
                  </div>
                ) : (
                  <p className="text-[13px] font-body text-emerald-50 leading-relaxed font-medium mt-1">{insight || 'Loading your personalised insight…'}</p>
                )}
              </div>
              <button onClick={() => { localStorage.removeItem(INSIGHT_KEY); fetchInsight(stats); }}
                className="mt-3 self-start flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-300/70 hover:text-emerald-200 transition-colors">
                <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
              </button>
              <div className="absolute -right-4 -bottom-4 opacity-10 blur-[1px] pointer-events-none">
                <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity + Saved Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Activity Feed — real-time */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-headline font-bold text-[#1b1b1c] dark:text-white">Recent Activity</h3>
              <button onClick={() => navigate('/library')} className="text-[12px] font-black text-[#00366c] dark:text-sky-400 hover:underline uppercase tracking-wide">View All</button>
            </div>
            {activities.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-2">history</span>
                <p className="text-sm font-medium text-slate-500">No activity yet — start generating!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 5).map((act, i) => (
                  <div key={act.id || i} className="flex items-start gap-3 p-3.5 rounded-[14px] hover:bg-[#f6f3f2] dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{act.icon || 'history'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#1b1b1c] dark:text-white group-hover:text-[#00366c] dark:group-hover:text-sky-400 transition-colors truncate">{act.title}</h4>
                      <p className="text-[11px] font-semibold text-[#434653] dark:text-slate-400 mt-0.5">{timeAgo(act.sub)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Materials */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleSimulatedUpload} />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-headline font-bold text-[#1b1b1c] dark:text-white">Saved Materials</h3>
              <button onClick={() => navigate('/library')} className="text-[12px] font-black text-[#00366c] dark:text-sky-400 hover:underline uppercase tracking-wide">My Library</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {materials.map((item, id) => (
                <div key={id} onClick={() => navigate('/library')}
                  className="bg-[#f6f3f2] dark:bg-slate-800 p-4 rounded-[18px] group cursor-pointer hover:bg-[#004d95] dark:hover:bg-sky-600 transition-all shadow-sm border border-transparent dark:border-slate-700">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 mb-3 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-[#1b1b1c] dark:text-white group-hover:text-white truncate" title={item.title}>{item.title}</h4>
                  <p className="text-[10px] text-[#434653] dark:text-slate-300 group-hover:text-[#9ac0ff] uppercase font-black tracking-widest mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              <div onClick={() => fileInputRef.current?.click()}
                className="bg-[#f0eded] dark:bg-slate-800/50 p-4 rounded-[18px] group cursor-pointer hover:bg-[#00366c] dark:hover:bg-sky-500 transition-all border border-dashed border-[#c3c6d5] dark:border-slate-600">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 mb-3 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400">upload</span>
                </div>
                <h4 className="text-[13px] font-bold text-[#1b1b1c] dark:text-white group-hover:text-white">Upload New</h4>
                <p className="text-[10px] text-[#434653] dark:text-slate-300 group-hover:text-[#9ac0ff] uppercase font-black tracking-widest mt-1">PDF, DOCX</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </StudentLayout>
  );
};

export default StudentDashboard;
