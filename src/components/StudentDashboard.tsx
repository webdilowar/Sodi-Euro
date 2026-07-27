import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Application, UploadedDocument, PaymentConfig } from '../types';
import { documentRequirements, serviceOptions } from '../data';
import { ChatAttachmentList } from './ChatAttachmentList';
import { compressImageFile } from '../utils/imageCompressor';
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
  Trash2,
  Image as ImageIcon,
  LogOut
} from 'lucide-react';

interface StudentDashboardProps {
  applications: Application[];
  onAddApplication: (app: Application) => void;
  onUpdateApplication: (app: Application) => void;
  activeAppId: string | null;
  setActiveAppId: (id: string | null) => void;
  paymentConfig?: PaymentConfig;
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
      'BSc in Computer Science',
      'BSc in Telecommunications',
      'BSc in Aeronautical Engineering',
      'MSc in Cybersecurity'
    ],
    logoColor: 'from-blue-500 to-sky-400',
    tuitionFee: '€3,000 - €3,500 / year',
    location: 'Sofia'
  },
  'Sofia University St. Kliment Ohridski': {
    courses: [
      'BSc in Software Engineering',
      'BSc in Information Systems',
      'MSc in Artificial Intelligence',
      'BSc in Business Administration'
    ],
    logoColor: 'from-amber-500 to-amber-300',
    tuitionFee: '€3,300 - €3,800 / year',
    location: 'Sofia'
  },
  'Medical University of Sofia': {
    courses: [
      'BSc in Medicine (MBBS)',
      'BSc in Dentistry',
      'BSc in Pharmacy',
      'MSc in Public Health'
    ],
    logoColor: 'from-teal-500 to-emerald-400',
    tuitionFee: '€4,000 - €8,000 / year',
    location: 'Sofia'
  },
  'Varna University of Management': {
    courses: [
      'MSc in International Business',
      'BSc in International Hospitality Management',
      'MBA (Global MBA)',
      'BSc in Software Systems Development'
    ],
    logoColor: 'from-purple-500 to-indigo-400',
    tuitionFee: '€3,000 - €4,500 / year',
    location: 'Varna'
  },
  'Technical University of Varna': {
    courses: [
      'MBA (Business Administration)',
      'BSc in Marine Engineering',
      'BSc in Electrical Engineering',
      'MSc in Software Engineering'
    ],
    logoColor: 'from-sky-500 to-blue-400',
    tuitionFee: '€2,800 - €3,200 / year',
    location: 'Varna'
  }
};

