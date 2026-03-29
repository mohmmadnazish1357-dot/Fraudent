/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scan } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, setDoc } from '../firebase';
import { analyzeProfile, analyzeContent, analyzeDuel } from '../services/aiService';
import { User, AuditResult } from '../types';

interface ProcessingPageProps {
  user: User;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, input1, input2 } = location.state || {};
  const [status, setStatus] = useState('Initializing forensic engine...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!type || !user) {
      navigate('/');
      return;
    }

    const steps = [
      'Analyzing follower-to-following ratio...',
      'Checking for AI-generated artifacts...',
      'Analyzing comment sentiment...',
      'Scanning for bot-like activity...',
      'Cross-referencing database...',
      'Finalizing trust score...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(steps[currentStep]);
        setProgress(((currentStep + 1) / steps.length) * 100);
        currentStep++;
      } else {
        clearInterval(interval);
        performAnalysis();
      }
    }, 1000);

    const performAnalysis = async () => {
      try {
        let result: AuditResult;
        if (type === 'profile') result = await analyzeProfile(input1);
        else if (type === 'content') result = await analyzeContent(input1);
        else result = await analyzeDuel(input1, input2);

        const auditData = {
          ...result,
          uid: user.uid,
          timestamp: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'audits', result.id), auditData);
        } catch (err) {
          console.error("Failed to save audit to Firestore:", err);
        }

        navigate(`/results/${result.id}`, { state: { result } });
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Forensic analysis failed.");
        navigate('/');
      }
    };

    return () => clearInterval(interval);
  }, [type, input1, input2, navigate, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="relative w-48 h-48 mx-auto mb-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-black/5 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-4 border-black/10 border-t-black rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Scan className="w-16 h-16 text-black animate-pulse" />
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold mb-4 text-black">Scanning...</h2>
        <p className="text-black/60 mb-8 h-6">{status}</p>

        <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
