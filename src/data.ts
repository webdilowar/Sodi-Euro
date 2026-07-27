import { DocumentRequirement, Application } from './types';

export const documentRequirements: DocumentRequirement[] = [
  {
    id: 'ssc_hsc_certificates',
    title: 'SSC & HSC Certificates & Academic Transcripts',
    description: 'Original educational qualification certificates and transcripts required for international university admission.',
    guidelines: [
      'All certificates and transcripts must be verified by the respective education board.',
      'After board verification, attestation is required from the Ministry of Education.',
      'Finally, attestation must be completed by the Ministry of Foreign Affairs (MoFA).',
      'Documents must be notarized and accompanied by official translations where required.'
    ],
    bangladeshCollectionGuide: 'First visit your education board to pay the online verification fee and verify your documents. Next, proceed to the Ministry of Education annex building for attestation. Finally, submit your documents at the Ministry of Foreign Affairs Consular Wing for MoFA attestation.',
    isRequired: true
  },
  {
    id: 'police_clearance',
    title: 'Police Clearance Certificate',
    description: 'Recent official police clearance certificate proving the applicant has no criminal record.',
    guidelines: [
      'The clearance certificate must be issued within the last 3 to 6 months.',
      'The police clearance certificate must be attested by the Ministry of Foreign Affairs (MoFA).'
    ],
    bangladeshCollectionGuide: 'Apply through the official Online Police Clearance Portal. Upon receiving the certificate, obtain official attestation from the Ministry of Foreign Affairs (MoFA).',
    isRequired: true
  },
  {
    id: 'bank_solvency',
    title: 'Bank Statement & Solvency Certificate',
    description: 'Proof of financial solvency demonstrating sufficient funds to cover tuition and living expenses.',
    guidelines: [
      'Bank account must be in the name of the applicant or their financial sponsor (parent/guardian).',
      'Account should maintain required minimum balance or equivalent foreign currency for the past 6 months.',
      'Collect original bank solvency certificate and 6-month statement signed and stamped by the bank.'
    ],
    bangladeshCollectionGuide: 'Request a Bank Solvency Certificate and a 6-month statement from your sponsor bank branch. Keep notarized copies for embassy file presentation.',
    isRequired: true
  },
  {
    id: 'medical_certificate',
    title: 'Medical Fitness Certificate',
    description: 'Fitness certificate from a registered physician confirming the applicant is free from contagious diseases.',
    guidelines: [
      'Collect medical examination reports and fitness certificate issued by a registered medical practitioner.',
      'The certificate must be attested by the Ministry of Foreign Affairs (MoFA).'
    ],
    bangladeshCollectionGuide: 'Undergo medical check-ups at a government or recognized medical center, obtain a prescribed fitness certificate from a registered doctor, and attest it at MoFA.',
    isRequired: true
  },
  {
    id: 'passport_copy',
    title: 'Original Passport & High-Quality Scan Copy',
    description: 'Original passport with a minimum remaining validity of 1.5 years (18 months).',
    guidelines: [
      'Upload a clear, color scanned copy of the passport information page.',
      'Passport must contain at least two blank pages.'
    ],
    bangladeshCollectionGuide: 'If passport validity is under 1 year, apply for re-issue immediately via standard e-Passport services.',
    isRequired: true
  },
  {
    id: 'indian_visa',
    title: 'Transit / Embassy Travel Visa & Declaration',
    description: 'Transit or double-entry visa for embassy interview presentation if required by destination processing route.',
    guidelines: [
      'When embassy filing requires travel to an external embassy hub, valid transit credentials are required.',
      'Ensure active transit/entry visa is available before embassy interview appointment.',
      'You can request transit visa processing assistance directly through our portal.'
    ],
    bangladeshCollectionGuide: 'Our support team assists with visa application forms, e-token booking, and document dossier preparation for smooth embassy travel.',
    isRequired: false
  }
];

