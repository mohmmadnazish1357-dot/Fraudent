/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged, signOut } from './firebase';
import { generateBackgroundImage } from './services/aiService';
import { User } from './types';

// Components
import { Navbar } from './components/Navbar';
import { AmbientBackground } from './components/AmbientBackground';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { AuditInputPage } from './pages/AuditInputPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultsPage } from './pages/ResultsPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [bgImage, setBgImage] = useState<string>('');
  const [appError, setAppError] = useState<Error | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        const selected = await aiStudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        // Fallback for non-AI Studio environments (like Vercel)
        const envKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
        setHasApiKey(!!envKey);
      }
    };
    checkApiKey();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Investigator',
          email: fbUser.email || '',
          photo: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`
        });
        
        // Generate a thematic background
        try {
          const img = await generateBackgroundImage('forensic investigation dark aesthetic');
          setBgImage(img);
        } catch (e) {
          console.error("BG Generation failed", e);
        }
      } else {
        setUser(null);
      }
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSelectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
      setHasApiKey(true);
    } else {
      alert("Please set VITE_GEMINI_API_KEY in your environment variables.");
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-black/40">Initializing Forensics...</p>
        </div>
      </div>
    );
  }

  if (appError) {
    return <ErrorBoundary error={appError} reset={() => setAppError(null)} />;
  }

  return (
    <Router>
      <div className="relative min-h-screen">
        <AmbientBackground imageUrl={bgImage} />
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          hasApiKey={hasApiKey} 
          onSelectKey={handleSelectKey} 
        />
        
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
              
              <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/audit/profile" element={user ? <AuditInputPage type="profile" /> : <Navigate to="/login" />} />
              <Route path="/audit/content" element={user ? <AuditInputPage type="content" /> : <Navigate to="/login" />} />
              <Route path="/audit/duel" element={user ? <AuditInputPage type="duel" /> : <Navigate to="/login" />} />
              <Route path="/processing" element={user ? <ProcessingPage user={user} /> : <Navigate to="/login" />} />
              <Route path="/results/:id" element={user ? <ResultsPage /> : <Navigate to="/login" />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="fixed bottom-6 left-0 right-0 z-50 text-center pointer-events-none">
          <p className="text-[10px] text-black/20 font-bold uppercase tracking-[0.3em]">
            Fraudent Forensic Analysis System v1.0.4
          </p>
        </footer>
      </div>
    </Router>
  );
}
