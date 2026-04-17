import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 glass-nav shadow-sm" style={{ background: 'rgba(252, 249, 248, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-black text-primary tracking-tighter font-headline">
            SukuuPath GH
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-on-surface-variant font-medium text-sm">Need help?</span>
            <button className="text-primary font-bold text-sm hover:underline">Contact Support</button>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-lg">
          {/* Asymmetric Layout Container */}
          <div className="grid grid-cols-1 gap-8">
            {/* Reset Card */}
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0px_12px_32px_rgba(27,27,28,0.04)] relative overflow-hidden">
              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/10 rounded-bl-full -mr-16 -mt-16"></div>
              
              {/* Header Content */}
              <div className="mb-10 relative z-10">
                <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
                </div>
                <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">
                  Reset your password
                </h1>
                <p className="text-on-surface-variant leading-relaxed">
                  Enter the email address associated with your account and we'll send you a secure link to reset your password.
                </p>
              </div>
              
              {/* Form Section */}
              <form className="space-y-6 relative z-10" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { auth } = await import('../utils/firebase');
                  const { sendPasswordResetEmail } = await import('firebase/auth');
                  await sendPasswordResetEmail(auth, email);
                  alert("We've sent a password reset link to your email. (If you originally signed up with Google, use the 'Continue with Google' button on the Sign In page instead.)");
                  navigate('/login');
                } catch(err) {
                  alert("Could not send the email. Make sure this email is registered, or try logging in with Google.");
                }
              }}>
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative border-none">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline/60" id="email" name="email" placeholder="e.g. k.mensah@ug.edu.gh" required type="email" />
                  </div>
                </div>
                <button className="w-full bg-primary-gradient text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
                  Send Reset Link
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </form>
              
              {/* Footer Link */}
              <div className="mt-8 pt-8 border-t border-outline-variant/20 flex justify-center">
                <button onClick={() => navigate('/login')} className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium">
                  <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  Back to Sign In
                </button>
              </div>
            </div>
            
            {/* AI Insight Card */}
            <div className="bg-tertiary-container/5 rounded-xl p-6 border border-tertiary-container/10">
              <div className="flex gap-4 items-start">
                <div className="text-tertiary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-tertiary-container text-sm mb-1">Secure Education Gateway</h3>
                  <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
                    SukuuPath GH uses multi-factor authentication protocols to ensure your student records and academic data remain private and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-xs text-outline font-label uppercase tracking-widest">
          © 2024 SukuuPath Ghana • Academic Excellence Through Technology
        </p>
      </footer>
      
      {/* Image for Context */}
      <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none">
        <img alt="Academic background" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAld3Hoz-vvCbHDpVZKsENeYpqp5VQz2CbmIaYz-qZEfb3rGWWbyITk242Q7mBd9ElzcE2BCxC1arhBxkCv7ZlyDrxkssmLqeC0TfxCdP7TFMppETSoWOnq36MVqTUJVgq7TORESBy2xTAKOlAbN_lyUGQEylKi6WKk-Vjcgt28U_mYVCfwQsyk3gbxw5fndG4P2sxfBdK6HP5FSSHTJ5_qzdN6G4JQxuoRbshL9Fgmf59agm8odbKcBoEh4koQbIoRCaa-Ih-U74t" />
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
