export interface ChatMessage {
  id: string;
  sender: 'student' | 'admin';
  text: string;
  sentAt: string;
  attachments?: { name: string; url: string }[];
  read?: boolean;
  adminName?: string;
  adminPhoto?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  lastLogin?: string;
}

export type ApplicationStatus =
  | 'Registered'
  | 'Submitted'
  | 'Document Verification'
  | 'Embassy Processing'
  | 'Visa Issued'
  | 'Rejected';

export interface UploadedDocument {
  id: string;
  name: string;
  category: string;
  fileName: string;
  fileSize: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
  uploadedAt: string;
  fileUrl?: string;
  actionBy?: string;
  actionAt?: string;
}

export interface Application {
  id: string;
  fullName: string;
  passportNumber: string;
  email: string;
  phone: string;
  desiredCourse: string;
  status: ApplicationStatus;
  paymentStatus: 'Unpaid' | 'Pending Verification' | 'Partially Paid' | 'Paid';
  paymentAmount: number;
  paymentMethod?: string;
  paymentTxnId?: string;
  paymentSenderPhone?: string;
  paymentDate?: string;
  documents: UploadedDocument[];
  createdAt: string;
  notificationHistory: NotificationLog[];
  selectedServices?: string[];
  totalAmount?: number;
  paidAmount?: number;
  installments?: {
    installmentNumber: number;
    amount: number;
    status: 'Unpaid' | 'Pending Verification' | 'Paid';
    paymentMethod?: string;
    paymentTxnId?: string;
    paymentSenderPhone?: string;
    paymentDate?: string;
  }[];
  messages?: ChatMessage[];
  profilePhoto?: string;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  academicHistory?: {
    sscSchool?: string;
    sscGpa?: string;
    sscYear?: string;
    hscCollege?: string;
    hscGpa?: string;
    hscYear?: string;
    bachelorUni?: string;
    bachelorCgpa?: string;
    bachelorYear?: string;
  };
  socialMedia?: {
    facebook?: string;
    linkedin?: string;
    whatsapp?: string;
  };
}

export interface PaymentConfig {
  bkashNumbers: { id: string; number: string; type: string; name: string }[];
  nagadNumbers: { id: string; number: string; type: string; name: string }[];
  rocketNumbers: { id: string; number: string; type: string; name: string }[];
  bankAccounts: { id: string; bankName: string; accountName: string; accountNumber: string; branch: string }[];
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  type: 'sms' | 'email';
  sentAt: string;
  recipient: string;
}

export interface DocumentRequirement {
  id: string;
  title: string;
  description: string;
  guidelines: string[];
  bangladeshCollectionGuide: string;
  isRequired: boolean;
}

export interface SupportMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  bio: string;
  badge: string;
  photoUrl?: string;
  coverPhotoUrl?: string;
  colorClass: string;
  accentBorder: string;
  btnText: string;
  btnUrl: string;
  createdAt: string;
  username?: string;
  password?: string;
  roleType?: 'administrator' | 'moderator' | 'support';
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminPhoto?: string;
  actionType: 'message_reply' | 'document_approved' | 'document_rejected' | 'status_updated' | 'notification_sent' | 'payment_updated' | 'payment_approved' | 'member_added' | 'member_updated' | 'student_deleted';
  studentId: string;
  studentName: string;
  details: string;
  timestamp: string;
}
