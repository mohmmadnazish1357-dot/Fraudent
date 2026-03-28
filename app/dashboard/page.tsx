"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Shield, UserCheck, ImageIcon, Users, History, ChevronRight, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { db, collection, query, where, onSnapshot } from "@/src/firebase";
import { AuditResult } from "@/src/services/aiService";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<AuditResult[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;

    const userId = (session.user as any).id;
    const q = query(collection(db, 'audits'), where('uid', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const audits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditResult));
      audits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(audits);
    }, (error) => {
      console.error("Firestore Error (LIST audits):", error);
    });

    return () => unsubscribe();
  }, [session]);

  if (status === "loading") return null;

  const cards = [
    {
      id: 'profile',
      title: 'Profile Audit',
      desc: 'Analyze behavior patterns of any username.',
      icon: UserCheck,
      color: 'from-white to-white/60',
      path: '/audit/profile'
    },
    {
      id: 'content',
      title: 'Content Forensic',
      desc: 'Detect AI-generated images and deepfakes.',
      icon: ImageIcon,
      color: 'from-white/80 to-white/40',
      path: '/audit/content'
    },
    {
      id: 'duel',
      title: 'Profile Duel',
      desc: 'Compare two accounts to find the imposter.',
      icon: Users,
      color: 'from-white/60 to-white/20',
      path: '/audit/duel'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="bg-image-overlay" />
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b-0 rounded-b-2xl mx-4 mt-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <Shield className="text-white w-8 h-8" />
          <span className="text-xl font-display font-bold text-white">Fraudent</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-4">
            {session?.user?.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-white/10"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-sm font-bold text-white hidden sm:block">{session?.user?.name}</span>
          </div>
          <button 
            onClick={() => signOut()}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <header className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-2 text-white">Detective Dashboard</h2>
          <p className="text-white/40">Select a forensic tool to begin your investigation.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => router.push(card.path)}
              className="group relative cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity rounded-[2rem]`} />
              <div className="relative glass p-8 rounded-[2.5rem] h-full flex flex-col hover:border-white/20 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-lg`}>
                  <card.icon className="text-black" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{card.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">{card.desc}</p>
                <div className="mt-auto flex items-center text-white font-bold text-sm group-hover:gap-2 transition-all">
                  Start Audit <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {history.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <History className="text-white/20" size={20} />
              <h3 className="text-xl font-bold text-white">Recent Investigations</h3>
            </div>
            <div className="space-y-4">
              {history.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-colors cursor-pointer" 
                  onClick={() => router.push(`/results/${item.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-white">
                      {item.type === 'profile' ? <UserCheck size={20} /> :
                       item.type === 'content' ? <ImageIcon size={20} /> :
                       <Users size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.input}</p>
                      <p className="text-xs text-white/20">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-xs text-white/20 uppercase">Trust Score</p>
                      <p className={`font-bold ${item.score > 70 ? 'text-green-500' : item.score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {item.score}%
                      </p>
                    </div>
                    <ChevronRight className="text-white/20" size={20} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
