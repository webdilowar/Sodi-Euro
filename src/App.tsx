import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Lobby from './components/Lobby';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';
import { initialApplications } from './data';
import { Application } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  MessageSquare, 
  Mail, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  // Navigation view state
  const [view, setView] = useState<'lobby' | 'student' | 'admin'>('lobby');
  
  // Applications state loaded and synced with Firestore
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track the logged in/selected student application ID in the dashboard
  const [activeAppId, setActiveAppId] = useState<string | null>(() => {
    return localStorage.getItem('bulgaria_active_app_id_v1') || null;
  });

  // Keep track of the last simulated notification sent to show a floating real-time preview (SMS/Email simulation)
  const [liveNotification, setLiveNotification] = useState<{
    id: string;
    title: string;
    body: string;
    type: 'sms' | 'email';
    recipient: string;
  } | null>(null);

  // Synchronize applications with Firestore real-time onSnapshot listener
  useEffect(() => {
    const q = collection(db, 'applications');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Application[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Application);
      });
      
      // If there are no applications in the DB, seed with initialApplications
      if (snapshot.empty) {
        initialApplications.forEach(async (app) => {
          try {
            await setDoc(doc(db, 'applications', app.id), app);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `applications/${app.id}`);
          }
        });
      } else {
        // Sort by createdAt desc or ID
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setApplications(list);
        setIsLoading(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeAppId) {
      localStorage.setItem('bulgaria_active_app_id_v1', activeAppId);
    } else {
      localStorage.removeItem('bulgaria_active_app_id_v1');
    }
  }, [activeAppId]);

  // Callback to add a new application
  const handleAddApplication = async (newApp: Application) => {
    try {
      await setDoc(doc(db, 'applications', newApp.id), newApp);
      
      // Trigger live notification alert
      const firstNotif = newApp.notificationHistory[0];
      if (firstNotif) {
        setLiveNotification({
          id: firstNotif.id,
          title: firstNotif.title,
          body: firstNotif.body,
          type: firstNotif.type,
          recipient: firstNotif.recipient
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `applications/${newApp.id}`);
    }
  };

  // Callback to update an application
  const handleUpdateApplication = async (updatedApp: Application) => {
    try {
      await setDoc(doc(db, 'applications', updatedApp.id), updatedApp);
      
      // Detect if a new notification has been appended to trigger the floating simulated phone notification
      const oldApp = applications.find(a => a.id === updatedApp.id);
      if (oldApp) {
        const oldLen = oldApp.notificationHistory.length;
        const newLen = updatedApp.notificationHistory.length;
        if (newLen > oldLen) {
          const latestNotif = updatedApp.notificationHistory[newLen - 1];
          setLiveNotification({
            id: latestNotif.id,
            title: latestNotif.title,
            body: latestNotif.body,
            type: latestNotif.type,
            recipient: latestNotif.recipient
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `applications/${updatedApp.id}`);
    }
  };

  // Automatically dismiss the live notification after 10 seconds
  useEffect(() => {
    if (liveNotification) {
      const timer = setTimeout(() => {
        setLiveNotification(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [liveNotification]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-root">
      {/* 1. Universal Top Navigation */}
      <Header 
        currentView={view} 
        setView={setView} 
        activeApplicationId={activeAppId || undefined} 
      />

      {/* 2. Main Page Render */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
              id="app-loading-screen"
            >
              <div className="h-10 w-10 border-4 border-brand-sky border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-500 animate-pulse">Sodi Euro ডাটাবেস লোড হচ্ছে...</p>
            </motion.div>
          ) : (
            <>
              {view === 'lobby' && (
                <motion.div
                  key="lobby"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <Lobby onGoToApply={() => {
                    setView('student');
                    // If they don't have an active app, reset ID to let them search/apply
                    if (!activeAppId) {
                      setActiveAppId(null);
                    }
                  }} />
                </motion.div>
              )}

              {view === 'student' && (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <StudentDashboard 
                    applications={applications}
                    onAddApplication={handleAddApplication}
                    onUpdateApplication={handleUpdateApplication}
                    activeAppId={activeAppId}
                    setActiveAppId={setActiveAppId}
                  />
                </motion.div>
              )}

              {view === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="space-y-2 mb-4" id="admin-header-note">
                    <span className="text-[10px] bg-slate-800 text-white font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      প্রশাসনিক ড্যাশবোর্ড (Agency Management Console)
                    </span>
                    <p className="text-xs text-slate-500">
                      এখান থেকে শিক্ষার্থীদের ডকুমেন্ট স্ট্যাটাস অনুমোদন/প্রত্যাখ্যান করুন, অ্যাপ্লিকেশনের লাইভ পজিশন পরিবর্তন করুন এবং কাস্টম নোটিফিকেশন অ্যালার্ট ট্রিগার করুন।
                    </p>
                  </div>
                  <AdminPanel 
                    applications={applications}
                    onUpdateApplication={handleUpdateApplication}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* 3. Floating Simulated Mobile SMS / Desktop Email Toast Notification */}
      <AnimatePresence>
        {liveNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-2 border-brand-sky/30 overflow-hidden"
            id="simulated-notification-popup"
          >
            {/* Notification simulated wrapper header */}
            <div className={`p-3 flex items-center justify-between text-white ${
              liveNotification.type === 'sms' ? 'bg-amber-600' : 'bg-slate-800'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold">
                {liveNotification.type === 'sms' ? (
                  <MessageSquare className="h-4 w-4 shrink-0" />
                ) : (
                  <Mail className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {liveNotification.type === 'sms' 
                    ? 'সিমুলেটেড এসএমএস (Simulated SMS Received)' 
                    : 'সিমুলেটেড ইমেল (Simulated Email Received)'}
                </span>
              </div>
              <button 
                id="close-simulated-toast"
                onClick={() => setLiveNotification(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated Notification Details */}
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>গ্রাহক: <strong>{liveNotification.recipient}</strong></span>
                <span>এখন পাঠানো হলো</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-snug">{liveNotification.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {liveNotification.body}
              </p>
              
              <div className="text-[10px] text-brand-sky font-medium flex items-center space-x-1 justify-end pt-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>অটোমেটেড রিয়েল-টাইম নোটিফিকেশন</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Elegant Agency Footer */}
      <footer className="border-t border-slate-200 bg-white py-8" id="app-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-display text-sm font-bold text-slate-800">Sodi Euro</span>
                <span className="rounded bg-brand-sky/10 px-1.5 py-0.2 text-[9px] font-bold text-brand-sky">
                  One-Stop BD support
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                বুলগেরিয়ায় উচ্চশিক্ষায় পাড়ি জমানোর ওয়ান-স্টপ ভিসা কনসাল্টেন্সি এবং রিয়েল-টাইম ফাইলিং প্ল্যাটফর্ম।
              </p>
            </div>

            {/* Footer Quick stats & tools */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              <button onClick={() => setView('lobby')} className="hover:text-brand-sky">হোম ও গাইডলাইন</button>
              <span>·</span>
              <button onClick={() => setView('student')} className="hover:text-brand-sky">স্টুডেন্ট ট্র্যাকিং</button>
              <span>·</span>
              <button onClick={() => setView('admin')} className="hover:text-slate-800 flex items-center space-x-1 text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-sky" />
                <span>ম্যানেজমেন্ট কনসোল</span>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-400 gap-2">
            <span>© 2026 Sodi Euro. All rights reserved.</span>
            <span>ঢাকা, বাংলাদেশ ও সোফিয়া, বুলগেরিয়া শাখা দ্বারা পরিচালিত।</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
