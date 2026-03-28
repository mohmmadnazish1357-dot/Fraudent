"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Scan, Shield } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { analyzeProfile, analyzeContent, analyzeDuel, AuditResult } from "@/src/services/aiService";
import { db, doc, setDoc } from "@/src/firebase";

function ProcessingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'profile' | 'content' | 'duel';
  const input1 = searchParams.get('input1');
  const input2 = searchParams.get('input2');
  
  const [statusText, setStatusText] = useState('Initializing forensic engine...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (!type || !input1 || !session?.user) return;

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
        setStatusText(steps[currentStep]);
        setProgress(((currentStep + 1) / steps.length) * 100);
        currentStep++;
      } else {
        clearInterval(interval);
        performAnalysis();
      }
    }, 1200);

    const performAnalysis = async () => {
      try {
        let result: AuditResult;
        if (type === 'profile') result = await analyzeProfile(input1);
        else if (type === 'content') result = await analyzeContent(input1);
        else result = await analyzeDuel(input1, input2 || '');

        const userId = (session.user as any).id;
        const auditData = {
          ...result,
          uid: userId,
          timestamp: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'audits', result.id), auditData);
        } catch (err) {
          console.error("Failed to save audit to Firestore:", err);
        }

        router.push(`/results/${result.id}`);
      } catch (error) {
        console.error(error);
        router.push('/dashboard');
      }
    };

    return () => clearInterval(interval);
  }, [type, input1, input2, router, session]);

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
      <div className="bg-image-overlay" />
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b-0 rounded-b-2xl mx-4 mt-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <Shield className="text-white w-8 h-8" />
          <span className="text-xl font-display font-bold text-white">Fraudent</span>
        </div>
      </nav>

      <div className="max-w-md w-full text-center">
        <div className="relative w-48 h-48 mx-auto mb-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-white/5 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-4 border-white/10 border-t-white rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Scan className="w-16 h-16 text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold mb-4 text-white">Scanning...</h2>
        <p className="text-white/40 mb-8 h-6">{statusText}</p>

        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
