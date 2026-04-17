import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLibraryItemWithDb, getLibrary, syncLibraryFromDb } from '../utils/studyLibrary';
import { postJson } from '../utils/api';
import StudentLayout from '../components/StudentLayout';
import FeedbackPanel from '../components/FeedbackPanel';

// ─── Language Translate Modal ────────────────────────────────────────────────

const LANGUAGES = [
  'Twi', 'Ga', 'Ewe', 'Fante', 'Dagbani',
];

const TranslateModal = ({ summary, onClose }) => {
  const [targetLang, setTargetLang] = useState('Twi');
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    setTranslating(true);
    setError('');
    setResult('');
    try {
      const data = await postJson('/api/ai/translate', {
        source_lang: 'English',
        target_lang: targetLang,
        source_text: summary,
      });
      setResult(data.translated_text || '');
    } catch (e) {
      setError(e.message || 'Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#00366c]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00366c]/10 dark:bg-sky-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
            </div>
            <div>
              <h3 className="font-black text-[#1b1b1c] dark:text-white text-[15px]">Translate Summary</h3>
              <p className="text-xs text-[#737784] dark:text-slate-400 font-medium">Select target language</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Language grid */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#434653] dark:text-slate-400 block mb-3">Target Language</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => setTargetLang(lang)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all
                    ${targetLang === lang
                      ? 'bg-[#00366c] dark:bg-sky-600 text-white shadow-md'
                      : 'bg-[#f0eded] dark:bg-slate-800 text-[#434653] dark:text-slate-300 hover:bg-[#e0dddd] dark:hover:bg-slate-700'}`}>
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Translate button */}
          <button onClick={handleTranslate} disabled={translating || !summary}
            className="w-full py-3.5 bg-[#00366c] dark:bg-sky-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-60">
            {translating
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Translating…</>
              : <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span> Translate to {targetLang}</>}
          </button>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          {/* Result */}
          {result && (
            <div className="bg-[#f6f3f2] dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#005934] dark:text-emerald-400">{targetLang} Translation</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-bold text-[#737784] dark:text-slate-400 hover:text-[#00366c] dark:hover:text-sky-400 transition-colors">
                  <span className="material-symbols-outlined text-sm">content_copy</span> Copy
                </button>
              </div>
              <p className="text-[14px] text-[#1b1b1c] dark:text-white leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const SummarizerPage = () => {
  const navigate = useNavigate();
  const [sourceText, setSourceText] = useState('');
  const [config, setConfig] = useState('brief');
  const [summary, setSummary] = useState(null);
  const [confidenceLabel, setConfidenceLabel] = useState('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [recentHistory, setRecentHistory] = useState([]);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved'

  // ── History loader ──────────────────────────────────────────────────────────
  const loadHistory = () => {
    const lib = getLibrary();
    setRecentHistory(lib.summaries.slice(0, 5));
  };

  useEffect(() => {
    // Initial load: sync from DB then show
    syncLibraryFromDb().then(() => loadHistory());

    // Listen for real-time updates from any tab/component
    const onUpdate = () => loadHistory();
    window.addEventListener('studyLibraryUpdated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('studyLibraryUpdated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setIsGenerating(true);
    setError('');
    setSummary(null);
    setSaveStatus('');

    try {
      const data = await postJson('/api/ai/summarize', {
        text: sourceText,
        style: config,
      });
      setSummary(data.summary);
      setConfidenceLabel(data.confidence || 'high');

      // Auto-save to localStorage + DB
      const title = sourceText.trim().split(' ').slice(0, 5).join(' ') + '…';
      await addLibraryItemWithDb('summaries', {
        title,
        content: data.summary,
        configUsed: config,
      });
      loadHistory();
    } catch (err) {
      setError(err.message || 'Error connecting to the AI summarizer.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Save manually ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!summary) return;
    setSaveStatus('saving');
    const title = sourceText.trim().split(' ').slice(0, 5).join(' ') + '…';
    await addLibraryItemWithDb('summaries', {
      title,
      content: summary,
      configUsed: config,
    });
    loadHistory();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const calculateWords = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

  const CONFIG_OPTIONS = [
    { id: 'brief', label: 'Short', icon: 'short_text' },
    { id: 'bullet-points', label: 'Bullets', icon: 'format_list_bulleted' },
    { id: 'exam-prep', label: 'Exam Prep', icon: 'auto_stories' },
  ];

  const timeAgo = (dateStr) => {
    const diffMins = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return 'Yesterday';
  };

  return (
    <StudentLayout>
      {showTranslateModal && summary && (
        <TranslateModal summary={summary} onClose={() => setShowTranslateModal(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in-up font-body text-[#1b1b1c] dark:text-white">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-[42px] font-extrabold tracking-tight font-headline mb-3">Academic Summarizer</h1>
          <p className="text-[#434653] dark:text-slate-400 text-[16px] max-w-2xl leading-relaxed font-medium">
            Transform dense lecture notes and research papers into clear, actionable summaries.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-[#f0eded] dark:border-slate-800 shadow-sm p-6 flex flex-col h-[320px]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[#00366c] dark:text-sky-500">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
                  <span className="text-[12px] font-black tracking-widest uppercase">Source Text</span>
                </div>
                <span className="text-xs font-bold text-[#737784] dark:text-slate-500 uppercase tracking-widest">
                  {calculateWords(sourceText).toLocaleString()} words
                </span>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste your lecture notes, article text, or study materials here..."
                className="w-full flex-1 bg-transparent border-none p-0 text-[15px] resize-none focus:ring-0 text-[#1b1b1c] dark:text-white placeholder:text-[#c3c6d5] dark:placeholder:text-slate-600 outline-none"
              />
            </div>

            {/* Configuration — compact responsive buttons */}
            <div className="bg-[#f6f3f2] dark:bg-slate-900 rounded-[24px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#434653] dark:text-slate-400 text-[18px]">tune</span>
                <h3 className="font-extrabold text-[13px] text-[#1b1b1c] dark:text-white font-headline">Summary Style</h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                {CONFIG_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setConfig(opt.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-[12px] tracking-wide
                      ${config === opt.id
                        ? 'bg-[#ffbf2e] text-[#6e4f00] dark:bg-amber-500 dark:text-amber-950 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-[#434653] dark:text-slate-300 hover:bg-[#eae7e7] dark:hover:bg-slate-700'}`}>
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !sourceText.trim()}
              className={`w-full py-4 rounded-[16px] text-white font-black text-[15px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]
                ${isGenerating || !sourceText.trim() ? 'bg-[#00366c]/60 cursor-not-allowed' : 'bg-[#00366c] dark:bg-sky-600 hover:shadow-lg hover:-translate-y-0.5'}`}>
              {isGenerating
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> Generate Summary</>}
            </button>

            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* AI Insight Card */}
            <div className={`rounded-[24px] overflow-hidden flex flex-col min-h-[400px] transition-colors duration-500 shadow-lg relative
              ${summary ? 'bg-[#005934] dark:bg-emerald-900 border-b-4 border-b-[#9df5bd]' : 'bg-[#005934] dark:bg-emerald-950'}`}>

              <div className="p-5 flex justify-between items-center text-white relative z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">AI Insight</span>
                </div>
                {summary && (
                  <span className="bg-white/20 px-3 py-1 text-[9px] uppercase font-bold rounded-full tracking-widest backdrop-blur-sm">Generated</span>
                )}
              </div>

              <div className="flex-1 px-5 pb-5 flex flex-col justify-center relative z-10">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center text-white text-center space-y-4 opacity-80 animate-pulse">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-[#9df5bd] rounded-full animate-spin" />
                    <p className="font-semibold text-sm italic">Processing your text…</p>
                  </div>
                ) : summary ? (
                  <div className="h-full overflow-y-auto text-white" style={{ scrollbarWidth: 'none' }}>
                    <p className="text-[14px] leading-relaxed font-semibold text-white max-h-[200px] overflow-y-auto whitespace-pre-wrap">{summary}</p>
                    <div className="mt-3">
                      <FeedbackPanel
                        outputType="summary"
                        confidence={confidenceLabel}
                        language="English"
                        contentPreview={summary.slice(0, 200)}
                        showBadge={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white text-center space-y-3 opacity-50">
                    <div className="w-14 h-14 border-4 border-white/20 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">pending</span>
                    </div>
                    <p className="font-semibold text-sm italic">Ready for your text…</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 grid grid-cols-2 gap-2 mt-auto relative z-10 bg-black/10 backdrop-blur-sm">
                <button
                  onClick={() => setShowTranslateModal(true)}
                  disabled={!summary}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-[15px]">translate</span>
                  Translate
                </button>
                <button
                  onClick={handleSave}
                  disabled={!summary || saveStatus === 'saving'}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {saveStatus === 'saved' ? 'check_circle' : 'bookmark'}
                  </span>
                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                </button>
                <button
                  onClick={() => navigate('/quiz', { state: { sourceText: summary } })}
                  disabled={!summary}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-[15px]">quiz</span>
                  Quiz
                </button>
                <button
                  onClick={() => navigate('/simplify', { state: { sourceText: summary } })}
                  disabled={!summary}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                  Simplify
                </button>
              </div>

              {/* Decorative ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-[40px] border-white/5 rounded-full pointer-events-none" />
            </div>

            {/* Real-time History */}
            <div className="bg-[#f6f3f2] dark:bg-slate-900 rounded-[24px] p-5">
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-extrabold text-[14px] font-headline text-[#1b1b1c] dark:text-white">Recent History</h4>
                <span className="material-symbols-outlined text-[#00366c] dark:text-sky-500 text-[18px]">history</span>
              </div>

              <div className="space-y-3">
                {recentHistory.length === 0 ? (
                  <p className="text-xs text-[#737784] dark:text-slate-500 font-medium italic">No summaries yet — generate one above!</p>
                ) : (
                  recentHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSummary(item.content || '')}
                      className="bg-white dark:bg-slate-800 rounded-[12px] p-3.5 flex items-center gap-3 border-l-[3px] border-l-[#ffbf2e] dark:border-l-amber-500 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-98">
                      <div className="flex-1 min-w-0">
                        <span className="font-black text-[12px] text-[#1b1b1c] dark:text-white truncate block">{item.title}</span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#737784] dark:text-slate-500">{timeAgo(item.createdAt)}</span>
                      </div>
                      <span className="material-symbols-outlined text-[#737784] dark:text-slate-500 text-[16px]">arrow_forward_ios</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default SummarizerPage;
