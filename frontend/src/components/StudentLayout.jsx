import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAppTheme } from '../hooks/useAppTheme';

const StudentLayout = ({ children, hideSidebar = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAppTheme();
  
  const [userName, setUserName] = useState('Kofi Mensah');
  const [userProfile, setUserProfile] = useState({ school: 'UG', level: '300' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userAccount');
    if (stored) {
      const acc = JSON.parse(stored);
      setUserName(`${acc.first_name || acc.firstName || ''} ${acc.last_name || acc.lastName || ''}`);
      setUserProfile({ school: acc.school || 'UG', level: acc.level || '300' });
    }
  }, []);


  const sideNavLinks = [
    { name: 'Dashboard', path: '/student-dashboard', icon: 'dashboard' },
    { name: 'Translate', path: '/translation', icon: 'g_translate', fill: true },
    { name: 'Simplify', path: '/simplify', icon: 'auto_awesome' },
    { name: 'Summaries', path: '/summaries', icon: 'summarize', fill: true },
    { name: 'Study Notes', path: '/notes', icon: 'import_contacts', fill: true },
    { name: 'Ask AI', path: '/ai-chat', icon: 'psychology', fill: true },
    { name: 'Quizzes', path: '/quiz', icon: 'quiz' },
    { name: 'Library', path: '/library', icon: 'menu_book' },
  ];

  return (
    <div className="bg-[#fcf9f8] text-[#1b1b1c] font-body min-h-screen dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top App Bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-[12px] sticky top-0 z-40 flex justify-between items-center w-full px-6 py-4 shadow-sm border-b border-transparent dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 text-[#434653] dark:text-slate-300 hover:text-[#00366c] transition-colors focus:outline-none">
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <h1 onClick={() => navigate('/student-dashboard')} className="text-2xl font-black text-[#00366c] dark:text-sky-400 tracking-tighter font-headline cursor-pointer hidden sm:block lg:block">SukuuPath GH</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#f0eded] dark:bg-slate-800 rounded-full px-4 py-2 w-72 lg:w-96 border border-transparent dark:border-slate-700">
            <span className="material-symbols-outlined text-[#737784] dark:text-slate-400">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full font-body ml-2 outline-none dark:text-white placeholder-[#737784] dark:placeholder-slate-400" placeholder="Ask a question..." type="text" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button className="p-2 text-[#434653] dark:text-slate-300 hover:text-[#00366c] dark:hover:text-sky-400 transition-colors hidden sm:block">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200 dark:border-slate-700">
               <div className="w-8 h-8 rounded-full bg-[#00366c] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                 {userName.charAt(0)}
               </div>
               <span className="hidden lg:block text-sm font-bold text-[#00366c] dark:text-sky-400">Account</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] relative overflow-x-hidden">
          
          {/* Mobile Overlay */}
          {(!hideSidebar && isSidebarOpen) && (
            <div 
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 bg-black/60 z-[50] lg:hidden backdrop-blur-sm transition-opacity"
            />
          )}

          {/* Side Navigation (Responsive Fixed) */}
          {!hideSidebar && (
            <aside className={`fixed top-0 lg:top-[73px] bottom-0 left-0 w-72 lg:w-64 flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[60] lg:z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <div className="p-6 overflow-y-auto no-scrollbar">
                
                {/* Mobile Sidebar Header */}
                <div className="flex items-center justify-between lg:hidden mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 mt-2">
                  <h2 className="text-2xl font-black text-[#00366c] dark:text-sky-400 tracking-tighter font-headline">SukuuPath GH</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#004d95] text-white flex items-center justify-center font-bold text-xl uppercase">
                     {userName.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-headline font-bold text-[#1b1b1c] dark:text-white truncate" title={userName}>{userName}</h3>
                    <p className="text-[11px] text-[#434653] dark:text-slate-400 uppercase tracking-wider font-bold truncate p-0.5">{userProfile.school} - L{userProfile.level}</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  {sideNavLinks.map(link => {
                     const active = location.pathname.includes(link.path);
                     return (
                       <button key={link.name} onClick={() => { navigate(link.path); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 mx-2 transition-all font-semibold ${active ? 'bg-blue-50 text-blue-800 dark:bg-sky-500/20 dark:text-sky-300 font-bold' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                         <span className="material-symbols-outlined" style={{fontVariationSettings: (active || link.fill) ? "'FILL' 1" : "'FILL' 0"}}>{link.icon}</span>
                         <span>{link.name}</span>
                       </button>
                     );
                  })}
                </nav>
              </div>
              <div className="mt-auto p-4 space-y-4">
                <button className="w-full py-3 px-4 bg-gradient-to-br from-[#00366c] to-[#004d95] text-white rounded-xl font-bold text-[13px] shadow-sm active:scale-95 transition-all outline-none">
                    Upgrade to Premium
                </button>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={() => navigate('/settings')} className={`w-full flex items-center gap-3 px-4 py-2 transition-colors outline-none ${location.pathname === '/settings' ? 'text-[#00366c] dark:text-sky-400 font-bold' : 'text-slate-600 hover:text-[#00366c] dark:text-slate-400 dark:hover:text-sky-400'}`}>
                    <span className="material-symbols-outlined" style={{fontVariationSettings: location.pathname === '/settings' ? "'FILL' 1" : "'FILL' 0"}}>settings</span>
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Main Canvas Context */}
          <main className={`flex-1 w-full ${!hideSidebar ? 'lg:ml-64' : ''} pb-12`}>
             {children}
          </main>
      </div>


    </div>
  );
};

export default StudentLayout;
