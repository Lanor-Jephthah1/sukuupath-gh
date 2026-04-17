import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLibraryItem } from '../utils/studyLibrary';
import StudentLayout from '../components/StudentLayout';

const SimplifyEnglishScreen = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [options, setOptions] = useState({ exactMeaning: false, makeShorter: true, revisionReady: false });
  const [readingLevel, setReadingLevel] = useState('Intermediate');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimplify = async () => {
    if(!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          reading_level: readingLevel,
          exact_meaning: options.exactMeaning,
          make_shorter: options.makeShorter,
          revision_ready: options.revisionReady
        })
      });
      if(response.ok) {
        const data = await response.json();
        setOutputText(data.simplified_text);
      } else {
        setOutputText("Error connecting to AI processor.");
      }
    } catch(err) {
      setOutputText("Network error processing simplification.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (key) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSaveSummary = () => {
    if (!outputText.trim()) return;
    addLibraryItem('summaries', {
      title: `Simplified ${readingLevel} notes`,
      content: outputText,
      source: inputText,
    });
    navigate('/library');
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in-up">
        
        {/* Hero Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b1b1c] dark:text-white mb-2 tracking-tight font-headline">Simplify English</h1>
          <p className="text-[#434653] dark:text-slate-400 text-[15px] max-w-2xl leading-relaxed font-medium">
              Transform complex academic literature, dense reports, or historical texts into clear, accessible Ghanaian English without losing the core meaning.
          </p>
        </div>

        {/* Bento Layout Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Control Panel & Input */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Configuration Bar */}
            <div className="bg-[#f6f3f2] dark:bg-slate-900 border border-transparent dark:border-slate-800 p-5 md:p-6 rounded-[24px] flex flex-wrap items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#434653] dark:text-slate-400">Reading Level</label>
                <div className="flex gap-2 flex-wrap">
                  {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                    <button 
                      key={lvl}
                      onClick={() => setReadingLevel(lvl)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${readingLevel === lvl ? 'bg-[#ffbf2e] text-[#6e4f00] dark:bg-amber-500 dark:text-amber-950 scale-105' : 'bg-white dark:bg-slate-800 text-[#1b1b1c] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-10 w-[1px] bg-[#c3c6d5]/50 dark:bg-slate-700 hidden sm:block"></div>
              <div className="flex flex-wrap gap-4">
                 {[
                   { id: 'exactMeaning', label: 'Exact Meaning' },
                   { id: 'makeShorter', label: 'Make it Shorter' },
                   { id: 'revisionReady', label: 'Revision Ready' }
                 ].map(opt => (
                   <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
                     <input 
                       checked={options[opt.id]} 
                       onChange={() => toggleOption(opt.id)} 
                       className="w-5 h-5 rounded border-[#c3c6d5] dark:border-slate-600 text-[#00366c] dark:text-sky-500 focus:ring-[#00366c]/20" 
                       type="checkbox"
                     />
                     <span className="text-sm font-semibold text-[#434653] dark:text-slate-400 group-hover:text-[#1b1b1c] dark:group-hover:text-white transition-colors">{opt.label}</span>
                   </label>
                 ))}
              </div>
            </div>

            {/* Main Text Area */}
            <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#00366c] to-[#004d95] dark:from-sky-500 dark:to-blue-600 rounded-[32px] blur-[8px] opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 shadow-sm border border-[#c3c6d5]/40 dark:border-slate-800 flex flex-col min-h-[400px]">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#434653] dark:text-slate-400 mb-4">Original Text</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full flex-1 bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-[#1b1b1c] dark:text-white placeholder:text-[#737784]/60 dark:placeholder:text-slate-600 resize-none outline-none" 
                  placeholder="Paste the complex text you want to simplify here... (e.g., academic journals, legal documents, or Shakespearean English)"
                ></textarea>
                <div className="mt-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <span className="text-xs text-[#434653] dark:text-slate-400 font-bold tracking-widest">
                    {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} Words | Approx. {Math.max(1, Math.ceil(inputText.length / 1000))}m Read
                  </span>
                  <button 
                    onClick={handleSimplify}
                    disabled={isProcessing}
                    className="px-8 py-3.5 bg-gradient-to-br from-[#00366c] to-[#004d95] dark:from-sky-600 dark:to-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isProcessing ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                       <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                    )}
                    {isProcessing ? 'Simplifying...' : 'Simplify Now'}
                  </button>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Comparison & Insight Panel */}
          <div className="xl:col-span-5 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
            {/* The Insight Card (AI Output) */}
            <div className="relative overflow-hidden bg-[#005934] dark:bg-emerald-900 rounded-[32px] p-6 lg:p-8 text-white shadow-lg">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">auto_awesome</span>
              </div>
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#003f23] dark:bg-emerald-950 p-2.5 rounded-xl border border-emerald-800/50">
                      <span className="material-symbols-outlined text-[#9df5bd] dark:text-emerald-400" style={{fontVariationSettings: "'FILL' 1"}}>lightbulb</span>
                    </div>
                    <span className="font-extrabold font-headline text-lg tracking-tight">Simplified Result</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(outputText)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors active:scale-90" title="Copy">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                    <button onClick={handleSaveSummary} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors active:scale-90" title="Save to Library">
                      <span className="material-symbols-outlined text-sm">bookmark</span>
                    </button>
                  </div>
                </div>
                
                <div className="min-h-[160px] mb-8">
                   {isProcessing ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-[#9df5bd]/30 border-t-[#9df5bd] rounded-full animate-spin"></div>
                     </div>
                   ) : outputText ? (
                     <p className="text-xl leading-relaxed font-semibold text-[#9df5bd] dark:text-emerald-300">
                        {outputText}
                     </p>
                   ) : (
                     <p className="text-xl leading-relaxed font-semibold opacity-40 italic">
                        The simplified summary will appear here once you hit generate.
                     </p>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/10 backdrop-blur-md p-4 rounded-[16px] border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold mb-1">Vocabulary Shift</p>
                    <p className="text-sm font-black text-white">{isProcessing ? '...' : outputText ? 'Complex → Direct' : 'N/A'}</p>
                  </div>
                  <div className="bg-black/10 backdrop-blur-md p-4 rounded-[16px] border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold mb-1">Readability Score</p>
                    <p className="text-sm font-black text-white">{isProcessing ? '...' : outputText ? '85/100 (Easy)' : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revision Helper Card */}
            <div className="bg-[#f6f3f2] dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 border border-transparent dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#00366c]/10 dark:bg-sky-500/10 text-[#00366c] dark:text-sky-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1"}}>auto_stories</span>
                </div>
                <h3 className="font-extrabold text-[#1b1b1c] dark:text-white font-headline text-lg">Revision Breakdown</h3>
              </div>
              
              <ul className="space-y-5">
                {[1, 2, 3].map((num) => (
                  <li key={num} className="flex items-start gap-4 group">
                    <div className="w-2 h-2 rounded-full bg-[#ffbf2e] dark:bg-amber-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                    <div>
                      <p className="text-[10px] font-bold text-[#434653] dark:text-slate-400 uppercase tracking-widest mb-1">Key Fact {num}</p>
                      {isProcessing ? (
                         <div className="h-4 bg-[#c3c6d5]/40 dark:bg-slate-700 w-48 rounded animate-pulse"></div>
                      ) : (
                         <p className="text-[13px] font-semibold text-[#1b1b1c] dark:text-slate-300">Detailed conceptual breakdown waiting for AI processing to complete.</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              
              <button onClick={() => navigate('/translation')} className="w-full mt-8 py-3.5 border-2 border-[#00366c]/20 dark:border-sky-500/30 text-[#00366c] dark:text-sky-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#00366c] hover:text-white dark:hover:bg-sky-500 dark:hover:text-slate-900 transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]">translate</span>
                Translate to Twi / Ga / Ewe
              </button>
            </div>

          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default SimplifyEnglishScreen;
