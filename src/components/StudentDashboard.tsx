import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Application, UploadedDocument } from '../types';
import { documentRequirements } from '../data';
import { 
  Search, 
  User, 
  CreditCard, 
  FileText, 
  Bell, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Lock, 
  ArrowRight,
  ShieldAlert,
  Send,
  FileCheck2,
  CalendarDays
} from 'lucide-react';

interface StudentDashboardProps {
  applications: Application[];
  onAddApplication: (app: Application) => void;
  onUpdateApplication: (app: Application) => void;
  activeAppId: string | null;
  setActiveAppId: (id: string | null) => void;
}

export default function StudentDashboard({
  applications,
  onAddApplication,
  onUpdateApplication,
  activeAppId,
  setActiveAppId
}: StudentDashboardProps) {
  // Navigation inside dashboard
  const [activeTab, setActiveTab] = useState<'tracking' | 'documents' | 'payment'>('tracking');
  
  // Login / Track Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Application Form States (for new applicants)
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    email: '',
    phone: '',
    desiredCourse: 'BSc in Computer Science (Technical University of Sofia)'
  });
  const [formError, setFormError] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [bkashStep, setBkashStep] = useState<'phone' | 'otp' | 'pin' | 'success'>('phone');
  const [bkashPhone, setBkashPhone] = useState('');
  const [bkashOtp, setBkashOtp] = useState('');
  const [bkashPin, setBkashPin] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // File Upload Simulator state
  const [uploadingDocCategory, setUploadingDocCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Active Application object
  const activeApp = applications.find(a => a.id === activeAppId);

  // Handle Search Tracking
  const handleSearchTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchQuery.trim()) return;

    const found = applications.find(
      a => a.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
           a.passportNumber.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (found) {
      setActiveAppId(found.id);
      setActiveTab('tracking');
    } else {
      setSearchError('দুঃখিত! এই পাসপোর্ট নম্বর বা অ্যাপ্লিকেশন আইডি দিয়ে কোনো রেকর্ড খুঁজে পাওয়া যায়নি।');
    }
  };

  // Handle Quick Select (for testing ease)
  const handleQuickSelect = (id: string) => {
    setActiveAppId(id);
    setActiveTab('tracking');
  };

  // Handle New Application Submission
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { fullName, passportNumber, email, phone, desiredCourse } = formData;
    if (!fullName || !passportNumber || !email || !phone) {
      setFormError('অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    // Check if passport already exists
    const exists = applications.find(a => a.passportNumber.toUpperCase() === passportNumber.toUpperCase());
    if (exists) {
      setFormError('এই পাসপোর্ট নম্বর দিয়ে ইতিমধ্যে একটি আবেদন করা হয়েছে!');
      return;
    }

    // Build application object
    const newId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: Application = {
      id: newId,
      fullName,
      passportNumber: passportNumber.toUpperCase(),
      email,
      phone,
      desiredCourse,
      status: 'Submitted',
      paymentStatus: 'Unpaid',
      paymentAmount: 15000,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      documents: [],
      notificationHistory: [
        {
          id: `not-${Math.random()}`,
          title: 'আবেদন সফলভাবে তৈরি হয়েছে',
          body: `প্রিয় ${fullName}, বুলগেরিয়া স্টুডেন্ট ভিসা আবেদনের পোর্টাল অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আইডি: ${newId}। এখন প্রয়োজনীয় কাগজপত্র ড্যাশবোর্ডে আপলোড করুন।`,
          type: 'sms',
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          recipient: phone
        }
      ]
    };

    onAddApplication(newApp);
    setActiveAppId(newId);
    setShowApplyForm(false);
    setActiveTab('documents'); // Direct them to document upload
  };

  // Simulating File Upload
  const handleFileUpload = (category: string) => {
    if (!activeApp) return;
    setUploadingDocCategory(category);
    
    let progress = 10;
    setUploadProgress(progress);

    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        
        // Complete upload and update state
        const matchedReq = documentRequirements.find(r => r.id === category);
        const newDoc: UploadedDocument = {
          id: `doc-${Date.now()}`,
          name: matchedReq?.title.split('(')[0].trim() || 'Uploaded Document',
          category,
          fileName: `${category}_uploaded_${activeApp.id.toLowerCase()}.pdf`,
          fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
          status: 'Pending',
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        // Check if document already uploaded, if so, replace it
        const filteredDocs = activeApp.documents.filter(d => d.category !== category);
        const updatedApp: Application = {
          ...activeApp,
          documents: [...filteredDocs, newDoc]
        };

        onUpdateApplication(updatedApp);
        setTimeout(() => {
          setUploadingDocCategory('');
          setSelectedFile(null);
          setUploadProgress(0);
        }, 600);
      } else {
        setUploadProgress(progress);
      }
    }, 200);
  };

  // Simulating Payment Gateways
  const handleProcessPayment = () => {
    if (!activeApp) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const txnId = paymentMethod === 'card' 
        ? `CARD${Math.floor(100000000 + Math.random() * 900000000)}`
        : `${paymentMethod === 'bkash' ? 'BKX' : 'NGD'}${Math.floor(100000000 + Math.random() * 900000000)}`;

      const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const updatedHistory = [
        ...activeApp.notificationHistory,
        {
          id: `not-pay-${Date.now()}`,
          title: 'পেমেন্ট সফল হয়েছে',
          body: `প্রিয় ${activeApp.fullName}, আপনার ইন্ডিয়ান ভিসা প্রসেসিং ও দিল্লী ট্রাভেল ফি ১৫,০০০ টাকা সফলভাবে পরিশোধ করা হয়েছে। ট্রানজেকশন আইডি: ${txnId}।`,
          type: 'email' as const,
          sentAt: currentTimestamp,
          recipient: activeApp.email
        },
        {
          id: `not-pay-sms-${Date.now()}`,
          title: 'ফি প্রাপ্তি নিশ্চিতকরণ',
          body: `আপনার বুলগেরিয়া স্টুডেন্ট ভিসা ফাইলিং ও দিল্লী ট্রানজিট ফি ১৫,০০০ টাকা পরিশোধিত হয়েছে। ট্রানজেকশন আইডি: ${txnId}`,
          type: 'sms' as const,
          sentAt: currentTimestamp,
          recipient: activeApp.phone
        }
      ];

      const updatedApp: Application = {
        ...activeApp,
        paymentStatus: 'Paid',
        paymentMethod: paymentMethod === 'card' ? 'Visa Card' : (paymentMethod === 'bkash' ? 'bKash' : 'Nagad'),
        paymentTxnId: txnId,
        paymentDate: currentTimestamp,
        notificationHistory: updatedHistory
      };

      onUpdateApplication(updatedApp);
      setIsProcessingPayment(false);
      
      if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
        setBkashStep('success');
      } else {
        alert('আপনার কার্ড পেমেন্ট সফল হয়েছে! ধন্যবাদ।');
        setActiveTab('tracking');
      }
    }, 2000);
  };

  // Active status color helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-100">আবেদন জমা হয়েছে</span>;
      case 'Document Verification':
        return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-100">কাগজপত্র যাচাইকরণ</span>;
      case 'Embassy Processing':
        return <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-600 border border-purple-100">দিল্লী দূতাবাস প্রসেসিং</span>;
      case 'Visa Issued':
        return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-100">ভিসা স্ট্যাম্পড (অনুমোদিত)</span>;
      case 'Rejected':
        return <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 border border-rose-100">বাতিল করা হয়েছে</span>;
      default:
        return null;
    }
  };

  return (
    <div className="py-6 space-y-8" id="student-portal-root">
      {/* Search / Track Area if not logged in */}
      {!activeApp ? (
        <motion.div 
          initial={{ opacity: 0, rotateX: -15, y: 30 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl space-y-8 perspective-1000" 
          id="portal-login-screen"
        >
          <div className="text-center space-y-3">
            <span className="font-display font-black text-brand-sky bg-brand-sky-light border border-brand-sky/20 px-3 py-1 rounded-full text-xs">
              Sodi Euro স্টুডেন্ট সার্ভিসেস
            </span>
            <h1 className="font-display text-3xl font-extrabold text-slate-800">আপনার ভিসা আবেদন ট্র্যাকিং করুন</h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Sodi Euro ড্যাশবোর্ডে আপনার অ্যাপ্লিকেশন আইডি অথবা পাসপোর্ট নম্বর দিয়ে আবেদনের রিয়েল-টাইম আপডেট চেক করুন এবং কাগজপত্র আপলোড সম্পূর্ণ করুন।
            </p>
          </div>

          <div className="rounded-2xl border-2 border-brand-gold/15 bg-white p-6 shadow-xl space-y-6 transform-style-3d hover:shadow-2xl hover:shadow-brand-sky/5 transition-all duration-300">
            <form onSubmit={handleSearchTrack} className="space-y-4" id="track-form">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">অ্যাপ্লিকেশন আইডি অথবা পাসপোর্ট নম্বর:</label>
                <div className="relative">
                  <input
                    id="track-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="যেমন: APP-8392 অথবা EF0192837"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky"
                  />
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
                {searchError && <p className="text-[11px] text-red-500 font-medium" id="search-error">{searchError}</p>}
              </div>

              <button
                id="submit-search-track-btn"
                type="submit"
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold-dark py-3 text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-brand-sky/20"
              >
                <span>আবেদন ট্র্যাকিং করুন</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">অথবা নতুন আবেদন</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Test Student Quick Selects - Extremely Helpful */}
            <div className="space-y-3">
              <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">টেস্ট ডেমো স্টুডেন্টদের তালিকা (ক্লিক করে ট্র্যাক করুন):</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {applications.map((app) => (
                  <button
                    key={app.id}
                    id={`quick-select-${app.id}`}
                    onClick={() => handleQuickSelect(app.id)}
                    className="flex items-center justify-between rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-2.5 text-left transition-all hover:bg-brand-sky-light/60 hover:border-brand-sky/30"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 leading-tight">{app.fullName}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{app.id} · {app.passportNumber}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                id="toggle-apply-form-btn"
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="text-xs font-bold text-brand-sky hover:text-brand-sky-dark hover:underline"
              >
                {showApplyForm ? 'পদ্ধতি লুকান' : 'নতুন ফাইল প্রসেসিং এর জন্য আবেদন করুন'}
              </button>
            </div>
          </div>

          {/* New Application Form with folding effect */}
          <AnimatePresence>
            {showApplyForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0, rotateX: -20, transformOrigin: "top" }}
                animate={{ opacity: 1, height: "auto", rotateX: 0 }}
                exit={{ opacity: 0, height: 0, rotateX: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="rounded-2xl border-2 border-brand-gold/15 bg-white p-6 shadow-lg space-y-4 overflow-hidden perspective-1000" 
                id="new-apply-form-block"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-display font-bold text-slate-800 text-base">বুলগেরিয়া স্টুডেন্ট ভিসা ফাইলিং ফর্ম</h3>
                  <p className="text-[11px] text-slate-500">আপনার বেসিক তথ্য প্রদান করে পোর্টাল অ্যাকাউন্ট খুলুন।</p>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">পূর্ণ নাম (বাংলা অথবা ইংরেজি):</label>
                      <input
                        required
                        type="text"
                        placeholder="যেমন: মো: কামরুল হাসান"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-brand-sky focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">পাসপোর্ট নম্বর:</label>
                      <input
                        required
                        type="text"
                        placeholder="যেমন: EF0129384"
                        value={formData.passportNumber}
                        onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-brand-sky focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">ইমেইল ঠিকানা:</label>
                      <input
                        required
                        type="email"
                        placeholder="যেমন: email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-brand-sky focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">মোবাইল নম্বর (SMS নোটিফিকেশনের জন্য):</label>
                      <input
                        required
                        type="tel"
                        placeholder="যেমন: 01712345678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-brand-sky focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">কাঙ্ক্ষিত কোর্স ও বিশ্ববিদ্যালয়:</label>
                    <select
                      value={formData.desiredCourse}
                      onChange={(e) => setFormData({ ...formData, desiredCourse: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-brand-sky focus:outline-none"
                    >
                      <option>BSc in Computer Science (Technical University of Sofia)</option>
                      <option>MSc in International Business (Varna University of Management)</option>
                      <option>BSc in Software Engineering (Sofia University)</option>
                      <option>MBA (Technical University of Varna)</option>
                      <option>BSc in Medicine (Medical University Sofia)</option>
                    </select>
                  </div>

                  {formError && <p className="text-[11px] text-red-500 font-medium">{formError}</p>}

                  <button
                    id="submit-registration-btn"
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold py-3 text-xs font-bold text-white transition-all hover:scale-[1.01]"
                  >
                    ফাইল ওপেন করুন ও ডকুমেন্ট জমা দিন
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Active Application Area */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6" 
          id="portal-dashboard-screen"
        >
          {/* Dashboard Header Bar */}
          <div className="flex flex-col space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-sky/10 text-brand-sky shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-display text-lg font-bold text-slate-800">{activeApp.fullName}</h2>
                  <span className="font-mono text-xs text-slate-400">({activeApp.id})</span>
                </div>
                <p className="text-xs text-slate-500">{activeApp.desiredCourse}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {getStatusBadge(activeApp.status)}
              <button
                id="logout-portal-btn"
                onClick={() => {
                  setActiveAppId(null);
                  setActiveTab('tracking');
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                আউট করুন
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory" id="dashboard-tabs">
            <button
              id="tab-tracking"
              onClick={() => setActiveTab('tracking')}
              className={`border-b-2 px-4 sm:px-6 py-3 text-xs font-bold transition-all shrink-0 snap-start ${
                activeTab === 'tracking'
                  ? 'border-brand-sky text-brand-sky'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="md:inline hidden">রিয়েল-টাইম ট্র্যাকিং (Real-time tracking)</span>
              <span className="md:hidden inline">আবেদন ট্র্যাকিং</span>
            </button>
            <button
              id="tab-documents"
              onClick={() => setActiveTab('documents')}
              className={`border-b-2 px-4 sm:px-6 py-3 text-xs font-bold transition-all shrink-0 snap-start ${
                activeTab === 'documents'
                  ? 'border-brand-sky text-brand-sky'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="md:inline hidden">ডকুমেন্ট আপলোড ও গাইডলাইন (Secure Upload)</span>
              <span className="md:hidden inline">কাগজপত্র আপলোড</span>
            </button>
            <button
              id="tab-payment"
              onClick={() => setActiveTab('payment')}
              className={`border-b-2 px-4 sm:px-6 py-3 text-xs font-bold transition-all shrink-0 snap-start relative ${
                activeTab === 'payment'
                  ? 'border-brand-sky text-brand-sky'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="md:inline hidden">ফি ও পেমেন্ট গেটওয়ে (Indian Visa Services)</span>
              <span className="md:hidden inline">ফি ও পেমেন্ট</span>
              {activeApp.paymentStatus !== 'Paid' && (
                <span className="absolute top-1.5 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Real-time Tracking */}
          {activeTab === 'tracking' && (
            <div className="grid gap-6 lg:grid-cols-3" id="tracking-tab-content">
              {/* Tracker Timeline Column */}
              <div className="space-y-6 lg:col-span-2">
                {activeApp.paymentStatus !== 'Paid' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border-2 border-brand-gold bg-gradient-to-r from-amber-50/85 via-orange-50/70 to-amber-50/45 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    id="unpaid-alert-banner"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30">
                        <CreditCard className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">পেমেন্ট পেন্ডিং আছে (Payment Action Required)</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                          আপনার ভারতীয় ডাবল এন্ট্রি ভিসা এবং দিল্লী ট্রাভেল প্রসেসিং ফি <strong>৳ ১৫,০০০ BDT</strong> অপরিশোধিত রয়েছে। দ্রুত প্রসেসিং শুরু করতে ফি পরিশোধ করুন।
                        </p>
                      </div>
                    </div>
                    <button
                      id="banner-pay-now-btn"
                      onClick={() => setActiveTab('payment')}
                      className="w-full sm:w-auto shrink-0 rounded-lg bg-gradient-to-r from-brand-sky to-brand-sky-dark text-white px-4 py-2.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all text-center border-b border-brand-gold"
                    >
                      ফি পরিশোধ করুন ➔
                    </button>
                  </motion.div>
                )}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-display font-bold text-slate-800 text-sm mb-6 border-b border-slate-50 pb-3">
                    আপনার আবেদনের বর্তমান অবস্থা (Live Processing Status)
                  </h3>

                  <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8">
                    {[
                      {
                        key: 'Submitted',
                        title: 'আবেদন ফাইল খোলা হয়েছে',
                        desc: 'আপনার বেসিক ফাইল এজেন্সিতে রেডি করা হয়েছে।',
                        time: activeApp.createdAt,
                        isActive: true,
                        isCompleted: true
                      },
                      {
                        key: 'Document Verification',
                        title: 'ডকুমেন্ট ভেরিফিকেশন ও এটেস্টেশন',
                        desc: 'বাংলাদেশ পররাষ্ট্র মন্ত্রণালয় ও শিক্ষাবোর্ডের সত্যায়ন প্রক্রিয়া চলমান।',
                        time: activeApp.documents.length > 0 ? activeApp.documents[0].uploadedAt : '',
                        isActive: activeApp.status === 'Document Verification' || activeApp.status === 'Embassy Processing' || activeApp.status === 'Visa Issued',
                        isCompleted: activeApp.status === 'Embassy Processing' || activeApp.status === 'Visa Issued'
                      },
                      {
                        key: 'Embassy Processing',
                        title: 'দিল্লী দূতাবাস প্রসেসিং ও ভারতীয় ভিসা',
                        desc: 'ভারতীয় ট্রানজিট ভিসা বুকিং সম্পন্ন এবং দিল্লীস্থ বুলগেরিয়ান দূতাবাসে অ্যাপয়েন্টমেন্ট বুকিং প্রসেস।',
                        time: activeApp.status === 'Embassy Processing' ? 'চলমান' : (activeApp.status === 'Visa Issued' ? 'সম্পন্ন' : ''),
                        isActive: activeApp.status === 'Embassy Processing' || activeApp.status === 'Visa Issued',
                        isCompleted: activeApp.status === 'Visa Issued'
                      },
                      {
                        key: 'Visa Issued',
                        title: 'বুলগেরিয়া স্টুডেন্ট ভিসা অনুমোদিত',
                        desc: 'অভিনন্দন! আপনার বুলগেরিয়া স্টুডেন্ট ভিসা সফলভাবে অনুমোদন ও পাসপোর্ট স্ট্যাম্পিং সম্পন্ন হয়েছে।',
                        time: activeApp.status === 'Visa Issued' ? 'ফ্লাইট প্রিপারেশন' : '',
                        isActive: activeApp.status === 'Visa Issued',
                        isCompleted: activeApp.status === 'Visa Issued'
                      }
                    ].map((step, idx) => (
                      <div key={idx} className="relative" id={`tracking-step-${idx}`}>
                        {/* Bullet circle */}
                        <div className={`absolute -left-[33px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          step.isCompleted 
                            ? 'bg-brand-sky border-brand-sky text-white' 
                            : (step.isActive ? 'bg-white border-brand-sky text-brand-sky' : 'bg-white border-slate-200 text-slate-400')
                        }`}>
                          {step.isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                        </div>

                        {/* Text */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between">
                            <h4 className={`text-xs font-bold ${step.isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step.title}
                            </h4>
                            {step.time && (
                              <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                            )}
                          </div>
                          <p className={`text-xs ${step.isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional tracking guidance */}
                <div className="rounded-xl bg-brand-sky-light p-4 border border-brand-sky/20 flex items-start space-x-3">
                  <ShieldAlert className="h-5 w-5 text-brand-sky shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-sky-dark">জরুরি রিয়েল-тайম নির্দেশনা</h4>
                    <p className="text-[11px] text-slate-700 leading-relaxed mt-1">
                      বুলগেরিয়া দূতাবাস দিল্লীতে হওয়ায় আমরা আপনার ভারতীয় ডাবল এন্ট্রি visa এবং দিল্লী ভ্রমণের সমস্ত হোটেল ও কনভেয়েন্স শিডিউল এখান থেকেই কন্ট্রোল করছি। প্রতিটি বড় আপডেটের পর আপনার ফোনে স্বয়ংক্রিয় এসএমএস (SMS) চলে যাবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time Notifications & SMS History Column */}
              <div className="space-y-6 lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <h3 className="font-display font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <Bell className="h-4 w-4 text-brand-sky animate-pulse" />
                      <span>নোটিফিকেশন ও এসএমএস হিস্ট্রি</span>
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                      অটোমেটেড
                    </span>
                  </div>

                  {activeApp.notificationHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">এখনো কোনো নোটিফিকেশন পাঠানো হয়নি।</p>
                  ) : (
                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1" id="student-notification-list">
                      {activeApp.notificationHistory.slice().reverse().map((log) => (
                        <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1.5" id={`notif-card-${log.id}`}>
                          <div className="flex items-center justify-between">
                            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                              log.type === 'sms' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {log.type === 'sms' ? '💬 SMS Sent' : '📧 Email Sent'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">{log.sentAt}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800">{log.title}</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{log.body}</p>
                          <div className="text-[9px] text-slate-400 border-t border-slate-200/50 pt-1">
                            প্রাপক: <span className="font-mono">{log.recipient}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Document Upload Guidelines */}
          {activeTab === 'documents' && (
            <div className="space-y-6" id="documents-tab-content">
              {/* Security Guideline Callout */}
              <div className="rounded-2xl border-l-4 border-brand-sky bg-white p-5 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-brand-sky">
                  <Lock className="h-5 w-5 shrink-0" />
                  <h3 className="font-display font-bold text-slate-800 text-sm">ডকুমেন্ট আপলোডের সিকিউর গাইডলাইন (Secure Document Upload Panel)</h3>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed space-y-1 pl-7">
                  <p>✓ আপনার সমস্ত ফাইলগুলো ব্যাংকিং স্ট্যান্ডার্ড <strong>SSL 256-bit এনক্রিপশন</strong> দ্বারা সরাসরি আমাদের মূল সার্ভারে সংরক্ষিত হবে।</p>
                  <p>✓ আপলোড করার আগে অবশ্যই আপনার ডকুমেন্টগুলো হাই-রেজুলেশন কালার স্ক্যান <strong>(PDF বা JPEG)</strong> ফরম্যাটে সেভ করে রাখুন।</p>
                  <p>✓ প্রতিটি ফাইলের সাইজ সর্বোচ্চ <strong>10MB</strong> হতে পারবে। ঝাপসা বা কাটা পড়া ডকুমেন্ট রিজেক্ট হয়ে যাবে।</p>
                </div>
              </div>

              {/* Requirement Items Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700">প্রয়োজনীয় কাগজপত্রের তালিকা ও আপলোড সেকশন</h4>
                </div>

                <div className="divide-y divide-slate-100" id="document-upload-rows">
                  {documentRequirements.map((req) => {
                    const uploaded = activeApp.documents.find(d => d.category === req.id);
                    
                    return (
                      <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4" id={`doc-row-${req.id}`}>
                        {/* Requirement details */}
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-800">{req.title}</h4>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              req.isRequired ? 'bg-red-50 text-brand-red border border-red-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {req.isRequired ? 'অবশ্যই দরকার' : 'ঐচ্ছিক সেবা'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{req.description}</p>
                          <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                            <strong>সাপোর্ট গাইড:</strong> {req.bangladeshCollectionGuide}
                          </p>

                          {/* Approved/Feedback State */}
                          {uploaded && (
                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] text-slate-400">আপলোড করা ফাইল: <strong className="text-slate-600 font-mono">{uploaded.fileName} ({uploaded.fileSize})</strong></span>
                              {uploaded.status === 'Approved' && (
                                <span className="inline-flex items-center space-x-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>অনুমোদিত (Approved)</span>
                                </span>
                              )}
                              {uploaded.status === 'Pending' && (
                                <span className="inline-flex items-center space-x-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-100">
                                  <Clock className="h-3 w-3" />
                                  <span>যাচাইকরণাধীন (Pending Verification)</span>
                                </span>
                              )}
                              {uploaded.status === 'Rejected' && (
                                <div className="space-y-1 w-full">
                                  <span className="inline-flex items-center space-x-1 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-brand-red border border-rose-100">
                                    <XCircle className="h-3 w-3" />
                                    <span>প্রত্যাখ্যাত (Rejected)</span>
                                  </span>
                                  {uploaded.feedback && (
                                    <p className="text-[10px] text-brand-red bg-rose-50/50 p-1.5 rounded border border-brand-red/10">
                                      <strong>কারণ:</strong> {uploaded.feedback}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action upload button */}
                        <div className="shrink-0">
                          {uploadingDocCategory === req.id ? (
                            <div className="w-40 space-y-1.5">
                              <div className="flex justify-between text-[10px] font-semibold text-brand-sky">
                                <span>এনক্রিপ্ট আপলোড...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div 
                                  className="h-full bg-brand-sky transition-all duration-200"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <button
                              id={`upload-btn-${req.id}`}
                              onClick={() => handleFileUpload(req.id)}
                              className="flex items-center space-x-1.5 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-brand-sky/10 hover:text-brand-sky transition-all"
                            >
                              <Upload className="h-4 w-4" />
                              <span>{uploaded ? 'পুনরায় আপলোড' : 'ফাইল আপলোড'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Integrated Payment Gateway for Indian Visa Processing */}
          {activeTab === 'payment' && (
            <div className="grid gap-6 lg:grid-cols-3" id="payment-tab-content">
              {/* Payment Details info card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 lg:col-span-1">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-sky bg-brand-sky-light px-2.5 py-1 rounded-full">
                    সার্ভিস ফি ও ট্রাভেল প্রসেসিং
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-slate-800">ভারতীয় ভিসা ও দিল্লী ট্রাভেল প্রসেসিং ফি</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    বুলগেরিয়া ভিসা ইন্টারভিউ দিল্লীতে অনুষ্ঠিত হবে। এজন্য আপনার ভারতীয় ডাবল এন্ট্রি ভিসা এবং দিল্লী ভ্রমণের সমস্ত ফাইল প্রিপারেশন, ই-টোকেন ফি এবং লজিস্টিক সাপোর্টের ফি পরিশোধ করুন।
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>সার্ভিস আইডি:</span>
                    <span className="font-mono font-bold text-slate-800">SVC-DELHI-VISA</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>প্রসেসিং চার্জ:</span>
                    <span className="font-mono font-bold text-slate-800">৳ ১৫,০০০ BDT</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>স্ট্যাটাস:</span>
                    {activeApp.paymentStatus === 'Paid' ? (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                        পরিশোধিত (Paid)
                      </span>
                    ) : (
                      <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-brand-red border border-rose-100">
                        অপরিশোধিত (Unpaid)
                      </span>
                    )}
                  </div>
                  {activeApp.paymentStatus === 'Paid' && (
                    <div className="border-t border-slate-200/50 pt-3 space-y-1.5 text-[11px] text-slate-500">
                      <div>মাধ্যম: <strong className="text-slate-700">{activeApp.paymentMethod}</strong></div>
                      <div>ট্রানজেকশন আইডি: <strong className="text-slate-700 font-mono">{activeApp.paymentTxnId}</strong></div>
                      <div>তারিখ: <strong className="text-slate-700 font-mono">{activeApp.paymentDate}</strong></div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">সহায়তার বিবরণ:</h4>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>• ভারতীয় ডাবল এন্ট্রি ট্যুরিস্ট ভিসা পূরণ ও সাবমিশন</li>
                    <li>• আইভ্যাক (IVAC) এক্সপ্রেস অ্যাপয়েন্টমেন্ট স্লট বুকিং</li>
                    <li>• দিল্লীতে বুলগেরিয়া দূতাবাস ফাইল রিলেটেড যাবতীয় ডকুমেন্ট ব্যাংক-সলভেন্সি কুরিয়ার সাপোর্ট</li>
                  </ul>
                </div>
              </div>

              {/* Secure Checkout Gateway */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
                {activeApp.paymentStatus === 'Paid' ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4" id="payment-success-full">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <CheckCircle className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-xl font-bold text-slate-800">পেমেন্ট সফলভাবে পরিশোধিত হয়েছে!</h3>
                      <p className="text-xs text-slate-500 max-w-sm">
                        আপনার ট্রাভেল ও ইন্ডিয়ান ভিসা সার্ভিস অ্যাক্টিভেট করা হয়েছে। আপনার ইমেইল এবং মোবাইল নম্বরে কনফার্মেশন পাঠানো হয়েছে।
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 font-mono bg-slate-50 px-4 py-2 rounded-xl">
                      TXN ID: {activeApp.paymentTxnId}
                    </div>
                  </div>
                ) : (
                  /* Active Payment Gateways Selection */
                  <div className="space-y-6" id="checkout-form-container">
                    <div>
                      <h3 className="font-display font-bold text-slate-800 text-sm">পেমেন্ট গেটওয়ে নির্বাচন করুন (Integrated Checkout Gateway)</h3>
                      <p className="text-[11px] text-slate-400">বাংলাদেশী পপুলার মোবাইল ব্যাংকিং এবং কার্ডের মাধ্যমে পরিশোধ করুন</p>
                    </div>

                     {/* Method Selector Tabs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        id="pay-method-bkash"
                        onClick={() => { setPaymentMethod('bkash'); setBkashStep('phone'); }}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                          paymentMethod === 'bkash' 
                            ? 'border-[#e2136e] bg-[#e2136e]/5 ring-1 ring-[#e2136e]' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm font-black text-[#e2136e]">bKash</span>
                        <span className="text-[9px] font-bold text-slate-500 mt-1">মোবাইল ব্যাংকিং</span>
                      </button>

                      <button
                        id="pay-method-nagad"
                        onClick={() => { setPaymentMethod('nagad'); setBkashStep('phone'); }}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                          paymentMethod === 'nagad' 
                            ? 'border-[#f26322] bg-[#f26322]/5 ring-1 ring-[#f26322]' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm font-black text-[#f26322]">Nagad</span>
                        <span className="text-[9px] font-bold text-slate-500 mt-1">মোবাইল ব্যাংকিং</span>
                      </button>

                      <button
                        id="pay-method-card"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                          paymentMethod === 'card' 
                            ? 'border-brand-sky bg-brand-sky/5 ring-1 ring-brand-sky' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="h-5 w-5 text-slate-700" />
                        <span className="text-[9px] font-bold text-slate-500 mt-1">কার্ড (Visa/Master)</span>
                      </button>
                    </div>

                    {/* Payment Frame */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      {/* bKash & Nagad Processing UI */}
                      {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                        <div className="p-6 text-center space-y-4">
                          <div className={`mx-auto h-12 w-32 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm ${
                            paymentMethod === 'bkash' ? 'bg-[#e2136e]' : 'bg-[#f26322]'
                          }`}>
                            {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}
                          </div>

                          {bkashStep === 'phone' && (
                            <div className="max-w-xs mx-auto space-y-3" id="payment-step-phone">
                              <p className="text-xs text-slate-600">আপনার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল অ্যাকাউন্ট নম্বরটি দিন:</p>
                              <input
                                required
                                type="tel"
                                maxLength={11}
                                placeholder="যেমন: 017XXXXXXXX"
                                value={bkashPhone}
                                onChange={(e) => setBkashPhone(e.target.value)}
                                className="w-full text-center rounded-lg border border-slate-300 p-2.5 font-mono text-base tracking-wider focus:outline-none"
                              />
                              <button
                                id="btn-payment-phone-next"
                                disabled={bkashPhone.length < 11}
                                onClick={() => setBkashStep('otp')}
                                className="w-full rounded-lg bg-slate-800 text-white py-2.5 text-xs font-bold hover:bg-slate-900 disabled:opacity-50"
                              >
                                ওটিপি (OTP) পাঠান
                              </button>
                            </div>
                          )}

                          {bkashStep === 'otp' && (
                            <div className="max-w-xs mx-auto space-y-3" id="payment-step-otp">
                              <p className="text-xs text-slate-600">আপনার মোবাইলে পাঠানো ৪ বা ৬ ডিজিটের কোডটি লিখুন:</p>
                              <div className="bg-amber-50 rounded-lg p-2 text-[10px] text-amber-700 border border-amber-100">
                                ওটিপি সিমুলেটর কোড: <strong className="font-mono text-xs">8291</strong>
                              </div>
                              <input
                                required
                                type="text"
                                maxLength={6}
                                placeholder="OTP Code"
                                value={bkashOtp}
                                onChange={(e) => setBkashOtp(e.target.value)}
                                className="w-full text-center rounded-lg border border-slate-300 p-2.5 font-mono text-base tracking-widest focus:outline-none"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setBkashStep('phone')}
                                  className="w-1/2 rounded-lg border border-slate-300 py-2.5 text-xs font-semibold"
                                >
                                  পেছনে যান
                                </button>
                                <button
                                  id="btn-payment-otp-next"
                                  onClick={() => setBkashStep('pin')}
                                  className="w-1/2 rounded-lg bg-slate-800 text-white py-2.5 text-xs font-bold hover:bg-slate-900"
                                >
                                  যাচাই করুন
                                </button>
                              </div>
                            </div>
                          )}

                          {bkashStep === 'pin' && (
                            <div className="max-w-xs mx-auto space-y-3" id="payment-step-pin">
                              <p className="text-xs text-slate-600">সিকিউর পিন নম্বর প্রদান করুন (এনক্রিপ্ট করা হবে):</p>
                              <input
                                required
                                type="password"
                                maxLength={5}
                                placeholder="PIN Code"
                                value={bkashPin}
                                onChange={(e) => setBkashPin(e.target.value)}
                                className="w-full text-center rounded-lg border border-slate-300 p-2.5 font-mono text-lg tracking-widest focus:outline-none"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setBkashStep('otp')}
                                  className="w-1/2 rounded-lg border border-slate-300 py-2.5 text-xs font-semibold"
                                >
                                  পেছনে যান
                                </button>
                                <button
                                  id="btn-payment-pay-now"
                                  disabled={isProcessingPayment}
                                  onClick={handleProcessPayment}
                                  className={`w-1/2 rounded-lg text-white py-2.5 text-xs font-bold ${
                                    paymentMethod === 'bkash' ? 'bg-[#e2136e] hover:bg-[#e2136e]/95' : 'bg-[#f26322] hover:bg-[#f26322]/95'
                                  }`}
                                >
                                  {isProcessingPayment ? 'প্রসেসিং হচ্ছে...' : '৳ ১৫,০০০ পরিশোধ করুন'}
                                </button>
                              </div>
                            </div>
                          )}

                          {bkashStep === 'success' && (
                            <div className="max-w-xs mx-auto space-y-3 py-4" id="payment-step-success">
                              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                              <h4 className="text-sm font-bold text-slate-800">পেমেন্ট সফলভাবে সম্পূর্ণ হয়েছে!</h4>
                              <p className="text-[11px] text-slate-500">
                                আপনার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} থেকে সফলভাবে ১৫,০০০ টাকা কেটে নেওয়া হয়েছে।
                              </p>
                              <button
                                onClick={() => {
                                  setActiveTab('tracking');
                                  setBkashStep('phone');
                                }}
                                className="w-full rounded-lg bg-slate-800 text-white py-2.5 text-xs font-bold"
                              >
                                ট্র্যাকিং ড্যাশবোর্ডে ফিরে যান
                              </button>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1.5 pt-2 border-t border-slate-200/50">
                            <Lock className="h-3 w-3" />
                            <span>100% এনক্রিপ্টেড পেমেন্ট প্রোটোকল</span>
                          </div>
                        </div>
                      )}

                      {/* Card Processing UI */}
                      {paymentMethod === 'card' && (
                        <div className="p-6 space-y-4" id="credit-card-panel">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h4 className="text-xs font-bold text-slate-800">ক্রেডিট বা ডেবিট কার্ডের তথ্য দিন</h4>
                            <div className="flex space-x-1 text-[10px] text-slate-400">
                              <span>Visa</span> · <span>Mastercard</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block">কার্ডে থাকা নাম (Cardholder Name)</label>
                              <input
                                required
                                type="text"
                                placeholder="যেমন: KAMRUL HASAN"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-none focus:border-brand-sky"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block">কার্ড নম্বর (Card Number)</label>
                              <div className="relative">
                                <input
                                  required
                                  type="text"
                                  maxLength={19}
                                  placeholder="xxxx xxxx xxxx xxxx"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 p-2 pl-9 text-xs font-mono focus:outline-none focus:border-brand-sky"
                                />
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 block">মেয়াদোত্তীর্ণ (MM/YY)</label>
                                <input
                                  required
                                  type="text"
                                  maxLength={5}
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono text-center focus:outline-none focus:border-brand-sky"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 block">সিভিভি (CVV)</label>
                                <input
                                  required
                                  type="password"
                                  maxLength={3}
                                  placeholder="***"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono text-center focus:outline-none focus:border-brand-sky"
                                />
                              </div>
                            </div>

                            <button
                              id="btn-pay-card-submit"
                              disabled={isProcessingPayment || !cardNumber || !cardName}
                              onClick={handleProcessPayment}
                              className="w-full mt-4 rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold py-3 text-xs font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-md shadow-brand-sky/20"
                            >
                              {isProcessingPayment ? 'কার্ড যাচাই হচ্ছে...' : '৳ ১৫,০০০ পরিশোধ করুন'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
