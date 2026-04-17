import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LecturerLayout from '../components/LecturerLayout';
import { postJson, getJson } from '../utils/api';
import ConfidenceBadge from '../components/ConfidenceBadge';

const LecturerDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('Dr. Kwame Mensah');
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    materials: 0,
    students: 1204,
    accuracy: 88,
    feedback: 0
  });
  const [materials, setMaterials] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  
  // AI Insights mockup / real fetch
  const [aiInsight, setAiInsight] = useState({
    term: 'Momentum',
    issue: 'Frequently confused with Inertia in Twi sessions.',
    suggestion: "Use the 'Abusuafie' (family house) analogy for better context."
  });

  useEffect(() => {
    const stored = localStorage.getItem('userAccount');
    if (stored) {
      const acc = JSON.parse(stored);
      setUserName(`${acc.first_name || acc.firstName || ''} ${acc.last_name || acc.lastName || ''}`);
      setUserId(acc.id);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mats = await getJson('/api/materials');
      setMaterials(mats);
      
      const fb = await getJson('/api/feedback/recent?limit=50');
      setFeedback(fb);
      
      const fbStats = await getJson('/api/feedback/stats');
      setStats(prev => ({
        ...prev,
        materials: mats.length,
        feedback: fbStats.total,
        accuracy: fbStats.accuracy_rate
      }));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('file', uploadFile);
    if (userId) formData.append('uploader_id', userId);

    try {
      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        setUploadTitle('');
        setUploadFile(null);
        fetchData();
        // Reset file input if needed
        const fileInput = document.getElementById('file-upload-input');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResolveFeedback = async (id) => {
    try {
      await fetch(`/api/feedback/${id}/resolve`, { method: 'PATCH' });
      fetchData();
    } catch (err) {
      console.error("Resolution failed", err);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await fetch(`/api/materials/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // --- Sub-components (Tabs) ---

  const OverviewTab = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-3xl font-black font-headline text-[#00366c] dark:text-sky-400">Welcome Back, {userName}</h2>
          <p className="text-slate-500 font-medium mt-1">Here is what is happening across your courses today.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => navigate('?tab=materials')} className="px-5 py-2.5 bg-[#00366c] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#00366c]/20 flex items-center gap-2">
             <span className="material-symbols-outlined text-[18px]">add</span>
             Upload Material
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Courses Materials', val: stats.materials, icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Active Students', val: stats.students.toLocaleString(), icon: 'groups', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'System Accuracy', val: `${stats.accuracy}%`, icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Unresolved Feedback', val: stats.feedback, icon: 'notification_important', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md group">
            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-[24px]">{kpi.icon}</span>
            </div>
            <p className="text-3xl font-black text-slate-800 dark:text-white font-headline leading-none">{kpi.val}</p>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Trend Chart (SVG) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-bold text-lg">Platform Engagement Trend</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-48 flex items-end justify-between gap-3 px-2">
            {[45, 60, 40, 85, 70, 95, 80].map((h, i) => (
              <div key={i} className="w-full bg-[#00366c]/10 dark:bg-[#00366c]/20 hover:bg-[#00366c] dark:hover:bg-sky-500 rounded-t-xl transition-all duration-500 cursor-pointer relative group" style={{ height: `${h}%` }}>
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                   {Math.floor(h * 24)} hits
                 </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</span>)}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-academic-gradient rounded-[28px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/10">
           <div className="relative z-10 flex flex-col h-full">
             <div className="flex items-center gap-2 mb-6">
               <span className="material-symbols-outlined text-[20px] text-amber-300">auto_awesome</span>
               <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">AI Terminology Insight</span>
             </div>
             <div className="flex-1">
               <h4 className="text-xl font-black mb-3 italic">"{aiInsight.term}" Confusion</h4>
               <p className="text-sm leading-relaxed opacity-90 font-medium">
                 {aiInsight.issue}
               </p>
               <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200 mb-2">Recommendation</p>
                 <p className="text-sm font-semibold italic">"{aiInsight.suggestion}"</p>
               </div>
             </div>
             <button className="mt-8 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
               Refresh Insights <span className="material-symbols-outlined text-[16px]">refresh</span>
             </button>
           </div>
           {/* Decorative circles */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50" />
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50" />
        </div>
      </div>

      {/* Priority Topics List */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-headline font-bold text-lg mb-6">Priority Difficulty Topics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 1, title: 'Quantum Symmetries', count: 42, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { id: 2, title: 'Entropy Defintion', count: 28, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { id: 3, title: 'Matrix Factorization', count: 14, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
          ].map(topic => (
            <div key={topic.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer group shadow-none hover:shadow-md">
              <div className={`w-12 h-12 rounded-xl ${topic.bg} ${topic.color} flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform`}>
                #{topic.id}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-slate-800 dark:text-white truncate">{topic.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{topic.count} Student Requests</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[#00366c] transition-colors">arrow_forward</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MaterialsTab = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black font-headline text-[#00366c] dark:text-sky-400">Course Materials</h2>
         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{materials.length} Items Total</span>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Upload Form */}
         <div className="bg-white dark:bg-slate-900 p-8 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm h-fit sticky top-24">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">cloud_upload</span>
              Upload New Content
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Document Title</label>
                 <input 
                   type="text" 
                   value={uploadTitle}
                   onChange={e => setUploadTitle(e.target.value)}
                   placeholder="e.g. Intro to Particle Physics" 
                   className="w-full px-4 py-3 pb-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select File (PDF, DOCX)</label>
                 <div className="relative group cursor-pointer">
                    <input 
                      id="file-upload-input"
                      type="file" 
                      onChange={e => setUploadFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${uploadFile ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/5' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600'}`}>
                       <span className={`material-symbols-outlined text-3xl ${uploadFile ? 'text-blue-500' : 'text-slate-300'}`}>
                         {uploadFile ? 'task' : 'upload_file'}
                       </span>
                       <span className="text-xs font-bold text-slate-500 text-center">
                         {uploadFile ? uploadFile.name : 'Click to select or drag and drop'}
                       </span>
                    </div>
                 </div>
               </div>
               <button 
                 disabled={isUploading || !uploadFile || !uploadTitle}
                 className="w-full py-4 mt-2 bg-[#00366c] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#00366c]/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {isUploading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><span>Complete Upload</span><span className="material-symbols-outlined text-[18px]">publish</span></>}
               </button>
            </form>
         </div>

         {/* Materials List */}
         <div className="lg:col-span-2 space-y-4">
            {materials.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[28px] border border-dashed border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">folder_open</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No materials uploaded yet</p>
              </div>
            ) : (
              materials.map(mat => (
                <div key={mat.id} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 hover:shadow-md transition-all group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase ${mat.file_type === 'pdf' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                    {mat.file_type}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{mat.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {mat.original_filename} • {Math.round((mat.file_size || 0) / 1024)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-6 pr-2">
                    <div className="text-center">
                       <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{mat.view_count}</p>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Views</p>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={`/api/${mat.file_path}`} 
                        download
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </a>
                      <button 
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
         </div>
       </div>
    </div>
  );

  const FeedbackTab = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black font-headline text-[#00366c] dark:text-sky-400">Student Feedback Log</h2>
         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{feedback.length} Recent entries</span>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden whitespace-nowrap">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Material / Source</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Feedback Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Language</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Rating</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-sm">
              {feedback.map(fb => (
                <tr key={fb.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-5 max-w-[240px] truncate pr-8">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{fb.content_preview || 'General session'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{fb.output_type}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      fb.feedback_type === 'Correct' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      fb.feedback_type === 'Wrong' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                      {fb.feedback_type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-black tracking-widest text-[11px] uppercase">
                    {fb.language}
                  </td>
                  <td className="px-6 py-5">
                    <ConfidenceBadge confidence={fb.confidence} />
                  </td>
                  <td className="px-6 py-5">
                    {fb.is_resolved ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Resolved
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleResolveFeedback(fb.id)}
                        className="text-[10px] font-black text-blue-600 dark:text-sky-400 uppercase tracking-widest hover:underline"
                      >
                        Mark Reviewed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );

  const TranslationsTab = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black font-headline text-[#00366c] dark:text-sky-400">Review Translations</h2>
         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{materials.length} Materials for Review</span>
       </div>

       <div className="grid grid-cols-1 gap-6">
          {materials.length === 0 ? (
            <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[28px] border border-dashed border-slate-200 dark:border-slate-700">
               <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">g_translate</span>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No materials to translate yet</p>
            </div>
          ) : (
            materials.map(mat => (
              <div key={mat.id} className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow group">
                 <div className="p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[10px] ${mat.file_type === 'pdf' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                         {mat.file_type.toUpperCase()}
                       </span>
                       <div>
                         <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{mat.title}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{mat.original_filename}</p>
                       </div>
                    </div>
                    <div className="space-y-3 mt-8">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Language</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">English (Academic)</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Context</span>
                          <span className="text-xs font-bold text-[#00366c] dark:text-sky-400">Local Ghanaian (Twi/Ga/Ewe)</span>
                       </div>
                    </div>
                    <button className="w-full mt-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">edit_note</span>
                       Modify Base Context
                    </button>
                 </div>
                 
                 <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Source Excerpt</span>
                          <span className="material-symbols-outlined text-slate-300 text-[18px]">content_copy</span>
                       </div>
                       <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[120px]">
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic">
                            "The fundamental principles of thermodynamics dictate that energy cannot be created nor destroyed, only transformed from one state to another."
                          </p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-[#00366c] dark:text-sky-400 tracking-widest">AI Translation (Twi Context)</span>
                          <ConfidenceBadge confidence="high" />
                       </div>
                       <div className="p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 min-h-[120px]">
                          <p className="text-sm text-[#00366c] dark:text-sky-300 font-bold leading-relaxed">
                            "Thermodynamics nnyinaso titiriw no kyerɛ sɛ tumi (energy) biara nni hɔ a yɛbɛtumi abɔ anaasɛ yɛbɛsɛe no, na mmom yɛsesa no firi kwan foforɔ so."
                          </p>
                       </div>
                       <div className="flex gap-2 justify-end">
                          <button className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg hover:bg-emerald-100 transition-colors">
                             <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          </button>
                          <button className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-lg hover:bg-rose-100 transition-colors">
                             <span className="material-symbols-outlined text-[18px]">flag</span>
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );

  const EngagementTab = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black font-headline text-[#00366c] dark:text-sky-400">Student Engagement</h2>
         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Usage Analytics</span>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <h3 className="font-headline font-bold text-lg mb-8">Popular Materials</h3>
             <div className="space-y-6">
                {(materials.slice(0, 5)).map((mat, i) => (
                  <div key={mat.id} className="flex items-center gap-4">
                     <span className="text-xs font-black text-slate-300 w-4">0{i+1}</span>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                           <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{mat.title}</span>
                           <span className="text-[10px] font-black text-[#00366c] dark:text-sky-400">{mat.view_count} Views</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-[#00366c] dark:bg-sky-500 transition-all duration-1000" 
                              style={{ width: `${Math.min(100, (mat.view_count / 100) * 100)}%` }} 
                           />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <h3 className="font-headline font-bold text-lg mb-8">Language Preference</h3>
             <div className="flex items-center justify-center py-4">
                {/* SVG Donut Chart Mockup */}
                <svg className="w-48 h-48 transform -rotate-90">
                   <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                   <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset="150" className="text-[#00366c] dark:text-sky-500" />
                   <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset="350" className="text-amber-400" />
                   <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset="450" className="text-rose-400" />
                </svg>
                <div className="ml-10 space-y-3">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00366c] dark:bg-sky-500"></div><span className="text-xs font-bold">Twi (65%)</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div><span className="text-xs font-bold">Ga (20%)</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-400"></div><span className="text-xs font-bold">Ewe (15%)</span></div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black font-headline text-[#00366c] dark:text-sky-400">Usage Analytics</h2>
         <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all flex items-center gap-2">
           <span className="material-symbols-outlined text-[16px]">download</span> Export Report
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm col-span-1 md:col-span-3">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-headline font-bold text-lg">Detailed Platform Activity</h3>
                <div className="flex gap-2">
                   <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Active Students</span>
                   <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Total Visits</span>
                </div>
             </div>
             {/* Large Area Chart Mockup */}
             <div className="h-64 w-full relative">
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,200 Q150,50 300,150 T600,100 T900,180 T1200,80 L1200,256 L0,256 Z" fill="url(#grad1)" fillOpacity="0.2" />
                    <path d="M0,200 Q150,50 300,150 T600,100 T900,180 T1200,80" fill="none" stroke="#3b82f6" strokeWidth="4" />
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                </svg>
             </div>
             <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <LecturerLayout>
       <div className="p-8 md:p-12 pb-24 h-full overflow-y-auto">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'materials' && <MaterialsTab />}
          {activeTab === 'feedback' && <FeedbackTab />}
          {activeTab === 'translations' && <TranslationsTab />}
          {activeTab === 'engagement' && <EngagementTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
       </div>
    </LecturerLayout>
  );
};

export default LecturerDashboard;
