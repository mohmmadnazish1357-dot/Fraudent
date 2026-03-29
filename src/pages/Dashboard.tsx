/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserCheck, Image as ImageIcon, Users, History, ChevronRight, User as UserIcon } from 'lucide-react';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { User, AuditResult } from '../types';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AuditResult[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'audits'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const audits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditResult));
      audits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistory(audits);
    }, (error) => {
      console.error("Firestore Error (LIST audits):", error);
    });

    return () => unsubscribe();
  }, [user]);

  const cards = [
    {
      id: 'profile',
      title: 'Profile Audit',
      desc: 'Analyze behavior patterns of any username.',
      icon: UserCheck,
      color: 'from-black to-black/60',
      path: '/audit/profile'
    },
    {
      id: 'content',
      title: 'Content Forensic',
      desc: 'Detect AI-generated images and deepfakes.',
      icon: ImageIcon,
      color: 'from-black/80 to-black/40',
      path: '/audit/content'
    },
    {
      id: 'duel',
      title: 'Profile Duel',
      desc: 'Compare two accounts to find the imposter.',
      icon: Users,
      color: 'from-black/60 to-black/20',
      path: '/audit/duel'
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-display font-bold mb-2 text-black">Detective Dashboard</h2>
        <p className="text-black/60">Select a forensic tool to begin your investigation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(card.path)}
            className="group relative cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity rounded-[2rem]`} />
            <div className="relative glass p-8 rounded-[2rem] h-full flex flex-col hover:border-black/10 transition-all">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg`}>
                <card.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">{card.title}</h3>
              <p className="text-black/60 text-sm leading-relaxed mb-6">{card.desc}</p>
              <div className="mt-auto flex items-center text-black font-bold text-sm group-hover:gap-2 transition-all">
                Start Audit <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {history.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <History className="text-black/30" size={20} />
            <h3 className="text-xl font-bold text-black">Recent Investigations</h3>
          </div>
          <div className="space-y-4">
            {history.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                className="glass p-4 rounded-2xl flex items-center justify-between hover:bg-cream/60 transition-colors cursor-pointer" 
                onClick={() => navigate(`/results/${item.id}`, { state: { result: item } })}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black/10 text-black flex items-center justify-center">
                    {item.type === 'profile' ? <UserCheck size={20} /> :
                     item.type === 'content' ? <ImageIcon size={20} /> :
                     <Users size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-black truncate max-w-[200px]">{item.input}</p>
                    <p className="text-xs text-black/40">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4 hidden sm:block">
                    <p className="text-xs text-black/40 uppercase">Trust Score</p>
                    <p className={`font-bold ${item.score > 70 ? 'text-green-600' : item.score > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {item.score}%
                    </p>
                  </div>
                  <ChevronRight className="text-black/20" size={20} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
