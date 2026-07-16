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
}

export interface Application {
  id: string;
  fullName: string;
  passportNumber: string;
  email: string;
  phone: string;
  desiredCourse: string;
  status: ApplicationStatus;
  paymentStatus: 'Unpaid' | 'Paid';
  paymentAmount: number;
  paymentMethod?: string;
  paymentTxnId?: string;
  paymentDate?: string;
  documents: UploadedDocument[];
  createdAt: string;
  notificationHistory: NotificationLog[];
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
