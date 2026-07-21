import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Application, ApplicationStatus, UploadedDocument, NotificationLog, SupportMember, ChatMessage, AuditLog } from '../types';
import { documentRequirements, initialApplications } from '../data';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { initialSupportMembers } from './SupportPage';
import { 
  Users, 
  User,
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
  ExternalLink,
  Lock,
  ShieldCheck,
  Activity,
  Sparkles,
  Settings,
  Camera,
  Save,
  Download,
  Trash2,
  Paperclip,
  Plus,
  History
} from 'lucide-react';

interface AdminPanelProps {
  applications: Application[];
  onUpdateApplication: (app: Application) => void;
}

/**
 * Converts a base64 Data URI to a local Blob URL for reliable browser rendering (avoiding iframe sandbox data: URI blocks).
 */
function getSafePreviewUrl(dataUrl: string): string {
  if (!dataUrl) return '';
  if (!dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl;
    
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    
    const binary = atob(parts[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(array)], { type: mime });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating preview URL:', error);
    return dataUrl;
  }
}

// MASTER_ADMIN_PROFILE definition
const MASTER_ADMIN_PROFILE: SupportMember = {
  id: 'master_admin',
  name: 'Sodi Euro Admin',
  role: 'প্রধান প্রশাসক (Master Administrator)',
  email: 'admin@sodieuro.com',
  phone: '+880 1712-345678',
  whatsapp: '8801712345678',
  location: 'ঢাকা ও সোফিয়া অফিস',
  bio: 'Master Platform Administrator',
  badge: 'Platform Administrator',
  colorClass: 'from-brand-sky via-brand-sky-dark to-slate-950',
  accentBorder: 'border-brand-sky/30',
  btnText: 'যোগাযোগ',
  btnUrl: '',
  createdAt: '2026-07-10 00:00',
  username: 'sodieuro',
  password: 'sodieuro',
  roleType: 'administrator'
};

