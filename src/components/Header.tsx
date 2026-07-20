import React, { useState } from 'react';
import { Compass, GraduationCap, ShieldCheck, Sparkles, Menu, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentView: 'lobby' | 'student' | 'admin' | 'support';
  setView: (view: 'lobby' | 'student' | 'admin' | 'support') => void;
  activeApplicationId?: string;
}

export default function Header({ currentView, setView, activeApplicationId }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (view: 'lobby' | 'student' | 'admin' | 'support') => {
    setView(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative sticky top-0 z-50 w-full border-b-2 border-brand-gold/20 bg-white/95 backdrop-blur-md shadow-sm" id="app-header">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-3 transition-transform duration-300 hover:scale-[1.03]"
          onClick={() => handleNavClick('lobby')}
          id="brand-logo-container"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-sky to-brand-gold text-white shadow-md shadow-brand-sky/30 border border-brand-gold/30">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-brand-sky-dark via-brand-gold-dark to-brand-gold bg-clip-text text-transparent">Sodi Euro</span>
              <span className="hidden rounded-full bg-brand-sky-light border border-brand-sky/20 px-2 py-0.5 text-[10px] font-bold text-brand-sky-dark sm:inline-block">
                Premium Gateway
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500">ইউরোপিয়ান স্টুডেন্ট ভিসা পোর্টাল ও ট্র্যাকিং</p>
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
              <span>তথ্যসেবা ও নির্দেশিকা</span>
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
              <span>স্টুডেন্ট পোর্টাল</span>
              {activeApplicationId && (
                <span className="ml-1 rounded-full bg-brand-gold text-white px-1.5 py-0.2 text-[9px] font-extrabold flex items-center space-x-0.5 shadow-sm animate-pulse">
                  <Sparkles className="h-2.5 w-2.5 shrink-0" />
                  <span className="hidden xs:inline">সচল</span>
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
              <span>অ্যাডমিন প্যানেল</span>
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
              <span>সাপোর্ট ও যোগাযোগ</span>
            </button>
          </nav>
        </div>

        {/* Mobile Hamburger Button - Visible on Mobile Only */}
        <div className="flex md:hidden items-center space-x-3.5" id="mobile-menu-toggle-container">
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
                  <span className="block">তথ্যসেবা ও নির্দেশিকা</span>
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
                    <span className="block">স্টুডেন্ট পোর্টাল</span>
                    <span className="text-[10px] font-normal opacity-80 block mt-0.5">Submit & Track Visa Files</span>
                  </div>
                  {activeApplicationId && (
                    <span className="rounded-full bg-brand-gold text-white px-2 py-0.5 text-[9px] font-extrabold flex items-center space-x-0.5 shadow-sm animate-pulse shrink-0">
                      <Sparkles className="h-2.5 w-2.5 shrink-0" />
                      <span>সচল</span>
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
                  <span className="block">অ্যাডমিন প্যানেল</span>
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
                  <span className="block">সাপোর্ট ও যোগাযোগ</span>
                  <span className="text-[10px] font-normal opacity-80 block mt-0.5">Contact Dilowar Hosen & Sohel Rana</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
