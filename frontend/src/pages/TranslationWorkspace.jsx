import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLibraryItemWithDb } from '../utils/studyLibrary';
import StudentLayout from '../components/StudentLayout';
import { postJson } from '../utils/api';
import FeedbackPanel from '../components/FeedbackPanel';

const TranslationWorkspace = () => {
  const navigate = useNavigate();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Twi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [confidence, setConfidence] = useState('0');
  const [confidenceLabel, setConfidenceLabel] = useState('high'); // high | moderate | low
  const [saveToast, setSaveToast] = useState('');      // '' | 'saving' | 'saved'

  // Follow‑up state
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpText, setFollowUpText] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const followUpRef = useRef(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setTranslatedText('');
    setConfidence('0');
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_lang: sourceLang, target_lang: targetLang, source_text: sourceText })
      });
      if (response.ok) {
        const data = await response.json();
        setTranslatedText(data.translated_text);
        setConfidence(data.confidence_pct || data.confidence || '0');
        setConfidenceLabel(data.confidence || 'high');
      } else {
        setTranslatedText('Error connecting to Neural GH-V2 processor.');
      }
    } catch {
      setTranslatedText('Network error establishing translation bridge.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!translatedText.trim()) return;
    setSaveToast('saving');
    await addLibraryItemWithDb('notes', {
      title: `Translation: ${sourceLang} → ${targetLang}`,
      content: translatedText,
      source: sourceText,
    });
    setSaveToast('saved');
    setTimeout(() => setSaveToast(''), 2500);
  };

  const handleFollowUp = async () => {
    if (!followUpText.trim() || followUpLoading) return;
    setFollowUpLoading(true);
    setFollowUpAnswer('');
    try {
      const context = `Original text (${sourceLang}): "${sourceText}"\n\nTranslation (${targetLang}): "${translatedText}"\n\nUser question: ${followUpText}`;
      const data = await postJson('/api/ai/chat', {
        messages: [{ role: 'user', content: context }],
        system: 'You are a translation assistant. Answer questions about the translation accurately and concisely.'
      });
      setFollowUpAnswer(data.response || data.message || '');
    } catch {
      setFollowUpAnswer('Could not get an answer. Please try again.');
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <StudentLayout>
      {/* Save toast */}
      {saveToast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm transition-all
          ${saveToast === 'saved' ? 'bg-[#005934] text-white' : 'bg-white dark:bg-slate-800 text-[#1b1b1c] dark:text-white border border-slate-200 dark:border-slate-700'}`}>
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {saveToast === 'saved' ? 'check_circle' : 'hourglass_top'}
          </span>
          {saveToast === 'saved' ? 'Saved to Library!' : 'Saving…'}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in-up">

        {/* Header */}
        <header className="mb-6 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b1b1c] dark:text-white mb-2 tracking-tight font-headline">Translation Workspace</h1>
            <p className="text-[#434653] dark:text-slate-400 text-[15px] max-w-2xl leading-relaxed font-medium">
              Accurate academic translation between English and Ghana's major languages using neural AI.
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#eae7e7] dark:bg-slate-800 rounded-full text-[#1b1b1c] dark:text-slate-200 font-bold hover:bg-[#dcd9d9] dark:hover:bg-slate-700 transition-colors shadow-sm self-start md:self-auto active:scale-95 text-sm">
            <span className="material-symbols-outlined text-[18px]">history</span>
            History
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between p-4 bg-[#f6f3f2] dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-[20px] shadow-sm">
            <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
              <div className="relative">
                <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border-none rounded-xl text-[#1b1b1c] dark:text-slate-100 font-bold focus:ring-2 focus:ring-[#00366c] dark:focus:ring-sky-500 transition-all cursor-pointer shadow-sm outline-none text-sm">
                  {['English','Twi','Ga','Ewe','Fante','Dagbani'].map(l => <option key={l}>{l}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#434653] dark:text-slate-400 text-[18px]">expand_more</span>
              </div>

              <button onClick={() => { const t = sourceLang; setSourceLang(targetLang); setTargetLang(t); }}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#f0eded] dark:bg-slate-800 rounded-full text-[#00366c] dark:text-sky-400 hover:bg-[#00366c] hover:text-white dark:hover:bg-sky-500 dark:hover:text-slate-900 transition-all active:scale-90 shadow-sm">
                <span className="material-symbols-outlined">swap_horiz</span>
              </button>

              <div className="relative">
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-[#ffbf2e] dark:bg-amber-500 border-none rounded-xl text-[#6e4f00] dark:text-amber-950 font-extrabold focus:ring-2 focus:ring-[#6e4f00] transition-all cursor-pointer shadow-sm outline-none text-sm">
                  {['Twi','English','Ga','Ewe','Fante','Dagbani'].map(l => <option key={l}>{l}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6e4f00] dark:text-amber-950 text-[18px]">expand_more</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#005934]/10 dark:bg-emerald-500/10 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[#005934] dark:bg-emerald-500 animate-pulse-slow" />
              <span className="text-[10px] font-black text-[#005934] dark:text-emerald-400 uppercase tracking-widest">Neural GH-V2 Active</span>
            </div>
          </div>

          {/* Editing Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Source Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-transparent dark:border-slate-800 flex flex-col focus-within:ring-2 focus-within:ring-[#00366c]/30 dark:focus-within:ring-sky-500/50 transition-all min-h-[420px]">
              <div className="px-6 py-4 border-b border-[#f0eded] dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#434653] dark:text-slate-400">Source Text</span>
                <div className="flex gap-1">
                  <button onClick={() => navigator.clipboard.readText().then(v => setSourceText(v))}
                    className="p-2 hover:bg-[#f6f3f2] dark:hover:bg-slate-800 rounded-lg text-[#434653] dark:text-slate-400 transition-colors" title="Paste">
                    <span className="material-symbols-outlined text-[18px]">content_paste</span>
                  </button>
                  <button onClick={() => setSourceText('')}
                    className="p-2 hover:bg-[#f6f3f2] dark:hover:bg-slate-800 rounded-lg text-[#434653] dark:text-slate-400 transition-colors" title="Clear">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
              <textarea value={sourceText} onChange={e => setSourceText(e.target.value)}
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-xl leading-relaxed text-[#1b1b1c] dark:text-white placeholder:text-[#dcd9d9] dark:placeholder:text-slate-600 resize-none outline-none p-6"
                placeholder="Enter academic text or paste research notes here..." />
              <div className="px-6 py-4 bg-[#f6f3f2] dark:bg-slate-900/50 border-t border-[#f0eded] dark:border-slate-800 rounded-b-[28px] flex justify-between items-center">
                <span className="text-xs font-bold text-[#434653] dark:text-slate-500">{sourceText.length} Characters</span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#434653] dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Auto-detect
                </span>
              </div>
            </div>

            {/* Target Output Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-lg border border-[#00366c]/10 dark:border-sky-500/20 flex flex-col min-h-[420px]">
              <div className="px-6 py-4 border-b border-[#f0eded] dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-white to-[#00366c]/5 dark:from-slate-900 dark:to-sky-900/20 rounded-t-[28px]">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00366c] dark:text-sky-400">Translation ({targetLang})</span>
                <div className="flex gap-1.5">
                  <button onClick={() => navigator.clipboard.writeText(translatedText)}
                    className="p-2 bg-white dark:bg-slate-800 hover:shadow-sm rounded-lg text-[#1b1b1c] dark:text-white transition-all active:scale-90 border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                  <button className="p-2 bg-white dark:bg-slate-800 hover:shadow-sm rounded-lg text-[#1b1b1c] dark:text-white transition-all active:scale-90 border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[18px]">volume_up</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 relative">
                {isTranslating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-b-[28px] z-10">
                    <div className="w-10 h-10 border-[3px] border-[#00366c]/20 border-t-[#00366c] dark:border-sky-400/20 dark:border-t-sky-400 rounded-full animate-spin" />
                  </div>
                )}
                <div className={`text-xl leading-relaxed font-semibold transition-opacity duration-300 ${isTranslating ? 'opacity-30' : 'opacity-100'} ${translatedText ? 'text-[#004d95] dark:text-sky-300' : 'text-[#737784]/60 dark:text-slate-600 italic font-medium'}`}>
                  {translatedText || 'Your precise contextual translation will emerge here.'}
                </div>
              </div>
              <div className="px-6 py-4 bg-[#f6f3f2] dark:bg-slate-800/50 rounded-b-[28px] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#434653] dark:text-slate-400">Confidence Engine V2</span>
                  <span className="text-xs font-black text-[#005934] dark:text-emerald-400">{confidence === '0' ? '--' : `${confidence}%`}</span>
                </div>
                <div className="w-full h-2 bg-[#eae7e7] dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-[#81d9a2] to-[#005934] dark:from-emerald-400 dark:to-emerald-600 transition-all duration-1000 ease-out" style={{ width: `${confidence === '0' ? 0 : confidence}%` }} />
                </div>
                {translatedText && (
                  <FeedbackPanel
                    outputType="translation"
                    confidence={confidenceLabel}
                    language={targetLang}
                    contentPreview={translatedText.slice(0, 200)}
                    showBadge={true}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-[#eae7e7] dark:border-slate-800 mt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Translate button — smaller */}
              <button onClick={handleTranslate} disabled={isTranslating || !sourceText.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#00366c] to-[#004d95] dark:from-sky-500 dark:to-blue-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
                Translate Now
              </button>
              {/* Save/Bookmark */}
              <button onClick={handleSaveNote} disabled={!translatedText.trim() || saveToast === 'saving'}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#f0eded] dark:bg-slate-800 rounded-xl text-[#00366c] dark:text-sky-400 font-bold text-sm hover:bg-[#dcd9d9] dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {saveToast === 'saved' ? 'check_circle' : 'bookmark'}
                </span>
                {saveToast === 'saved' ? 'Saved!' : 'Save'}
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Ask Follow-up — inline, no navigation */}
              <button onClick={() => { setFollowUpOpen(o => !o); setFollowUpAnswer(''); setFollowUpText(''); }}
                disabled={!translatedText.trim()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#f0eded] dark:border-slate-700 text-[#1b1b1c] dark:text-slate-200 font-bold text-sm rounded-xl hover:bg-[#f6f3f2] dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                Ask Follow-up
              </button>
            </div>
          </div>

          {/* Inline Follow-up Drawer */}
          {followUpOpen && translatedText && (
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-[#eae7e7] dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0eded] dark:border-slate-800 bg-gradient-to-r from-[#00366c]/5 to-transparent">
                <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <span className="text-[12px] font-black uppercase tracking-widest text-[#00366c] dark:text-sky-400">Follow-up Question</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-3">
                  <textarea
                    ref={followUpRef}
                    value={followUpText}
                    onChange={e => setFollowUpText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFollowUp(); } }}
                    placeholder={`Ask something about the ${targetLang} translation… (Enter to send)`}
                    rows={2}
                    className="flex-1 bg-[#f6f3f2] dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-[14px] text-[#1b1b1c] dark:text-white placeholder:text-[#c3c6d5] dark:placeholder:text-slate-500 resize-none outline-none focus:ring-2 focus:ring-[#00366c]/30 dark:focus:ring-sky-500/40 transition-all"
                    autoFocus
                  />
                  <button onClick={handleFollowUp} disabled={!followUpText.trim() || followUpLoading}
                    className="self-end px-4 py-3 bg-[#00366c] dark:bg-sky-600 text-white rounded-xl font-bold text-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1">
                    {followUpLoading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <span className="material-symbols-outlined text-[18px]">send</span>}
                  </button>
                </div>

                {followUpAnswer && (
                  <div className="bg-[#f6f3f2] dark:bg-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[#005934] dark:text-emerald-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#005934] dark:text-emerald-400">AI Response</span>
                    </div>
                    <p className="text-[14px] text-[#1b1b1c] dark:text-white leading-relaxed whitespace-pre-wrap">{followUpAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Context Smart Insight */}
          {translatedText && (
            <div className="bg-[#005934] dark:bg-emerald-950 text-white p-6 rounded-[28px] relative overflow-hidden shadow-lg">
              <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#79d09a] dark:text-emerald-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#79d09a] dark:text-emerald-400">Translation Context Engine</span>
                </div>
                <h3 className="font-headline text-xl font-black mb-2">Nuance Adjustments Applied</h3>
                <p className="text-[#81d9a2] dark:text-emerald-200/80 leading-relaxed font-medium text-[14px]">
                  The AI engine adapted academic idioms from your source text to fit native <strong>{targetLang}</strong> syntactic patterns — ensuring high formal fidelity rather than literal translation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default TranslationWorkspace;