export default function AdminPanel({ applications, onUpdateApplication }: AdminPanelProps) {
  // Admin Authentication States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('sodieuro_admin_logged_in') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [currentAdmin, setCurrentAdmin] = useState<SupportMember | null>(() => {
    const cached = localStorage.getItem('sodieuro_current_admin');
    return cached ? JSON.parse(cached) : null;
  });

  const isUserAdmin = currentAdmin?.roleType === 'administrator' || currentAdmin?.id === 'master_admin';

  // Audit Logs Live Sync State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Logging utility
  const logAdminAction = async (
    actionType: AuditLog['actionType'],
    studentId: string,
    studentName: string,
    details: string
  ) => {
    const adminToUse = currentAdmin || MASTER_ADMIN_PROFILE;
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      adminId: adminToUse.id,
      adminName: adminToUse.name,
      adminPhoto: adminToUse.photoUrl || '',
      actionType,
      studentId,
      studentName,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    try {
      await setDoc(doc(db, 'audit_logs', newLog.id), newLog);
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  };

  // Tab/Navigation State (Applicants vs Support Page Editor vs Messages vs Activity Log)
  const [activeAdminTab, setActiveAdminTab] = useState<'applicants' | 'support_editor' | 'messages' | 'activity_log'>('applicants');

  // Support Editor states
  const [supportMembers, setSupportMembers] = useState<SupportMember[]>([]);
  const [selectedSupportMemberId, setSelectedSupportMemberId] = useState<string>('dilowar_hosen');
  const [lastSelectedId, setLastSelectedId] = useState<string>('');
  const [supportDraft, setSupportDraft] = useState<SupportMember | null>(null);
  const [isSavingSupport, setIsSavingSupport] = useState(false);
  const [supportSuccessMsg, setSupportSuccessMsg] = useState('');
  const [loadingSupport, setLoadingSupport] = useState(true);

  // File Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  // File input refs for support photo/cover uploads
  const supportPhotoInputRef = useRef<HTMLInputElement>(null);
  const supportCoverInputRef = useRef<HTMLInputElement>(null);

  // Synchronize support members from Firestore
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const unsubscribe = onSnapshot(collection(db, 'support_members'), (snapshot) => {
      const list: SupportMember[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as SupportMember);
      });

      if (snapshot.empty) {
        // Seed if empty
        initialSupportMembers.forEach(async (member) => {
          try {
            await setDoc(doc(db, 'support_members', member.id), member);
          } catch (err) {
            console.error('Seeding support_members failed:', err);
          }
        });
        setSupportMembers(initialSupportMembers);
        setLoadingSupport(false);
      } else {
        // Sort by createdAt to maintain the order
        list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        setSupportMembers(list);
        setLoadingSupport(false);
      }
    }, (error) => {
      console.error('Firestore Admin Support Load Error: ', error);
      setSupportMembers(initialSupportMembers);
      setLoadingSupport(false);
    });

    return () => unsubscribe();
  }, [isAdminLoggedIn]);

  // Update currentAdmin if its data is modified in supportMembers list, and sync audit logs from Firestore
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const unsubscribeLogs = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
      const list: AuditLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as AuditLog);
      });
      // Sort by timestamp desc
      list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      setAuditLogs(list);
    }, (error) => {
      console.error('Audit logs subscription error:', error);
    });

    return () => unsubscribeLogs();
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (currentAdmin && currentAdmin.id !== 'master_admin' && supportMembers.length > 0) {
      const updated = supportMembers.find(m => m.id === currentAdmin.id);
      if (updated) {
        if (JSON.stringify(updated) !== JSON.stringify(currentAdmin)) {
          setCurrentAdmin(updated);
          localStorage.setItem('sodieuro_current_admin', JSON.stringify(updated));
        }
      }
    }
  }, [supportMembers, currentAdmin]);

  // Sync draft when selected member changes or initially loaded, without overwriting draft updates
  useEffect(() => {
    if (supportMembers.length > 0) {
      if (selectedSupportMemberId !== lastSelectedId) {
        const found = supportMembers.find(m => m.id === selectedSupportMemberId);
        if (found) {
          setSupportDraft(found);
          setLastSelectedId(selectedSupportMemberId);
        }
      }
    } else if (supportMembers.length > 0 && !selectedSupportMemberId) {
      setSelectedSupportMemberId(supportMembers[0].id);
    }
  }, [selectedSupportMemberId, supportMembers, lastSelectedId]);

  // Support Editor Helper Functions
  const updateDraftField = (key: keyof SupportMember, value: any) => {
    if (!supportDraft) return;
    setSupportDraft({
      ...supportDraft,
      [key]: value
    });
  };

  const handleAddNewSupportMember = async () => {
    if (!isUserAdmin) {
      alert('দুঃখিত, শুধুমাত্র Administrators নতুন মেম্বার তৈরি করতে পারবেন!');
      return;
    }
    const newId = `member-${Date.now()}`;
    const newMember: SupportMember = {
      id: newId,
      name: "নতুন মেম্বার (New Member)",
      role: "সহকারী পরিচালক (Assistant Director)",
      email: "info@sodieuro.com",
      phone: "+880 1712-000000",
      whatsapp: "8801712000000",
      location: "ঢাকা অফিস, বাংলাদেশ",
      bio: "বুলগেরিয়া স্টুডেন্ট ভিসা ও প্রসেসিং এর কাজে সার্বিক সহায়তা প্রদান করেন।",
      badge: "Support Executive",
      colorClass: "from-brand-sky via-brand-sky-dark to-slate-950",
      accentBorder: "border-brand-sky/30",
      btnText: "সরাসরি যোগাযোগ করুন",
      btnUrl: "https://wa.me/8801712000000",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      username: `user_${Date.now().toString().slice(-4)}`,
      password: "password123",
      roleType: "support"
    };
    
    try {
      await setDoc(doc(db, 'support_members', newId), newMember);
      logAdminAction('member_added', 'system', newMember.name, `Added new support member: "${newMember.name}" with username: "${newMember.username}"`);
      setSelectedSupportMemberId(newId);
      setSupportDraft(newMember);
      setLastSelectedId(newId);
    } catch (err) {
      console.error('Error creating new support member:', err);
      alert('নতুন মেম্বার তৈরি করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteSupportMember = async (memberId: string) => {
    if (!isUserAdmin) {
      alert('দুঃখিত, শুধুমাত্র Administrators সাপোর্ট মেম্বার ডিলিট করতে পারবেন!');
      return;
    }
    if (supportMembers.length <= 1) {
      alert("কমপক্ষে একজন সাপোর্ট মেম্বার থাকতে হবে!");
      return;
    }
    const targetMember = supportMembers.find(m => m.id === memberId);
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই সাপোর্ট মেম্বারের প্রোফাইল সম্পূর্ণভাবে ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, 'support_members', memberId));
        logAdminAction('member_updated', 'system', targetMember?.name || 'Unknown', `Deleted support member profile: "${targetMember?.name || 'Unknown'}"`);
        alert("সাপোর্ট মেম্বারের প্রোফাইল সফলভাবে ডিলিট করা হয়েছে।");
        const remaining = supportMembers.filter(m => m.id !== memberId);
        if (remaining.length > 0) {
          setSelectedSupportMemberId(remaining[0].id);
        }
      } catch (err) {
        console.error("Error deleting support member:", err);
        alert("সাপোর্ট মেম্বার ডিলিট করতে সমস্যা হয়েছে।");
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, memberId: string, type: 'photo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size first, e.g. 10MB limit for safe canvas operations
    if (file.size > 10 * 1024 * 1024) {
      alert("ফাইলের সাইজ অনেক বড়! অনুগ্রহ করে ১০ মেগাবাইটের নিচের ছবি আপলোড করুন।");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        
        // Use HTML Canvas to compress the image
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Set a reasonable max dimension for support pictures
          const MAX_DIMENSION = 800;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Export as compressed JPEG (quality 0.7) to bring size down to ~30-50KB
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            setSupportDraft(prev => {
              if (!prev) return null;
              return type === 'photo'
                ? { ...prev, photoUrl: compressedBase64 }
                : { ...prev, coverPhotoUrl: compressedBase64 };
            });
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSupportMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportDraft) return;

    if (!isUserAdmin) {
      alert('দুঃখিত, শুধুমাত্র Administrators সাপোর্ট মেম্বারদের তথ্য যোগ বা পরিবর্তন করতে পারবেন!');
      return;
    }

    setIsSavingSupport(true);
    setSupportSuccessMsg('');
    try {
      await setDoc(doc(db, 'support_members', supportDraft.id), supportDraft);
      logAdminAction('member_updated', 'system', supportDraft.name, `Updated support member profile details for "${supportDraft.name}"`);
      setSupportSuccessMsg('মেম্বারের তথ্য সফলভাবে সেভ করা হয়েছে!');
      setTimeout(() => setSupportSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving support member:', err);
      alert('সাপোর্ট মেম্বারের তথ্য সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSavingSupport(false);
    }
  };

  const handleResetSupportToDefault = async () => {
    if (!isUserAdmin) {
      alert('দুঃখিত, শুধুমাত্র Administrators সব তথ্য ডিফল্ট অবস্থায় রিসেট করতে পারবেন!');
      return;
    }
    if (window.confirm("আপনি কি নিশ্চিতভাবে সব সাপোর্ট পেজের তথ্য ডিফল্ট অবস্থায় রিসেট করতে চান? এটি আপনার কাস্টম পরিবর্তনগুলো মুছে ফেলবে।")) {
      try {
        setSupportSuccessMsg('ডিফল্ট ডাটা রিসেট করা হচ্ছে...');
        for (const member of initialSupportMembers) {
          await setDoc(doc(db, 'support_members', member.id), member);
        }
        logAdminAction('member_updated', 'system', 'All Members', 'Reset all support profiles to defaults');
        setSupportSuccessMsg('সফলভাবে রিসেট করা হয়েছে!');
        setTimeout(() => setSupportSuccessMsg(''), 3000);
      } catch (err) {
        console.error('Resetting support members failed:', err);
        alert('রিসেট করতে সমস্যা হয়েছে।');
      }
    }
  };

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

  // Direct Student Messaging state
  const [adminMessageText, setAdminMessageText] = useState('');
  const [activeChatAppId, setActiveChatAppId] = useState<string | null>(null);
  const [adminChatFile, setAdminChatFile] = useState<string>('');
  const [adminChatFileName, setAdminChatFileName] = useState<string>('');
  const [chatSearchTerm, setChatSearchTerm] = useState<string>('');

  // Automatically mark student messages as read when admin views the chat
  useEffect(() => {
    if (activeAdminTab === 'messages' && activeChatAppId) {
      const app = applications.find(a => a.id === activeChatAppId);
      if (app) {
        const hasUnread = app.messages?.some(m => m.sender === 'student' && !m.read);
        if (hasUnread) {
          const updatedMessages = app.messages?.map(m => {
            if (m.sender === 'student' && !m.read) {
              return { ...m, read: true };
            }
            return m;
          }) || [];
          onUpdateApplication({
            ...app,
            messages: updatedMessages
          });
        }
      }
    }
  }, [activeAdminTab, activeChatAppId, applications, onUpdateApplication]);

  // Communications Modals toggles
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const selectedApp = applications.find(a => a.id === selectedAppId);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = adminUsername.trim().toLowerCase();
    const trimmedPass = adminPassword.trim();
    
    const matchedMember = supportMembers.find(
      m => (m.username?.toLowerCase() === trimmedUser || m.email?.toLowerCase() === trimmedUser) && m.password === trimmedPass
    );

    if (trimmedUser === 'sodieuro' && trimmedPass === 'sodieuro') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('sodieuro_admin_logged_in', 'true');
      const adminProfile = MASTER_ADMIN_PROFILE;
      setCurrentAdmin(adminProfile);
      localStorage.setItem('sodieuro_current_admin', JSON.stringify(adminProfile));
      localStorage.setItem('sodieuro_admin_display_name', adminProfile.name);
      setLoginError('');
    } else if (matchedMember) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('sodieuro_admin_logged_in', 'true');
      setCurrentAdmin(matchedMember);
      localStorage.setItem('sodieuro_current_admin', JSON.stringify(matchedMember));
      localStorage.setItem('sodieuro_admin_display_name', matchedMember.name);
      setLoginError('');
    } else {
      setLoginError('ভুল ইউজারনেম/ইমেইল অথবা পাসওয়ার্ড! শুধুমাত্র অথরাইজড এডমিন প্রবেশ করতে পারবেন।');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentAdmin(null);
    localStorage.removeItem('sodieuro_admin_logged_in');
    localStorage.removeItem('sodieuro_current_admin');
    localStorage.removeItem('sodieuro_admin_display_name');
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !adminMessageText.trim()) return;

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin' as const,
      text: adminMessageText.trim(),
      sentAt: currentTimestamp,
      adminName: currentAdmin?.name || 'Admin',
      adminPhoto: currentAdmin?.photoUrl || ''
    };

    const updatedApp: Application = {
      ...selectedApp,
      messages: [...(selectedApp.messages || []), newMessage]
    };

    onUpdateApplication(updatedApp);
    logAdminAction('message_reply', selectedApp.id, selectedApp.fullName, `Sent message: "${adminMessageText.trim().substring(0, 30)}..."`);
    setAdminMessageText('');
  };

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
      statusUpdatedBy: currentAdmin?.name || 'Admin',
      statusUpdatedAt: currentTimestamp,
      notificationHistory: newLogs
    };

    onUpdateApplication(updatedApp);
    logAdminAction('status_updated', selectedApp.id, selectedApp.fullName, `Updated status to "${newStatus}"`);
  };

  // Handle document approval
  const handleApproveDoc = (docId: string) => {
    if (!selectedApp) return;

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedDocs = selectedApp.documents.map(doc => {
      if (doc.id === docId) {
        const docCopy = { 
          ...doc, 
          status: 'Approved' as const,
          actionBy: currentAdmin?.name || 'Admin',
          actionAt: currentTimestamp
        };
        delete docCopy.feedback; // Completely remove feedback key so Firestore doesn't complain about undefined value
        return docCopy;
      }
      return doc;
    });

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
    logAdminAction('document_approved', selectedApp.id, selectedApp.fullName, `Approved document: "${targetDoc?.name}"`);
  };

  // Handle document rejection with feedback
  const handleRejectDoc = (e: React.FormEvent, docId: string) => {
    e.preventDefault();
    if (!selectedApp || !rejectionFeedback.trim()) return;

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedDocs = selectedApp.documents.map(doc => {
      if (doc.id === docId) {
        return { 
          ...doc, 
          status: 'Rejected' as const, 
          feedback: rejectionFeedback,
          actionBy: currentAdmin?.name || 'Admin',
          actionAt: currentTimestamp
        };
      }
      return doc;
    });

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
    logAdminAction('document_rejected', selectedApp.id, selectedApp.fullName, `Rejected document: "${targetDoc?.name}". Reason: "${rejectionFeedback}"`);
    setActiveReviewDocId(null);
    setRejectionFeedback('');
  };

  // Handle student application deletion from Firestore database
  const handleDeleteApplication = async (appId: string) => {
    if (!isUserAdmin) {
      alert('দুঃখিত, শুধুমাত্র Administrators আবেদনকারীর সকল তথ্য ডিলিট করতে পারবেন!');
      return;
    }
    const targetApp = applications.find(a => a.id === appId);
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই আবেদনকারীর সকল তথ্য ডিলিট করতে চান? এই অ্যাকশনটি রিভার্স করা যাবে না!")) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'applications', appId));
      logAdminAction('student_deleted', appId, targetApp?.fullName || 'Deleted Applicant', `Permanently deleted entire application and records`);
      // Reset selected app id if the deleted application was currently selected
      if (selectedAppId === appId) {
        setSelectedAppId(null);
      }
      alert("আবেদনকারীর তথ্য সফলভাবে ডাটাবেজ থেকে ডিলিট করা হয়েছে।");
    } catch (err) {
      console.error("Error deleting application: ", err);
      alert("আবেদনকারী ডিলিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
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

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white border border-slate-100 rounded-3xl relative overflow-hidden" id="admin-auth-container">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-md w-full space-y-8 bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 shadow-slate-200/60">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-gold to-amber-300 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-gold/15">
              <Lock className="h-7 w-7 text-slate-900" />
            </div>
            <div>
              <span className="font-sans font-black text-brand-gold bg-brand-gold-light border border-brand-gold/20 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest inline-block">
                Sodi Euro Admin Portal
              </span>
              <h2 className="mt-3 text-2xl font-black text-slate-900 font-sans tracking-tight">অ্যাডমিন গেটওয়ে (Secure Login)</h2>
              <p className="mt-1 text-xs text-slate-500">
                শুধুমাত্র অনুমোদিত কর্মকর্তাদের প্রবেশাধিকার সংরক্ষিত
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4" id="admin-login-form">
            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-500">অ্যাডমিন আইডি বা ইমেইল (Username or Email)</label>
                <input
                  required
                  id="admin-username-input"
                  type="text"
                  placeholder="Username or email"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs text-slate-800 focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky placeholder:text-slate-400 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-500">নিরাপত্তা পাসওয়ার্ড (Password)</label>
                <input
                  required
                  id="admin-password-input"
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs text-slate-800 focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-[11px] text-red-600 font-bold bg-red-50 border border-red-100 p-3 rounded-xl flex items-center space-x-1.5 text-left" id="admin-login-error">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              id="admin-submit-login-btn"
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3.5 text-xs font-black text-white shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-brand-gold" />
              <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6" id="admin-panel-root">
      {/* Admin Panel Sticky Header with Logout */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl"></div>
        <div className="z-10 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 text-left mb-4 lg:mb-0">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-sans font-black text-sm sm:text-base tracking-wider text-brand-gold">SODI EURO CONTROL PANEL</h2>
              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[8px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE CORE ENGINE</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">বুলগেরিয়া স্টুডেন্ট ভিসা রিয়েল-টাইম ডাটাবেজ কন্ট্রোল ড্যাশবোর্ড</p>
          </div>
        </div>

        {/* Right section: Profile display and logout */}
        <div className="z-10 flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          {/* Active Profile Widget */}
          <div className="flex items-center space-x-3 bg-slate-800/40 hover:bg-slate-800/60 p-2 pr-4 rounded-2xl border border-slate-800/60 transition-all">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0">
              {currentAdmin?.photoUrl ? (
                <img src={currentAdmin.photoUrl} alt={currentAdmin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-300 font-bold text-xs uppercase">
                  {(currentAdmin?.name || 'Admin').substring(0, 2)}
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black tracking-wide text-slate-100">{currentAdmin?.name || 'Master Admin'}</span>
                {currentAdmin?.roleType && (
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                    currentAdmin.roleType === 'administrator' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    currentAdmin.roleType === 'moderator' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                    'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                  }`}>
                    {currentAdmin.roleType}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-slate-400 font-medium truncate max-w-[140px]">{currentAdmin?.role || 'প্রধান প্রশাসক'}</p>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 px-4 py-2.5 text-xs font-black transition-all border border-slate-700 hover:border-slate-600 active:scale-95"
          >
            লগআউট করুন (Logout)
          </button>
        </div>
      </div>

      {/* 1.5 Tab Navigation inside Admin Panel */}
      <div className="flex border-b border-slate-200 gap-1.5" id="admin-sub-tabs">
        <button
          onClick={() => setActiveAdminTab('applicants')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-t-2xl transition-all border-b-2 -mb-[2px] ${
            activeAdminTab === 'applicants'
              ? 'border-brand-sky text-brand-sky bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
          id="admin-tab-btn-applicants"
        >
          <Users className="h-4 w-4" />
          <span>আবেদনকারী ও ফাইল ম্যানেজমেন্ট ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('support_editor')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-t-2xl transition-all border-b-2 -mb-[2px] ${
            activeAdminTab === 'support_editor'
              ? 'border-brand-sky text-brand-sky bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
          id="admin-tab-btn-support"
        >
          <Settings className="h-4 w-4 text-brand-gold" />
          <span>সাপোর্ট টিম ও পেজ সেটিংস</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('messages')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-t-2xl transition-all border-b-2 -mb-[2px] relative ${
            activeAdminTab === 'messages'
              ? 'border-brand-sky text-brand-sky bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
          id="admin-tab-btn-messages"
        >
          <MessageSquare className="h-4 w-4 text-brand-sky" />
          <span>শিক্ষার্থী সাপোর্ট মেসেজ</span>
          {(() => {
            const unreadCount = applications.reduce((sum, app) => {
              const unread = app.messages?.filter(m => m.sender === 'student' && !m.read).length || 0;
              return sum + unread;
            }, 0);
            return unreadCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-black animate-pulse shadow-sm">
                {unreadCount}
              </span>
            ) : null;
          })()}
        </button>
        <button
          onClick={() => setActiveAdminTab('activity_log')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black rounded-t-2xl transition-all border-b-2 -mb-[2px] ${
            activeAdminTab === 'activity_log'
              ? 'border-brand-sky text-brand-sky bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
          id="admin-tab-btn-activity-log"
        >
          <History className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span>রিয়েল-টাইম অ্যাক্টিভিটি লগ ({auditLogs.length})</span>
        </button>
      </div>

      {activeAdminTab === 'applicants' && (
        <>
          {/* 1. Admin Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" id="admin-stats-row">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">মোট আবেদনকারী</span>
            <span className="text-xl font-black font-sans text-slate-800">{stats.total} জন</span>
          </div>
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 group-hover:bg-blue-100 transition-colors"><Users className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ডকুমেন্ট ভেরিফিকেশন</span>
            <span className="text-xl font-black font-sans text-amber-600">{stats.verification} জন</span>
          </div>
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 group-hover:bg-amber-100 transition-colors"><Clock className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-fuchsia-500"></div>
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">দিল্লী প্রসেসিং</span>
            <span className="text-xl font-black font-sans text-purple-600">{stats.embassy} জন</span>
          </div>
          <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 group-hover:bg-purple-100 transition-colors"><TrendingUp className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ভিসা ইস্যু হয়েছে</span>
            <span className="text-xl font-black font-sans text-emerald-600">{stats.issued} জন</span>
          </div>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 group-hover:bg-emerald-100 transition-colors"><Award className="h-5 w-5" /></div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-500 to-red-500"></div>
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">অপরিশোধিত বিল</span>
            <span className="text-xl font-black font-sans text-rose-600">{stats.unpaid} জন</span>
          </div>
          <div className="rounded-xl bg-rose-50 p-2.5 text-brand-red group-hover:bg-rose-100 transition-colors"><CreditCard className="h-5 w-5" /></div>
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
                    <div className="flex items-center space-x-3 text-left">
                      {/* Student Profile Thumbnail */}
                      <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {app.profilePhoto ? (
                          <img 
                            src={app.profilePhoto} 
                            alt={app.fullName} 
                            className="h-full w-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
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
                    </div>

                    <div className="shrink-0 pl-2">
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
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
                <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-slate-100 pb-4 gap-4">
                  <div className="flex items-center space-x-4">
                    {/* Large Student Profile Photo inside admin details panel */}
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group">
                      {selectedApp.profilePhoto ? (
                        <img 
                          src={selectedApp.profilePhoto} 
                          alt={selectedApp.fullName} 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    
                    <div className="text-left">
                      <span className="text-[9px] font-extrabold uppercase bg-slate-100 px-2.5 py-1 rounded text-slate-600 font-mono">
                        {selectedApp.id}
                      </span>
                      <h3 className="mt-1.5 font-display text-xl font-black text-slate-800 flex items-center gap-1.5">
                        {selectedApp.fullName}
                        <Sparkles className="h-4 w-4 text-brand-gold shrink-0" />
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">{selectedApp.desiredCourse}</p>
                    </div>
                  </div>

                  {/* Status pipeline update triggers */}
                  <div className="space-y-1.5 shrink-0 text-left">
                    <label className="text-[10px] font-black text-slate-400 block uppercase">আবেদন স্ট্যাটাস পরিবর্তন ও নিয়ন্ত্রণ:</label>
                    <div className="flex items-center gap-2">
                      <select
                        id="admin-change-status-select"
                        value={selectedApp.status}
                        onChange={(e) => handleUpdateStatus(e.target.value as ApplicationStatus)}
                        className="rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-black bg-slate-50 focus:border-brand-sky focus:outline-none text-slate-700 transition-all shadow-sm flex-grow sm:flex-grow-0"
                      >
                        <option value="Submitted">Submitted (আবেদন জমা)</option>
                        <option value="Document Verification">Document Verification (যাচাইকরণ)</option>
                        <option value="Embassy Processing">Embassy Processing (দিল্লী দূতাবাস)</option>
                        <option value="Visa Issued">Visa Issued (ভিসা অনুমোদিত)</option>
                        <option value="Rejected">Rejected (স্থগিত)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteApplication(selectedApp.id)}
                        className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-brand-red hover:text-red-700 transition-all shadow-sm shrink-0 flex items-center justify-center"
                        title="আবেদনকারীর সকল তথ্য ডাটাবেজ থেকে ডিলিট করুন"
                        id={`admin-btn-delete-app-${selectedApp.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

                {/* Quick Communications Actions Toolbar (Highly Premium & Modern Button System) */}
                <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 text-left">
                  <button
                    type="button"
                    onClick={() => setIsChatModalOpen(true)}
                    className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-3.5 text-xs font-black flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-slate-900/10 border border-slate-950 group"
                  >
                    <MessageSquare className="h-4 w-4 text-brand-gold animate-bounce shrink-0" />
                    <span>শিক্ষার্থীর সাথে চ্যাট করুন</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {(selectedApp.messages && selectedApp.messages.length > 0) && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-sky text-[8px] text-white font-mono font-black shadow-inner">
                        {selectedApp.messages.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNotificationModalOpen(true)}
                    className="flex-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 p-3.5 text-xs font-black flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-200/80 shadow-sm"
                  >
                    <Mail className="h-4 w-4 text-brand-sky shrink-0 animate-pulse" />
                    <span>কাস্টম নোটিফিকেশন (Email/SMS)</span>
                  </button>
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
                            
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {doc.fileUrl ? (
                                <>
                                  <button
                                    onClick={() => setPreviewDoc(doc)}
                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-sky hover:text-brand-sky-dark bg-brand-sky-light/10 hover:bg-brand-sky-light/20 px-2 py-1 rounded transition-colors"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    ফাইল দেখুন (View)
                                  </button>
                                  <a
                                    href={doc.fileUrl}
                                    download={doc.fileName}
                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    ডাউনলোড (Download)
                                  </a>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    alert(`এটি ডেমো ফাইল। নতুন আবেদনকারীর আপলোড করা ফাইল সরাসরি দেখতে ও ডাউনলোড করতে পারবেন।\n\nফাইল নাম: ${doc.fileName}`);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  ডেমো ফাইল (View/Download)
                                </button>
                              )}
                            </div>
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

              {/* No more inline communication panels - they are now beautiful modals! */}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
              আবেদনকারীর বিবরণ দেখতে বামের তালিকা থেকে সিলেক্ট করুন।
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* 2. Support Page Settings & Team Editor */}
      {activeAdminTab === 'support_editor' && (
        <div className="space-y-6" id="support-editor-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="space-y-1 text-left">
              <h3 className="font-display font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-gold" />
                <span>কন্ট্যাক্ট পেইজ ও সাপোর্ট টিম ম্যানেজার (Contact Page Team Editor)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                এখানে ওনার (Dilowar Hosen) এবং ব্যবস্থাপনা পরিচালক (Sohel Rana) এর মতো কন্ট্যাক্ট পেইজের নতুন মেম্বারদের তথ্য যোগ ও এডিট করতে পারবেন। নতুন মেম্বার যুক্ত করলে সেটি সরাসরি পাবলিক কন্ট্যাক্ট পেইজে অ্যাড হবে।
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleResetSupportToDefault}
              className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 px-4 py-2 text-[10px] font-black transition-all flex items-center gap-1.5 shrink-0"
              title="রিসেট করুন"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>ডিফল্ট রিসেট (Reset Defaults)</span>
            </button>
          </div>

          {!isUserAdmin && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-bold px-4 py-3 rounded-2xl text-left flex items-center gap-2">
              <span>⚠️</span>
              <span>দুঃখিত, আপনি "Moderator" বা "Support" রোলে লগইন করেছেন। শুধুমাত্র <strong>Administrators</strong> মেম্বারদের তথ্য যোগ, পরিবর্তন বা ডিলিট করতে পারবেন।</span>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Select Member to Edit */}
            <div className="lg:col-span-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">মেম্বার সিলেক্ট করুন</span>
                  <button
                    type="button"
                    onClick={handleAddNewSupportMember}
                    className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-black px-2.5 py-1.5 flex items-center gap-1 border border-emerald-200/45 transition-all shadow-sm shrink-0 active:scale-95"
                  >
                    <Plus className="h-3 w-3" />
                    <span>নতুন মেম্বার</span>
                  </button>
                </div>
                {loadingSupport ? (
                  <p className="text-xs text-slate-400 py-4 text-center">লোড হচ্ছে...</p>
                ) : (
                  <div className="space-y-2">
                    {supportMembers.map((member) => (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => setSelectedSupportMemberId(member.id)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all border ${
                          selectedSupportMemberId === member.id
                            ? 'border-brand-sky bg-brand-sky-light/10 text-brand-sky shadow-sm'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden font-display font-black text-xs text-slate-700">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            member.name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black block truncate">{member.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 block truncate">{member.role}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Edit Fields Form */}
            <div className="lg:col-span-8">
              {supportDraft ? (
                <form onSubmit={handleSaveSupportMember} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[10px] bg-brand-sky/10 text-brand-sky font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                        {supportDraft.id === 'dilowar_hosen' ? 'ওনার প্রোফাইল (Owner)' : 
                         supportDraft.id === 'sohel_rana' ? 'ব্যবস্থাপনা পরিচালক (MD)' : 'সাপোর্ট টিম প্রোফাইল (Support Team)'}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 font-sans mt-1">
                        {supportDraft.name}-এর প্রোফাইল এডিটর
                      </h4>
                    </div>
                    {supportSuccessMsg && (
                      <span className="text-[11px] font-bold text-emerald-600 animate-pulse bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl shrink-0">
                        {supportSuccessMsg}
                      </span>
                    )}
                  </div>

                  {/* 1. Profile photos */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">প্রোফাইল ছবি ও কভার ফটো (Images)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Avatar Photo Upload */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 flex flex-col justify-between">
                        <div className="flex gap-3 items-center">
                          <div className="h-14 w-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            {supportDraft.photoUrl ? (
                              <img src={supportDraft.photoUrl} alt="" className="h-full w-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="text-slate-400 text-xs font-black">NA</div>
                            )}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-800 block">প্রোফাইল ফটো (Avatar)</span>
                            <span className="text-[10px] text-slate-400 block">সাইজ সর্বোচ্চ ৯০০ কি.বা.</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => supportPhotoInputRef.current?.click()}
                            className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Camera className="h-3.5 w-3.5 text-slate-500" />
                            <span>আপলোড ছবি</span>
                          </button>
                          <input
                            ref={supportPhotoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, supportDraft.id, 'photo')}
                            className="hidden"
                          />
                          {supportDraft.photoUrl && (
                            <button
                              type="button"
                              onClick={() => updateDraftField('photoUrl', '')}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-brand-red rounded-lg p-2 transition-colors"
                              title="ছবি মুছুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cover Photo Upload */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 flex flex-col justify-between">
                        <div className="flex gap-3 items-center">
                          <div className="h-14 w-24 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            {supportDraft.coverPhotoUrl ? (
                              <img src={supportDraft.coverPhotoUrl} alt="" className="h-full w-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="text-slate-400 text-xs font-black">গ্রাডিয়েন্ট</div>
                            )}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-800 block">কভার ব্যানার (Cover Banner)</span>
                            <span className="text-[10px] text-slate-400 block">সাইজ সর্বোচ্চ ৯০০ কি.বা.</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => supportCoverInputRef.current?.click()}
                            className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Camera className="h-3.5 w-3.5 text-slate-500" />
                            <span>আপলোড ব্যানার</span>
                          </button>
                          <input
                            ref={supportCoverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, supportDraft.id, 'cover')}
                            className="hidden"
                          />
                          {supportDraft.coverPhotoUrl && (
                            <button
                              type="button"
                              onClick={() => updateDraftField('coverPhotoUrl', '')}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-brand-red rounded-lg p-2 transition-colors"
                              title="ব্যানার মুছুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Basic Credentials */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">প্রাথমিক তথ্য (Basic Profile)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-black text-slate-500">মেম্বারের নাম (Name):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.name}
                          onChange={(e) => updateDraftField('name', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-black text-slate-500">পদবী/রোল (Role/Designation):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.role}
                          onChange={(e) => updateDraftField('role', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-black text-slate-500">ব্যাজ ট্যাগ (Badge Tag):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.badge}
                          onChange={(e) => updateDraftField('badge', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2b. Admin Portal Credentials */}
                  <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">অ্যাডমিন লগইন তথ্য (Admin Portal Credentials)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">ইউজারনেম (Username):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.username || ''}
                          onChange={(e) => updateDraftField('username', e.target.value.trim().toLowerCase())}
                          placeholder="e.g. dilowar"
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">পাসওয়ার্ড (Password):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.password || ''}
                          onChange={(e) => updateDraftField('password', e.target.value)}
                          placeholder="e.g. dilowar123"
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500">রোল টাইপ (Role Type):</label>
                        <select
                          value={supportDraft.roleType || 'support'}
                          onChange={(e) => updateDraftField('roleType', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-sky"
                        >
                          <option value="administrator">Administrator</option>
                          <option value="moderator">Moderator</option>
                          <option value="support">Support</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400">এই ইউজারনেম, পাসওয়ার্ড এবং রোল টাইপ দিয়ে সংশ্লিষ্ট মেম্বার এডমিন প্যানেলে লগইন করতে পারবেন এবং তার এক্সেস লেভেল নির্ধারিত হবে।</p>
                  </div>

                  {/* 3. Contact & Location Info */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">যোগাযোগ ও অবস্থান (Contact details)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-black text-slate-500">ইমেইল এড্রেস (Email):</label>
                        <input
                          required
                          type="email"
                          value={supportDraft.email}
                          onChange={(e) => updateDraftField('email', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-black text-slate-500">সরাসরি ফোন (Phone):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.phone}
                          onChange={(e) => updateDraftField('phone', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky font-mono"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-black text-slate-500">WhatsApp Number:</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.whatsapp}
                          onChange={(e) => updateDraftField('whatsapp', e.target.value)}
                          placeholder="8801700000000"
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky font-mono"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-black text-slate-500">অফিস অবস্থান (Location):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.location}
                          onChange={(e) => updateDraftField('location', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Biography / Intro */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">পরিচিতি ও ভূমিকা (Bio/About):</label>
                    <textarea
                      required
                      rows={4}
                      value={supportDraft.bio}
                      onChange={(e) => updateDraftField('bio', e.target.value)}
                      placeholder="এখানে মেম্বারের বিস্তারিত পরিচিতি ও কাজের ভূমিকা লিখুন..."
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:border-brand-sky whitespace-pre-line leading-relaxed"
                    />
                  </div>

                  {/* 5. Custom Buttons settings */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">কল-টু-অ্যাকশন কাস্টমাইজেশন (CTA Action Button)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-500">বাটনের লিখা (CTA Text):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.btnText}
                          onChange={(e) => updateDraftField('btnText', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-500">অ্যাকশন লিঙ্ক (CTA URL):</label>
                        <input
                          required
                          type="text"
                          value={supportDraft.btnUrl}
                          onChange={(e) => updateDraftField('btnUrl', e.target.value)}
                          placeholder="https://wa.me/..."
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:border-brand-sky font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit save button */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-150 gap-3">
                    {supportDraft.id !== 'dilowar_hosen' && supportDraft.id !== 'sohel_rana' ? (
                      <button
                        type="button"
                        disabled={!isUserAdmin}
                        onClick={() => handleDeleteSupportMember(supportDraft.id)}
                        className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-brand-red disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-[11px] font-black shadow-sm transition-all active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>প্রোফাইলটি ডিলিট করুন</span>
                      </button>
                    ) : (
                      <div></div> // Spacer
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSavingSupport || !isUserAdmin}
                      className="flex items-center space-x-1.5 rounded-xl bg-slate-900 text-white disabled:bg-slate-300 disabled:cursor-not-allowed px-6 py-3 text-xs font-black hover:bg-slate-800 disabled:text-slate-500 shadow-md transition-all active:scale-95"
                    >
                      <Save className="h-4 w-4 text-brand-gold" />
                      <span>{isSavingSupport ? 'সংরক্ষণ করা হচ্ছে...' : 'পরিবর্তনগুলো সংরক্ষণ করুন'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
                  মেম্বার সেটিংস লোড করা সম্ভব হয়নি।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Real-time Activity Logs / Audit Trail */}
      {activeAdminTab === 'activity_log' && (
        <div className="space-y-6" id="activity-log-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="space-y-1 text-left">
              <h3 className="font-display font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-500" />
                <span>রিয়েল-টাইম অ্যাক্টিভিটি ট্র্যাকার (Real-Time System Audit Log)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                সকল এডমিন, মডারেটর এবং ম্যানেজারদের কাজের রিয়েল-টাইম আপডেট ও সিকিউরিটি লগ ট্র্যাকিং। যেকোনো মেসেজ রিপ্লাই, ফাইল অনুমোদন বা স্ট্যাটাস আপডেট এখানে ট্র্যাকিং হয়।
              </p>
            </div>
          </div>

          {/* Stat summary inside audit logs */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">মোট লগ সংখ্যা</span>
              <span className="text-lg font-black font-mono text-slate-800">{auditLogs.length}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">বার্তা রিপ্লাই</span>
              <span className="text-lg font-black font-mono text-indigo-600">
                {auditLogs.filter(l => l.actionType === 'message_reply').length}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">ফাইল অনুমোদিত</span>
              <span className="text-lg font-black font-mono text-emerald-600">
                {auditLogs.filter(l => l.actionType === 'document_approved').length}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">ফাইল রিজেক্ট</span>
              <span className="text-lg font-black font-mono text-rose-600">
                {auditLogs.filter(l => l.actionType === 'document_rejected').length}
              </span>
            </div>
          </div>

          {/* Audit Trail List Card */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden text-left">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-800 font-sans">সর্বশেষ অ্যাক্টিভিটি টাইমলাইন (Audit Timeline)</h4>
                <p className="text-[10px] text-slate-400 font-medium">নিচে রিয়েল-টাইমে সর্টকৃত সর্বশেষ মেম্বারদের অ্যাকশন লিস্ট দেওয়া হল।</p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>অটো-সিঙ্ক সক্রিয়</span>
              </div>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <div className="text-3xl">📭</div>
                <h5 className="text-xs font-bold text-slate-700">কোনো অ্যাক্টিভিটি লগ পাওয়া যায়নি</h5>
                <p className="text-[10px] text-slate-400 max-w-sm mx-auto">এডমিন বা মডারেটর কোনো ফাইল অ্যাপ্রুভ/রিজেক্ট করলে অথবা স্টুডেন্টদের মেসেজে রিপ্লাই দিলে এখানে স্বয়ংক্রিয়ভাবে ট্র্যাকিং ডেটা যুক্ত হবে।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      <th className="py-3 px-5 text-left font-bold w-1/4">এডমিন / মডারেটর (Actor)</th>
                      <th className="py-3 px-5 text-left font-bold w-1/6">অ্যাকশন টাইপ (Action)</th>
                      <th className="py-3 px-5 text-left font-bold w-1/4">শিক্ষার্থী (Student Target)</th>
                      <th className="py-3 px-5 text-left font-bold w-1/3">বিস্তারিত বিবরণ (Details)</th>
                      <th className="py-3 px-5 text-left font-bold w-1/12">সময় (Timestamp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => {
                      // Get a nice color and tag for specific actionType
                      let actionBadgeClass = '';
                      let actionText = '';
                      switch (log.actionType) {
                        case 'message_reply':
                          actionBadgeClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                          actionText = 'মেসেজ রিপ্লাই';
                          break;
                        case 'document_approved':
                          actionBadgeClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                          actionText = 'ডকুমেন্ট অনুমোদন';
                          break;
                        case 'document_rejected':
                          actionBadgeClass = 'bg-rose-50 text-rose-600 border border-rose-100';
                          actionText = 'ডকুমেন্ট রিজেক্ট';
                          break;
                        case 'status_updated':
                          actionBadgeClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                          actionText = 'স্ট্যাটাস আপডেট';
                          break;
                        case 'member_added':
                          actionBadgeClass = 'bg-purple-50 text-purple-600 border border-purple-100';
                          actionText = 'নতুন এডমিন যোগ';
                          break;
                        case 'member_updated':
                          actionBadgeClass = 'bg-slate-100 text-slate-700 border border-slate-200';
                          actionText = 'প্রোফাইল আপডেট';
                          break;
                        case 'student_deleted':
                          actionBadgeClass = 'bg-red-50 text-red-600 border border-red-100';
                          actionText = 'আবেদনকারী ডিলিট';
                          break;
                        default:
                          actionBadgeClass = 'bg-slate-50 text-slate-600 border border-slate-100';
                          actionText = log.actionType;
                      }

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors font-medium">
                          <td className="py-4 px-5">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                                {log.adminPhoto ? (
                                  <img src={log.adminPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-[10px] font-black uppercase">
                                    {(log.adminName || 'AD').substring(0, 2)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{log.adminName}</span>
                                <span className="text-[8px] text-slate-400 font-mono font-bold block">{log.adminId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black tracking-wide ${actionBadgeClass}`}>
                              {actionText}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            {log.studentId === 'system' ? (
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">সিস্টেম ওয়াইড (System Wide)</span>
                            ) : (
                              <div>
                                <span className="font-bold text-slate-700 block leading-tight">{log.studentName}</span>
                                <span className="text-[9px] text-slate-400 font-mono font-semibold block">ID: {log.studentId}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <p className="text-slate-600 font-semibold leading-relaxed break-words pr-2 max-w-[340px]">{log.details}</p>
                          </td>
                          <td className="py-4 px-5 text-slate-400 font-mono font-bold text-[10px]">
                            {log.timestamp}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeAdminTab === 'messages' && (() => {
        // Find all applications that have messages, sorted by latest message sentAt timestamp
        const appsWithMessages = applications
          .filter(app => app.messages && app.messages.length > 0)
          .sort((a, b) => {
            const lastA = a.messages?.[a.messages.length - 1]?.sentAt || '';
            const lastB = b.messages?.[b.messages.length - 1]?.sentAt || '';
            return lastB.localeCompare(lastA);
          });

        const filteredAppsWithMessages = appsWithMessages.filter(app => {
          if (!chatSearchTerm.trim()) return true;
          const search = chatSearchTerm.toLowerCase();
          return app.fullName.toLowerCase().includes(search) || app.id.toLowerCase().includes(search);
        });

        const currentChatApp = applications.find(a => a.id === (activeChatAppId || appsWithMessages[0]?.id));

        return (
          <div className="space-y-6 text-left" id="admin-messages-tab-root">
            {/* Header section with total metrics */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-brand-sky" />
                  <span>শিক্ষার্থী সহায়তা মেসেজ সেন্টার (Message Center)</span>
                </h3>
                <p className="text-[11px] text-slate-400">রিয়েল-টাইম মেসেজ আদান-প্রদান এবং শিক্ষার্থী সমস্যা সমাধান হাব</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 font-mono text-[11px] font-bold text-slate-600">
                <span>সক্রিয় চ্যাট থ্রেড: {appsWithMessages.length} টি</span>
              </div>
            </div>

            {/* Main responsive grid: 2 Columns on desktop, single column on mobile */}
            <div className="grid grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden h-[620px]" id="admin-chat-grid-container">
              
              {/* Left Column (Threads list / sidebar): span 4 on desktop, hide on mobile if a thread is open */}
              <div className={`col-span-12 lg:col-span-4 border-r border-slate-100 flex flex-col h-full bg-slate-50/40 ${
                activeChatAppId ? 'hidden lg:flex' : 'flex'
              }`}>
                {/* Search / Filter threads */}
                <div className="p-4 border-b border-slate-100 bg-white space-y-3 text-left">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="শিক্ষার্থীর নাম খুঁজুন..."
                      value={chatSearchTerm}
                      onChange={(e) => setChatSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-sky focus:bg-white transition-all text-slate-700 font-semibold"
                    />
                    <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                  </div>

                  {/* Start new chat selector */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-slate-400 block uppercase">নতুন চ্যাট শুরু করুন (New Thread):</label>
                    <select
                      value={currentChatApp?.id || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          setActiveChatAppId(e.target.value);
                        }
                      }}
                      className="w-full text-xs font-bold text-slate-700 rounded-xl border border-slate-200 p-2 bg-white focus:outline-none focus:border-brand-sky"
                    >
                      <option value="" disabled>শিক্ষার্থী বাছাই করুন...</option>
                      {applications.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.fullName} (ID: {app.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Scrollable list of threads */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-1 bg-slate-50/30">
                  {filteredAppsWithMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      {chatSearchTerm ? 'কোনো অমিল থ্রেড পাওয়া যায়নি।' : 'এখনো কোনো মেসেজ থ্রেড নেই।'}
                    </div>
                  ) : (
                    filteredAppsWithMessages.map(app => {
                      const isSelected = currentChatApp?.id === app.id;
                      const lastMsg = app.messages?.[app.messages.length - 1];
                      const unreadStudentCount = app.messages?.filter(m => m.sender === 'student' && !m.read).length || 0;

                      return (
                        <button
                          key={app.id}
                          onClick={() => setActiveChatAppId(app.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-950 shadow-md scale-[1.01]'
                              : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 shadow-sm'
                          }`}
                        >
                          <div className="h-10 w-10 rounded-full border border-slate-200/80 overflow-hidden shrink-0 relative bg-slate-100">
                            {app.profilePhoto ? (
                              <img src={app.profilePhoto} alt={app.fullName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                {app.fullName.substring(0, 2)}
                              </div>
                            )}
                            {unreadStudentCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-[8px] font-black h-4.5 w-4.5 flex items-center justify-center shadow-sm animate-pulse">
                                {unreadStudentCount}
                              </span>
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1 space-y-0.5 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black truncate block pr-2">{app.fullName}</span>
                              <span className={`text-[8px] font-mono shrink-0 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                {lastMsg ? lastMsg.sentAt.split(' ')[1] || lastMsg.sentAt : ''}
                              </span>
                            </div>
                            <span className={`text-[10px] truncate block ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              {lastMsg ? lastMsg.text : 'কোনো মেসেজ নেই'}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column (Chat screen): span 8 on desktop, full screen on mobile if a thread is open */}
              <div className={`col-span-12 lg:col-span-8 flex flex-col h-full bg-white relative ${
                activeChatAppId ? 'flex' : 'hidden lg:flex'
              }`}>
                {currentChatApp ? (
                  <>
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                      <div className="flex items-center gap-3 text-left">
                        {/* Mobile back button */}
                        <button
                          type="button"
                          onClick={() => setActiveChatAppId(null)}
                          className="lg:hidden rounded-lg p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors mr-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                          </svg>
                        </button>

                        <div className="h-10 w-10 rounded-full border border-slate-800 overflow-hidden shrink-0 bg-slate-800">
                          {currentChatApp.profilePhoto ? (
                            <img src={currentChatApp.profilePhoto} alt={currentChatApp.fullName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">
                              {currentChatApp.fullName.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black tracking-wider text-brand-gold uppercase">{currentChatApp.fullName}</h4>
                          <p className="text-[9px] sm:text-[10px] text-slate-300 font-medium">Passport: {currentChatApp.passportNumber} · Course: {currentChatApp.desiredCourse}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-[9px] bg-slate-800 border border-slate-700 text-slate-300 font-mono px-2.5 py-1.5 rounded-xl font-bold">
                          ID: {currentChatApp.id}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl ${
                          currentChatApp.status === 'Visa Issued' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          currentChatApp.status === 'Submitted' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          currentChatApp.status === 'Document Verification' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {currentChatApp.status}
                        </span>
                      </div>
                    </div>

                    {/* Messages list */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                      {(!currentChatApp.messages || currentChatApp.messages.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 py-16">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 animate-bounce">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-700 block">কোনো পূর্ববর্তী কথোপকথন পাওয়া যায়নি</span>
                            <span className="text-[10px] text-slate-400 block">নিচের মেসেজ বক্সের মাধ্যমে প্রথম মেসেজ পাঠান।</span>
                          </div>
                        </div>
                      ) : (
                        currentChatApp.messages.map((msg, idx) => {
                          const isAdmin = msg.sender === 'admin';
                          return (
                            <div
                              key={msg.id || idx}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                            >
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                                {isAdmin ? (
                                  <>
                                    {msg.adminPhoto && (
                                      <img src={msg.adminPhoto} alt="" className="h-3.5 w-3.5 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                                    )}
                                    <span>{msg.adminName || 'ম্যানেজার (Admin)'}</span>
                                  </>
                                ) : (
                                  <span>শিক্ষার্থী (Student)</span>
                                )}
                              </span>
                              
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed break-words shadow-sm ${
                                  isAdmin
                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                }`}
                              >
                                <p className="whitespace-pre-line font-medium text-left">{msg.text}</p>
                                
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="mt-2.5 pt-2 border-t border-slate-100/10 space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-brand-gold tracking-wider block text-left">সংযুক্ত ফাইলসমূহ:</span>
                                    {msg.attachments.map((file, fIdx) => (
                                      <a
                                        key={fIdx}
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center space-x-1.5 hover:underline text-brand-gold font-bold text-[10px] bg-slate-800/40 p-2 rounded-xl text-left"
                                      >
                                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                                        <span className="truncate flex-grow">{file.name}</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-400 font-mono px-1">{msg.sentAt}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Quick Response Templates / Recommendations for speed */}
                    <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0 pl-2">কুইক রিপ্লাই:</span>
                      {[
                        "আপনার কাগজপত্র অনুমোদিত হয়েছে।",
                        "অনুগ্রহ করে সঠিক পাসপোর্ট সাইজ ছবি আপলোড দিন।",
                        "এম্বাসি ইন্টারভিউ স্লট চূড়ান্ত করা হয়েছে।",
                        "দয়া করে ফি এর রশিদটি আপলোড করুন।"
                      ].map((tmpl, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setAdminMessageText(tmpl)}
                          className="rounded-lg bg-white hover:bg-slate-100 border border-slate-200/60 px-3 py-1 text-[10px] font-bold text-slate-600 transition-colors shrink-0 whitespace-nowrap shadow-sm active:scale-95"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>

                    {/* Footer Input Area */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!adminMessageText.trim() && !adminChatFile) return;

                        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
                        const newMsg: ChatMessage = {
                          id: `msg-${Date.now()}`,
                          sender: 'admin',
                          text: adminMessageText,
                          sentAt: timestamp,
                          read: true,
                          attachments: adminChatFile ? [{ name: adminChatFileName || 'Attachment', url: adminChatFile }] : undefined,
                          adminName: currentAdmin?.name || 'Admin',
                          adminPhoto: currentAdmin?.photoUrl || ''
                        };

                        const updatedApp: Application = {
                          ...currentChatApp,
                          messages: [...(currentChatApp.messages || []), newMsg]
                        };

                        onUpdateApplication(updatedApp);
                        logAdminAction('message_reply', currentChatApp.id, currentChatApp.fullName, `Sent chat reply: "${adminMessageText.substring(0, 40)}..."`);
                        setAdminMessageText('');
                        setAdminChatFile('');
                        setAdminChatFileName('');
                      }}
                      className="p-3 bg-white border-t border-slate-200/80 space-y-2 shrink-0"
                    >
                      {/* Attached file row */}
                      {adminChatFile && (
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-600">
                          <div className="flex items-center space-x-1.5 truncate">
                            <Paperclip className="h-3.5 w-3.5 text-brand-sky shrink-0" />
                            <span className="truncate">{adminChatFileName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAdminChatFile('');
                              setAdminChatFileName('');
                            }}
                            className="text-brand-red hover:text-red-700 text-xs font-black shrink-0"
                          >
                            মুছুন (Remove)
                          </button>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        {/* File upload */}
                        <label className="cursor-pointer h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                          <Paperclip className="h-4 w-4" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (reader.result) {
                                    setAdminChatFile(reader.result as string);
                                    setAdminChatFileName(file.name);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        <input
                          type="text"
                          placeholder="শিক্ষার্থীর উদ্দেশ্যে উত্তর লিখুন..."
                          value={adminMessageText}
                          onChange={(e) => setAdminMessageText(e.target.value)}
                          className="flex-grow rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-brand-sky text-slate-800 font-semibold"
                        />

                        <button
                          type="submit"
                          className="bg-slate-900 text-white rounded-xl h-10 px-4.5 text-xs font-black flex items-center justify-center space-x-1.5 hover:bg-slate-800 transition-all active:scale-95 shrink-0"
                        >
                          <Send className="h-3.5 w-3.5 text-brand-gold" />
                          <span>পাঠান</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="m-auto text-center p-12 text-slate-400 text-xs space-y-3 max-w-sm">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-700 block">কোনো শিক্ষার্থী নির্বাচিত করা হয়নি</span>
                      <span className="text-[10px] text-slate-400 block">কথোপকথন শুরু করতে বাম পাশের তালিকা থেকে একটি থ্রেড নির্বাচন করুন অথবা নতুন চ্যাট শুরু করুন।</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modern Popups & Modals (AnimatePresence) */}
      <AnimatePresence>
        {/* 1. Live Chat Modal Popup */}
        {isChatModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm" id="chat-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-2xl w-full bg-white rounded-none sm:rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[85vh] relative text-left"
              id="admin-chat-modal-box"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3.5">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedApp.profilePhoto ? (
                      <img 
                        src={selectedApp.profilePhoto} 
                        alt={selectedApp.fullName} 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black tracking-tight">{selectedApp.fullName}</h4>
                    <p className="text-[9px] sm:text-[10px] text-slate-300 font-semibold font-mono flex items-center gap-1 sm:gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ID: {selectedApp.id} <span className="hidden sm:inline">· Passport: {selectedApp.passportNumber}</span>
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsChatModalOpen(false)}
                  className="rounded-xl p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <XCircle className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
                </button>
              </div>

              {/* Chat window box with gorgeous scrolling message speech bubbles */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 bg-slate-50 flex-1 min-h-[200px] flex flex-col">
                {(!selectedApp.messages || selectedApp.messages.length === 0) ? (
                  <div className="my-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                      <MessageSquare className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-black">কোনো বার্তালাপ নেই।</p>
                      <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">শিক্ষার্থীর সাথে চ্যাট শুরু করতে নিচের কুইক টেমপ্লেট ব্যবহার করতে পারেন অথবা মেসেজ টাইপ করুন।</p>
                    </div>
                  </div>
                ) : (
                  selectedApp.messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          isAdmin ? 'align-end self-end items-end' : 'align-start self-start items-start'
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                            isAdmin
                              ? 'bg-slate-900 text-white rounded-tr-none border-b border-slate-950'
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/70'
                          }`}
                        >
                          <p className="leading-relaxed font-semibold">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono font-semibold">
                          {isAdmin ? 'অ্যাডমিন (আপনি)' : 'শিক্ষার্থী'} · {msg.sentAt}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Template Presets selector inside the chat popup */}
              <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-white space-y-1.5 text-left shrink-0">
                <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">কুইক টেমপ্লেট (Quick Send Presets):</span>
                <div className="flex flex-wrap gap-1.5 max-h-[75px] sm:max-h-[none] overflow-y-auto pr-1">
                  {[
                    "আপনার আপলোডকৃত ডকুমেন্টস সফলভাবে ভেরিফিকেশন করা হয়েছে। ধন্যবাদ।",
                    "আপনার পাসপোর্টের স্ক্যান কপিটি অস্পষ্ট। দয়া করে ড্যাশবোর্ড থেকে পুনরায় আপলোড করুন।",
                    "অভিনন্দন! আপনার বয়স ও রেজাল্ট অনুযায়ী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় নির্বাচন সফল হয়েছে।",
                    "অভিনন্দন! আপনার বুলগেরিয়া স্টুডেন্ট ভিসা অনুমোদিত ও পাসপোর্ট স্ট্যাম্পড হয়েছে।",
                    "আপনার দিল্লী প্রসেসিং এর ১ম কিস্তি ফি বকেয়া আছে। অনুগ্রহ করে পরিশোধ করুন।"
                  ].map((presetText, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAdminMessageText(presetText)}
                      className="text-[9px] font-bold bg-slate-100 text-slate-600 hover:bg-brand-sky-light hover:text-brand-sky-dark border border-slate-200/50 px-2 py-1 rounded-lg transition-all truncate max-w-[190px]"
                      title={presetText}
                    >
                      {presetText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message input area */}
              <form onSubmit={handleSendAdminMessage} className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex gap-2 sm:gap-2.5 items-center shrink-0">
                <input
                  required
                  type="text"
                  value={adminMessageText}
                  onChange={(e) => setAdminMessageText(e.target.value)}
                  placeholder="মেসেজ লিখুন..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold focus:outline-none focus:border-brand-sky transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 text-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-black hover:bg-slate-800 transition-all border-b border-brand-gold shrink-0 flex items-center space-x-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">পাঠান</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* 2. Custom Notifications (Email/SMS) Modal Popup */}
        {isNotificationModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm" id="notification-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-xl w-full bg-white rounded-none sm:rounded-3xl border border-slate-200/80 shadow-2xl p-5 sm:p-6 relative text-left space-y-4 h-full sm:h-auto overflow-y-auto flex flex-col sm:block"
              id="admin-notification-modal-box"
            >
              {/* Modal Close */}
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-xl p-1 text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                <XCircle className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 pr-8 shrink-0">
                <div className="h-10 w-10 rounded-xl bg-brand-sky-light text-brand-sky flex items-center justify-center shrink-0">
                  <Mail className="h-5.5 w-5.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">স্মার্ট নোটিফিকেশন হাব (Custom Dispatcher)</h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate max-w-[200px] sm:max-w-none">শিক্ষার্থী: {selectedApp.fullName} ({selectedApp.phone})</p>
                </div>
              </div>

              {/* Direct Template Quick Presets to ease work */}
              <div className="space-y-1.5 shrink-0">
                <label className="text-[10px] font-black text-slate-500 block">কুইক প্রিসেটস (Auto-Fill Presets):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left max-h-[110px] sm:max-h-none overflow-y-auto pr-1">
                  {[
                    {
                      label: "✅ বোর্ড ডকুমেন্টস এপ্রুভড",
                      title: "আপনার বোর্ড ডকুমেন্টস ভেরিফিকেশন সম্পন্ন হয়েছে!",
                      body: `প্রিয় ${selectedApp.fullName}, আপনার বোর্ড আপলোডকৃত কাগজপত্র সফলভাবে যাচাই করা হয়েছে। পরবর্তী প্রসেসিং এর জন্য অপেক্ষা করুন।`
                    },
                    {
                      label: "❌ ইনকমপ্লিট ডকুমেন্টস এলার্ট",
                      title: "কাগজপত্র অসম্পূর্ণ বা ক্রুটিপূর্ণ এলার্ট",
                      body: `প্রিয় ${selectedApp.fullName}, আপনার আপলোডকৃত ডকুমেন্টস এর মধ্যে কিছু ত্রুটি পাওয়া গেছে। দয়া করে প্রোফাইল থেকে রিজেকশন ফিডব্যাক পড়ে পুনরায় সঠিক ফাইল আপলোড করুন।`
                    },
                    {
                      label: "🛂 দিল্লী এম্বাসি বুকিং স্লট",
                      title: "দিল্লী এম্বাসি বুকিং এবং ভারতীয় ভাষা শিডিউল সম্পন্ন",
                      body: `প্রিয় ${selectedApp.fullName}, আপনার বুলগেরিয়ান ফাইল ভারতীয় দিল্লী হাই কমিশন এম্বাসি ইন্টারভিউ স্লটের জন্য শিডিউল বুকড করা হয়েছে। বিস্তারিত দেখতে ইনবক্স চেক করুন।`
                    },
                    {
                      label: "✈️ visa issue alert",
                      title: "অভিনন্দন! বুলগেরিয়া ভিসা ইস্যু সম্পন্ন",
                      body: `অভিনন্দন ${selectedApp.fullName}! আপনার দেশীয় পাসপোর্ট দিল্লীস্থ বুলগেরিয়া এম্বাসি থেকে স্টুডেন্ট ভিসা স্ট্যাম্পড হয়ে ফেরত এসেছে। টিকিট বুকিং সংক্রান্ত তথ্যের জন্য যোগাযোগ করুন।`
                    }
                  ].map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setNotifTitle(preset.title);
                        setNotifBody(preset.body);
                      }}
                      className="text-[10px] font-bold bg-slate-50 hover:bg-brand-sky-light/50 border border-slate-200 p-2 rounded-xl text-slate-700 transition-all text-left truncate"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={(e) => {
                handleSendCustomNotification(e);
                setIsNotificationModalOpen(false);
              }} className="space-y-4 flex-1 sm:flex-none flex flex-col sm:block justify-between">
                <div className="space-y-4">
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500">নোটিফিকেশনের শিরোনাম (Subject/Title):</label>
                      <input
                        required
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="যেমন: পাসপোর্ট অ্যাটেস্টেশন সম্পন্ন হয়েছে"
                        className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-xs font-semibold focus:outline-none focus:border-brand-sky transition-all"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-black text-slate-500">মাধ্যমে (Channel):</label>
                      <select
                        value={notifType}
                        onChange={(e) => setNotifType(e.target.value as 'sms' | 'email')}
                        className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-xs bg-slate-50 focus:outline-none focus:border-brand-sky font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="sms">💬 SMS Alert</option>
                        <option value="email">📧 Email Notification</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">বার্তা (Message Body):</label>
                    <textarea
                      required
                      rows={3}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      placeholder="এখানে বার্তার মূল অংশ লিখুন..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-xs font-semibold focus:outline-none focus:border-brand-sky transition-all"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[10px] font-bold text-slate-500 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                      প্রাপক: {notifType === 'sms' ? selectedApp.phone : selectedApp.email}
                    </span>
                    <span className="shrink-0">{notifBody.length} অক্ষর</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 mt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsNotificationModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    id="admin-btn-send-notif"
                    type="submit"
                    className="flex items-center space-x-1.5 rounded-xl bg-brand-sky text-white px-5 py-2.5 text-xs font-black hover:bg-brand-sky-dark shadow-md transition-all active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>পাঠান</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 3. Applicant Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" id="document-preview-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] text-left"
              id="document-preview-modal-card"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="text-left">
                  <h3 className="font-display font-black text-slate-800 text-xs sm:text-sm">{previewDoc.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">{previewDoc.fileName} ({previewDoc.fileSize})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-full p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body / Preview area */}
              <div className="p-6 overflow-y-auto flex-grow flex items-center justify-center bg-slate-100 min-h-[350px]">
                {previewDoc.fileUrl ? (
                  (() => {
                    const previewUrl = getSafePreviewUrl(previewDoc.fileUrl);
                    const isPdf = previewDoc.fileUrl.startsWith('data:application/pdf') || 
                                  previewDoc.fileName.toLowerCase().endsWith('.pdf') ||
                                  previewUrl.includes('application/pdf');
                    const isImage = previewDoc.fileUrl.startsWith('data:image/') || 
                                    /\.(png|jpe?g|gif|webp|svg)$/i.test(previewDoc.fileName);
                    
                    if (isImage) {
                      return (
                        <div className="flex flex-col items-center gap-4 w-full">
                          <img
                            src={previewUrl}
                            alt={previewDoc.name}
                            className="max-h-[55vh] max-w-full object-contain rounded-xl shadow border-2 border-white"
                            referrerPolicy="no-referrer"
                          />
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-brand-sky hover:text-brand-sky-dark bg-white border border-slate-200 rounded-lg shadow-sm transition-all"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>নতুন উইন্ডোতে বড় করে দেখুন (View Full Image)</span>
                          </a>
                        </div>
                      );
                    } else if (isPdf) {
                      return (
                        <div className="w-full h-full flex flex-col items-center gap-4">
                          <object
                            data={previewUrl}
                            type="application/pdf"
                            className="w-full h-[55vh] rounded-xl border border-slate-200 bg-white shadow-sm"
                          >
                            <iframe
                              src={previewUrl}
                              className="w-full h-[55vh] rounded-xl border border-slate-200 bg-white shadow-sm"
                              title={previewDoc.name}
                            />
                          </object>
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-brand-sky hover:text-brand-sky-dark bg-white border border-slate-200 rounded-lg shadow-sm transition-all"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>নতুন উইন্ডোতে পিডিএফটি দেখুন (Open PDF in New Window)</span>
                          </a>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">📄</div>
                          <h4 className="text-xs font-bold text-slate-800">অ-ছবি ডকুমেন্ট ফাইল (Non-Image File)</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            এই ফাইলটি সরাসরি ব্রাউজারে রেন্ডার করা যাচ্ছে না। ডাউনলোড করে ফাইলটি প্রিভিউ করুন।
                          </p>
                          <a
                            href={previewUrl}
                            download={previewDoc.fileName}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-black hover:bg-slate-800 shadow transition-all"
                          >
                            ফাইল ডাউনলোড করুন (Download File)
                          </a>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="text-center space-y-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                    <div className="text-3xl">⚠️</div>
                    <h4 className="text-xs font-bold text-slate-800">কোনো ফাইল ডাটা পাওয়া যায়নি</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      এটি একটি ডেমো আবেদনকারী রেকর্ড। শিক্ষার্থীর আপলোড করা রিয়েল ডকুমেন্টে সম্পূর্ণ ডাউনলোডযোগ্য ডাটা থাকবে।
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-slate-400 font-bold font-mono">আপলোড: {previewDoc.uploadedAt}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                  {previewDoc.fileUrl && (
                    <a
                      href={previewDoc.fileUrl}
                      download={previewDoc.fileName}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-5 py-2 text-xs font-black hover:bg-emerald-700 shadow transition-all"
                    >
                      ডাউনলোড (Download)
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
