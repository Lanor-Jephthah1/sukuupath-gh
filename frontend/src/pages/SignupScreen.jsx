import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup } from '../utils/firebase';

const SignupScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleData = location.state?.googleData;
  
  // Interactive UI states for the new flow
  const [formData, setFormData] = useState({
    firstName: googleData?.first_name || '',
    middleName: '',
    lastName: googleData?.last_name || '',
    email: googleData?.email || '',
    school: '',
    level: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showWaitingOverlay, setShowWaitingOverlay] = useState(false);

  // Form Validation Logic
  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.school?.trim()) newErrors.school = "School is required";
    if (!formData.level?.trim()) newErrors.level = "Education level is required";
    
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.terms) {
      newErrors.terms = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id || e.target.name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for field
    if (errors[id || e.target.name]) {
      setErrors(prev => ({ ...prev, [id || e.target.name]: null }));
    }
  };

  const handleGoogleSignIn = async () => {
    setErrors({});
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          first_name: user.displayName?.split(' ')[0] || "User",
          last_name: user.displayName?.split(' ').slice(1).join(' ') || "Google"
        })
      });

      setIsSubmitting(false);

      if (!response.ok) {
        const errText = await response.text();
        let errorMsg = "Google authentication failed";
        try {
          const errData = JSON.parse(errText);
          
          // Check if this is the 404 redirect signal from backend (New User)
          if (response.status === 404 && errData.detail && errData.detail.is_new_user) {
             const newGoogleData = errData.detail.googleData;
             const generatedPassword = `SukuuPath!${Math.random().toString(36).slice(-8)}`;
             setFormData(prev => ({
               ...prev,
               firstName: newGoogleData.first_name || '',
               lastName: newGoogleData.last_name || '',
               email: newGoogleData.email || '',
               password: generatedPassword,
               confirmPassword: generatedPassword
             }));
             // Optionally auto-generate a random secure password for them so they don't have to type one
             return;
          }
          
          errorMsg = errData.detail?.message || errData.detail || errorMsg;
        } catch(e) {
          errorMsg = errText || errorMsg;
        }
        setErrors({ general: errorMsg });
        return;
      }

      const data = await response.json();
      localStorage.setItem('userAccount', JSON.stringify(data));
      
      // Since Google users bypass profile setup, redirect to profile-setup if school is TBD
      if (data.school === 'TBD') {
        navigate('/profile-setup');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ general: err.message || "An error occurred during Google sign-in." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middleName,
        email: formData.email,
        school: formData.school,
        level: formData.level,
        password: formData.password,
        terms: formData.terms || true
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Registration failed";
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.detail || errData.message || errMsg;
        } catch (e) {}
        setErrors({ email: errMsg });
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      
      // Save session locally
      localStorage.setItem('userAccount', JSON.stringify(data));
      
      setIsSubmitting(false);
      setShowSuccessPopup(true);
      
      // Step 2: Hide success, show wait overlay
      setTimeout(() => {
        setShowSuccessPopup(false);
        setShowWaitingOverlay(true);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }, 2500);

    } catch (err) {
      setErrors({ email: "Could not connect to the Backend server." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen relative">
      
      {/* Waiting Dashboard Full Screen Overlay */}
      {showWaitingOverlay && (
        <div className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center animate-fade-in">
          <div className="relative flex flex-col items-center justify-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            
            <div className="w-16 h-16 border-4 border-surface-container-high border-t-primary rounded-full animate-spin absolute top-4"></div>
            
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-black text-primary font-headline animate-pulse">Building your academic space...</h2>
              <p className="text-on-surface-variant font-medium">Gathering optimal AI tools for your student profile.</p>
            </div>

            <div className="mt-8 flex gap-2">
              <span className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-3 h-3 bg-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-3 h-3 bg-error rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm mr-4 ml-4 transform transition-all duration-300 scale-100">
            <div className="w-20 h-20 bg-tertiary-container/20 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-tertiary-container text-4xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface font-headline mb-2">Account Created!</h2>
            <p className="text-on-surface-variant">Welcome aboard, {formData.firstName}. We're preparing your custom dashboard right now.</p>
          </div>
        </div>
      )}

      <main className="flex min-h-screen overflow-hidden">
        {/* Sidebar Illustration Panel (Desktop Only) */}
        <section className="hidden md:flex flex-col w-5/12 lg:w-1/2 p-12 lg:p-16 justify-center relative overflow-hidden animate-fade-in bg-surface-container-low">
          <div className="absolute top-0 right-0 w-full h-full bg-academic-gradient opacity-10"></div>
          
          <div className="relative z-10 w-full h-full max-h-[800px] flex flex-col justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <span className="font-headline text-2xl font-black tracking-tighter text-primary">SukuuPath GH</span>
            </div>

            <div className="flex-1 my-10 aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
              <img 
                className="w-full h-full object-cover brightness-95" 
                alt="Ghanaian students discussing" 
                src="/signup_students.png"
              />
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
                 <h2 className="font-headline text-3xl font-extrabold text-white leading-tight">
                   Unlock your <br/>academic potential.
                 </h2>
              </div>
            </div>
            
            <p className="text-on-surface-variant text-lg font-medium">
              Join the largest community of students crossing linguistic barriers.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 xl:p-24 bg-surface animate-fade-in-up">
          
          {/* Mobile Illustration Banner */}
          <div className="md:hidden w-full h-40 mb-6 rounded-2xl overflow-hidden relative shadow-md">
            <img className="w-full h-full object-cover" alt="Students" src="/signup_students.png" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
          </div>

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <span className="font-headline text-xl font-black tracking-tighter text-primary">SukuuPath GH</span>
          </div>
          
          <div className="w-full max-w-md">
            <header className="mb-8">
              <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight mb-2">Create your SukuuPath GH account</h1>
              <p className="text-on-surface-variant">Join thousands of students across Ghana today.</p>
            </header>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-error-container/30 border border-error/50 text-error px-4 py-3 rounded-xl text-sm font-bold flex items-start gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span>{errors.general}</span>
                </div>
              )}
              {/* Full Name Grid Container */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="firstName">First name</label>
                  <input value={formData.firstName} onChange={handleChange} className={`w-full px-3 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ${errors.firstName ? 'ring-error focus:ring-error' : 'ring-outline-variant/20 focus:ring-primary'} focus:ring-2 text-sm text-on-surface transition-all`} id="firstName" placeholder="Kwame" type="text" />
                  {errors.firstName && <p className="text-[10px] text-error px-1 font-bold">{errors.firstName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="middleName">Middle name</label>
                  <input value={formData.middleName} onChange={handleChange} className="w-full px-3 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary text-sm text-on-surface placeholder:text-outline/50 transition-all" id="middleName" placeholder="(Optional)" type="text" />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="lastName">Last name</label>
                  <input value={formData.lastName} onChange={handleChange} className={`w-full px-3 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ${errors.lastName ? 'ring-error focus:ring-error' : 'ring-outline-variant/20 focus:ring-primary'} focus:ring-2 text-sm text-on-surface transition-all`} id="lastName" placeholder="Mensah" type="text" />
                  {errors.lastName && <p className="text-[10px] text-error px-1 font-bold">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="email">Email address</label>
                <input value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ${errors.email ? 'ring-error focus:ring-error' : 'ring-outline-variant/20 focus:ring-primary'} focus:ring-2 text-sm text-on-surface transition-all`} id="email" placeholder="kwame@university.edu.gh" type="email" />
                {errors.email && <p className="text-[10px] text-error px-1 font-bold animate-pulse">{errors.email}</p>}
              </div>

              {/* Education Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="school">Institution / School</label>
                  <input value={formData.school || ''} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ${errors.school ? 'ring-error focus:ring-error' : 'ring-outline-variant/20 focus:ring-primary'} focus:ring-2 text-sm text-on-surface transition-all`} id="school" placeholder="E.g. University of Ghana" type="text" />
                  {errors.school && <p className="text-[10px] text-error px-1 font-bold">{errors.school}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="level">Level</label>
                  <input value={formData.level || ''} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ${errors.level ? 'ring-error focus:ring-error' : 'ring-outline-variant/20 focus:ring-primary'} focus:ring-2 text-sm text-on-surface transition-all`} id="level" placeholder="E.g. 100, 200, 300" type="text" />
                  {errors.level && <p className="text-[10px] text-error px-1 font-bold">{errors.level}</p>}
                </div>
              </div>

              {/* Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 ">
                  <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="password">Password</label>
                  <input value={formData.password} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ${errors.password ? 'ring-error focus:ring-error' : 'ring-outline-variant/20 focus:ring-primary'} focus:ring-2 text-sm text-on-surface transition-all`} id="password" placeholder="Min. 8 characters" type="password" />
                  {errors.password && <p className="text-[10px] text-error px-1 font-bold">{errors.password}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1" htmlFor="confirmPassword">Confirm password</label>
                  <input value={formData.confirmPassword} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ${errors.confirmPassword ? 'ring-error focus:ring-error' : 'ring-outline-variant/20 focus:ring-primary'} focus:ring-2 text-sm text-on-surface transition-all`} id="confirmPassword" placeholder="••••••••" type="password" />
                  {errors.confirmPassword && <p className="text-[10px] text-error px-1 font-bold">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-4">
                <div className="pt-0.5">
                  <input checked={formData.terms} onChange={handleChange} className={`w-5 h-5 rounded ${errors.terms ? 'border-error' : 'border-outline-variant'} text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer transition-colors`} id="terms" type="checkbox" />
                </div>
                <label className={`text-sm ${errors.terms ? 'text-error' : 'text-on-surface-variant'} leading-relaxed cursor-pointer select-none transition-colors`} htmlFor="terms">
                  By creating an account, I agree to the <a className="text-primary font-semibold hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-semibold hover:underline" href="#">Privacy Policy</a>.
                </label>
              </div>

              {/* CTA Button */}
              <button 
                disabled={isSubmitting}
                className={`w-full mt-6 ${isSubmitting ? 'bg-outline text-white cursor-not-allowed' : 'bg-primary-gradient text-white hover:shadow-primary/30 active:scale-[0.98]'} font-headline font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group`}
                type="submit"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Create Secure Account
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">lock_open</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 py-6">
              <div className="flex-1 h-px bg-outline-variant opacity-30"></div>
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-outline-variant opacity-30"></div>
            </div>

            {/* Google Signup Button */}
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
            
            <footer className="mt-10 text-center">
              <p className="text-on-surface-variant font-medium text-sm">
                Already have an account? 
                <button onClick={() => navigate('/login')} className="text-primary font-bold ml-1 hover:underline decoration-secondary-container decoration-2 underline-offset-4">Sign In</button>
              </p>
            </footer>
          </div>
          
          {/* Contextual Helper Text */}
          <div className="mt-12 pt-6 border-t border-outline-variant/10 text-center w-full max-w-xs">
            <p className="text-[10px] text-outline uppercase tracking-[0.2em] font-bold">Trusted by academic institutions across Ghana</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignupScreen;
