import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postJson } from '../utils/api';
import { addLibraryItem, getLibrary, removeLibraryItem, updateLibraryItem } from '../utils/studyLibrary';
import FeedbackPanel from '../components/FeedbackPanel';

// Lightweight Markdown to HTML mapping for bold strings
const formatMarkdown = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-700 dark:text-slate-200">{part.slice(2, -2)}</strong>;
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>;
  });
};

const AIChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState('ENGLISH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [chatLibrary, setChatLibrary] = useState(() => getLibrary().chats || []);
  const [documents, setDocuments] = useState(() => getLibrary().documents || []);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeChatId, setActiveChatId] = useState(() => getLibrary().chats?.[0]?.id || null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const state = location.state || {};
    if (state.prompt) setPrompt(state.prompt);
    if (state.context) setContext(state.context);
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, loading, chatLibrary]);

  const activeChat = useMemo(() => {
    return chatLibrary.find((item) => item.id === activeChatId) || null;
  }, [chatLibrary, activeChatId]);

  const messages = useMemo(() => activeChat?.messages || [], [activeChat]);

  const syncChats = () => {
    const nextChats = getLibrary().chats || [];
    setChatLibrary(nextChats);
    if (!nextChats.some((item) => item.id === activeChatId)) {
      setActiveChatId(nextChats[0]?.id || null);
    }
  };

  const createNewChat = (seedPrompt = '', seedContext = '') => {
    if (!seedPrompt && activeChat && (activeChat.messages || []).length === 0) {
       setTimeout(() => inputRef.current?.focus(), 100);
       return;
    }
    const title = seedPrompt ? seedPrompt.slice(0, 52) : 'New Session';
    const entry = addLibraryItem('chats', {
      title,
      context: seedContext,
      messages: [],
      prompt: seedPrompt,
      response: '',
    });
    syncChats();
    setActiveChatId(entry.id);
    setPrompt(seedPrompt);
    setContext(seedContext);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSelectChat = (chat) => {
    setActiveChatId(chat.id);
    setContext(chat.context || '');
    setPrompt('');
    setError('');
    setIsChatMenuOpen(false); // Auto close on mobile
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    removeLibraryItem('chats', id);
    syncChats();
    if (activeChatId === id) {
        setActiveChatId(null);
        setContext('');
        setPrompt('');
    }
  };

  const removeActiveDoc = () => {
    if (activeChat) {
      updateLibraryItem('chats', activeChatId, { ...activeChat, context: '', attachedDocTitle: null });
      setContext('');
      syncChats();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = ''; // Reset input
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        body: formData,
      });
      
      let data = null;
      try { data = await res.json(); } catch(e) {}
      
      if (!res.ok) throw new Error(data?.detail || 'Extraction failed securely on server.');
      
      const newDoc = { title: file.name, content: data.text || '' };
      addLibraryItem('documents', newDoc);
      setDocuments(getLibrary().documents || []);
      setSelectedDoc(newDoc);
      setShowDocs(false);
      setError('');
    } catch (err) {
      setError(err.message || 'File could not be parsed. Please verify it is a valid text, DOC, PPT, or PDF document.');
    }
  };

  const handleSend = async (overridePrompt) => {
    let messageText = (overridePrompt ?? prompt).trim();
    if (!messageText) return;

    let newContext = context;
    let attachedTitle = activeChat?.attachedDocTitle || '';

    if (selectedDoc && !overridePrompt) {
       // Secretly route text to the invisible context engine instead of UI chat logs!
       newContext = (context ? context + '\n\n' : '') + `[SYSTEM NOTICE: The user has attached a document named "${selectedDoc.title}". The raw text of this document has ALREADY been extracted by the system and is provided below. Do NOT say you cannot read PDFs. You MUST read the text provided below and answer the user.]\n\n=== DOCUMENT TEXT START ===\n${selectedDoc.content}\n=== DOCUMENT TEXT END ===`;
       attachedTitle = selectedDoc.title;
       setContext(newContext);
       setSelectedDoc(null);
    }

    let chatId = activeChatId;
    if (!chatId) {
      const entry = addLibraryItem('chats', { title: 'New Session', context: newContext, attachedDocTitle: attachedTitle, messages: [], prompt: messageText, response: '' });
      chatId = entry.id;
      setActiveChatId(entry.id);
    }

    const current = (getLibrary().chats || []).find((item) => item.id === chatId);
    const isFirstMessage = (current?.messages || []).length === 0;
    const historyPayload = current?.messages || []; 
    
    const nextMessages = [...historyPayload, { role: 'user', content: messageText, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }];

    updateLibraryItem('chats', chatId, { title: current?.title || 'New Session', context: newContext, attachedDocTitle: attachedTitle, messages: nextMessages, prompt: messageText });
    syncChats();

    setLoading(true);
    setError('');
    setPrompt('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      // Build messages array expected by /api/ai/chat
      const systemContent = language !== 'ENGLISH'
        ? `You are an academic AI assistant named SukuuPath AI, helping Ghanaian university students. Answer strictly in ${language}.`
        : `You are SukuuPath AI, a helpful academic assistant for Ghanaian university students. Be precise, educational, and encouraging.`;

      // Build the messages list from history + new user message
      const historyMessages = historyPayload.map(m => ({ role: m.role, content: m.content }));
      
      // Prepend context as system message if present
      const contextPrefix = newContext.trim()
        ? `[Context provided by user]:\n${newContext.trim()}\n\n`
        : '';

      const messagesPayload = [
        ...historyMessages,
        { role: 'user', content: contextPrefix + messageText }
      ];

      const data = await postJson('/api/ai/chat', {
        messages: messagesPayload,
        system: systemContent,
      });

      const aiText = data.response || data.message || '';
      const aiConfidence = data.confidence || 'high';

      let aiSummarizedTitle = current?.title;
      if (isFirstMessage) {
         try {
             const titleData = await postJson('/api/ai/chat-title', { prompt: messageText });
             if (titleData?.title) aiSummarizedTitle = titleData.title;
         } catch(e) { }
      }

      updateLibraryItem('chats', chatId, {
        title: aiSummarizedTitle || 'New Session',
        context: newContext,
        attachedDocTitle: attachedTitle,
        response: aiText,
        messages: [...nextMessages, { role: 'assistant', content: aiText, confidence: aiConfidence }],
      });
      syncChats();
    } catch (err) {
      setError(err?.message || String(err) || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* TopNavBar */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-transparent dark:border-slate-800 fixed top-0 left-0 right-0 z-50">
          <nav className="flex justify-between items-center w-full px-6 py-4 lg:px-8">
              <button onClick={() => navigate('/student-dashboard')} className="text-xl font-extrabold text-[#00366c] dark:text-sky-300 font-headline tracking-tight hover:opacity-80 transition-opacity">
                  SukuuPath GH
              </button>
              <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                  <button onClick={() => navigate('/library')} className="font-headline font-extrabold text-[15px] tracking-tight text-slate-500 dark:text-slate-400 hover:text-[#00366c] dark:hover:text-sky-300 transition-colors">Library</button>
                  <button onClick={() => navigate('/student-dashboard')} className="font-headline font-extrabold text-[15px] tracking-tight text-slate-500 dark:text-slate-400 hover:text-[#00366c] dark:hover:text-sky-300 transition-colors">Dashboard</button>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={() => setIsChatMenuOpen(true)} className="lg:hidden p-2 text-[#00366c] dark:text-sky-400 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined">menu_open</span>
                  </button>
                  <button className="hidden sm:block material-symbols-outlined p-2 text-[#00366c] dark:text-sky-400 scale-95 active:scale-90 transition-all">notifications</button>
                  <button className="material-symbols-outlined p-2 text-[#00366c] dark:text-sky-400 scale-95 active:scale-90 transition-all">account_circle</button>
              </div>
          </nav>
      </header>

      <main className="pt-[72px] h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-white dark:bg-slate-950">
          
          {/* Sidebar: Language & Settings (Responsive Drawer) */}
          {isChatMenuOpen && (
              <div className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm" onClick={() => setIsChatMenuOpen(false)}></div>
          )}
          
          <aside className={`fixed lg:static top-0 lg:top-[72px] left-0 bottom-0 w-[280px] sm:w-[320px] lg:w-[280px] bg-[#fdfdfd] dark:bg-slate-900 z-[70] lg:z-0 flex flex-col shrink-0 h-[100dvh] lg:h-[calc(100dvh-72px)] overflow-y-auto hide-scrollbar border-r border-slate-100 py-6 px-4 shadow-[5px_0_15px_rgba(0,0,0,0.02)] transition-transform duration-300 ${isChatMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              
              <div className="flex lg:hidden justify-between items-center mb-6">
                 <h2 className="font-extrabold text-[#00366c] dark:text-sky-400 font-headline text-xl">Chat Settings</h2>
                 <button onClick={() => setIsChatMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg material-symbols-outlined">close</button>
              </div>

              <button 
                onClick={() => createNewChat()} 
                className="w-full bg-[#00366c] text-white dark:bg-sky-500 dark:text-slate-950 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] shadow-sm">
                <span className="material-symbols-outlined">add</span> New Request
              </button>
              
              <div className="bg-[#f6f3f2] dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 rounded-[24px]">
                  <h3 className="font-headline font-extrabold text-[#00366c] dark:text-sky-400 mb-4 text-[15px]">Response Language</h3>
                  <div className="flex flex-wrap gap-2">
                      {['ENGLISH', 'TWI', 'EWE', 'GA'].map(lang => (
                        <button 
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`px-4 py-2 rounded-full font-body text-[11px] font-black tracking-widest transition-all ${
                            language === lang 
                              ? 'bg-[#ffbf2e] text-[#6e4f00] dark:bg-amber-500 dark:text-amber-950 shadow-sm' 
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                  </div>
              </div>

              <div className="bg-[#f6f3f2] dark:bg-slate-900 border border-transparent dark:border-slate-800 p-6 rounded-[24px] flex-1">
                  <h3 className="font-headline font-extrabold text-[#00366c] dark:text-sky-400 mb-4 text-[15px]">Session History</h3>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl mb-3 shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>menu_book</span>
                      <span className="text-[13px] font-bold truncate pr-2 text-slate-800 dark:text-slate-200">{activeChat?.title || 'New Session'}</span>
                  </div>
                  
                  <div className="space-y-1 mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Recent Logs</p>
                    {chatLibrary.map(chat => (
                        <div key={chat.id} className="relative group">
                            <button 
                              onClick={() => handleSelectChat(chat)}
                              className={`w-full text-left px-3 py-2.5 text-[13px] rounded-xl transition-colors flex items-center gap-3 font-medium truncate pr-10 ${chat.id === activeChatId ? 'bg-slate-200 dark:bg-slate-800 text-[#00366c] dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                            >
                                <span className="material-symbols-outlined text-[16px] shrink-0 opacity-60">history</span>
                                <span className="truncate">{chat.title}</span>
                            </button>
                            <button
                               onClick={(e) => handleDeleteChat(e, chat.id)}
                               className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg material-symbols-outlined text-[16px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all border-none"
                            >delete</button>
                        </div>
                    ))}
                  </div>
              </div>
          </aside>

          {/* Chat Canvas Section */}
          <section className="flex-1 flex flex-col h-full relative overflow-hidden">
              
              {/* Header Context */}
              <div className={`mb-4 shrink-0 flex ${messages.length === 0 ? 'justify-between' : 'justify-end'} items-center max-w-3xl mx-auto w-full px-4 md:px-0 mt-6 lg:mt-10 border-b border-transparent`}>
                  {messages.length === 0 && (
                      <div>
                          <h1 className="text-2xl font-headline font-black tracking-tight text-slate-800 dark:text-white">Ask SukuuPath AI</h1>
                      </div>
                  )}
                  {activeChat?.attachedDocTitle && (
                      <div className="bg-[#00366c]/10 text-[#00366c] dark:bg-sky-500/10 dark:text-sky-300 px-3 py-1.5 rounded-lg border border-[#00366c]/20 flex items-center gap-2 text-xs font-bold animate-fade-in shadow-sm">
                         <span className="material-symbols-outlined text-[16px]">attach_file</span>
                         <span className="truncate max-w-[150px]">{activeChat.attachedDocTitle}</span>
                         <button onClick={removeActiveDoc} className="hover:text-red-500 material-symbols-outlined text-[14px] ml-1 transition-colors">close</button>
                      </div>
                  )}
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto pr-4 md:pr-6 pb-40 hide-scrollbar w-full">
                  {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                        <span className="material-symbols-outlined text-[48px] mb-4">forum</span>
                        <p className="font-semibold text-sm">Send a message to ignite the AI.</p>
                      </div>
                  ) : (
                    messages.map((message, idx) => (
                      <div key={idx}>
                         {message.role === 'user' ? (
                            <div className="flex justify-end mb-6 w-full max-w-3xl mx-auto animate-fade-in-up px-4 md:px-0">
                                <div className="max-w-[85%] sm:max-w-[75%] bg-[#f4f4f4] dark:bg-[#2f2f2f] text-[#0d0d0d] dark:text-[#ececec] px-5 py-3 rounded-[24px]">
                                    <p className="text-[15px] font-medium leading-relaxed font-body whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                         ) : (
                            <div className="flex w-full mb-6 max-w-3xl mx-auto animate-fade-in-up px-4 md:px-0">
                                <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex flex-shrink-0 items-center justify-center shadow-sm mt-0.5 bg-white dark:bg-slate-800">
                                    <span className="material-symbols-outlined text-[#00366c] dark:text-sky-400 text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                                </div>
                                <div className="ml-4 flex-1 overflow-hidden">
                                    <span className="text-[13px] font-bold font-headline text-slate-800 dark:text-slate-200 block mb-1">SukuuPath AI</span>
                                    <div className="text-[15px] text-[#0d0d0d] dark:text-[#ececec] leading-[1.7] whitespace-pre-wrap">
                                      {formatMarkdown(message.content)}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3">
                                        <button onClick={() => navigator.clipboard.writeText(message.content)} className="material-symbols-outlined text-[16px] text-slate-400 hover:text-[#00366c] dark:hover:text-blue-400 transition-colors">content_copy</button>
                                        <button className="material-symbols-outlined text-[16px] text-slate-400 hover:text-amber-500 transition-colors">thumb_up</button>
                                        <button className="material-symbols-outlined text-[16px] text-slate-400 hover:text-[#00366c] dark:hover:text-blue-400 transition-colors">volume_up</button>
                                    </div>
                                    <FeedbackPanel
                                      outputType="chat"
                                      confidence={message.confidence || 'high'}
                                      language={language}
                                      contentPreview={message.content?.slice(0, 200)}
                                      showBadge={true}
                                    />
                                </div>
                            </div>
                         )}
                      </div>
                    ))
                  )}

                  {loading && (
                      <div className="flex flex-col items-start gap-3 w-full animate-fade-in">
                          <div className="flex items-center gap-2 mb-1 pl-1">
                              <div className="w-8 h-8 rounded-full bg-[#005934] dark:bg-emerald-500/20 flex flex-shrink-0 items-center justify-center">
                                  <span className="material-symbols-outlined text-[#9df5bd] text-[18px]">psychology</span>
                              </div>
                              <span className="text-[11px] font-black font-headline tracking-widest text-slate-400 uppercase">Processing</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-800 flex gap-1.5 w-24">
                              <div className="h-2 w-2 animate-bounce rounded-full bg-[#00366c] dark:bg-sky-500 [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-[#00366c] dark:bg-sky-500 [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-[#00366c] dark:bg-sky-500"></div>
                          </div>
                      </div>
                  )}
                  {error && <div className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900 max-w-3xl mx-auto w-full px-4 md:px-0">{String(error)}</div>}
                  <div ref={messagesEndRef} className="h-10"></div>
              </div>

              {/* Fixed Position Input Bar Container for Strict Mobile Anchoring */}
              <div className="fixed lg:absolute bottom-0 sm:bottom-4 pb-2 sm:pb-4 left-0 right-0 flex flex-col items-center pointer-events-none z-50 lg:z-10 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 pt-8 sm:pt-10 px-2 sm:px-4">
                  {/* Tooltips */}
                  {messages.length > 0 && !loading && (
                    <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar max-w-3xl w-full pointer-events-auto">
                        <button onClick={() => handleSend("Summarize this in 3 bullet points")} className="shrink-0 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl text-[13px] font-bold text-[#00366c] dark:text-sky-300 hover:bg-[#00366c] hover:text-white transition-all shadow-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">summarize</span> Summarize this
                        </button>
                        <button onClick={() => handleSend("Generate a quick quiz based on this segment")} className="shrink-0 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl text-[13px] font-bold text-[#00366c] dark:text-sky-300 hover:bg-[#00366c] hover:text-white transition-all shadow-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">quiz</span> Test my knowledge
                        </button>
                    </div>
                  )}

                  {selectedDoc && (
                      <div className="mb-2 w-full max-w-3xl flex pointer-events-auto">
                          <div className="bg-[#00366c]/10 text-[#00366c] dark:bg-sky-500/10 dark:text-sky-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-3">
                              <span className="material-symbols-outlined text-[16px]">attach_file</span>
                              {selectedDoc.title}
                              <button onClick={() => setSelectedDoc(null)} className="hover:text-red-500 transition-colors material-symbols-outlined text-[16px]">close</button>
                          </div>
                      </div>
                  )}

                  <div className="w-full max-w-3xl bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[24px] p-1.5 flex items-end gap-2 border border-transparent focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-colors relative pointer-events-auto shadow-sm">
                      
                      {/* Document Library Dropdown Menu */}
                      {showDocs && (
                          <div className="absolute bottom-[110%] left-0 w-[240px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden py-3 z-50">
                              <p className="px-4 text-[10px] font-black uppercase tracking-widest text-[#00366c] dark:text-sky-400 mb-2">Process Documents</p>
                              
                              <label className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-[13px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3 cursor-pointer transition-colors border-l-2 border-transparent hover:border-[#ffbf2e]">
                                  <span className="material-symbols-outlined text-[20px] text-[#00366c] dark:text-sky-400">upload_file</span>
                                  <span>Upload from device</span>
                                  <input type="file" accept=".txt,.csv,.json,.md,.doc,.docx,.ppt,.pptx,.pdf" className="hidden" onChange={handleFileUpload} />
                              </label>

                              {documents.length > 0 && <div className="px-4 py-2 mt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">Saved in Library</div>}
                              
                              <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                                  {documents.map((doc, idx) => (
                                      <li key={idx}>
                                          <button onClick={() => { setSelectedDoc(doc); setShowDocs(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-[13px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-3 transition-colors">
                                              <span className="material-symbols-outlined text-[18px] opacity-60">description</span>
                                              <span className="truncate flex-1">{doc.title}</span>
                                          </button>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}

                      <button onClick={() => setShowDocs(!showDocs)} className={`p-3 transition-colors ${showDocs ? 'text-[#00366c] dark:text-sky-400' : 'text-slate-400 hover:text-[#00366c] dark:hover:text-blue-400'}`}>
                          <span className="material-symbols-outlined text-[24px]">add_circle</span>
                      </button>
                      <textarea 
                          ref={inputRef}
                          value={prompt}
                          onChange={(e) => { e.target.style.height='auto'; e.target.style.height= Math.min(e.target.scrollHeight, 120)+'px'; setPrompt(e.target.value); }}
                          onKeyDown={(e) => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                          className="flex-1 bg-transparent border-none focus:ring-0 py-3.5 text-[15px] font-medium resize-none max-h-40 text-slate-900 dark:text-[#ececec] placeholder:text-slate-500 font-body outline-none" 
                          placeholder="Ask SukuuPath AI..." 
                          rows="1"
                          disabled={loading}
                      />
                      <button className="p-3 text-slate-400 hover:text-[#00366c] dark:hover:text-sky-400 transition-colors hidden sm:block">
                          <span className="material-symbols-outlined text-[24px]">mic</span>
                      </button>
                      <button 
                          onClick={() => handleSend()}
                          disabled={!prompt.trim() || loading}
                          className="bg-[#00366c] disabled:bg-[#e0e0e0] text-white disabled:text-slate-400 dark:bg-white dark:text-slate-900 dark:disabled:bg-[#404040] dark:disabled:text-slate-500 w-10 h-10 mb-1 mr-1 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-all outline-none"
                      >
                          <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>arrow_upward</span>
                      </button>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-center mt-1 sm:mt-2.5 font-medium text-slate-400 dark:text-[#a0a0a0] font-body tracking-wide pointer-events-auto leading-tight hidden sm:block">SukuuPath AI can make mistakes. Verify important academic facts.</p>
              </div>
          </section>

      </main>
    </div>
  );
};

export default AIChatPage;
