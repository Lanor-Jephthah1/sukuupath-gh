import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAppTheme } from '../hooks/useAppTheme';

const LecturerLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAppTheme();
  
  const [userName, setUserName] = useState('Dr. Kwame Mensah');
  const [userRole, setUserRole] = useState('Senior Lecturer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userAccount');
    if (stored) {
      const acc = JSON.parse(stored);
      setUserName(`${acc.first_name || acc.firstName || ''} ${acc.last_name || acc.lastName || ''}`);
      if (acc.role === 'admin') setUserRole('University Admin');
    }
  }, []);

  const navLinks = [
    { name: 'Overview', path: '/lecturer-dashboard', icon: 'dashboard', tab: 'overview' },
    { name: 'Course Materials', path: '/lecturer-dashboard', icon: 'upload_file', tab: 'materials' },
    { name: 'Translations', path: '/lecturer-dashboard', icon: 'g_translate', tab: 'translations' },
    { name: 'Student Trends', path: '/lecturer-dashboard', icon: 'trending_up', tab: 'engagement' },
    { name: 'Student Feedback', path: '/lecturer-dashboard', icon: 'feedback', tab: 'feedback' },
    { name: 'Analytics', path: '/lecturer-dashboard', icon: 'analytics', tab: 'analytics' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userAccount');
    navigate('/login');
  };

  return (
    <div className="bg-[#f8fafc] text-[#1e293b] font-body min-h-screen dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 text-slate-500 hover:text-[#00366c] transition-colors focus:outline-none">
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <div onClick={() => navigate('/lecturer-dashboard')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#00366c] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </div>
            <h1 className="text-xl font-black text-[#00366c] dark:text-sky-400 tracking-tighter font-headline hidden sm:block">SukuuPath GH</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Lecturer Portal Active</span>
           </div>
           
           <div className="flex items-center gap-3">
             <ThemeToggle theme={theme} onToggle={toggleTheme} />
             <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
               <span className="material-symbols-outlined">notifications</span>
             </button>
             <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
               <div className="text-right hidden sm:block leading-tight">
                 <p className="text-sm font-bold text-[#00366c] dark:text-sky-400">{userName}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{userRole}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-academic-gradient border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-white font-bold text-lg">
                 {userName.charAt(0)}
               </div>
             </div>
           </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] relative">
        
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity" />
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed top-0 lg:top-[73px] bottom-0 left-0 w-72 lg:w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[70] lg:z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 h-full flex flex-col">
            
            {/* Mobile Header */}
            <div className="flex items-center justify-between lg:hidden mb-10">
              <h2 className="text-2xl font-black text-[#00366c] dark:text-sky-400 tracking-tighter">Portal Nav</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-3">Dashboard Control</p>
              {navLinks.map((link) => {
                 // We will handle specific tabs in the Dashboard component via hash or search param
                 // For now, let's keep it simple
                 return (
                   <button 
                     key={link.name} 
                     onClick={() => { 
                       // We can use search params to switch tabs
                       const url = new URL(window.location.href);
                       url.searchParams.set('tab', link.tab);
                       navigate(url.pathname + url.search);
                       setIsSidebarOpen(false); 
                     }} 
                     className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all font-bold text-sm ${
                        (new URLSearchParams(window.location.search).get('tab') === link.tab || (!new URLSearchParams(window.location.search).get('tab') && link.tab === 'overview'))
                        ? 'bg-[#00366c] text-white shadow-lg shadow-[#00366c]/20' 
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                     }`}
                   >
                     <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                     <span>{link.name}</span>
                   </button>
                 );
              })}
            </nav>

            <div className="mt-auto space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-[#00366c] dark:hover:text-sky-400 transition-colors">
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span className="text-sm font-bold text-slate-400">Portal Settings</span>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl font-bold text-sm transition-all hover:bg-rose-100">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 w-full ${isSidebarOpen ? '' : 'lg:ml-64'} transition-all duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
