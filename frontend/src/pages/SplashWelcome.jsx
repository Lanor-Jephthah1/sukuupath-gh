import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const translations = {
  English: {
    heroTitle: <>Learn better in <span className="text-primary italic">English</span> and <span className="text-secondary">Ghanaian</span> languages.</>,
    heroSub: "SukuuPath GH combines cutting-edge AI with local linguistic expertise to help students master academic terms in Twi, Ewe, Ga, Fante, and more.",
    getStarted: "Get Started",
    signIn: "Sign In",
    featureHeading: "Academic excellence without barriers.",
    featureSub: "We leverage advanced LLMs fine-tuned on Ghanaian educational curricula and native languages to provide context-aware learning.",
    feature1Title: "Academic Glossary",
    feature1Desc: "Access thousands of academic terms explained in plain English and localized dialects for better retention.",
    feature2Title: "Simplify Terms",
    feature2Desc: 'Complex theories made simple. Ask our AI to "Explain it like I\'m 5" in Twi or English instantly.',
    feature3Title: "Practice Quizzes",
    feature3Desc: "Test your knowledge with adaptive quizzes that adjust to your learning pace and language preference.",
    bridgeTheGap: "Bridge the Gap",
    scholarText: "Empowering the next generation of scholars.",
    instantDialect: "Instant Dialect Support",
    dialectText: "Translate complex biology or math terms into Fante in seconds.",
    supportTitle: "24/7 Academic Support",
    aiText: "\"Mema wo akye! How can I help you with your essay today?\"",
    trustedBy: "Trusted by Students From"
  },
  Twi: {
    heroTitle: <>Sua adeɛ yie wɔ <span className="text-primary italic">Borɔfo</span> ne <span className="text-secondary">Ghana</span> kasa ahorow mu.</>,
    heroSub: "SukuuPath GH de AI nimdeɛ ne mpɔtam kasa ho nyansa abom de boa asukuufoɔ ma wɔte adesua mu nsɛm ase wɔ Twi, Ewe, Ga, Fante ne nea ɛkeka ho mu.",
    getStarted: "Hyɛ Aseɛ",
    signIn: "Kɔ Mu",
    featureHeading: "Nimdeɛ pa a akwansideɛ nni mu.",
    featureSub: "Yɛde LLMs a wɔahyehyɛ no yie wɔ Ghana adesua nhyehyɛeɛ ne mpɔtam kasa mu di dwuma de ma adesua tebea a ɛfata.",
    feature1Title: "Adesua Nsɛmfua Nkyerɛaseɛ",
    feature1Desc: "Nya adesua nsɛmfua mpempem pii a wɔakyerɛkyerɛ mu wɔ Borɔfo ne mpɔtam kasa mu ama woate aseɛ yie.",
    feature2Title: "Ma Nsɛmfua Nyɛ Mmerɛ",
    feature2Desc: 'Nneɛma a emu yɛ den bɛyɛ mmerɛ. Bisa yɛn AI sɛ "Kyerɛkyerɛ mu te sɛ nea madi mfeɛ 5" wɔ Twi anaa Borɔfo mu ntɛm ara.',
    feature3Title: "Sɔ Wo Ho Hwɛ",
    feature3Desc: "Sɔ wo nimdeɛ hwɛ denam nsɔhwɛ a ɛsesa ma ɛne wo pɛ a wopɛ wɔ adesua mu ne kasa fã so.",
    bridgeTheGap: "Pata Ntam KWAN Nno",
    scholarText: "Ma awo ntoatoasoɔ a ɛreba no ahoɔden.",
    instantDialect: "Kasa Mmoa A Ɛyɛ Ntɛm",
    dialectText: "Kyerɛ nsɛmfua a emu yɛ den ase kɔ Fante mu wɔ nnawɔtwe kakraa bi mu.",
    supportTitle: "Adesua mu Mmoa Nyinaa Dabiara",
    aiText: "\"Mema wo akye! Mɛyɛ dɛn aboa wo wɔ wo twerɛ no mu nɛ?\"",
    trustedBy: "Asukuufoɔ a Wɔde Wɔn Ho To Yɛn So"
  },
  Ewe: {
    heroTitle: <>Srɔ̃ nu nyuie le <span className="text-primary italic">Eŋlisigbe</span> kple <span className="text-secondary">Ghana</span> gbewo me.</>,
    heroSub: "SukuuPath GH tsɔ AI kple mpɔtam gbewo ƒe sidzedze kpe ɖe enu be wòakpe ɖe sukuviwo ŋu woase nusɔsrɔ̃ ƒe nyawo gɔme le Twi, Ewe, Ga, Fante kple bubuawo me.",
    getStarted: "Dze Egɔme",
    signIn: "Ge Ðe Eme",
    featureHeading: "Nususrɔ̃ nyui si mexe mɔ na o.",
    featureSub: "Míezãa LLMs siwo wode ho ɖe Ghana ƒe nusɔsrɔ̃ kple dzɔtsoƒegbewo me be wòana nusɔsrɔ̃ si sɔ kple nɔnɔmea.",
    feature1Title: "Nusɔsrɔ̃ Ŋuti Nyawo",
    feature1Desc: "Kpɔ nusɔsrɔ̃ ƒe nya akpe akpe aɖewo siwo gɔme woɖe le Eŋlisigbe kple mpɔtam gbewo me be nàse wo gɔme nyuie.",
    feature2Title: "Na Nyawo Nanya Se",
    feature2Desc: 'Nusiwo gɔmèsese sesẽ la bɔbɔ. Bia míaƒe AI se be "Ðe egɔme nam abe ɖe mexɔ ƒe 5 ene" le Twi alo Eŋlisigbe me enumake.',
    feature3Title: "Dodokpɔwo Dodokpɔ",
    feature3Desc: "Kpɔ wò sidzedze dze mɔ to dodokpɔ siwo trɔna ɖe wò nusɔsrɔ̃ ƒe ablaɖeɖe kple gbe si nèlɔ̃na ŋu.",
    bridgeTheGap: "Tsɔ Dzi le Eme",
    scholarText: "Ame yeyewo kpekpe ɖe ŋu be woanyo.",
    instantDialect: "Gbeŋutinya Kpekpeɖeŋu Enumake",
    dialectText: "Ðe nya sesẽwo gɔme ɖe Fante me le sekuŋti ʋɛ aɖewo megbe.",
    supportTitle: "Amedzro Kpekpeɖeŋu Ŋkeke 24",
    aiText: "\"Mema wo akye! Aleke mateŋu akpe ɖe ŋuwò egbea?\"",
    trustedBy: "Sukuvi Siwo Tso Kafu Mía"
  },
  Ga: {
    heroTitle: <>Kasemɔ nɔ kpakpa yɛ <span className="text-primary italic">Bɔfo</span> kɛ <span className="text-secondary">Ghana</span> wiemɔi amli.</>,
    heroSub: "SukuuPath GH kɛ AI kɛ he wiemɔ he nilee ekpe kɛ ye ebua skulbii koni amɛnu tsɔsemɔ wiemɔi shishi yɛ Twi, Ewe, Ga, Fante kɛ nɔ eko amli.",
    getStarted: "Jee Shishi",
    signIn: "Bote Mli",
    featureHeading: "Nilee kpakpa ni agbó bɛ mli.",
    featureSub: "Wɔ kɛ LLMi ni atsɔse yɛ Ghana tsɔsemɔ gbɛjianɔtoi kɛ he wiemɔi amli di duma kɛ hã tsɔsemɔ ni tsɔɔ nii amli.",
    feature1Title: "Tsɔsemɔ Wiemɔi A-shishitsɔɔmɔ",
    feature1Desc: "Ná tsɔsemɔ wiemɔi akpei abɔ ni atsɔɔ shishi yɛ Bɔfo kɛ he wiemɔi amli koni anu shishi kpakpa.",
    feature2Title: "Hã Wiemɔi Ayɛ Mlamla",
    feature2Desc: 'Nii ni mli wa tsɔ mlamla. Bi wɔ AI lɛ akɛ "Tsɔɔmɔ mli ohã mi tamɔ nɔ ni miye afii 5" yɛ Twi loo Bɔfo mli oya nɔŋŋ.',
    feature3Title: "Mlihãmɔ Kai Dodokpɔ",
    feature3Desc: "Kɛ ohe kai kɛ dodokpɔi ni tsakeɔ kɛkɔɔ onikaksemɔ he kɛ wiemɔ ni osumɔɔ lɛ sɔ mli ohe.",
    bridgeTheGap: "Ka Mli lɛ Nyia",
    scholarText: "Wɔwo tsutsu gbɔmɛi hewalɛ.",
    instantDialect: "Wiemɔ Hãmɔ Oya",
    dialectText: "Tsɔɔmɔ nii ni mli wa shishi yɛ Fante mli nɔŋŋ.",
    supportTitle: "Daa Gbi Nilee Mli Yelikɛbuamɔ",
    aiText: "\"Mema wo akye! Te manyɛ maye mibua o po tsɔmɔ ŋmɛnɛ?\"",
    trustedBy: "Skulbii Kpɛlɛ Wɔ Nɔ Yɛ"
  },
  Fante: {
    heroTitle: <>Sua adze yie wɔ <span className="text-primary italic">Borɔfo</span> nna <span className="text-secondary">Ghana</span> kasa hɔn mu.</>,
    heroSub: "SukuuPath GH dze AI nyimdzi nna mpɔtam kasa ho nyansa abom dze aboa asukuufo ma wɔatse adzesua mu nsɛm ase wɔ Twi, Ewe, Ga, Fante nda dza ɔkeka ho mu.",
    getStarted: "Hyɛ Ase",
    signIn: "Kɔ Mu",
    featureHeading: "Nyimdzi pa a akwansidzi nnyi mu.",
    featureSub: "Yɛdze LLMs a wɔahyehyɛ no yie wɔ Ghana adzesua nhyehyɛɛ nna mpɔtam kasa mu dzi dwuma dze ma adzesua tsebea a ɔfata.",
    feature1Title: "Adzesua Nsɛmfua Nkyerɛase",
    feature1Desc: "Nya adzesua nsɛmfua mpempem pii a wɔakyerɛkyerɛ mu wɔ Borɔfo nda mpɔtam kasa mu a ɔbɛma aatse ase yie.",
    feature2Title: "Ma Nsɛmfua Nyɛ Mberɛw",
    feature2Desc: 'Ndzɛmba a emu yɛ dzen yɛ mberɛw. Bisa hɛn AI dɛ "Kyerɛkyerɛ mu tsɛ dɛ dza maadzi mfe 5" wɔ Twi anaa Borɔfo mu ntɛm ara.',
    feature3Title: "Sɔ Wo Ho Hwɛ",
    feature3Desc: "Sɔ wo nyimdzi hwɛ tsirmu nsɔhwɛ a ɔsesa ma ɔnna wo pɛ a epɛ wɔ adzesua mu nna kasa fã so.",
    bridgeTheGap: "Kwan No Ntse",
    scholarText: "Ma adzesuafo a woriba no ahoɔdzen.",
    instantDialect: "Kasa Mboa Ntsɛm Ara",
    dialectText: "Kyerɛ nsɛmfua a ɔyɛ dzen ase kɔ Fante mu wɔ sikafo hɔ.",
    supportTitle: "Adzesua Mboa Ndapaa",
    aiText: "\"Mema wo akye! Mbɛboa wo dɛn ndɛ wɔ wo adzesua mu?\"",
    trustedBy: "Asukuufo A Wɔdze Hɔn Ho To Hɛn Do"
  }
};

