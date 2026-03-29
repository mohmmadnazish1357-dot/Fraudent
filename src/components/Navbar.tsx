/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b-0 rounded-b-2xl mx-4 mt-4">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <Shield className="text-black w-8 h-8" />
        <span className="text-xl font-display font-bold text-black">
          Fraudent
        </span>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/40 border border-black/10">
            <img src={user.photo} alt={user.name} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
            <span className="text-sm font-medium text-black">{user.name}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-cream/40 transition-colors text-black/60 hover:text-black"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      )}
    </nav>
  );
};
