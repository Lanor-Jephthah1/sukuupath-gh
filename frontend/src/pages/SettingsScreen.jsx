import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { useAppTheme } from '../hooks/useAppTheme';

const SettingsScreen = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useAppTheme();
    const [userName, setUserName] = useState('Akosua Mansa');
    const [userEmail, setUserEmail] = useState('akosua.mansa@ug.edu.gh');
    const [secondaryEmail, setSecondaryEmail] = useState('a.mansa@outlook.com');
    const [preferredLanguage, setPreferredLanguage] = useState('English');
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAI, setShowAI] = useState(true);
    const [activeModal, setActiveModal] = useState(''); // 'notifications', 'privacy', 'accessibility', 'secondary_email'
    const languages = ['English', 'Twi', 'Ewe', 'Ga', 'Fante'];
    const [photoBase64, setPhotoBase64] = useState('');
    const [userId, setUserId] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('userAccount');
        if (stored) {
            const acc = JSON.parse(stored);
            setUserName(`${acc.first_name || acc.firstName || ''} ${acc.last_name || acc.lastName || ''}`.trim());
            setUserEmail(acc.email || 'student@ug.edu.gh');
            setSecondaryEmail(acc.secondary_email || '');
            setUserId(acc.id || '');
            if(acc.photo_base64) setPhotoBase64(acc.photo_base64);
        }
        const savedLang = localStorage.getItem('user_language');
        if (savedLang) setPreferredLanguage(savedLang);
    }, []);

    const handleSaveAccount = async () => {
        const [first, ...rest] = userName.split(' ');
        try {
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    first_name: first,
                    last_name: rest.join(' '),
                    email: userEmail
                })
            });
            if (!res.ok) throw new Error("Failed to save profile");
            const updated = await res.json();
            localStorage.setItem('userAccount', JSON.stringify(updated));
            setIsEditingAccount(false);
        } catch(e) {
            console.error(e);
            alert("Failed to update profile to server.");
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            setPhotoBase64(base64String);
            try {
                const res = await fetch('/api/user/preferences', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, photo_base64: base64String })
                });
                if(res.ok) {
                    const stored = JSON.parse(localStorage.getItem('userAccount') || '{}');
                    stored.photo_base64 = base64String;
                    localStorage.setItem('userAccount', JSON.stringify(stored));
                }
            } catch(err) { console.error(err); }
        };
        reader.readAsDataURL(file);
    };

    const handleLanguageChange = (lang) => {
        setPreferredLanguage(lang);
        localStorage.setItem('user_language', lang);
    };

    const handleClearCache = () => {
        if(window.confirm("WARNING: This will wipe all saved AI chats, generated documents, and study notes from your local device cache permanently. Proceed?")) {
            localStorage.removeItem('edu_study_library');
            alert("Local storage wiped cleanly. Dashboard reset.");
            window.location.reload();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userAccount');
        navigate('/');
    };

    return (
        <StudentLayout>
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 animate-fade-in-up">
                
                {/* Header Section */}
                <header className="space-y-2 mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b1b1c] dark:text-white tracking-tight font-headline">Settings</h1>
                    <p className="text-[#434653] dark:text-slate-400 max-w-xl text-[15px] font-medium leading-relaxed">
                        Configure your scholarly environment and manage your academic profile across the SukuuPath ecosystem.
                    </p>
                </header>

                {/* Account Settings Bento */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-[#fcf9f8] dark:bg-slate-900 shadow-sm border border-transparent dark:border-slate-800 p-8 rounded-[24px] space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#00366c] dark:text-sky-400 flex items-center gap-2 font-headline">
                                <span className="material-symbols-outlined shrink-0 text-[22px]">person</span> Account Settings
                            </h2>
                            {isEditingAccount ? (
                               <button onClick={handleSaveAccount} className="text-[13px] font-extrabold text-green-600 dark:text-green-400 hover:text-green-700 transition-colors uppercase tracking-widest bg-green-50 dark:bg-green-500/10 px-4 py-1.5 rounded-full">Save</button>
                            ) : (
                               <button onClick={() => setIsEditingAccount(true)} className="text-[13px] font-extrabold text-[#00366c] dark:text-sky-400 hover:text-[#004d95] dark:hover:text-sky-300 transition-colors uppercase tracking-widest bg-[#00366c]/5 dark:bg-sky-400/10 px-4 py-1.5 rounded-full">Edit</button>
                            )}
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                            <div className="relative group shrink-0">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-[4px] border-[#f0eded] dark:border-slate-800 shadow-sm">
                                    <img 
                                      className="w-full h-full object-cover" 
                                      alt="User Portrait" 
                                      src={photoBase64 || "https://lh3.googleusercontent.com/aida-public/AB6AXuD62zA1x2pO2KqdRLhwytwCGEW6U3qfn6wJdUKtiA631mUyL7LNjejbmDwbgI2DeYVHvQbhMVMdKQwhB1dN76AF1XAHIrrz6ejski_NZlzjfM9JKTwVgBHhrO7nupVGOJZkB6gZMBtQthO7A46HZbTmAjb6uKzrkefg13DSuYi-IVJ2mwYaiP8-aiQ8krJZGzTnXF9N6_TLlADl_YdvaUR_9hp-h-AezonC4FWNQbWLSt2rM6R5mnUQAuNE8n2NqrtqXaHNI-5U70_b"}
                                    />
                                </div>
                                <label className="absolute bottom-0 right-0 bg-[#00366c] dark:bg-sky-500 text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <div className="space-y-2 flex-1 w-full">
                                {isEditingAccount ? (
                                    <>
                                        <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-black dark:text-white outline-none focus:border-[#00366c] transition-colors" />
                                        <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium dark:text-slate-300 outline-none focus:border-[#00366c] transition-colors" />
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-black text-[#1b1b1c] dark:text-white font-headline tracking-tighter">{userName}</p>
                                        <p className="text-[15px] text-[#434653] dark:text-slate-400 font-medium">{userEmail}</p>
                                    </>
                                )}
                                <p className="text-xs text-[#737784] dark:text-slate-500 italic mt-2">Member since August 2023</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[#f0eded] dark:border-slate-800">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#737784] dark:text-slate-500">Password</label>
                                <div className="flex items-center justify-between p-4 bg-[#f6f3f2] dark:bg-slate-800/50 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer group" onClick={() => setShowPasswordModal(true)}>
                                    <span className="text-[15px] font-black tracking-[0.2em] text-[#1b1b1c] dark:text-slate-300">••••••••</span>
                                    <button className="material-symbols-outlined text-[#00366c] dark:text-sky-400 text-[18px] group-hover:scale-110 transition-transform">edit</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-extrabold text-[#737784] dark:text-slate-500">Secondary Email</label>
                                <div className="flex items-center justify-between p-4 bg-[#f6f3f2] dark:bg-slate-800/50 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer group" onClick={() => setActiveModal('secondary_email')}>
                                    <span className="text-[13px] font-bold text-[#1b1b1c] dark:text-slate-300 truncate max-w-[150px]">{secondaryEmail}</span>
                                    <button className="material-symbols-outlined text-[#00366c] dark:text-sky-400 text-[20px] group-hover:scale-110 transition-transform">add</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insight Card */}
                    {showAI ? (
                        <div className="bg-[#005934] dark:bg-emerald-950 text-white p-8 rounded-[24px] flex flex-col justify-between relative overflow-hidden shadow-md">
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#9df5bd]/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                            <button onClick={() => setShowAI(false)} className="absolute top-4 right-4 text-emerald-300 hover:text-white material-symbols-outlined text-[16px] z-20">close</button>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[#ffbf2e] dark:text-amber-400" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                                    <h3 className="font-extrabold text-[#9df5bd] dark:text-emerald-300 font-headline">AI Suggestion</h3>
                                </div>
                                <p className="text-[14px] leading-relaxed font-semibold text-emerald-50 pr-4">You've accessed resources in 3 different Ghanaian languages this week. Consider enabling "Smart Translation" globally.</p>
                            </div>
                            <button onClick={() => { setActiveModal('accessibility'); setShowAI(false); }} className="relative z-10 mt-8 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white text-[13px] font-black transition-colors shadow-sm hover:shadow-md uppercase tracking-wider">
                                Review Suggestion
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-[24px] flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-[40px]">insights</span>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No new AI Insights</p>
                        </div>
                    )}
                </section>

                {/* Preferences Section (Language & Theme) */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Language Chips */}
                    <div className="bg-[#fcf9f8] dark:bg-slate-900 p-8 rounded-[24px] space-y-6 shadow-sm border border-transparent dark:border-slate-800">
                        <h2 className="text-xl font-extrabold text-[#1b1b1c] dark:text-white font-headline">Region Preferences</h2>
                        <div className="flex flex-wrap gap-2.5">
                            {languages.map(lang => (
                                <button 
                                  key={lang}
                                  onClick={() => handleLanguageChange(lang)}
                                  className={`px-6 py-2.5 rounded-full text-xs font-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#00366c] ${preferredLanguage === lang ? 'bg-[#ffbf2e] text-[#6e4f00] dark:bg-amber-500 dark:text-amber-950 scale-105' : 'bg-[#e5e2e1] text-[#1b1b1c] dark:bg-slate-800 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-[#737784] dark:text-slate-500 font-semibold tracking-wide">Sets base dialect for structural AI generations.</p>
                    </div>

                    {/* Theme Preference */}
                    <div className="bg-[#fcf9f8] dark:bg-slate-900 p-8 rounded-[24px] space-y-6 shadow-sm border border-transparent dark:border-slate-800">
                        <h2 className="text-xl font-extrabold text-[#1b1b1c] dark:text-white font-headline">Interface Theme</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => theme === 'dark' && toggleTheme()}
                              className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all shadow-sm ${theme === 'light' ? 'bg-white border-2 border-[#00366c] shadow-md scale-105' : 'bg-[#f6f3f2] dark:bg-slate-800 border-2 border-transparent text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}
                            >
                                <span className={`material-symbols-outlined text-[32px] ${theme === 'light' ? 'text-[#00366c]' : ''}`} style={{fontVariationSettings: "'FILL' 1"}}>light_mode</span>
                                <span className={`text-[13px] font-black ${theme === 'light' ? 'text-[#00366c]' : ''}`}>Light Canvas</span>
                            </button>
                            <button 
                              onClick={() => theme === 'light' && toggleTheme()}
                              className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-2 border-sky-400 shadow-sky-900/40 shadow-md scale-105' : 'bg-[#f6f3f2] dark:bg-slate-800 border-2 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                                <span className={`material-symbols-outlined text-[32px] ${theme === 'dark' ? 'text-sky-400' : ''}`} style={{fontVariationSettings: "'FILL' 1"}}>dark_mode</span>
                                <span className={`text-[13px] font-black ${theme === 'dark' ? 'text-white' : ''}`}>Dark Studio</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Grouped Controls */}
                <section className="space-y-4 pt-2">
                    <h2 className="text-lg font-extrabold text-[#1b1b1c] dark:text-white px-2 font-headline">System Commands</h2>
                    <div className="space-y-1.5 shadow-sm rounded-[24px] overflow-hidden">
                        {[
                          { id: 'notifications', title: 'Notification Matrix', sub: 'Push, email, and scholarly alerts', icon: 'notifications_active', color: 'text-[#00366c] bg-[#00366c]/10 dark:text-sky-400 dark:bg-sky-400/10' },
                          { id: 'privacy', title: 'Privacy & Security', sub: 'Manage data visibility and local history', icon: 'shield', color: 'text-[#005934] bg-[#005934]/10 dark:text-emerald-400 dark:bg-emerald-400/10' },
                          { id: 'accessibility', title: 'Accessibility Suite', sub: 'Screen reader and high contrast tuning', icon: 'accessibility_new', color: 'text-[#7b5800] bg-[#7b5800]/10 dark:text-amber-500 dark:bg-amber-500/10', badge: '3 Active' }
                        ].map((item, idx) => (
                            <div key={idx} onClick={() => setActiveModal(item.id)} className="flex items-center justify-between p-5 md:p-6 bg-[#fcf9f8] dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group border-b border-[#f0eded] dark:border-slate-800 last:border-0">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-[15px] text-[#1b1b1c] dark:text-white">{item.title}</p>
                                        <p className="text-[13px] text-[#737784] dark:text-slate-400 font-medium">{item.sub}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {item.badge && <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-[#00366c] dark:text-sky-400 bg-[#00366c]/5 dark:bg-sky-400/10 px-3 py-1.5 rounded-full">{item.badge}</span>}
                                    <span className="material-symbols-outlined text-[#c3c6d5] dark:text-slate-600 group-hover:text-[#00366c] dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all">chevron_right</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Destructive / Logout Action */}
                <footer className="pt-8 pb-12 flex flex-col md:flex-row items-center justify-center gap-4">
                    <button onClick={handleClearCache} className="w-full md:w-auto px-8 py-4 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-extrabold text-[15px] rounded-xl flex items-center justify-center gap-3 hover:bg-orange-200 dark:hover:bg-orange-500/20 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                        Clear Local Cache
                    </button>
                    <button onClick={handleLogout} className="w-full md:w-auto px-12 py-4 bg-[#ba1a1a] dark:bg-red-900/60 text-white font-extrabold text-[15px] rounded-xl flex items-center justify-center gap-3 hover:bg-[#93000a] dark:hover:bg-red-800 transition-colors shadow-lg active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Terminate Session
                    </button>
                </footer>
                <p className="text-center mt-8 text-[10px] uppercase tracking-[0.25em] font-black text-[#c3c6d5] dark:text-slate-600">SukuuPath OS • Core Engine 2.1</p>
            </div>

            {/* Intensive Feature Modals */}
            
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-6">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 dark:focus:border-sky-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 dark:focus:border-sky-500" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button onClick={async () => { 
                                    try {
                                        const res = await fetch('/api/auth/password', {
                                            method: 'PUT',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify({ user_id: userId, old_password: oldPassword, new_password: newPassword })
                                        });
                                        if(!res.ok) throw new Error(await res.text());
                                        alert("Password updated securely!");
                                        setShowPasswordModal(false);
                                        setOldPassword('');
                                        setNewPassword('');
                                    } catch(e) { alert("Failed: Invalid current password."); }
                                }} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">Update Target</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'secondary_email' && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveModal(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-6">Dual Authentication</h3>
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bind an external recovery email to your academic account.</p>
                            <div>
                                <input type="email" placeholder="backup@example.com" value={secondaryEmail} onChange={e => setSecondaryEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 dark:focus:border-sky-500" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Discard</button>
                                <button onClick={async () => {
                                    try {
                                        const res = await fetch('/api/auth/update', {
                                            method: 'PUT',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify({ user_id: userId, secondary_email: secondaryEmail })
                                        });
                                        if(res.ok) {
                                            const stored = JSON.parse(localStorage.getItem('userAccount')||'{}');
                                            stored.secondary_email = secondaryEmail;
                                            localStorage.setItem('userAccount', JSON.stringify(stored));
                                            setActiveModal(null);
                                        }
                                    } catch(e) {}
                                }} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md">Secure Bind</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {['notifications', 'privacy', 'accessibility', 'photo'].includes(activeModal) && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveModal(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-blue-50 dark:bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 dark:text-sky-400">
                            <span className="material-symbols-outlined text-[32px]">{activeModal === 'photo' ? 'camera' : activeModal === 'privacy' ? 'shield' : activeModal === 'accessibility' ? 'accessibility_new' : 'notifications_active'}</span>
                        </div>
                        <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-2 capitalize">{activeModal} Systems</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">This module operates asynchronously. SukuuPath ensures any preference toggle automatically writes to the localized database system.</p>
                        <button onClick={async () => {
                            try {
                                await fetch('/api/user/preferences', {
                                    method: 'PUT',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({ user_id: userId, [activeModal]: true })
                                });
                            } catch(e) {}
                            setActiveModal(null);
                        }} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}

        </StudentLayout>
    );
};

export default SettingsScreen;