const SplashWelcome = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  const availableLangs = ['English', 'Twi', 'Ewe', 'Ga', 'Fante'];
  const t = translations[currentLang];

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden min-h-screen transition-colors duration-500">
      {/* Subtle Background Texture */}
      <div className="fixed inset-0 kente-pattern pointer-events-none"></div>

      {/* Main Navigation Shell */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 transition-colors duration-500">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-blue-900 font-headline">SukuuPath GH</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="text-slate-500 hover:text-blue-900 font-bold transition-colors font-headline text-sm py-1">Features</button>
            <button onClick={() => document.getElementById('partners')?.scrollIntoView({behavior: 'smooth'})} className="text-slate-500 hover:text-blue-900 font-bold transition-colors font-headline text-sm py-1">Partners</button>
            <button onClick={() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'})} className="text-slate-500 hover:text-blue-900 font-bold transition-colors font-headline text-sm py-1">About</button>
          </nav>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">language</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">notifications</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden text-on-surface hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </header>

      {/* Mobile Menu Popup */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 w-[80%] max-w-sm h-full bg-surface-container-lowest shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
            <span className="text-lg font-black text-primary tracking-tighter font-headline">SukuuPath GH</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="p-6 flex flex-col gap-6">
            <button onClick={() => { setIsMobileMenuOpen(false); document.getElementById('features')?.scrollIntoView({behavior: 'smooth'}); }} className="text-left text-on-surface-variant hover:text-primary transition-all font-headline font-semibold text-lg hover:translate-x-2">Features</button>
            <button onClick={() => { setIsMobileMenuOpen(false); document.getElementById('partners')?.scrollIntoView({behavior: 'smooth'}); }} className="text-left text-on-surface-variant hover:text-primary transition-all font-headline font-semibold text-lg hover:translate-x-2">Our Partners</button>
            <button onClick={() => { setIsMobileMenuOpen(false); document.getElementById('about')?.scrollIntoView({behavior: 'smooth'}); }} className="text-left text-on-surface-variant hover:text-primary transition-all font-headline font-semibold text-lg hover:translate-x-2">About Us</button>
            <hr className="border-outline-variant/20 my-2" />
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
              className="w-full py-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-headline font-bold rounded-xl active:scale-95 transition-transform">
              {t.signIn}
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); navigate('/onboarding'); }}
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
              {t.getStarted} <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </nav>
        </div>
      </div>

      <main className="relative min-h-[calc(100vh-72px)] flex flex-col items-center animate-fade-in-up">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content: Editorial Voice */}
          <div className="lg:col-span-6 flex flex-col space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container w-fit border border-secondary-container/30">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
              <span className="text-[10px] font-bold uppercase tracking-widest font-label">Ghana's #1 AI Tutor</span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight transition-opacity duration-300">
              {t.heroTitle}
            </h1>
            
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed transition-opacity duration-300">
              {t.heroSub}
            </p>

            {/* Language Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {availableLangs.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`px-4 py-2 rounded-full text-xs font-bold font-label flex items-center gap-2 editorial-shadow transition-all duration-300 cursor-pointer 
                    ${currentLang === lang 
                      ? "bg-secondary-container text-on-secondary-container shadow-md scale-105" 
                      : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest opacity-70 hover:opacity-100"}`}
                >
                  {lang} {currentLang === lang && <span className="material-symbols-outlined text-sm">check_circle</span>}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-xl font-bold font-headline text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                {t.getStarted}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-bold font-headline text-lg hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center">
                {t.signIn}
              </button>
            </div>
          </div>

          {/* Right Content: Asymmetrical Illustration Grid */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 aspect-[16/10] rounded-3xl overflow-hidden editorial-shadow relative group animate-fade-in">
                <img 
                  alt="Ghanaian students learning" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 animate-pulse-slow" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5bWh9PmhbDuKo1OHhMDa_GnodATQDXNEqcizqxFQh_7_ELo8M0s_XpnU7LtQpOW-5It4SdZQGbOxgM6MbxFghyJPVZtGCsbIG2ZnhCh97fJlbVRCs1ko0g7pFocsT_YvftnST2PK616rWUrq_u9L5AQLZlQX1y68K3LG5ukzndG3Q2GjrK0m_zjahDpb41vpXlQ3ZvOW3a1tEL26kYcUSNiM1v7FroJr8z8HOiN6vD_jdzjua2snxggFsvVv-aTMZrosiZ7-JI1Pc"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex flex-col justify-end p-6">
                  <span className="text-white/80 font-label text-[10px] uppercase tracking-widest font-bold">{t.bridgeTheGap}</span>
                  <p className="text-white text-xl font-headline font-bold">{t.scholarText}</p>
                </div>
              </div>

              {/* Bento Item 1 */}
              <div className="bg-tertiary-container rounded-3xl p-6 editorial-shadow flex flex-col justify-between min-h-[200px] md:aspect-square relative overflow-hidden">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-on-tertiary-container text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
                  <h3 className="text-on-tertiary-container font-headline font-bold text-lg leading-tight">{t.instantDialect}</h3>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary rounded-full opacity-20 blur-2xl"></div>
                <p className="text-on-tertiary-container/80 text-sm font-body mt-auto relative z-10">{t.dialectText}</p>
              </div>

              {/* Bento Item 2 */}
              <div className="bg-secondary-container rounded-3xl p-6 editorial-shadow flex flex-col min-h-[200px] md:aspect-square relative overflow-hidden">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/30">
                  <div className="flex gap-2 items-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-on-secondary-container uppercase tracking-tighter">AI Assistant Active</span>
                  </div>
                  <p className="text-xs text-on-secondary-container font-medium italic">{t.aiText}</p>
                </div>
                <h3 className="text-on-secondary-container font-headline font-bold text-lg leading-tight mt-auto">{t.supportTitle}</h3>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </section>

        {/* Features Quick Look */}
        <section id="features" className="w-full bg-surface-container-low py-24 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="font-headline text-4xl font-bold text-on-surface mb-4 transition-opacity duration-300">{t.featureHeading}</h2>
                <p className="text-on-surface-variant text-lg leading-relaxed transition-opacity duration-300">{t.featureSub}</p>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-1 bg-primary rounded-full"></div>
                <div className="w-4 h-1 bg-primary/20 rounded-full"></div>
                <div className="w-4 h-1 bg-primary/20 rounded-full"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl editorial-shadow hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-3">{t.feature1Title}</h4>
                <p className="text-on-surface-variant font-body">{t.feature1Desc}</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl editorial-shadow hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-tertiary mb-6">
                  <span className="material-symbols-outlined text-3xl">psychology</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-3">{t.feature2Title}</h4>
                <p className="text-on-surface-variant font-body">{t.feature2Desc}</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl editorial-shadow hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-secondary mb-6">
                  <span className="material-symbols-outlined text-3xl">quiz</span>
                </div>
                <h4 className="font-headline font-bold text-xl mb-3">{t.feature3Title}</h4>
                <p className="text-on-surface-variant font-body">{t.feature3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / Partners Subtle Bar */}
        <div id="partners" className="w-full py-12 flex flex-col items-center gap-8 border-t border-outline-variant/10">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] font-label">{t.trustedBy}</span>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <span className="font-headline font-extrabold text-xl text-on-surface">UENR</span>
            <span className="font-headline font-extrabold text-xl text-on-surface">LEGON</span>
            <span className="font-headline font-extrabold text-xl text-on-surface">KNUST</span>
            <span className="font-headline font-extrabold text-xl text-on-surface">UCC</span>
            <span className="font-headline font-extrabold text-xl text-on-surface">UPSA</span>
          </div>
        </div>
      </main>

      {/* Footer Area */}
      <footer id="about" className="bg-white px-6 py-12 border-t border-outline-variant/10 pb-24 md:pb-12 transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              </div>
              <span className="text-lg font-black text-blue-900 font-headline">SukuuPath GH</span>
            </div>
            <p className="text-xs text-on-surface-variant font-body">© 2026 Academic Intelligence for Ghana. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">
            <button onClick={() => alert("Privacy policy is currently being drafted by SukuuPath legal.")} className="hover:text-primary transition-colors cursor-pointer">Privacy</button>
            <button onClick={() => alert("Terms of Service will be available upon full beta release.")} className="hover:text-primary transition-colors cursor-pointer">Terms</button>
            <button onClick={() => alert("Contact us at developers: Jephthah Lanor & Nicholas Baffoe (UENR)")} className="hover:text-primary transition-colors cursor-pointer">Contact</button>
          </div>
        </div>
      </footer>

      {/* Bottom Mobile Nav Shell Removed */}
    </div>
  );
};

export default SplashWelcome;