export default function StudentDashboard({
  applications,
  onAddApplication,
  onUpdateApplication,
  activeAppId,
  setActiveAppId,
  paymentConfig
}: StudentDashboardProps) {
  const { language, t } = useLanguage();
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
    if (app.fullName?.trim()) percent += 10;
    if (app.passportNumber?.trim()) percent += 10;
    if (app.phone?.trim()) percent += 10;
    if (app.email?.trim()) percent += 10;
    if (app.profilePhoto?.trim()) percent += 10;
    
    if (app.academicHistory) {
      const ssc = app.academicHistory;
      if (ssc.sscSchool?.trim()) percent += 5;
      if (ssc.sscYear?.trim()) percent += 5;
      if (ssc.sscGpa?.trim()) percent += 5;
      
      if (ssc.hscCollege?.trim()) percent += 5;
      if (ssc.hscYear?.trim()) percent += 5;
      if (ssc.hscGpa?.trim()) percent += 5;
      
      if (ssc.bachelorUni?.trim()) percent += 4;
      if (ssc.bachelorYear?.trim()) percent += 3;
      if (ssc.bachelorCgpa?.trim()) percent += 3;
    }
    
    if (app.socialMedia) {
      if (app.socialMedia.facebook?.trim()) percent += 4;
      if (app.socialMedia.linkedin?.trim()) percent += 3;
      if (app.socialMedia.whatsapp?.trim()) percent += 3;
    }
    
    return Math.min(100, percent);
  };

  // Login / Track Search states (using Passport Number as Username and Password)
  const [searchQuery, setSearchQuery] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [searchError, setSearchError] = useState('');

  // Live Chat messages state
  const [studentMsgText, setStudentMsgText] = useState('');
  const [studentChatFile, setStudentChatFile] = useState('');
  const [studentChatFileName, setStudentChatFileName] = useState('');

  // Direct Payment Gateway States
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [selectedGatewayAccountIdx, setSelectedGatewayAccountIdx] = useState(0);
  const [studentSenderPhone, setStudentSenderPhone] = useState('');
  const [studentTxnId, setStudentTxnId] = useState('');
  const [studentPaymentScreenshot, setStudentPaymentScreenshot] = useState('');
  const [studentPaymentScreenshotName, setStudentPaymentScreenshotName] = useState('');
  const [studentPaymentSuccessMsg, setStudentPaymentSuccessMsg] = useState('');

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
      setSearchError('Please provide both passport number and password.');
      return;
    }

    if (searchQuery.trim().toUpperCase() !== studentPassword.trim().toUpperCase()) {
      setSearchError('Incorrect password! Use your passport number as both username and password.');
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
      setSearchError('No student record found with this passport number. Click "Apply New Student File" below to begin.');
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
      setVerifyError('Incorrect password! Enter the student passport number as password.');
    }
  };

  // Handle New Application Submission
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // If we have an active logged-in application that is in 'Registered' status
    if (activeApp && activeApp.status === 'Registered') {
      if (!selectedApplyUni || !selectedApplyCourse) {
        setFormError('Please select a university and program.');
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
            title: 'Visa Application Submitted Successfully',
            body: `Dear ${activeApp.fullName}, your student visa application was created successfully. Total fee: ৳${calculatedTotal.toLocaleString()} BDT. Payments and document uploads are now active.`,
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
      setFormError('Please fill in all details correctly.');
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
      setFormError('Please enter a valid 11-digit mobile number.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address (e.g. example@gmail.com)');
      return;
    }

    if (!selectedApplyUni || !selectedApplyCourse) {
      setFormError('Please select a university and program from the University & Course step.');
      return;
    }

    // Check if email already exists
    const emailLower = email.trim().toLowerCase();
    const emailExists = applications.find(a => a.email.toLowerCase() === emailLower);
    if (emailExists) {
      setFormError('An account with this email already exists! Please log in.');
      return;
    }

    // Check if passport already exists
    const exists = applications.find(a => a.passportNumber.toUpperCase() === passportNumber.toUpperCase());
    if (exists) {
      setFormError('An application with this passport number already exists!');
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
          title: 'Application Created Successfully',
          body: `Dear ${fullName}, your student portal account has been created. ID: ${newId}. Total fee: ৳${calculatedTotal.toLocaleString()} BDT.`,
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
    setSelectedApplyCourse('BSc in Computer Science');
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

        // Compress image file or read file securely to avoid huge base64 payloads
        compressImageFile(file).then((compressedBase64) => {
          newDoc.fileUrl = compressedBase64;
          const filteredDocs = activeApp.documents.filter(d => d.category !== currentUploadingCategory);
          const updatedApp: Application = {
            ...activeApp,
            documents: [...filteredDocs, newDoc]
          };
          onUpdateApplication(updatedApp);
        }).catch(() => {
          const filteredDocs = activeApp.documents.filter(d => d.category !== currentUploadingCategory);
          const updatedApp: Application = {
            ...activeApp,
            documents: [...filteredDocs, newDoc]
          };
          onUpdateApplication(updatedApp);
        });

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
            title: `Additional Service Payment Successful - ৳${cartTotal.toLocaleString()} BDT`,
            body: `Dear ${activeApp.fullName}, your payment of ৳${cartTotal.toLocaleString()} BDT for selected services (${serviceNames}) was successful. TrxID: ${txnId}.`,
            type: 'email' as const,
            sentAt: currentTimestamp,
            recipient: activeApp.email
          },
          {
            id: `not-pay-cart-sms-${Date.now()}`,
            title: `Service Fee Payment Confirmed`,
            body: `Payment of ৳${cartTotal.toLocaleString()} BDT for additional services (${serviceNames}) confirmed. TrxID: ${txnId}.`,
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
      paymentOptionLabel = 'Full Payment';
      nextInstallments[0].status = 'Paid';
      nextInstallments[1].status = 'Paid';
    } else if (selectedInstallmentChoice === 'inst1') {
      payingAmount = inst1Amt;
      nextPaidAmount = inst1Amt;
      nextStatus = 'Partially Paid';
      paymentOptionLabel = '1st Installment';
      nextInstallments[0].status = 'Paid';
    } else if (selectedInstallmentChoice === 'inst2') {
      payingAmount = inst2Amt;
      nextPaidAmount = totalAmt;
      nextStatus = 'Paid';
      paymentOptionLabel = '2nd Installment';
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
          title: `Payment Successful - ${paymentOptionLabel}`,
          body: `Dear ${activeApp.fullName}, your payment of ৳${payingAmount.toLocaleString()} BDT (${paymentOptionLabel}) was successful. TrxID: ${txnId}.`,
          type: 'email' as const,
          sentAt: currentTimestamp,
          recipient: activeApp.email
        },
        {
          id: `not-pay-sms-${Date.now()}`,
          title: `Payment Received (${paymentOptionLabel})`,
          body: `Payment of ৳${payingAmount.toLocaleString()} BDT (${paymentOptionLabel}) confirmed. TrxID: ${txnId}.`,
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
    if (!activeApp || (!text.trim() && !studentChatFile)) return;
    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student' as const,
      text: text.trim(),
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
        return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-100">Application Submitted</span>;
      case 'Document Verification':
        return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-100">Document Verification</span>;
      case 'Embassy Processing':
        return <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-600 border border-purple-100">Delhi Embassy Processing</span>;
      case 'Visa Issued':
        return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-100">Visa Stamped (Approved)</span>;
      case 'Rejected':
        return <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 border border-rose-100">Rejected</span>;
      default:
        return null;
    }
  };

  const handleDirectSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupName.trim() || !signupPassport.trim() || !signupEmail.trim() || !signupPhone.trim()) {
      setSignupError('Please fill in all information correctly.');
      return;
    }

    const passportUpper = signupPassport.trim().toUpperCase();
    const exists = applications.find(a => a.passportNumber.toUpperCase() === passportUpper);
    if (exists) {
      setSignupError('An account with this passport number already exists! Please log in.');
      return;
    }

    const emailLower = signupEmail.trim().toLowerCase();
    const emailExists = applications.find(a => a.email.toLowerCase() === emailLower);
    if (emailExists) {
      setSignupError('An account with this email address already exists! Please log in.');
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
          title: 'Account Registration & File Opened Successfully',
          body: `Dear ${signupName.trim()}, your NOVENTRA student portal account has been created successfully. ID: ${newId}. Please complete your profile for student visa application.`,
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
            <div className="w-20 h-20 rounded-full bg-white border-2 border-amber-500/30 text-slate-900 flex items-center justify-center mx-auto shadow-lg overflow-hidden p-1">
              <img src="/logo.png" alt="NOVENTRA Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="font-sans font-black text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs uppercase tracking-wider inline-block">
              NOVENTRA Student Portal
            </span>
            <h1 className="font-sans text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Global Education & Student Visa Portal</h1>
            <p className="text-xs font-bold text-slate-500 max-w-md mx-auto leading-relaxed">
              Gateway to Global Education • SINCE : 2026
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
              Login
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
              Sign Up
            </button>
          </div>

          <div className="rounded-2xl border-2 border-brand-gold/15 bg-white p-6 shadow-xl space-y-6 transform-style-3d hover:shadow-2xl hover:shadow-brand-sky/5 transition-all duration-300">
            {authMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleStudentLogin} className="space-y-4" id="track-form">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Passport Number:</label>
                    <div className="relative">
                      <input
                        id="track-search-input"
                        required
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., EF0129384"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold uppercase"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Password:</label>
                    <div className="relative">
                      <input
                        required
                        type="password"
                        placeholder="Login password (your passport number)"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold font-mono"
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Type your passport number as both username and password to log in to dashboard.</p>
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
                  Login & Track
                </button>
              </form>
            ) : (
              /* DIRECT SIGNUP FORM (NO OTP REQUIRED) */
              <form onSubmit={handleDirectSignup} className="space-y-4">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Student Full Name (as in passport):</label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="e.g., MD KAMRUL HASAN"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Passport Number:</label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="e.g., EF0129384"
                        value={signupPassport}
                        onChange={(e) => setSignupPassport(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold uppercase"
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">* This will be your password to log in to your tracking dashboard.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Email Address:</label>
                    <div className="relative">
                      <input
                        required
                        type="email"
                        placeholder="e.g., student@gmail.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-xs focus:border-brand-sky focus:outline-none focus:ring-1 focus:ring-brand-sky font-semibold"
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Mobile Number:</label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        maxLength={11}
                        placeholder="e.g., 017XXXXXXXX"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
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
                  Create Account & Open File Directly
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
                    <span>Bulgaria Student Visa Filing Portal</span>
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-500">Complete your file opening process in easy and automated steps.</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-brand-sky-light text-brand-sky border border-brand-sky/25 rounded-lg shrink-0">
                  Step {wizardStep} / 4
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
                    { step: 1, label: "Personal Info" },
                    { step: 2, label: "University & Course" },
                    { step: 3, label: "Services" },
                    { step: 4, label: "Review & Submit" }
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
                          title={`Go to step ${s.step}`}
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
                            Please provide your accurate passport and contact details. Your dashboard account will be created based on this information.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">Full Name (as in passport):</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g., MD KAMRUL HASAN"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">Passport Number:</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g., EF0129384"
                              value={formData.passportNumber}
                              onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-brand-sky focus:outline-none uppercase"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">Email Address:</label>
                            <input
                              required
                              type="email"
                              placeholder="e.g., kamrul@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">Mobile Number (for SMS notifications):</label>
                            <input
                              required
                              type="tel"
                              maxLength={11}
                              placeholder="e.g., 01712345678"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
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
                                setFormError('Please fill in all personal information fields correctly.');
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
                                setFormError('Please enter a valid 11-digit mobile number (e.g., 017XXXXXXXX)');
                                return;
                              }

                              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                                setFormError('Please enter a valid email address (e.g., example@gmail.com)');
                                return;
                              }

                              setFormError('');
                              setWizardStep(2);
                              setMaxStepReached(prev => Math.max(prev, 2));
                            }}
                            className="inline-flex items-center space-x-1 rounded-xl bg-brand-sky px-5 py-2.5 text-xs font-black text-white hover:bg-brand-sky-dark transition-colors"
                          >
                            <span>Next Step</span>
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
                            <span>1. Select Bulgarian University</span>
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
                                <span className="text-xs font-black text-brand-sky">Select University</span>
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
                                  2. Choose Program & Course
                                </label>
                                <p className="text-[9px] text-slate-400">Available courses for the selected university.</p>
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
                            <span>Previous</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedApplyUni || !selectedApplyCourse) {
                                setFormError('Please select a university and course.');
                                return;
                              }
                              setFormError('');
                              setWizardStep(3);
                              setMaxStepReached(prev => Math.max(prev, 3));
                            }}
                            className="inline-flex items-center space-x-1 rounded-xl bg-brand-sky px-5 py-2.5 text-xs font-black text-white hover:bg-brand-sky-dark transition-colors"
                          >
                            <span>Next Step</span>
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
                            <span>Select Processing Services</span>
                          </label>
                          <p className="text-[10px] text-slate-500">Check the services required for your file. Total fee is calculated automatically.</p>
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
                                    <span className="block text-[8px] text-amber-600 font-extrabold bg-amber-50 px-1 rounded border border-amber-100 mt-0.5 text-center">Mandatory</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Running Total Preview */}
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-3.5 px-1">
                          <span className="text-xs font-bold text-slate-700">Total processing fee based on selected services:</span>
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
                            <span>Previous</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setWizardStep(4);
                              setMaxStepReached(prev => Math.max(prev, 4));
                            }}
                            className="inline-flex items-center space-x-1 rounded-xl bg-brand-sky px-5 py-2.5 text-xs font-black text-white hover:bg-brand-sky-dark transition-colors"
                          >
                            <span>Review & Submit</span>
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
                            <h4 className="text-xs font-extrabold">Everything looks good! Please review your details</h4>
                            <p className="text-[10px] text-emerald-700">If the information below is correct, click "Open File & Submit" to complete account creation.</p>
                          </div>
                        </div>

                        {/* Bento Grid Summary */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Student Details Info */}
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                            <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-400" />
                              <span>Personal Info</span>
                            </h4>
                            <div className="space-y-1 text-xs text-slate-700 font-semibold">
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">Name:</span>
                                <span>{formData.fullName}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">Passport:</span>
                                <span className="uppercase font-mono">{formData.passportNumber}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">Mobile:</span>
                                <span>{formData.phone}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400 font-medium">Email:</span>
                                <span className="truncate max-w-[150px]" title={formData.email}>{formData.email}</span>
                              </p>
                            </div>
                          </div>

                          {/* Selected University & Course */}
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                            <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <GraduationCap className="h-3 w-3 text-slate-400" />
                              <span>Institution & Course</span>
                            </h4>
                            <div className="space-y-1 text-xs text-slate-700 font-semibold">
                              <p className="text-slate-800 font-bold leading-tight">{selectedApplyUni || 'No university selected'}</p>
                              <p className="text-slate-500 font-medium text-[11px] leading-snug">{selectedApplyCourse || 'No course selected'}</p>
                              <p className="text-brand-gold-dark text-[10px] pt-1.5 border-t border-slate-200/50 flex items-center">
                                <Coins className="h-3 w-3 mr-1" />
                                Tuition Fee: {selectedApplyUni ? (universityCoursesMap[selectedApplyUni]?.tuitionFee || 'N/A') : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Selected Services Breakdown */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                          <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            <span>Selected Services & Fee Details</span>
                          </h4>
                          <div className="space-y-1.5">
                            {serviceOptions
                              .filter(s => s.isMandatory || selectedServices.includes(s.id))
                              .map(s => (
                                <div key={s.id} className="flex justify-between text-xs font-semibold text-slate-700">
                                  <span className="text-slate-600 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sky"></span>
                                    {s.nameEn || s.name}
                                  </span>
                                  <span className="font-mono text-slate-800">৳{s.price.toLocaleString()}</span>
                                </div>
                              ))}
                          </div>
                          
                          <div className="border-t border-slate-200 pt-2.5 mt-2.5 flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800">Grand Total Processing Fee:</span>
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
                            <span>Previous</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleApplySubmit(e)}
                            className="inline-flex items-center space-x-1 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                          >
                            <span>Open File & Submit</span>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-brand-gold animate-pulse" />
                      <span>Complete Your Profile</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your profile must be at least 50% complete for student visa application. Current profile completion progress:
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-black text-brand-sky">{calculateProfileCompletion(activeApp)}%</span>
                      <span className="text-xs font-bold text-slate-400">Completed</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveAppId(null)}
                      title="Logout"
                      className="p-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all text-xs font-bold flex items-center gap-1.5 shrink-0"
                      id="student-logout-btn"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
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
                      <p className="text-xs font-bold text-amber-800 leading-tight">Visa Application Gated</p>
                      <p className="text-[11px] text-amber-600 font-semibold mt-1">
                        Once your profile reaches 50% completion, the Bulgaria student visa application (selecting university, course, and additional services) will be unlocked. Please update your academic and social links below to reach 50%.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3 text-left">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 leading-tight">Visa Application Unlocked!</p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        Congratulations! Your profile is 50% or more complete. You can now start the Bulgaria student visa process. Click "Start Student Visa Application" in the panel below.
                      </p>
                    </div>
                  </div>
                )}

              {showApplyFormInDashboard ? (
                /* INLINE UNIVERSITY/COURSE FILING WIZARD */
                <div className="rounded-2xl border-2 border-brand-sky/20 bg-white p-5 md:p-6 shadow-xl space-y-6 text-left">
                  <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-black text-slate-800 text-base md:text-lg">Start Bulgaria Student Visa Application</h3>
                      <p className="text-[10px] md:text-xs text-slate-500">Select your university, program, and required services.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplyFormInDashboard(false);
                        setWizardStep(1);
                      }}
                      className="text-xs font-bold text-rose-500 hover:underline bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* STEP 2: University & Course Selection */}
                  {wizardStep === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="relative">
                        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                          <School className="h-4 w-4 text-brand-sky" />
                          <span>1. Select Bulgarian University</span>
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
                              <span className="text-xs font-black text-brand-sky">Choose University</span>
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
                            2. Choose Program & Course:
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
                          <span>Next Step</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Services Selection */}
                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Select Processing Services</h4>
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
                                  {isMandatory && <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded">Mandatory</span>}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-snug">{service.description}</p>
                              </div>
                              <div className="mt-3 pt-2.5 border-t border-slate-100/70 flex justify-between items-center">
                                <span className="text-xs font-bold font-mono text-slate-700">৳{service.price.toLocaleString()} BDT</span>
                                <span className={`text-[10px] font-black ${isSelected ? 'text-brand-sky' : 'text-slate-400'}`}>
                                  {isSelected ? '✓ Selected' : '+ Add'}
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
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="rounded-xl bg-slate-900 text-white px-6 py-2.5 text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md border-b-2 border-brand-gold"
                        >
                          <span>Review</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Review & Submit */}
                  {wizardStep === 4 && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-200/60 pb-2">Application Review & Details Verification</h4>
                        <div className="grid gap-4 sm:grid-cols-2 text-xs">
                          <div>
                            <span className="text-slate-400 block font-bold uppercase text-[9px]">Selected University</span>
                            <span className="font-bold text-slate-700">{selectedApplyUni}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold uppercase text-[9px]">Selected Program</span>
                            <span className="font-bold text-slate-700">{selectedApplyCourse}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/60 pt-3 space-y-2">
                          <span className="text-slate-400 block font-bold uppercase text-[9px]">Selected Services & Fee Breakdown</span>
                          <div className="space-y-1.5">
                            {serviceOptions
                              .filter(s => s.isMandatory || selectedServices.includes(s.id))
                              .map(s => (
                                <div key={s.id} className="flex justify-between text-xs font-semibold text-slate-700">
                                  <span className="text-slate-600 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sky"></span>
                                    {s.nameEn || s.name}
                                  </span>
                                  <span className="font-mono text-slate-800">৳{s.price.toLocaleString()} BDT</span>
                                </div>
                              ))}
                          </div>
                          
                          <div className="border-t border-slate-200 pt-2.5 mt-2.5 flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800">Grand Total Processing Fee:</span>
                            <span className="text-xs font-black bg-brand-gold text-slate-950 px-3 py-1 rounded-lg border border-brand-gold-dark font-mono shadow-sm">
                              ৳{serviceOptions
                                .filter(s => s.isMandatory || selectedServices.includes(s.id))
                                .reduce((sum, s) => sum + s.price, 0).toLocaleString()} BDT
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/30 mt-2">
                            * As per regulations, total fee is split into 2 equal installments (50% first installment after file preparation and remaining at visa stamping).
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
                          Previous
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleApplySubmit}
                          className="rounded-xl bg-gradient-to-r from-brand-sky to-brand-sky-dark text-white px-6 py-2.5 text-xs font-black border-b-2 border-brand-gold shadow-md flex items-center gap-1.5"
                        >
                          <span>Open File & Activate Portal</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Edit Profile Column */}
                  <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm space-y-6 text-left">
                      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-display text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-brand-sky" />
                            <span>Update Profile Information</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Fill in and save all information accurately to ensure the validity of your application.
                          </p>
                        </div>
                        <span className="self-start sm:self-center inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-brand-sky/10 text-brand-sky border border-brand-sky/20 shrink-0">
                          {calculateProfileCompletion(activeApp)}% Completed
                        </span>
                      </div>
                      <div className="space-y-6">
                         {/* Profile Photo Capture / Upload */}
                        <div className="space-y-3 text-left">
                          <label className="text-xs font-black text-slate-700 block">1. Profile Photo:</label>
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
                                  placeholder="Photo URL"
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
                                  <span>Upload</span>
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
                              <p className="text-[10px] text-slate-400 font-semibold">e.g. https://images.unsplash.com/... or upload your image directly.</p>
                            </div>
                          </div>
                        </div>

                        {/* Academics Section */}
                        <div className="space-y-4 pt-5 border-t border-slate-100 text-left">
                          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <GraduationCap className="h-4.5 w-4.5 text-brand-sky" />
                            <span>2. Academic History:</span>
                          </h4>

                          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                            {/* SSC */}
                            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">SSC School Name:</label>
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
                                  placeholder="Passing Year"
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
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">HSC College Name:</label>
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
                                  placeholder="Passing Year"
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
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Bachelor University (Optional):</label>
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
                                  placeholder="Passing Year"
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
                           <span>3. Social Media & Contact Links:</span>
                         </h4>

                         <div className="grid gap-4 sm:grid-cols-3">
                           <div className="space-y-1">
                             <label className="text-[11px] font-bold text-slate-600 block">Facebook Profile Link:</label>
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
                             <label className="text-[11px] font-bold text-slate-600 block">LinkedIn Profile Link:</label>
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
                              <label className="text-[11px] font-bold text-slate-600 block">WhatsApp Number:</label>
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
                            <span>4. Contact Details:</span>
                          </h4>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 block">Email Address:</label>
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
                              <label className="text-[11px] font-bold text-slate-600 block">Mobile Number:</label>
                              <input
                                type="text"
                                maxLength={11}
                                value={activeApp.phone || ''}
                                onChange={(e) => {
                                  onUpdateApplication({
                                    ...activeApp,
                                    phone: e.target.value.replace(/\D/g, '').slice(0, 11)
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold focus:border-brand-sky focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 p-3.5 text-xs text-left font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            💡 Click the button below to save after updating each field in your profile. Your progress percentage will update immediately.
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateApplication(activeApp);
                              alert('Profile information saved successfully!');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all shadow-md border-b-2 border-brand-gold shrink-0"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span>Update Profile (Save)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  {/* Visa Gating preview column */}
                  <div className="space-y-6 lg:col-span-1">
                    {calculateProfileCompletion(activeApp) < 50 ? (
                      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6 shadow-sm text-center space-y-4">
                        <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                          <Lock className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-slate-700">Bulgaria Visa Application Locked</h4>
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed text-left">
                            Please complete at least 50% of your profile to unlock available universities and start your visa application process. Fill out the required details in the profile form on the left and click save to increase your profile completion score.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-200">
                          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1">
                            <span>Unlock Progress</span>
                            <span>{calculateProfileCompletion(activeApp)}% / 50%</span>
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
                          <h4 className="font-display text-sm font-extrabold text-brand-sky-dark">Visa Application Unlocked!</h4>
                          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed text-left">
                            Congratulations! You have completed over 50% of your profile. You can now begin your visa filing process.
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
                          <span>Start Student Visa Application</span>
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
              {/* Sub Navigation Tabs with Logout */}
              <div className="flex items-center justify-between border-b border-slate-200 mb-6 gap-2" id="dashboard-tabs-container">
                <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory animate-fade-in flex-1" id="dashboard-tabs">
                  <button
                    id="tab-tracking"
                    onClick={() => setActiveTab('tracking')}
                    className={`border-b-2 px-4 sm:px-6 py-3 text-xs font-bold transition-all shrink-0 snap-start ${
                      activeTab === 'tracking'
                        ? 'border-brand-sky text-brand-sky'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="md:inline hidden">Real-Time Tracking</span>
                    <span className="md:hidden inline">Tracking</span>
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
                    <span className="md:inline hidden">Secure Uploads</span>
                    <span className="md:hidden inline">Uploads</span>
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
                    <span className="md:inline hidden">Fees & Payments</span>
                    <span className="md:hidden inline">Payments</span>
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
                    <span>Additional Services</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveAppId(null)}
                  title="Logout"
                  className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all text-xs font-bold flex items-center gap-1.5 shrink-0"
                  id="student-logout-btn"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
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
                            title="Upload Photo"
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
                            </h3>
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-sky-light/50 border border-brand-sky/15 text-[9px] text-brand-sky-dark font-extrabold">
                              <Compass className="h-3 w-3" /> Bulgaria Student Portal
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Passport: <span className="font-mono text-slate-600">{activeApp.passportNumber}</span></p>
                          <div className="text-[11px] text-slate-500 font-medium flex flex-wrap gap-x-3 gap-y-1">
                            <span>Phone: {activeApp.phone}</span>
                            <span className="text-slate-200">|</span>
                            <span className="truncate max-w-[220px]" title={activeApp.email}>Email: {activeApp.email}</span>
                          </div>
                          {activeApp.desiredCourse && (
                            <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-2.5 max-w-xl text-[10.5px] leading-relaxed text-slate-600 mt-2">
                              <span className="font-bold text-slate-700">Selected University & Course:</span> {activeApp.desiredCourse}
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
                            <span>Academic Details</span>
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
                            <p className="text-slate-400 italic text-[9px]">No academic history provided.</p>
                          )}
                        </div>

                        {/* Social Media Links Summary */}
                        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-3.5 text-left space-y-2 text-[10px] min-w-[180px]">
                          <h4 className="font-bold text-slate-700 flex items-center gap-1 text-[10px] border-b border-slate-200/60 pb-1">
                            <Globe className="h-3.5 w-3.5 text-brand-sky" />
                            <span>Social Profiles</span>
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
                            <p className="text-slate-400 italic text-[9px]">No social links added.</p>
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
                        <span>{isEditingProfile ? 'Close Edit Form' : 'Edit Profile'}</span>
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
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Full Name:</label>
                              <input
                                type="text"
                                value={editProfileData.fullName}
                                onChange={(e) => setEditProfileData({ ...editProfileData, fullName: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Passport Number:</label>
                              <input
                                type="text"
                                value={editProfileData.passportNumber}
                                onChange={(e) => setEditProfileData({ ...editProfileData, passportNumber: e.target.value.toUpperCase() })}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:border-brand-sky focus:outline-none uppercase font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Phone Number:</label>
                              <input
                                type="tel"
                                value={editProfileData.phone}
                                onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:border-brand-sky focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Email Address:</label>
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
                              <h5 className="text-[11px] font-black text-slate-700">SSC Details</h5>
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
                              <h5 className="text-[11px] font-black text-slate-700">HSC Details</h5>
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
                              <h5 className="text-[11px] font-black text-slate-700">Bachelor Details (Optional)</h5>
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
                                  setEditProfileError('Please fill out all profile details correctly.');
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
                              Save Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 text-xs font-bold transition-all"
                            >
                              Cancel (Cancel)
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
                              <h4 className="text-xs font-bold text-slate-800">Payment Action Required</h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                                Your Indian double-entry visa and Delhi travel processing fee of <strong>৳ 15,000 BDT</strong> is unpaid. Please pay to begin processing.
                              </p>
                            </div>
                          </div>
                          <button
                            id="banner-pay-now-btn"
                            onClick={() => setActiveTab('payment')}
                            className="w-full sm:w-auto shrink-0 rounded-lg bg-gradient-to-r from-brand-sky to-brand-sky-dark text-white px-4 py-2.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all text-center border-b border-brand-gold"
                          >
                            Pay Fee Now ➔
                          </button>
                        </motion.div>
                      )}

                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-display font-bold text-slate-800 text-sm mb-6 border-b border-slate-50 pb-3 text-left">
                          Live Processing Status
                        </h3>

                        <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8 text-left">
                          {[
                            {
                              key: 'Submitted',
                              title: 'Application File Opened',
                              desc: 'Your basic file has been opened at the agency.',
                              time: activeApp.createdAt,
                              isActive: true,
                              isCompleted: true
                            },
                            {
                              key: 'Document Verification',
                              title: 'Document Verification & Attestation',
                              desc: 'Attestation process at the Ministry of Foreign Affairs & Education Board is ongoing.',
                              time: activeApp.documents.length > 0 ? activeApp.documents[0].uploadedAt : '',
                              isActive: activeApp.status === 'Document Verification' || activeApp.status === 'Embassy Processing' || activeApp.status === 'Visa Issued',
                              isCompleted: activeApp.status === 'Embassy Processing' || activeApp.status === 'Visa Issued'
                            },
                            {
                              key: 'Embassy Processing',
                              title: 'Delhi Embassy Processing & Indian Visa',
                              desc: 'Indian transit visa booked and appointment scheduled at the Delhi embassy.',
                              time: activeApp.status === 'Embassy Processing' ? 'In Progress' : (activeApp.status === 'Visa Issued' ? 'Completed' : ''),
                              isActive: activeApp.status === 'Embassy Processing' || activeApp.status === 'Visa Issued',
                              isCompleted: activeApp.status === 'Visa Issued'
                            },
                            {
                              key: 'Visa Issued',
                              title: 'Bulgaria Student Visa Approved',
                              desc: 'Congratulations! Your Bulgaria student visa has been approved and passport stamped.',
                              time: activeApp.status === 'Visa Issued' ? 'Flight Preparation' : '',
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
                          <h4 className="text-xs font-bold text-brand-sky-dark">Real-time Directives</h4>
                          <p className="text-[11px] text-slate-700 leading-relaxed mt-1">
                            Since the Bulgaria Embassy is in Delhi, we manage your Indian double-entry visa, hotel, and travel schedule directly. Automated SMS alerts will be sent upon major status updates.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress countdown card */}
                    <div className="space-y-6 lg:col-span-1 text-left">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" id="progress-intake-countdown-card">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-wider">Processing Progress</span>
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
                              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Bulgaria October 2026 Intake</h4>
                              <p className="text-[9px] text-slate-400 font-bold">Sofia / Varna Classes Start</p>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg border border-brand-gold border-b-2">
                              {(() => {
                                const targetDate = new Date('2026-10-01T00:00:00');
                                const currentDate = new Date();
                                const diffTime = targetDate.getTime() - currentDate.getTime();
                                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return daysLeft > 0 ? `${daysLeft} days remaining` : 'Intake Started';
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
                  <h3 className="font-display font-bold text-slate-800 text-sm">Secure Document Upload Guidelines</h3>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed space-y-1 pl-7">
                  <p>✓ All files are encrypted using <strong>banking-grade 256-bit SSL encryption</strong> and stored on our secure servers.</p>
                  <p>✓ Ensure all documents are high-resolution color scans saved in <strong>PDF or JPEG</strong> format prior to upload.</p>
                  <p>✓ Maximum file size is <strong>10MB</strong> per file. Blurry or cut-off documents will be rejected.</p>
                </div>
              </div>

              {/* Requirement Items Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700">Required Documents List & Upload Section</h4>
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
                              {req.isRequired ? 'Required' : 'Optional Service'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{req.description}</p>
                          <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                            <strong>Support Guide:</strong> {req.bangladeshCollectionGuide}
                          </p>

                          {/* Approved/Feedback State */}
                          {uploaded && (
                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] text-slate-400">Uploaded File: <strong className="text-slate-600 font-mono">{uploaded.fileName} ({uploaded.fileSize})</strong></span>
                              {uploaded.fileUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(uploaded)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-black transition-all border border-slate-200"
                                  title="Preview File"
                                >
                                  <Eye className="h-3 w-3 text-brand-sky" />
                                  <span>Preview</span>
                                </button>
                              )}
                              {uploaded.status === 'Approved' && (
                                <span className="inline-flex items-center space-x-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Approved</span>
                                </span>
                              )}
                              {uploaded.status === 'Pending' && (
                                <span className="inline-flex items-center space-x-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-100">
                                  <Clock className="h-3 w-3" />
                                  <span>Pending Verification</span>
                                </span>
                              )}
                              {uploaded.status === 'Rejected' && (
                                <div className="space-y-1 w-full">
                                  <span className="inline-flex items-center space-x-1 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-brand-red border border-rose-100">
                                    <XCircle className="h-3 w-3" />
                                    <span>Rejected</span>
                                  </span>
                                  {uploaded.feedback && (
                                    <p className="text-[10px] text-brand-red bg-rose-50/50 p-1.5 rounded border border-brand-red/10">
                                      <strong>Reason:</strong> {uploaded.feedback}
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
                                <span>Encrypting & Uploading...</span>
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
                              <span>{uploaded ? 'Re-upload File' : 'Upload File'}</span>
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
                      🎓 Final Selection Overview
                    </span>
                    <h3 className="text-xs md:text-sm font-black text-slate-800 flex items-center gap-2">
                      <School className="h-5 w-5 text-brand-sky shrink-0 animate-pulse" />
                      <span>{activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[1].replace(')', '') : activeApp.desiredCourse}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2 pl-6">
                      <GraduationCap className="h-4 w-4 text-brand-gold shrink-0" />
                      <span>Program/Course: {activeApp.desiredCourse.includes(' (') ? activeApp.desiredCourse.split(' (')[0] : activeApp.desiredCourse}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 pl-6 flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-slate-300" />
                      <span>Location: Bulgaria</span>
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end text-left md:text-right shrink-0 gap-2.5 w-full md:w-auto">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Processing Fee</span>
                      <span className="text-lg md:text-xl font-black text-brand-sky font-mono">৳{totalAmt.toLocaleString()} BDT</span>
                    </div>

                    
                    <button
                      type="button"
                      id="edit-uni-course-btn"
                      onClick={() => setIsEditingUniCourse(!isEditingUniCourse)}
                      className="inline-flex items-center justify-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-50/50 px-4 py-2 text-xs font-black text-amber-800 hover:bg-amber-100 hover:text-amber-900 hover:border-amber-400 transition-all shadow-sm w-full md:w-auto active:scale-95"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                      <span>Edit / Change Selection</span>
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
                        <h4 className="text-xs font-black">University & Course Selection Panel</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Select a new university and program below, then click "Confirm Changes".
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Dropdown Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-700 block">1. Bulgaria University:</label>
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
                          <label className="text-[10px] font-black text-slate-700 block">2. Program & Course:</label>
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
                          Cancel
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
                          Confirm Changes
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
                      Selected Services & Payment History
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-800">Payment & Invoice Details</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Detailed list of your selected services and processing fees below.
                    </p>
                  </div>

                  {/* Selected Services Itemized List */}
                  <div className="space-y-2 border-t border-b border-slate-100 py-4">
                    <h4 className="text-xs font-bold text-slate-700">Selected Services:</h4>
                    <div className="space-y-2">
                      {studentServices.map((service) => (
                        <div key={service.id} className="flex justify-between items-start text-xs bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{service.nameEn}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Fee</p>
                          </div>
                          <span className="font-mono font-bold text-slate-700 shrink-0 ml-1">৳{service.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Calculations Panel */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Application ID:</span>
                      <span className="font-mono font-bold text-slate-800">{activeApp.id}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Total Processing Fee:</span>
                      <span className="font-mono font-bold text-slate-800">৳{totalAmt.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200/50 pb-2">
                      <span>Fee Paid:</span>
                      <span className="font-mono font-bold text-emerald-600">৳{paidAmt.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700 font-bold">
                      <span>Balance Due:</span>
                      <span className={`font-mono ${remainingAmt > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        ৳{remainingAmt.toLocaleString()} BDT
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/50">
                      <span>Payment Status:</span>
                      {activeApp.paymentStatus === 'Paid' ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                          Fully Paid
                        </span>
                      ) : activeApp.paymentStatus === 'Partially Paid' ? (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100 animate-pulse">
                          Partially Paid
                        </span>
                      ) : (
                        <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-brand-red border border-rose-100">
                          Unpaid
                        </span>
                      )}
                    </div>

                    {activeApp.paymentStatus !== 'Unpaid' && (
                      <div className="border-t border-slate-200/50 pt-3 space-y-1.5 text-[10px] text-slate-500">
                        <div className="font-bold text-slate-700">Latest Payment Transaction:</div>
                        <div>Payment Method: <strong className="text-slate-700">{activeApp.paymentMethod}</strong></div>
                        <div>Transaction ID: <strong className="text-slate-700 font-mono">{activeApp.paymentTxnId}</strong></div>
                        <div>Date & Time: <strong className="text-slate-700 font-mono">{activeApp.paymentDate}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Installments Schedule View */}
                  <div className="space-y-2 bg-brand-sky/5 p-3 rounded-xl border border-brand-sky/10">
                    <h4 className="text-xs font-bold text-slate-800">Installment Plan Schedule</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-700">1st Installment (50% Upfront)</p>
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
                            activeApp.paymentStatus === 'Paid' || activeApp.paymentStatus === 'Partially Paid' ? 'Paid' : 'Unpaid'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-700">2nd Installment (Remaining 50% Final Step)</p>
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
                            activeApp.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Interactive Payment Gateway with 1.5% Fee and Account Selection */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6 text-left" id="direct-payment-gateway-section">
                  {activeApp.paymentStatus === 'Paid' ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle className="h-10 w-10 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display text-xl font-bold text-slate-800">Payment Completed Successfully!</h3>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Your payment has been verified and approved. Your application file is now active.
                        </p>
                      </div>
                    </div>
                  ) : activeApp.paymentStatus === 'Pending Verification' ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-amber-50/50 rounded-2xl border border-amber-200 p-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 animate-pulse">
                        <Clock className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display text-base font-black text-amber-900">Payment Verification Pending</h3>
                        <p className="text-xs text-amber-700 max-w-md">
                          You have submitted Transaction ID <strong className="font-mono">{activeApp.paymentTxnId}</strong>. Your file status will be updated upon admin verification.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-brand-sky" />
                          <span>Direct Payment Gateway (bKash, Nagad, Rocket, Bank)</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Select any method below, send money to the provided number or bank account, and submit the sender phone, transaction ID, and screenshot. <strong className="text-emerald-700">(No service charge for bank transfers, 1.5% service charge for mobile banking)</strong>
                        </p>
                      </div>

                      {/* Payment Method Selector Tabs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'bkash', label: 'bKash', color: 'border-[#e2136e] text-[#e2136e] bg-pink-50/50' },
                          { id: 'nagad', label: 'Nagad', color: 'border-[#f26322] text-[#f26322] bg-orange-50/50' },
                          { id: 'rocket', label: 'Rocket', color: 'border-purple-600 text-purple-700 bg-purple-50/50' },
                          { id: 'bank', label: 'Bank', color: 'border-slate-800 text-slate-800 bg-slate-50' },
                        ].map(gateway => (
                          <button
                            key={gateway.id}
                            type="button"
                            onClick={() => {
                              setSelectedPaymentGateway(gateway.id as any);
                              setSelectedGatewayAccountIdx(0);
                            }}
                            className={`p-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                              selectedPaymentGateway === gateway.id ? `${gateway.color} shadow-md scale-[1.02]` : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span>{gateway.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Account details box based on selected gateway */}
                      <div className="rounded-2xl border-2 border-brand-sky/30 bg-slate-50 p-5 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            {selectedPaymentGateway === 'bkash' && 'bKash Merchant / Personal Numbers'}
                            {selectedPaymentGateway === 'nagad' && 'Nagad Personal / Merchant Numbers'}
                            {selectedPaymentGateway === 'rocket' && 'Rocket Account Numbers'}
                            {selectedPaymentGateway === 'bank' && 'Bank Account Details'}
                          </h4>
                          <span className="text-[10px] bg-brand-sky/10 text-brand-sky font-bold px-2 py-0.5 rounded-full">
                            Fill out the form below after sending payment
                          </span>
                        </div>

                        {/* List of accounts configured by admin */}
                        <div className="grid gap-2.5">
                          {selectedPaymentGateway === 'bkash' && ((paymentConfig?.bkashNumbers && paymentConfig.bkashNumbers.length > 0) ? paymentConfig.bkashNumbers : [{ id: '1', number: '01712345678', type: 'Personal', name: 'NOVENTRA' }]).map((item, idx) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedGatewayAccountIdx(idx)}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                                selectedGatewayAccountIdx === idx ? 'border-[#e2136e] bg-pink-50/30 shadow-sm' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-mono font-black text-slate-900">{item.number} <span className="text-[10px] text-pink-600 font-bold ml-2">({item.type})</span></p>
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Account Name: {item.name}</p>
                              </div>
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedGatewayAccountIdx === idx ? 'border-[#e2136e] bg-[#e2136e] text-white' : 'border-slate-300'}`}>
                                {selectedGatewayAccountIdx === idx && <div className="h-2 w-2 rounded-full bg-white"></div>}
                              </div>
                            </div>
                          ))}

                          {selectedPaymentGateway === 'nagad' && ((paymentConfig?.nagadNumbers && paymentConfig.nagadNumbers.length > 0) ? paymentConfig.nagadNumbers : [{ id: '1', number: '01912345678', type: 'Personal', name: 'NOVENTRA Nagad' }]).map((item, idx) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedGatewayAccountIdx(idx)}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                                selectedGatewayAccountIdx === idx ? 'border-[#f26322] bg-orange-50/30 shadow-sm' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-mono font-black text-slate-900">{item.number} <span className="text-[10px] text-orange-600 font-bold ml-2">({item.type})</span></p>
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Account Name: {item.name}</p>
                              </div>
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedGatewayAccountIdx === idx ? 'border-[#f26322] bg-[#f26322] text-white' : 'border-slate-300'}`}>
                                {selectedGatewayAccountIdx === idx && <div className="h-2 w-2 rounded-full bg-white"></div>}
                              </div>
                            </div>
                          ))}

                          {selectedPaymentGateway === 'rocket' && ((paymentConfig?.rocketNumbers && paymentConfig.rocketNumbers.length > 0) ? paymentConfig.rocketNumbers : [{ id: '1', number: '01812345678', type: 'Personal', name: 'NOVENTRA Rocket' }]).map((item, idx) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedGatewayAccountIdx(idx)}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                                selectedGatewayAccountIdx === idx ? 'border-purple-600 bg-purple-50/30 shadow-sm' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-mono font-black text-slate-900">{item.number} <span className="text-[10px] text-purple-600 font-bold ml-2">({item.type})</span></p>
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Account Name: {item.name}</p>
                              </div>
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedGatewayAccountIdx === idx ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'}`}>
                                {selectedGatewayAccountIdx === idx && <div className="h-2 w-2 rounded-full bg-white"></div>}
                              </div>
                            </div>
                          ))}

                          {selectedPaymentGateway === 'bank' && ((paymentConfig?.bankAccounts && paymentConfig.bankAccounts.length > 0) ? paymentConfig.bankAccounts : [{ id: '1', bankName: 'Dutch-Bangla Bank PLC', accountName: 'NOVENTRA', accountNumber: '123456789', branch: 'Gulshan' }]).map((bank, idx) => (
                            <div
                              key={bank.id}
                              onClick={() => setSelectedGatewayAccountIdx(idx)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-1 ${
                                selectedGatewayAccountIdx === idx ? 'border-slate-900 bg-slate-100 shadow-sm' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-black text-slate-900">{bank.bankName}</p>
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedGatewayAccountIdx === idx ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'}`}>
                                  {selectedGatewayAccountIdx === idx && <div className="h-2 w-2 rounded-full bg-white"></div>}
                                </div>
                              </div>
                              <p className="text-xs font-mono font-bold text-slate-700">Account Number: {bank.accountNumber}</p>
                              <p className="text-[11px] text-slate-500">Account Name: {bank.accountName} | Branch: {bank.branch}</p>
                            </div>
                          ))}
                        </div>

                        {/* Fee Calculation */}
                        {(() => {
                          const base = totalAmt;
                          const isBank = selectedPaymentGateway === 'bank';
                          const fee = isBank ? 0 : Math.round(base * 0.015);
                          const total = base + fee;
                          return (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                              <div className="flex justify-between text-slate-600">
                                <span>Base Fee:</span>
                                <span className="font-mono font-bold">৳{base.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                                <span>Processing Fee {isBank ? '(Bank Transfer - Free)' : '(1.5%)'}:</span>
                                <span className={`font-mono font-bold ${isBank ? 'text-emerald-600 font-black' : 'text-amber-600'}`}>
                                  {isBank ? '৳0 (No charge applies)' : `+ ৳${fee.toLocaleString()}`}
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-900 font-black text-sm pt-1">
                                <span>Total Amount Payable:</span>
                                <span className="font-mono text-brand-sky">৳{total.toLocaleString()} BDT</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Form submission inputs: Sender Phone, Transaction ID and Screenshot Upload */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!studentSenderPhone.trim() || !studentTxnId.trim()) {
                          alert('Please enter sender phone number and Transaction ID (TxnID).');
                          return;
                        }
                        const base = totalAmt;
                        const isBank = selectedPaymentGateway === 'bank';
                        const fee = isBank ? 0 : Math.round(base * 0.015);
                        const total = base + fee;

                        let methodLabel = '';
                        if (selectedPaymentGateway === 'bkash') {
                          const acc = paymentConfig?.bkashNumbers?.[selectedGatewayAccountIdx] || { number: '01712345678', type: 'Personal' };
                          methodLabel = `bKash (${acc.number} - ${acc.type})`;
                        } else if (selectedPaymentGateway === 'nagad') {
                          const acc = paymentConfig?.nagadNumbers?.[selectedGatewayAccountIdx] || { number: '01912345678', type: 'Personal' };
                          methodLabel = `Nagad (${acc.number} - ${acc.type})`;
                        } else if (selectedPaymentGateway === 'rocket') {
                          const acc = paymentConfig?.rocketNumbers?.[selectedGatewayAccountIdx] || { number: '01812345678', type: 'Personal' };
                          methodLabel = `Rocket (${acc.number} - ${acc.type})`;
                        } else {
                          const acc = paymentConfig?.bankAccounts?.[selectedGatewayAccountIdx] || { bankName: 'DBBL', accountNumber: '123' };
                          methodLabel = `Bank (${acc.bankName} - ${acc.accountNumber})`;
                        }

                        const updatedApp: Application = {
                          ...activeApp,
                          paymentStatus: 'Pending Verification',
                          paymentMethod: methodLabel,
                          paymentSenderPhone: studentSenderPhone.trim(),
                          paymentTxnId: studentTxnId.trim(),
                          paymentScreenshot: studentPaymentScreenshot || undefined,
                          paymentAmount: total,
                          totalAmount: total,
                          paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                          notificationHistory: [
                            {
                              id: `notif-${Date.now()}`,
                              title: 'Payment Information Submitted',
                              body: `Your ${methodLabel} payment (TrxID: ${studentTxnId.trim()}) was submitted successfully. Admin will review and approve shortly.`,
                              sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                              type: 'sms',
                              recipient: activeApp.phone
                            },
                            ...(activeApp.notificationHistory || [])
                          ]
                        };
                        onUpdateApplication(updatedApp);
                        setStudentPaymentSuccessMsg('Your payment details have been submitted. Admin will verify and approve shortly.');
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">Your Sender Phone Number:</label>
                            <input
                              type="text"
                              required
                              value={studentSenderPhone}
                              onChange={(e) => setStudentSenderPhone(e.target.value)}
                              placeholder="e.g. 01711XXXXXX"
                              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono font-bold focus:border-brand-sky focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">Transaction ID (TrxID):</label>
                            <input
                              type="text"
                              required
                              value={studentTxnId}
                              onChange={(e) => setStudentTxnId(e.target.value)}
                              placeholder="e.g. 9N74ABC123"
                              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono font-bold uppercase focus:border-brand-sky focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Payment Screenshot Upload Option */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>Payment Receipt / Screenshot Upload:</span>
                            <span className="text-[10px] text-slate-400 font-normal">(bKash, Nagad, Rocket screenshot or bank deposit slip)</span>
                          </label>
                          
                          {studentPaymentScreenshot ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                              <div className="h-12 w-12 rounded-lg border border-emerald-200 overflow-hidden bg-white shrink-0">
                                <img src={studentPaymentScreenshot} alt="Payment Screenshot" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-xs font-bold text-slate-800 truncate">{studentPaymentScreenshotName || 'payment_screenshot.jpg'}</p>
                                <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Screenshot Attached
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentPaymentScreenshot('');
                                  setStudentPaymentScreenshotName('');
                                }}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                                title="Remove Screenshot"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-sky bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-all">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Upload className="h-4 w-4 text-brand-sky" />
                                <span className="text-xs font-bold">Select Payment Screenshot or Deposit Receipt</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1">Upload bKash, Nagad, Rocket screenshot or bank deposit receipt</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    compressImageFile(file).then((compressedBase64) => {
                                      setStudentPaymentScreenshot(compressedBase64);
                                      setStudentPaymentScreenshotName(file.name);
                                    });
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>

                        {studentPaymentSuccessMsg && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                            {studentPaymentSuccessMsg}
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-brand-sky to-emerald-600 hover:opacity-95 text-white px-6 py-3 text-xs font-black shadow-md flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            <span>Submit Payment Details</span>
                          </button>
                        </div>
                      </form>
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
                  Additional Ground Services
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-slate-800">Add Ground Services to Your Application</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Add ground services anytime during visa application and Delhi embassy processing to secure your journey to Europe.
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
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[8px] font-bold text-emerald-600 border border-emerald-100">Active</span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[8px] font-bold text-slate-500 border border-slate-200">Add Service</span>
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
                              alert(`"${service.name}" added to your file! Please pay the fee from the Payment Gateway tab.`);
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 border-b border-brand-gold"
                          >
                            Add Service
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
                        <h3 className="text-sm font-bold text-slate-800">Login Verification</h3>
                        <p className="text-[10px] text-slate-500">Profile Security Verification</p>
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
                      <p className="text-xs text-slate-500">You are attempting to access dashboard for:</p>
                      <h4 className="text-sm font-black text-slate-800 mt-1">{selectedVerifyApp.fullName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">ID: {selectedVerifyApp.id} · Passport: {selectedVerifyApp.passportNumber}</p>
                    </div>

                    <form onSubmit={handleVerifySubmit} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Password (Student Passport Number):</label>
                        <div className="relative">
                          <input
                            required
                            autoFocus
                            type="password"
                            value={verifyPassword}
                            onChange={(e) => setVerifyPassword(e.target.value)}
                            placeholder="Enter Passport Number"
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
                        <strong>💡 Verification Info:</strong> For security, student dashboards are password protected. Please enter the student's <strong>passport number ({selectedVerifyApp.passportNumber})</strong> as password to enter.
                      </div>

                      <div className="flex space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVerifyApp(null)}
                          className="w-1/3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-sky to-brand-sky-dark border-b-2 border-brand-gold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                          id="confirm-verify-btn"
                        >
                          Verify & Enter
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
          const countryName = "Bulgaria";

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
                      <span>Payment Wizard</span>
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
                    { step: 1, label: 'Application Details' },
                    { step: 2, label: 'Payment Method' },
                    { step: 3, label: 'Verification' },
                    { step: 4, label: 'Payment Successful' }
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
                          <span>Applied Course & Country Details:</span>
                        </h4>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">1. Country Name:</span>
                            <span className="text-slate-800 font-extrabold">{countryName} 🇧🇬</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">2. University Name:</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{uniName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">3. Course Name:</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{courseName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Installment Selection if Unpaid */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 block">Select Payment Mode:</label>
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
                              <span className="text-[11px] font-bold text-slate-800">Full One-Time Fee</span>
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
                              <span className="text-[11px] font-bold text-slate-800">1st Installment (50%)</span>
                              <span className="text-sm font-black text-slate-900 mt-1 font-mono">৳{inst1Amt.toLocaleString()} BDT</span>
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex flex-col text-xs text-emerald-800 font-semibold gap-1.5">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <span>1st Installment Payment Completed!</span>
                            </span>
                            <div className="flex justify-between items-center bg-white p-2 rounded border border-emerald-100 mt-1">
                              <span className="text-slate-600 font-bold">2nd Installment Payable (Remaining 50%):</span>
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
                          <span>Proceed to Next Step</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Choose Payment Method Dropdown */}
                  {paymentModalStep === 2 && (
                    <div className="space-y-4" id="modal-step-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 block">Select Payment Gateway:</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value as 'bkash' | 'nagad' | 'card');
                            setBkashStep('phone');
                          }}
                          className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-xs font-black text-slate-700 focus:outline-none focus:border-brand-sky transition-all cursor-pointer"
                        >
                          <option value="bkash">bKash (Mobile Banking)</option>
                          <option value="nagad">Nagad (Mobile Banking)</option>
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
                            <label className="text-[10px] font-black text-slate-500 block text-center">Your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Personal Number:</label>
                            <input
                              required
                              type="tel"
                              maxLength={11}
                              placeholder="e.g. 017XXXXXXXX"
                              value={bkashPhone}
                              onChange={(e) => setBkashPhone(e.target.value)}
                              className="w-full text-center rounded-xl border-2 border-slate-200 p-2.5 font-mono text-sm tracking-wider focus:outline-none focus:border-brand-sky text-slate-800 font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-xs">
                          <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-1">Enter Card Details:</h4>
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block">Cardholder Name:</label>
                              <input
                                required
                                type="text"
                                placeholder="e.g. KAMRUL HASAN"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:outline-none focus:border-brand-sky font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block">Card Number:</label>
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
                                <label className="text-[10px] font-bold text-slate-500 block">CVV:</label>
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
                          Previous Step
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
                          <span>Proceed to Next Step</span>
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
                            <h4 className="text-sm font-black text-slate-800">Verifying Payment...</h4>
                            <p className="text-[11px] text-slate-500">Please wait a few seconds, do not close your browser.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* OTP verification helper banner */}
                          <div className="bg-amber-50 rounded-xl p-3 text-[11px] text-amber-800 border border-amber-200/50 leading-relaxed space-y-1">
                            <div>🔒 <strong>Automated Security Simulator:</strong></div>
                            <div>A test OTP code has been sent to your mobile for security.</div>
                            <div>Use OTP Code: <strong className="font-mono text-sm bg-white border border-amber-300 px-1.5 py-0.5 rounded text-amber-900">{paymentMethod === 'card' ? '4832' : '8291'}</strong></div>
                          </div>

                          <div className="space-y-3 max-w-xs mx-auto">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block text-center">Enter the 4-digit OTP code sent to your phone:</label>
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
                                <label className="text-[10px] font-bold text-slate-500 block text-center">Enter your gateway PIN number:</label>
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
                              Previous Step
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
                              ৳{payingAmount.toLocaleString()} Pay Now
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
                        <h3 className="font-display text-lg font-black text-slate-800">Payment Received Successfully!</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Congratulations! Your student visa application payment was successful. Your official receipt is shown below.
                        </p>
                      </div>

                      {/* Receipt details */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs text-left space-y-2 max-w-md mx-auto">
                        <h4 className="text-[11px] font-black uppercase text-emerald-600 border-b border-slate-200 pb-1 flex justify-between">
                          <span>Official Payment Receipt</span>
                          <span className="text-slate-400 font-mono text-[9px]">{activeApp.paymentDate}</span>
                        </h4>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">1. Destination Country:</span>
                            <span className="text-slate-800 font-extrabold">{countryName} 🇧🇬</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">2. University Name:</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{uniName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">3. Course Name:</span>
                            <span className="text-slate-800 font-extrabold text-right max-w-[250px]">{courseName}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1">
                            <span className="text-slate-400 font-bold">4. Payment Method:</span>
                            <span className="text-slate-800 font-extrabold uppercase">{activeApp.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">5. Amount Paid:</span>
                            <span className="text-slate-900 font-black font-mono text-sm">৳{payingAmount.toLocaleString()} BDT</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>6. Transaction ID:</span>
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
                          Close Receipt & Go to Dashboard
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
                            <span>View Full Image in New Window</span>
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
                            <span>Open PDF in New Window</span>
                          </a>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">📄</div>
                          <h4 className="text-xs font-bold text-slate-800">Non-Image Document File</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            This file cannot be rendered directly in the browser. Download to preview.
                          </p>
                          <a
                            href={previewUrl}
                            download={previewDoc.fileName}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-black hover:bg-slate-800 shadow transition-all"
                          >
                            Download File
                          </a>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="text-center space-y-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                    <div className="text-3xl">⚠️</div>
                    <h4 className="text-xs font-bold text-slate-800">No File Data Found</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This is a demo record. Real documents uploaded by students will contain downloadable data.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-slate-400 font-bold font-mono">Uploaded: {previewDoc.uploadedAt}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  {previewDoc.fileUrl && (
                    <a
                      href={previewDoc.fileUrl}
                      download={previewDoc.fileName}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-5 py-2 text-xs font-black hover:bg-emerald-700 shadow transition-all"
                    >
                      Download
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
                      <h4 className="text-xs font-black text-white">NOVENTRA Support Team</h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Online & Active</span>
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
                      <h5 className="text-xs font-bold text-slate-700">Hello! How can we help you?</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">
                        Ask any questions regarding Bulgaria student visa and file processing here. Our team will respond promptly.
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
                            <span>My Message (Student)</span>
                          ) : (
                            <>
                              {msg.adminPhoto && (
                                <img src={msg.adminPhoto} alt="" className="h-3.5 w-3.5 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                              )}
                              <span>{msg.adminName || 'Admin Manager'}</span>
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
                          {msg.text && <p className="whitespace-pre-line text-left">{msg.text}</p>}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <ChatAttachmentList attachments={msg.attachments} isDarkBubble={msg.sender === 'student'} />
                          )}
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
                    if (!studentMsgText.trim() && !studentChatFile) return;
                    handleSendStudentMessage(studentMsgText);
                  }}
                  className="p-3 bg-white border-t border-slate-100 space-y-2 shrink-0"
                >
                  {studentChatFile && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Paperclip className="h-3.5 w-3.5 text-brand-sky shrink-0" />
                        <span className="truncate">{studentChatFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentChatFile('');
                          setStudentChatFileName('');
                        }}
                        className="text-rose-600 hover:text-rose-700 text-xs font-black shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    <label className="cursor-pointer h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                      <Paperclip className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*,video/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            compressImageFile(file).then((compressedBase64) => {
                              setStudentChatFile(compressedBase64);
                              setStudentChatFileName(file.name);
                            });
                          }
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={studentMsgText}
                      onChange={(e) => setStudentMsgText(e.target.value)}
                      placeholder="Type your message or attach a file here..."
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky/25 bg-slate-50"
                    />
                    <button
                      type="submit"
                      disabled={!studentMsgText.trim() && !studentChatFile}
                      className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 p-2.5 text-xs font-black disabled:bg-slate-100 disabled:text-slate-400 transition-all active:scale-95 flex items-center justify-center shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
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
