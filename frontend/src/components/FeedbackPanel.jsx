import React, { useState } from 'react';
import ConfidenceBadge from './ConfidenceBadge';

/**
 * FeedbackPanel — reusable trust feedback widget shown under any AI output.
 * Props:
 *   outputType: "chat" | "translation" | "summary" | "quiz" | "simplify"
 *   contentPreview: string — first ~200 chars of the AI output (for logging)
 *   confidence: "high" | "moderate" | "low"
 *   language: string — output language (English / Twi / Ewe / Ga / Fante)
 *   showBadge: boolean — whether to show the ConfidenceBadge inline (default true)
 */

const FEEDBACK_STORAGE_KEY = 'aiFeedbackLog';

const FEEDBACK_OPTIONS = [
  { key: 'Correct',                  icon: 'check_circle',    label: 'Correct',               color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400' },
  { key: 'Unclear',                  icon: 'help',            label: 'Unclear',               color: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400' },
  { key: 'Wrong',                    icon: 'cancel',          label: 'Wrong',                 color: 'hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-500/10 dark:hover:text-red-400' },
  { key: 'Offensive',                icon: 'flag',            label: 'Offensive',             color: 'hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-400' },
  { key: 'Culturally Inappropriate', icon: 'public_off',      label: 'Culturally Inappropriate', color: 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-400' },
];

function saveToLocalStorage(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    existing.unshift({ ...entry, timestamp: new Date().toISOString() });
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing.slice(0, 500)));
  } catch {}
}

async function postToBackend(entry) {
  try {
    const acc = JSON.parse(localStorage.getItem('userAccount') || '{}');
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        output_type: entry.outputType,
        feedback_type: entry.feedbackType,
        language: entry.language || 'English',
        confidence: entry.confidence || 'high',
        content_preview: entry.contentPreview || '',
        user_id: acc.id || null,
      }),
    });
  } catch {}
}

const FeedbackPanel = ({
  outputType = 'chat',
  contentPreview = '',
  confidence = 'high',
  language = 'English',
  showBadge = true,
}) => {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = async (key) => {
    if (submitted) return;
    setSelected(key);
    setSubmitted(true);
    const entry = { outputType, feedbackType: key, confidence, language, contentPreview };
    saveToLocalStorage(entry);
    await postToBackend(entry);
  };

  const isLow = confidence === 'low';

  return (
    <div className="mt-3 space-y-2">
      {/* Confidence badge row */}
      {showBadge && (
        <div className="flex items-center gap-2 flex-wrap">
          <ConfidenceBadge confidence={confidence} />
        </div>
      )}

      {/* Human review callout — only when low */}
      {isLow && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400">
          <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>person_alert</span>
          <p className="text-[11px] font-semibold leading-snug">
            <strong className="font-black uppercase tracking-wide">Human Review Recommended</strong>
            <br />This output has low confidence. We suggest verifying with a lecturer or native speaker before relying on it.
          </p>
        </div>
      )}

      {/* Feedback buttons */}
      {!submitted ? (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">Rate output:</span>
          {FEEDBACK_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleFeedback(opt.key)}
              title={opt.key}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-all active:scale-95 ${opt.color}`}
            >
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-1">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Thanks for your feedback! Marked as <strong className="ml-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded">{selected}</strong>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
