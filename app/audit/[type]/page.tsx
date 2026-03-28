"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "motion/react";
import { Shield, UserCheck, ImageIcon, Users, Search, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function AuditInputPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const type = params.type as 'profile' | 'content' | 'duel';
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input1) return;
    
    const searchParams = new URLSearchParams();
    searchParams.set('type', type);
    searchParams.set('input1', input1);
    if (input2) searchParams.set('input2', input2);
    
    router.push(`/processing?${searchParams.toString()}`);
  };

  const config = {
    profile: {
      title: 'Profile Audit',
      placeholder: 'Enter username (e.g., @john_doe)',
      icon: UserCheck,
      color: 'text-white'
    },
    content: {
      title: 'Content Forensic',
      placeholder: 'Paste image URL or post link',
      icon: ImageIcon,
      color: 'text-white'
    },
    duel: {
      title: 'Profile Duel',
      placeholder: 'First username',
      icon: Users,
      color: 'text-white'
    }
  }[type] || {
    title: 'Unknown Audit',
    placeholder: '',
    icon: Shield,
    color: 'text-white'
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-32 px-6 flex flex-col items-center">
      <div className="bg-image-overlay" />
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b-0 rounded-b-2xl mx-4 mt-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <Shield className="text-white w-8 h-8" />
          <span className="text-xl font-display font-bold text-white">Fraudent</span>
        </div>
      </nav>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass p-10 rounded-[2.5rem]"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 rounded-2xl bg-white/5 ${config.color}`}>
            <config.icon size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white">{config.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/20 mb-2 uppercase tracking-wider">
              {type === 'duel' ? 'Account A' : 'Investigation Target'}
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input
                type="text"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                placeholder={config.placeholder}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/20 transition-all text-white font-medium placeholder:text-white/10"
                required
              />
            </div>
          </div>

          {type === 'duel' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-white/20 mb-2 uppercase tracking-wider">Account B</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input
                  type="text"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  placeholder="Second username"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/20 transition-all text-white font-medium placeholder:text-white/10"
                  required
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Initialize Analysis
          </button>
        </form>
      </motion.div>
    </div>
  );
}
