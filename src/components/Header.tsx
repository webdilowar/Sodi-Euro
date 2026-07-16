import React from 'react';
import { Compass, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentView: 'lobby' | 'student' | 'admin';
  setView: (view: 'lobby' | 'student' | 'admin') => void;
  activeApplicationId?: string;
}

export default function Header({ currentView, setView, activeApplicationId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-brand-gold/20 bg-white/90 backdrop-blur-md shadow-sm" id="app-header">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-3 transition-transform duration-300 hover:scale-[1.03]"
          onClick={() => setView('lobby')}
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

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-1 sm:space-x-2" id="main-navigation">
          <button
            id="nav-lobby-btn"
            onClick={() => setView('lobby')}
            className={`flex items-center space-x-1.5 rounded-lg px-2 sm:px-3 py-2 text-xs font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              currentView === 'lobby'
                ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-b-2 border-brand-gold'
                : 'text-slate-600 hover:bg-brand-sky-light hover:text-brand-sky-dark'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span className="hidden md:inline">তথ্যসেবা ও নির্দেশিকা</span>
            <span className="inline md:hidden">হোম</span>
          </button>

          <button
            id="nav-student-btn"
            onClick={() => setView('student')}
            className={`flex items-center space-x-1.5 rounded-lg px-2 sm:px-3 py-2 text-xs font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              currentView === 'student'
                ? 'bg-brand-sky text-white shadow-md shadow-brand-sky/20 border-b-2 border-brand-gold'
                : 'text-slate-600 hover:bg-brand-sky-light hover:text-brand-sky-dark'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">স্টুডেন্ট পোর্টাল</span>
            <span className="inline sm:hidden">পোর্টাল</span>
            {activeApplicationId && (
              <span className="ml-1 rounded-full bg-brand-gold text-white px-1 sm:px-1.5 py-0.2 text-[9px] font-extrabold flex items-center space-x-0.5 shadow-sm animate-pulse">
                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                <span className="hidden xs:inline">সচল</span>
              </span>
            )}
          </button>

          <button
            id="nav-admin-btn"
            onClick={() => setView('admin')}
            className={`flex items-center space-x-1.5 rounded-lg px-2 sm:px-3 py-2 text-xs font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              currentView === 'admin'
                ? 'bg-slate-900 text-white shadow-md border-b-2 border-brand-gold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-brand-gold" />
            <span className="hidden sm:inline">অ্যাডমিন প্যানেল</span>
            <span className="inline sm:hidden">অ্যাডমিন</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
