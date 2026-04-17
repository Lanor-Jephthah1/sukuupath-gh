import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('System Admin');

  // Example of how to handle snake_case vs camelCase from API
  // const acc = response.data;
  // setUserName(`${acc.first_name || acc.firstName || 'System'} ${acc.last_name || acc.lastName || 'Admin'}`);

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex animate-fade-in">
      {/* SideNavBar Component */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 bg-slate-50 border-r border-outline-variant/10 py-6 px-4 gap-4 z-40 transition-all">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-900 leading-tight font-headline">SukuuPath GH</h2>
            <p className="uppercase tracking-widest text-[10px] font-semibold text-slate-500">System Admin</p>
          </div>
        </div>

        <button className="bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-lg mx-2 hover:shadow-primary/30">
          <span className="material-symbols-outlined">upload_file</span>
          <span className="text-sm">Batch Upload</span>
        </button>

        <nav className="flex-1 space-y-1 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-amber-100/50 text-amber-900 font-bold rounded-lg transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-sm">Overview</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm">User Management</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm">System Health</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Settings</span>
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4 space-y-1 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-sm">Support Tickets</span>
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* TopNavBar Component */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 w-full shadow-sm">
          <div className="flex justify-between items-center px-6 md:px-8 h-16 w-full max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4 md:gap-8">
              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-600 p-1">
                <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
              
              <span className="text-xl font-black tracking-tight text-blue-900 hidden sm:block font-headline">Admin Control</span>
              
              <nav className="hidden lg:flex items-center gap-6">
                <button className="text-blue-900 border-b-2 border-blue-900 pb-1 font-bold text-sm">Dashboard</button>
                <button className="text-slate-500 hover:text-blue-800 transition-colors text-sm">Reports</button>
                <button className="text-slate-500 hover:text-blue-800 transition-colors text-sm">Access Logs</button>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block group">
                <input className="bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:ring-2 focus:ring-primary-container transition-all" placeholder="Search data..." type="text" />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors">search</span>
              </div>
              
              <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary rounded-full transition-all hover:scale-110 active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
                <img className="w-full h-full object-cover" alt="Admin avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ0ZOUJS--8Qmn6jB7G9RW-MkO1Nmx51feuwnyczITUYfbss9Zst9UqWjsoc0C2PGqsEOnR72PZloHlXWcBLl_koYpsxbGzXrInBRMSTWIxhbhtRzCcQUY8eJUZH6CJyUNrjTxLBXu1gZK2m8Ai5e3dMs8euCL8yGz_IQGfOAY0rcWSFhJfnyI58rXndpFfXx3KyzeigcgCQvBZqbso3Iye37DROEXt7bWx6XfHXAw-INR9tgQKy2U2MAhYLwACngV5bnXbaBSJeY" />
              </div>
            </div>
          </div>
        </header>

         {/* Mobile Menu Dropdown */}
         <div className={`md:hidden fixed left-0 w-full bg-white shadow-xl z-40 transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'top-[64px] opacity-100 scale-100 placeholder-events-auto' : 'top-[64px] opacity-0 scale-95 pointer-events-none'}`}>
          <nav className="flex flex-col p-4 space-y-2">
            <button className="flex items-center gap-3 bg-amber-100/50 text-amber-900 rounded-lg px-4 py-3">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span className="font-semibold">Overview</span>
            </button>
            <button className="flex items-center gap-3 text-slate-600 hover:bg-slate-100 rounded-lg px-4 py-3">
              <span className="material-symbols-outlined">group</span>
              <span className="font-semibold">User Management</span>
            </button>
            <button className="flex items-center gap-3 text-error hover:bg-error/10 rounded-lg px-4 py-3 mt-4">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-semibold">Log out</span>
            </button>
          </nav>
        </div>

        {/* Dashboard Canvas */}
        <div className="p-6 md:p-8 space-y-8 max-w-screen-2xl mx-auto pb-24 md:pb-8">
          
          {/* Hero Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {[
              { title: 'Total Active Users', icon: 'person', val: '12,842', trend: '+14.2% from last month', trendIcon: 'trending_up', bg: 'bg-primary/10 text-primary', subColor: 'text-tertiary-container' },
              { title: 'Active Sessions', icon: 'bolt', val: '1,204', trend: 'Live platform engagement', bg: 'bg-secondary/10 text-secondary', subColor: 'text-on-surface-variant' },
              { title: 'Top Feature', icon: 'psychology', val: 'AI Summaries', trend: 'Used 4.2k times today', bg: 'bg-tertiary/10 text-tertiary', valClass: 'text-xl mt-1', subColor: 'text-on-surface-variant' },
              { title: 'Feedback Reports', icon: 'chat_bubble', val: '28', trend: '9 critical issues flagged', bg: 'bg-error/10 text-error', subColor: 'text-error' }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5 flex flex-col gap-2 hover:shadow-md transition-all hover:-translate-y-1 group`}>
                <div className="flex justify-between items-start">
                  <span className="uppercase tracking-widest text-[10px] font-semibold text-slate-500">{stat.title}</span>
                  <div className={`${stat.bg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-sm">{stat.icon}</span>
                  </div>
                </div>
                <h3 className={`${stat.valClass || 'text-3xl'} font-black text-on-surface font-headline bg-clip-text`}>{stat.val}</h3>
                <p className={`text-xs ${stat.subColor} font-semibold flex items-center gap-1`}>
                  {stat.trendIcon && <span className="material-symbols-outlined text-[14px]">{stat.trendIcon}</span>}
                  {stat.trend}
                </p>
              </div>
            ))}
          </section>

          {/* Main Data Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Left Column: User Table Preview */}
            <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
              <div className="px-6 py-5 flex justify-between items-center border-b border-surface-container">
                <h2 className="text-xl font-bold text-blue-900 font-headline">User Management Preview</h2>
                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline transition-all">
                  View all <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-6 py-4 uppercase tracking-widest text-[10px] font-bold text-slate-500">Student Name</th>
                      <th className="px-6 py-4 uppercase tracking-widest text-[10px] font-bold text-slate-500">Institution</th>
                      <th className="px-6 py-4 uppercase tracking-widest text-[10px] font-bold text-slate-500">Activity Level</th>
                      <th className="px-6 py-4 uppercase tracking-widest text-[10px] font-bold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {[
                      { ini: 'KA', name: 'Kofi Adomako', inst: 'UG-Legon', pct: 'w-3/4', color: 'bg-tertiary', stat: 'Active', statBg: 'bg-tertiary-fixed text-on-tertiary-fixed' },
                      { ini: 'EO', name: 'Esi Owusu', inst: 'KNUST', pct: 'w-1/2', color: 'bg-primary', stat: 'Active', statBg: 'bg-tertiary-fixed text-on-tertiary-fixed' },
                      { ini: 'AA', name: 'Abena Appiah', inst: 'UCC', pct: 'w-1/4', color: 'bg-slate-300', stat: 'Idle', statBg: 'bg-surface-container-highest text-on-surface-variant' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${row.color.replace('bg-', 'bg-').replace('-400', '-100')} flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform`}>{row.ini}</div>
                          <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{row.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{row.inst}</td>
                        <td className="px-6 py-4">
                          <div className="w-full max-w-[120px] bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                            <div className={`${row.color} ${row.pct} h-full`}></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${row.statBg} px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>{row.stat}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right Column: Language Performance */}
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col gap-6 hover:shadow-md transition-shadow">
              <div>
                <h2 className="text-xl font-bold text-blue-900 font-headline">Language Distribution</h2>
                <p className="text-sm text-on-surface-variant mt-1">Multi-dialect AI accuracy</p>
              </div>
              <div className="space-y-5">
                {[
                  { lang: 'Twi (Asante)', pct: '94.2%', width: '94.2%', grad: 'from-tertiary to-tertiary-fixed-dim', color: 'text-tertiary' },
                  { lang: 'Ga', pct: '88.5%', width: '88.5%', grad: 'from-primary to-primary-fixed-dim', color: 'text-primary' },
                  { lang: 'Ewe', pct: '82.1%', width: '82.1%', grad: 'from-secondary to-secondary-fixed-dim', color: 'text-secondary' },
                  { lang: 'Fante', pct: '79.8%', width: '79.8%', bg: 'bg-slate-400', color: 'text-on-surface-variant' }
                ].map((l, i) => (
                  <div key={i} className="space-y-2 group">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      <span className="text-on-surface">{l.lang}</span>
                      <span className={l.color}>{l.pct}</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full ${l.grad ? `bg-gradient-to-r ${l.grad}` : l.bg}`} style={{ width: l.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto p-4 bg-tertiary-container/5 rounded-xl flex items-start gap-4 border border-tertiary-container/10 group hover:bg-tertiary-container/10 transition-colors">
                <span className="material-symbols-outlined text-tertiary group-hover:scale-110 transition-transform text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <div>
                  <p className="text-xs font-bold text-tertiary">AI Insight</p>
                  <p className="text-[11px] text-tertiary/80 leading-relaxed mt-1">Twi recognition accuracy increased by 4.2% since last model update.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Row: Health & Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Flagged Issues */}
            <section className="lg:col-span-2 bg-error-container/20 p-6 md:p-8 rounded-xl shadow-sm border border-error/10 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error animate-pulse">warning</span>
                  <h2 className="text-xl font-bold text-error font-headline">Flagged Outputs</h2>
                </div>
                <span className="bg-error text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm">9 REVIEW</span>
              </div>
              <div className="space-y-4">
                {[
                  { icon: 'priority_high', title: 'Inaccurate Translation Flag', desc: "User report #8824: 'Photosynthesis' translated incorrectly in Ewe module.", btn: 'Resolve' },
                  { icon: 'block', title: 'Content Policy Violation', desc: 'AI Filter: Potential plagiarism detected in Student Upload ID #0023-GH.', btn: 'View Details' }
                ].map((issue, i) => (
                  <div key={i} className="bg-white/90 p-4 rounded-lg flex items-start gap-4 hover:shadow-sm hover:-translate-y-0.5 transition-all">
                    <div className="bg-error/10 p-2 rounded text-error">
                      <span className="material-symbols-outlined text-sm">{issue.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">{issue.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{issue.desc}</p>
                    </div>
                    <button className="text-xs font-bold text-primary px-3 py-1 hover:bg-primary/10 rounded transition-colors">{issue.btn}</button>
                  </div>
                ))}
              </div>
            </section>

            {/* System Health */}
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-blue-900 font-headline">System Health</h2>
              <div className="space-y-3 flex-1">
                {[
                  { name: 'API Gateway', status: 'Operational', color: 'text-tertiary', dot: 'bg-tertiary' },
                  { name: 'Vector Database', status: 'Operational', color: 'text-tertiary', dot: 'bg-tertiary' },
                  { name: 'Auth Service', status: 'Lagging', color: 'text-secondary', dot: 'bg-secondary' }
                ].map((sys, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${sys.dot} group-hover:scale-125 transition-transform`}></span>
                      <span className="text-xs font-semibold text-on-surface">{sys.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${sys.color} uppercase`}>{sys.status}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-surface-container mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-semibold">Uptime (30d)</span>
                  <span className="font-black text-primary">99.98%</span>
                </div>
              </div>
            </section>

            {/* Integrations Status */}
            <section className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl shadow-md text-white flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">cloud_sync</span>
                </div>
                <h2 className="text-xl font-bold font-headline">Cloud Sync</h2>
                <p className="text-sm text-blue-100/90 mt-2 leading-relaxed">Active backup to West Africa region.</p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <span className="material-symbols-outlined text-9xl">database</span>
              </div>
              <div className="mt-8 flex items-end justify-between relative z-10">
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">Latency: 24ms</div>
                <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-transform shadow-sm">Config</button>
              </div>
            </section>
          </div>
        </div>

        {/* Floating Action Button for Support */}
        <button className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-[0_12px_32px_rgba(123,88,0,0.4)] flex items-center justify-center hover:scale-110 hover:-translate-y-2 active:scale-90 transition-all z-50 animate-fade-in-up">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
        </button>
      </main>
    </div>
  );
};

export default AdminDashboard;
