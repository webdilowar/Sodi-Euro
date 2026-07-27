import React, { useState } from 'react';
import { Compass, GraduationCap, ShieldCheck, Sparkles, Menu, X, HelpCircle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentView: 'lobby' | 'student' | 'admin' | 'support';
  setView: (view: 'lobby' | 'student' | 'admin' | 'support') => void;
  activeApplicationId?: string;
}

export default function Header({ currentView, setView, activeApplicationId }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleNavClick = (view: 'lobby' | 'student' | 'admin' | 'support') => {
    setView(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative sticky top-0 z-50 w-full border-b-2 border-brand-gold/20 bg-white/95 backdrop-blur-md shadow-sm" id="app-header">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-3 transition-transform duration-300 hover:scale-[1.02]"
          onClick={() => handleNavClick('lobby')}
          id="brand-logo-container"
        >
          <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-white border border-slate-200 shadow-md notranslate">
            <img src="/logo.png" alt="NOVENTRA Logo" className="h-full w-full object-contain notranslate" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-sans font-black text-xl tracking-wider text-slate-900 uppercase notranslate">NOVENTRA</span>
              <span className="hidden rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-black text-amber-600 tracking-wider uppercase sm:inline-block notranslate">
                SINCE : 2026
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 tracking-tight notranslate">Gateway to Global Education</p>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:flex items-center space-x-4" id="main-navigation-wrapper">
          <nav className="flex items-center space-x-2" id="main-navigation">
            <button
              id="nav-lobby-btn"
              onClick={() => handleNavClick('lobby')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                currentView === 'lobby'
                  ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-b-2 border-brand-gold'
                  : 'text-slate-600 hover:bg-brand-sky-light hover:text-brand-sky-dark'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>{t('nav_info')}</span>
            </button>

            <button
              id="nav-student-btn"
              onClick={() => handleNavClick('student')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                currentView === 'student'
                  ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-b-2 border-brand-gold'
                  : 'text-slate-600 hover:bg-brand-sky-light hover:text-brand-sky-dark'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>{t('nav_student')}</span>
              {activeApplicationId && (
                <span className="ml-1 rounded-full bg-brand-gold text-white px-1.5 py-0.2 text-[9px] font-extrabold flex items-center space-x-0.5 shadow-sm animate-pulse">
                  <Sparkles className="h-2.5 w-2.5 shrink-0" />
                  <span className="hidden xs:inline">{t('active_tag')}</span>
                </span>
              )}
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => handleNavClick('admin')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white shadow-md border-b-2 border-brand-gold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-brand-gold" />
              <span>{t('nav_admin')}</span>
            </button>

            <button
              id="nav-support-btn"
              onClick={() => handleNavClick('support')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                currentView === 'support'
                  ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-b-2 border-brand-gold'
                  : 'text-slate-600 hover:bg-brand-sky-light hover:text-brand-sky-dark'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>{t('nav_support')}</span>
            </button>
          </nav>

          {/* BN = EN Language Switcher Button */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 shadow-inner ml-2" id="language-switcher-desktop">
            <Globe className="h-3.5 w-3.5 text-slate-500 ml-1.5 mr-1" />
            <button
              id="lang-btn-bn"
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 text-xs font-black rounded-md transition-all duration-200 ${
                language === 'bn' 
                  ? 'bg-amber-500 text-white shadow-sm scale-105' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="বাংলা ভাষা নির্বাচন করুন"
            >
              BN
            </button>
            <span className="text-slate-300 px-0.5 text-xs font-bold">|</span>
            <button
              id="lang-btn-en"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-black rounded-md transition-all duration-200 ${
                language === 'en' 
                  ? 'bg-amber-500 text-white shadow-sm scale-105' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Switch to English"
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button + Mobile Language Toggle */}
        <div className="flex md:hidden items-center space-x-2.5" id="mobile-menu-toggle-container">
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200" id="language-switcher-mobile">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2 py-0.5 text-[11px] font-black rounded transition-all ${
                language === 'bn' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              BN
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-[11px] font-black rounded transition-all ${
                language === 'en' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              EN
            </button>
          </div>

          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-5 w-5 text-slate-800" /> : <Menu className="h-5 w-5 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 z-50 md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md overflow-hidden shadow-lg"
          >
            <div className="p-4 space-y-2.5">
              <button
                id="mobile-nav-lobby-btn"
                onClick={() => handleNavClick('lobby')}
                className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  currentView === 'lobby'
                    ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-l-4 border-brand-gold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Compass className="h-5 w-5 shrink-0" />
                <div className="flex-grow text-left">
                  <span className="block">Info & Guidelines</span>
                  <span className="text-[10px] font-normal opacity-80 block mt-0.5">European Student Visa Process Info</span>
                </div>
              </button>

              <button
                id="mobile-nav-student-btn"
                onClick={() => handleNavClick('student')}
                className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  currentView === 'student'
                    ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-l-4 border-brand-gold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="h-5 w-5 shrink-0" />
                <div className="flex-grow text-left flex items-center justify-between">
                  <div>
                    <span className="block">Student Portal</span>
                    <span className="text-[10px] font-normal opacity-80 block mt-0.5">Submit & Track Visa Files</span>
                  </div>
                  {activeApplicationId && (
                    <span className="rounded-full bg-brand-gold text-white px-2 py-0.5 text-[9px] font-extrabold flex items-center space-x-0.5 shadow-sm animate-pulse shrink-0">
                      <Sparkles className="h-2.5 w-2.5 shrink-0" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              </button>

              <button
                id="mobile-nav-admin-btn"
                onClick={() => handleNavClick('admin')}
                className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white shadow-md border-l-4 border-brand-gold'
                    : 'text-slate-700 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-brand-gold" />
                <div className="flex-grow text-left">
                  <span className="block">Admin Panel</span>
                  <span className="text-[10px] font-normal opacity-80 block mt-0.5">Manage Agency File Approvals</span>
                </div>
              </button>

              <button
                id="mobile-nav-support-btn"
                onClick={() => handleNavClick('support')}
                className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  currentView === 'support'
                    ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-l-4 border-brand-gold'
                    : 'text-slate-700 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                <HelpCircle className="h-5 w-5 shrink-0 text-brand-gold" />
                <div className="flex-grow text-left">
                  <span className="block">Support & Contact</span>
                  <span className="text-[10px] font-normal opacity-80 block mt-0.5">Contact Leadership & Team</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
