import { DocumentRequirement, Application } from './types';

export const documentRequirements: DocumentRequirement[] = [
  {
    id: 'ssc_hsc_certificates',
    title: 'এসএসসি এবং এইচএসসি সার্টিফিকেট ও মার্কশিট (SSC & HSC Certificates & Transcripts)',
    description: 'বুলগেরিয়া বিশ্ববিদ্যালয়ে ভর্তির জন্য শিক্ষাগত যোগ্যতার মূল সনদ ও নম্বরপত্র প্রয়োজন।',
    guidelines: [
      'সব সার্টিফিকেট এবং মার্কশিট অবশ্যই সংশ্লিষ্ট শিক্ষা বোর্ড থেকে যাচাই (Verify) করাতে হবে।',
      'শিক্ষা বোর্ড ভেরিফিকেশনের পর শিক্ষা মন্ত্রণালয় (Ministry of Education) থেকে সত্যায়িত করতে হবে।',
      'পরিশেষে, পররাষ্ট্র মন্ত্রণালয় (Ministry of Foreign Affairs - MoFA) থেকে সত্যায়িত হতে হবে।',
      'ডকুমেন্টগুলো নোটারি পাবলিক এবং বুলগেরিয়ান অনুবাদ (Translation) সহ নোটারি করতে হবে।'
    ],
    bangladeshCollectionGuide: 'প্রথমে আপনার শিক্ষা বোর্ডে গিয়ে অনলাইন ভেরিফিকেশন ফি জমা দিয়ে ভেরিফাই করান। এরপর সচিবালয়ের পেছনে অবস্থিত শিক্ষা মন্ত্রণালয়ের অ্যানেক্স ভবনে গিয়ে সত্যায়ন করান। সবশেষে পররাষ্ট্র মন্ত্রণালয়ের কনসুলার উইং এ সকাল ৯টা থেকে দুপুর ১টার মধ্যে কোনো ফি ছাড়াই সত্যায়ন করে নিতে পারবেন।',
    isRequired: true
  },
  {
    id: 'police_clearance',
    title: 'পুলিশ ক্লিয়ারেন্স সার্টিফিকেট (Police Clearance Certificate)',
    description: 'আবেদনকারীর কোনো অপরাধমূলক রেকর্ড নেই তা প্রমাণের জন্য সাম্প্রতিক পুলিশ ছাড়পত্র।',
    guidelines: [
      'সার্টিফিকেটের মেয়াদ ইস্যুর তারিখ থেকে অবশ্যই ৩ বা ৬ মাসের মধ্যে হতে হবে।',
      'পুলিশ ক্লিয়ারেন্সটি অবশ্যই পররাষ্ট্র মন্ত্রণালয় (MoFA) থেকে সত্যায়িত হতে হবে।'
    ],
    bangladeshCollectionGuide: 'বাংলাদেশ পুলিশের অনলাইন পুলিশ ক্লিয়ারেন্স পোর্টালে (pcc.police.gov.bd) ৫০০ টাকা সরকারি ফি দিয়ে আবেদন করুন। সার্টিফিকেট হাতে পাওয়ার পর সেটি পররাষ্ট্র মন্ত্রণালয় (MoFA) থেকে অবশ্যই সত্যায়িত করিয়ে নিন।',
    isRequired: true
  },
  {
    id: 'bank_solvency',
    title: 'ব্যাংক স্টেটমেন্ট ও সলভেন্সি সার্টিফিকেট (Bank Statement & Solvency)',
    description: 'বুলগেরিয়াতে পড়াশোনা ও থাকার খরচ বহনের আর্থিক সামর্থ্যের প্রমাণপত্র।',
    guidelines: [
      'আবেদনকারী বা তার স্পনসর (পিতা/মাতা) এর নামে ব্যাংক অ্যাকাউন্ট থাকতে হবে।',
      'ব্যাংক অ্যাকাউন্টে ন্যূনতম ৬ লাখ থেকে ৮ লাখ টাকা বা সমপরিমাণ ইউরো গত ৬ মাস ধরে জমা থাকতে হবে।',
      'ব্যাংক থেকে মূল সলভেন্সি সার্টিফিকেট এবং ৬ মাসের স্টেটমেন্ট স্বাক্ষর ও সিল সহ সংগ্রহ করতে হবে।'
    ],
    bangladeshCollectionGuide: 'আপনার স্পনসরের ব্যাংক শাখায় গিয়ে অনুরোধ করলে তারা একটি ব্যাংক সলভেন্সি সার্টিফিকেট ইস্যু করবে। স্টেটমেন্ট ও সলভেন্সি সংগ্রহ করে সেটি নোটারি করিয়ে রাখা নিরাপদ।',
    isRequired: true
  },
  {
    id: 'medical_certificate',
    title: 'মেডিকেল ফিটনেস সার্টিফিকেট (Medical Certificate)',
    description: 'আবেদনকারী কোনো সংক্রামক রোগে আক্রান্ত নন এই মর্মে রেজিস্টার্ড ডাক্তারের সার্টিফিকেট।',
    guidelines: [
      'রেজিস্টার্ড এমবিবিএস ডাক্তার কর্তৃক আপনার শারীরিক পরীক্ষার রিপোর্ট এবং সার্টিফিকেট সংগ্রহ করতে হবে।',
      'সার্টিফিকেটটি অবশ্যই পররাষ্ট্র মন্ত্রণালয় থেকে সত্যায়িত হতে হবে।'
    ],
    bangladeshCollectionGuide: 'যেকোনো সরকারি বা স্বনামধন্য বেসরকারি হাসপাতাল/ডায়াগনস্টিক সেন্টার থেকে সাধারণ পরীক্ষা করিয়ে একজন রেজিস্টার্ড চিকিৎসকের কাছ থেকে প্রেসক্রাইবড ফরমেটে সার্টিফিকেট নিয়ে পররাষ্ট্র মন্ত্রণালয় থেকে সত্যায়িত করান।',
    isRequired: true
  },
  {
    id: 'passport_copy',
    title: 'পাসপোর্টের মূল কপি এবং রঙিন স্ক্যান (Passport Copy)',
    description: 'ন্যূনতম ১.৫ বছর (১৮ মাস) মেয়াদ সহ মূল পাসপোর্ট।',
    guidelines: [
      'পাসপোর্টের তথ্য পৃষ্ঠার পরিষ্কার রঙিন স্ক্যান কপি আপলোড করতে হবে।',
      'পাসপোর্টে অবশ্যই অন্তত দুটি ফাঁকা পৃষ্ঠা থাকতে হবে।'
    ],
    bangladeshCollectionGuide: 'যদি পাসপোর্টের মেয়াদ ১ বছরের কম থাকে, তবে দ্রুত রি-ইস্যুর জন্য আবেদন করুন। পাসপোর্ট অফিসের সাধারণ ই-পাসপোর্ট সেবার মাধ্যমে সংগ্রহ করতে পারেন।',
    isRequired: true
  },
  {
    id: 'indian_visa',
    title: 'ইন্ডিয়ান ভিসা এবং দিল্লী ট্রাভেল ডিক্লারেশন (Indian Visa & Delhi Travel)',
    description: 'বুলগেরিয়া ভিসা ইন্টারভিউ দিল্লীস্থ বুলগেরিয়ান দূতাবাসে সম্পন্ন করার জন্য ভারতীয় ডাবল বা মাল্টিপল এন্ট্রি ভিসা।',
    guidelines: [
      'যেহেতু বাংলাদেশে বুলগেরিয়ার সরাসরি কোনো দূতাবাস নেই, তাই সব বাংলাদেশী শিক্ষার্থীকে ভারতে গিয়ে ভিসা প্রসেস করতে হয়।',
      'এজন্য আপনার পাসপোর্টে সচল ভারতীয় ভিসা থাকতে হবে।',
      'আমাদের পোর্টালের মাধ্যমে আপনি ইন্ডিয়ান ভিসা প্রসেসিং সার্ভিস বুক করতে পারেন।'
    ],
    bangladeshCollectionGuide: 'আমরা আপনার পক্ষ থেকে ভারতীয় ভিসার আবেদন ফর্ম পূরণ, ই-টোকেন বুকিং এবং ভারতীয় ভিসা সেন্টারে (IVAC) ফাইল প্রস্তুত করার সম্পূর্ণ কাজ করে দেব।',
    isRequired: false
  }
];

