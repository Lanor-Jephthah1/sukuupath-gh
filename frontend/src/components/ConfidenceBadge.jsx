import React from 'react';

/**
 * ConfidenceBadge — shows High / Moderate / Low confidence label on any AI output.
 * Props:
 *   confidence: "high" | "moderate" | "low"
 *   size: "sm" | "md" (default "sm")
 */
const ConfidenceBadge = ({ confidence = 'high', size = 'sm' }) => {
  const cfg = {
    high: {
      label: 'High Confidence',
      icon: 'verified',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    moderate: {
      label: 'Moderate Confidence',
      icon: 'info',
      pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
      dot: 'bg-amber-400',
    },
    low: {
      label: 'Low Confidence',
      icon: 'warning',
      pill: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
      dot: 'bg-red-500 animate-pulse',
    },
  };

  const c = cfg[confidence] || cfg.high;
  const textSize = size === 'md' ? 'text-[12px]' : 'text-[10px]';
  const iconSize = size === 'md' ? 'text-[15px]' : 'text-[13px]';
  const padSize = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 ${padSize} rounded-full border font-bold uppercase tracking-widest ${textSize} ${c.pill} select-none`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      <span className={`material-symbols-outlined ${iconSize}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {c.icon}
      </span>
      {c.label}
    </span>
  );
};

export default ConfidenceBadge;