export const initialApplications: Application[] = [
  {
    id: 'APP-8392',
    fullName: 'Tamim Iqbal',
    passportNumber: 'EF0192837',
    email: 'tamim.iqbal@example.com',
    phone: '01712345678',
    desiredCourse: 'BSc in Computer Science (Technical University of Sofia)',
    status: 'Submitted',
    paymentStatus: 'Paid',
    paymentAmount: 15000,
    paymentMethod: 'bKash',
    paymentTxnId: 'BKX90827361',
    paymentDate: '2026-07-10 14:30',
    createdAt: '2026-07-10 14:15',
    documents: [
      {
        id: 'doc-1',
        name: 'SSC & HSC Academic Certificates',
        category: 'ssc_hsc_certificates',
        fileName: 'tamim_education_certificates.pdf',
        fileSize: '4.2 MB',
        status: 'Approved',
        uploadedAt: '2026-07-10 14:20'
      },
      {
        id: 'doc-2',
        name: 'Police Clearance Certificate',
        category: 'police_clearance',
        fileName: 'tamim_police_clearance.pdf',
        fileSize: '1.1 MB',
        status: 'Pending',
        uploadedAt: '2026-07-10 14:22'
      }
    ],
    notificationHistory: [
      {
        id: 'not-1',
        title: 'Application Submitted',
        body: 'Dear Tamim, your student visa application has been successfully submitted. ID: APP-8392.',
        type: 'sms',
        sentAt: '2026-07-10 14:15',
        recipient: '01712345678'
      },
      {
        id: 'not-2',
        title: 'Payment Received',
        body: 'Your 15,000 BDT visa processing fee has been successfully received via bKash.',
        type: 'email',
        sentAt: '2026-07-10 14:30',
        recipient: 'tamim.iqbal@example.com'
      }
    ]
  },
  {
    id: 'APP-7462',
    fullName: 'Afrin Jahan Sumi',
    passportNumber: 'EG0987654',
    email: 'sumi.afrin@example.com',
    phone: '01998765432',
    desiredCourse: 'MSc in International Business (Varna University of Management)',
    status: 'Document Verification',
    paymentStatus: 'Paid',
    paymentAmount: 15000,
    paymentMethod: 'Nagad',
    paymentTxnId: 'NGD38271649',
    paymentDate: '2026-07-12 11:20',
    createdAt: '2026-07-11 09:40',
    documents: [
      {
        id: 'doc-3',
        name: 'SSC & HSC Verified Documents',
        category: 'ssc_hsc_certificates',
        fileName: 'sumi_academic_attested.pdf',
        fileSize: '3.8 MB',
        status: 'Approved',
        uploadedAt: '2026-07-11 10:00'
      },
      {
        id: 'doc-4',
        name: 'Police Clearance MoFA Attested',
        category: 'police_clearance',
        fileName: 'sumi_police_clearance.pdf',
        fileSize: '1.5 MB',
        status: 'Approved',
        uploadedAt: '2026-07-11 10:05'
      },
      {
        id: 'doc-5',
        name: 'Bank Solvency and 6M Statement',
        category: 'bank_solvency',
        fileName: 'sumi_bank_solvency.pdf',
        fileSize: '2.4 MB',
        status: 'Pending',
        uploadedAt: '2026-07-12 11:15'
      }
    ],
    notificationHistory: [
      {
        id: 'not-3',
        title: 'Document Verification Started',
        body: 'Dear Afrin, your uploaded documents are being verified by our team. Please check your dashboard for updates.',
        type: 'sms',
        sentAt: '2026-07-11 10:10',
        recipient: '01998765432'
      }
    ]
  },
  {
    id: 'APP-2918',
    fullName: 'Tanvir Ahmed Rifat',
    passportNumber: 'EH4820193',
    email: 'tanvir.rifat@example.com',
    phone: '01887654321',
    desiredCourse: 'BSc in Software Engineering (Sofia University)',
    status: 'Embassy Processing',
    paymentStatus: 'Paid',
    paymentAmount: 15000,
    paymentMethod: 'Visa Card',
    paymentTxnId: 'TXN839201938',
    paymentDate: '2026-07-01 10:15',
    createdAt: '2026-07-01 09:30',
    documents: [
      {
        id: 'doc-6',
        name: 'All Attested Certificates',
        category: 'ssc_hsc_certificates',
        fileName: 'tanvir_all_attested.pdf',
        fileSize: '5.1 MB',
        status: 'Approved',
        uploadedAt: '2026-07-01 09:45'
      },
      {
        id: 'doc-7',
        name: 'Valid Indian Double Entry Visa',
        category: 'indian_visa',
        fileName: 'tanvir_indian_visa.pdf',
        fileSize: '950 KB',
        status: 'Approved',
        uploadedAt: '2026-07-02 16:30'
      }
    ],
    notificationHistory: [
      {
        id: 'not-4',
        title: 'Embassy Appointment Booked',
        body: 'Dear Tanvir, your file submission appointment at the embassy has been confirmed for August 20, 2026. Please prepare your travel documents.',
        type: 'email',
        sentAt: '2026-07-05 12:00',
        recipient: 'tanvir.rifat@example.com'
      }
    ]
  },
  {
    id: 'APP-1049',
    fullName: 'Nazmul Hasan Shanto',
    passportNumber: 'EJ9038210',
    email: 'nazmul.shanto@example.com',
    phone: '01512345679',
    desiredCourse: 'MBA (Technical University of Varna)',
    status: 'Visa Issued',
    paymentStatus: 'Paid',
    paymentAmount: 15000,
    paymentMethod: 'bKash',
    paymentTxnId: 'BKX38472910',
    paymentDate: '2026-06-15 15:45',
    createdAt: '2026-06-15 15:00',
    documents: [
      {
        id: 'doc-8',
        name: 'Complete Student Visa File',
        category: 'ssc_hsc_certificates',
        fileName: 'nazmul_visa_approved.pdf',
        fileSize: '6.4 MB',
        status: 'Approved',
        uploadedAt: '2026-06-15 15:10'
      }
    ],
    notificationHistory: [
      {
        id: 'not-5',
        title: 'Student Visa Approved!',
        body: 'Congratulations Nazmul! Your Student Visa has been issued successfully. Contact our office for travel guidelines.',
        type: 'sms',
        sentAt: '2026-07-14 11:30',
        recipient: '01512345679'
      },
      {
        id: 'not-6',
        title: 'Student Visa Issuance Confirmation',
        body: 'Dear Nazmul, We are thrilled to inform you that your Student D-Visa has been stamped by the embassy. Fly high!',
        type: 'email',
        sentAt: '2026-07-14 11:32',
        recipient: 'nazmul.shanto@example.com'
      }
    ]
  }
];

export interface ServiceOption {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  isMandatory?: boolean;
}

export const serviceOptions: ServiceOption[] = [
  {
    id: 'admission_processing',
    name: 'University Admission & File Assessment',
    nameEn: 'University Admission & File Assessment',
    price: 10000,
    description: 'Securing official offer letter and providing comprehensive visa filing guidelines.',
    isMandatory: true
  },
  {
    id: 'indian_visa_delhi',
    name: 'Embassy Transit Visa & Travel Support',
    nameEn: 'Embassy Transit Visa & Travel Support',
    price: 5000,
    description: 'Transit visa processing, e-token booking, and embassy travel support.'
  },
  {
    id: 'mofa_attestation',
    name: 'Education Board & MoFA Attestation Support',
    nameEn: 'Education Board, Ministry & MoFA Attestation Support',
    price: 4000,
    description: 'Fast-track document attestation from Education Board, Ministry of Education, and MoFA.'
  },
  {
    id: 'police_clearance',
    name: 'Police Clearance & Ministry Attestation Support',
    nameEn: 'Police Clearance & Ministry Attestation Support',
    price: 2000,
    description: 'Online police clearance application and Ministry attestation assistance.'
  }
];


