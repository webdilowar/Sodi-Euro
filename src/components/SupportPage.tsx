import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  User, 
  ExternalLink,
  Award,
  Globe,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SupportMember } from '../types';

export const initialSupportMembers: SupportMember[] = [
  {
    id: "dilowar_hosen",
    name: "Dilowar Hosen",
    role: "ওনার (Owner & Founder)",
    email: "dilowarhosen1@gmail.com",
    phone: "+880 1712-345678",
    whatsapp: "8801712345678",
    location: "ঢাকা অফিস, বাংলাদেশ",
    bio: "বুলগেরিয়ায় উচ্চশিক্ষায় পাড়ি জমানোর স্বপ্নকে বাস্তব রূপ দিতে 'Sodi Euro' প্ল্যাটফর্মের সূচনা করেন। তিনি বাংলাদেশি শিক্ষার্থীদের ফাইল প্রস্তুতকরণ, আইনি কাগজপত্র যাচাই এবং ফাইল সাবমিশন প্রক্রিয়ার প্রতিটি ধাপে স্বচ্ছতা নিশ্চিত করেন। এছাড়া বুলগেরিয়াতে পৌঁছানোর পর শিক্ষার্থীদের বিমানবন্দর থেকে রিসিভ করা, আবাসন সুবিধা নিশ্চিত করা এবং স্থানীয় গাইডেন্স প্রদানে তিনি সরাসরি নেতৃত্ব দেন।",
    badge: "Founder & Visionary",
    colorClass: "from-brand-sky via-brand-sky-dark to-slate-950",
    accentBorder: "border-brand-sky/30",
    btnText: "ওনারের সাথে সরাসরি যোগাযোগ করুন",
    btnUrl: "https://wa.me/8801712345678?text=Hello%20Dilowar%20Hosen,%20I%20need%20support%20with%20my%20Bulgaria%20Student%20Visa%20Application.",
    createdAt: "2026-07-10 00:00"
  },
  {
    id: "sohel_rana",
    name: "Sohel Rana",
    role: "ব্যবস্থাপনা পরিচালক (Managing Director)",
    email: "sohel.rana@sodieuro.com",
    phone: "+880 1987-654321",
    whatsapp: "8801987654321",
    location: "সোফিয়া, বুলগেরিয়া ও ঢাকা অফিস",
    bio: "বুলগেরিয়ান বিশ্ববিদ্যালয়সমূহের সাথে সরাসরি প্রাতিষ্ঠানিক যোগাযোগ রক্ষা এবং ডক্যুমেন্ট প্রসেসিং-এর মূল দায়িত্বে নিয়োজিত আছেন। তার নিবিড় তত্ত্বাবধানে শিক্ষার্থীদের অফার লেটার এবং মিনিস্ট্রি অফ এডুকেশন (D-Visa) অনুমোদন প্রক্রিয়া দ্রুত সম্পন্ন হয়। দীর্ঘ ৪ বছরের অভিজ্ঞতাসম্পন্ন সোহেল রানা আইনি ও প্রশাসনিক জটিলতা সমাধানে পারদর্শী।",
    badge: "University Liaison & Operations",
    colorClass: "from-brand-gold via-brand-gold-dark to-slate-900",
    accentBorder: "border-brand-gold/30",
    btnText: "পরিচালকের সাথে সরাসরি যোগাযোগ করুন",
    btnUrl: "https://wa.me/8801987654321?text=Hello%20Sohel%20Rana,%20I%20need%20support%20with%20my%20university%20admission%20status.",
    createdAt: "2026-07-10 00:00"
  }
];

