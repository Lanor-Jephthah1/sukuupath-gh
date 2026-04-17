import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const APP_NAME = "SukuuPath";

const SUGGESTED_INTERESTS = [
  "Sociology", "Political Science", "Business", "Biology", 
  "Computer Science", "Economics", "Constitutional Law", 
  "Mathematics", "Nursing", "African Studies"
];

const ProfileSetupScreen = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedLevel, setSelectedLevel] = useState("ug");
  const [interests, setInterests] = useState(["Sociology", "Political Science"]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [learningStyle, setLearningStyle] = useState("visual");

  const handleAddInterest = (interest) => {
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddInterest(inputValue.trim());
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-surface to-surface">
      <header className="docked w-full top-0 sticky z-50 glass-nav shadow-sm transition-all duration-300" style={{ background: 'rgba(252, 249, 248, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-headline font-extrabold text-lg">S</div>
            <div className="text-xl font-black text-blue-900 tracking-tighter font-headline">{APP_NAME}</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">translate</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 lg:py-16">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Welcome & Image */}
          <section className="lg:col-span-5 space-y-8 sticky top-32">
            <div className="inline-flex items-center gap-2 bg-secondary-container/20 text-on-secondary-container px-4 py-2 rounded-full border border-secondary-container/30">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="font-label text-xs font-bold uppercase tracking-wider">Setup • Step 2 of 3</span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight animate-fade-in-up">
              Set up your learning preferences
            </h1>
            
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Customize your {APP_NAME} experience. We use these details to curate Ghanaian academic resources specifically for your level.
            </p>
            
            <div className="hidden lg:block pt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="relative h-[320px] w-full rounded-3xl overflow-hidden shadow-2xl group">
                <img alt="Academic Setup" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDicKLl7fvO5urKrFCn8eMz4US_4YRhhBCA4q-otBsW7cRoh5To0vFIEi0JRvuKipNvuvt4QSEzil2sGNBIlwZMss8veJyP3M1EgNrt--QeIFUaBYqaMTCqbD1nz7Zha5hwfoDWSeiUVRG3_HPgOLUGGK1ROxJkI7_MjZJgasUfsL29W7XDksSYuWYIbGhL73OF2KR5DASyPZqAgUA_-aDPtNzW4Leno-cRJ4oGQi2VgwjsV173TwWAd_1YNWBzf9IAGQUUlxJBBS6a" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-primary/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white transform group-hover:-translate-y-2 transition-transform duration-500">
                  <p className="font-headline font-bold text-2xl leading-tight mb-2">Empowering students through tailored intelligence.</p>
                  <div className="h-1 w-12 bg-secondary rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Interactive Form */}
          <section className="lg:col-span-7">
            <div className="bg-surface-container-lowest p-6 sm:p-10 md:p-12 rounded-[2rem] shadow-[0px_12px_40px_rgba(27,27,28,0.08)] space-y-12 border border-outline-variant/10 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              {/* 1. Language Selection */}
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end">
                  <label className="font-headline text-xl font-bold text-primary block">
                    Preferred Language for Explanations
                  </label>
                  <span className="text-secondary font-label text-xs font-bold uppercase tracking-widest bg-secondary/10 px-2 py-1 rounded-md">Primary</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['English', 'Twi', 'Ewe', 'Ga', 'Fante'].map((lang) => (
                    <button 
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-6 py-3 rounded-full font-label text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 border
                        ${selectedLanguage === lang 
                          ? 'bg-secondary-container text-on-secondary-container border-secondary-container shadow-md scale-105' 
                          : 'bg-surface-container hover:bg-surface-container-high border-transparent text-on-surface'}`}
                    >
                      {selectedLanguage === lang && <span className="material-symbols-outlined text-[18px] animate-bounce-in" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Academic Level */}
              <div className="space-y-6 relative z-10">
                <label className="font-headline text-xl font-bold text-primary block">
                  Current Academic Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'ug', title: 'UG', desc: 'Undergraduate', icon: 'school' },
                    { id: 'pg', title: "Master's", desc: 'Postgraduate', icon: 'workspace_premium' },
                    { id: 'phd', title: 'PhD', desc: 'Doctoral', icon: 'menu_book' }
                  ].map((level) => (
                    <div 
                      key={level.id} 
                      onClick={() => setSelectedLevel(level.id)}
                      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-2 relative overflow-hidden group
                        ${selectedLevel === level.id 
                          ? 'border-primary bg-primary/5 shadow-inner' 
                          : 'border-surface-container-high bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low'}`}
                    >
                      {selectedLevel === level.id && (
                        <div className="absolute top-2 right-2 text-primary animate-fade-in">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                      )}
                      <span className={`material-symbols-outlined text-4xl transition-transform duration-300 group-hover:scale-110 ${selectedLevel === level.id ? 'text-primary' : 'text-on-surface-variant'}`}>{level.icon}</span>
                      <span className={`font-bold ${selectedLevel === level.id ? 'text-primary' : 'text-on-surface'}`}>{level.title}</span>
                      <span className="text-xs text-on-surface-variant">{level.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. New Feature: Learning Style */}
              <div className="space-y-6 relative z-10">
                <label className="font-headline text-xl font-bold text-primary block">
                  How do you learn best?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'visual', label: 'Visual', icon: 'visibility', desc: 'Diagrams & videos' },
                    { id: 'reading', label: 'Reading', icon: 'article', desc: 'Text & notes' },
                    { id: 'auditory', label: 'Auditory', icon: 'headphones', desc: 'Listening & speaking' },
                    { id: 'practice', label: 'Practice', icon: 'model_training', desc: 'Quizzes & tests' }
                  ].map(style => (
                    <div 
                      key={style.id}
                      onClick={() => setLearningStyle(style.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all active:scale-[0.98]
                        ${learningStyle === style.id 
                          ? 'bg-tertiary-container/30 border-tertiary text-on-tertiary-container shadow-sm' 
                          : 'bg-surface border-transparent hover:bg-surface-container'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${learningStyle === style.id ? 'bg-tertiary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{style.label}</span>
                        <span className="text-[10px] opacity-80">{style.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Subject Interests (Dynamic Tags) */}
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <label className="font-headline text-xl font-bold text-primary block" htmlFor="interests">
                    Subject Interests
                  </label>
                  <span className="text-xs text-on-surface-variant">Press Enter to add</span>
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant peer-focus:text-primary transition-colors">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input 
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface placeholder:text-outline transition-all" 
                    id="interests" 
                    placeholder="e.g. Constitutional Law, Biochemistry..." 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {if(inputValue) setShowSuggestions(true)}}
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && inputValue && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                      {SUGGESTED_INTERESTS.filter(i => i.toLowerCase().includes(inputValue.toLowerCase()) && !interests.includes(i)).length > 0 ? (
                        SUGGESTED_INTERESTS
                          .filter(i => i.toLowerCase().includes(inputValue.toLowerCase()) && !interests.includes(i))
                          .map(suggestion => (
                            <div 
                              key={suggestion}
                              onClick={() => handleAddInterest(suggestion)}
                              className="px-4 py-3 hover:bg-surface-container cursor-pointer flex items-center justify-between group"
                            >
                              <span className="font-medium text-sm">{suggestion}</span>
                              <span className="material-symbols-outlined text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                            </div>
                          ))
                      ) : (
                        <div 
                          className="px-4 py-3 hover:bg-surface-container cursor-pointer flex items-center gap-2 text-primary"
                          onClick={() => handleAddInterest(inputValue.trim())}
                        >
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          <span className="font-medium text-sm">Add "{inputValue}"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
                  {interests.length === 0 && <span className="text-sm text-on-surface-variant italic">No subjects added yet.</span>}
                  {interests.map(interest => (
                    <span key={interest} className="text-sm font-medium text-on-tertiary-fixed-variant bg-tertiary-fixed/80 border border-tertiary-fixed px-3 py-1.5 rounded-full flex items-center gap-1 animate-scale-in">
                      {interest}
                      <button onClick={() => removeInterest(interest)} className="hover:bg-black/10 rounded-full p-0.5 ml-1 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <hr className="border-outline-variant/20 relative z-10" />

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4 relative z-10">
                <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98] flex-grow text-center flex items-center justify-center gap-2">
                  Complete Setup <span className="material-symbols-outlined">check</span>
                </button>
                <button onClick={() => navigate('/dashboard')} className="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-headline font-bold text-lg hover:bg-surface-container-highest transition-colors active:scale-[0.98] text-center shrink-0">
                  Skip
                </button>
              </div>

            </div>
          </section>
        </div>
      </main>

      <footer className="py-8 bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-on-surface-variant text-sm font-medium">© 2024 {APP_NAME}. Supporting Ghanaian Academic Excellence.</p>
          <div className="flex gap-6">
            <button className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors">Privacy</button>
            <button className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors">Terms</button>
            <button className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfileSetupScreen;
