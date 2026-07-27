import React, { createContext, useContext, useState, useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export type Language = 'en' | 'bn';

export const dictionary: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    brand_name: "NOVENTRA",
    brand_tagline: "Gateway to Global Education",
    nav_info: "Info & Guidelines",
    nav_student: "Student Portal",
    nav_admin: "Admin Panel",
    nav_support: "Support & Contact",
    active_tag: "Active",
    since_tag: "SINCE : 2026",

    // Footer
    footer_slogan: "Gateway to Global Education",
    footer_rights: "© 2026 NOVENTRA. All rights reserved. Global Education & Visa Processing Consultancy.",
    footer_home: "Home",
    footer_student_portal: "Student Portal",
    footer_admin_console: "Admin Console",
    footer_support: "Support & Contact",

    // Hero & Lobby
    hero_title_1: "Gateway to Global Education",
    hero_title_2: "Secure One-Stop Student Visa Portal",
    hero_subtitle: "Official agency consultancy platform for Bulgarian Higher Education, European D-type Student Visa processing, Board verification, & Delhi Embassy slot booking.",
    hero_btn_apply: "Start New Application",
    hero_btn_track: "Track Existing File",
    hero_stat_1_val: "98.4%",
    hero_stat_1_lbl: "Visa Success Rate",
    hero_stat_2_val: "1,200+",
    hero_stat_2_lbl: "Enrolled Students",
    hero_stat_3_val: "100%",
    hero_stat_3_lbl: "Embassy Slot Guarantee",

    // Pathway
    pathway_title: "Student Visa Process Pathway",
    pathway_subtitle: "A streamlined 4-stage transparent roadmap from document attestation to Sofia arrival.",

    // Support Page
    support_title: "Leadership & Support Center",
    support_subtitle: "Reach out to our leadership team and dedicated visa consultants for expert guidance.",

    // General UI
    logout: "Logout",
    close: "Close",
    cancel: "Cancel",
    save: "Save Changes",
    upload: "Upload File",
    download: "Download",
    view: "View Details",
    language_switch: "Language / ভাষা",
  },
  bn: {
    // Header & Navigation
    brand_name: "NOVENTRA",
    brand_tagline: "Gateway to Global Education",
    nav_info: "তথ্য ও নির্দেশিকা",
    nav_student: "স্টুডেন্ট পোর্টাল",
    nav_admin: "এডমিন প্যানেল",
    nav_support: "সাপোর্ট ও যোগাযোগ",
    active_tag: "সক্রিয়",
    since_tag: "স্থাপিত : ২০২৬",

    // Footer
    footer_slogan: "Gateway to Global Education",
    footer_rights: "© ২০২৬ NOVENTRA। সর্বস্বত্ব সংরক্ষিত। গ্লোবাল এডুকেশন ও ভিসা প্রসেসিং কনসালটেন্সি।",
    footer_home: "হোম",
    footer_student_portal: "স্টুডেন্ট পোর্টাল",
    footer_admin_console: "এডমিন কনসোল",
    footer_support: "সাপোর্ট ও যোগাযোগ",

    // Hero & Lobby
    hero_title_1: "Gateway to Global Education",
    hero_title_2: "বুলগেরিয়া স্টুডেন্ট ভিসা পোর্টাল",
    hero_subtitle: "বুলগেরিয়ার উচ্চশিক্ষা, ইউরোপীয় D-টাইপ স্টুডেন্ট ভিসা প্রসেসিং, বোর্ড ভেরিফিকেশন এবং দিল্লী এম্বাসি স্লট বুকিংয়ের বিশ্বস্ত এজেন্সি প্লাটফর্ম।",
    hero_btn_apply: "নতুন আবেদন শুরু করুন",
    hero_btn_track: "আবেদন ট্র্যাক করুন",
    hero_stat_1_val: "৯৮.৪%",
    hero_stat_1_lbl: "ভিসা সাফল্যের হার",
    hero_stat_2_val: "১,২০০+",
    hero_stat_2_lbl: "ভর্তি হওয়া শিক্ষার্থী",
    hero_stat_3_val: "১০০%",
    hero_stat_3_lbl: "এম্বাসি স্লট গ্যারান্টি",

    // Pathway
    pathway_title: "স্টুডেন্ট ভিসা প্রসেসিং ধাপসমূহ",
    pathway_subtitle: "কাগজপত্র সত্যায়ন থেকে সোফিয়া পৌঁছানো পর্যন্ত ৪টি ধাপে স্বচ্ছ রোডম্যাপ।",

    // Support Page
    support_title: "নেতৃত্ব ও সাপোর্ট সেন্টার",
    support_subtitle: "অভিজ্ঞ দিকনির্দেশনা এবং পরামর্শের জন্য আমাদের প্রতিনিধি দলের সাথে সরাসরি যোগাযোগ করুন।",

    // General UI
    logout: "লগআউট",
    close: "বন্ধ করুন",
    cancel: "বাতিল",
    save: "সংরক্ষণ করুন",
    upload: "ফাইল আপলোড",
    download: "ডাউনলোড",
    view: "বিস্তারিত দেখুন",
    language_switch: "ভাষা / Language",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'bn' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    // Inject Custom CSS to suppress Google Translate Banner/Tooltips cleanly
    const styleId = 'google-translate-custom-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; position: static !important; }
        .goog-tooltip, .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
        #google_translate_element { display: none !important; }
        .VIpgJd-Z44wsf-O92Bfe { display: none !important; }
        iframe.skiptranslate { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    // Ensure hidden container exists
    let elem = document.getElementById('google_translate_element');
    if (!elem) {
      elem = document.createElement('div');
      elem.id = 'google_translate_element';
      elem.style.display = 'none';
      document.body.appendChild(elem);
    }

    // Set callback
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'bn,en', autoDisplay: false },
          'google_translate_element'
        );
      }
    };

    // Inject Google script
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const triggerGoogleTranslate = (lang: Language) => {
    const domain = window.location.hostname;
    if (lang === 'bn') {
      document.cookie = `googtrans=/en/bn; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/bn; path=/;`;
    } else {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=/en/en; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/en; path=/;`;
    }

    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = lang === 'bn' ? 'bn' : 'en';
      selectElem.dispatchEvent(new Event('change'));
    } else {
      setTimeout(() => {
        const delayedSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (delayedSelect) {
          delayedSelect.value = lang === 'bn' ? 'bn' : 'en';
          delayedSelect.dispatchEvent(new Event('change'));
        }
      }, 500);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    triggerGoogleTranslate(lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = dictionary[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
