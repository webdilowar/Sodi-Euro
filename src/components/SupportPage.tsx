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
  Globe
} from 'lucide-react';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
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
    bio: "বুলগেরিয়ায় উচ্চশিক্ষায় পাড়ি জমানোর স্বপ্নকে বাস্তব রূপ দিতে 'Sodi Euro' প্ল্যাটফর্মের সূচনা করেন। তিনি বাংলাদেশি শিক্ষার্থীদের ফাইল প্রস্তুতকরণ, আইনি কাগজপত্র যাচাই এবং বুলগেরিয়াতে পৌঁছানোর পর সব ধরনের গাইডেন্স প্রদানে নিবেদিত।",
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
    bio: "বুলগেরিয়ান বিশ্ববিদ্যালয়সমূহের সাথে সরাসরি প্রাতিষ্ঠানিক যোগাযোগ রক্ষা এবং ডক্যুমেন্ট প্রসেসিং-এর মূল দায়িত্বে নিয়োজিত আছেন। তার নিবিড় তত্ত্বাবধানে শিক্ষার্থীদের অফার লেটার এবং মিনিস্ট্রি অফ এডুকেশন (D-Visa) অনুমোদন প্রক্রিয়া দ্রুত সম্পন্ন হয়।",
    badge: "University Liaison & Operations",
    colorClass: "from-brand-gold via-brand-gold-dark to-slate-900",
    accentBorder: "border-brand-gold/30",
    btnText: "পরিচালকের সাথে সরাসরি যোগাযোগ করুন",
    btnUrl: "https://wa.me/8801987654321?text=Hello%20Sohel%20Rana,%20I%20need%20support%20with%20my%20university%20admission%2520status.",
    createdAt: "2026-07-10 00:00"
  }
];

export default function SupportPage() {
  const [supportMembers, setSupportMembers] = useState<SupportMember[]>(initialSupportMembers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'support_members'), (snapshot) => {
      const list: SupportMember[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as SupportMember);
      });

      if (snapshot.empty) {
        // Seed Firestore if collection is empty
        initialSupportMembers.forEach(async (member) => {
          try {
            await setDoc(doc(db, 'support_members', member.id), member);
          } catch (err) {
            console.error('Seeding support_members failed:', err);
          }
        });
        setSupportMembers(initialSupportMembers);
        setLoading(false);
      } else {
        // Sort by createdAt asc to maintain owner first order
        list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        setSupportMembers(list);
        setLoading(false);
      }
    }, (error) => {
      console.error('Firestore Support Page Error: ', error);
      // Fallback to initial static data on error to keep UI functional
      setSupportMembers(initialSupportMembers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-10 py-2 max-w-5xl mx-auto" id="support-page-container">
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
        /* Support Members Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {supportMembers.map((member, index) => {
            const finalBtnUrl = member.whatsapp && !member.btnUrl.startsWith('http') 
              ? `https://wa.me/${member.whatsapp}?text=Hello%20${encodeURIComponent(member.name)},%20I%20need%20support%20with%20my%20Bulgaria%20Student%20Visa%20Application.`
              : member.btnUrl;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className={`relative bg-white rounded-3xl overflow-hidden border-2 ${member.accentBorder || 'border-slate-100'} shadow-lg hover:shadow-xl transition-all group flex flex-col justify-between`}
                id={`support-member-card-${member.id}`}
              >
                {/* Header / Avatar Cover */}
                <div className={`h-32 bg-gradient-to-r ${member.colorClass || 'from-slate-700 to-slate-900'} relative overflow-hidden`}>
                  {member.coverPhotoUrl ? (
                    <img 
                      src={member.coverPhotoUrl} 
                      alt={`${member.name} cover`} 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <>
                      {/* Decorative light effects */}
                      <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                      <div className="absolute -bottom-6 left-10 w-24 h-24 bg-brand-gold/10 rounded-full blur-md"></div>
                    </>
                  )}
                  
                  {/* Subtle dark overlay for readability on cover images */}
                  {member.coverPhotoUrl && <div className="absolute inset-0 bg-slate-950/20"></div>}

                  {/* Badge positioned top-right so it never collides with the profile photo / name */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-[10px] uppercase font-black tracking-widest text-brand-gold bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-brand-gold/25 shadow-sm">
                      {member.badge}
                    </span>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-6 md:p-8 space-y-6 flex-grow">
                  {/* Name & Role */}
                  <div className="relative -mt-14 z-20 flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                    {/* Photo or Monogram Avatar */}
                    <div className="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-md border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {member.photoUrl ? (
                        <img 
                          src={member.photoUrl} 
                          alt={member.name} 
                          className="h-full w-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`h-full w-full rounded-xl bg-gradient-to-br ${member.colorClass || 'from-slate-700 to-slate-900'} text-white font-display font-black text-2xl flex items-center justify-center shadow-inner`}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>

                    <div className="pb-1 min-w-0 flex-1">
                      <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-brand-sky transition-colors truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs font-bold text-brand-sky bg-brand-sky-light/45 inline-block px-2.5 py-0.5 rounded-md border border-brand-sky/10 mt-1 truncate max-w-full">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Bio Description */}
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      ভূমিকা ও বিবরণ
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 rounded-2xl p-4 border border-slate-100/50 whitespace-pre-line">
                      {member.bio}
                    </p>
                  </div>

                  {/* Contact Credentials */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      যোগাযোগের মাধ্যমসমূহ
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {/* Phone */}
                      {member.phone && (
                        <a 
                          href={`tel:${member.phone.replace(/[\s-]/g, '')}`}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-brand-sky/40 hover:bg-brand-sky-light/10 transition-all text-slate-700"
                          title="ফোন কল করুন"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">সরাসরি ফোন</span>
                            <span className="font-semibold font-mono text-slate-800 text-[11px]">{member.phone}</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-300 ml-auto shrink-0" />
                        </a>
                      )}

                      {/* Email */}
                      {member.email && (
                        <a 
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-brand-sky/40 hover:bg-brand-sky-light/10 transition-all text-slate-700"
                          title="ইমেল করুন"
                        >
                          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="text-left truncate max-w-[80%]">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">অফিসিয়াল ইমেইল</span>
                            <span className="font-semibold text-slate-800 text-[11px] truncate block">{member.email}</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-300 ml-auto shrink-0" />
                        </a>
                      )}

                      {/* Branch Location */}
                      {member.location && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-slate-700">
                          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">অবস্থান ও শাখা</span>
                            <span className="font-semibold text-slate-700 text-[11px]">{member.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA Button Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
                  <a
                    href={finalBtnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md group-hover:scale-[1.01]`}
                  >
                    <MessageSquare className="h-4 w-4 text-brand-gold shrink-0 animate-pulse" />
                    <span>{member.btnText || 'সরাসরি যোগাযোগ করুন'}</span>
                  </a>
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
    </div>
  );
}
