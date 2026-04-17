import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postJson } from '../utils/api';
import { addLibraryItemWithDb, getLibrary } from '../utils/studyLibrary';
import StudentLayout from '../components/StudentLayout';

const API_BASE = '';

// ─── Library Picker Modal ─────────────────────────────────────────────────────

const LibraryPickerModal = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const lib = getLibrary();
  const allItems = [
    ...(lib.documents || []).map(i => ({ ...i, _type: 'document' })),
    ...(lib.summaries || []).map(i => ({ ...i, _type: 'summary' })),
    ...(lib.notes || []).map(i => ({ ...i, _type: 'note' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = search.trim()
    ? allItems.filter(i => (i.title || '').toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const typeIcon = t => t === 'document' ? 'description' : t === 'summary' ? 'summarize' : 'import_contacts';
  const typeColor = t => t === 'document'
    ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
    : t === 'summary'
    ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
    : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#00366c]/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00366c]/10 dark:bg-sky-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
            </div>
            <div>
              <h3 className="font-black text-[#1b1b1c] dark:text-white text-[15px]">Load from Library</h3>
              <p className="text-xs text-[#737784] dark:text-slate-400 font-medium">{allItems.length} item{allItems.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 bg-[#f6f3f2] dark:bg-slate-800 rounded-xl px-4 py-2.5">
            <span className="material-symbols-outlined text-[#737784] dark:text-slate-400 text-[18px]">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search documents, summaries…"
              className="bg-transparent border-none outline-none text-sm font-medium text-[#1b1b1c] dark:text-white placeholder:text-[#c3c6d5] dark:placeholder:text-slate-500 w-full"
              autoFocus />
          </div>
        </div>

        {/* Items */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2" style={{ scrollbarWidth: 'none' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[#eae7e7] dark:text-slate-700 mb-3">inbox</span>
              <p className="text-sm font-bold text-[#737784] dark:text-slate-400">
                {allItems.length === 0 ? 'No saved items yet. Generate summaries or upload documents first.' : 'No results found.'}
              </p>
            </div>
          ) : (
            filtered.map(item => (
              <button key={item.id} onClick={() => onSelect(item)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#f6f3f2] dark:bg-slate-800 hover:bg-[#eae7e7] dark:hover:bg-slate-700 transition-all text-left group active:scale-[0.98]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor(item._type)}`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{typeIcon(item._type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#1b1b1c] dark:text-white truncate">{item.title || 'Untitled'}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#737784] dark:text-slate-500 mt-0.5">
                    {item._type} · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#c3c6d5] dark:text-slate-600 group-hover:text-[#00366c] dark:group-hover:text-sky-400 transition-colors text-[18px]">arrow_forward_ios</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


// ─── Helpers ────────────────────────────────────────────────────────────────

const calcTimeSecs = (count, types) => {
  const hasShort = types.includes('Short Answer');
  const hasMCQ = types.includes('Multiple Choice') || types.includes('True/False');
  if (hasShort && !hasMCQ) return count * 120;
  if (!hasShort && hasMCQ) return count * 90;
  return count * 105; // mixed
};

const formatTime = (secs) => {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const gradeInfo = (pct) => {
  if (pct >= 80) return { grade: 'A', label: 'Excellent', color: '#16a34a', bg: 'from-emerald-500/20 to-emerald-500/5', ring: '#16a34a' };
  if (pct >= 70) return { grade: 'B', label: 'Good', color: '#2563eb', bg: 'from-blue-500/20 to-blue-500/5', ring: '#2563eb' };
  if (pct >= 60) return { grade: 'C', label: 'Average', color: '#d97706', bg: 'from-amber-500/20 to-amber-500/5', ring: '#d97706' };
  if (pct >= 50) return { grade: 'D', label: 'Below Average', color: '#ea580c', bg: 'from-orange-500/20 to-orange-500/5', ring: '#ea580c' };
  return { grade: 'F', label: 'Needs Work', color: '#dc2626', bg: 'from-red-500/20 to-red-500/5', ring: '#dc2626' };
};

// ─── ScoreRing ───────────────────────────────────────────────────────────────

const ScoreRing = ({ pct, grade }) => {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke={grade.ring} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)', filter: `drop-shadow(0 0 8px ${grade.ring}88)` }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="text-5xl font-black text-white leading-none">{Math.round(pct)}%</span>
        <span className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: grade.ring }}>{grade.label}</span>
      </div>
    </div>
  );
};

// ─── ResultsPopup ────────────────────────────────────────────────────────────

const ResultsPopup = ({ quiz, answers, shortAnswers, onRetry, onNewQuiz, onSave }) => {
  const [expandedQ, setExpandedQ] = useState(null);
  const correct = quiz.questions.reduce((acc, q, i) => {
    if (q.type === 'short_answer') {
      const ua = (shortAnswers[i] || '').trim().toLowerCase();
      const ca = (q.answer_text || '').trim().toLowerCase();
      return acc + (ua === ca ? 1 : 0);
    }
    return acc + (answers[i] === q.answer_index ? 1 : 0);
  }, 0);
  const skipped = quiz.questions.filter((_, i) => answers[i] === undefined && !shortAnswers[i]).length;
  const wrong = quiz.questions.length - correct - skipped;
  const pct = Math.round((correct / quiz.questions.length) * 100);
  const grade = gradeInfo(pct);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>

      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[32px] shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          scrollbarWidth: 'none',
        }}>

        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: grade.ring }} />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: grade.ring }} />
        </div>

        <div className="relative z-10 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4"
              style={{ background: `${grade.ring}22`, color: grade.ring, border: `1px solid ${grade.ring}44` }}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Quiz Complete
            </span>
            <h2 className="text-3xl font-black text-white font-headline">{quiz.title}</h2>
          </div>

          {/* Score Ring + Grade */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <ScoreRing pct={pct} grade={grade} />
            <div className="flex gap-4 flex-wrap justify-center">
              <div className="flex flex-col items-center px-6 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl font-black text-emerald-400">{correct}</span>
                <span className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Correct</span>
              </div>
              <div className="flex flex-col items-center px-6 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl font-black text-red-400">{wrong}</span>
                <span className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Wrong</span>
              </div>
              <div className="flex flex-col items-center px-6 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl font-black text-slate-400">{skipped}</span>
                <span className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Skipped</span>
              </div>
            </div>
          </div>

          {/* Per-question review */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Answer Review</h3>
            {quiz.questions.map((q, i) => {
              let isCorrect = false;
              let userAnswer = '';
              let correctAnswer = '';
              if (q.type === 'short_answer') {
                const ua = (shortAnswers[i] || '').trim().toLowerCase();
                const ca = (q.answer_text || '').trim().toLowerCase();
                isCorrect = ua === ca;
                userAnswer = shortAnswers[i] || '(skipped)';
                correctAnswer = q.answer_text;
              } else {
                isCorrect = answers[i] === q.answer_index;
                userAnswer = answers[i] !== undefined ? (q.options?.[answers[i]] || '(skipped)') : '(skipped)';
                correctAnswer = q.options?.[q.answer_index] || '';
              }
              const isOpen = expandedQ === i;
              const isSkipped = answers[i] === undefined && !shortAnswers[i];

              return (
                <div key={i} className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isSkipped ? 'rgba(255,255,255,0.08)' : isCorrect ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}` }}>
                  <button
                    onClick={() => setExpandedQ(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 p-4 text-left">
                    <div className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
                      ${isSkipped ? 'bg-slate-700 text-slate-400' : isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isSkipped ? '—' : isCorrect ? '✓' : '✗'}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-slate-200 leading-snug line-clamp-2">{q.question}</span>
                    <span className={`material-symbols-outlined text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                      <div className="flex gap-3">
                        <div className="flex-1 p-3 rounded-xl" style={{ background: isCorrect ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', border: `1px solid ${isCorrect ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}` }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>Your Answer</p>
                          <p className="text-sm text-white font-medium">{userAnswer}</p>
                        </div>
                        {!isCorrect && (
                          <div className="flex-1 p-3 rounded-xl" style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Correct Answer</p>
                            <p className="text-sm text-white font-medium">{correctAnswer}</p>
                          </div>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                          <div className="flex gap-2 mb-1">
                            <span className="material-symbols-outlined text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Explanation</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onRetry}
              className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}>
              <span className="material-symbols-outlined text-lg">replay</span>
              Retry Quiz
            </button>
            <button onClick={onSave}
              className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              Save to Library
            </button>
            <button onClick={onNewQuiz}
              className="flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #004d95, #0070d8)', color: 'white' }}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              New Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const QuizGeneratorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Input state
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [sourceText, setSourceText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [extractError, setExtractError] = useState('');
  const fileInputRef = useRef(null);

  // Config state
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState(['Multiple Choice']);
  const [outputLanguage, setOutputLanguage] = useState('English');

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const state = location.state || {};
    if (state.sourceText) setSourceText(state.sourceText);
  }, [location.state]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timerActive && timeLeft === 0 && quiz) {
      handleSubmit(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleTypeToggle = (type) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) setQuestionTypes(questionTypes.filter(t => t !== type));
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleFileDrop = useCallback(async (file) => {
    if (!file) return;
    const allowed = ['.pdf', '.docx', '.doc', '.pptx', '.ppt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setExtractError('Unsupported file type. Please upload PDF, DOCX, or PPTX.');
      return;
    }
    setUploadedFile(file);
    setExtractError('');
    setExtracting(true);
    setSourceText('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/ai/extract`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).detail || 'Extraction failed');
      const data = await res.json();
      setSourceText(data.text || '');
    } catch (e) {
      setExtractError(e.message || 'Failed to extract text from document.');
    } finally {
      setExtracting(false);
    }
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileDrop(file);
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) { setError('Please provide some source content first.'); return; }
    setLoading(true);
    setError('');
    setQuiz(null);
    setAnswers({});
    setShortAnswers({});
    setSubmitted(false);
    setShowResults(false);
    clearTimeout(timerRef.current);
    setTimerActive(false);
    try {
      const data = await postJson('/api/ai/quiz', {
        source_text: sourceText,
        difficulty,
        question_count: Number(questionCount),
        question_types: questionTypes,
        output_language: outputLanguage,
      });
      setQuiz(data);
      const secs = calcTimeSecs(Number(questionCount), questionTypes);
      setTimeLeft(secs);
      setTimerActive(true);
    } catch (err) {
      setError(err.message || 'Error communicating with AI engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleShortAnswerChange = (qIdx, val) => {
    if (submitted) return;
    setShortAnswers(prev => ({ ...prev, [qIdx]: val }));
  };

  const handleSubmit = (autoSubmit = false) => {
    clearTimeout(timerRef.current);
    setTimerActive(false);
    setSubmitted(true);
    setShowResults(true);
    if (!autoSubmit) setTimeLeft(0);
  };

  const handleRetry = () => {
    setAnswers({});
    setShortAnswers({});
    setSubmitted(false);
    setShowResults(false);
    if (quiz) {
      const secs = calcTimeSecs(Number(questionCount), questionTypes);
      setTimeLeft(secs);
      setTimerActive(true);
    }
  };

  const handleNewQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setShortAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setTimerActive(false);
    clearTimeout(timerRef.current);
  };

  const handleSave = () => {
    if (quiz) {
      addLibraryItem('quizzes', {
        title: quiz.title || `${difficulty} Quiz`,
        questions: quiz.questions || [],
        source: uploadedFile?.name || 'Custom study material',
      });
    }
    setShowResults(false);
  };

  // ── Computed ──────────────────────────────────────────────────────────────

  const answeredCount = quiz ? quiz.questions.filter((q, i) =>
    q.type === 'short_answer' ? shortAnswers[i] : answers[i] !== undefined
  ).length : 0;

  const timerPct = quiz ? (timeLeft / calcTimeSecs(Number(questionCount), questionTypes)) * 100 : 100;
  const timerWarn = timerPct < 20;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <StudentLayout>
      {showLibraryPicker && (
        <LibraryPickerModal
          onSelect={(item) => {
            const text = item.content || item.response || item.text || '';
            setSourceText(text);
            setInputMode('paste');
            setShowLibraryPicker(false);
          }}
          onClose={() => setShowLibraryPicker(false)}
        />
      )}
      {showResults && quiz && (
        <ResultsPopup
          quiz={quiz}
          answers={answers}
          shortAnswers={shortAnswers}
          onRetry={handleRetry}
          onNewQuiz={handleNewQuiz}
          onSave={handleSave}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in-up">

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 flex-1">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ffbf2e] dark:bg-amber-500 text-[#6e4f00] dark:text-amber-950 text-[10px] font-black tracking-widest uppercase shadow-sm">
              AI Generator
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b1b1c] dark:text-white tracking-tight font-headline mb-1">Quiz Builder</h1>
            <p className="text-[#434653] dark:text-slate-400 max-w-2xl font-medium text-[15px]">
              Upload documents or paste your notes — SukuuPath AI generates intelligent, timed assessments tailored to your study material.
            </p>
          </div>
          <button onClick={() => setShowLibraryPicker(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#eae7e7] dark:bg-slate-800 text-[#1b1b1c] dark:text-slate-200 font-bold rounded-xl hover:bg-[#dcd9d9] dark:hover:bg-slate-700 transition-colors shadow-sm self-start md:self-auto active:scale-95">
            <span className="material-symbols-outlined text-xl">folder_open</span>
            Load Saved Note
          </button>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* ── Left Panel ── */}
          <div className="xl:col-span-5 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

            {/* Input Tab Toggle */}
            <div className="bg-[#f6f3f2] dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 space-y-4 border border-transparent dark:border-slate-800 shadow-sm">
              <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-4">
                {[
                  { id: 'paste', label: 'Paste Text', icon: 'edit_note' },
                  { id: 'upload', label: 'Upload File', icon: 'upload_file' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setInputMode(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all
                      ${inputMode === tab.id
                        ? 'bg-[#00366c] dark:bg-sky-600 text-white shadow-md'
                        : 'text-[#737784] dark:text-slate-500 hover:text-[#00366c]'}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold text-[#00366c] dark:text-sky-400 uppercase tracking-widest">Source Content</label>
                <span className="text-[10px] text-[#737784] dark:text-slate-500 font-bold tracking-wider">{sourceText.length} Characters</span>
              </div>

              {inputMode === 'paste' ? (
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="w-full h-64 bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl p-5 text-[15px] leading-relaxed text-[#1b1b1c] dark:text-white focus:ring-2 focus:ring-[#00366c]/30 dark:focus:ring-sky-500/50 transition-all placeholder:text-[#c3c6d5] dark:placeholder:text-slate-500 resize-none shadow-inner outline-none"
                  placeholder="Paste your study notes, chapter summary, or research text here..."
                />
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-64 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-800 border-2 border-dashed border-[#c3c6d5] dark:border-slate-600 rounded-2xl cursor-pointer hover:border-[#00366c] dark:hover:border-sky-500 transition-all group">
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={(e) => handleFileDrop(e.target.files?.[0])} />
                  {extracting ? (
                    <>
                      <div className="w-10 h-10 border-4 border-[#00366c]/20 border-t-[#00366c] rounded-full animate-spin" />
                      <p className="text-sm font-bold text-[#434653] dark:text-slate-300">Extracting text…</p>
                    </>
                  ) : uploadedFile && sourceText ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-[#1b1b1c] dark:text-white text-sm">{uploadedFile.name}</p>
                        <p className="text-xs text-[#737784] dark:text-slate-400 mt-1">{sourceText.length.toLocaleString()} characters extracted</p>
                      </div>
                      <p className="text-xs text-[#00366c] dark:text-sky-400 font-bold">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-[#00366c]/10 dark:bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl text-[#00366c] dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-[#434653] dark:text-slate-300 text-sm">Drag & drop or click to upload</p>
                        <p className="text-xs text-[#737784] dark:text-slate-500 mt-1">PDF, DOCX, PPTX supported</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {extractError && (
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold ring-1 ring-red-500/30">{extractError}</div>
              )}
            </div>

            {/* Configuration Panel */}
            <div className="bg-[#f6f3f2] dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 space-y-6 border border-transparent dark:border-slate-800 shadow-sm">
              <h3 className="font-extrabold text-[#00366c] dark:text-sky-400 font-headline text-lg tracking-tight">Configuration</h3>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold text-[#434653] dark:text-slate-400 uppercase tracking-widest">Questions</label>
                  <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl text-[14px] font-bold py-3.5 px-4 focus:ring-2 focus:ring-[#00366c] dark:focus:ring-sky-500 shadow-sm outline-none cursor-pointer text-[#1b1b1c] dark:text-white">
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={30}>30 Questions</option>
                    <option value={40}>40 Questions</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold text-[#434653] dark:text-slate-400 uppercase tracking-widest">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl text-[14px] font-bold py-3.5 px-4 focus:ring-2 focus:ring-[#00366c] dark:focus:ring-sky-500 shadow-sm outline-none cursor-pointer text-[#1b1b1c] dark:text-white">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              {/* Question Types */}
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-[#434653] dark:text-slate-400 uppercase tracking-widest block">Question Types</label>
                <div className="flex flex-wrap gap-2">
                  {['Multiple Choice', 'True/False', 'Short Answer'].map(type => (
                    <button key={type} onClick={() => handleTypeToggle(type)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm
                        ${questionTypes.includes(type)
                          ? 'bg-[#ffbf2e] text-[#6e4f00] dark:bg-amber-500 dark:text-amber-950'
                          : 'bg-[#eae7e7] text-[#737784] hover:bg-[#dcd9d9] dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Language */}
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-[#434653] dark:text-slate-400 uppercase tracking-widest block">Output Language</label>
                <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm w-full justify-between items-center text-center">
                  {['English', 'Twi', 'Ga'].map(lang => (
                    <button key={lang} onClick={() => setOutputLanguage(lang)}
                      className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all
                        ${outputLanguage === lang
                          ? 'bg-[#00366c] dark:bg-sky-600 text-white shadow-sm'
                          : 'text-[#737784] dark:text-slate-500 hover:text-[#00366c]'}`}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-[#ba1a1a]/10 dark:bg-red-500/10 text-[#ba1a1a] dark:text-red-400 rounded-xl text-xs font-bold ring-1 ring-[#ba1a1a]/30">{error}</div>
              )}

              <button onClick={handleGenerate} disabled={loading}
                className="w-full py-4 bg-[#004d95] dark:bg-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all outline-none flex items-center justify-center gap-2 mt-4">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>}
                {loading ? 'Generating Quiz…' : 'Generate Quiz'}
              </button>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="xl:col-span-7 h-full flex animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className={`w-full bg-white dark:bg-slate-900 rounded-[32px] shadow-md dark:shadow-none border ${quiz ? 'border-[#00366c]/20 dark:border-sky-500/20' : 'border-[#f0eded] dark:border-slate-800'} overflow-hidden min-h-[600px] flex flex-col transition-all duration-500`}>

              {/* Preview Header */}
              <div className="p-6 md:p-8 border-b border-[#f0eded] dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-white to-[#f6f3f2]/30 dark:from-slate-900 dark:to-slate-800/80">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#005934]/10 dark:bg-emerald-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px] text-[#005934] dark:text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
                  </div>
                  <div>
                    <h2 className="font-extrabold text-[22px] text-[#1b1b1c] dark:text-white font-headline">{quiz ? quiz.title : 'Quiz Workspace'}</h2>
                    <p className="text-xs text-[#434653] dark:text-slate-400 font-bold tracking-wide mt-1 uppercase">{questionCount} Questions • {difficulty}</p>
                  </div>
                </div>

                {/* Timer */}
                {quiz && (
                  <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-xl transition-all
                    ${timerWarn
                      ? 'bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400 animate-pulse'
                      : 'bg-[#f6f3f2] dark:bg-slate-800 text-[#00366c] dark:text-sky-400'}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                    <span className="font-mono tracking-widest">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: 'none' }}>
                {!quiz ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center py-20">
                    <span className="material-symbols-outlined text-[#eae7e7] dark:text-slate-800 text-8xl mb-6">dynamic_feed</span>
                    <h3 className="text-2xl font-extrabold text-[#434653] dark:text-slate-400 font-headline">Blank Canvas</h3>
                    <p className="max-w-xs text-sm mt-3 text-[#737784] dark:text-slate-500 font-medium leading-relaxed">Configure your quiz on the left and hit Generate to populate this workspace.</p>
                  </div>
                ) : (
                  <div className="space-y-10 pb-6">
                    {/* Insight Card */}
                    <div className="bg-[#005934] dark:bg-emerald-950 text-white p-6 md:p-8 rounded-[24px] relative overflow-hidden shadow-lg border border-[#003f23] dark:border-emerald-900 border-b-4 border-b-[#9df5bd] dark:border-b-emerald-400">
                      <div className="relative z-10 flex gap-5 items-start">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                          <span className="material-symbols-outlined text-3xl text-[#9df5bd] dark:text-emerald-300" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                        </div>
                        <div>
                          <h4 className="font-headline font-black text-lg mb-2">Cognitive Analysis Insight</h4>
                          <p className="text-[13px] text-[#81d9a2] dark:text-emerald-200/90 leading-relaxed font-semibold">
                            {quiz.questions.length} questions generated in{' '}
                            {[...new Set(quiz.questions.map(q => q.type))].map(t =>
                              t === 'mcq' ? 'Multiple Choice' : t === 'true_false' ? 'True/False' : 'Short Answer'
                            ).join(', ')} format.{' '}
                            You have {formatTime(timeLeft)} to complete this assessment.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-12">
                      {quiz.questions.map((q, idx) => {
                        const isAnswered = q.type === 'short_answer'
                          ? (shortAnswers[idx] || '').trim().length > 0
                          : answers[idx] !== undefined;
                        const isCorrect = q.type === 'short_answer'
                          ? (shortAnswers[idx] || '').trim().toLowerCase() === (q.answer_text || '').trim().toLowerCase()
                          : answers[idx] === q.answer_index;

                        return (
                          <div key={idx} className="flex gap-4 md:gap-6 animate-fade-in" style={{ animationDelay: `${idx * 0.06}s` }}>
                            {/* Number badge */}
                            <div className={`flex-none w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-[15px] shadow-sm transition-colors duration-500
                              ${!isAnswered ? 'bg-[#00366c] dark:bg-sky-500 text-white'
                                : submitted
                                  ? isCorrect ? 'bg-[#005934] dark:bg-emerald-500 text-white' : 'bg-[#ba1a1a] dark:bg-red-500 text-white'
                                  : 'bg-[#ffbf2e] dark:bg-amber-500 text-[#6e4f00]'}`}>
                              {idx + 1}
                            </div>

                            <div className="space-y-4 flex-1 pt-1 md:pt-2">
                              {/* Question type badge */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest
                                  ${q.type === 'mcq' ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
                                    : q.type === 'true_false' ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                  {q.type === 'mcq' ? 'MCQ' : q.type === 'true_false' ? 'True / False' : 'Short Answer'}
                                </span>
                              </div>

                              <h3 className="font-headline font-extrabold text-xl md:text-2xl text-[#1b1b1c] dark:text-white leading-snug">{q.question}</h3>

                              {/* MCQ / True-False */}
                              {(q.type === 'mcq' || q.type === 'true_false') && q.options && (
                                <div className={`grid gap-3.5 ${q.type === 'true_false' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                  {q.options.map((opt, optIdx) => {
                                    const isSelected = answers[idx] === optIdx;
                                    const isActiveCorrect = submitted && optIdx === q.answer_index;
                                    let bg = 'bg-[#f6f3f2] dark:bg-slate-800 hover:bg-white hover:border-[#00366c]/30 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700';
                                    let indicator = 'border-2 border-[#c3c6d5] dark:border-slate-500 text-[#737784] dark:text-slate-400';
                                    let text = 'text-[#434653] dark:text-slate-300';

                                    if (isSelected && !submitted) {
                                      bg = 'bg-[#00366c]/5 border-[#00366c]/40 shadow-inner dark:bg-sky-500/10 dark:border-sky-400/40 ring-1 ring-[#00366c]/20';
                                      indicator = 'bg-[#00366c] dark:bg-sky-500 border-none text-white';
                                      text = 'text-[#00366c] dark:text-sky-300 font-extrabold';
                                    }
                                    if (submitted) {
                                      if (isActiveCorrect) {
                                        bg = 'bg-[#005934]/10 border-[#005934]/60 ring-2 ring-[#005934]/20 dark:bg-emerald-500/20 dark:border-emerald-500/60';
                                        indicator = 'bg-[#005934] dark:bg-emerald-500 border-none text-white scale-110';
                                        text = 'text-[#005934] dark:text-emerald-300 font-black';
                                      } else if (isSelected && !isActiveCorrect) {
                                        bg = 'bg-[#ba1a1a]/5 border-[#ba1a1a]/50 dark:bg-red-500/10 dark:border-red-500/50';
                                        indicator = 'bg-[#ba1a1a] dark:bg-red-500 border-none text-white';
                                        text = 'text-[#ba1a1a] dark:text-red-400 font-extrabold line-through opacity-60';
                                      }
                                    }

                                    return (
                                      <div key={optIdx} onClick={() => !submitted && handleOptionSelect(idx, optIdx)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer group transition-all duration-300 border ${bg} ${submitted ? 'cursor-default' : ''}`}>
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${indicator}`}>
                                          {q.type === 'true_false' ? opt : String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <span className={`text-[15px] transition-colors leading-tight ${text}`}>
                                          {q.type === 'true_false' ? opt : opt}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Short Answer */}
                              {q.type === 'short_answer' && (
                                <div className="space-y-2">
                                  <textarea
                                    value={shortAnswers[idx] || ''}
                                    onChange={(e) => handleShortAnswerChange(idx, e.target.value)}
                                    disabled={submitted}
                                    rows={3}
                                    placeholder="Type your answer here…"
                                    className={`w-full bg-[#f6f3f2] dark:bg-slate-800 border rounded-2xl p-4 text-[15px] leading-relaxed text-[#1b1b1c] dark:text-white focus:ring-2 focus:ring-[#00366c]/30 dark:focus:ring-sky-500/50 transition-all placeholder:text-[#c3c6d5] dark:placeholder:text-slate-500 resize-none outline-none
                                      ${submitted
                                        ? isCorrect
                                          ? 'border-emerald-500/50 bg-emerald-500/5'
                                          : 'border-red-500/50 bg-red-500/5'
                                        : 'border-transparent dark:border-slate-700 shadow-inner'}`}
                                  />
                                  {submitted && !isCorrect && q.answer_text && (
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                      <span className="material-symbols-outlined text-sm text-emerald-500 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Correct Answer</p>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mt-0.5">{q.answer_text}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Explanation (after submit) */}
                              <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${submitted ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                {q.explanation && (
                                  <div className={`p-5 rounded-[20px] ${isCorrect ? 'bg-[#005934]/5 dark:bg-emerald-500/10 border border-[#005934]/10 dark:border-emerald-500/20' : 'bg-[#ba1a1a]/5 dark:bg-red-500/10 border border-[#ba1a1a]/10 dark:border-red-500/20'}`}>
                                    <div className="flex gap-3 mb-2">
                                      <span className={`material-symbols-outlined text-[20px] ${isCorrect ? 'text-[#005934] dark:text-emerald-400' : 'text-[#ba1a1a] dark:text-red-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {isCorrect ? 'done_all' : 'gavel'}
                                      </span>
                                      <span className={`font-black text-xs uppercase tracking-widest ${isCorrect ? 'text-[#005934] dark:text-emerald-400' : 'text-[#ba1a1a] dark:text-red-400'}`}>
                                        {isCorrect ? 'Spot On!' : 'Correction Context'}
                                      </span>
                                    </div>
                                    <p className="text-[#434653] dark:text-slate-300 text-[14px] leading-relaxed font-medium pl-8">{q.explanation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 md:px-8 md:py-6 bg-[#f6f3f2] dark:bg-slate-800/80 border-t border-[#f0eded] dark:border-slate-800 rounded-b-[32px] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                {quiz ? (
                  <>
                    <div className="flex flex-col">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#434653] dark:text-slate-400">Progress</p>
                      <p className="text-2xl font-black font-headline mt-1 text-[#00366c] dark:text-sky-400 tracking-tight">
                        {answeredCount} / <span className="text-[#005934] dark:text-emerald-400">{quiz.questions.length}</span> Answered
                      </p>
                    </div>
                    {!submitted ? (
                      <button
                        onClick={() => handleSubmit(false)}
                        className="px-8 py-4 bg-gradient-to-tr from-[#005934] to-[#008a50] dark:from-emerald-600 dark:to-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all outline-none flex items-center justify-center gap-2 group">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                        Submit & See Results
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowResults(true)}
                        className="px-8 py-4 bg-gradient-to-tr from-[#00366c] to-[#004d95] dark:from-sky-500 dark:to-blue-600 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all outline-none flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                        View Results
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-[#737784] dark:text-slate-500">
                    <span className="text-xs font-bold">Configure your quiz on the left to get started.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default QuizGeneratorPage;
