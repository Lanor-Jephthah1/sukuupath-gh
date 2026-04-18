import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup } from '../utils/firebase';

const SigninScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      window.clearTimeout(timeoutId);

      setIsSubmitting(false);

      if (!response.ok) {
        const errText = await response.text();
        let errorMsg = "Invalid email or password";
        try {
          const errData = JSON.parse(errText);
          errorMsg = errData.detail || errorMsg;
        } catch(e) {
          errorMsg = errText || errorMsg;
        }
        setError(errorMsg);
        return;
      }

      const data = await response.json();
      
      // Grant local session caching for Dashboards
      localStorage.setItem('userAccount', JSON.stringify(data));
      if (remember) localStorage.setItem('keepSignedIn', 'true');
      else localStorage.removeItem('keepSignedIn');
      
      navigate('/student-dashboard');
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.name === 'AbortError'
          ? 'Login took too long. Please try again.'
          : 'Could not connect to the Backend server! Make sure FastAPI is running.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: user.email,
          first_name: user.displayName?.split(' ')[0] || "User",
          last_name: user.displayName?.split(' ').slice(1).join(' ') || "Google"
        })
      });

      window.clearTimeout(timeoutId);

      setIsSubmitting(false);

      if (!response.ok) {
        const errText = await response.text();
        let errorMsg = "Google authentication failed";
        try {
          const errData = JSON.parse(errText);
          
          // Check if this is the 404 redirect signal from backend
          if (response.status === 404 && errData.detail && errData.detail.is_new_user) {
            navigate('/signup', { state: { googleData: errData.detail.googleData } });
            return;
          }
          
          errorMsg = errData.detail?.message || errData.detail || errorMsg;
        } catch(e) {
          errorMsg = errText || errorMsg;
        }
        setError(errorMsg);
        return;
      }

      const data = await response.json();
      localStorage.setItem('userAccount', JSON.stringify(data));
      
      // If user is brand new (school is "TBD"), redirect to profile-setup
      if (data.school === 'TBD') {
        navigate('/profile-setup');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.name === 'AbortError'
          ? 'Login took too long. The Backend server is unresponsive.'
          : err.message || "Could not connect to the Backend server! Make sure FastAPI is running."
      );
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center">
      <main className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left Section: Branding & Form */}
        <section className="w-full md:w-5/12 lg:w-4/12 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 z-10 bg-surface animate-fade-in-up">
          
          {/* Mobile Illustration Banner */}
          <div className="md:hidden w-full h-40 mb-8 rounded-2xl overflow-hidden relative shadow-md">
            <img className="w-full h-full object-cover" alt="Students" src="/signin_students.png" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
          </div>

          {/* Logo & Brand Anchor */}
          <header className="mb-10 md:mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-academic-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="font-headline text-xl font-extrabold tracking-tighter text-primary">SukuuPath GH</span>
            </div>
          </header>
          
          {/* Headline Content */}
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-3">Welcome back</h1>
            <p className="text-on-surface-variant text-base">Continue your academic excellence journey with our AI-powered assistant.</p>
          </div>
          
          {/* Sign In Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container/30 border border-error/50 text-error px-4 py-3 rounded-xl text-sm font-bold flex items-start gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant px-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline" id="email" name="email" placeholder="name@university.edu.gh" required type="email" />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1.5 mb-2">
              <div className="flex justify-between items-center">
                <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="password">Password</label>
              </div>
              <div className="flex items-center justify-between mb-8 select-none">
                <div className="flex items-center gap-2">
                  <input 
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer transition-colors" 
                    id="remember" 
                    type="checkbox" 
                  />
                  <label className="text-sm font-semibold text-on-surface-variant cursor-pointer hover:text-primary transition-colors" htmlFor="remember">Keep me signed in</label>
                </div>
                <button 
                  className="text-primary font-bold text-sm tracking-tight hover:underline flex items-center gap-1 group" 
                  onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline" id="password" name="password" placeholder="••••••••" required type="password" />
              </div>
            </div>
            
            {/* CTA Button */}
            <button disabled={isSubmitting} className={`w-full py-4 ${isSubmitting ? 'bg-outline text-white opacity-80 cursor-not-allowed' : 'bg-academic-gradient text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]'} font-headline font-bold rounded-xl transition-all flex items-center justify-center gap-2`} type="submit">
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-outline-variant opacity-30"></div>
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-outline-variant opacity-30"></div>
            </div>

            {/* Google Social Button */}
            <button 
              onClick={(e) => { e.preventDefault(); handleGoogleSignIn(); }}
              className="w-full py-3.5 bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-bold rounded-xl hover:bg-surface-container-low transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
          
          {/* Secondary Link */}
          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account? 
              <button type="button" onClick={() => navigate('/signup')} className="text-primary font-bold hover:underline ml-1">Create one</button>
            </p>
          </div>
          
          {/* Role Caption */}
          <footer className="mt-auto pt-12">
            <div className="p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-container-lowest text-tertiary">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </div>
              <p className="text-[11px] font-medium text-on-surface-variant leading-tight">
                Authorized access for <span className="text-on-surface font-bold">Students</span> using their SukuuPath academic workspace.
              </p>
            </div>
          </footer>
        </section>
        
        {/* Right Section: Illustration (Desktop Only) */}
        <section className="hidden md:flex flex-1 relative bg-surface-container-low overflow-hidden items-center justify-center animate-fade-in">
          <div className="absolute top-20 right-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl animate-pulse-slow delay-700"></div>
          <div className="relative z-10 w-full max-w-2xl px-12">
            <div className="aspect-[4/3] rounded-3xl bg-white shadow-2xl overflow-hidden relative group">
              <img className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-700" alt="Group of diverse Ghanaian university students" src="/signin_students.png" />
              <div className="absolute bottom-6 left-6 right-6 glass-panel p-6 rounded-2xl border border-white/40 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container flex-shrink-0">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-primary mb-1">Bridge the Language Gap</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      "Our AI identifies complex academic jargon and translates them into simplified context, ensuring every student learns with clarity."
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 space-y-4 max-w-md">
              <h2 className="font-headline text-3xl font-extrabold text-primary leading-tight">Empowering Ghana's Academic Future.</h2>
              <p className="text-on-surface-variant text-lg">SukuuPath GH leverages high-performance AI to curate and simplify your learning experience across all Ghanaian tertiary institutions.</p>
              <div className="flex flex-wrap gap-2 pt-4">
                <span className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold shadow-sm">English</span>
                <span className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">Twi</span>
                <span className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">Ga</span>
                <span className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">Ewe</span>
                <span className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">+ More</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-academic-gradient opacity-10 rounded-full"></div>
        </section>
      </main>
    </div>
  );
};

export default SigninScreen;
