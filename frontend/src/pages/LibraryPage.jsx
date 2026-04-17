import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLibrary, removeLibraryItem } from '../utils/studyLibrary';
import ThemeToggle from '../components/ThemeToggle';
import { useAppTheme } from '../hooks/useAppTheme';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Utility functions extracted outside to prevent re-instantiation on renders
const getIconForType = (type) => {
  switch(type) {
    case 'documents': return { icon: 'description', color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' };
    case 'chats': return { icon: 'chat', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' };
    case 'quizzes': return { icon: 'grading', color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' };
    case 'summaries': return { icon: 'subject', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' };
    default: return { icon: 'insert_drive_file', color: 'text-slate-500 bg-slate-50 dark:bg-slate-500/10' };
  }
};

const stripMarkdown = (text) => {
    if(!text) return '';
    return text.replace(/[*_#~`+]/g, '').trim();
};

const LibraryPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppTheme();
  
  // LAZY INITIALIZATION: Pass a function so getLibrary() (which maps huge JSON strings) only processes ONCE strictly on mount!
  const [library, setLibrary] = useState(() => getLibrary());
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingItem, setViewingItem] = useState(null);

  const fetchLibrary = useCallback(() => {
    setLibrary(getLibrary());
  }, []);

  const handleDelete = useCallback((e, type, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this study item permanently?")) {
      removeLibraryItem(type, id);
      fetchLibrary();
    }
  }, [fetchLibrary]);

  const handleCopy = useCallback((text) => {
      navigator.clipboard.writeText(text);
      alert("Content copied to clipboard!");
  }, []);

  const handleDownload = useCallback((item) => {
      const text = item.content || item.response || (item.questions ? JSON.stringify(item.questions, null, 2) : "No textual content available.");
      const blob = new Blob([text], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${item.title || 'SukuuPath_Export'}.txt`;
      link.click();
  }, []);

  // MEMOIZATION: Cache the flat array structures so React doesn't annihilate FPS by mapping Arrays on every component re-render
  const displayItems = useMemo(() => {
    let items = [];
    if (activeTab === 'all') {
      items = [
        ...(library.documents || []).map(item => ({ ...item, type: 'documents' })),
        ...(library.chats || []).map(item => ({ ...item, type: 'chats' })),
        ...(library.quizzes || []).map(item => ({ ...item, type: 'quizzes' })),
        ...(library.summaries || []).map(item => ({ ...item, type: 'summaries' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      items = (library[activeTab] || []).map(i => ({...i, type: activeTab}));
    }

    if (searchQuery.trim()) {
      const qs = searchQuery.toLowerCase();
      items = items.filter(i => 
          (i.title?.toLowerCase() || '').includes(qs) || 
          (i.response?.toLowerCase() || '').includes(qs) ||
          (i.content?.toLowerCase() || '').includes(qs)
      );
    }
    return items;
  }, [library, activeTab, searchQuery]);

  const tabs = [
    { id: 'all', label: 'All Files', icon: 'grid_view' },
    { id: 'documents', label: 'Documents', icon: 'folder' },
    { id: 'chats', label: 'AI Chats', icon: 'psychology' },
    { id: 'quizzes', label: 'Quizzes', icon: 'quiz' },
    { id: 'summaries', label: 'Summaries', icon: 'summarize' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#121212] dark:text-slate-100 font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center w-full px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-fade-in-up dark:bg-slate-950/80 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/student-dashboard')}
            className="flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight font-headline dark:text-white">Workspace Library</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 transition-shadow focus-within:ring-2 focus-within:ring-blue-500/20 dark:bg-slate-900 dark:focus-within:ring-sky-500/20 border border-transparent dark:border-slate-800">
            <span className="material-symbols-outlined text-[18px] text-slate-500">search</span>
            <input 
               className="bg-transparent border-none focus:ring-0 text-sm w-full font-body ml-2 outline-none dark:text-white placeholder:text-slate-400" 
               placeholder="Find in library..." 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
        
        {/* Title and Tabs Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h2 className="text-3xl font-headline font-extrabold text-slate-900 dark:text-white tracking-tight">Your Assets</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Manage all your generated study materials, exported notes, and deep chats.</p>
           </div>

           {/* Tabs */}
           <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:px-0 md:pb-0 md:mx-0 hide-scrollbar">
             {tabs.map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex whitespace-nowrap items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${
                   activeTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900 dark:border-white'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-[#212121] dark:text-slate-300 dark:border-slate-800 dark:hover:bg-[#2f2f2f]'
                 }`}
               >
                 <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>
                   {tab.icon}
                 </span>
                 {tab.label}
               </button>
             ))}
           </div>
        </div>

        {/* Content Grid */}
        <div className="min-h-[400px]">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200 border-dashed rounded-[32px] dark:bg-[#212121] dark:border-slate-800 w-full mt-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 dark:bg-[#2f2f2f]">
                 <span className="material-symbols-outlined text-[40px] text-slate-400">package_2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">It's a bit empty here!</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                You haven't generated or saved any {activeTab === 'all' ? 'files' : activeTab} yet. Use the SukuuPath AI tools to start creating!
              </p>
              <button 
                onClick={() => navigate('/student-dashboard')}
                className="mt-8 px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20"
              >
                Go to Dashboard Hub
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayItems.map((item) => {
                const typeInfo = getIconForType(item.type);
                return (
                  <div key={item.id} onClick={() => setViewingItem(item)} className="group relative bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-[#212121] dark:border-slate-800 cursor-pointer flex flex-col h-[220px]">
                    
                    {/* Floating Delete Button */}
                    <button 
                      onClick={(e) => handleDelete(e, item.type, item.id)}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 dark:bg-[#2f2f2f] dark:hover:bg-slate-700"
                      title="Permanently Delete"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{typeInfo.icon}</span>
                      </div>
                      <div className="pt-1 pr-6 flex-1 min-w-0">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
                           {item.type}
                         </span>
                         <h4 className="font-bold text-[15px] leading-snug text-slate-900 dark:text-white truncate" title={item.title}>
                           {item.title || 'Untitled Workspace'}
                         </h4>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                       <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                         {stripMarkdown(item.response || item.content || item.prompt) || (item.questions ? `${item.questions.length} Questions Generated` : 'Stored safely in local cache.')}
                       </p>
                       <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent dark:from-[#212121]"></div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors">arrow_forward</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Document/Raw Content Viewer Modal */}
      {viewingItem && (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in" onClick={() => setViewingItem(null)}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90dvh] rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
               {/* Modal Header */}
               <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0 gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                     <div className={`w-12 h-12 rounded-xl hidden sm:flex items-center justify-center shrink-0 ${getIconForType(viewingItem.type).color}`}>
                        <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>{getIconForType(viewingItem.type).icon}</span>
                     </div>
                     <div className="min-w-0 flex-1">
                        <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white truncate">{viewingItem.title || 'Untitled'}</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{viewingItem.type} • {new Date(viewingItem.createdAt).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                     <button onClick={() => handleDownload(viewingItem)} className="p-2 sm:px-4 sm:py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-sky-400 dark:bg-sky-400/10 dark:hover:bg-sky-400/20 rounded-xl font-bold flex items-center gap-2 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span className="hidden sm:inline">Export</span>
                     </button>
                     <button onClick={() => handleCopy(viewingItem.content || viewingItem.response || '')} className="p-2 sm:px-4 sm:py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold flex items-center gap-2 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                     </button>
                     <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                     <button onClick={() => setViewingItem(null)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[24px]">close</span>
                     </button>
                  </div>
               </div>

               {/* Modal Content Scroll Area */}
               <div className="flex-1 overflow-y-auto p-6 sm:p-8 hide-scrollbar bg-[#fdfdfd] dark:bg-slate-900 relative">
                  {viewingItem.type === 'documents' ? (
                     <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {viewingItem.content || viewingItem.response}
                     </div>
                  ) : (viewingItem.content || viewingItem.response) ? (
                     <div className="prose prose-slate dark:prose-invert max-w-none w-full font-sans">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                           {viewingItem.content || viewingItem.response}
                        </ReactMarkdown>
                     </div>
                  ) : viewingItem.questions ? (
                     <div className="space-y-6">
                        {viewingItem.questions.map((q, i) => (
                           <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="font-extrabold text-slate-900 dark:text-white mb-4 text-lg">Question {i + 1}: {q.question}</p>
                              <div className="space-y-2">
                                 {q.options.map((opt, j) => (
                                    <div key={j} className={`p-3 rounded-xl border-2 font-semibold ${q.answer_index === j ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-400' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'}`}>
                                       {String.fromCharCode(65 + j)}. {opt}
                                    </div>
                                 ))}
                              </div>
                              <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-200">Explanation:</strong> {q.explanation}</p>
                           </div>
                        ))}
                     </div>
                  ) : viewingItem.messages ? (
                     <div className="space-y-6">
                         {viewingItem.messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                               <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 px-2">{msg.role === 'user' ? 'You' : 'SukuuPath AI'}</span>
                               <div className={`p-4 max-w-[85%] rounded-2xl font-medium shadow-sm ${msg.role === 'user' ? 'bg-[#00366c] text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-700'}`}>
                                  {msg.content}
                               </div>
                            </div>
                         ))}
                     </div>
                  ) : (
                     <div className="flex h-full items-center justify-center text-slate-400 font-bold">No preview available for this item.</div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LibraryPage;