export default function SupportPage() {
  const [supportMembers, setSupportMembers] = useState<SupportMember[]>(initialSupportMembers);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'support_members'), (snapshot) => {
      const list: SupportMember[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as SupportMember);
      });

      if (snapshot.empty) {
        setSupportMembers(initialSupportMembers);
      } else {
        list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        setSupportMembers(list);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firestore Support Load Error:', error);
      handleFirestoreError(error, OperationType.LIST, 'support_members');
      setSupportMembers(initialSupportMembers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const selectedMember = supportMembers.find(m => m.id === selectedMemberId);

  return (
    <div className="space-y-10 py-2 max-w-5xl mx-auto" id="support-page-container">
      {selectedMember ? (
        /* ---------------- DEDICATED DETAIL SUBPAGE VIEW ---------------- */
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 15 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
          id={`support-member-detail-${selectedMember.id}`}
        >
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              onClick={() => setSelectedMemberId(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 text-brand-sky" />
              <span>পেছনে ফিরে যান (Go Back)</span>
            </button>
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">
              সদস্য প্রোফাইল
            </span>
          </div>

          {/* Profile Card Container */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-100/50">
            {/* Header Cover Image/Gradient */}
            <div className={`h-48 md:h-60 bg-gradient-to-r ${selectedMember.colorClass || 'from-slate-700 to-slate-900'} relative overflow-hidden`}>
              {selectedMember.coverPhotoUrl ? (
                <img 
                  src={selectedMember.coverPhotoUrl} 
                  alt={`${selectedMember.name} cover`} 
                  className="absolute inset-0 w-full h-full object-cover opacity-95"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="absolute -bottom-10 left-10 w-44 h-44 bg-brand-gold/10 rounded-full blur-xl"></div>
                </>
              )}
              {selectedMember.coverPhotoUrl && <div className="absolute inset-0 bg-slate-950/25"></div>}

              {/* Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="text-[10px] uppercase font-black tracking-widest text-brand-gold bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-brand-gold/25 shadow-sm">
                  {selectedMember.badge}
                </span>
              </div>
            </div>

            {/* Main Info Section */}
            <div className="p-6 md:p-10 space-y-8">
              {/* Avatar / Identity overlapping */}
              <div className="relative -mt-20 md:-mt-24 z-20 flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left pb-4 border-b border-slate-100">
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl bg-white p-2 shadow-lg border border-slate-200/60 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedMember.photoUrl ? (
                    <img 
                      src={selectedMember.photoUrl} 
                      alt={selectedMember.name} 
                      className="h-full w-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`h-full w-full rounded-2xl bg-gradient-to-br ${selectedMember.colorClass || 'from-slate-700 to-slate-900'} text-white font-display font-black text-4xl flex items-center justify-center shadow-inner`}>
                      {selectedMember.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 pb-2">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-display">
                    {selectedMember.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-xs font-bold text-brand-sky bg-brand-sky-light/50 px-3 py-1 rounded-lg border border-brand-sky/15">
                      {selectedMember.role}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {selectedMember.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Content: 2-Column on large screen */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Left Column: Bio */}
                <div className="md:col-span-3 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <User className="h-4 w-4 text-brand-sky" />
                    ভূমিকা ও বিস্তারিত পরিচিতি
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50/50 rounded-2xl p-5 border border-slate-100 whitespace-pre-line font-medium shadow-inner">
                    {selectedMember.bio}
                  </p>
                </div>

                {/* Right Column: Contact credentials */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-gold" />
                    সরাসরি যোগাযোগ ও সহায়তা
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    {/* Phone */}
                    {selectedMember.phone && (
                      <a 
                        href={`tel:${selectedMember.phone.replace(/[\s-]/g, '')}`}
                        className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-brand-sky/40 hover:bg-brand-sky-light/10 transition-all text-slate-700 shadow-sm"
                        title="ফোন কল করুন"
                      >
                        <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Phone className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none mb-1">সরাসরি ফোন করুন</span>
                          <span className="font-semibold font-mono text-slate-800 text-[11px]">{selectedMember.phone}</span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-300 ml-auto shrink-0" />
                      </a>
                    )}

                    {/* Email */}
                    {selectedMember.email && (
                      <a 
                        href={`mailto:${selectedMember.email}`}
                        className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-brand-sky/40 hover:bg-brand-sky-light/10 transition-all text-slate-700 shadow-sm"
                        title="ইমেল করুন"
                      >
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left truncate max-w-[75%]">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none mb-1">অফিসিয়াল ইমেইল</span>
                          <span className="font-semibold text-slate-800 text-[11px] truncate block">{selectedMember.email}</span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-300 ml-auto shrink-0" />
                      </a>
                    )}

                    {/* Location */}
                    {selectedMember.location && (
                      <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-700">
                        <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <MapPin className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none mb-1">অবস্থান ও শাখা</span>
                          <span className="font-semibold text-slate-700 text-[11px]">{selectedMember.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA Banner */}
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={selectedMember.whatsapp && !selectedMember.btnUrl.startsWith('http') 
                    ? `https://wa.me/${selectedMember.whatsapp}?text=Hello%20${encodeURIComponent(selectedMember.name)},%20I%20need%20support%20with%20my%20Bulgaria%20Student%20Visa%20Application.`
                    : selectedMember.btnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-black text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md active:scale-[0.99]"
                >
                  <MessageSquare className="h-5 w-5 text-brand-gold shrink-0 animate-pulse" />
                  <span>{selectedMember.btnText || 'সরাসরি যোগাযোগ করুন'}</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ---------------- LIST VIEW OF SIMPLE CARDS ---------------- */
        <>
          {/* Page Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-xs text-brand-gold-dark font-black">
              <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-pulse" />
              ২৪/৭ সার্বিক সহায়তা ও যোগাযোগ
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black text-slate-800 tracking-tight leading-tight">
              আমাদের <span className="bg-gradient-to-r from-brand-sky to-brand-gold bg-clip-text text-transparent">নেতৃত্ব ও সাপোর্ট</span> টিম
            </h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Sodi Euro-র সম্মানিত ওনার এবং ব্যবস্থাপনা পরিচালক সরাসরি শিক্ষার্থীদের সকল ফাইল মনিটর করেন। যে কোনো তথ্যের জন্য তাদের সাথে সরাসরি যোগাযোগ করুন।
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3" id="support-loading">
              <div className="h-8 w-8 border-4 border-brand-sky border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400">সাপোর্ট টিম তথ্য লোড করা হচ্ছে...</p>
            </div>
          ) : (
            /* Support Members Grid (Compact Simple Cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {supportMembers.map((member, index) => {
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.1 }}
                    className={`relative bg-white rounded-3xl overflow-hidden border-2 ${member.accentBorder || 'border-slate-100'} shadow-md hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer`}
                    onClick={() => setSelectedMemberId(member.id)}
                    id={`support-member-card-${member.id}`}
                  >
                    {/* Compact Cover Background */}
                    <div className={`h-24 bg-gradient-to-r ${member.colorClass || 'from-slate-700 to-slate-900'} relative overflow-hidden`}>
                      {member.coverPhotoUrl ? (
                        <img 
                          src={member.coverPhotoUrl} 
                          alt={`${member.name} cover`} 
                          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
                      )}
                      {member.coverPhotoUrl && <div className="absolute inset-0 bg-slate-950/15"></div>}
                      
                      {/* Top Right Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="text-[9px] uppercase font-black tracking-widest text-brand-gold bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-brand-gold/15 shadow-sm">
                          {member.badge}
                        </span>
                      </div>
                    </div>

                    {/* Compact Body Content */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="relative -mt-12 z-20 flex items-center gap-3.5 mb-4">
                          {/* Photo or Monogram Avatar */}
                          <div className="h-16 w-16 rounded-2xl bg-white p-1 shadow-md border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {member.photoUrl ? (
                              <img 
                                src={member.photoUrl} 
                                alt={member.name} 
                                className="h-full w-full object-cover rounded-xl"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`h-full w-full rounded-xl bg-gradient-to-br ${member.colorClass || 'from-slate-700 to-slate-900'} text-white flex items-center justify-center font-black text-lg`}>
                                {member.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          {/* Name and Title */}
                          <div className="text-left">
                            <h3 className="text-sm font-black text-slate-800 leading-tight group-hover:text-brand-sky transition-colors">
                              {member.name}
                            </h3>
                            <p className="text-[10px] font-bold text-brand-sky bg-brand-sky-light/45 inline-block px-2 py-0.5 rounded-md border border-brand-sky/10 mt-1">
                              {member.role}
                            </p>
                          </div>
                        </div>

                        {/* Info snippet */}
                        <div className="space-y-2 text-xs text-slate-500 text-left border-t border-slate-50 pt-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{member.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Click trigger action button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-brand-sky font-bold text-xs">
                        <span>বিস্তারিত প্রোফাইল ও যোগাযোগ</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Sodi Euro Trust Badges Section */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl" id="support-trust-block">
            {/* Abstract graphics */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-sky/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-brand-gold/5 rounded-full blur-2xl"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-center md:text-left">
              {/* Badge 1 */}
              <div className="space-y-2 flex flex-col md:items-start items-center">
                <div className="h-10 w-10 rounded-xl bg-brand-sky/10 border border-brand-sky/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-brand-sky" />
                </div>
                <h4 className="text-xs font-black text-slate-200">শতভাগ বিশ্বস্ততা ও স্বচ্ছতা</h4>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                  আপনার ফাইল প্রসেসিং এবং আর্থিক লেনদেনের প্রতিটি ধাপে রিয়েল-টাইম ট্র্যাকিং সুবিধা নিশ্চিত করা হয়।
                </p>
              </div>

              {/* Badge 2 */}
              <div className="space-y-2 flex flex-col md:items-start items-center md:pl-6 pt-4 md:pt-0">
                <div className="h-10 w-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                  <Award className="h-5 w-5 text-brand-gold" />
                </div>
                <h4 className="text-xs font-black text-slate-200">বিশেষজ্ঞ ভিসা কনসালট্যান্টস</h4>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                  বুলগেরিয়ার শিক্ষা মন্ত্রনালয় এবং বিশ্ববিদ্যালয়ের আইন ও নিয়মকানুন সম্পর্কে দীর্ঘ ৪ বছরের অভিজ্ঞ টিম।
                </p>
              </div>

              {/* Badge 3 */}
              <div className="space-y-2 flex flex-col md:items-start items-center md:pl-6 pt-4 md:pt-0">
                <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-indigo-400" />
                </div>
                <h4 className="text-xs font-black text-slate-200">ইউরোপিয়ান লোকাল গাইডেন্স</h4>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                  বুলগেরিয়াতে নামার পর এয়ারপোর্ট রিসিভ, বাসস্থান খোঁজা এবং টিআরসি কার্ড (TRC Card) প্রসেসিং-এ সরাসরি সহায়তা।
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
