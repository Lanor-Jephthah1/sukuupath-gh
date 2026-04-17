import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const APP_NAME = "SukuuPath";

const OnboardingScreens = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setIsExiting(true);
    setTimeout(() => navigate(path), 420);
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const step = Math.round(scrollPosition / width);
      if (step !== currentStep) {
        setCurrentStep(step);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < 3 && scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: width * (currentStep + 1),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container transition-opacity duration-500 ${isVisible && !isExiting ? 'opacity-100' : 'opacity-0'}`}>
      <main className="relative h-screen w-full flex flex-col overflow-hidden max-w-md mx-auto sm:max-w-none sm:mx-0 shadow-lg sm:shadow-none bg-surface-container-lowest">
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full z-10 px-6 py-6 flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-2 animate-fade-in-up">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-headline font-extrabold text-lg">S</div>
            <span className="font-headline font-extrabold text-xl tracking-tighter text-primary">{APP_NAME}</span>
          </div>
          {currentStep < 3 && (
            <button 
              onClick={() => handleNavigate('/signup')} 
              className="text-on-surface-variant font-label text-sm font-semibold tracking-wider hover:text-primary transition-colors animate-fade-in-up"
            >
              SKIP
            </button>
          )}
        </div>

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto snap-x snap-mandatory flex scroll-smooth pb-8"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {/* Style for hiding raw webkit scrollbar */}
          <style>{`
            .flex-1::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Section 1 */}
          <section className="min-w-full h-full snap-start flex flex-col items-center justify-center px-6 py-12">
            <div className={`w-full max-w-[320px] aspect-square mb-8 relative transition-all duration-700 transform ${currentStep === 0 ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0'}`}>
              <div className="absolute inset-0 bg-secondary-container/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="relative w-full h-full flex items-center justify-center p-6 bg-surface-container shadow-sm overflow-hidden rounded-full">
                <img 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Modern educational workspace" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfRN7002kVe9v8n3pcglgutg6YJt_FGAo_zBSvjS_bpFuXiGH5VBvrzkcZqb9Na7LplKd5A1sILj8bLJZmre4z3M77IP1BLa47lot6DFI7PUfQRdqT7UFwwXA3NthvN1N4iaz33bBJUsQIOLb4vPNohzMzTxzUQ1uF5T8RH3hwlXzdsG2R6m8veWjG6DtlOqWJdZqGsO-C3FT8R2fp8YgtHyK_OM9neqRY86xQeMaZYrzLsasPoEA4KQHDzHuU0GPb_892yZVYLFz3"
                />
              </div>
            </div>
            <div className={`text-center max-w-sm px-4 transition-all duration-[800ms] delay-200 transform ${currentStep === 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-3 leading-tight tracking-tight">Learn in your Mother Tongue.</h2>
              <p className="text-on-surface-variant text-base leading-relaxed">Bridge the gap between languages. Seamlessly translate complex academic content into Twi, Ewe, Ga, or Fante.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="min-w-full h-full snap-start flex flex-col items-center justify-center px-6 py-12">
            <div className={`w-full max-w-[320px] aspect-square mb-8 relative transition-all duration-700 transform ${currentStep === 1 ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0'}`}>
              <div className="absolute inset-0 bg-tertiary-container/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="relative w-full h-full flex items-center justify-center p-6 bg-surface-container rounded-full shadow-sm overflow-hidden">
                <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
                  <div className="bg-surface-container-high flex flex-col p-4 rounded-3xl justify-center shadow-lg">
                    <span className="material-symbols-outlined text-primary mb-2 text-3xl animate-bounce">description</span>
                    <div className="h-2 w-full bg-outline-variant/30 rounded-full mb-2"></div>
                    <div className="h-2 w-3/4 bg-outline-variant/30 rounded-full"></div>
                  </div>
                  <div className="bg-tertiary flex flex-col p-4 rounded-3xl justify-center shadow-lg transform -translate-y-4">
                    <span className="material-symbols-outlined text-on-tertiary mb-2 text-3xl">auto_awesome</span>
                    <div className="h-2 w-full bg-on-tertiary/40 rounded-full mb-2"></div>
                  </div>
                  <div className="bg-secondary-container col-span-2 p-4 rounded-3xl flex items-center gap-4 shadow-lg transform translate-y-2">
                    <span className="material-symbols-outlined text-on-secondary-container text-3xl animate-pulse">lightbulb</span>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-full bg-on-secondary-container/20 rounded-full"></div>
                      <div className="h-2 w-2/3 bg-on-secondary-container/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`text-center max-w-sm px-4 transition-all duration-[800ms] delay-200 transform ${currentStep === 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-3 leading-tight tracking-tight">Complex, Simplified.</h2>
              <p className="text-on-surface-variant text-base leading-relaxed">Summarize dense chapters, simplify academic jargon, and get instant explanations for tough assignment questions.</p>
            </div>
          </section>

          {/* Section 3 - New Screen */}
          <section className="min-w-full h-full snap-start flex flex-col items-center justify-center px-6 py-12">
            <div className={`w-full max-w-[320px] aspect-square mb-8 relative transition-all duration-700 transform ${currentStep === 2 ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0'}`}>
              <div className="absolute inset-0 bg-info/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-surface-container rounded-full shadow-sm overflow-hidden">
                <span className="material-symbols-outlined text-6xl text-sky-500 mb-4 animate-float">quick_reference_all</span>
                <div className="w-[80%] h-12 bg-white rounded-full flex items-center px-4 shadow shadow-black/5 opacity-90 mb-2 transform -rotate-2">
                  <span className="material-symbols-outlined text-sky-400 text-sm mr-2">search</span>
                  <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                </div>
                <div className="w-[70%] h-10 bg-white rounded-full flex items-center px-4 shadow shadow-black/5 opacity-80 mb-2 transform rotate-3">
                  <span className="material-symbols-outlined text-sky-400 text-sm mr-2">chat</span>
                  <div className="h-2 w-2/3 bg-slate-200 rounded-full"></div>
                </div>
                <div className="w-[85%] h-12 bg-white rounded-full flex items-center px-4 shadow shadow-black/5 opacity-90 transform -rotate-1">
                  <span className="material-symbols-outlined text-sky-400 text-sm mr-2">picture_as_pdf</span>
                  <div className="h-2 w-3/4 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className={`text-center max-w-sm px-4 transition-all duration-[800ms] delay-200 transform ${currentStep === 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h2 className="font-headline text-3xl font-extrabold text-sky-600 mb-3 leading-tight tracking-tight">Chat with your Notes.</h2>
              <p className="text-on-surface-variant text-base leading-relaxed">Upload PDFs, slides, or documents and ask questions directly. Study smarter with AI tailored to your curriculum.</p>
            </div>
          </section>

          {/* Section 4 — Premium Illustration */}
          <section className="min-w-full h-full snap-start flex flex-col items-center justify-center px-6 py-12">
            <div className={`w-full max-w-[320px] aspect-square mb-8 relative transition-all duration-700 transform ${currentStep === 3 ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0'}`}>
              <div className="absolute inset-0 bg-primary/15 rounded-full blur-3xl animate-pulse-slow"></div>
              {/* Card-based illustration */}
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-[#00366c] to-[#004d95] rounded-[32px] shadow-2xl overflow-hidden">
                {/* Background glow rings */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[30px] border-white/5 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-[20px] border-white/[0.03] rounded-full"></div>
                </div>

                {/* Top stat row */}
                <div className="flex gap-3 w-full">
                  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center border border-white/10">
                    <span className="material-symbols-outlined text-[#ffbf2e] text-[22px] mb-1" style={{fontVariationSettings:"'FILL' 1"}}>emoji_events</span>
                    <span className="text-white font-black text-base leading-none">#4</span>
                    <span className="text-white/50 text-[9px] uppercase tracking-widest font-bold mt-0.5">Scholar Rank</span>
                  </div>
                  <div className="flex-1 bg-[#ffbf2e]/20 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center border border-[#ffbf2e]/30">
                    <span className="material-symbols-outlined text-[#ffbf2e] text-[22px] mb-1" style={{fontVariationSettings:"'FILL' 1"}}>local_fire_department</span>
                    <span className="text-white font-black text-base leading-none">12</span>
                    <span className="text-white/50 text-[9px] uppercase tracking-widest font-bold mt-0.5">Day Streak</span>
                  </div>
                  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center border border-white/10">
                    <span className="material-symbols-outlined text-emerald-400 text-[22px] mb-1" style={{fontVariationSettings:"'FILL' 1"}}>quiz</span>
                    <span className="text-white font-black text-base leading-none">94%</span>
                    <span className="text-white/50 text-[9px] uppercase tracking-widest font-bold mt-0.5">Quiz Score</span>
                  </div>
                </div>

                {/* Progress card */}
                <div className="w-full bg-white/10 rounded-2xl p-3.5 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-[11px] font-bold">Weekly Progress</span>
                    <span className="text-[#ffbf2e] text-[11px] font-black">85%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffbf2e] to-emerald-400 rounded-full transition-all duration-1000"
                      style={{width: currentStep === 3 ? '85%' : '0%'}}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    {['M','T','W','T','F'].map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${
                          i < 4 ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/30'
                        }`}>{i < 4 ? '✓' : d}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI badge */}
                <div className="w-full flex items-center gap-3 bg-emerald-400/10 border border-emerald-400/30 rounded-2xl px-4 py-3">
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]" style={{fontVariationSettings:"'FILL' 1"}}>smart_toy</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-[11px]">AI Study Buddy Active</p>
                    <p className="text-white/50 text-[10px] truncate">"Great job completing Biochemistry notes!"</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                </div>
              </div>
            </div>
            <div className={`text-center max-w-sm px-4 transition-all duration-[800ms] delay-200 transform ${currentStep === 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-3 leading-tight tracking-tight">Success starts here.</h2>
              <p className="text-on-surface-variant text-base leading-relaxed">Master your courses with AI-powered quizzes, personalized study notes, and tools designed for student success.</p>
            </div>
          </section>

        </div>

        {/* Footer Area */}
        <footer className="px-6 py-6 pb-12 bg-white/80 backdrop-blur-md rounded-t-[32px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] border-t border-slate-100 z-10 w-full max-w-md mx-auto sm:max-w-none">
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === step ? 'w-8 bg-primary rounded-full' : 'w-2 bg-surface-container-highest'
                }`}
              ></div>
            ))}
          </div>
          
          {currentStep < 3 ? (
            <div className="flex flex-col items-center">
              <button 
                onClick={handleNext}
                className="w-full sm:w-[80%] max-w-[320px] py-3.5 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                CONTINUE <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-center">
              <button 
                onClick={() => handleNavigate('/signup')}
                className="w-full sm:w-[80%] max-w-[320px] py-3.5 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                CREATE ACCOUNT
              </button>
              <button 
                onClick={() => handleNavigate('/login')}
                className="w-full sm:w-[80%] max-w-[320px] py-3.5 bg-surface-container-high text-on-surface font-headline font-bold rounded-2xl active:scale-95 transition-transform hover:bg-surface-container-highest"
              >
                SIGN IN
              </button>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
};

export default OnboardingScreens;
