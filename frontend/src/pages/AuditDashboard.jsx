import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';

const FEEDBACK_KEY = 'aiFeedbackLog';

const LANGUAGES = ['English', 'Twi', 'Ewe', 'Ga', 'Fante'];
const FEEDBACK_TYPES = ['Correct', 'Unclear', 'Wrong', 'Offensive', 'Culturally Inappropriate'];
const OUTPUT_TYPES = ['chat', 'translation', 'summary', 'simplify', 'quiz'];

const FEEDBACK_COLORS = {
  Correct: 'bg-emerald-500',
  Unclear: 'bg-amber-400',
  Wrong: 'bg-red-500',
  Offensive: 'bg-orange-500',
  'Culturally Inappropriate': 'bg-purple-500',
};
const CONFIDENCE_COLORS = { high: 'bg-emerald-500', moderate: 'bg-amber-400', low: 'bg-red-500' };

// Inline mini-bar
const MiniBar = ({ value, max, color = 'bg-[#00366c]', label, count }) => (
  <div className="flex items-center gap-3">
    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-32 truncate shrink-0">{label}</span>
    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }} />
    </div>
    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 w-6 text-right">{count}</span>
  </div>
);

const StatCard = ({ label, value, icon, sub, color = 'text-[#00366c] dark:text-sky-400', bg = 'bg-blue-50 dark:bg-blue-500/10' }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[20px] p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
      <span className={`material-symbols-outlined text-[22px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-black text-[#1b1b1c] dark:text-white font-headline">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  </div>
);

const AuditDashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [localData, setLocalData] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [recentLog, setRecentLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const acc = JSON.parse(localStorage.getItem('userAccount') || '{}');
    const r = acc.role || 'student';
    setRole(r);

    // Load localStorage feedback
    const local = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    setLocalData(local);

    // Try to fetch server stats
    Promise.all([
      fetch('/api/feedback/stats').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/feedback/recent?limit=50').then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([stats, recent]) => {
      setServerStats(stats);
      setRecentLog(recent);
      setLoading(false);
    });
  }, []);

  // Merge: prefer server stats, fallback to local
  const computeLocalStats = () => {
    const total = localData.length;
    const by_language = {};
    const by_feedback_type = {};
    const by_confidence = {};
    const by_output_type = {};
    localData.forEach(d => {
      by_language[d.language || 'English'] = (by_language[d.language || 'English'] || 0) + 1;
      by_feedback_type[d.feedbackType] = (by_feedback_type[d.feedbackType] || 0) + 1;
      by_confidence[d.confidence || 'high'] = (by_confidence[d.confidence || 'high'] || 0) + 1;
      by_output_type[d.outputType] = (by_output_type[d.outputType] || 0) + 1;
    });
    const correct = by_feedback_type['Correct'] || 0;
    return { total, by_language, by_feedback_type, by_confidence, by_output_type, accuracy_rate: total > 0 ? +((correct / total) * 100).toFixed(1) : 0, low_confidence_count: by_confidence['low'] || 0 };
  };

  const stats = serverStats || computeLocalStats();
  const log = recentLog.length > 0 ? recentLog : localData.slice(0, 50).map((d, i) => ({
    id: i,
    output_type: d.outputType,
    feedback_type: d.feedbackType,
    language: d.language,
    confidence: d.confidence,
    content_preview: d.contentPreview,
    created_at: d.timestamp,
  }));

  const maxLang = Math.max(1, ...Object.values(stats.by_language || {}));
  const maxFb = Math.max(1, ...Object.values(stats.by_feedback_type || {}));

  // Restrict to admin/lecturer
  if (!loading && role === 'student') {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          <h2 className="text-2xl font-black text-[#1b1b1c] dark:text-white font-headline">Access Restricted</h2>
          <p className="text-slate-500 max-w-sm">The AI Audit Dashboard is available to <strong>Lecturers</strong> and <strong>Administrators</strong> only.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-3 bg-[#00366c] text-white rounded-xl font-bold text-sm hover:opacity-90 transition">Back to Dashboard</button>
        </div>
      </StudentLayout>
    );
  }

  const filteredLog = activeFilter === 'All' ? log : log.filter(l => l.feedback_type === activeFilter);

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-16 space-y-8 animate-fade-in-up">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>policy</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00366c] dark:text-sky-400">Responsible AI</span>
          </div>
          <h1 className="text-3xl font-extrabold font-headline text-[#1b1b1c] dark:text-white tracking-tight">Bias & Fairness Audit Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[14px]">Tracks AI output quality and user feedback across all Ghanaian language pairs.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Feedback" value={stats.total} icon="rate_review" />
          <StatCard label="Accuracy Rate" value={`${stats.accuracy_rate}%`} icon="verified" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
          <StatCard label="Low Confidence" value={stats.low_confidence_count} icon="warning" color="text-red-500 dark:text-red-400" bg="bg-red-50 dark:bg-red-500/10" sub="Need review" />
          <StatCard label="Languages Tracked" value={Object.keys(stats.by_language || {}).length} icon="language" color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-500/10" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Per-language breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[15px] font-black font-headline text-[#1b1b1c] dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
              Feedback by Language
            </h3>
            <div className="space-y-3">
              {LANGUAGES.map(lang => (
                <MiniBar key={lang} label={lang} value={stats.by_language?.[lang] || 0} count={stats.by_language?.[lang] || 0} max={maxLang}
                  color={lang === 'English' ? 'bg-[#00366c]' : 'bg-[#ffbf2e]'} />
              ))}
            </div>
          </div>

          {/* Feedback type breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[15px] font-black font-headline text-[#1b1b1c] dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>thumbs_up_down</span>
              Feedback Type Breakdown
            </h3>
            <div className="space-y-3">
              {FEEDBACK_TYPES.map(ft => (
                <MiniBar key={ft} label={ft} value={stats.by_feedback_type?.[ft] || 0} count={stats.by_feedback_type?.[ft] || 0} max={maxFb}
                  color={FEEDBACK_COLORS[ft] || 'bg-slate-400'} />
              ))}
            </div>
          </div>

          {/* Confidence distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[15px] font-black font-headline text-[#1b1b1c] dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#005934] dark:text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>donut_large</span>
              Confidence Distribution
            </h3>
            <div className="flex items-center gap-6">
              {/* Visual donut approximation */}
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(() => {
                    const total = stats.total || 1;
                    const hi = (stats.by_confidence?.high || 0) / total;
                    const mo = (stats.by_confidence?.moderate || 0) / total;
                    const lo = (stats.by_confidence?.low || 0) / total;
                    const r = 15.9155; const c = 2 * Math.PI * r;
                    const hiD = hi * c; const moD = mo * c; const loD = lo * c;
                    return (
                      <>
                        <circle r={r} cx="18" cy="18" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                        <circle r={r} cx="18" cy="18" fill="none" stroke="#10b981" strokeWidth="3.5"
                          strokeDasharray={`${hiD} ${c - hiD}`} strokeDashoffset="0" />
                        <circle r={r} cx="18" cy="18" fill="none" stroke="#f59e0b" strokeWidth="3.5"
                          strokeDasharray={`${moD} ${c - moD}`} strokeDashoffset={`${-hiD}`} />
                        <circle r={r} cx="18" cy="18" fill="none" stroke="#ef4444" strokeWidth="3.5"
                          strokeDasharray={`${loD} ${c - loD}`} strokeDashoffset={`${-(hiD + moD)}`} />
                      </>
                    );
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700 dark:text-slate-300">{stats.total}</div>
              </div>
              <div className="space-y-2">
                {['high', 'moderate', 'low'].map(c => (
                  <div key={c} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${CONFIDENCE_COLORS[c]}`} />
                    <span className="text-[12px] font-bold capitalize text-slate-600 dark:text-slate-300">{c}</span>
                    <span className="text-[11px] font-black text-slate-500 ml-1">{stats.by_confidence?.[c] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By output type */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[15px] font-black font-headline text-[#1b1b1c] dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-purple-500" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
              Feedback by Feature
            </h3>
            <div className="space-y-3">
              {OUTPUT_TYPES.map(ot => {
                const cnt = stats.by_output_type?.[ot] || 0;
                const maxO = Math.max(1, ...Object.values(stats.by_output_type || {}));
                return <MiniBar key={ot} label={ot.charAt(0).toUpperCase() + ot.slice(1)} value={cnt} count={cnt} max={maxO} color="bg-purple-500" />;
              })}
            </div>
          </div>
        </div>

        {/* Feedback log table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-[15px] font-black font-headline text-[#1b1b1c] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
              Feedback Log
            </h3>
            <div className="flex flex-wrap gap-2">
              {['All', ...FEEDBACK_TYPES].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide transition-all ${activeFilter === f ? 'bg-[#00366c] text-white dark:bg-sky-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Feature', 'Feedback', 'Language', 'Confidence', 'Preview', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLog.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No feedback yet. Ratings appear here as users interact with AI outputs.</td></tr>
                ) : filteredLog.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-[12px] font-bold text-slate-600 dark:text-slate-300 capitalize">{item.output_type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black text-white ${FEEDBACK_COLORS[item.feedback_type] || 'bg-slate-400'}`}>
                        {item.feedback_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold text-slate-600 dark:text-slate-300">{item.language || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${CONFIDENCE_COLORS[item.confidence] || 'bg-slate-300'} text-white`}>
                        {item.confidence || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400 max-w-[200px] truncate">{item.content_preview || '—'}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default AuditDashboard;
