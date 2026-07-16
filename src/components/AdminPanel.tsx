import React, { useState } from 'react';
import { Application, ApplicationStatus, UploadedDocument, NotificationLog } from '../types';
import { documentRequirements } from '../data';
import { 
  Users, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Filter, 
  Mail, 
  MessageSquare, 
  FileCheck2, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  Award,
  ChevronDown,
  RefreshCw,
  Send,
  ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  applications: Application[];
  onUpdateApplication: (app: Application) => void;
}

export default function AdminPanel({ applications, onUpdateApplication }: AdminPanelProps) {
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

  // Selected application to review
  const [selectedAppId, setSelectedAppId] = useState<string | null>(applications[0]?.id || null);
  
  // Custom feedback state (for document rejection)
  const [rejectionFeedback, setRejectionFeedback] = useState<string>('');
  const [activeReviewDocId, setActiveReviewDocId] = useState<string | null>(null);

  // Custom manual notification state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'sms' | 'email'>('sms');

  const selectedApp = applications.find(a => a.id === selectedAppId);

  // Handle application status updates (This triggers automatic email/sms log generation)
  const handleUpdateStatus = (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;

    let notificationTitle = '';
    let notificationBody = '';

    switch (newStatus) {
      case 'Document Verification':
        notificationTitle = 'কাগজপত্র যাচাইকরণ শুরু হয়েছে';
        notificationBody = `প্রিয় ${selectedApp.fullName}, আপনার আপলোডকৃত ডকুমেন্টস এবং বোর্ড ভেরিফিকেশনের কাজ আমাদের টিম শুরু করেছে। দয়া করে ড্যাশবোর্ডে চোখ রাখুন।`;
        break;
      case 'Embassy Processing':
        notificationTitle = 'দিল্লী দূতাবাস প্রসেসিং ও ভারতীয় ভিসা';
        notificationBody = `প্রিয় ${selectedApp.fullName}, আপনার ফাইল দিল্লী দূতাবাসের জন্য প্রস্তুত। ভারতীয় ভিসার শিডিউল এবং এম্বাসি স্লট বুকিং করা হয়েছে। বিস্তারিত দেখুন পোর্টালে।`;
        break;
      case 'Visa Issued':
        notificationTitle = 'বুলগেরিয়া ভিসা স্ট্যাম্পিং সম্পন্ন!';
        notificationBody = `অভিনন্দন ${selectedApp.fullName}! দিল্লীস্থ বুলগেরিয়ান দূতাবাস থেকে আপনার স্টুডেন্ট ভিসা অনুমোদিত ও পাসপোর্ট স্ট্যাম্পড করা হয়েছে। ফ্লাইটের জন্য যোগাযোগ করুন।`;
        break;
      case 'Rejected':
        notificationTitle = 'ভিসা আবেদন প্রক্রিয়ায় আপডেট';
        notificationBody = `প্রিয় ${selectedApp.fullName}, সাময়িক ত্রুটির জন্য আপনার আবেদনটি স্থগিত করা হয়েছে। বিস্তারিত তথ্য এবং সংশোধনের জন্য এজেন্সিতে সশরীরে যোগাযোগ করুন।`;
        break;
      default:
        notificationTitle = 'আবেদনে নতুন আপডেট';
        notificationBody = `আপনার অ্যাপ্লিকেশন আইডি: ${selectedApp.id} এর স্ট্যাটাস আপডেট করা হয়েছে।`;
    }

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newLogs: NotificationLog[] = [
      ...selectedApp.notificationHistory,
      {
        id: `not-status-${Date.now()}-sms`,
        title: notificationTitle,
        body: notificationBody,
        type: 'sms',
        sentAt: currentTimestamp,
        recipient: selectedApp.phone
      },
      {
        id: `not-status-${Date.now()}-email`,
        title: `Bulgaria Visa Status Update: ${newStatus}`,
        body: `${notificationBody} (এটি একটি অটোমেটেড সিস্টেম জেনারেটেড ইমেল)`,
        type: 'email',
        sentAt: currentTimestamp,
        recipient: selectedApp.email
      }
    ];

    const updatedApp: Application = {
      ...selectedApp,
      status: newStatus,
      notificationHistory: newLogs
    };

    onUpdateApplication(updatedApp);
  };

  // Handle document approval
  const handleApproveDoc = (docId: string) => {
    if (!selectedApp) return;

    const updatedDocs = selectedApp.documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, status: 'Approved' as const, feedback: undefined };
      }
      return doc;
    });

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetDoc = selectedApp.documents.find(d => d.id === docId);

    const updatedApp: Application = {
      ...selectedApp,
      documents: updatedDocs,
      notificationHistory: [
        ...selectedApp.notificationHistory,
        {
          id: `not-doc-app-${Date.now()}`,
          title: 'ডকুমেন্ট অনুমোদিত হয়েছে',
          body: `আপনার আপলোডকৃত ফাইল "${targetDoc?.name}" সফলভাবে যাচাই ও অনুমোদন করা হয়েছে।`,
          type: 'sms',
          sentAt: currentTimestamp,
          recipient: selectedApp.phone
        }
      ]
    };

    onUpdateApplication(updatedApp);
  };

  // Handle document rejection with feedback
  const handleRejectDoc = (e: React.FormEvent, docId: string) => {
    e.preventDefault();
    if (!selectedApp || !rejectionFeedback.trim()) return;

    const updatedDocs = selectedApp.documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, status: 'Rejected' as const, feedback: rejectionFeedback };
      }
      return doc;
    });

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetDoc = selectedApp.documents.find(d => d.id === docId);

    const updatedApp: Application = {
      ...selectedApp,
      documents: updatedDocs,
      notificationHistory: [
        ...selectedApp.notificationHistory,
        {
          id: `not-doc-rej-${Date.now()}`,
          title: 'ডকুমেন্ট সংশোধনের অনুরোধ',
          body: `আপনার "${targetDoc?.name}" ডকুমেন্টটি প্রত্যাখ্যাত হয়েছে। কারণ: ${rejectionFeedback}। দয়া করে সঠিক ফাইলটি পুনরায় আপলোড করুন।`,
          type: 'email',
          sentAt: currentTimestamp,
          recipient: selectedApp.email
        },
        {
          id: `not-doc-rej-sms-${Date.now()}`,
          title: 'ডকুমেন্ট রিজেক্ট হয়েছে',
          body: `আপনার ফাইল "${targetDoc?.name}" এ সমস্যা পাওয়া গেছে। সংশোধনের জন্য ড্যাশবোর্ড দেখুন।`,
          type: 'sms',
          sentAt: currentTimestamp,
          recipient: selectedApp.phone
        }
      ]
    };

    onUpdateApplication(updatedApp);
    setActiveReviewDocId(null);
    setRejectionFeedback('');
  };

  // Handle custom notifications trigger
  const handleSendCustomNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !notifTitle.trim() || !notifBody.trim()) return;

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newLog: NotificationLog = {
      id: `not-custom-${Date.now()}`,
      title: notifTitle,
      body: notifBody,
      type: notifType,
      sentAt: currentTimestamp,
      recipient: notifType === 'sms' ? selectedApp.phone : selectedApp.email
    };

    const updatedApp: Application = {
      ...selectedApp,
      notificationHistory: [...selectedApp.notificationHistory, newLog]
    };

    onUpdateApplication(updatedApp);
    setNotifTitle('');
    setNotifBody('');
    alert('নোটিফিকেশন সফলভাবে পাঠানো হয়েছে (সিমুলেটেড হিস্ট্রিতে যোগ হয়েছে)!');
  };

  // Stats Calculations
  const stats = {
    total: applications.length,
    verification: applications.filter(a => a.status === 'Document Verification').length,
    embassy: applications.filter(a => a.status === 'Embassy Processing').length,
    issued: applications.filter(a => a.status === 'Visa Issued').length,
    unpaid: applications.filter(a => a.paymentStatus === 'Unpaid').length,
  };

  // Filter application list
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || app.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-8 py-6" id="admin-panel-root">
      {/* 1. Admin Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" id="admin-stats-row">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">মোট আবেদনকারী</span>
            <span className="text-xl font-bold font-display text-slate-800">{stats.total} জন</span>
          </div>
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Users className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ডকুমেন্ট ভেরিফিকেশন</span>
            <span className="text-xl font-bold font-display text-amber-600">{stats.verification} জন</span>
          </div>
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><Clock className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">দিল্লী প্রসেসিং</span>
            <span className="text-xl font-bold font-display text-purple-600">{stats.embassy} জন</span>
          </div>
          <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600"><TrendingUp className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ভিসা ইস্যু হয়েছে</span>
            <span className="text-xl font-bold font-display text-emerald-600">{stats.issued} জন</span>
          </div>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><Award className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">অপরিশোধিত বিল</span>
            <span className="text-xl font-bold font-display text-rose-600">{stats.unpaid} জন</span>
          </div>
          <div className="rounded-xl bg-rose-50 p-2.5 text-brand-red"><CreditCard className="h-5 w-5" /></div>
        </div>
      </div>

      {/* Main admin body: list and detail column */}
      <div className="grid gap-6 lg:grid-cols-12" id="admin-workplace-grid">
        {/* Left Column: Applications Grid list */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Search/Filter Panel */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="নাম, পাসপোর্ট বা আইডি খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Filters dropdowns */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center space-x-1">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1 bg-white focus:outline-none font-semibold text-slate-600"
                  >
                    <option value="All">সব স্ট্যাটাস</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Document Verification">Doc Verification</option>
                    <option value="Embassy Processing">Embassy Proc</option>
                    <option value="Visa Issued">Visa Issued</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1 bg-white focus:outline-none font-semibold text-slate-600"
                  >
                    <option value="All">সব পেমেন্ট</option>
                    <option value="Paid">পরিশোধিত</option>
                    <option value="Unpaid">অপরিশোধিত</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto" id="admin-student-list">
              {filteredApps.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">কোনো আবেদনকারী খুঁজে পাওয়া যায়নি।</div>
              ) : (
                filteredApps.map((app) => (
                  <div
                    key={app.id}
                    id={`admin-card-${app.id}`}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                      selectedAppId === app.id ? 'bg-brand-sky-light/50 border-r-4 border-brand-sky' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-800">{app.fullName}</h4>
                        <span className="font-mono text-[9px] text-slate-400 font-semibold">{app.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{app.desiredCourse}</p>
                      <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-mono">
                        <span>P: {app.passportNumber}</span>
                        <span>·</span>
                        <span className={app.paymentStatus === 'Paid' ? 'text-emerald-600 font-bold' : 'text-brand-red font-bold'}>
                          {app.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      <span className={`rounded px-1.5 py-0.2 text-[8px] font-bold ${
                        app.status === 'Visa Issued' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'Document Verification' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 text-center font-semibold">
            সক্রিয় ফিল্টার আউটপুট: {filteredApps.length} জন আবেদনকারী
          </div>
        </div>

        {/* Right Column: Active Detail Workplace */}
        <div className="lg:col-span-7 space-y-6" id="admin-detail-panel">
          {selectedApp ? (
            <div className="space-y-6">
              {/* Profile Card Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase bg-slate-100 px-2.5 py-1 rounded text-slate-600 font-mono">
                      {selectedApp.id}
                    </span>
                    <h3 className="mt-2.5 font-display text-xl font-bold text-slate-800">{selectedApp.fullName}</h3>
                    <p className="text-xs text-slate-500">{selectedApp.desiredCourse}</p>
                  </div>

                  {/* Status pipeline update triggers */}
                  <div className="space-y-1 shrink-0">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase">আবেদন স্ট্যাটাস পরিবর্তন:</label>
                    <div className="relative">
                      <select
                        id="admin-change-status-select"
                        value={selectedApp.status}
                        onChange={(e) => handleUpdateStatus(e.target.value as ApplicationStatus)}
                        className="rounded-lg border border-slate-200 p-2 text-xs font-bold bg-white focus:outline-none text-slate-700"
                      >
                        <option value="Submitted">Submitted (আবেদন জমা)</option>
                        <option value="Document Verification">Document Verification (যাচাইকরণ)</option>
                        <option value="Embassy Processing">Embassy Processing (দিল্লী দূতাবাস)</option>
                        <option value="Visa Issued">Visa Issued (ভিসা অনুমোদিত)</option>
                        <option value="Rejected">Rejected (স্থগিত)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Stats Grid */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">পাসপোর্ট নম্বর:</span>
                    <span className="font-mono text-slate-700 font-semibold">{selectedApp.passportNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">মোবাইল নম্বর:</span>
                    <span className="font-mono text-slate-700 font-semibold">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">ইমেইল:</span>
                    <span className="text-slate-700 font-semibold truncate block">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">পেমেন্ট স্ট্যাটাস:</span>
                    <span className={`font-semibold font-mono px-1.5 py-0.2 rounded text-[10px] ${
                      selectedApp.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-brand-red'
                    }`}>
                      {selectedApp.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Document Review Segment */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">
                  আপলোডকৃত কাগজপত্র রিভিউ (Verify & Approve Documents)
                </h4>

                {selectedApp.documents.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">শিক্ষার্থী এখনো কোনো ফাইল আপলোড করেনি।</div>
                ) : (
                  <div className="divide-y divide-slate-100" id="admin-review-doc-list">
                    {selectedApp.documents.map((doc) => (
                      <div key={doc.id} className="py-4 space-y-3" id={`admin-review-row-${doc.id}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="text-xs font-bold text-slate-800">{doc.name}</h5>
                              <span className={`rounded-full px-1.5 py-0.2 text-[8px] font-bold ${
                                doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                doc.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-brand-red'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.fileName} ({doc.fileSize}) · আপলোড: {doc.uploadedAt}</p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              id={`admin-btn-approve-${doc.id}`}
                              onClick={() => handleApproveDoc(doc.id)}
                              disabled={doc.status === 'Approved'}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              অনুমোদন
                            </button>
                            <button
                              id={`admin-btn-toggle-reject-${doc.id}`}
                              onClick={() => {
                                setActiveReviewDocId(activeReviewDocId === doc.id ? null : doc.id);
                                setRejectionFeedback('');
                              }}
                              className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-brand-red hover:bg-rose-100"
                            >
                              রিজেক্ট
                            </button>
                          </div>
                        </div>

                        {/* Dropdown feedback writer for rejection */}
                        {activeReviewDocId === doc.id && (
                          <form onSubmit={(e) => handleRejectDoc(e, doc.id)} className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 block">রিজেক্ট করার কারণ (Feedback to Student):</label>
                            <div className="flex space-x-2">
                              <input
                                required
                                type="text"
                                value={rejectionFeedback}
                                onChange={(e) => setRejectionFeedback(e.target.value)}
                                placeholder="যেমন: পাসপোর্ট পৃষ্ঠার ছবি পরিষ্কার নয়, পুনরায় সাবমিট করুন।"
                                className="w-full rounded border border-slate-200 bg-white p-2 text-xs focus:outline-none focus:border-brand-sky"
                              />
                              <button
                                type="submit"
                                className="rounded bg-slate-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-900"
                              >
                                পাঠান
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Notifications Dispatcher */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">
                  কাস্টম নোটিফিকেশন পাঠান (Send Custom Email/SMS Alert)
                </h4>

                <form onSubmit={handleSendCustomNotification} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500">নোটিফিকেশনের শিরোনাম (Subject/Title):</label>
                      <input
                        required
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="যেমন: পুলিশ ক্লিয়ারেন্স অ্যাটেস্টেশন সম্পন্ন হয়েছে"
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-none focus:border-brand-sky"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500">মাধ্যমে (Channel):</label>
                      <select
                        value={notifType}
                        onChange={(e) => setNotifType(e.target.value as 'sms' | 'email')}
                        className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white focus:outline-none focus:border-brand-sky font-semibold"
                      >
                        <option value="sms">💬 SMS Alert</option>
                        <option value="email">📧 Email Notification</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">বার্তা (Message Body):</label>
                    <textarea
                      required
                      rows={2}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      placeholder="এখানে বার্তার মূল অংশ লিখুন..."
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-none focus:border-brand-sky"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      id="admin-btn-send-notif"
                      type="submit"
                      className="flex items-center space-x-1.5 rounded-lg bg-brand-sky text-white px-4 py-2 text-xs font-bold hover:bg-brand-sky-dark border-b border-brand-gold"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>নোটিফিকেশন পাঠান</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
              আবেদনকারীর বিবরণ দেখতে বামের তালিকা থেকে সিলেক্ট করুন।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
