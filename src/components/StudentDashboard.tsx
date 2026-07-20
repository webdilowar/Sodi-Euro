import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Application, UploadedDocument } from '../types';
import { documentRequirements, serviceOptions } from '../data';
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
  CalendarDays,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  School,
  Check,
  CheckCircle2,
  MapPin,
  GraduationCap,
  DollarSign,
  Coins,
  Briefcase,
  Camera,
  BookOpen,
  Compass,
  Flame,
  RotateCcw,
  Eye,
  Paperclip
} from 'lucide-react';

interface StudentDashboardProps {
  applications: Application[];
  onAddApplication: (app: Application) => void;
  onUpdateApplication: (app: Application) => void;
  activeAppId: string | null;
  setActiveAppId: (id: string | null) => void;
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

const universityCoursesMap: Record<string, { courses: string[]; logoColor: string; tuitionFee: string; location: string }> = {
  'Technical University of Sofia': {
    courses: [
      'BSc in Computer Science (কম্পিউটার সায়েন্স)',
      'BSc in Telecommunications (টেলিকমিউনিকেশন)',
      'BSc in Aeronautical Engineering (অ্যারোনটিক্যাল ইঞ্জিনিয়ারিং)',
      'MSc in Cybersecurity (সাইবারসিকিউরিটি)'
    ],
    logoColor: 'from-blue-500 to-sky-400',
    tuitionFee: '€৩,০০০ - €৩,৫০০ প্রতি বছর',
    location: 'সোফিয়া (Sofia)'
  },
  'Sofia University St. Kliment Ohridski': {
    courses: [
      'BSc in Software Engineering (সফটওয়্যার ইঞ্জিনিয়ারিং)',
      'BSc in Information Systems (ইনফরমেশন সিস্টেমস)',
      'MSc in Artificial Intelligence (আর্টিফিশিয়াল ইন্টেলিজেন্স)',
      'BSc in Business Administration (বিজনেস অ্যাডমিনিস্ট্রেশন)'
    ],
    logoColor: 'from-amber-500 to-amber-300',
    tuitionFee: '€৩,৩০০ - €৩,৮০০ প্রতি বছর',
    location: 'সোফিয়া (Sofia)'
  },
  'Medical University of Sofia': {
    courses: [
      'BSc in Medicine (মেডিসিন/এমবিবিএস)',
      'BSc in Dentistry (ডেন্টিস্ট্রি)',
      'BSc in Pharmacy (ফার্মেসি)',
      'MSc in Public Health (পাবলিক হেলথ)'
    ],
    logoColor: 'from-teal-500 to-emerald-400',
    tuitionFee: '€৪,০০০ - €৮,০০০ প্রতি বছর',
    location: 'সোফিয়া (Sofia)'
  },
  'Varna University of Management': {
    courses: [
      'MSc in International Business (ইন্টারন্যাশনাল বিজনেস)',
      'BSc in International Hospitality Management (হসপিটালিটি)',
      'MBA (গ্লোবাল এমবিএ)',
      'BSc in Software Systems Development (সফটওয়্যার ডেভেলপমেন্ট)'
    ],
    logoColor: 'from-purple-500 to-indigo-400',
    tuitionFee: '€৩,০০০ - €৪,৫০০ প্রতি বছর',
    location: 'ভার্না (Varna)'
  },
  'Technical University of Varna': {
    courses: [
      'MBA (বিজনেস অ্যাডমিনিস্ট্রেশন)',
      'BSc in Marine Engineering (মেরিন ইঞ্জিনিয়ারিং)',
      'BSc in Electrical Engineering (ইলেকট্রিক্যাল ইঞ্জিনিয়ারিং)',
      'MSc in Software Engineering (সফটওয়্যার ইঞ্জিনিয়ারিং)'
    ],
    logoColor: 'from-sky-500 to-blue-400',
    tuitionFee: '€২,৮০০ - €৩,২০০ প্রতি বছর',
    location: 'ভার্না (Varna)'
  }
};

export default function StudentDashboard({
  applications,
  onAddApplication,
  onUpdateApplication,
  activeAppId,
  setActiveAppId
}: StudentDashboardProps) {
  // Navigation inside dashboard
  const [activeTab, setActiveTab] = useState<'tracking' | 'documents' | 'payment' | 'additional-services' | 'messages'>('tracking');
  
  // Login / Track Search states (using Passport Number as Username and Password)
  const [searchQuery, setSearchQuery] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [searchError, setSearchError] = useState('');

  // Live Chat messages state
  const [studentMsgText, setStudentMsgText] = useState('');
  const [studentChatFile, setStudentChatFile] = useState('');
  const [studentChatFileName, setStudentChatFileName] = useState('');

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
  const [selectedServices, setSelectedServices] = useState<string[]>(['admission_processing']);

  // New Step-by-Step wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [selectedApplyUni, setSelectedApplyUni] = useState('');
  const [selectedApplyCourse, setSelectedApplyCourse] = useState('');
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [isEditingUniCourse, setIsEditingUniCourse] = useState(false);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    fullName: '',
    passportNumber: '',
    email: '',
    phone: ''
  });
  const [editProfileError, setEditProfileError] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [selectedInstallmentChoice, setSelectedInstallmentChoice] = useState<'full' | 'inst1' | 'inst2'>('full');
  const [bkashStep, setBkashStep] = useState<'phone' | 'otp' | 'pin' | 'success'>('phone');
  const [bkashPhone, setBkashPhone] = useState('');
  const [bkashOtp, setBkashOtp] = useState('');
  const [bkashPin, setBkashPin] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalStep, setPaymentModalStep] = useState(1);

  // File Upload Simulator state
  const [uploadingDocCategory, setUploadingDocCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentUploadingCategory, setCurrentUploadingCategory] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  // List Verification states
  const [selectedVerifyApp, setSelectedVerifyApp] = useState<Application | null>(null);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Embassy Interview Q&A active index
  const [activePrepIndex, setActivePrepIndex] = useState<number | null>(null);

  // Active Application object
  const activeApp = applications.find(a => a.id === activeAppId);

  // Dynamic step-by-step validation helpers
  const isStep1Valid = (): boolean => {
    if (!formData.fullName.trim() || !formData.passportNumber.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return false;
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    let localPhone = cleanPhone;
    if (cleanPhone.startsWith('+880')) {
      localPhone = cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('880')) {
      localPhone = cleanPhone.slice(3);
    }
    if (!/^01[3-9]\d{8}$/.test(localPhone)) {
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return false;
    }
    return true;
  };

  const isStep2Valid = (): boolean => {
    return isStep1Valid() && !!selectedApplyUni && !!selectedApplyCourse;
  };

  const isStep3Valid = (): boolean => {
    return isStep2Valid() && selectedServices.length > 0;
  };

  const isStepAllowed = (stepNum: number): boolean => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return isStep1Valid();
    if (stepNum === 3) return isStep2Valid();
    if (stepNum === 4) return isStep3Valid();
    return false;
  };

  // Handle Student Login (using Passport Number as both Username and Password)
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchQuery.trim() || !studentPassword.trim()) {
      setSearchError('অনুগ্রহ করে পাসপোর্ট নম্বর এবং পাসওয়ার্ড উভয়ই প্রদান করুন।');
      return;
    }

    if (searchQuery.trim().toUpperCase() !== studentPassword.trim().toUpperCase()) {
      setSearchError('ভুল পাসওয়ার্ড! ড্যাশবোর্ডে প্রবেশের জন্য আপনার পাসপোর্ট নম্বরটি একইসাথে ইউজারনেম এবং পাসওয়ার্ড হিসেবে ব্যবহার করুন।');
      return;
    }

    const found = applications.find(
      a => a.passportNumber.toUpperCase() === searchQuery.trim().toUpperCase()
    );

    if (found) {
      setActiveAppId(found.id);
      setActiveTab('tracking');
      setSearchQuery('');
      setStudentPassword('');
    } else {
      setSearchError('দুঃখিত! এই পাসপোর্ট নম্বর দিয়ে কোনো স্টুডেন্ট প্রোফাইল খুঁজে পাওয়া যায়নি। নিচে "নতুন আবেদন করুন" বাটনে ক্লিক করে ফাইল প্রসেসিং শুরু করুন।');
    }
  };

  // Handle Quick Select (for testing ease)
  const handleQuickSelect = (id: string) => {
    const app = applications.find(a => a.id === id);
    if (app) {
      setSelectedVerifyApp(app);
      setVerifyPassword('');
      setVerifyError('');
    }
  };

  // Submit password verification for student profile selection
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    if (!selectedVerifyApp) return;

    if (verifyPassword.trim().toUpperCase() === selectedVerifyApp.passportNumber.toUpperCase()) {
      setActiveAppId(selectedVerifyApp.id);
      setActiveTab('tracking');
      setSelectedVerifyApp(null);
      setVerifyPassword('');
    } else {
      setVerifyError('ভুল পাসওয়ার্ড! ড্যাশবোর্ডে প্রবেশের জন্য এই শিক্ষার্থীর সঠিক পাসপোর্ট নম্বরটি পাসওয়ার্ড হিসেবে টাইপ করুন।');
    }
  };

  // Handle New Application Submission
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { fullName, passportNumber, email, phone } = formData;
    if (!fullName || !passportNumber || !email || !phone) {
      setFormError('অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    let localPhone = cleanPhone;
    if (cleanPhone.startsWith('+880')) {
      localPhone = cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('880')) {
      localPhone = cleanPhone.slice(3);
    }

    if (!/^01[3-9]\d{8}$/.test(localPhone)) {
      setFormError('দয়া করে একটি সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('দয়া করে একটি সঠিক ইমেল অ্যাড্রেস প্রদান করুন (যেমন: example@gmail.com)');
      return;
    }

    if (!selectedApplyUni || !selectedApplyCourse) {
      setFormError('অনুগ্রহ করে "ইউনিভার্সিটি ও কোর্স" ধাপে গিয়ে একটি বিশ্ববিদ্যালয় এবং প্রোগ্রাম সিলেক্ট করুন।');
      return;
    }

    // Check if passport already exists
    const exists = applications.find(a => a.passportNumber.toUpperCase() === passportNumber.toUpperCase());
    if (exists) {
      setFormError('এই পাসপোর্ট নম্বর দিয়ে ইতিমধ্যে একটি আবেদন করা হয়েছে!');
      return;
    }

    const desiredCourse = `${selectedApplyCourse} (${selectedApplyUni})`;

    // Calculate Dynamic Price based on services
    const calculatedTotal = serviceOptions
      .filter(s => s.isMandatory || selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);

    // Prepare 2 equal split installments (50% each)
    const inst1Amt = Math.round(calculatedTotal / 2);
    const inst2Amt = calculatedTotal - inst1Amt;

    const initialInstallments = [
      { installmentNumber: 1, amount: inst1Amt, status: 'Unpaid' as const },
      { installmentNumber: 2, amount: inst2Amt, status: 'Unpaid' as const }
    ];

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
      paymentAmount: calculatedTotal,
      totalAmount: calculatedTotal,
      paidAmount: 0,
      selectedServices: selectedServices,
      installments: initialInstallments,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      documents: [],
      notificationHistory: [
        {
          id: `not-${Math.random()}`,
          title: 'আবেদন সফলভাবে তৈরি হয়েছে',
          body: `প্রিয় ${fullName}, বুলগেরিয়া স্টুডেন্ট ভিসা আবেদনের পোর্টাল অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আইডি: ${newId}। আপনার নির্বাচিত সার্ভিস ফি: ৳${calculatedTotal.toLocaleString()} BDT। আপনি এটি ড্যাশবোর্ড থেকে এককালীন বা দুই কিস্তিতে (Split Payment) পরিশোধ করতে পারবেন।`,
          type: 'sms',
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          recipient: phone
        }
      ]
    };

    onAddApplication(newApp);
    setActiveAppId(newId);
    setShowApplyForm(false);
    // Reset wizard
    setWizardStep(1);
    setMaxStepReached(1);
    setSelectedApplyUni('Technical University of Sofia');
    setSelectedApplyCourse('BSc in Computer Science (কম্পিউটার সায়েন্স)');
    setIsUniDropdownOpen(false);
    setFormData({
      fullName: '',
      passportNumber: '',
      email: '',
      phone: '',
      desiredCourse: 'BSc in Computer Science (Technical University of Sofia)'
    });
    setActiveTab('documents'); // Direct them to document upload
  };

  // Real File Upload Handlers
  const triggerFileUpload = (category: string) => {
    setCurrentUploadingCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeApp) return;

    setUploadingDocCategory(currentUploadingCategory);
    let progress = 10;
    setUploadProgress(progress);

    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);

        const matchedReq = documentRequirements.find(r => r.id === currentUploadingCategory);
        const newDoc: UploadedDocument = {
          id: `doc-${Date.now()}`,
          name: matchedReq?.title.split('(')[0].trim() || 'Uploaded Document',
          category: currentUploadingCategory,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          status: 'Pending',
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        // If file is an image and under 1MB, let's keep a dataurl reference
        if (file.size < 1024 * 1024) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newDoc.fileUrl = reader.result as string;
            const filteredDocs = activeApp.documents.filter(d => d.category !== currentUploadingCategory);
            const updatedApp: Application = {
              ...activeApp,
              documents: [...filteredDocs, newDoc]
            };
            onUpdateApplication(updatedApp);
          };
          reader.readAsDataURL(file);
        } else {
          const filteredDocs = activeApp.documents.filter(d => d.category !== currentUploadingCategory);
          const updatedApp: Application = {
            ...activeApp,
            documents: [...filteredDocs, newDoc]
          };
          onUpdateApplication(updatedApp);
        }

        setTimeout(() => {
          setUploadingDocCategory('');
          setUploadProgress(0);
        }, 600);
      } else {
        setUploadProgress(progress);
      }
    }, 150);
  };

  const handleFileUpload = (category: string) => {
    triggerFileUpload(category);
  };

  // Simulating Payment Gateways
  const handleProcessPayment = () => {
    if (!activeApp) return;
    setIsProcessingPayment(true);

    const totalAmt = activeApp.totalAmount || activeApp.paymentAmount || 15000;
    const currentPaid = activeApp.paidAmount || (activeApp.paymentStatus === 'Paid' ? totalAmt : 0);
    
    let inst1Amt = Math.round(totalAmt / 2);
    let inst2Amt = totalAmt - inst1Amt;
    if (activeApp.installments && activeApp.installments.length >= 2) {
      inst1Amt = activeApp.installments[0].amount;
      inst2Amt = activeApp.installments[1].amount;
    }

    let payingAmount = 0;
    let nextPaidAmount = currentPaid;
    let nextStatus: 'Unpaid' | 'Partially Paid' | 'Paid' = 'Unpaid';
    let paymentOptionLabel = '';

    const nextInstallments = activeApp.installments ? [...activeApp.installments] : [
      { installmentNumber: 1, amount: inst1Amt, status: 'Unpaid' as const },
      { installmentNumber: 2, amount: inst2Amt, status: 'Unpaid' as const }
    ];

    if (selectedInstallmentChoice === 'full') {
      payingAmount = totalAmt;
      nextPaidAmount = totalAmt;
      nextStatus = 'Paid';
      paymentOptionLabel = 'এককালীন সম্পূর্ণ ফি (Full Payment)';
      nextInstallments[0].status = 'Paid';
      nextInstallments[1].status = 'Paid';
    } else if (selectedInstallmentChoice === 'inst1') {
      payingAmount = inst1Amt;
      nextPaidAmount = inst1Amt;
      nextStatus = 'Partially Paid';
      paymentOptionLabel = '১ম কিস্তি (1st Installment)';
      nextInstallments[0].status = 'Paid';
    } else if (selectedInstallmentChoice === 'inst2') {
      payingAmount = inst2Amt;
      nextPaidAmount = totalAmt;
      nextStatus = 'Paid';
      paymentOptionLabel = '২য় কিস্তি (2nd Installment)';
      nextInstallments[1].status = 'Paid';
    }

    setTimeout(() => {
      const txnId = paymentMethod === 'card' 
        ? `CARD${Math.floor(100000000 + Math.random() * 900000000)}`
        : `${paymentMethod === 'bkash' ? 'BKX' : 'NGD'}${Math.floor(100000000 + Math.random() * 900000000)}`;

      const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const updatedHistory = [
        ...activeApp.notificationHistory,
        {
          id: `not-pay-${Date.now()}`,
          title: `পেমেন্ট সফল হয়েছে - ${paymentOptionLabel}`,
          body: `প্রিয় ${activeApp.fullName}, আপনার ${paymentOptionLabel} বাবদ ৳${payingAmount.toLocaleString()} BDT সফলভাবে পরিশোধ করা হয়েছে। ট্রানজেকশন আইডি: ${txnId}।`,
          type: 'email' as const,
          sentAt: currentTimestamp,
          recipient: activeApp.email
        },
        {
          id: `not-pay-sms-${Date.now()}`,
          title: `ফি প্রাপ্তি নিশ্চিতকরণ (${paymentOptionLabel})`,
          body: `আপনার বুলগেরিয়া স্টুডেন্ট ভিসা আবেদনের ${paymentOptionLabel} বাবদ ৳${payingAmount.toLocaleString()} BDT পরিশোধিত হয়েছে। ট্রানজেকশন আইডি: ${txnId}`,
          type: 'sms' as const,
          sentAt: currentTimestamp,
          recipient: activeApp.phone
        }
      ];

      // Update installments with exact details
      const payMethodLabel = paymentMethod === 'card' ? 'Visa Card' : (paymentMethod === 'bkash' ? 'bKash' : 'Nagad');
      if (selectedInstallmentChoice === 'full') {
        nextInstallments[0].paymentMethod = payMethodLabel;
        nextInstallments[0].paymentTxnId = txnId;
        nextInstallments[0].paymentDate = currentTimestamp;
        nextInstallments[1].paymentMethod = payMethodLabel;
        nextInstallments[1].paymentTxnId = txnId;
        nextInstallments[1].paymentDate = currentTimestamp;
      } else if (selectedInstallmentChoice === 'inst1') {
        nextInstallments[0].paymentMethod = payMethodLabel;
        nextInstallments[0].paymentTxnId = txnId;
        nextInstallments[0].paymentDate = currentTimestamp;
      } else if (selectedInstallmentChoice === 'inst2') {
        nextInstallments[1].paymentMethod = payMethodLabel;
        nextInstallments[1].paymentTxnId = txnId;
        nextInstallments[1].paymentDate = currentTimestamp;
      }

      const updatedApp: Application = {
        ...activeApp,
        paymentStatus: nextStatus,
        paymentMethod: payMethodLabel,
        paymentTxnId: txnId,
        paymentDate: currentTimestamp,
        paidAmount: nextPaidAmount,
        totalAmount: totalAmt,
        installments: nextInstallments,
        notificationHistory: updatedHistory
      };

      onUpdateApplication(updatedApp);
      setIsProcessingPayment(false);
      setPaymentModalStep(4);
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

  const calculatedTotal = serviceOptions
    .filter(s => s.isMandatory || selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="py-6 space-y-8" id="student-portal-root">
      {/* Search / Track Area if not logged in */}
      {!activeApp ? (
        <div className="space-y-8">
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
            <form onSubmit={handleStudentLogin} className="space-y-4" id="track-form">
              <div className="space-y-3.5">
                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">ইউজারনেম (পাসপোর্ট নম্বর):</label>
                  <div className="relative">
                    <input
                      id="track-search-input"
                      required
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="যেমন: EF0192837"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড (পাসপোর্ট নম্বর):</label>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      placeholder="যেমন: EF0192837"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold font-mono"
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {searchError && (
                <div className="text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 py-3 text-xs font-black text-white hover:bg-slate-800 transition-all border-b border-brand-gold"
                >
                  ট্র্যাক করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(!showApplyForm)}
                  className="w-full rounded-xl border-2 border-brand-sky py-3 text-xs font-black text-brand-sky hover:bg-brand-sky/5 transition-all"
                >
                  {showApplyForm ? "আবেদন ফর্ম বন্ধ করুন" : "নতুন ফাইল ওপেন করুন"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* New Application Form with folding effect */}
        <AnimatePresence>
          {showApplyForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, rotateX: -20, transformOrigin: "top" }}
            animate={{ opacity: 1, height: "auto", rotateX: 0 }}
            exit={{ opacity: 0, height: 0, rotateX: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="rounded-2xl border-2 border-brand-gold/15 bg-white p-5 md:p-6 shadow-xl space-y-6 overflow-visible perspective-1000" 
            id="new-apply-form-block"
          >
            {/* Wizard Header & Progress Bar */}
            <div className="border-b border-slate-100 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-slate-800 text-base md:text-lg flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-brand-gold animate-pulse" />
                    <span>বুলগেরিয়া স্টুডেন্ট ভিসা ফাইলিং পোর্টাল</span>
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-500">সহজ এবং স্বয়ংক্রিয় ধাপে আপনার ফাইল ওপেন করার প্রসেস সম্পন্ন করুন।</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-brand-sky-light text-brand-sky border border-brand-sky/25 rounded-lg shrink-0">
                  ধাপ {wizardStep} / ৪
                </span>
              </div>

              {/* Step Indicators */}
              <div className="relative pt-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-brand-sky to-brand-gold -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${((wizardStep - 1) / 3) * 100}%` }}
                ></div>
                
                <div className="relative flex justify-between z-10">
                  {[
                    { step: 1, label: "ব্যক্তিগত তথ্য" },
                    { step: 2, label: "ইউনিভার্সিটি ও কোর্স" },
                    { step: 3, label: "সার্ভিসসমূহ" },
                    { step: 4, label: "রিভিউ ও সাবমিট" }
                  ].map((s) => {
                    const isActive = wizardStep === s.step;
                    const isCompleted = wizardStep > s.step;
                    const isAllowed = isStepAllowed(s.step);
                    return (
                      <div key={s.step} className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isAllowed) {
                              setWizardStep(s.step);
                            }
                          }}
                          disabled={!isAllowed}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-black transition-all ${
                            isActive 
                              ? "bg-brand-sky border-brand-sky text-white shadow-md shadow-brand-sky/20 scale-110 animate-pulse" 
                              : isCompleted 
                                ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:bg-emerald-600" 
                                : isAllowed
                                  ? "bg-white border-brand-sky/60 text-brand-sky cursor-pointer hover:bg-brand-sky/5"
                                  : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                          title={`${s.label} ধাপে যান`}
                        >
                          {isCompleted ? <span className="text-[10px]">✔</span> : s.step}
                        </button>
                        <span className={`hidden md:block text-[9px] font-bold mt-1.5 ${
                          isActive ? "text-brand-sky" : isCompleted ? "text-emerald-600" : isAllowed ? "text-brand-sky/80" : "text-slate-400"
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


                {/* Form Steps Container */}
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {/* STEP 1: Personal Information */}
                    {wizardStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div className="bg-brand-sky-light/10 p-3 rounded-xl border border-brand-sky/10 flex items-center space-x-2.5 mb-4">
                          <User className="h-4 w-4 text-brand-sky shrink-0" />
                          <p className="text-[11px] font-bold text-brand-sky-dark leading-tight">
                            আপনার পাসপোর্ট এবং যোগাযোগের সঠিক তথ্য দিন। এই তথ্যের ভিত্তিতে আপনার ড্যাশবোর্ড অ্যাকাউন্ট তৈরি হবে।
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">পূর্ণ নাম (পাসপোর্ট অনুযায়ী):</label>
                            <input
                              required
                              type="text"
                              placeholder="যেমন: MD KAMRUL HASAN"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">পাসপোর্ট নম্বর:</label>
                            <input
                              required
                              type="text"
                              placeholder="যেমন: EF0129384"
                              value={formData.passportNumber}
                              onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-brand-sky focus:outline-none uppercase"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">ইমেইল ঠিকানা:</label>
                            <input
                              required
                              type="email"
                              placeholder="যেমন: kamrul@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">মোবাইল নম্বর (SMS নোটিফিকেশনের জন্য):</label>
                            <input
                              required
                              type="tel"
                              placeholder="যেমন: 01712345678"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                            />
                          </div>
                        </div>

                        {formError && (
                          <div className="text-[11px] text-red-500 font-bold bg-red-50 p-2.5 rounded border border-red-100">
                            {formError}
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!formData.fullName.trim() || !formData.passportNumber.trim() || !formData.email.trim() || !formData.phone.trim()) {
                                setFormError('অনুগ্রহ করে ব্যক্তিগত তথ্যের সব অপশন সঠিকভাবে পূরণ করুন।');
                                return;
                              }

                              const cleanPhone = formData.phone.replace(/[\s-]/g, '');
                              let localPhone = cleanPhone;
                              if (cleanPhone.startsWith('+880')) {
                                localPhone = cleanPhone.slice(3);
                              } else if (cleanPhone.startsWith('880')) {
                                localPhone = cleanPhone.slice(3);
                              }

                              if (!/^01[3-9]\d{8}$/.test(localPhone)) {
                                setFormError('দয়া করে একটি সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
                                return;
                              }

                              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                                setFormError('দয়া করে একটি সঠিক ইমেল অ্যাড্রেস প্রদান করুন (যেমন: example@gmail.com)');
                                return;
                              }

                              setFormError('');
                              setWizardStep(2);
                              setMaxStepReached(prev => Math.max(prev, 2));
                            }}
                            className="inline-flex items-center space-x-1 rounded-xl bg-brand-sky px-5 py-2.5 text-xs font-black text-white hover:bg-brand-sky-dark transition-colors"
                          >
                            <span>পরবর্তী ধাপ</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: University & Course Selection */}
                    {wizardStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5 text-left"
                      >
                        {/* Custom University Dropdown Selector */}
                        <div className="relative" id="university-dropdown-wrapper">
                          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                            <School className="h-4 w-4 text-brand-sky" />
                            <span>১. বুলগেরিয়ার বিশ্ববিদ্যালয় পছন্দ করুন (Select University)</span>
                          </label>
                          
                          <button
                            type="button"
                            onClick={() => setIsUniDropdownOpen(!isUniDropdownOpen)}
                            className="w-full flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-3 sm:p-3.5 text-left shadow-sm hover:border-brand-sky/60 hover:bg-slate-50/30 transition-all focus:outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky-light/20 min-w-0"
                            id="university-select-trigger"
                          >
                            {selectedApplyUni ? (
                              <div className="flex items-start gap-2.5 max-w-[85%] min-w-0 flex-1">
                                <div className={`h-3 w-3 rounded-full bg-gradient-to-tr ${universityCoursesMap[selectedApplyUni].logoColor} shrink-0 mt-1`}></div>
                                <div className="text-left min-w-0 flex-1">
                                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 leading-snug break-words">{selectedApplyUni}</h4>
                                  <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-1.5 flex flex-wrap gap-x-2 gap-y-1 items-center">
                                    <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-slate-300" /> {universityCoursesMap[selectedApplyUni].location}</span>
                                    <span className="text-slate-200">|</span>
                                    <span className="flex items-center gap-0.5 text-brand-gold-dark"><Coins className="h-2.5 w-2.5 text-brand-gold" /> {universityCoursesMap[selectedApplyUni].tuitionFee}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-brand-sky animate-ping"></span>
                                <span className="text-xs font-black text-brand-sky">বিশ্ববিদ্যালয় সিলেক্ট করুন</span>
                              </div>
                            )}
                            <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 shrink-0 ml-1 ${isUniDropdownOpen ? 'rotate-180 text-brand-sky' : ''}`} />
                          </button>

                          {/* Dropdown Menu List with AnimatePresence */}
                          <AnimatePresence>
                            {isUniDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute left-0 right-0 z-50 mt-1 max-h-60 sm:max-h-80 overflow-y-auto rounded-xl border-2 border-slate-200 bg-white shadow-2xl divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200"
                                id="university-dropdown-list"
                              >
                                {Object.keys(universityCoursesMap).map((uniName) => {
                                  const uni = universityCoursesMap[uniName];
                                  const isSelected = selectedApplyUni === uniName;
                                  return (
                                    <div
                                      key={uniName}
                                      onClick={() => {
                                        setSelectedApplyUni(uniName);
                                        setSelectedApplyCourse(uni.courses[0]);
                                        setIsUniDropdownOpen(false);
                                      }}
                                      className={`flex items-start justify-between p-3 sm:p-4 cursor-pointer transition-colors ${
                                        isSelected 
                                          ? 'bg-brand-sky-light/10 text-brand-sky font-extrabold' 
                                          : 'hover:bg-slate-50/75 text-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2.5 text-left flex-1 min-w-0">
                                        <div className={`h-3 w-3 rounded-full bg-gradient-to-tr ${uni.logoColor} shrink-0 mt-1`} />
                                        <div className="min-w-0 flex-1">
                                          <h5 className="text-[11px] sm:text-xs font-bold text-slate-800 leading-snug break-words">
                                            {uniName}
                                          </h5>
                                          <div className="text-[9px] text-slate-400 font-bold mt-1 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                                            <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-slate-300" /> {uni.location}</span>
                                            <span className="text-slate-200">·</span>
                                            <span className="flex items-center gap-0.5 text-brand-gold-dark"><Coins className="h-2.5 w-2.5 text-brand-gold" /> {uni.tuitionFee}</span>
                                          </div>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-gold text-white text-[10px] font-black shrink-0 ml-1.5 mt-0.5">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Animated course selector that appears dynamically with a elegant FADE-UP spring animation */}
                        {selectedApplyUni && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 mt-2"
                          >
                            <div className="flex items-center space-x-1.5">
                              <GraduationCap className="h-4 w-4 text-brand-gold animate-bounce" />
                              <div>
                                <label className="text-xs font-black text-slate-800 block">
                                  ২. প্রোগ্রাম ও কোর্স সিলেক্ট করুন (Choose Program & Course)
                                </label>
                                <p className="text-[9px] text-slate-400">নির্বাচিত বিশ্ববিদ্যালয়টির জন্য সচল কোর্সসমূহের তালিকা।</p>
                              </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 mt-1">
                              {universityCoursesMap[selectedApplyUni].courses.map((course) => {
                                const isCourseSelected = selectedApplyCourse === course;
                                return (
                                  <div
                                    key={course}
                                    onClick={() => setSelectedApplyCourse(course)}
                                    className={`p-3 rounded-lg border-2 text-xs font-bold cursor-pointer text-left transition-all flex items-center justify-between ${
                                      isCourseSelected
                                        ? 'bg-white border-brand-sky text-brand-sky-dark shadow-md scale-[1.01]'
                                        : 'bg-white/60 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white'
                                    }`}
                                  >
                                    <span className="leading-snug">{course}</span>
                                    {isCourseSelected && (
                                      <CheckCircle2 className="h-4 w-4 text-brand-sky shrink-0 ml-2" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}

                        <div className="flex justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => setWizardStep(1)}
                            className="inline-flex items-center space-x-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>পূর্ববর্তী</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedApplyUni || !selectedApplyCourse) {
                                setFormError('অনুগ্রহ করে একটি বিশ্ববিদ্যালয় ও কোর্স সিলেক্ট করুন।');
                                return;
                              }
                              setFormError('');
                              setWizardStep(3);
                              setMaxStepReached(prev => Math.max(prev, 3));
                            }}
                            className="inline-flex items-center space-x-1 rounded-xl bg-brand-sky px-5 py-2.5 text-xs font-black text-white hover:bg-brand-sky-dark transition-colors"
                          >
                            <span>পরবর্তী ধাপ</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Extra Services Selection */}
                    {wizardStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-brand-gold animate-pulse" />
                            <span>প্রয়োজনীয় সার্ভিসসমূহ নির্বাচন করুন (Select Processing Services)</span>
                          </label>
                          <p className="text-[10px] text-slate-500">আপনার ফাইল ওপেন করতে যে সার্ভিসগুলো প্রয়োজন সেগুলো টিক দিন। মোট ফি স্বয়ংক্রিয়ভাবে হিসাব হবে।</p>
                        </div>

                        <div className="space-y-2.5">
                          {serviceOptions.map((service) => {
                            const isChecked = service.isMandatory || selectedServices.includes(service.id);
                            return (
                              <div 
                                key={service.id} 
                                onClick={() => {
                                  if (service.isMandatory) return;
                                  if (selectedServices.includes(service.id)) {
                                    setSelectedServices(selectedServices.filter(id => id !== service.id));
                                  } else {
                                    setSelectedServices([...selectedServices, service.id]);
                                  }
                                }}
                                className={`flex items-start justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  isChecked 
                                    ? 'bg-white border-brand-sky shadow-sm' 
                                    : 'bg-white/60 border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                <div className="flex items-start space-x-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={service.isMandatory}
                                    readOnly
                                    className="mt-1 h-3.5 w-3.5 rounded text-brand-sky focus:ring-brand-sky border-slate-300"
                                  />
                                  <div className="text-left">
                                    <h5 className="text-xs font-bold text-slate-800 leading-tight">
                                      {service.name}
                                    </h5>
                                    <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">{service.description}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <span className="text-xs font-extrabold text-brand-sky font-mono">
                                    ৳{service.price.toLocaleString()}
                                  </span>
                                  {service.isMandatory && (
                                    <span className="block text-[8px] text-amber-600 font-extrabold bg-amber-50 px-1 rounded border border-amber-100 mt-0.5 text-center">আবশ্যিক</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Running Total Preview */}
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-3.5 px-1">
                          <span className="text-xs font-bold text-slate-700">নির্বাচিত সার্ভিস অনুযায়ী মোট প্রসেসিং ফি:</span>
                          <motion.div 
                            key={calculatedTotal}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-black text-slate-950 bg-brand-gold/15 px-3 py-1.5 rounded-lg border border-brand-gold/35 font-mono flex items-center space-x-1"
                          >
                            <span>৳{calculatedTotal.toLocaleString()} BDT</span>
                          </motion.div>
                        </div>

                        <div className="flex justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => setWizardStep(2)}
                            className="inline-flex items-center space-x-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>পূর্ববর্তী</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setWizardStep(4);
                              setMaxStepReached(prev => Math.max(prev, 4));
                            }}
                            className="inline-flex items-center space-x-1 rounded-xl bg-brand-sky px-5 py-2.5 text-xs font-black text-white hover:bg-brand-sky-dark transition-colors"
                          >
                            <span>রিভিউ ও সাবমিট</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 4: Review and Final Submission */}
                    {wizardStep === 4 && (
                      <motion.div
                        key="step-4"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4 text-left"
                      >
                        <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-100 flex items-center space-x-2.5">
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <h4 className="text-xs font-extrabold">সবকিছু ঠিক আছে! অনুগ্রহ করে তথ্যগুলো মিলিয়ে নিন</h4>
                            <p className="text-[10px] text-emerald-700">নিচের তথ্যগুলো সঠিক থাকলে "ফাইল ওপেন করুন" বাটনে ক্লিক করে অ্যাকাউন্ট চালু করুন।</p>
                          </div>
                        </div>

                        {/* Bento Grid Summary */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Student Details Info */}
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                            <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-400" />
                              <span>ব্যক্তিগত তথ্য</span>
                            </h4>
                            <div className="space-y-1 text-xs text-slate-700 font-semibold">
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">নাম:</span>
                                <span>{formData.fullName}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">পাসপোর্ট:</span>
                                <span className="uppercase font-mono">{formData.passportNumber}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">মোবাইল:</span>
                                <span>{formData.phone}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">ইমেইল:</span>
                                <span className="truncate max-w-[150px]" title={formData.email}>{formData.email}</span>
                              </p>
                            </div>
                          </div>

                          {/* Selected University & Course */}
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                            <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <GraduationCap className="h-3 w-3 text-slate-400" />
                              <span>শিক্ষাপ্রতিষ্ঠান ও কোর্স</span>
                            </h4>
                            <div className="space-y-1 text-xs text-slate-700 font-semibold">
                              <p className="text-slate-800 font-bold leading-tight">{selectedApplyUni || 'বিশ্ববিদ্যালয় সিলেক্ট করা হয়নি'}</p>
                              <p className="text-slate-500 font-medium text-[11px] leading-snug">{selectedApplyCourse || 'কোর্স সিলেক্ট করা হয়নি'}</p>
                              <p className="text-brand-gold-dark text-[10px] pt-1.5 border-t border-slate-200/50 flex items-center">
                                <Coins className="h-3 w-3 mr-1" />
                                টিউশন ফি: {selectedApplyUni ? (universityCoursesMap[selectedApplyUni]?.tuitionFee || 'N/A') : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Selected Services Breakdown */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                          <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            <span>নির্বাচিত সার্ভিস ও খরচের বিবরণ</span>
                          </h4>
                          <div className="space-y-1.5">
                            {serviceOptions
                              .filter(s => s.isMandatory || selectedServices.includes(s.id))
                              .map(s => (
                                <div key={s.id} className="flex justify-between text-xs font-semibold text-slate-700">
                                  <span className="text-slate-600 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sky"></span>
                                    {s.nameEn}
                                  </span>
                                  <span className="font-mono text-slate-800">৳{s.price.toLocaleString()}</span>
                                </div>
                              ))}
                          </div>
                          
                          <div className="border-t border-slate-200 pt-2.5 mt-2.5 flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800">সর্বমোট প্রসেসিং ফি (Grand Total):</span>
                            <span className="text-xs font-black bg-brand-gold text-slate-950 px-3 py-1 rounded-lg border border-brand-gold-dark font-mono shadow-sm">
                              ৳{calculatedTotal.toLocaleString()} BDT
                            </span>
                          </div>
                        </div>

                        {formError && (
                          <div className="text-[11px] text-red-500 font-bold bg-red-50 p-2.5 rounded border border-red-100">
                            {formError}
                          </div>
                        )}

                        <div className="flex justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => setWizardStep(3)}
                            className="inline-flex items-center space-x-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>পূর্ববর্তী</span>
                          </button>
                          
                          <button
                            type="button"
                            id="submit-registration-btn"
                            onClick={handleApplySubmit}
                            className="inline-flex items-center justify-center space-x-1 rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold px-6 py-2.5 text-xs font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-brand-sky/20"
                          >
                            <span>ফাইল ওপেন করুন ও পোর্টাল চালু করুন</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
            <button
              id="tab-additional-services"
              onClick={() => setActiveTab('additional-services')}
              className={`border-b-2 px-4 sm:px-6 py-3 text-xs font-bold transition-all shrink-0 snap-start ${
                activeTab === 'additional-services'
                  ? 'border-brand-sky text-brand-sky'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>অতিরিক্ত সেবা সমূহ (Services)</span>
            </button>
            <button
              id="tab-messages"
              onClick={() => setActiveTab('messages')}
              className={`border-b-2 px-4 sm:px-6 py-3 text-xs font-bold transition-all shrink-0 snap-start relative ${
                activeTab === 'messages'
                  ? 'border-brand-sky text-brand-sky'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>অ্যাডমিনের সাথে চ্যাট (Support Chat)</span>
              {(() => {
                const unreadCount = activeApp.messages?.filter(m => m.sender === 'admin' && !m.read).length || 0;
                return unreadCount > 0 ? (
                  <span className="absolute top-1.5 right-1.5 rounded-full bg-rose-600 text-white h-4 w-4 flex items-center justify-center text-[8px] font-black animate-bounce shadow-sm">
                    {unreadCount}
                  </span>
                ) : null;
              })()}
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
                {/* 1. Interactive Student Profile Photo Card */}
                <div className="rounded-2xl border-2 border-brand-gold/15 bg-white p-5 shadow-md text-center space-y-4 relative overflow-hidden" id="student-interactive-profile-card">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-sky via-brand-gold to-brand-sky-dark"></div>
                  
                  {/* Photo container */}
                  <div className="relative w-28 h-28 mx-auto group">
                    <div className="w-full h-full rounded-full border-4 border-slate-100 overflow-hidden shadow-md bg-slate-50 flex items-center justify-center">
                      {activeApp.profilePhoto ? (
                        <img 
                          src={activeApp.profilePhoto} 
                          alt={activeApp.fullName} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-slate-300 flex flex-col items-center">
                          <User className="h-12 w-12 text-slate-300" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">NO PHOTO</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Camera Upload trigger */}
                    <label 
                      htmlFor="profile-photo-upload-input" 
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-brand-sky to-brand-sky-dark text-white p-2 rounded-full shadow-lg border border-white cursor-pointer hover:scale-110 active:scale-95 transition-all"
                      title="ছবি আপলোড করুন"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input 
                      type="file" 
                      id="profile-photo-upload-input" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            const updatedApp: Application = {
                              ...activeApp,
                              profilePhoto: reader.result
                            };
                            onUpdateApplication(updatedApp);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden" 
                    />
                  </div>

                  {/* Student Details / Editing Toggle */}
                  {!isEditingProfile ? (
                    <div className="space-y-4">
                      {/* Student Details */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-800 flex items-center justify-center gap-1">
                          {activeApp.fullName}
                          <Sparkles className="h-3.5 w-3.5 text-brand-gold shrink-0 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">পাসপোর্ট: {activeApp.passportNumber}</p>
                        <p className="text-[10px] text-slate-500 font-bold">ফোন: {activeApp.phone}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate max-w-[200px] mx-auto" title={activeApp.email}>ইমেইল: {activeApp.email}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-sky-light/50 border border-brand-sky/15 text-[10px] text-brand-sky-dark font-extrabold mt-1.5">
                          <Compass className="h-3 w-3" /> Bulgaria Student Portal
                        </div>
                      </div>

                      {/* University / Course Meta */}
                      <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-3 text-left space-y-1 text-[11px] leading-relaxed">
                        <p className="text-slate-500"><span className="font-bold text-slate-700">নির্বাচিত বিশ্ববিদ্যালয়:</span> {activeApp.desiredCourse.split(' (')[1]?.replace(')', '') || 'বুলগেরিয়া বিশ্ববিদ্যালয়'}</p>
                        <p className="text-slate-500 line-clamp-1"><span className="font-bold text-slate-700">কোর্স:</span> {activeApp.desiredCourse.split(' (')[0]}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditProfileData({
                            fullName: activeApp.fullName,
                            passportNumber: activeApp.passportNumber,
                            email: activeApp.email,
                            phone: activeApp.phone
                          });
                          setEditProfileError('');
                          setIsEditingProfile(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors mt-2"
                      >
                        <span>প্রোফাইল সংশোধন করুন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-left border-t border-slate-100 pt-3" id="profile-edit-form">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">পূর্ণ নাম (Full Name):</label>
                        <input
                          type="text"
                          value={editProfileData.fullName}
                          onChange={(e) => setEditProfileData({ ...editProfileData, fullName: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">পাসপোর্ট নম্বর (Passport Number):</label>
                        <input
                          type="text"
                          value={editProfileData.passportNumber}
                          onChange={(e) => setEditProfileData({ ...editProfileData, passportNumber: e.target.value.toUpperCase() })}
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:border-brand-sky focus:outline-none uppercase font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">মোবাইল নম্বর (Phone Number):</label>
                        <input
                          type="tel"
                          value={editProfileData.phone}
                          onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">ইমেল ঠিকানা (Email Address):</label>
                        <input
                          type="email"
                          value={editProfileData.email}
                          onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                        />
                      </div>

                      {editProfileError && (
                        <p className="text-[10px] font-black text-brand-red bg-rose-50 border border-rose-100 p-2 rounded-lg leading-snug">
                          {editProfileError}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            // Validation checks
                            if (!editProfileData.fullName.trim() || !editProfileData.passportNumber.trim() || !editProfileData.email.trim() || !editProfileData.phone.trim()) {
                              setEditProfileError('অনুগ্রহ করে প্রোফাইলের সব তথ্য সঠিকভাবে পূরণ করুন।');
                              return;
                            }

                            const cleanPhone = editProfileData.phone.replace(/[\s-]/g, '');
                            let localPhone = cleanPhone;
                            if (cleanPhone.startsWith('+880')) {
                              localPhone = cleanPhone.slice(4);
                            } else if (cleanPhone.startsWith('880')) {
                              localPhone = cleanPhone.slice(3);
                            }

                            if (!/^01[3-9]\d{8}$/.test(localPhone)) {
                              setEditProfileError('দয়া করে একটি সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
                              return;
                            }

                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editProfileData.email.trim())) {
                              setEditProfileError('দয়া করে একটি সঠিক ইমেল অ্যাড্রেস প্রদান করুন (যেমন: example@gmail.com)');
                              return;
                            }

                            setEditProfileError('');
                            
                            // Save profile changes to database (Firestore)
                            const updatedApp: Application = {
                              ...activeApp,
                              fullName: editProfileData.fullName.trim(),
                              passportNumber: editProfileData.passportNumber.trim().toUpperCase(),
                              phone: editProfileData.phone.trim(),
                              email: editProfileData.email.trim()
                            };
                            onUpdateApplication(updatedApp);
                            setIsEditingProfile(false);
                          }}
                          className="flex-grow rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2 text-xs font-black text-center transition-all border-b border-emerald-700/50 shadow-sm"
                        >
                          সংরক্ষণ করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 text-xs font-bold text-center transition-all"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Progress Metric and Bulgaria Intake Countdown */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" id="progress-intake-countdown-card">
                  {/* Progress segment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">আবেদনের অগ্রগতি (Processing Progress)</span>
                      <span className="font-black text-brand-sky">
                        {(() => {
                          switch (activeApp.status) {
                            case 'Submitted': return '25%';
                            case 'Document Verification': return '50%';
                            case 'Embassy Processing': return '75%';
                            case 'Visa Issued': return '100%';
                            case 'Rejected': return '15%';
                            default: return '20%';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: (() => {
                            switch (activeApp.status) {
                              case 'Submitted': return '25%';
                              case 'Document Verification': return '50%';
                              case 'Embassy Processing': return '75%';
                              case 'Visa Issued': return '100%';
                              case 'Rejected': return '15%';
                              default: return '20%';
                            }
                          })()
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-brand-sky via-brand-sky-dark to-brand-gold"
                      />
                    </div>
                  </div>

                  {/* Countdown segment */}
                  <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 bg-amber-50 text-brand-gold-dark rounded-xl border border-amber-100/50 shrink-0">
                        <Flame className="h-4.5 w-4.5 animate-bounce" />
                      </span>
                      <div className="text-left">
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">বুলগেরিয়া অক্টোবর ২০২৬ ইনটেক</h4>
                        <p className="text-[9px] text-slate-400 font-bold">Sofia / Varna Classes Start</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg border border-brand-gold border-b-2">
                        {(() => {
                          const targetDate = new Date('2026-10-01T00:00:00');
                          const currentDate = new Date('2026-07-17T15:46:53-07:00');
                          const diffTime = targetDate.getTime() - currentDate.getTime();
                          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return daysLeft > 0 ? `${daysLeft} দিন বাকি` : 'ইনটেক শুরু';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Delhi Embassy Visa Interview Study Guide (Interactive Flashcards) */}
                <div className="rounded-2xl border-2 border-brand-sky/15 bg-white p-5 shadow-md space-y-4" id="embassy-interview-prep-guide">
                  <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-left">
                      <span className="p-1 bg-brand-sky-light text-brand-sky rounded-lg">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">দূতাবাস ইন্টারভিউ প্রস্তুতি (Delhi Visa Q&A)</h3>
                        <p className="text-[9px] text-slate-400 font-semibold">বুলগেরিয়া স্টুডেন্ট ভিসা ইন্টারভিউ সহায়িকা</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2" id="embassy-qa-accordions">
                    {[
                      {
                        q: "Why did you choose Bulgaria for higher studies?",
                        a: "Bulgaria offers European Union accredited degrees, highly modern laboratories, and extremely affordable tuition fees & living costs compared to Western Europe. Furthermore, Bulgarian universities like Technical University of Sofia are widely respected globally."
                      },
                      {
                        q: "How will you support yourself financially during your stay?",
                        a: "My education and living expenses are fully sponsored by my parents. We have maintained a strong bank statement of over 7-8 Lakhs BDT in our sponsor account as required, and my sponsor is capable of supporting any emergency fees."
                      },
                      {
                        q: "Do you plan to return to Bangladesh after graduation?",
                        a: "Yes, definitely. After completing my degree, I plan to return to Bangladesh to build a career in software engineering/business analytics, utilizing the global European experience and skills gained in Bulgaria to contribute to our local industry."
                      },
                      {
                        q: "Which university and course are you enrolled in?",
                        a: `I am enrolled in "${activeApp.desiredCourse}". The official language of instruction is English, and my classes are scheduled to begin in October 2026.`
                      }
                    ].map((qa, index) => {
                      const isOpen = activePrepIndex === index;
                      return (
                        <div 
                          key={index} 
                          className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-all text-left"
                          id={`qa-block-${index}`}
                        >
                          <button
                            type="button"
                            onClick={() => setActivePrepIndex(isOpen ? null : index)}
                            className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-[11px] font-bold text-slate-700 pr-2 leading-snug">{index + 1}. {qa.q}</span>
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-sky' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-slate-100 bg-white p-3 text-[11px] text-slate-600 leading-relaxed font-semibold italic border-l-2 border-brand-gold"
                              >
                                {qa.a}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Real-time Notifications & SMS History */}
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
                              {uploaded.fileUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(uploaded)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-black transition-all border border-slate-200"
                                  title="ফাইল প্রিভিউ করুন"
                                >
                                  <Eye className="h-3 w-3 text-brand-sky" />
                                  <span>প্রিভিউ করুন</span>
                                </button>
                              )}
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

          {/* Tab 3: Integrated Payment Gateway for Indian Visa Processing & Service Fees */}
          {activeTab === 'payment' && activeApp && (() => {
            const totalAmt = activeApp.totalAmount || activeApp.paymentAmount || 15000;
            const paidAmt = activeApp.paidAmount || (activeApp.paymentStatus === 'Paid' ? totalAmt : 0);
            const remainingAmt = totalAmt - paidAmt;

            const studentServices = serviceOptions.filter(
              s => activeApp.selectedServices?.includes(s.id) || 
                   (!activeApp.selectedServices && ['admission_processing', 'indian_visa_delhi'].includes(s.id))
            );

            const inst1Amt = Math.round(totalAmt / 2);
            const inst2Amt = totalAmt - inst1Amt;

            const currentPayChoice = activeApp.paymentStatus === 'Partially Paid' ? 'inst2' : selectedInstallmentChoice;
            const payingAmount = currentPayChoice === 'full' 
              ? totalAmt 
              : (currentPayChoice === 'inst1' ? inst1Amt : inst2Amt);

            return (
              <div className="space-y-6" id="payment-tab-content-wrapper">
                {/* Selected University, Program and Money Card (explicitly requested by user) */}
                <div className="rounded-2xl border-2 border-brand-sky/25 bg-gradient-to-r from-brand-sky/5 via-white to-brand-gold/5 p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-brand-sky via-indigo-500 to-brand-gold"></div>
                  
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-black uppercase text-brand-sky bg-brand-sky-light/50 px-2.5 py-1 rounded-lg inline-block">
                      🎓 চূড়ান্ত নির্বাচন (Final Selection Overview)
                    </span>
                    <h3 className="text-xs md:text-sm font-black text-slate-800 flex items-center gap-2">
                      <School className="h-5 w-5 text-brand-sky shrink-0 animate-pulse" />
                      <span>{activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[1].replace(')', '') : activeApp.desiredCourse}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2 pl-6">
                      <GraduationCap className="h-4 w-4 text-brand-gold shrink-0" />
                      <span>প্রোগ্রাম/কোর্স: {activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[0] : activeApp.desiredCourse}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 pl-6 flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-slate-300" />
                      <span>অবস্থান: বুলগেরিয়া (Bulgaria)</span>
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end text-left md:text-right shrink-0 gap-2.5 w-full md:w-auto">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">টাকা (মোট প্রসেসিং ফি)</span>
                      <span className="text-lg md:text-xl font-black text-brand-sky font-mono">৳{totalAmt.toLocaleString()} BDT</span>
                    </div>

                    {/* Edit button to correct mistakes (ভুল সংশোধন / আগের স্টেপে যাওয়ার সুযোগ) */}
                    <button
                      type="button"
                      id="edit-uni-course-btn"
                      onClick={() => setIsEditingUniCourse(!isEditingUniCourse)}
                      className="inline-flex items-center justify-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-50/50 px-4 py-2 text-xs font-black text-amber-800 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition-all shadow-sm w-full md:w-auto active:scale-95"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                      <span>ভুল সংশোধন / পূর্ববর্তী নির্বাচন পরিবর্তন</span>
                    </button>
                  </div>
                </div>

                {/* Inline Edit Form for correcting university/program selection */}
                <AnimatePresence>
                  {isEditingUniCourse && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl border border-amber-200 bg-amber-50/10 p-5 shadow-inner space-y-4 text-left overflow-hidden"
                      id="inline-correction-form"
                    >
                      <div className="flex items-center space-x-2 text-amber-700">
                        <Sparkles className="h-4.5 w-4.5 text-brand-gold animate-bounce" />
                        <h4 className="text-xs font-black">বিশ্ববিদ্যালয় ও কোর্স সংশোধন প্যানেল</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        ভুল সংশোধন করার জন্য নিচে নতুন বিশ্ববিদ্যালয় ও প্রোগ্রাম সিলেক্ট করে "পরিবর্তন নিশ্চিত করুন" বাটনে ক্লিক করুন।
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Dropdown Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-700 block">১. বুলগেরিয়ার বিশ্ববিদ্যালয়:</label>
                          <select
                            value={selectedApplyUni || (activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[1].replace(')', '') : 'Technical University of Sofia')}
                            onChange={(e) => {
                              const newUni = e.target.value;
                              setSelectedApplyUni(newUni);
                              setSelectedApplyCourse(universityCoursesMap[newUni]?.courses[0] || '');
                            }}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-sky transition-all"
                          >
                            {Object.keys(universityCoursesMap).map((uniName) => (
                              <option key={uniName} value={uniName}>{uniName}</option>
                            ))}
                          </select>
                        </div>

                        {/* Course Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-700 block">২. প্রোগ্রাম ও কোর্স:</label>
                          <select
                            value={selectedApplyCourse || (activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[0] : '')}
                            onChange={(e) => setSelectedApplyCourse(e.target.value)}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-sky transition-all"
                          >
                            {(universityCoursesMap[selectedApplyUni || (activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[1].replace(')', '') : 'Technical University of Sofia')]?.courses || []).map((course) => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-1.5">
                        <button
                          type="button"
                          onClick={() => setIsEditingUniCourse(false)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          বাতিল
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const uni = selectedApplyUni || (activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[1].replace(')', '') : 'Technical University of Sofia');
                            const course = selectedApplyCourse || (activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[0] : universityCoursesMap[uni]?.courses[0]);
                            const updatedApp = {
                              ...activeApp,
                              desiredCourse: `${course} (${uni})`
                            };
                            onUpdateApplication(updatedApp);
                            setIsEditingUniCourse(false);
                          }}
                          className="rounded-xl bg-brand-sky px-5 py-2 text-xs font-black text-white hover:bg-brand-sky-dark transition-colors shadow-sm"
                        >
                          পরিবর্তন নিশ্চিত করুন
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-6 lg:grid-cols-3" id="payment-tab-content">
                  {/* Payment Details info card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 lg:col-span-1">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-sky bg-brand-sky-light px-2.5 py-1 rounded-full">
                      নির্বাচিত সার্ভিস ও পেমেন্ট হিস্ট্রি
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-800">পেমেন্ট ও ইনভয়েস বিবরণী</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      আপনার নির্বাচিত সার্ভিসসমূহের তালিকা এবং প্রসেসিং ফি নিচে বিস্তারিত দেওয়া হলো।
                    </p>
                  </div>

                  {/* Selected Services Itemized List */}
                  <div className="space-y-2 border-t border-b border-slate-100 py-4">
                    <h4 className="text-xs font-bold text-slate-700">নির্বাচিত সার্ভিসসমূহ:</h4>
                    <div className="space-y-2">
                      {studentServices.map((service) => (
                        <div key={service.id} className="flex justify-between items-start text-xs bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{service.nameEn}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">ফি বাবদ</p>
                          </div>
                          <span className="font-mono font-bold text-slate-700 shrink-0 ml-1">৳{service.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Calculations Panel */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>অ্যাপ্লিকেশন আইডি:</span>
                      <span className="font-mono font-bold text-slate-800">{activeApp.id}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>মোট প্রসেসিং ফি:</span>
                      <span className="font-mono font-bold text-slate-800">৳{totalAmt.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200/50 pb-2">
                      <span>পরিশোধিত ফি (Paid):</span>
                      <span className="font-mono font-bold text-emerald-600">৳{paidAmt.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700 font-bold">
                      <span>চলতি বকেয়া (Due):</span>
                      <span className={`font-mono ${remainingAmt > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        ৳{remainingAmt.toLocaleString()} BDT
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/50">
                      <span>পেমেন্ট স্ট্যাটাস:</span>
                      {activeApp.paymentStatus === 'Paid' ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                          সম্পূর্ণ পরিশোধিত (Paid)
                        </span>
                      ) : activeApp.paymentStatus === 'Partially Paid' ? (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100 animate-pulse">
                          আংশিক পরিশোধিত (Partial)
                        </span>
                      ) : (
                        <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-brand-red border border-rose-100">
                          অপরিশোধিত (Unpaid)
                        </span>
                      )}
                    </div>

                    {activeApp.paymentStatus !== 'Unpaid' && (
                      <div className="border-t border-slate-200/50 pt-3 space-y-1.5 text-[10px] text-slate-500">
                        <div className="font-bold text-slate-700">সর্বশেষ পেমেন্ট ট্রানজেকশন:</div>
                        <div>পেমেন্ট মাধ্যম: <strong className="text-slate-700">{activeApp.paymentMethod}</strong></div>
                        <div>ট্রানজেকশন আইডি: <strong className="text-slate-700 font-mono">{activeApp.paymentTxnId}</strong></div>
                        <div>তারিখ ও সময়: <strong className="text-slate-700 font-mono">{activeApp.paymentDate}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Installments Schedule View */}
                  <div className="space-y-2 bg-brand-sky/5 p-3 rounded-xl border border-brand-sky/10">
                    <h4 className="text-xs font-bold text-slate-800">কিস্তির সময়সূচী (Installment Plan)</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-700">১ম কিস্তি (৫০% - শুরুতেই)</p>
                          {activeApp.installments?.[0]?.paymentDate && (
                            <p className="text-[9px] text-slate-400 font-mono">{activeApp.installments[0].paymentDate}</p>
                          )}
                        </div>
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          activeApp.paymentStatus === 'Paid' || activeApp.paymentStatus === 'Partially Paid'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          ৳{inst1Amt.toLocaleString()} BDT · {
                            activeApp.paymentStatus === 'Paid' || activeApp.paymentStatus === 'Partially Paid' ? 'পরিশোধিত' : 'বকেয়া'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-700">২য় কিস্তি (বাকি ৫০% - ফাইল শেষে)</p>
                          {activeApp.installments?.[1]?.paymentDate && (
                            <p className="text-[9px] text-slate-400 font-mono">{activeApp.installments[1].paymentDate}</p>
                          )}
                        </div>
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          activeApp.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          ৳{inst2Amt.toLocaleString()} BDT · {
                            activeApp.paymentStatus === 'Paid' ? 'পরিশোধিত' : 'বকেয়া'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Checkout Gateway - Replaced with Popup Trigger & Status Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
                  {activeApp.paymentStatus === 'Paid' ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4" id="payment-success-full">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle className="h-10 w-10 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display text-xl font-bold text-slate-800">পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!</h3>
                        <p className="text-xs text-slate-500 max-w-sm">
                          আপনার নির্বাচিত সকল সার্ভিসের ফি পরিশোধিত হয়েছে এবং আপনার ফাইল সম্পূর্ণ সক্রিয় করা হয়েছে। দিল্লী এমব্যাসি সাবমিশন টিম আপনার সাথে যোগাযোগ করবে।
                        </p>
                      </div>
                      <div className="w-full max-w-md bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-left space-y-2 mt-2">
                        <div className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>দেশ:</span> <span className="text-slate-900 font-extrabold">বুলগেরিয়া (Bulgaria) 🇧🇬</span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>বিশ্ববিদ্যালয়:</span> <span className="text-slate-900 font-extrabold">{activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[1].replace(')', '') : activeApp.desiredCourse}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>কোর্স:</span> <span className="text-slate-900 font-extrabold">{activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[0] : activeApp.desiredCourse}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>পরিশোধিত মাধ্যম:</span> <span className="text-slate-900 font-extrabold">{activeApp.paymentMethod}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex justify-between">
                          <span>ট্রানজেকশন আইডি:</span> <span className="text-slate-900 font-mono font-black text-xs text-brand-sky">{activeApp.paymentTxnId}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-6" id="checkout-popup-trigger-container">
                      <div className="mx-auto h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex animate-pulse">
                        <Coins className="h-9 w-9" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-display text-xl font-black text-slate-800">অটোমেটেড পেমেন্ট প্রসেসিং পোর্টাল</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          বুলগেরিয়া স্টুডেন্ট ভিসা ফাইলিং ও দিল্লী ভিসা প্রসেসিং এর ১ম কিস্তি অথবা এককালীন পরিশোধের জন্য আমাদের নতুন 
                          <strong className="text-brand-sky"> ৪-ধাপের স্টেপ পেমেন্ট উইজার্ডটি</strong> ব্যবহার করুন।
                        </p>
                      </div>

                      {/* Explicitly highlight application selection details inside option */}
                      <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
                        <h4 className="text-[11px] font-black uppercase text-brand-sky border-b border-slate-200/60 pb-1">আবেদনকারীর বিবরণ (Application Context)</h4>
                        <div className="grid grid-cols-3 text-xs gap-y-1">
                          <span className="text-slate-400 font-bold">১. দেশ:</span>
                          <span className="col-span-2 text-slate-700 font-extrabold">বুলগেরিয়া (Bulgaria) 🇧🇬</span>
                          
                          <span className="text-slate-400 font-bold">২. বিশ্ববিদ্যালয়:</span>
                          <span className="col-span-2 text-slate-700 font-extrabold">{activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[1].replace(')', '') : activeApp.desiredCourse}</span>
                          
                          <span className="text-slate-400 font-bold">৩. কোর্স:</span>
                          <span className="col-span-2 text-slate-700 font-extrabold">{activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[0] : activeApp.desiredCourse}</span>
                        </div>
                      </div>

                      <div className="max-w-xs mx-auto">
                        <button
                          type="button"
                          id="btn-trigger-payment-modal"
                          onClick={() => {
                            setPaymentModalStep(1);
                            setBkashStep('phone');
                            setIsPaymentModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center space-x-2.5 rounded-2xl bg-gradient-to-r from-[#e2136e] via-brand-sky to-[#f26322] hover:from-[#e2136e]/95 hover:to-[#f26322]/95 text-white py-4 px-6 text-sm font-black transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-brand-sky/20 border-b-4 border-brand-gold relative group overflow-hidden"
                        >
                          <span className="absolute top-0 left-0 w-full h-full bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                          <CreditCard className="h-5 w-5 animate-pulse" />
                          <span>পেমেন্ট করুন (বিকাশ, নগদ, কার্ড)</span>
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                          <Lock className="h-3 w-3" />
                          SSL Secure & encrypted authentication protocol.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

          {/* Tab 4: Additional Services Dashboard */}
          {activeTab === 'additional-services' && activeApp && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6" id="additional-services-tab-content">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-sky bg-brand-sky-light px-2.5 py-1 rounded-full">
                  অতিরিক্ত সেবা সমূহ (Other Ground Services)
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-slate-800">আপনার ফাইলিং এর সাথে নতুন সার্ভিস যুক্ত করুন</h3>
                <p className="text-xs text-slate-500 mt-1">
                  ভিসা আবেদন ও দিল্লী দূতাবাস প্রসেসিং চলাকালীন যেকোনো সময়ে আপনি নিচের সার্ভিসসমূহ যুক্ত করে আপনার স্বপ্নের ইউরোপ যাত্রা নিরাপদ করতে পারবেন।
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {serviceOptions.map((service) => {
                  const isActive = activeApp.selectedServices?.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      className={`rounded-2xl p-4 border-2 flex flex-col justify-between transition-all ${
                        isActive
                          ? 'bg-slate-50 border-emerald-500/30 ring-1 ring-emerald-500/15'
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">{service.name}</h4>
                          {isActive ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[8px] font-bold text-emerald-600 border border-emerald-100">সক্রিয় রয়েছে</span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[8px] font-bold text-slate-500 border border-slate-200">অ্যাড করুন</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{service.description}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 mt-4">
                        <span className="text-xs font-black text-slate-900 font-mono">৳{service.price.toLocaleString()} BDT</span>
                        {!isActive && (
                          <button
                            id={`add-service-btn-${service.id}`}
                            onClick={() => {
                              const newSelected = [...(activeApp.selectedServices || []), service.id];
                              const newTotal = serviceOptions
                                .filter(s => s.isMandatory || newSelected.includes(s.id))
                                .reduce((sum, s) => sum + s.price, 0);

                              // Recalculate installments
                              const inst1Amt = Math.round(newTotal / 2);
                              const inst2Amt = newTotal - inst1Amt;
                              const updatedInstallments = [
                                {
                                  installmentNumber: 1,
                                  amount: inst1Amt,
                                  status: activeApp.installments?.[0]?.status || 'Unpaid',
                                  paymentMethod: activeApp.installments?.[0]?.paymentMethod,
                                  paymentTxnId: activeApp.installments?.[0]?.paymentTxnId,
                                  paymentDate: activeApp.installments?.[0]?.paymentDate
                                },
                                {
                                  installmentNumber: 2,
                                  amount: inst2Amt,
                                  status: activeApp.installments?.[1]?.status || 'Unpaid',
                                  paymentMethod: activeApp.installments?.[1]?.paymentMethod,
                                  paymentTxnId: activeApp.installments?.[1]?.paymentTxnId,
                                  paymentDate: activeApp.installments?.[1]?.paymentDate
                                }
                              ];

                              const updatedApp: Application = {
                                ...activeApp,
                                selectedServices: newSelected,
                                totalAmount: newTotal,
                                paymentAmount: newTotal,
                                installments: updatedInstallments
                              };

                              onUpdateApplication(updatedApp);
                              alert(`"${service.name}" আপনার ফাইলে সফলভাবে যুক্ত করা হয়েছে! অনুগ্রহ করে নতুন ফি "ফি ও পেমেন্ট গেটওয়ে" ট্যাব থেকে পরিশোধ করুন।`);
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 border-b border-brand-gold"
                          >
                            অ্যাড করুন
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 5: Chat Messaging Support with Admin */}
          {activeTab === 'messages' && activeApp && (() => {
            // Auto-mark unread admin replies as read when the student views this tab
            const unreadAdminMsgs = activeApp.messages?.filter(m => m.sender === 'admin' && !m.read) || [];
            if (unreadAdminMsgs.length > 0) {
              setTimeout(() => {
                const updatedMsgs = activeApp.messages?.map(m => m.sender === 'admin' ? { ...m, read: true } : m) || [];
                onUpdateApplication({
                  ...activeApp,
                  messages: updatedMsgs
                });
              }, 60);
            }

            const handleSendStudentMessage = (e: React.FormEvent) => {
              e.preventDefault();
              if (!studentMsgText.trim() && !studentChatFile) return;

              const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

              const newMessage = {
                id: `msg-${Date.now()}`,
                sender: 'student' as const,
                text: studentMsgText.trim(),
                sentAt: currentTimestamp,
                read: false,
                attachments: studentChatFile ? [{ name: studentChatFileName || 'Attachment', url: studentChatFile }] : undefined
              };

              const updatedApp: Application = {
                ...activeApp,
                messages: [...(activeApp.messages || []), newMessage]
              };

              onUpdateApplication(updatedApp);
              setStudentMsgText('');
              setStudentChatFile('');
              setStudentChatFileName('');
            };

            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6" id="messages-tab-content">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold bg-slate-900 px-2.5 py-1 rounded-full border border-brand-gold/20">
                      বার্তালাপ ও সরাসরি চ্যাট (Support Chat)
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-800">Sodi Euro অ্যাডমিন সাপোর্ট চ্যাট</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      আপনার ফাইল প্রসেসিং এবং দিল্লী স্লট বুকিং সংক্রান্ত যেকোনো প্রশ্ন সরাসরি অ্যাডমিনকে পাঠান।
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-sky-light px-2.5 py-0.5 text-[10px] font-bold text-brand-sky-dark border border-brand-sky/20 self-start">
                    সরাসরি লাইভ
                  </span>
                </div>

                {/* Message list box */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 min-h-[250px] max-h-[380px] overflow-y-auto space-y-3 flex flex-col">
                  {(!activeApp.messages || activeApp.messages.length === 0) ? (
                    <div className="my-auto text-center space-y-1 py-12">
                      <p className="text-slate-400 text-xs font-semibold">অ্যাডমিনের সাথে কোনো পূর্ববর্তী চ্যাট নেই।</p>
                      <p className="text-[10px] text-slate-400">নিচের মেসেজ বক্সে টাইপ করে প্রথম মেসেজটি পাঠান।</p>
                    </div>
                  ) : (
                    activeApp.messages.map((msg, mIdx) => {
                      const isStudent = msg.sender === 'student';
                      return (
                        <div
                          key={msg.id || mIdx}
                          className={`flex flex-col max-w-[80%] ${
                            isStudent ? 'align-end self-end items-end' : 'align-start self-start items-start'
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                              isStudent
                                ? 'bg-gradient-to-r from-brand-sky to-brand-sky-dark text-white rounded-tr-none border-b border-brand-gold'
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2.5 pt-1.5 border-t border-slate-200/20 space-y-1.5">
                                {msg.attachments.map((file, fIdx) => (
                                  <a
                                    key={fIdx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center space-x-1.5 hover:underline font-bold text-[10px] p-1.5 rounded-lg ${
                                      isStudent ? 'bg-slate-800/40 text-brand-gold' : 'bg-slate-100 text-slate-700 border border-slate-200/50'
                                    }`}
                                  >
                                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate flex-grow">{file.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                            {isStudent ? 'আমি' : 'অ্যাডমিন সাপোর্ট'} · {msg.sentAt}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send form with File attachment previews */}
                <form onSubmit={handleSendStudentMessage} className="space-y-2">
                  {studentChatFile && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-150 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-600 animate-fadeIn">
                      <div className="flex items-center space-x-2 truncate">
                        <Paperclip className="h-4 w-4 text-brand-sky shrink-0" />
                        <span className="truncate">{studentChatFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentChatFile('');
                          setStudentChatFileName('');
                        }}
                        className="text-brand-red hover:text-red-700 text-xs shrink-0 font-extrabold"
                      >
                        মুছুন (Remove)
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {/* Attachment selection trigger */}
                    <label className="cursor-pointer h-12 w-12 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0">
                      <Paperclip className="h-5 w-5" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (reader.result) {
                                setStudentChatFile(reader.result as string);
                                setStudentChatFileName(file.name);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={studentMsgText}
                      onChange={(e) => setStudentMsgText(e.target.value)}
                      placeholder="আপনার বার্তা বা প্রশ্নটি লিখুন..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky text-slate-800"
                    />

                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 text-white px-5 py-3 text-xs font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 border-b border-brand-gold shrink-0"
                    >
                      বার্তা পাঠান
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Password Verification Modal for Student List Selection */}
      <AnimatePresence>
        {selectedVerifyApp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            id="password-verify-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-2xl border-2 border-brand-gold/25 max-w-md w-full overflow-hidden p-6 space-y-4"
              id="password-verify-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-brand-sky-light text-brand-sky rounded-lg">
                    <Lock className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">লগইন ভেরিফিকেশন (Login Verification)</h3>
                    <p className="text-[10px] text-slate-500">প্রোফাইল নিরাপত্তা নিশ্চিতকরণ</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVerifyApp(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">আপনি নিচের শিক্ষার্থীর ড্যাশবোর্ডে প্রবেশের চেষ্টা করছেন:</p>
                  <h4 className="text-sm font-black text-slate-800 mt-1">{selectedVerifyApp.fullName}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">আইডি: {selectedVerifyApp.id} · পাসপোর্ট: {selectedVerifyApp.passportNumber}</p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড (শিক্ষার্থীর পাসপোর্ট নম্বর):</label>
                    <div className="relative">
                      <input
                        required
                        autoFocus
                        type="password"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        placeholder="পাসপোর্ট নম্বরটি লিখুন"
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold"
                        id="verify-password-input"
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {verifyError && (
                    <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2.5 rounded border border-red-100 leading-relaxed" id="verify-error">
                      {verifyError}
                    </p>
                  )}

                  <div className="text-[10.5px] bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-amber-800 leading-relaxed">
                    <strong>💡 ডেমো ভেরিফিকেশন:</strong> নিরাপত্তার স্বার্থে একজনের ড্যাশবোর্ডে অন্য কেউ সরাসরি ঢুকতে পারবে না। অনুগ্রহ করে উক্ত শিক্ষার্থীর <strong>পাসপোর্ট নম্বরটি ({selectedVerifyApp.passportNumber})</strong> পাসওয়ার্ড হিসেবে টাইপ করে প্রবেশ করুন।
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedVerifyApp(null)}
                      className="w-1/3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                      id="confirm-verify-btn"
                    >
                      ভেরিফাই ও প্রবেশ করুন
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Step-by-step Popup Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && activeApp && (() => {
          const totalAmt = activeApp.totalAmount || activeApp.paymentAmount || 15000;
          const inst1Amt = Math.round(totalAmt / 2);
          const inst2Amt = totalAmt - inst1Amt;
          
          const uniName = activeApp.desiredCourse.includes(' (') 
            ? activeApp.desiredCourse.split(' (')[1].replace(')', '') 
            : "Technical University of Sofia";
          const courseName = activeApp.desiredCourse.includes(' (') 
            ? activeApp.desiredCourse.split(' (')[0] 
            : activeApp.desiredCourse;
          const countryName = "বুলগেরিয়া (Bulgaria)";

          const currentPayChoice = activeApp.paymentStatus === 'Partially Paid' ? 'inst2' : selectedInstallmentChoice;
          const payingAmount = currentPayChoice === 'full' 
            ? totalAmt 
            : (currentPayChoice === 'inst1' ? inst1Amt : inst2Amt);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm text-left"
              id="payment-modal-overlay"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl flex flex-col"
                id="payment-modal-container"
              >
                {/* Header of Popup */}
                <div className="bg-gradient-to-r from-brand-sky/10 via-slate-50 to-brand-gold/10 p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-sky bg-brand-sky-light px-2.5 py-0.5 rounded-full inline-block">
                      Secure Checkout
                    </span>
                    <h3 className="font-display text-base font-black text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="h-4.5 w-4.5 text-brand-sky" />
                      <span>পেমেন্ট উইজার্ড (Payment Wizard)</span>
                    </h3>
                  </div>
                  {paymentModalStep !== 4 && (
                    <button
                      type="button"
                      id="close-payment-modal-btn"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <XCircle className="h-5.5 w-5.5" />
                    </button>
                  )}
                </div>

                {/* Timeline Stepper Header */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center relative select-none">
                  {[
                    { step: 1, label: 'আবেদন বিবরণ' },
                    { step: 2, label: 'পেমেন্ট মাধ্যম' },
                    { step: 3, label: 'ভেরিফিকেশন' },
                    { step: 4, label: 'পেমেন্ট সফল' }
                  ].map((item, idx) => {
                    const isPassed = paymentModalStep > item.step;
                    const isCurrent = paymentModalStep === item.step;
                    return (
                      <React.Fragment key={item.step}>
                        <div className="flex flex-col items-center z-10">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                            isPassed ? 'bg-emerald-500 text-white shadow-sm' :
                            isCurrent ? 'bg-brand-sky text-white ring-4 ring-brand-sky/20' :
                            'bg-slate-200 text-slate-500'
                          }`}>
                            {isPassed ? <Check className="h-4 w-4" /> : item.step}
                          </div>
                          <span className={`text-[9px] font-black mt-1 transition-colors ${
                            isCurrent ? 'text-brand-sky' : isPassed ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                        {idx < 3 && (
                          <div className={`flex-grow h-[2px] transition-colors duration-300 mx-2 -mt-4 ${
                            paymentModalStep > item.step ? 'bg-emerald-500' : 'bg-slate-200'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Modal Body Scroll Container */}
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                  {/* STEP 1: Application Review */}
                  {paymentModalStep === 1 && (
                    <div className="space-y-4" id="modal-step-1">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
                        <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                          <School className="h-4.5 w-4.5 text-brand-sky" />
                          <span>আবেদনকৃত কোর্স ও দেশের বিবরণ:</span>
                        </h4>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">১. দেশের নাম (Country):</span>
                            <span className="text-slate-800 font-extrabold">{countryName} 🇧🇬</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">২. বিশ্ববিদ্যালয় (University):</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{uniName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">৩. কোর্স (Course Name):</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{courseName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Installment Selection if Unpaid */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 block">পেমেন্ট মোড নির্বাচন করুন:</label>
                        {activeApp.paymentStatus === 'Unpaid' ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => setSelectedInstallmentChoice('full')}
                              className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all ${
                                selectedInstallmentChoice === 'full'
                                  ? 'border-brand-sky bg-brand-sky/5 ring-1 ring-brand-sky'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-[11px] font-bold text-slate-800">এককালীন সম্পূর্ণ ফি</span>
                              <span className="text-sm font-black text-slate-900 mt-1 font-mono">৳{totalAmt.toLocaleString()} BDT</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedInstallmentChoice('inst1')}
                              className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all ${
                                selectedInstallmentChoice === 'inst1'
                                  ? 'border-brand-sky bg-brand-sky/5 ring-1 ring-brand-sky'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-[11px] font-bold text-slate-800">১ম কিস্তি (৫০%)</span>
                              <span className="text-sm font-black text-slate-900 mt-1 font-mono">৳{inst1Amt.toLocaleString()} BDT</span>
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex flex-col text-xs text-emerald-800 font-semibold gap-1.5">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <span>১ম কিস্তি পরিশোধ সম্পন্ন হয়েছে!</span>
                            </span>
                            <div className="flex justify-between items-center bg-white p-2 rounded border border-emerald-100 mt-1">
                              <span className="text-slate-600 font-bold">২য় কিস্তি পরিশোধযোগ্য (বাকি ৫০%):</span>
                              <span className="font-mono font-black text-slate-900">৳{inst2Amt.toLocaleString()} BDT</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setPaymentModalStep(2)}
                          className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 text-xs font-black flex items-center gap-1 shadow-md"
                        >
                          <span>পরবর্তী ধাপে যান</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Choose Payment Method Dropdown */}
                  {paymentModalStep === 2 && (
                    <div className="space-y-4" id="modal-step-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 block">পেমেন্ট গেটওয়ে নির্বাচন করুন (Select Payment Gateway):</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value as 'bkash' | 'nagad' | 'card');
                            setBkashStep('phone');
                          }}
                          className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-xs font-black text-slate-700 focus:outline-none focus:border-brand-sky transition-all cursor-pointer"
                        >
                          <option value="bkash">bKash (বিকাশ মোবাইল ব্যাংকিং)</option>
                          <option value="nagad">Nagad (নগদ মোবাইল ব্যাংকিং)</option>
                          <option value="card">Visa / Mastercard Credit/Debit Card</option>
                        </select>
                      </div>

                      {/* Gateway Inputs */}
                      {(paymentMethod === 'bkash' || paymentMethod === 'nagad') ? (
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                          <div className={`mx-auto h-8 w-24 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm ${
                            paymentMethod === 'bkash' ? 'bg-[#e2136e]' : 'bg-[#f26322]'
                          }`}>
                            {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}
                          </div>
                          
                          <div className="space-y-1.5 max-w-xs mx-auto">
                            <label className="text-[10px] font-black text-slate-500 block text-center">আপনার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল নম্বর:</label>
                            <input
                              required
                              type="tel"
                              maxLength={11}
                              placeholder="যেমন: 017XXXXXXXX"
                              value={bkashPhone}
                              onChange={(e) => setBkashPhone(e.target.value)}
                              className="w-full text-center rounded-xl border-2 border-slate-200 p-2.5 font-mono text-sm tracking-wider focus:outline-none focus:border-brand-sky text-slate-800 font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-xs">
                          <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-1">কার্ড বিবরণী দিন:</h4>
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block">কার্ডহোল্ডার নাম (Cardholder Name):</label>
                              <input
                                required
                                type="text"
                                placeholder="যেমন: KAMRUL HASAN"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-none focus:border-brand-sky font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block">কার্ড নম্বর (Card Number):</label>
                              <input
                                required
                                type="text"
                                placeholder="xxxx xxxx xxxx xxxx"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono focus:outline-none focus:border-brand-sky font-bold"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 block">MM/YY:</label>
                                <input
                                  required
                                  type="text"
                                  maxLength={5}
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-center font-mono focus:outline-none focus:border-brand-sky font-bold"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 block">সিভিভি (CVV):</label>
                                <input
                                  required
                                  type="password"
                                  maxLength={3}
                                  placeholder="***"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-center font-mono focus:outline-none focus:border-brand-sky font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setPaymentModalStep(1)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          আগের ধাপ
                        </button>
                        <button
                          type="button"
                          disabled={(paymentMethod === 'card' && (!cardName || !cardNumber)) || ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && bkashPhone.length < 11)}
                          onClick={() => {
                            setPaymentModalStep(3);
                            setBkashStep('otp');
                          }}
                          className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 text-xs font-black disabled:opacity-50 flex items-center gap-1 shadow-md"
                        >
                          <span>পরবর্তী ধাপে যান</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: OTP & Secure PIN Verification */}
                  {paymentModalStep === 3 && (
                    <div className="space-y-4" id="modal-step-3">
                      {isProcessingPayment ? (
                        <div className="py-8 text-center space-y-4">
                          <div className="h-12 w-12 border-4 border-brand-sky border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-800">পেমেন্ট যাচাই করা হচ্ছে...</h4>
                            <p className="text-[11px] text-slate-500">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন, আপনার ব্রাউজারটি বন্ধ করবেন না।</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* OTP verification helper banner */}
                          <div className="bg-amber-50 rounded-xl p-3 text-[11px] text-amber-800 border border-amber-200/50 leading-relaxed space-y-1">
                            <div>🔒 <strong>অটোমেটেড সিকিউরিটি সিমুলেটর:</strong></div>
                            <div>আপনার সুরক্ষায় মোবাইলে একটি টেস্ট ওটিপি কোড পাঠানো হয়েছে।</div>
                            <div>ব্যবহার করুন ওটিপি কোড: <strong className="font-mono text-sm bg-white border border-amber-300 px-1.5 py-0.5 rounded text-amber-900">{paymentMethod === 'card' ? '4832' : '8291'}</strong></div>
                          </div>

                          <div className="space-y-3 max-w-xs mx-auto">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block text-center">আপনার মোবাইলে পাঠানো ৪ ডিজিটের কোডটি দিন (OTP):</label>
                              <input
                                required
                                type="text"
                                maxLength={6}
                                placeholder="OTP Code"
                                value={bkashOtp}
                                onChange={(e) => setBkashOtp(e.target.value)}
                                className="w-full text-center rounded-xl border-2 border-slate-200 p-2 font-mono text-sm tracking-widest focus:outline-none focus:border-brand-sky font-bold text-slate-800"
                              />
                            </div>

                            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 block text-center">আপনার গেটওয়ে পিন নম্বর প্রদান করুন (PIN):</label>
                                <input
                                  required
                                  type="password"
                                  maxLength={5}
                                  placeholder="PIN Code"
                                  value={bkashPin}
                                  onChange={(e) => setBkashPin(e.target.value)}
                                  className="w-full text-center rounded-xl border-2 border-slate-200 p-2 font-mono text-sm tracking-widest focus:outline-none focus:border-brand-sky font-bold text-slate-800"
                                />
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex justify-between">
                            <button
                              type="button"
                              onClick={() => setPaymentModalStep(2)}
                              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                              আগের ধাপ
                            </button>
                            <button
                              type="button"
                              onClick={handleProcessPayment}
                              className={`rounded-xl text-white px-6 py-2.5 text-xs font-black shadow-md ${
                                paymentMethod === 'bkash' ? 'bg-[#e2136e] hover:bg-[#e2136e]/90' :
                                paymentMethod === 'nagad' ? 'bg-[#f26322] hover:bg-[#f26322]/90' :
                                'bg-brand-sky hover:bg-brand-sky-dark'
                              }`}
                            >
                              ৳{payingAmount.toLocaleString()} টাকা পরিশোধ করুন
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4: Success Screen */}
                  {paymentModalStep === 4 && (
                    <div className="space-y-5 text-center py-4" id="modal-step-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto animate-bounce">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-display text-lg font-black text-slate-800">পেমেন্ট সফলভাবে প্রাপ্ত হয়েছে!</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          অভিনন্দন! আপনার স্টুডেন্ট ভিসা আবেদনের পরিশোধ সফল হয়েছে। নিচে আপনার ডিজিটাল পেমেন্ট রসিদ প্রদান করা হলো।
                        </p>
                      </div>

                      {/* Receipt details */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs text-left space-y-2 max-w-md mx-auto">
                        <h4 className="text-[11px] font-black uppercase text-emerald-600 border-b border-slate-200 pb-1 flex justify-between">
                          <span>পেমেন্ট রসিদ (Official Receipt)</span>
                          <span className="text-slate-400 font-mono text-[9px]">{activeApp.paymentDate}</span>
                        </h4>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">১. গন্তব্য দেশ (Country):</span>
                            <span className="text-slate-800 font-extrabold">{countryName} 🇧🇬</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">২. বিশ্ববিদ্যালয় (University Name):</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{uniName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">৩. প্রোগ্রাম ও কোর্স (Course):</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{courseName}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1">
                            <span className="text-slate-400 font-bold">৪. পেমেন্ট মাধ্যম:</span>
                            <span className="text-slate-800 font-extrabold uppercase">{activeApp.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">৫. পরিশোধিত পরিমাণ:</span>
                            <span className="text-slate-900 font-black font-mono text-sm">৳{payingAmount.toLocaleString()} BDT</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>৬. ট্রানজেকশন আইডি:</span>
                            <span className="font-mono font-black text-brand-sky text-xs">{activeApp.paymentTxnId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 max-w-xs mx-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaymentModalOpen(false);
                            setPaymentModalStep(1);
                            setActiveTab('tracking');
                          }}
                          className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white py-3 text-xs font-black shadow-md"
                        >
                          রসিদ বন্ধ করুন ও ড্যাশবোর্ডে যান
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      {/* Hidden file input for real document uploading */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        id="real-doc-file-input"
      />

      {/* Document Preview Modal for Students */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" id="student-doc-preview-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] text-left"
              id="student-doc-preview-modal-card"
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
                      এটি একটি ডেমো রেকর্ড। শিক্ষার্থীর আপলোড করা রিয়েল ডকুমেন্টে সম্পূর্ণ ডাউনলোডযোগ্য ও প্রিভিউযোগ্য ডাটা থাকবে।
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
