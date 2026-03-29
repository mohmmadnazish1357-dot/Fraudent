/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserCheck, Image as ImageIcon, Users, Search } from 'lucide-react';

interface AuditInputPageProps {
  type: 'profile' | 'content' | 'duel';
}

export const AuditInputPage: React.FC<AuditInputPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input1) return;
    navigate('/processing', { state: { type, input1, input2 } });
  };

  const config = {
    profile: {
      title: 'Profile Audit',
      placeholder: 'Enter username (e.g., @john_doe)',
      icon: UserCheck,
      color: 'text-black'
    },
    content: {
      title: 'Content Forensic',
      placeholder: 'Paste image URL or post link',
      icon: ImageIcon,
      color: 'text-black'
    },
    duel: {
      title: 'Profile Duel',
      placeholder: 'First username',
      icon: Users,
      color: 'text-black'
    }
  }[type];

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass p-10 rounded-[2.5rem]"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 rounded-2xl bg-cream/10 ${config.color}`}>
            <config.icon size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold">{config.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black/40 mb-2 uppercase tracking-wider">
              {type === 'duel' ? 'Account A' : 'Investigation Target'}
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={20} />
              <input
                type="text"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                placeholder={config.placeholder}
                className="w-full bg-cream/30 border border-black/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-black/20 transition-all text-black"
                required
              />
            </div>
          </div>

          {type === 'duel' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-black/40 mb-2 uppercase tracking-wider">Account B</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={20} />
                <input
                  type="text"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  placeholder="Second username"
                  className="w-full bg-cream/30 border border-black/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-black/20 transition-all text-black"
                  required
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-black text-white font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Initialize Analysis
          </button>
        </form>
      </motion.div>
    </div>
  );
};
