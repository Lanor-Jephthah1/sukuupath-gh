import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLibrary } from '../utils/studyLibrary';
import StudentLayout from '../components/StudentLayout';

const StudyNotesPage = () => {
    const navigate = useNavigate();
    const [allNotes, setAllNotes] = useState([]);
    const [primaryNote, setPrimaryNote] = useState(null);
    const [subNotes, setSubNotes] = useState([]);

    useEffect(() => {
        const library = getLibrary();
        const combined = [...(library.notes || []), ...(library.summaries || [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAllNotes(combined);
        if (combined.length > 0) {
            setPrimaryNote(combined[0]);
            setSubNotes(combined.slice(1, 5)); // Next 4 for the smaller cards
        }
    }, []);

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins <= 0 ? 'Just now' : `${mins}m ago`}`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <StudentLayout>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fade-in-up">
                
                {/* Header Section */}
                <section className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1b1b1c] dark:text-white mb-2 font-headline">Scholarly Workspace</h1>
                    <p className="text-[#434653] dark:text-slate-400 max-w-2xl text-[15px] font-medium leading-relaxed">
                        Your curated space for academic excellence. Refine your understanding with AI-enhanced notes and interactive flashcards.
                    </p>
                </section>

                {/* Tab Switcher & Global Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="inline-flex p-1.5 bg-[#f0eded] dark:bg-slate-900 rounded-xl shadow-sm">
                        <button className="px-8 py-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-[#00366c] dark:text-sky-400 font-bold transition-all text-sm">Notes Focus</button>
                        <button className="px-8 py-2.5 rounded-lg text-[#737784] dark:text-slate-500 font-medium hover:text-[#1b1b1c] dark:hover:text-white transition-all text-sm">Flashcards</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                          onClick={() => navigate('/simplify')}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#00366c] to-[#004d95] dark:from-sky-500 dark:to-blue-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all outline-none"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            <span>Create Summary</span>
                        </button>
                        <button className="p-3 bg-[#f0eded] dark:bg-slate-800 text-[#00366c] dark:text-sky-400 rounded-xl hover:bg-[#e5e2e1] dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95">
                            <span className="material-symbols-outlined text-[18px]">quiz</span>
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-[#ffbf2e] dark:bg-amber-500 text-[#6e4f00] dark:text-amber-950 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">filter_list</span>
                        <span>Filters</span>
                    </div>
                    <select className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-full px-5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#00366c] dark:focus:ring-sky-500 shadow-sm cursor-pointer outline-none text-[#1b1b1c] dark:text-slate-200">
                        <option>All Subjects</option>
                        <option>History of Ghana</option>
                        <option>Mathematics</option>
                        <option>Economics</option>
                    </select>
                    <select className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-full px-5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#00366c] dark:focus:ring-sky-500 shadow-sm cursor-pointer outline-none text-[#1b1b1c] dark:text-slate-200">
                        <option>Sort: Most Recent</option>
                        <option>Sort: Oldest First</option>
                        <option>Sort: Alphabetical</option>
                    </select>
                    <div className="ml-auto hidden lg:flex items-center gap-2 text-[#737784] dark:text-slate-500">
                        <span className="material-symbols-outlined text-sm">info</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{allNotes.length} Active Modules</span>
                    </div>
                </div>

                {/* Content Area: Bento Grid */}
                {allNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-[#c3c6d5] dark:border-slate-700">
                         <span className="material-symbols-outlined text-6xl text-[#dcd9d9] dark:text-slate-700 mb-4">menu_book</span>
                         <h3 className="text-xl font-headline font-bold text-[#434653] dark:text-slate-400">Your Scholarly Vault is Empty</h3>
                         <p className="text-sm font-medium text-[#737784] dark:text-slate-500 mt-2 max-w-sm text-center">Use the Translation Workspace or Simplify English app to generate your first active study module.</p>
                         <button onClick={() => navigate('/library')} className="mt-6 font-bold text-[#00366c] dark:text-sky-400 px-6 py-2 bg-blue-50 dark:bg-sky-500/10 rounded-full">Explore Library</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Note Card: Primary Feature (Most Recent Note) */}
                        {primaryNote && (
                            <article className="lg:col-span-2 group relative bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent dark:border-slate-800 flex flex-col">
                                <div className="aspect-[21/9] w-full overflow-hidden bg-gradient-to-tr from-[#00366c] to-[#004d95] dark:from-slate-800 dark:to-slate-800/50 relative">
                                    <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="material-symbols-outlined text-[100px] text-white/10" style={{fontVariationSettings: "'FILL' 1"}}>import_contacts</span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-4 py-1.5 bg-[#d5e3ff] text-[#001b3c] dark:bg-sky-500/20 dark:text-sky-300 text-[10px] font-black rounded-full uppercase tracking-widest shadow-inner">
                                            {primaryNote.id.includes('summar') ? 'AI Summary' : 'AI Translation'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button className="text-[#a8c8ff] hover:text-[#00366c] dark:text-slate-500 dark:hover:text-red-400 transition-colors material-symbols-outlined text-[20px]">favorite</button>
                                            <button className="text-[#a8c8ff] hover:text-[#00366c] dark:text-slate-500 dark:hover:text-white transition-colors material-symbols-outlined text-[20px]">ios_share</button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-[#00366c] dark:text-white mb-3 font-headline leading-tight">{primaryNote.title}</h3>
                                    <p className="text-[15px] font-medium text-[#434653] dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">
                                        {primaryNote.content || "Detailed scholarly review mapped successfully to your user session history."}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#f0eded] dark:border-slate-800">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-[#ffbf2e] dark:bg-amber-500 flex items-center justify-center text-[9px] font-black text-[#6e4f00] dark:text-amber-950">AI</div>
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-[#d5e3ff] dark:bg-sky-500/80 flex items-center justify-center text-[9px] font-black text-[#00366c] dark:text-white uppercase">SYS</div>
                                        </div>
                                        <button onClick={() => navigate('/library')} className="text-[#00366c] dark:text-sky-400 font-bold text-[13px] flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                                            View Full Analysis
                                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )}

                        {/* AI Insight Card Component */}
                        <article className="bg-[#005934] dark:bg-emerald-950 rounded-[28px] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-md">
                            <div className="relative z-10 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-6 text-[#9df5bd] dark:text-emerald-300">
                                    <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">AI Generated Insight</span>
                                </div>
                                <h3 className="text-[20px] font-black mb-4 font-headline leading-snug">Quick Recap: Key Syntactic Concepts</h3>
                                <ul className="space-y-4 text-[13px] font-semibold text-[#81d9a2] dark:text-emerald-200/80 mt-2">
                                    <li className="flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-[#ffbf2e] dark:text-amber-400 text-[18px]">check_circle</span>
                                        Focus on the morphological rules isolated during your latest {primaryNote ? (primaryNote.id.includes('sum') ? 'summary' : 'translation') : 'session'}.
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-[#ffbf2e] dark:text-amber-400 text-[18px]">check_circle</span>
                                        Synthesize definitions alongside direct application matrices.
                                    </li>
                                </ul>
                            </div>
                            <button onClick={() => navigate('/quiz')} className="relative z-10 mt-8 py-3.5 w-full bg-white/10 hover:bg-white/20 dark:hover:bg-emerald-800/50 backdrop-blur-md rounded-xl font-bold transition-all border border-white/20 dark:border-white/10 active:scale-95 text-[13px] tracking-wide focus:outline-none">
                                Quiz me on this
                            </button>
                            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#9df5bd]/10 dark:bg-emerald-500/20 rounded-full blur-[40px] pointer-events-none mix-blend-screen"></div>
                        </article>

                        {/* Smaller Note Cards Mapping */}
                        {subNotes.map((note) => (
                            <article key={note.id} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] shadow-sm border border-transparent dark:border-slate-800 flex flex-col hover:border-[#00366c]/30 dark:hover:border-sky-500/30 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2.5 py-1 bg-[#f0eded] dark:bg-slate-800 text-[#434653] dark:text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-widest">{note.id.split('-')[0]}</span>
                                    <span className="text-[10px] font-black text-[#737784] dark:text-slate-500 uppercase tracking-wider">{timeAgo(note.createdAt)}</span>
                                </div>
                                <h4 className="text-[17px] font-black text-[#1b1b1c] dark:text-white mb-2 font-headline group-hover:text-[#00366c] dark:group-hover:text-sky-300 transition-colors leading-tight line-clamp-2">{note.title}</h4>
                                <p className="text-[13px] text-[#434653] dark:text-slate-400 font-medium line-clamp-2 mb-5 leading-relaxed">{note.content || note.source || "Structured academic framework auto-generated by your Scholar Engine."}</p>
                                <div className="mt-auto pt-4 border-t border-[#f0eded] dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-[11px] font-black text-[#00366c] dark:text-sky-400 tracking-wider">0 Flashcards</span>
                                    <button className="material-symbols-outlined text-[#c3c6d5] dark:text-slate-600 hover:text-[#ffbf2e] dark:hover:text-amber-400 transition-colors text-[18px]">bookmark</button>
                                </div>
                            </article>
                        ))}

                        {/* Flashcard Deck Selector (Dummy Fill for Grid parity) */}
                        {subNotes.length < 2 && (
                            <div className="bg-gradient-to-br from-[#00366c] to-[#004d95] dark:from-sky-900 dark:to-slate-800 p-8 rounded-[24px] text-white shadow-md flex flex-col justify-between border border-[#004d95] dark:border-sky-800 min-h-[220px]">
                                <div>
                                    <h4 className="text-xl font-black font-headline mb-2 text-white">Active Practice</h4>
                                    <p className="text-[13px] text-white/80 font-medium leading-relaxed max-w-[90%]">Boost your retention with spaced repetition. High success rate mapped for current academic modules.</p>
                                </div>
                                <div className="mt-8 flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-black font-headline text-white leading-none tracking-tighter">84%</span>
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest mt-1 text-white/70">Last score</span>
                                    </div>
                                    <button onClick={() => navigate('/quiz')} className="bg-[#ffbf2e] dark:bg-amber-500 text-[#6e4f00] dark:text-amber-950 px-6 py-3 rounded-xl font-black text-[13px] uppercase tracking-wider shadow-sm hover:scale-105 transition-transform outline-none cursor-pointer">
                                        Start Now
                                    </button>
                                </div>
                            </div>
                        )}
                        
                    </div>
                )}
            </div>
            
            {/* FAB Shortcut */}
            <button onClick={() => navigate('/ai-chat')} className="fixed bottom-24 md:bottom-12 right-6 w-14 h-14 md:w-16 md:h-16 bg-[#00366c] dark:bg-sky-500 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-40 outline-none">
                <span className="material-symbols-outlined text-2xl md:text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>auto_fix_high</span>
            </button>
            <div className="h-10"></div>
        </StudentLayout>
    );
};

export default StudyNotesPage;