export const initialApplications: Application[] = [
  {
    id: 'APP-8392',
    fullName: 'মো: তামিম ইকবাল',
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
        title: 'আবেদন জমা হয়েছে',
        body: 'প্রিয় তামিম, আপনার বুলগেরিয়া স্টুডেন্ট ভিসা আবেদন সফলভাবে জমা হয়েছে। আইডি: APP-8392।',
        type: 'sms',
        sentAt: '2026-07-10 14:15',
        recipient: '01712345678'
      },
      {
        id: 'not-2',
        title: 'ফি পরিশোধ সফল',
        body: 'আপনার ১৫,০০০ টাকা ইন্ডিয়ান ভিসা প্রসেসিং ফি bKash এর মাধ্যমে সফলভাবে পরিশোধিত হয়েছে।',
        type: 'email',
        sentAt: '2026-07-10 14:30',
        recipient: 'tamim.iqbal@example.com'
      }
    ]
  },
  {
    id: 'APP-7462',
    fullName: 'আফরিন জাহান সুমি',
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
        title: 'ডকুমেন্ট ভেরিফিকেশন শুরু',
        body: 'প্রিয় আফরিন, আপনার আপলোডকৃত ডকুমেন্টস ভেরিফিকেশন করা হচ্ছে। অনুগ্রহ করে আপনার ড্যাশবোর্ড লক্ষ্য রাখুন।',
        type: 'sms',
        sentAt: '2026-07-11 10:10',
        recipient: '01998765432'
      }
    ]
  },
  {
    id: 'APP-2918',
    fullName: 'তানভীর আহমেদ রিফাত',
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
        title: 'দিল্লী দূতাবাস অ্যাপয়েন্টমেন্ট বুকড',
        body: 'প্রিয় তানভীর, দিল্লীস্থ বুলগেরিয়া দূতাবাসে আপনার ফাইল সাবমিশনের ডেট ২০শে আগস্ট ২০২৬ তারিখে চূড়ান্ত হয়েছে। প্রয়োজনীয় কাগজপত্র সহ ভারত ভ্রমণের জন্য প্রস্তুত হন।',
        type: 'email',
        sentAt: '2026-07-05 12:00',
        recipient: 'tanvir.rifat@example.com'
      }
    ]
  },
  {
    id: 'APP-1049',
    fullName: 'নাজমুল হাসান শান্ত',
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
        name: 'Complete Bulgaria Student Visa File',
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
        title: 'বুলগেরিয়া ভিসা অনুমোদিত!',
        body: 'অভিনন্দন নাজমুল! আপনার বুলগেরিয়া স্টুডেন্ট ভিসা সফলভাবে ইস্যু করা হয়েছে। বিস্তারিত ফ্লাইট ও প্রস্থান নির্দেশিকার জন্য দ্রুত এজেন্সির সাথে যোগাযোগ করুন।',
        type: 'sms',
        sentAt: '2026-07-14 11:30',
        recipient: '01512345679'
      },
      {
        id: 'not-6',
        title: 'Bulgaria Visa Issuance Confirmation',
        body: 'Dear Nazmul, We are thrilled to inform you that your Bulgaria Student D-Visa has been stamped by the embassy. Fly high!',
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
    name: 'বিশ্ববিদ্যালয় ভর্তি ও ফাইল প্রসেসিং (University Admission & File Assessment)',
    nameEn: 'University Admission & File Assessment',
    price: 10000,
    description: 'বুলগেরিয়া বিশ্ববিদ্যালয়ে ভর্তি অফার লেটার সংগ্রহ এবং ভিসা ফাইলিং গাইডলাইন।',
    isMandatory: true
  },
  {
    id: 'indian_visa_delhi',
    name: 'ভারতীয় ডাবল এন্ট্রি ভিসা ও দিল্লী দূতাবাস সাপোর্ট (Indian Visa & Delhi Support)',
    nameEn: 'Indian Visa & Delhi Support',
    price: 5000,
    description: 'ভারতীয় ডাবল এন্ট্রি ট্যুরিস্ট ভিসা প্রসেসিং, ই-টোকেন বুকিং এবং দিল্লীতে ক্যুরিয়ার গাইড।'
  },
  {
    id: 'mofa_attestation',
    name: 'শিক্ষা ও পররাষ্ট্র মন্ত্রণালয় সত্যায়ন সহায়তা (MoFA & Ministry Attestation)',
    nameEn: 'Education Board, Ministry & MoFA Attestation Support',
    price: 4000,
    description: 'আপনার শিক্ষাগত সার্টিফিকেটসমূহ শিক্ষাবোর্ড, শিক্ষা মন্ত্রণালয় ও পররাষ্ট্র মন্ত্রণালয় থেকে দ্রুত সত্যায়ন।'
  },
  {
    id: 'police_clearance',
    name: 'পুলিশ ক্লিয়ারেন্স ও এটেস্টেশন সহায়তা (Police Clearance Attestation)',
    nameEn: 'Police Clearance & Ministry Attestation Support',
    price: 2000,
    description: 'অনলাইন পুলিশ ক্লিয়ারেন্স আবেদন এবং পররাষ্ট্র মন্ত্রণালয় থেকে সত্যায়ন সহায়তা।'
  }
];

