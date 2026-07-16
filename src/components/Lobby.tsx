import React, { useState } from 'react';
import { documentRequirements } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  HelpCircle, 
  Calculator, 
  ChevronRight, 
  MapPin, 
  Layers, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Coins,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Lobby({ onGoToApply }: { onGoToApply: () => void }) {
  // Calculator States
  const [tuitionFee, setTuitionFee] = useState<number>(3000); // in EUR
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [includeTranslation, setIncludeTranslation] = useState<boolean>(true);
  const [includeTravel, setIncludeTravel] = useState<boolean>(true);
  const [includeAgencyFee, setIncludeAgencyFee] = useState<boolean>(true);

  // Exchange rate: 1 EUR = 130 BDT
  const BDT_RATE = 130;

  // FAQ Expand state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  return (
    <div className="space-y-12 py-6" id="lobby-view-container">
      {/* 1. Hero Banner with elegant gold frame and rotating blur accents */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white shadow-2xl border-2 border-brand-gold/35 sm:px-12 sm:py-16 lg:px-16" id="hero-section">
        {/* Decorative backdrop elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-sky/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-brand-gold/10 border border-brand-gold/30 px-3.5 py-1 text-xs font-bold text-brand-gold-accent backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-brand-gold animate-spin" />
            <span>বাংলাদেশ টু ইউরোপ ও বুলগেরিয়া প্রসেসিং • Sodi Euro</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
            ইউরোপে উচ্চশিক্ষা ও <br />
            <span className="bg-gradient-to-r from-brand-sky via-brand-gold-accent to-brand-gold bg-clip-text text-transparent">নিরাপদ ওয়ান-স্টপ ভিসা</span> পোর্টাল
          </h1>
          <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
            শিক্ষা সনদের পররাষ্ট্র মন্ত্রণালয় থেকে দ্রুততম উপায়ে সত্যায়ন, পুলিশ ক্লিয়ারেন্স রেডি করা, দিল্লী দূতাবাসে ফাইল সাবমিশন এবং ভারতীয় ডাবল এন্ট্রি ভিসা প্রসেসিংসহ সম্পূর্ণ প্রক্রিয়ায় নির্ভরযোগ্য সমাধান। আপনার স্বপ্নের ইউরোপ যাত্রায় **Sodi Euro** থাকবে প্রতিটি পদক্ষেপে।
          </p>
          <div className="flex flex-col space-y-3 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <button
              id="hero-apply-btn"
              onClick={onGoToApply}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-sky/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>অনলাইনে আবেদন শুরু করুন</span>
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
              <span>বাজেট ও খরচের হিসাব</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Process Pathway with folding hover layout */}
      <section className="space-y-6" id="process-pathway">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl font-bold text-slate-800">Sodi Euro ভিসা প্রসেস টাইমলাইন</h2>
          <p className="text-xs text-slate-500">বাংলাদেশী শিক্ষার্থীদের জন্য প্রতিটি ধাপে সুনির্দিষ্ট গাইডলাইন</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5" id="timeline-steps">
          {[
            { step: '০১', title: 'ভর্তি ও অফার লেটার', desc: 'পছন্দের বিশ্ববিদ্যালয়ে আবেদন ও ভর্তি অনুমোদন।' },
            { step: '০২', title: 'ডকুমেন্ট রেডি ও লিগালাইজেশন', desc: 'শিক্ষা ও পররাষ্ট্র মন্ত্রণালয় থেকে দ্রুততম সত্যায়ন।' },
            { step: '০৩', title: 'ডাবল এন্ট্রি ইন্ডিয়ান ভিসা', desc: 'দিল্লী দূতাবাসে সশরীরে যেতে ট্রাভেল পারমিট নিশ্চিতকরণ।' },
            { step: '০৪', title: 'দূতাবাস ইন্টারভিউ', desc: 'নতুন দিল্লীতে অবস্থিত ইউরোপীয় দূতাবাসে ফাইল পেশ ও ইন্টারভিউ।' },
            { step: '০৫', title: 'ভিসা সিল ও ফ্লাইট বুকিং', desc: 'ভিসা পাসপোর্ট ফেরত পাওয়ার পর স্বপ্নের বিমান যাত্রা।' }
          ].map((item, index) => (
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
              <span>বাংলাদেশি ডকুমেন্ট গাইড</span>
            </h3>
            <p className="text-xs text-slate-500">আপনার প্রয়োজনীয় সার্টিফিকেট কিভাবে এবং কোথা থেকে সত্যায়ন করবেন তার সুনির্দিষ্ট গাইডলাইন:</p>
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
                      {doc.isRequired ? 'বাধ্যতামূলক (Required)' : 'ঐচ্ছিক (Optional)'}
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
                  {activeDoc.isRequired ? 'বাধ্যতামূলক ডকুমেন্ট গাইড' : 'সহায়ক ডকুমেন্ট'}
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
                  <span>প্রস্তুতির সঠিক নিয়ম (Embassy Standards):</span>
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
                  <h4 className="text-xs font-bold text-slate-800">Sodi Euro থেকে যেভাবে সংগ্রহ করবেন (Our Ground Assistance):</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{activeDoc.bangladeshCollectionGuide}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="text-brand-gold text-lg">💡</span>
                <span>এই ডকুমেন্টগুলো সংগ্রহের জন্য আমাদের গ্রাউন্ড ফিল্ড এজেন্ট বোর্ডে এবং মন্ত্রণালয়ে আপনার পক্ষ থেকে সহায়তা করবে।</span>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. Cost Estimator Calculator with Beautiful Theme styling */}
      <section className="scroll-mt-20 rounded-3xl border-2 border-brand-gold/20 bg-white p-6 shadow-md md:p-8 lg:p-10" id="cost-calculator-section">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-brand-sky-light px-3 py-1 text-xs font-bold text-brand-sky-dark border border-brand-sky/20">
                <Calculator className="h-3.5 w-3.5 text-brand-sky" />
                <span>বুলগেরিয়া ভিসা বাজেট ক্যালকুলেটর</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-800">আপনার সম্ভাব্য খরচের হিসাব</h3>
              <p className="text-xs text-slate-500">ভর্তি, প্রসেসিং ও প্রথম বছরের আনুমানিক খরচের সামগ্রিক বিবরণী হিসাব করুন</p>
            </div>

            {/* University Tuition Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">বার্ষিক বিশ্ববিদ্যালয় টিউশন ফি (Tuition Fees - EUR)</label>
              <div className="flex items-center space-x-3">
                <input
                  id="tuition-fee-slider"
                  type="range"
                  min="2000"
                  max="6000"
                  step="500"
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(Number(e.target.value))}
                  className="w-full accent-brand-sky cursor-pointer"
                />
                <span className="w-24 shrink-0 rounded-lg bg-slate-100 px-3 py-1 text-center text-xs font-bold text-slate-800 border border-slate-200">
                  € {tuitionFee}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">ইউরোপিয়ান ইউনিয়নের এই দেশে টিউশন ফি সাধারণত ৩০০০ থেকে ৪৫০০ ইউরো হয়ে থাকে।</p>
            </div>

            {/* Checkboxes for optional agency elements */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">অন্যান্য আবশ্যক সেবা ও সরকারি ফি</h4>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Insurance */}
                <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-3 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">মেডিকেল ইন্স্যুরেন্স ফি</span>
                    <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">€ ১৫০ (বাৎসরিক বাধ্যতামূলক)</span>
                  </div>
                </label>

                {/* Translation & Attestation */}
                <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-3 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={includeTranslation}
                    onChange={(e) => setIncludeTranslation(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">অনুবাদ ও মিনিস্ট্রি সত্যায়ন</span>
                    <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">৳ ১২,০০০ BDT (আনুমানিক)</span>
                  </div>
                </label>

                {/* Indian Double Entry Travel */}
                <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-3 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={includeTravel}
                    onChange={(e) => setIncludeTravel(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">দিল্লী ইন্টারভিউ ট্রাভেলিং</span>
                    <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">৳ ২০,০০০ BDT (যাতায়াতসহ)</span>
                  </div>
                </label>

                {/* Agency Fee (Indian processing) */}
                <label className="flex items-start space-x-3 rounded-xl border-2 border-slate-100 hover:border-brand-sky/35 p-3 hover:bg-slate-50 cursor-pointer transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={includeAgencyFee}
                    onChange={(e) => setIncludeAgencyFee(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-sky focus:ring-brand-sky accent-brand-sky"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">গ্রাউন্ড প্রসেসিং ও সাপোর্ট</span>
                    <span className="text-[11px] text-slate-500 font-semibold text-brand-gold-dark">৳ ১৫,০০০ BDT (ওয়ান-স্টপ)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Result Block styled with elegant dark sky gold aesthetic */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white flex flex-col justify-between shadow-xl border border-brand-gold/30">
            <div className="space-y-6">
              <h4 className="font-display text-sm font-bold text-brand-gold-accent border-b border-white/10 pb-3 flex items-center space-x-2">
                <Coins className="h-4 w-4 text-brand-gold animate-bounce" />
                <span>বাজেটের সারসংক্ষেপ (Cost Summary)</span>
              </h4>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>বার্ষিক বিশ্ববিদ্যালয় টিউশন ফি:</span>
                  <span className="font-mono font-semibold text-brand-sky">€ {tuitionFee}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>এমব্যাসি ডিক্লেয়ারেশন ও ইন্স্যুরেন্স ফি:</span>
                  <span className="font-mono font-semibold text-brand-sky">€ {includeInsurance ? '২৫০' : '১০০'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>অনুবাদ, নোটারি ও যাতায়াত খরচ (BDT):</span>
                  <span className="font-mono font-semibold text-brand-gold">
                    ৳ {costs.bdtOnly.toLocaleString()} BDT
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>কনভার্সন রেট (Sodi Euro Standard):</span>
                  <span className="font-mono font-semibold">1 EUR = {BDT_RATE} BDT</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">সর্বমোট আনুমানিক প্রসেস বাজেট:</span>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display text-3xl font-black bg-gradient-to-r from-brand-sky via-brand-gold-accent to-brand-gold bg-clip-text text-transparent">
                    ৳ {costs.grandTotalBDT.toLocaleString()}
                  </span>
                  <span className="text-xs text-brand-gold font-bold">BDT</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ইউরো সমপরিমাণ: <span className="font-mono text-white font-bold">€ {costs.grandTotalEUR.toLocaleString()} EUR</span>
                </div>
              </div>

              <button
                id="apply-under-calc"
                onClick={onGoToApply}
                className="w-full rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold py-3 text-center text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-brand-sky/20"
              >
                এই বাজেটে অনলাইন প্রসেস শুরু করুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQs Section with dynamic folding accordion */}
      <section className="space-y-6" id="faq-section">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl font-bold text-slate-800">সাধারণ জিজ্ঞাসা (FAQ)</h2>
          <p className="text-xs text-slate-500">ইউরোপ ও বুলগেরিয়া স্টুডেন্ট ভিসা সংক্রান্ত সাধারণ প্রশ্নোত্তর</p>
        </div>

        <div className="mx-auto max-w-3xl grid gap-4" id="faq-list">
          {[
            {
              q: 'বাংলাদেশে কি বুলগেরিয়ার বা ইউরোপের এই দূতাবাসটি আছে?',
              a: 'না, বর্তমানে বাংলাদেশে বুলগেরিয়ার কোনো সক্রিয় দূতাবাস নেই। বাংলাদেশী শিক্ষার্থীদের ভারতের নতুন দিল্লিতে অবস্থিত বুলগেরিয়া দূতাবাসে গিয়ে সশরীরে ফাইল জমা দিতে হয় এবং ইন্টারভিউ দিতে হয়। Sodi Euro আপনাকে এই যাতায়াত ও বুকিংয়ের সব সাপোর্ট দেয়।'
            },
            {
              q: 'দিল্লী ভ্রমণের জন্য ইন্ডিয়ান ভিসা পেতে Sodi Euro কি সহায়তা করে?',
              a: 'হ্যাঁ! আমাদের পোর্টালের মাধ্যমে অ্যাপ্লিকেশন শুরু করার পর আমাদের দিল্লী ও ঢাকা টিম আপনার জন্য ভারতীয় ডাবল এন্ট্রি বা ট্রানজিট ভিসার ই-টোকেন বুকিং, ফরম পূরণ এবং ফাইল রেডি করে দেয় যাতে আপনি দিল্লী গিয়ে নির্বিঘ্নে ইন্টারভিউ দিতে পারেন।'
            },
            {
              q: 'বুলগেরিয়া স্টুডেন্ট ভিসায় পড়াশোনার পাশাপাশি পার্ট-টাইম কাজের সুযোগ কেমন?',
              a: 'আন্তর্জাতিক শিক্ষার্থী হিসেবে আপনি সপ্তাহে সর্বোচ্চ ২০ ঘন্টা পার্ট-টাইম কাজ করার আইনি অধিকার পাবেন। সেমিস্টার বিরতি বা ছুটির সময় ফুল-টাইম কাজ করতে পারবেন। তাছাড়া সেনজেনভুক্ত দেশ হওয়ায় বর্তমানে এটি আরও আকর্ষণীয়।'
            },
            {
              q: 'সার্টিফিকেট ও পুলিশ ক্লিয়ারেন্স সত্যায়নের সঠিক নিয়ম কি?',
              a: 'প্রথমে বোর্ড ভেরিফিকেশন, তারপর শিক্ষা মন্ত্রণালয় থেকে সত্যায়ন এবং সবশেষে পররাষ্ট্র মন্ত্রণালয় থেকে লাল সিল নিয়ে সত্যায়িত করতে হয়। Sodi Euro আপনার হয়ে বোর্ডের দীর্ঘ লাইন ও মন্ত্রণালয়ের সত্যায়ন প্রক্রিয়া ওয়ান-স্টপ সলিউশনে করে দেবে।'
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
