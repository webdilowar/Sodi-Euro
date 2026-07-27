import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Lobby from './components/Lobby';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';
import SupportPage from './components/SupportPage';
import { initialApplications } from './data';
import { Application, PaymentConfig } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './context/LanguageContext';
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
  HelpCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe
} from 'lucide-react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from './firebase';

const triggerRealEmailSend = async (to: string, subject: string, body: string) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, body }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Failed to send real email via API:', result);
    } else {
      console.log('Real email send result:', result);
    }
  } catch (error) {
    console.error('Error sending real email:', error);
  }
};

export default function App() {
  const { t } = useLanguage();
  // Navigation view state
  const [view, setView] = useState<'lobby' | 'student' | 'admin' | 'support'>(() => {
    return (localStorage.getItem('bulgaria_active_view_v1') as 'lobby' | 'student' | 'admin' | 'support') || 'lobby';
  });
  
  useEffect(() => {
    localStorage.setItem('bulgaria_active_view_v1', view);
  }, [view]);

  // Set initial browser history state if empty on mount
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ view }, '', '');
    }
  }, []);

  // Sync view state changes to browser history
  useEffect(() => {
    const currentHistoryState = window.history.state;
    if (!currentHistoryState || currentHistoryState.view !== view) {
      window.history.pushState({ view }, '', '');
    }
  }, [view]);

  // Listen to browser popstate (back/forward buttons) to change active view
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView('lobby');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Applications state loaded and synced with Firestore
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Payment configuration synced with Firestore
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    bkashNumbers: [{ id: 'bk-1', number: '01712-345678', type: 'Personal', name: 'NOVENTRA Merchant' }],
    nagadNumbers: [{ id: 'ng-1', number: '01912-345678', type: 'Personal', name: 'NOVENTRA Nagad' }],
    rocketNumbers: [{ id: 'rk-1', number: '01812-345678', type: 'Personal', name: 'NOVENTRA Rocket' }],
    bankAccounts: [{ id: 'bnk-1', bankName: 'Dutch-Bangla Bank PLC', accountName: 'NOVENTRA Education', accountNumber: '1231100028392', branch: 'Gulshan Branch, Dhaka' }]
  });

  useEffect(() => {
    const docRef = doc(db, 'settings', 'payment_config');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPaymentConfig(docSnap.data() as PaymentConfig);
      } else {
        setDoc(docRef, sanitizeForFirestore({
          bkashNumbers: [{ id: 'bk-1', number: '01712-345678', type: 'Personal', name: 'NOVENTRA Merchant' }],
          nagadNumbers: [{ id: 'ng-1', number: '01912-345678', type: 'Personal', name: 'NOVENTRA Nagad' }],
          rocketNumbers: [{ id: 'rk-1', number: '01812-345678', type: 'Personal', name: 'NOVENTRA Rocket' }],
          bankAccounts: [{ id: 'bnk-1', bankName: 'Dutch-Bangla Bank PLC', accountName: 'NOVENTRA Education', accountNumber: '1231100028392', branch: 'Gulshan Branch, Dhaka' }]
        })).catch(err => console.error(err));
      }
    }, err => console.error(err));
    return () => unsubscribe();
  }, []);

  const handleUpdatePaymentConfig = async (newConfig: PaymentConfig) => {
    try {
      await setDoc(doc(db, 'settings', 'payment_config'), sanitizeForFirestore(newConfig));
      setPaymentConfig(newConfig);
    } catch (err) {
      console.error('Failed to update payment config:', err);
    }
  };

  // Track the logged in/selected student application ID in the dashboard
  const [activeAppId, setActiveAppId] = useState<string | null>(() => {
    return localStorage.getItem('bulgaria_active_app_id_v1') || null;
  });

  // 30-minute student auto-logout on inactivity
  useEffect(() => {
    let studentTimer: NodeJS.Timeout;

    const resetStudentTimer = () => {
      if (studentTimer) clearTimeout(studentTimer);
      if (activeAppId) {
        studentTimer = setTimeout(() => {
          setActiveAppId(null);
          localStorage.removeItem('bulgaria_active_app_id_v1');
          alert('Your student session was automatically logged out due to inactivity.');
        }, 30 * 60 * 1000); // 30 minutes
      }
    };

    const handleActivity = () => {
      resetStudentTimer();
    };

    if (activeAppId) {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      resetStudentTimer();
    }

    return () => {
      if (studentTimer) clearTimeout(studentTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [activeAppId]);

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
      
      // If there are no applications in the DB, seed only if not already seeded
      if (snapshot.empty) {
        const isAlreadySeeded = localStorage.getItem('sodieuro_apps_seeded') === 'true';
        if (!isAlreadySeeded) {
          localStorage.setItem('sodieuro_apps_seeded', 'true');
          initialApplications.forEach(async (app) => {
            try {
              await setDoc(doc(db, 'applications', app.id), sanitizeForFirestore(app));
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `applications/${app.id}`);
            }
          });
        } else {
          setApplications([]);
          setIsLoading(false);
        }
      } else {
        localStorage.setItem('sodieuro_apps_seeded', 'true');
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
      await setDoc(doc(db, 'applications', newApp.id), sanitizeForFirestore(newApp));

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

      // Send real email updates for any email notifications
      const emailNotifs = newApp.notificationHistory.filter(n => n.type === 'email');
      for (const notif of emailNotifs) {
        triggerRealEmailSend(notif.recipient, notif.title, notif.body);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `applications/${newApp.id}`);
    }
  };

  // Callback to update an application
  const handleUpdateApplication = async (updatedApp: Application) => {
    try {
      await setDoc(doc(db, 'applications', updatedApp.id), sanitizeForFirestore(updatedApp));
      
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

        // Send real email updates for newly appended email notifications
        const oldIds = new Set(oldApp.notificationHistory.map(n => n.id));
        const newEmails = updatedApp.notificationHistory.filter(n => n.type === 'email' && !oldIds.has(n.id));
        for (const notif of newEmails) {
          triggerRealEmailSend(notif.recipient, notif.title, notif.body);
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
              <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-500 animate-pulse">Loading NOVENTRA Database...</p>
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
                    paymentConfig={paymentConfig}
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
                  <AdminPanel 
                    applications={applications}
                    onUpdateApplication={handleUpdateApplication}
                    paymentConfig={paymentConfig}
                    onUpdatePaymentConfig={handleUpdatePaymentConfig}
                  />
                </motion.div>
              )}

              {view === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <SupportPage />
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
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm w-auto sm:w-full z-50 bg-white rounded-2xl shadow-2xl border-2 border-brand-sky/30 overflow-hidden"
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
                    ? 'Simulated SMS Received' 
                    : 'Simulated Email Received'}
                </span>
              </div>
              <button
                onClick={() => setLiveNotification(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated Notification Details */}
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Recipient: <strong>{liveNotification.recipient}</strong></span>
                <span>Just now</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-snug">{liveNotification.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {liveNotification.body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Elegant Line-by-Line Structured Centered Footer */}
      <footer className="border-t border-slate-100 bg-white py-8" id="app-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            {/* Line 1: Website Name */}
            <div className="flex items-center justify-center gap-2 notranslate">
              <img src="/logo.png" alt="NOVENTRA Logo" className="h-6 w-6 object-contain notranslate" referrerPolicy="no-referrer" />
              <span className="font-sans font-black text-amber-600 text-base tracking-wider uppercase notranslate">NOVENTRA</span>
            </div>

            {/* Line 2: Slogan */}
            <p className="text-xs font-bold text-slate-700 notranslate">
              Gateway to Global Education
            </p>

            {/* Line 3: All rights reserved */}
            <p className="text-xs text-slate-400">
              {t('footer_rights')}
            </p>

            {/* Line 4: Social Icons */}
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-brand-sky hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-brand-sky hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200"
                title="Twitter / X"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-pink-600 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200"
                title="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a 
                href="https://noventra.edu" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-200"
                title="Official Website"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>

            {/* Line 5: Quick Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-2">
              <button onClick={() => setView('lobby')} className="hover:text-brand-sky transition-colors">Home</button>
              <span className="text-slate-200">•</span>
              <button onClick={() => setView('student')} className="hover:text-brand-sky transition-colors">Student Portal</button>
              <span className="text-slate-200">•</span>
              <button onClick={() => setView('support')} className="hover:text-brand-sky transition-colors">Support Team</button>
              <span className="text-slate-200">•</span>
              <button 
                onClick={() => setView('admin')} 
                className="hover:text-slate-800 transition-colors flex items-center gap-1 text-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-brand-sky" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
