export interface ChatMessage {
  id: string;
  sender: 'student' | 'admin';
  text: string;
  sentAt: string;
}

export type ApplicationStatus =
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
}

export interface Application {
  id: string;
  fullName: string;
  passportNumber: string;
  email: string;
  phone: string;
  desiredCourse: string;
  status: ApplicationStatus;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentAmount: number;
  paymentMethod?: string;
  paymentTxnId?: string;
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
    status: 'Unpaid' | 'Paid';
    paymentMethod?: string;
    paymentTxnId?: string;
    paymentDate?: string;
  }[];
  messages?: ChatMessage[];
  profilePhoto?: string;
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
}
