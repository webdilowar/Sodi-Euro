import React, { useState, useEffect } from 'react';
import { documentRequirements } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileCheck, 
  HelpCircle, 
  Calculator, 
  ChevronRight, 
  ChevronLeft,
  MapPin, 
  Layers, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Coins,
  Sparkles,
  ChevronDown,
  Star,
  Quote,
  GraduationCap
} from 'lucide-react';

export default function Lobby({ onGoToApply }: { onGoToApply: () => void }) {
  const { language, t } = useLanguage();
  // Selected University & Calculator States with nested Programs
  const universities = [
    { 
      id: 'sofia_uni', 
      name: 'Sofia University St. Kliment Ohridski', 
      programs: [
        { id: 'bachelor', name: 'Bachelor Degree', fee: 3500 },
        { id: 'language', name: 'Language Course', fee: 2500 },
        { id: 'masters', name: 'Masters Degree', fee: 4000 }
      ]
    },
    { 
      id: 'tech_sofia', 
      name: 'Technical University of Sofia', 
      programs: [
        { id: 'bachelor', name: 'Bachelor Degree', fee: 3000 },
        { id: 'language', name: 'Language Course', fee: 2000 },
        { id: 'masters', name: 'Masters Degree', fee: 3500 }
      ]
    },
    { 
      id: 'med_sofia', 
      name: 'Medical University of Sofia', 
      programs: [
        { id: 'bachelor', name: 'Bachelor Degree', fee: 8000 },
        { id: 'language', name: 'Language Course', fee: 4000 },
        { id: 'masters', name: 'Masters Degree', fee: 9000 }
      ]
    },
    { 
      id: 'varna_management', 
      name: 'Varna University of Management', 
      programs: [
        { id: 'bachelor', name: 'Bachelor Degree', fee: 4500 },
        { id: 'language', name: 'Language Course', fee: 3000 },
        { id: 'masters', name: 'Masters Degree', fee: 5000 }
      ]
    },
    { 
      id: 'tech_varna', 
      name: 'Technical University of Varna', 
      programs: [
        { id: 'bachelor', name: 'Bachelor Degree', fee: 3000 },
        { id: 'language', name: 'Language Course', fee: 2000 },
        { id: 'masters', name: 'Masters Degree', fee: 3500 }
      ]
    },
    { 
      id: 'aubg', 
      name: 'American University in Bulgaria', 
      programs: [
        { id: 'bachelor', name: 'Bachelor Degree', fee: 12000 },
        { id: 'language', name: 'Language Course', fee: 6000 },
        { id: 'masters', name: 'Masters Degree', fee: 14000 }
      ]
    }
  ];

  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [calcStep, setCalcStep] = useState<number>(1);

  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [includeTranslation, setIncludeTranslation] = useState<boolean>(true);
  const [includeTravel, setIncludeTravel] = useState<boolean>(true);
  const [includeAgencyFee, setIncludeAgencyFee] = useState<boolean>(true);

  // Computed state
  const selectedUni = universities.find(u => u.id === selectedUniId);
  const selectedProgram = selectedUni?.programs.find(p => p.id === selectedProgramId);
  const tuitionFee = selectedProgram ? selectedProgram.fee : 0;

  // Exchange rate: 1 EUR = 130 BDT
  const BDT_RATE = 130;

  // FAQ Expand state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Real Bulgaria university campus and student life images for gallery
  const campusSlides = [
    { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop', title: 'Sofia University St. Kliment Ohridski Campus & Library' },
    { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop', title: 'World-Class Traditional and Modern Educational Campus in Bulgaria' },
    { url: 'https://images.unsplash.com/photo-1555992336-03a23c7b20eb?q=80&w=1200&auto=format&fit=crop', title: 'Reading Rooms & Study Spaces with European Facilities' },
    { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop', title: 'Group Study and Advanced Laboratory Facilities' },
    { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop', title: 'Vibrant Student Life in Bulgaria\'s Natural Environment' }
  ];

  // Calculate costs
  const getCalculatedCosts = () => {
    let eurTotal = tuitionFee;
    if (includeInsurance) eurTotal += 150; // €150 for insurance
    eurTotal += 100; // Embassy Fee is mandatory €100

    let bdtTotal = 0;
    if (includeTranslation) bdtTotal += 12000; // 12,000 BDT for attestations/translations
    if (includeTravel) bdtTotal += 20000; // 20,000 BDT for Delhi trip/transit visa
    if (includeAgencyFee) bdtTotal += 15000; // 15,000 BDT agency fee

    const grandTotalBDT = (eurTotal * BDT_RATE) + bdtTotal;

    return {
      eurOnly: eurTotal,
      bdtOnly: bdtTotal,
      grandTotalBDT: grandTotalBDT,
      grandTotalEUR: Math.round(grandTotalBDT / BDT_RATE)
    };
  };

  const costs = getCalculatedCosts();

  // Selected document category for step-by-step Bangladeshi document guidelines
  const [selectedDocId, setSelectedDocId] = useState<string>(documentRequirements[0].id);
  const activeDoc = documentRequirements.find(d => d.id === selectedDocId) || documentRequirements[0];

  // Sliding background images for the Hero
  const heroSlides = [
    { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop', title: 'World-Class University Campuses in Bulgaria' },
    { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop', title: 'European Education & Vibrant Student Life' },
    { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop', title: 'Successful Visa Grants & Bright Futures' },
    { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop', title: 'Safe & Reliable European Student Visa Processing' }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Testimonials state & data
  const testimonials = [
    {
      id: 1,
      name: 'Shariful Islam',
      university: 'Sofia University St. Kliment Ohridski',
      program: 'B.Sc. in Computer Science',
      home: 'Sylhet',
      visaDate: 'March 2026',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop',
      quote: 'My dream of studying abroad came true with NOVENTRA\'s help. They made the embassy file preparation and document attestation process extremely smooth and easy. Thank you NOVENTRA team!'
    },
    {
      id: 2,
      name: 'Farhana Rahman',
      university: 'Medical University of Sofia',
      program: 'M.Sc. in Public Health',
      home: 'Dhaka',
      visaDate: 'October 2025',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
      quote: 'Choosing Medical University of Sofia was the best decision of my life. NOVENTRA stood by me at every step from admission to interview prep and hostel booking.'
    },
    {
      id: 3,
      name: 'Tanveer Ahmed',
      university: 'Technical University of Sofia',
      program: 'B.Sc. in Mechanical Engineering',
      home: 'Chattogram',
      visaDate: 'January 2026',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      quote: 'Affordable tuition fees and Schengen access make Bulgaria an excellent career choice. NOVENTRA\'s one-stop ground support is thoroughly professional and dependable.'
    },
    {
      id: 4,
      name: 'Mahadi Hasan',
      university: 'Varna University of Management',
      program: 'Bachelor in International Hospitality',
      home: 'Bogura',
      visaDate: 'September 2025',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      quote: 'Varna is a fantastic coastal city with very affordable living costs. NOVENTRA directly assisted with airport pickup and university registration upon my arrival.'
    },
    {
      id: 5,
      name: 'Nusrat Jahan',
      university: 'Sofia University St. Kliment Ohridski',
      program: 'M.Sc. in Software Engineering',
      home: 'Khulna',
      visaDate: 'February 2026',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop',
      quote: 'I was worried about medical insurance, declaration letters, and notary attestations. NOVENTRA quickly prepared my complete file for embassy submission. Excellent service!'
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTestimonialAutoPlay, setIsTestimonialAutoPlay] = useState(true);

  useEffect(() => {
    if (!isTestimonialAutoPlay) return;
    const testimonialTimer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(testimonialTimer);
  }, [isTestimonialAutoPlay, testimonials.length]);

  return (
    <div className="space-y-12 py-6" id="lobby-view-container">
      {/* 1. Hero Banner with elegant gold frame, background sliding images of real study abroad, and elegant CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white shadow-2xl border-2 border-brand-gold/35 sm:px-12 sm:py-16 lg:px-16" id="hero-section">
        {/* Sliding background images representing study abroad with looping visa/student life video overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
          {/* Real study abroad/campus loop video background */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 h-full w-full object-cover opacity-20 z-0"
          >
            <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c02227d8717467cf819ec470725cf26f&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
          </video>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.65, scale: 1 }} // Increased opacity so the hero photos are clearly visible as requested
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center z-10"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].url})` }}
            />
          </AnimatePresence>
          {/* Accent dark gradient overlay with warm/sky tints to protect text contrast and branding */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/30 to-slate-900/35 mix-blend-multiply z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent opacity-55 z-20"></div>
        </div>

        {/* Decorative rotating blur accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-sky/15 blur-3xl animate-pulse z-0"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl z-0"></div>
        
        {/* Slide Indicators for the background slider */}
        <div className="absolute bottom-6 right-6 flex space-x-1.5 z-10 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/10">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'bg-brand-gold w-4' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-6">
          {/* NOVENTRA Call To Action */}
          <div className="space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white border-2 border-amber-400 p-0.5 shadow-lg overflow-hidden shrink-0 notranslate">
                <img src="/logo.png" alt="NOVENTRA Logo" className="h-full w-full object-contain notranslate" referrerPolicy="no-referrer" />
              </div>
            </div>
                       <h1 className="font-sans text-3xl font-black tracking-tight sm:text-4xl md:text-5xl leading-tight text-white">
              <span className="notranslate">Gateway to Global Education</span> <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">{t('hero_title_2', 'Secure One-Stop Student Visa Portal')}</span>
            </h1>
            <p className="text-sm text-slate-300 sm:text-base leading-relaxed max-w-2xl">
              {t('hero_subtitle', 'Official agency consultancy platform for Bulgarian Higher Education, European D-type Student Visa processing, Board verification, & Delhi Embassy slot booking.')}
            </p>
            <div className="flex flex-col space-y-3 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                id="hero-apply-btn"
                onClick={onGoToApply}
                className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-sky/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>{t('hero_btn_apply', 'Start New Application')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                id="hero-scroll-btn"
                onClick={() => {
                  document.getElementById('cost-calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center space-x-2 rounded-xl bg-white/10 border border-brand-gold/20 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20 hover:border-brand-gold/50"
              >
                <Coins className="h-4 w-4 text-brand-gold" />
                <span>{t('cost_title', 'Budget & Cost Estimator')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Process Pathway with folding hover layout */}
      <section className="space-y-6" id="process-pathway">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl font-bold text-slate-800">{t('pathway_title', 'NOVENTRA Visa Process Timeline')}</h2>
          <p className="text-xs text-slate-500">{t('pathway_subtitle', 'Step-by-step guidance for Bangladeshi students')}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5" id="timeline-steps">
          {(language === 'bn' ? [
            { step: '০১', title: 'এডমিশন ও অফার লেটার', desc: 'বিশ্ববিদ্যালয়ে আবেদন জমা এবং অফার লেটার অনুমোদন গ্রহণ।' },
            { step: '০২', title: 'ডকুমেন্ট সত্যায়ন ও অনুবাদ', desc: 'শিক্ষা বোর্ড, শিক্ষা মন্ত্রণালয় ও পররাষ্ট্র মন্ত্রণালয় সত্যায়ন।' },
            { step: '০৩', title: 'ডাবল এন্ট্রি ট্রানজিট ভিসা', desc: 'দিল্লী এম্বাসি ইন্টারভিউতে উপস্থিত হওয়ার জন্য ট্রাভেল পারমিট।' },
            { step: '০৪', title: 'এম্বাসি ফাইল ও ইন্টারভিউ', desc: 'দিল্লীস্থ ইউরোপীয় দূতাবাসে ফাইল জমা ও সাক্ষাৎকার।' },
            { step: '০৫', title: 'ভিসা স্ট্যাম্পিং ও যাত্রা', desc: 'পাসপোর্টে ভিসা স্ট্যাম্পিং শেষে বুলগেরিয়ার উদ্দেশ্যে যাত্রা।' }
          ] : [
            { step: '01', title: 'Admission & Offer Letter', desc: 'Application submission & admission approval from your chosen university.' },
            { step: '02', title: 'Document Prep & Legalization', desc: 'Fast-track attestation from the Ministry of Education & Ministry of Foreign Affairs.' },
            { step: '03', title: 'Double Entry Transit Visa', desc: 'Travel permit for attending the in-person embassy appointment in New Delhi.' },
            { step: '04', title: 'Embassy File & Interview', desc: 'File submission & interview at the European Embassy in New Delhi.' },
            { step: '05', title: 'Visa Stamping & Departure', desc: 'Receive your stamped passport and embark on your journey abroad.' }
          ]).map((item, index) => (
            <motion.div 
              key={index} 
              whileHover={{ y: -5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative rounded-2xl border border-brand-gold/20 bg-white p-5 shadow-sm hover:border-brand-sky/40 hover:shadow-md cursor-default" 
              id={`timeline-card-${index}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-black text-brand-sky/35">{item.step}</span>
                <span className="h-2 w-2 rounded-full bg-brand-gold"></span>
              </div>
              <h3 className="mt-3 font-bold text-slate-800 text-sm leading-snug">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Document Guide from Bangladesh featuring elegant 3D paper folding expansion */}
      <section className="grid gap-8 lg:grid-cols-3" id="document-guide-section">
        {/* Selector Panel */}
        <div className="rounded-2xl border-2 border-brand-gold/15 bg-white p-6 shadow-sm space-y-4 lg:col-span-1">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center space-x-1.5">
              <Layers className="h-5 w-5 text-brand-sky" />
              <span>Bangladeshi Document Guide</span>
            </h3>
            <p className="text-xs text-slate-500">Step-by-step guidelines on how and where to attest your required certificates:</p>
          </div>
          <div className="space-y-2" id="doc-req-selectors">
            {documentRequirements.map((doc) => (
              <button
                key={doc.id}
                id={`doc-sel-${doc.id}`}
                onClick={() => setSelectedDocId(doc.id)}
                className={`flex w-full items-start space-x-3 rounded-xl p-3 text-left transition-all transform duration-200 active:scale-95 ${
                  selectedDocId === doc.id
                    ? 'bg-brand-sky-light text-brand-sky-dark ring-2 ring-brand-sky border-l-4 border-l-brand-gold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                  selectedDocId === doc.id ? 'bg-brand-sky text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <FileCheck className="h-3.5 w-3.5" />
                </div>
                <div className="w-full">
                  <h4 className="text-xs font-bold leading-tight line-clamp-1">{doc.title}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-[9px] font-extrabold ${selectedDocId === doc.id ? 'text-brand-gold-dark' : 'text-slate-400'}`}>
                      {doc.isRequired ? 'Mandatory (Required)' : 'Optional'}
                    </span>
                    {selectedDocId === doc.id && (
                      <span className="text-[10px] text-brand-gold">➔</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Guideline Detail Panel featuring 3D paper unfolding effect */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedDocId}
            initial={{ opacity: 0, rotateX: -20, transformOrigin: "top" }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-2xl border-2 border-brand-gold/30 bg-white p-6 shadow-md space-y-6 lg:col-span-2 flex flex-col justify-between transform-style-3d relative" 
            id="doc-req-details"
          >
            {/* Elegant corner fold indicator */}
            <div className="absolute top-0 right-0 h-10 w-10 bg-gradient-to-bl from-slate-100 to-white border-b border-l border-brand-gold/30 rounded-bl-xl shadow-sm"></div>

            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 pr-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-brand-sky to-brand-sky-dark px-2.5 py-1 rounded-full border border-brand-gold/20">
                  {activeDoc.isRequired ? 'Mandatory Document Guide' : 'Supporting Document'}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-slate-800 flex items-center space-x-2">
                  <span className="text-brand-gold">✦</span>
                  <span>{activeDoc.title}</span>
                </h3>
                <p className="mt-1 text-xs text-slate-500">{activeDoc.description}</p>
              </div>

              {/* Preparation Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-sky-dark flex items-center space-x-1">
                  <span>Preparation Rules (Embassy Standards):</span>
                </h4>
                <ul className="grid gap-2.5 text-xs text-slate-600">
                  {activeDoc.guidelines.map((guide, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                      <span>{guide}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collection Service BD */}
              <div className="rounded-xl bg-gradient-to-r from-brand-sky-light/40 to-brand-gold-light p-4 border border-brand-gold/20 space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-800">
                  <MapPin className="h-4 w-4 text-brand-sky" />
                  <h4 className="text-xs font-bold text-slate-800">How to Collect with NOVENTRA (Ground Assistance):</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{activeDoc.bangladeshCollectionGuide}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="text-brand-gold text-lg">💡</span>
                <span>Our ground field agents will assist you at education boards and ministry offices to collect and attest these documents smoothly.</span>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* European Student Life & Campus Gallery Slider */}
      <section className="space-y-6" id="student-life-slider-section">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold-dark border border-brand-gold/30">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            <span>European Campus & Student Life</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Glimpse of Bulgaria Campus & Student Life</h2>
          <p className="text-xs text-slate-500">World-class facilities and modern lifestyle amidst rich natural beauty</p>
        </div>

        <div className="mx-auto max-w-4xl relative rounded-2xl overflow-hidden border-2 border-brand-gold/30 shadow-2xl bg-slate-950 group h-64 sm:h-80 lg:h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide % campusSlides.length}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-contain bg-no-repeat bg-center bg-slate-950"
              style={{ backgroundImage: `url(${campusSlides[currentSlide % campusSlides.length].url})` }}
            >
              {/* Overlay gradient to keep slide captions perfectly clear */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
              
              {/* Caption text banner */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-left bg-slate-950/70 backdrop-blur-md">
                <span className="inline-block bg-brand-gold text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md mb-1.5 uppercase tracking-wider">
                  Bulgaria Live Campus & Student Life
                </span>
                <p className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md">
                  {campusSlides[currentSlide % campusSlides.length].title}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="absolute top-4 right-4 flex space-x-1.5 z-10 bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            {campusSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  currentSlide % campusSlides.length === idx ? 'bg-brand-gold w-5' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Cost Estimator Calculator with Beautiful Theme styling */}
      <section className="scroll-mt-20 rounded-3xl border-2 border-brand-gold/20 bg-white p-6 shadow-md md:p-8 lg:p-10" id="cost-calculator-section">
        {/* Step Progress Indicator */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 max-w-xl mx-auto mb-8">
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              calcStep >= 1 ? 'bg-brand-sky text-white ring-4 ring-brand-sky/25' : 'bg-slate-100 text-slate-400'
            }`}>1</div>
            <span className={`text-[10px] font-bold mt-1 ${calcStep >= 1 ? 'text-brand-sky-dark font-extrabold' : 'text-slate-400'}`}>University & Course</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${calcStep >= 2 ? 'bg-brand-sky' : 'bg-slate-100'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              calcStep >= 2 ? 'bg-brand-sky text-white ring-4 ring-brand-sky/25' : 'bg-slate-100 text-slate-400'
            }`}>2</div>
            <span className={`text-[10px] font-bold mt-1 ${calcStep >= 2 ? 'text-brand-sky-dark font-extrabold' : 'text-slate-400'}`}>Additional Services</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${calcStep >= 3 ? 'bg-brand-sky' : 'bg-slate-100'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              calcStep >= 3 ? 'bg-brand-sky text-white ring-4 ring-brand-sky/25' : 'bg-slate-100 text-slate-400'
            }`}>3</div>
            <span className={`text-[10px] font-bold mt-1 ${calcStep >= 3 ? 'text-brand-sky-dark font-extrabold' : 'text-slate-400'}`}>Total Budget</span>
          </div>
        </div>

        {/* Step 1 Content */}
        {calcStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6" id="calc-step-1">
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-brand-sky-light px-3 py-1 text-xs font-bold text-brand-sky-dark border border-brand-sky/20">
                <Calculator className="h-3.5 w-3.5 text-brand-sky" />
                <span>Step 1: Select Institution & Program</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-slate-800">Your Preferred University & Course</h3>
              <p className="text-xs text-slate-500 mt-1">Select a university first, then choose your desired study program</p>
            </div>

            {/* University Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block flex items-center space-x-1.5">
                <span className="text-brand-gold">★</span>
                <span>Select University:</span>
              </label>
              <select
                id="university-selector"
                value={selectedUniId}
                onChange={(e) => {
                  setSelectedUniId(e.target.value);
                  setSelectedProgramId(''); // Reset program selection on university change
                }}
                className="w-full rounded-xl border-2 border-slate-200 p-3.5 text-xs bg-white focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold text-slate-800 transition-all"
              >
                <option value="">-- Select a University --</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Program Dropdown (Only shows when university is selected) */}
            {selectedUniId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 pt-2"
                id="program-selector-container"
              >
                <label className="text-xs font-bold text-slate-700 block flex items-center space-x-1.5">
                  <span className="text-brand-gold">★</span>
                  <span>Select Program:</span>
                </label>
                <select
                  id="program-selector"
                  value={selectedProgramId}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                  }}
                  className="w-full rounded-xl border-2 border-slate-200 p-3.5 text-xs bg-white focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold text-slate-800 transition-all"
                >
                  <option value="">-- Select Course Program --</option>
                  {selectedUni?.programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Tuition fee display */}
            {selectedUniId && selectedProgramId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-sky/10 border border-brand-sky/20 rounded-2xl p-5 mt-4 text-center space-y-1.5"
                id="tuition-fee-display"
              >
                <span className="text-[10px] text-brand-sky-dark uppercase tracking-wider font-extrabold block">Annual Official Tuition Fee</span>
                <span className="text-3xl font-black text-slate-900 font-mono block">
                  € {tuitionFee.toLocaleString()} EUR
                </span>
                <span className="text-xs font-bold text-slate-500 block">
                  (Approx. in BDT: ৳{(tuitionFee * BDT_RATE).toLocaleString()} BDT)
                </span>
                <p className="text-[10px] text-slate-400 max-w-md mx-auto pt-1 leading-relaxed">
                  Annual tuition fee is paid directly to the university account upon arrival in Bulgaria.
                </p>

                {/* Next Step Button */}
                <button
                  onClick={() => setCalcStep(2)}
                  className="w-full mt-4 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold py-3.5 text-xs font-bold text-white hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-sky/25"
                  id="calc-step-1-next"
                >
                  <span>Proceed to Next Step (Additional Services)</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Step 2 Content */}
        {calcStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-6" id="calc-step-2">
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold-dark border border-brand-gold/30">
                <Calculator className="h-3.5 w-3.5 text-brand-gold" />
                <span>Step 2: Add Additional Ground Services</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-slate-800">Essential Services & Official Fees</h3>
              <p className="text-xs text-slate-500 mt-1">Select necessary visa processing and embassy submission services</p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {/* Insurance */}
              <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Medical Insurance Fee</span>
                  <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">€ 150 (Annual Mandatory)</span>
                </div>
              </label>

              {/* Translation & Attestation */}
              <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={includeTranslation}
                  onChange={(e) => setIncludeTranslation(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Translation & Ministry Attestation</span>
                  <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">৳ 12,000 BDT (Approx.)</span>
                </div>
              </label>

              {/* Indian Double Entry Travel */}
              <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={includeTravel}
                  onChange={(e) => setIncludeTravel(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Delhi Interview Travel Logistics</span>
                  <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">৳ 20,000 BDT (Incl. Travel)</span>
                </div>
              </label>

              {/* Agency Fee */}
              <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                <input
                  type="checkbox"
                  checked={includeAgencyFee}
                  onChange={(e) => setIncludeAgencyFee(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Ground Processing & Assistance</span>
                  <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">৳ 15,000 BDT (One-Stop)</span>
                </div>
              </label>
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setCalcStep(1)}
                className="flex-1 rounded-xl bg-slate-100 text-slate-700 py-3 text-center text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Back to Step 1
              </button>
              <button
                onClick={() => setCalcStep(3)}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold py-3 text-center text-xs font-bold text-white hover:scale-105 transition-all shadow-md shadow-brand-sky/20"
              >
                Calculate Final Budget
              </button>
            </div>
          </div>
        )}

        {/* Step 3 Content */}
        {calcStep === 3 && (
          <div className="space-y-6" id="calc-step-3">
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>Step 3: Your Final Budget Summary</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-800">Total Processing & First Year Budget</h3>
              <p className="text-xs text-slate-500 mt-1">Final itemized breakdown of selected institution and ground services</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Detailed Breakdown Panel */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Cost Breakdown (Detailed Items)</h4>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-500">Selected University:</span>
                    <span className="font-bold text-right text-slate-800">{selectedUni?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-500">Course Program:</span>
                    <span className="font-bold text-slate-800">{selectedProgram?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Annual Tuition Fee:</span>
                    <span className="font-mono font-bold text-slate-900">€ {tuitionFee.toLocaleString()} EUR</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Embassy Slot Declaration & Insurance:</span>
                    <span className="font-mono font-bold text-slate-900">€ {includeInsurance ? '250' : '100'} EUR</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Translation & Attestation (BDT):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {includeTranslation ? '৳ 12,000' : '৳ 0'} BDT
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Delhi Travel & Interview Logistics (BDT):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {includeTravel ? '৳ 20,000' : '৳ 0'} BDT
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Ground Processing & One-Stop Support (BDT):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {includeAgencyFee ? '৳ 15,000' : '৳ 0'} BDT
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Budget Exchange Rate (NOVENTRA Standard):</span>
                    <span className="font-mono">1 EUR = {BDT_RATE} BDT</span>
                  </div>
                </div>
              </div>

              {/* Total Calculation Output Panel */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white flex flex-col justify-between shadow-xl border border-brand-gold/30">
                <div className="space-y-6">
                  <h4 className="font-display text-sm font-bold text-brand-gold-accent border-b border-white/10 pb-3 flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-brand-gold animate-bounce" />
                    <span>Final Budget Summary</span>
                  </h4>
                  
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimated Budget:</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="font-display text-3xl font-black bg-gradient-to-r from-brand-sky via-brand-gold-accent to-brand-gold bg-clip-text text-transparent">
                        ৳ {costs.grandTotalBDT.toLocaleString()}
                      </span>
                      <span className="text-xs text-brand-gold font-bold">BDT</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      EUR Equivalent: <span className="font-mono text-white font-bold">€ {costs.grandTotalEUR.toLocaleString()} EUR</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                  <button
                    id="apply-under-calc"
                    onClick={onGoToApply}
                    className="w-full rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold py-3 text-center text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-brand-sky/20"
                  >
                    Go to Visa Application Dashboard
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCalcStep(2)}
                      className="flex-1 rounded-xl bg-white/10 border border-white/10 py-2 text-center text-[11px] font-semibold text-slate-300 hover:bg-white/20 hover:text-white transition-all"
                    >
                      Modify Services
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUniId('');
                        setSelectedProgramId('');
                        setCalcStep(1);
                      }}
                      className="flex-1 rounded-xl bg-red-950/40 border border-red-500/25 py-2 text-center text-[11px] font-semibold text-red-200 hover:bg-red-950/60 hover:text-red-100 transition-all"
                    >
                      Start Over
                    </button>
                  </div>
                  
                  <span className="block text-[10px] text-slate-400 text-center font-medium mt-1">
                    ※ This is an estimated budget calculator for guidance purposes only.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Testimonials Slider Section with Gold & Sky Blue Accents */}
      <section 
        className="space-y-6 scroll-mt-20 py-4" 
        id="testimonials-section"
        onMouseEnter={() => setIsTestimonialAutoPlay(false)}
        onMouseLeave={() => setIsTestimonialAutoPlay(true)}
      >
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold text-brand-gold-dark border border-brand-gold/35 shadow-sm">
            <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />
            <span>Success Stories</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Students Who Reached Europe with NOVENTRA</h2>
          <p className="text-xs text-slate-500">Real experiences of students currently studying in Bulgaria through our guidance</p>
        </div>

        <div className="relative mx-auto max-w-4xl px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="rounded-3xl border-2 border-brand-gold/20 bg-gradient-to-br from-white via-brand-gold-light/25 to-brand-sky-light/15 p-6 md:p-8 lg:p-10 shadow-xl relative overflow-hidden"
              id={`testimonial-card-${activeTestimonial}`}
            >
              {/* Decorative Quote Background */}
              <div className="absolute top-4 right-4 text-brand-gold/10 pointer-events-none">
                <Quote className="h-28 w-28 transform rotate-180" />
              </div>

              <div className="grid gap-8 md:grid-cols-12 items-center relative z-10">
                {/* Left Side: Avatar and Quick Stats */}
                <div className="md:col-span-5 flex flex-col items-center text-center md:border-r border-slate-100 md:pr-8">
                  <div className="relative">
                    {/* Ring Accents */}
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-gold via-brand-sky to-brand-gold-accent opacity-75 blur-sm"></div>
                    <img
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      referrerPolicy="no-referrer"
                      className="relative h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    {/* Verified stamp/badge */}
                    <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg border-2 border-white" title="Visa Approved & Arrived in Bulgaria">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-base font-extrabold text-slate-800 leading-tight">
                    {testimonials[activeTestimonial].name}
                  </h3>
                  
                  <p className="text-[11px] font-bold text-brand-sky-dark flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                    From {testimonials[activeTestimonial].home}
                  </p>

                  {/* Stars */}
                  <div className="flex items-center space-x-1 mt-2.5">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>

                  {/* University & Program Tag */}
                  <div className="mt-4 w-full bg-white/80 rounded-xl p-3 border border-slate-100 shadow-sm space-y-1 text-left">
                    <span className="text-[9px] font-extrabold text-slate-400 block uppercase tracking-wider">Institution & Program</span>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {testimonials[activeTestimonial].university}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 block">
                      {testimonials[activeTestimonial].program}
                    </span>
                  </div>
                </div>

                {/* Right Side: Big Quote & Verified Tag */}
                <div className="md:col-span-7 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Visa Granted: {testimonials[activeTestimonial].visaDate}</span>
                    </div>

                    <div className="relative">
                      <Quote className="h-6 w-6 text-brand-sky/20 absolute -top-3 -left-3" />
                      <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed pl-4 italic">
                        "{testimonials[activeTestimonial].quote}"
                      </p>
                    </div>
                  </div>

                  {/* Footer Action Inside Testimonial */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 font-semibold">
                      ※ NOVENTRA Verified Visa Story
                    </div>
                    <button
                      onClick={onGoToApply}
                      className="inline-flex items-center space-x-1 text-xs font-black text-brand-sky hover:text-brand-sky-dark transition-colors"
                    >
                      <span>Start Your Application</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Side navigation arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-5 z-20">
            <button
              onClick={() => {
                setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md border border-slate-100 hover:text-brand-sky hover:border-brand-sky transition-all hover:scale-105 active:scale-95"
              title="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-5 z-20">
            <button
              onClick={() => {
                setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md border border-slate-100 hover:text-brand-sky hover:border-brand-sky transition-all hover:scale-105 active:scale-95"
              title="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center space-x-1.5 pt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTestimonial(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeTestimonial === index 
                    ? 'w-6 bg-brand-sky' 
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQs Section with dynamic folding accordion */}
      <section className="space-y-6" id="faq-section">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl font-bold text-slate-800">Frequently Asked Questions (FAQ)</h2>
          <p className="text-xs text-slate-500">Common questions & answers about European & Bulgaria student visa process</p>
        </div>

        <div className="mx-auto max-w-3xl grid gap-4" id="faq-list">
          {[
            {
              q: 'Is there a direct European embassy for Bulgaria in Bangladesh?',
              a: 'No, currently for certain European destinations without a local embassy in Bangladesh, students submit their files at the European Embassy located in New Delhi. NOVENTRA provides full travel coordination and file preparation support.'
            },
            {
              q: 'Does NOVENTRA assist with transit/Indian double-entry visas?',
              a: 'Yes! Once you initiate your application on our portal, our team assists with e-token booking, form filling, and file readiness for required transit or travel visas.'
            },
            {
              q: 'What are the part-time work opportunities for international students in Bulgaria?',
              a: 'As an international student, you are legally permitted to work up to 20 hours per week part-time during semester terms, and full-time during semester breaks. Being part of the Schengen area makes it even more attractive.'
            },
            {
              q: 'What is the correct procedure for certificate and police clearance attestation?',
              a: 'First, obtain Board verification, followed by attestation from the Ministry of Education, and finally legalization from the Ministry of Foreign Affairs. NOVENTRA provides end-to-end ground assistance for this process.'
            }
          ].map((faq, index) => (
            <div 
              key={index} 
              className="rounded-xl border-2 border-brand-gold/15 bg-white shadow-sm overflow-hidden" 
              id={`faq-item-${index}`}
            >
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-800 hover:bg-brand-sky-light/40 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <HelpCircle className="h-4 w-4 text-brand-sky shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-brand-gold ml-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 pt-2 pl-10 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-brand-sky-light/10">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
