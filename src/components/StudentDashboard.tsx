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
  Paperclip,
  Linkedin,
  Facebook,
  MessageCircle,
  Globe,
  Mail,
  Phone,
  LogOut
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
  
  // Signup Flow States
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupName, setSignupName] = useState('');
  const [signupPassport, setSignupPassport] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupError, setSignupError] = useState('');
  const [showApplyFormInDashboard, setShowApplyFormInDashboard] = useState(false);

  // Profile Completion calculator
  const calculateProfileCompletion = (app: Application): number => {
    let percent = 0;
    if (app.fullName && app.fullName.trim().length > 0) percent += 10;
    if (app.passportNumber && app.passportNumber.trim().length > 0) percent += 10;
    if (app.phone && app.phone.trim().length > 0) percent += 10;
    if (app.email && app.email.trim().length > 0) percent += 10;
    if (app.profilePhoto && app.profilePhoto.trim().length > 0) percent += 10;
    
    if (app.academicHistory) {
      const sscFilled = app.academicHistory.sscSchool && app.academicHistory.sscGpa && app.academicHistory.sscYear;
      if (sscFilled) percent += 15;
      
      const hscFilled = app.academicHistory.hscCollege && app.academicHistory.hscGpa && app.academicHistory.hscYear;
      if (hscFilled) percent += 15;
      
      const bachFilled = app.academicHistory.bachelorUni && app.academicHistory.bachelorCgpa && app.academicHistory.bachelorYear;
      if (bachFilled) percent += 10;
    }
    
    if (app.socialMedia) {
      const socialFilled = app.socialMedia.facebook || app.socialMedia.linkedin || app.socialMedia.whatsapp;
      if (socialFilled) percent += 10;
    }
    
    return percent;
  };

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
    phone: '',
    sscSchool: '',
    sscGpa: '',
    sscYear: '',
    hscCollege: '',
    hscGpa: '',
    hscYear: '',
    bachelorUni: '',
    bachelorCgpa: '',
    bachelorYear: '',
    facebook: '',
    linkedin: '',
    whatsapp: ''
  });
  const [editProfileError, setEditProfileError] = useState('');

  // Shopping Cart & Popover toggles
  const [cart, setCart] = useState<string[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isCartCheckout, setIsCartCheckout] = useState(false);

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

    // If we have an active logged-in application that is in 'Registered' status
    if (activeApp && activeApp.status === 'Registered') {
      if (!selectedApplyUni || !selectedApplyCourse) {
        setFormError('অনুগ্রহ করে একটি বিশ্ববিদ্যালয় এবং প্রোগ্রাম সিলেক্ট করুন।');
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

      const updatedApp: Application = {
        ...activeApp,
        desiredCourse,
        status: 'Submitted',
        paymentStatus: 'Unpaid',
        paymentAmount: calculatedTotal,
        totalAmount: calculatedTotal,
        paidAmount: 0,
        selectedServices: selectedServices,
        installments: initialInstallments,
        notificationHistory: [
          ...activeApp.notificationHistory,
          {
            id: `not-${Math.random()}`,
            title: 'ভিসা আবেদন সফলভাবে জমা হয়েছে',
            body: `প্রিয় ${activeApp.fullName}, আপনার বুলগেরিয়া স্টুডেন্ট ভিসা আবেদনটি সফলভাবে সিস্টেমে যুক্ত করা হয়েছে। আপনার নির্বাচিত সার্ভিস ফি: ৳${calculatedTotal.toLocaleString()} BDT। আপনি এখন ফি পরিশোধ করতে পারবেন এবং কাগজপত্র আপলোড সেকশন সচল হয়েছে।`,
            type: activeApp.phone ? 'sms' : 'email',
            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            recipient: activeApp.phone || activeApp.email
          }
        ]
      };

      onUpdateApplication(updatedApp);
      setShowApplyFormInDashboard(false);
      setWizardStep(1);
      setMaxStepReached(1);
      setActiveTab('tracking');
      return;
    }

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

    if (isCartCheckout) {
      const cartServices = serviceOptions.filter(s => cart.includes(s.id));
      const cartTotal = cartServices.reduce((sum, s) => sum + s.price, 0);
      const serviceNames = cartServices.map(s => s.nameEn).join(', ');

      setTimeout(() => {
        const txnId = paymentMethod === 'card' 
          ? `CARD${Math.floor(100000000 + Math.random() * 900000000)}`
          : `${paymentMethod === 'bkash' ? 'BKX' : 'NGD'}${Math.floor(100000000 + Math.random() * 900000000)}`;

        const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

        const updatedHistory = [
          ...activeApp.notificationHistory,
          {
            id: `not-pay-cart-${Date.now()}`,
            title: `অতিরিক্ত সার্ভিস পেমেন্ট সফল - ৳${cartTotal.toLocaleString()} BDT`,
            body: `প্রিয় ${activeApp.fullName}, আপনার নির্বাচিত সার্ভিসসমূহ (${serviceNames}) বাবদ ৳${cartTotal.toLocaleString()} BDT সফলভাবে পরিশোধ করা হয়েছে। ট্রানজেকশন আইডি: ${txnId}।`,
            type: 'email' as const,
            sentAt: currentTimestamp,
            recipient: activeApp.email
          },
          {
            id: `not-pay-cart-sms-${Date.now()}`,
            title: `সার্ভিস ফি প্রাপ্তি নিশ্চিতকরণ`,
            body: `আপনার বুলগেরিয়া স্টুডেন্ট ভিসা আবেদনের অতিরিক্ত সার্ভিসসমূহ (${serviceNames}) বাবদ BDT ৳${cartTotal.toLocaleString()} পরিশোধিত হয়েছে। ট্রানজেকশন আইডি: ${txnId}`,
            type: 'sms' as const,
            sentAt: currentTimestamp,
            recipient: activeApp.phone
          }
        ];

        const payMethodLabel = paymentMethod === 'card' ? 'Visa Card' : (paymentMethod === 'bkash' ? 'bKash' : 'Nagad');

        // Also add to any existing installments or keep them as is
        const currentSelected = activeApp.selectedServices || [];
        const newSelected = [...currentSelected, ...cart];
        
        const currentTotal = activeApp.totalAmount || activeApp.paymentAmount || 15000;
        const currentPaid = activeApp.paidAmount || (activeApp.paymentStatus === 'Paid' ? currentTotal : 0);

        const updatedApp: Application = {
          ...activeApp,
          selectedServices: newSelected,
          paidAmount: currentPaid + cartTotal,
          totalAmount: currentTotal + cartTotal,
          paymentAmount: currentTotal + cartTotal,
          notificationHistory: updatedHistory,
          // If they were partially paid or fully paid, let's keep status correct or update
          paymentStatus: (currentPaid + cartTotal >= currentTotal + cartTotal) ? 'Paid' : activeApp.paymentStatus
        };

        onUpdateApplication(updatedApp);
        setIsProcessingPayment(false);
        setCart([]); // Clear cart
        setIsCartCheckout(false);
        setPaymentModalStep(4);
      }, 2000);
      return;
    }

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
          body: `আপনার বুলগেরিয়া স্টুডেন্ট visa আবেদনের ${paymentOptionLabel} বাবদ ৳${payingAmount.toLocaleString()} BDT পরিশোধিত হয়েছে। ট্রানজেকশন আইডি: ${txnId}`,
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

  // Live Chat helpers
  const handleSendStudentMessage = (text: string) => {
    if (!activeApp || !text.trim()) return;
    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student' as const,
      text: text.trim(),
      sentAt: currentTimestamp,
      read: false
    };
    const updatedApp: Application = {
      ...activeApp,
      messages: [...(activeApp.messages || []), newMessage]
    };
    onUpdateApplication(updatedApp);
  };

  const markMessagesAsRead = () => {
    if (!activeApp || !activeApp.messages) return;
    let hasUnread = false;
    const updatedMessages = activeApp.messages.map(m => {
      if (m.sender === 'admin' && !m.read) {
        hasUnread = true;
        return { ...m, read: true };
      }
      return m;
    });
    if (hasUnread) {
      const updatedApp: Application = {
        ...activeApp,
        messages: updatedMessages
      };
      onUpdateApplication(updatedApp);
    }
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

  const handleDirectSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupName.trim() || !signupPassport.trim() || !signupEmail.trim() || !signupPhone.trim()) {
      setSignupError('অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    const passportUpper = signupPassport.trim().toUpperCase();
    const exists = applications.find(a => a.passportNumber.toUpperCase() === passportUpper);
    if (exists) {
      setSignupError('এই পাসপোর্ট নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে! দয়া করে লগইন করুন।');
      return;
    }

    const newId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: Application = {
      id: newId,
      fullName: signupName.trim(),
      passportNumber: passportUpper,
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      desiredCourse: 'BSc in Computer Science (Technical University of Sofia)',
      status: 'Registered',
      paymentStatus: 'Unpaid',
      paymentAmount: 0,
      paidAmount: 0,
      documents: [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notificationHistory: [
        {
          id: `not-${Math.random()}`,
          title: 'অ্যাকাউন্ট নিবন্ধন ও ফাইল ওপেন সফল',
          body: `প্রিয় ${signupName.trim()}, আপনার Sodi Euro স্টুডেন্ট পোর্টাল অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আইডি: ${newId}। বুলগেরিয়া স্টুডেন্ট ভিসা আবেদনের জন্য আপনার প্রোফাইল সম্পূর্ণ করুন।`,
          type: 'email',
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          recipient: signupEmail.trim()
        }
      ]
    };

    onAddApplication(newApp);
    setActiveAppId(newId);
    setActiveTab('tracking');

    setSignupName('');
    setSignupPassport('');
    setSignupEmail('');
    setSignupPhone('');
    setAuthMode('login');
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
          className="mx-auto max-w-2xl space-y-6 perspective-1000" 
          id="portal-login-screen"
        >
          <div className="text-center space-y-3">
            <span className="font-display font-black text-brand-sky bg-brand-sky-light border border-brand-sky/20 px-3 py-1 rounded-full text-xs">
              Sodi Euro স্টুডেন্ট পোর্টাল
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">বুলগেরিয়া স্টুডেন্ট ভিসা ফাইলিং ও ট্র্যাকিং</h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Sodi Euro ডিজিটাল পোর্টালে নিবন্ধন করুন, আপনার প্রোফাইল সম্পূর্ণ করুন এবং আপনার স্টুডেন্ট ভিসা প্রসেসের প্রতিটি আপডেট রিয়েল-টাইমে ট্র্যাক করুন।
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setSearchError('');
              }}
              className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              লগইন (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setSearchError('');
              }}
              className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              নতুন নিবন্ধন (Sign Up)
            </button>
          </div>

          <div className="rounded-2xl border-2 border-brand-gold/15 bg-white p-6 shadow-xl space-y-6 transform-style-3d hover:shadow-2xl hover:shadow-brand-sky/5 transition-all duration-300">
            {authMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleStudentLogin} className="space-y-4" id="track-form">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">পাসপোর্ট নম্বর (Passport Number):</label>
                    <div className="relative">
                      <input
                        id="track-search-input"
                        required
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="যেমন: EF0129384"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold uppercase"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড (Password):</label>
                    <div className="relative">
                      <input
                        required
                        type="password"
                        placeholder="লগইন পাসওয়ার্ড (আপনার পাসপোর্ট নম্বর)"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold font-mono"
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">ড্যাশবোর্ডে প্রবেশের জন্য আপনার পাসপোর্ট নম্বরটি একইসাথে ইউজারনেম এবং পাসওয়ার্ড হিসেবে টাইপ করুন।</p>
                  </div>
                </div>

                {searchError && (
                  <div className="text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 py-3 text-xs font-black text-white hover:bg-slate-800 transition-all border-b border-brand-gold"
                >
                  লগইন ও ট্র্যাকিং করুন
                </button>
              </form>
            ) : (
              /* DIRECT SIGNUP FORM (NO OTP REQUIRED) */
              <form onSubmit={handleDirectSignup} className="space-y-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center mb-4">
                  <p className="text-xs font-bold text-emerald-800">✓ নতুন অ্যাকাউন্ট তৈরি ও সরাসরি ফাইল ওপেন</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">কোনো ওটিপি ঝামেলা ছাড়া নিচের তথ্যগুলো দিয়ে সাথে সাথে আপনার অ্যাকাউন্ট খুলে আবেদন শুরু করুন।</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">শিক্ষার্থীর পূর্ণ নাম (পাসপোর্ট অনুযায়ী):</label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="যেমন: MD KAMRUL HASAN"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">পাসপোর্ট নম্বর (Passport Number):</label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="যেমন: EF0129384"
                        value={signupPassport}
                        onChange={(e) => setSignupPassport(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold uppercase"
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">* এটিই হবে আপনার ট্র্যাকিং ড্যাশবোর্ডে লগইন করার পাসওয়ার্ড।</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">ইমেইল অ্যাড্রেস:</label>
                    <div className="relative">
                      <input
                        required
                        type="email"
                        placeholder="যেমন: student@gmail.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold"
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">মোবাইল নম্বর (বাংলাদেশী):</label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="যেমন: 017XXXXXXXX"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold"
                      />
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {signupError && (
                  <div className="text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{signupError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  সরাসরি অ্যাকাউন্ট তৈরি করুন ও ফাইল ওপেন করুন
                </button>
              </form>
            )}
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
                            onClick={(e) => handleApplySubmit(e)}
                            className="inline-flex items-center space-x-1 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                          >
                            <span>ফাইল ওপেন ও জমা দিন</span>
                            <Send className="h-4 w-4" />
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
        activeApp.status === 'Registered' ? (
            <div className="space-y-6 animate-fade-in" id="registered-profile-completion-dashboard">
              {/* Global Student Dashboard Logout Bar */}
              <div className="bg-white border-2 border-brand-gold/20 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6" id="student-logout-bar">
                <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
                  <div className="h-10 w-10 rounded-xl bg-brand-sky/10 border border-brand-sky/20 text-brand-sky flex items-center justify-center font-black shrink-0">
                    {activeApp.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">{activeApp.fullName}</span>
                      {calculateProfileCompletion(activeApp) >= 70 && (
                        <span className="inline-flex items-center text-blue-500" title="Verified Profile (70%+ Complete)">
                          <svg className="w-3.5 h-3.5 fill-blue-500 text-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </span>
                      )}
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">লগইনকৃত শিক্ষার্থী</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">পাসপোর্ট: {activeApp.passportNumber} | আইডি: {activeApp.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAppId(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all shrink-0"
                  id="student-logout-btn"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
              {/* Profile Completion progress card */}
              <div className="rounded-2xl border-2 border-brand-gold/15 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-brand-gold animate-pulse" />
                      <span>আপনার প্রোফাইল সম্পূর্ণ করুন (Complete Your Profile)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      বুলগেরিয়া স্টুডেন্ট ভিসা আবেদনের জন্য আপনার প্রোফাইল কমপক্ষে ৫০% সম্পূর্ণ করতে হবে। বর্তমানে আপনার প্রোফাইল সম্পূর্ণতার অগ্রগতি:
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end">
                    <span className="text-2xl font-black text-brand-sky">{calculateProfileCompletion(activeApp)}%</span>
                    <span className="text-xs font-bold text-slate-400">সম্পন্ন (Complete)</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-sky via-brand-sky-dark to-brand-gold transition-all duration-500"
                    style={{ width: `${calculateProfileCompletion(activeApp)}%` }}
                  />
                </div>

                {calculateProfileCompletion(activeApp) < 50 ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3 text-left">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800 leading-tight">ভিসা আবেদন লক করা আছে (Visa Application Gated)</p>
                      <p className="text-[11px] text-amber-600 font-semibold mt-1">
                        আপনার প্রোফাইল ৫০% সম্পূর্ণ হলেই বুলগেরিয়া স্টুডেন্ট ভিসা আবেদন (বিশ্ববিদ্যালয়, কোর্স ও অতিরিক্ত সেবা নির্বাচন) আনলক হবে। অনুগ্রহ করে নিচে আপনার অ্যাকাডেমিক এবং সোশ্যাল লিংকসমূহ আপডেট করে ৫০% সম্পন্ন করুন।
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3 text-left">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 leading-tight">ভিসা আবেদন সচল হয়েছে! (Visa Application Unlocked)</p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        অভিনন্দন! আপনার প্রোফাইল ৫০% বা তার বেশি সম্পূর্ণ হয়েছে। এখন আপনি বুলগেরিয়া স্টুডেন্ট ভিসা প্রসেস শুরু করতে পারবেন। নিচে ডানদিকের প্যানেলে "স্টুডেন্ট ভিসা আবেদন শুরু করুন" বাটনে ক্লিক করুন।
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {showApplyFormInDashboard ? (
                /* INLINE UNIVERSITY/COURSE FILING WIZARD */
                <div className="rounded-2xl border-2 border-brand-sky/20 bg-white p-5 md:p-6 shadow-xl space-y-6 text-left">
                  <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-black text-slate-800 text-base md:text-lg">বুলগেরিয়া স্টুডেন্ট ভিসা প্রসেস শুরু করুন (Visa Application Wizard)</h3>
                      <p className="text-[10px] md:text-xs text-slate-500">আপনার বিশ্ববিদ্যালয়, প্রোগ্রাম এবং প্রয়োজনীয় সেবা নির্বাচন করুন।</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplyFormInDashboard(false);
                        setWizardStep(1);
                      }}
                      className="text-xs font-bold text-rose-500 hover:underline bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"
                    >
                      বন্ধ করুন (Cancel)
                    </button>
                  </div>

                  {/* STEP 2: University & Course Selection */}
                  {wizardStep === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="relative">
                        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                          <School className="h-4 w-4 text-brand-sky" />
                          <span>১. বুলগেরিয়ার বিশ্ববিদ্যালয় পছন্দ করুন (Select University)</span>
                        </label>
                        
                        <button
                          type="button"
                          onClick={() => setIsUniDropdownOpen(!isUniDropdownOpen)}
                          className="w-full flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-3 text-left shadow-sm hover:border-brand-sky/60 hover:bg-slate-50/30 transition-all focus:outline-none min-w-0"
                        >
                          {selectedApplyUni ? (
                            <div className="flex items-start gap-2 max-w-[85%] min-w-0 flex-1">
                              <div className={`h-3 w-3 rounded-full bg-gradient-to-tr ${universityCoursesMap[selectedApplyUni].logoColor} shrink-0 mt-1`}></div>
                              <div className="text-left min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-800 leading-snug break-words">{selectedApplyUni}</h4>
                                <div className="text-[9px] text-slate-400 font-bold mt-1 flex flex-wrap gap-x-2 gap-y-1 items-center">
                                  <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-slate-300" /> {universityCoursesMap[selectedApplyUni].location}</span>
                                  <span className="text-slate-200">|</span>
                                  <span className="flex items-center gap-0.5 text-brand-gold-dark font-mono">{universityCoursesMap[selectedApplyUni].tuitionFee}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="h-2 w-2 rounded-full bg-brand-sky animate-ping"></span>
                              <span className="text-xs font-black text-brand-sky">একটি বিশ্ববিদ্যালয় সিলেক্ট করুন (Choose University)</span>
                            </div>
                          )}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 shrink-0 ml-1 ${isUniDropdownOpen ? 'rotate-180 text-brand-sky' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isUniDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border-2 border-slate-200 bg-white shadow-2xl divide-y divide-slate-100"
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
                                    className={`flex items-start justify-between p-3 cursor-pointer transition-colors ${
                                      isSelected ? 'bg-brand-sky-light/10 text-brand-sky font-extrabold' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2 text-left flex-1 min-w-0">
                                      <div className={`h-3 w-3 rounded-full bg-gradient-to-tr ${uni.logoColor} shrink-0 mt-1`} />
                                      <div className="min-w-0 flex-1">
                                        <h5 className="text-xs font-bold text-slate-800 leading-snug break-words">{uniName}</h5>
                                        <div className="text-[9px] text-slate-400 font-bold mt-1 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                                          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-slate-300" /> {uni.location}</span>
                                          <span className="text-slate-200">·</span>
                                          <span className="flex items-center gap-0.5 text-brand-gold-dark font-mono">{uni.tuitionFee}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {isSelected && <span className="text-brand-gold text-xs font-black">✓</span>}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {selectedApplyUni && (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <label className="text-xs font-black text-slate-800 block">
                            ২. প্রোগ্রাম ও কোর্স সিলেক্ট করুন (Choose Program & Course):
                          </label>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {universityCoursesMap[selectedApplyUni].courses.map((course) => {
                              const isCourseSelected = selectedApplyCourse === course;
                              return (
                                <div
                                  key={course}
                                  onClick={() => setSelectedApplyCourse(course)}
                                  className={`p-3 rounded-lg border-2 text-xs font-bold cursor-pointer text-left transition-all flex items-center justify-between ${
                                    isCourseSelected
                                      ? 'bg-white border-brand-sky text-brand-sky-dark shadow-md'
                                      : 'bg-white/60 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white'
                                  }`}
                                >
                                  <span>{course}</span>
                                  {isCourseSelected && <CheckCircle2 className="h-4 w-4 text-brand-sky shrink-0 ml-2" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-3">
                        <button
                          type="button"
                          disabled={!selectedApplyUni || !selectedApplyCourse}
                          onClick={() => setWizardStep(3)}
                          className="rounded-xl bg-slate-900 text-white px-6 py-2.5 text-xs font-black hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md border-b-2 border-brand-gold"
                        >
                          <span>পরবর্তী ধাপে যান</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Services Selection */}
                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">সার্ভিস ও অতিরিক্ত সেবা নির্বাচন করুন (Select Processing Services)</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {serviceOptions.map((service) => {
                          const isMandatory = service.isMandatory;
                          const isSelected = isMandatory || selectedServices.includes(service.id);
                          return (
                            <div
                              key={service.id}
                              onClick={() => {
                                if (isMandatory) return;
                                if (isSelected) {
                                  setSelectedServices(selectedServices.filter(id => id !== service.id));
                                } else {
                                  setSelectedServices([...selectedServices, service.id]);
                                }
                              }}
                              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected 
                                  ? 'bg-brand-sky-light/5 border-brand-sky shadow-md' 
                                  : 'bg-white border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                  <h5 className="text-xs font-black text-slate-800">{service.name}</h5>
                                  {isMandatory && <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded">আবশ্যক</span>}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-snug">{service.description}</p>
                              </div>
                              <div className="mt-3 pt-2.5 border-t border-slate-100/70 flex justify-between items-center">
                                <span className="text-xs font-bold font-mono text-slate-700">৳{service.price.toLocaleString()} BDT</span>
                                <span className={`text-[10px] font-black ${isSelected ? 'text-brand-sky' : 'text-slate-400'}`}>
                                  {isSelected ? '✓ সিলেক্টেড' : '+ যোগ করুন'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all"
                        >
                          পূর্ববর্তী
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="rounded-xl bg-slate-900 text-white px-6 py-2.5 text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md border-b-2 border-brand-gold"
                        >
                          <span>রিভিউ করুন</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Review & Submit */}
                  {wizardStep === 4 && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-200/60 pb-2">আবেদন রিভিউ ও তথ্য যাচাই</h4>
                        <div className="grid gap-4 sm:grid-cols-2 text-xs">
                          <div>
                            <span className="text-slate-400 block font-bold uppercase text-[9px]">নির্বাচিত বিশ্ববিদ্যালয়</span>
                            <span className="font-bold text-slate-700">{selectedApplyUni}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase text-[9px]">নির্বাচিত প্রোগ্রাম</span>
                            <span className="font-bold text-slate-700">{selectedApplyCourse}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/60 pt-3 space-y-2">
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">সিলেক্টেড সার্ভিসসমূহ ও ফি বিবরণী</span>
                          <div className="space-y-1.5">
                            {serviceOptions
                              .filter(s => s.isMandatory || selectedServices.includes(s.id))
                              .map(s => (
                                <div key={s.id} className="flex justify-between text-xs font-semibold text-slate-700">
                                  <span className="text-slate-600 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sky"></span>
                                    {s.nameEn}
                                  </span>
                                  <span className="font-mono text-slate-800">৳{s.price.toLocaleString()} BDT</span>
                                </div>
                              ))}
                          </div>
                          
                          <div className="border-t border-slate-200 pt-2.5 mt-2.5 flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800">সর্বমোট প্রসেসিং ফি (Grand Total):</span>
                            <span className="text-xs font-black bg-brand-gold text-slate-950 px-3 py-1 rounded-lg border border-brand-gold-dark font-mono shadow-sm">
                              ৳{serviceOptions
                                .filter(s => s.isMandatory || selectedServices.includes(s.id))
                                .reduce((sum, s) => sum + s.price, 0).toLocaleString()} BDT
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/30 mt-2">
                            * নিয়মানুযায়ী সর্বমোট ফি-টি ২ টি সমান কিস্তিতে বিভক্ত করা হয়েছে (৫০% প্রথম কিস্তি আবেদন ফাইল তৈরীর পর এবং অবশিষ্টাংশ ভিসা স্ট্যাম্পিং এর সময়)।
                          </p>
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
                          className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all"
                        >
                          পূর্ববর্তী
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleApplySubmit}
                          className="rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark text-white px-6 py-2.5 text-xs font-black border-b-2 border-brand-gold shadow-md flex items-center gap-1.5"
                        >
                          <span>ফাইল ওপেন করুন ও পোর্টাল চালু করুন</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TWO COLUMN EDIT PROFILE AND GATE PREVIEW */
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Edit Profile Column */}
                  <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
                      <div className="text-left border-b border-slate-100 pb-3 flex justify-between items-center">
                        <h3 className="font-display text-sm md:text-base font-black text-slate-800">প্রোফাইল তথ্য আপডেট করুন (Update Profile Information)</h3>
                       <div className="space-y-6">
                         {/* Profile Photo Capture / Upload */}
                        <div className="space-y-3 text-left">
                          <label className="text-xs font-black text-slate-700 block">১. প্রোফাইল ছবি (Profile Photo):</label>
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="h-20 w-20 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 relative shrink-0 flex items-center justify-center">
                              {activeApp.profilePhoto ? (
                                <img src={activeApp.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-10 w-10 text-slate-300" />
                              )}
                            </div>
                            <div className="space-y-1.5 flex-1 w-full">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="ছবির ইউআরএল দিন (Photo URL)"
                                  value={activeApp.profilePhoto || ''}
                                  onChange={(e) => {
                                    onUpdateApplication({
                                      ...activeApp,
                                      profilePhoto: e.target.value
                                    });
                                  }}
                                  className="rounded-lg border border-slate-200 p-2 text-xs font-semibold w-full focus:border-brand-sky focus:outline-none"
                                />
                                <label className="rounded-lg bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-slate-200 transition-all shrink-0 flex items-center">
                                  <Camera className="h-4 w-4 mr-1" />
                                  <span>আপলোড</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        if (typeof reader.result === 'string') {
                                          onUpdateApplication({
                                            ...activeApp,
                                            profilePhoto: reader.result
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                </label>
                              </div>
                              <p className="text-[10px] text-slate-400 font-semibold">যেমন: https://images.unsplash.com/... অথবা আপনার ছবি ডিরেক্ট আপলোড করুন।</p>
                            </div>
                          </div>
                        </div>

                        {/* Academics Section */}
                        <div className="space-y-4 pt-5 border-t border-slate-100 text-left">
                          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <GraduationCap className="h-4.5 w-4.5 text-brand-sky" />
                            <span>২. শিক্ষাগত যোগ্যতা (Academic History):</span>
                          </h4>

                          <div className="grid gap-4 sm:grid-cols-3">
                            {/* SSC */}
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">SSC স্কুল নাম:</label>
                              <input
                                type="text"
                                placeholder="High School"
                                value={activeApp.academicHistory?.sscSchool || ''}
                                onChange={(e) => {
                                  const acad = activeApp.academicHistory || {};
                                  onUpdateApplication({
                                    ...activeApp,
                                    academicHistory: { ...acad, sscSchool: e.target.value }
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                                <input
                                  type="text"
                                  placeholder="পাসের সাল"
                                  value={activeApp.academicHistory?.sscYear || ''}
                                  onChange={(e) => {
                                    const acad = activeApp.academicHistory || {};
                                    onUpdateApplication({
                                      ...activeApp,
                                      academicHistory: { ...acad, sscYear: e.target.value }
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-white p-1.5 text-[10px] focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="GPA"
                                  value={activeApp.academicHistory?.sscGpa || ''}
                                  onChange={(e) => {
                                    const acad = activeApp.academicHistory || {};
                                    onUpdateApplication({
                                      ...activeApp,
                                      academicHistory: { ...acad, sscGpa: e.target.value }
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-white p-1.5 text-[10px] focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* HSC */}
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">HSC কলেজ নাম:</label>
                              <input
                                type="text"
                                placeholder="Govt College"
                                value={activeApp.academicHistory?.hscCollege || ''}
                                onChange={(e) => {
                                  const acad = activeApp.academicHistory || {};
                                  onUpdateApplication({
                                    ...activeApp,
                                    academicHistory: { ...acad, hscCollege: e.target.value }
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                                <input
                                  type="text"
                                  placeholder="পাসের সাল"
                                  value={activeApp.academicHistory?.hscYear || ''}
                                  onChange={(e) => {
                                    const acad = activeApp.academicHistory || {};
                                    onUpdateApplication({
                                      ...activeApp,
                                      academicHistory: { ...acad, hscYear: e.target.value }
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-white p-1.5 text-[10px] focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="GPA"
                                  value={activeApp.academicHistory?.hscGpa || ''}
                                  onChange={(e) => {
                                    const acad = activeApp.academicHistory || {};
                                    onUpdateApplication({
                                      ...activeApp,
                                      academicHistory: { ...acad, hscGpa: e.target.value }
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-white p-1.5 text-[10px] focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Bachelor */}
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Bachelor বিশ্ববিদ্যালয় (ঐচ্ছিক):</label>
                              <input
                                type="text"
                                placeholder="National University"
                                value={activeApp.academicHistory?.bachelorUni || ''}
                                onChange={(e) => {
                                  const acad = activeApp.academicHistory || {};
                                  onUpdateApplication({
                                    ...activeApp,
                                    academicHistory: { ...acad, bachelorUni: e.target.value }
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                                <input
                                  type="text"
                                  placeholder="পাসের সাল"
                                  value={activeApp.academicHistory?.bachelorYear || ''}
                                  onChange={(e) => {
                                    const acad = activeApp.academicHistory || {};
                                    onUpdateApplication({
                                      ...activeApp,
                                      academicHistory: { ...acad, bachelorYear: e.target.value }
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-white p-1.5 text-[10px] focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="CGPA"
                                  value={activeApp.academicHistory?.bachelorCgpa || ''}
                                   onChange={(e) => {
                                     const acad = activeApp.academicHistory || {};
                                     onUpdateApplication({
                                       ...activeApp,
                                       academicHistory: { ...acad, bachelorCgpa: e.target.value }
                                     });
                                   }}
                                   className="w-full rounded border border-slate-200 bg-white p-1.5 text-[10px] focus:outline-none"
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Social Media links */}
                       <div className="space-y-4 pt-5 border-t border-slate-100 text-left">
                         <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                           <Globe className="h-4.5 w-4.5 text-brand-sky" />
                           <span>৩. সোশ্যাল মিডিয়া ও যোগাযোগ লিংক (Social Media Links):</span>
                         </h4>

                         <div className="grid gap-4 sm:grid-cols-3">
                           <div className="space-y-1">
                             <label className="text-[11px] font-bold text-slate-600 block">ফেসবুক প্রোফাইল লিংক:</label>
                             <input
                               type="text"
                               placeholder="facebook.com/username"
                               value={activeApp.socialMedia?.facebook || ''}
                               onChange={(e) => {
                                 const soc = activeApp.socialMedia || {};
                                 onUpdateApplication({
                                   ...activeApp,
                                   socialMedia: { ...soc, facebook: e.target.value }
                                 });
                               }}
                               className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[11px] font-bold text-slate-600 block">লিংকডইন প্রোফাইল লিংক:</label>
                              <input
                                type="text"
                                placeholder="linkedin.com/in/username"
                                value={activeApp.socialMedia?.linkedin || ''}
                                onChange={(e) => {
                                  const soc = activeApp.socialMedia || {};
                                  onUpdateApplication({
                                    ...activeApp,
                                    socialMedia: { ...soc, linkedin: e.target.value }
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 block">হোয়াটসঅ্যাপ নম্বর:</label>
                              <input
                                type="text"
                                placeholder="017XXXXXXXX"
                                value={activeApp.socialMedia?.whatsapp || ''}
                                onChange={(e) => {
                                  const soc = activeApp.socialMedia || {};
                                  onUpdateApplication({
                                    ...activeApp,
                                    socialMedia: { ...soc, whatsapp: e.target.value }
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact info update */}
                        <div className="space-y-4 pt-5 border-t border-slate-100 text-left">
                          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <User className="h-4.5 w-4.5 text-brand-sky" />
                            <span>৪. যোগাযোগের তথ্য (Contact Details):</span>
                          </h4>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 block">ইমেইল ঠিকানা:</label>
                              <input
                                type="email"
                                value={activeApp.email || ''}
                                onChange={(e) => {
                                  onUpdateApplication({
                                    ...activeApp,
                                    email: e.target.value
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 block">মোবাইল নম্বর:</label>
                              <input
                                type="text"
                                value={activeApp.phone || ''}
                                onChange={(e) => {
                                  onUpdateApplication({
                                    ...activeApp,
                                    phone: e.target.value
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 p-3.5 text-xs text-left font-bold">
                          💡 প্রোফাইলের প্রতিটি নতুন ফিল্ড সেভ বা আপডেট করার পর আপনার প্রোফাইল প্রোগ্রেস পারসেন্টেজ সরাসরি বৃদ্ধি পাবে।
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visa Gating preview column */}
                  <div className="space-y-6 lg:col-span-1">
                    {calculateProfileCompletion(activeApp) < 50 ? (
                      /* LOCKED SIDEBAR PREVIEW */
                      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6 shadow-sm text-center space-y-4">
                        <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                          <Lock className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-slate-700">বুলগেরিয়া ভিসা আবেদন লকড (Locked)</h4>
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed text-left">
                            ভিসা আবেদন প্রক্রিয়া শুরু করার জন্য এবং আপনার জন্য সচল বিশ্ববিদ্যালয়সমূহ দেখতে আপনার প্রোফাইলটি কমপক্ষে ৫০% সম্পন্ন করুন। আপনার বামদিকের প্রোফাইল ফর্মে প্রয়োজনীয় তথ্য দিয়ে সংরক্ষণ বাটনে ক্লিক করলেই আপনার প্রোফাইল স্কোর বৃদ্ধি পাবে।
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-200">
                          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1">
                            <span>আনলক প্রগতি</span>
                            <span>{calculateProfileCompletion(activeApp)}% / ৫০%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="bg-slate-400 h-full transition-all duration-300" style={{ width: `${(calculateProfileCompletion(activeApp) / 50) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* UNLOCKED SIDEBAR PREVIEW WITH START VISA APPLICATION BUTTON */
                      <div className="rounded-2xl border-2 border-brand-sky/30 bg-gradient-to-b from-brand-sky-light/10 to-transparent p-6 shadow-md text-center space-y-4 border-b-4 border-brand-sky">
                        <div className="h-14 w-14 rounded-full bg-brand-sky/10 border border-brand-sky/20 text-brand-sky flex items-center justify-center mx-auto shadow-inner animate-pulse">
                          <Sparkles className="h-6 w-6 text-brand-sky" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-brand-sky-dark">ভিসা আবেদন সচল হয়েছে!</h4>
                          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed text-left">
                            অভিনন্দন! আপনি সফলভাবে ৫০% এর বেশি প্রোফাইল সম্পন্ন করেছেন। বুলগেরিয়ার বিভিন্ন বিশ্ববিদ্যালয়ে আপনার ভিসা ফাইলিং ফাইলটি এখন ওপেন করার জন্য আবেদন প্রক্রিয়া শুরু করুন।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowApplyFormInDashboard(true);
                            setWizardStep(2);
                            setMaxStepReached(2);
                          }}
                          className="w-full rounded-xl bg-slate-900 py-3 text-xs font-black text-white hover:bg-slate-800 transition-all border-b-2 border-brand-gold shadow-md flex items-center justify-center gap-1.5"
                        >
                          <span>স্টুডেন্ট ভিসা আবেদন শুরু করুন</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Global Student Dashboard Logout Bar */}
              <div className="bg-white border-2 border-brand-gold/20 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6" id="student-logout-bar">
                <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
                  <div className="h-10 w-10 rounded-xl bg-brand-sky/10 border border-brand-sky/20 text-brand-sky flex items-center justify-center font-black shrink-0">
                    {activeApp.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">{activeApp.fullName}</span>
                      {calculateProfileCompletion(activeApp) >= 70 && (
                        <span className="inline-flex items-center text-blue-500" title="Verified Profile (70%+ Complete)">
                          <svg className="w-3.5 h-3.5 fill-blue-500 text-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </span>
                      )}
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">লগইনকৃত শিক্ষার্থী</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">পাসপোর্ট: {activeApp.passportNumber} | আইডি: {activeApp.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAppId(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all shrink-0"
                  id="student-logout-btn"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory animate-fade-in" id="dashboard-tabs">
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
              </div>

              {/* Tab 1: Real-time Tracking */}
              {activeTab === 'tracking' && (
                <div className="space-y-6 animate-fade-in" id="tracking-tab-content">
                  {/* 1. Interactive Full-width Student Profile Photo Card at the top */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm relative overflow-hidden w-full text-left" id="student-interactive-profile-card">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-sky via-brand-gold to-brand-sky-dark"></div>
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      {/* Left: Avatar + Names */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4.5 text-center sm:text-left flex-1 min-w-0">
                        {/* Photo container */}
                        <div className="relative w-24 h-24 shrink-0 group">
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
                                <User className="h-10 w-10 text-slate-300" />
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">NO PHOTO</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Camera Upload trigger */}
                          <label 
                            htmlFor="profile-photo-upload-input" 
                            className="absolute bottom-0 right-0 bg-gradient-to-r from-brand-sky to-brand-sky-dark text-white p-1.5 rounded-full shadow-lg border border-white cursor-pointer hover:scale-110 active:scale-95 transition-all"
                            title="ছবি আপলোড করুন"
                          >
                            <Camera className="h-3.5 w-3.5" />
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

                        {/* Name and Passport and Badges */}
                        <div className="space-y-1.5 flex-1 min-w-0 text-left">
                          <div className="flex flex-wrap items-center justify-start gap-2">
                            <h3 className="text-base font-black text-slate-800 flex items-center gap-1">
                              {activeApp.fullName}
                              {calculateProfileCompletion(activeApp) >= 70 && (
                                <span className="inline-flex items-center text-blue-500" title="Verified Profile (70%+ Complete)">
                                  <svg className="w-4 h-4 fill-blue-500 text-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                </span>
                              )}
                              <Sparkles className="h-4 w-4 text-brand-gold shrink-0 animate-pulse" />
                            </h3>
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-sky-light/50 border border-brand-sky/15 text-[9px] text-brand-sky-dark font-extrabold">
                              <Compass className="h-3 w-3" /> Bulgaria Student Portal
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">পাসপোর্ট: <span className="font-mono text-slate-600">{activeApp.passportNumber}</span></p>
                          <div className="text-[11px] text-slate-500 font-medium flex flex-wrap gap-x-3 gap-y-1">
                            <span>ফোন: {activeApp.phone}</span>
                            <span className="text-slate-200">|</span>
                            <span className="truncate max-w-[220px]" title={activeApp.email}>ইমেইল: {activeApp.email}</span>
                          </div>
                          {activeApp.desiredCourse && (
                            <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-2.5 max-w-xl text-[10.5px] leading-relaxed text-slate-600 mt-2">
                              <span className="font-bold text-slate-700">নির্বাচিত বিশ্ববিদ্যালয় ও কোর্স:</span> {activeApp.desiredCourse}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Academic History & Social links */}
                      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                        {/* Academic History Summary */}
                        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-3.5 text-left space-y-1.5 text-[10px] min-w-[220px] flex-1">
                          <h4 className="font-bold text-slate-700 flex items-center gap-1 text-[10px] border-b border-slate-200/60 pb-1">
                            <GraduationCap className="h-3.5 w-3.5 text-brand-sky" />
                            <span>শিক্ষাগত বিবরণ (Academic Details)</span>
                          </h4>
                          {activeApp.academicHistory && (activeApp.academicHistory.sscSchool || activeApp.academicHistory.hscCollege || activeApp.academicHistory.bachelorUni) ? (
                            <div className="space-y-0.5 text-slate-600">
                              {activeApp.academicHistory.sscSchool && (
                                <p><span className="font-bold text-slate-800">SSC:</span> {activeApp.academicHistory.sscSchool} ({activeApp.academicHistory.sscYear || 'N/A'}) - GPA: {activeApp.academicHistory.sscGpa || 'N/A'}</p>
                              )}
                              {activeApp.academicHistory.hscCollege && (
                                <p><span className="font-bold text-slate-800">HSC:</span> {activeApp.academicHistory.hscCollege} ({activeApp.academicHistory.hscYear || 'N/A'}) - GPA: {activeApp.academicHistory.hscGpa || 'N/A'}</p>
                              )}
                              {activeApp.academicHistory.bachelorUni && (
                                <p><span className="font-bold text-slate-800">Bachelor:</span> {activeApp.academicHistory.bachelorUni} CGPA: {activeApp.academicHistory.bachelorCgpa || 'N/A'}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic text-[9px]">কোনো শিক্ষাগত ইতিহাস সেট করা হয়নি।</p>
                          )}
                        </div>

                        {/* Social Media Links Summary */}
                        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-3.5 text-left space-y-2 text-[10px] min-w-[180px]">
                          <h4 className="font-bold text-slate-700 flex items-center gap-1 text-[10px] border-b border-slate-200/60 pb-1">
                            <Globe className="h-3.5 w-3.5 text-brand-sky" />
                            <span>সোশ্যাল প্রোফাইল (Social Profiles)</span>
                          </h4>
                          {activeApp.socialMedia && (activeApp.socialMedia.facebook || activeApp.socialMedia.linkedin || activeApp.socialMedia.whatsapp) ? (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {activeApp.socialMedia.facebook && (
                                <a
                                  href={activeApp.socialMedia.facebook}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors text-[9px] font-bold"
                                >
                                  <Facebook className="h-2.5 w-2.5" />
                                  <span>Facebook</span>
                                </a>
                              )}
                              {activeApp.socialMedia.linkedin && (
                                <a
                                  href={activeApp.socialMedia.linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors text-[9px] font-bold"
                                >
                                  <Linkedin className="h-2.5 w-2.5" />
                                  <span>LinkedIn</span>
                                </a>
                              )}
                              {activeApp.socialMedia.whatsapp && (
                                <a
                                  href={`https://wa.me/${activeApp.socialMedia.whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors text-[9px] font-bold"
                                >
                                  <MessageCircle className="h-2.5 w-2.5" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic text-[9px]">কোনো সোশ্যাল লিংক যুক্ত করা হয়নি।</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditProfileData({
                            fullName: activeApp.fullName,
                            passportNumber: activeApp.passportNumber,
                            email: activeApp.email,
                            phone: activeApp.phone,
                            sscSchool: activeApp.academicHistory?.sscSchool || '',
                            sscGpa: activeApp.academicHistory?.sscGpa || '',
                            sscYear: activeApp.academicHistory?.sscYear || '',
                            hscCollege: activeApp.academicHistory?.hscCollege || '',
                            hscGpa: activeApp.academicHistory?.hscGpa || '',
                            hscYear: activeApp.academicHistory?.hscYear || '',
                            bachelorUni: activeApp.academicHistory?.bachelorUni || '',
                            bachelorCgpa: activeApp.academicHistory?.bachelorCgpa || '',
                            bachelorYear: activeApp.academicHistory?.bachelorYear || '',
                            facebook: activeApp.socialMedia?.facebook || '',
                            linkedin: activeApp.socialMedia?.linkedin || '',
                            whatsapp: activeApp.socialMedia?.whatsapp || ''
                          });
                          setEditProfileError('');
                          setIsEditingProfile(!isEditingProfile);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 transition-all"
                      >
                        <span>{isEditingProfile ? 'এডিট ফর্ম বন্ধ করুন (Close Edit Form)' : 'প্রোফাইল সংশোধন করুন (Edit Profile)'}</span>
                      </button>
                    </div>

                    {/* Inline Expandable Edit Form inside tracking area */}
                    <AnimatePresence>
                      {isEditingProfile && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-slate-100 overflow-hidden"
                        >
                          <div className="grid gap-4 md:grid-cols-2 text-left">
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
                          </div>

                          <div className="border-t border-slate-100 mt-4 pt-4 grid gap-4 sm:grid-cols-3 text-left">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                              <h5 className="text-[11px] font-black text-slate-700">SSC বিবরণী</h5>
                              <input
                                placeholder="School Name"
                                type="text"
                                value={editProfileData.sscSchool}
                                onChange={(e) => setEditProfileData({ ...editProfileData, sscSchool: e.target.value })}
                                className="w-full rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  placeholder="Year"
                                  type="text"
                                  value={editProfileData.sscYear}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, sscYear: e.target.value })}
                                  className="rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                                />
                                <input
                                  placeholder="GPA"
                                  type="text"
                                  value={editProfileData.sscGpa}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, sscGpa: e.target.value })}
                                  className="rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                              <h5 className="text-[11px] font-black text-slate-700">HSC বিবরণী</h5>
                              <input
                                placeholder="College Name"
                                type="text"
                                value={editProfileData.hscCollege}
                                onChange={(e) => setEditProfileData({ ...editProfileData, hscCollege: e.target.value })}
                                className="w-full rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  placeholder="Year"
                                  type="text"
                                  value={editProfileData.hscYear}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, hscYear: e.target.value })}
                                  className="rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                                />
                                <input
                                  placeholder="GPA"
                                  type="text"
                                  value={editProfileData.hscGpa}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, hscGpa: e.target.value })}
                                  className="rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                              <h5 className="text-[11px] font-black text-slate-700">Bachelor বিবরণী (ঐচ্ছিক)</h5>
                              <input
                                placeholder="University Name"
                                type="text"
                                value={editProfileData.bachelorUni}
                                onChange={(e) => setEditProfileData({ ...editProfileData, bachelorUni: e.target.value })}
                                className="w-full rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  placeholder="Year"
                                  type="text"
                                  value={editProfileData.bachelorYear}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, bachelorYear: e.target.value })}
                                  className="rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                                />
                                <input
                                  placeholder="CGPA"
                                  type="text"
                                  value={editProfileData.bachelorCgpa}
                                  onChange={(e) => setEditProfileData({ ...editProfileData, bachelorCgpa: e.target.value })}
                                  className="rounded border border-slate-200 p-1.5 text-[10px] bg-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 mt-4 pt-4 grid gap-4 sm:grid-cols-3 text-left">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Facebook profile link:</label>
                              <input
                                type="text"
                                value={editProfileData.facebook}
                                onChange={(e) => setEditProfileData({ ...editProfileData, facebook: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">LinkedIn profile link:</label>
                              <input
                                type="text"
                                value={editProfileData.linkedin}
                                onChange={(e) => setEditProfileData({ ...editProfileData, linkedin: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">WhatsApp number:</label>
                              <input
                                type="text"
                                value={editProfileData.whatsapp}
                                onChange={(e) => setEditProfileData({ ...editProfileData, whatsapp: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                          </div>

                          {editProfileError && (
                            <p className="text-[10px] font-black text-brand-red bg-rose-50 border border-rose-100 p-2 rounded-lg leading-snug mt-3">
                              {editProfileError}
                            </p>
                          )}

                          <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                if (!editProfileData.fullName.trim() || !editProfileData.passportNumber.trim() || !editProfileData.email.trim() || !editProfileData.phone.trim()) {
                                  setEditProfileError('অনুগ্রহ করে প্রোফাইলের সব তথ্য সঠিকভাবে পূরণ করুন।');
                                  return;
                                }
                                setEditProfileError('');
                                
                                const updatedApp: Application = {
                                  ...activeApp,
                                  fullName: editProfileData.fullName.trim(),
                                  passportNumber: editProfileData.passportNumber.trim().toUpperCase(),
                                  phone: editProfileData.phone.trim(),
                                  email: editProfileData.email.trim(),
                                  academicHistory: {
                                    sscSchool: editProfileData.sscSchool?.trim(),
                                    sscGpa: editProfileData.sscGpa?.trim(),
                                    sscYear: editProfileData.sscYear?.trim(),
                                    hscCollege: editProfileData.hscCollege?.trim(),
                                    hscGpa: editProfileData.hscGpa?.trim(),
                                    hscYear: editProfileData.hscYear?.trim(),
                                    bachelorUni: editProfileData.bachelorUni?.trim(),
                                    bachelorCgpa: editProfileData.bachelorCgpa?.trim(),
                                    bachelorYear: editProfileData.bachelorYear?.trim()
                                  },
                                  socialMedia: {
                                    facebook: editProfileData.facebook?.trim(),
                                    linkedin: editProfileData.linkedin?.trim(),
                                    whatsapp: editProfileData.whatsapp?.trim()
                                  }
                                };
                                onUpdateApplication(updatedApp);
                                setIsEditingProfile(false);
                              }}
                              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2 text-xs font-black transition-all shadow-sm"
                            >
                              সংরক্ষণ করুন (Save)
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 text-xs font-bold transition-all"
                            >
                              বাতিল (Cancel)
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-3 mt-4">
                    {/* Tracker Timeline Column */}
                    <div className="space-y-6 lg:col-span-2 text-left">
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
                        <h3 className="font-display font-bold text-slate-800 text-sm mb-6 border-b border-slate-50 pb-3 text-left">
                          আপনার আবেদনের বর্তমান অবস্থা (Live Processing Status)
                        </h3>

                        <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8 text-left">
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
                              desc: 'ভারতীয় ট্রানজিট ভিসা বুকিং সম্পন্ন এবং দিল্লীস্থ দৈনিক দূতাবাসে অ্যাপয়েন্টমেন্ট বুকিং প্রসেস।',
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
                      <div className="rounded-xl bg-brand-sky-light p-4 border border-brand-sky/20 flex items-start space-x-3 text-left">
                        <ShieldAlert className="h-5 w-5 text-brand-sky shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-brand-sky-dark">জরুরি রিয়েল-тайм নির্দেশনা</h4>
                          <p className="text-[11px] text-slate-700 leading-relaxed mt-1">
                            বুলগেরিয়া দূতাবাস দিল্লীতে হওয়ায় আমরা আপনার ভারতীয় ডাবল এন্ট্রি visa এবং দিল্লী ভ্রমণের সমস্ত হোটেল ও কনভেয়েন্স শিডিউল এখান থেকেই কন্ট্রোল করছি। প্রতিটি বড় আপডেটের পর আপনার ফোনে স্বয়ংক্রিয় এসএমএস (SMS) চলে যাবে।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress countdown card */}
                    <div className="space-y-6 lg:col-span-1 text-left">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" id="progress-intake-countdown-card">
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
                          <div className="text-right font-mono">
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
            </>
          )
        )}

      {/* Floating Support Chat Widget */}
      {activeApp && (
        <div className="fixed bottom-6 right-6 z-40 font-sans" id="floating-support-chat-widget">
          <AnimatePresence>
            {isChatWidgetOpen ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-80 sm:w-96 h-[480px] flex flex-col overflow-hidden mb-4"
                id="chat-widget-panel"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                        <User className="h-5 w-5 text-brand-gold" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-white">Sodi Euro Support Team</h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>অনলাইন (Online & Active)</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChatWidgetOpen(false)}
                    className="rounded-full p-1 bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                {/* Message History area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70" id="chat-widget-message-container">
                  {(!activeApp.messages || activeApp.messages.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="text-2xl">👋</div>
                      <h5 className="text-xs font-bold text-slate-700">হ্যালো! কিভাবে সাহায্য করতে পারি?</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">
                        বুলগেরিয়া স্টুডেন্ট ভিসা ও ফাইল প্রসেসিং সংক্রান্ত যেকোনো প্রশ্ন এখানে লিখুন। আমাদের টিম দ্রুত উত্তর দেবে।
                      </p>
                    </div>
                  ) : (
                    activeApp.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          msg.sender === 'student' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1 flex items-center gap-1">
                          {msg.sender === 'student' ? (
                            <span>আমার বার্তা (Student)</span>
                          ) : (
                            <>
                              {msg.adminPhoto && (
                                <img src={msg.adminPhoto} alt="" className="h-3.5 w-3.5 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                              )}
                              <span>{msg.adminName || 'ম্যানেজার (Admin)'}</span>
                            </>
                          )}
                        </span>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed ${
                            msg.sender === 'student'
                              ? 'bg-slate-900 text-white rounded-br-none'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm shadow-slate-100/50'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 px-1">{msg.sentAt}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input section */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!studentMsgText.trim()) return;
                    handleSendStudentMessage(studentMsgText);
                    setStudentMsgText('');
                  }}
                  className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0"
                >
                  <input
                    type="text"
                    value={studentMsgText}
                    onChange={(e) => setStudentMsgText(e.target.value)}
                    placeholder="আপনার মেসেজটি এখানে লিখুন..."
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky/25 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!studentMsgText.trim()}
                    className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 p-2.5 text-xs font-black disabled:bg-slate-100 disabled:text-slate-400 transition-all active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="button"
                id="live-chat-floating-btn"
                onClick={() => {
                  setIsChatWidgetOpen(true);
                  markMessagesAsRead();
                }}
                className="rounded-full bg-slate-900 hover:bg-slate-800 text-white p-4 shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-2 border-brand-gold group"
              >
                <div className="relative">
                  <MessageCircle className="h-5.5 w-5.5 text-white" />
                  {(() => {
                    const unreadCount = activeApp.messages?.filter(m => m.sender === 'admin' && !m.read).length || 0;
                    return unreadCount > 0 ? (
                      <span className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-slate-900 animate-bounce">
                        {unreadCount}
                      </span>
                    ) : null;
                  })()}
                </div>
                <span className="text-xs font-black tracking-wide pr-1">Live Chat</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
