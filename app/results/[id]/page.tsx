"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "motion/react";
import { Shield, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { db, doc, getDoc } from "@/src/firebase";
import { AuditResult } from "@/src/services/aiService";

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'audits', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResult(docSnap.data() as AuditResult);
        }
      } catch (err) {
        console.error("Error fetching result:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (status === "loading" || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!result) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center">
      <h2 className="text-2xl font-display font-bold mb-4 text-white">Report Not Found</h2>
      <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-white text-black rounded-xl font-bold">Back to Dashboard</button>
    </div>
  );

  const isDuel = result.type === 'duel';

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="bg-image-overlay" />
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b-0 rounded-b-2xl mx-4 mt-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <Shield className="text-white w-8 h-8" />
          <span className="text-xl font-display font-bold text-white">Fraudent</span>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold mb-2 text-white">Forensic Report</h2>
            <p className="text-white/20">Investigation ID: {result.id}</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 rounded-xl glass hover:bg-white/5 transition-all text-white font-bold"
          >
            New Audit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Trust Meter */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center"
          >
            <div className="relative w-64 h-64 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 110}
                  initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - result.score / 100) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className={`${
                    result.score > 70 ? 'text-green-500' : 
                    result.score > 40 ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-display font-bold text-white">{result.score}%</span>
                <span className="text-white/20 uppercase tracking-widest text-sm">Trust Score</span>
              </div>
            </div>

            <div className={`px-6 py-2 rounded-full font-bold text-sm mb-6 ${
              result.score > 70 ? 'bg-green-500/10 text-green-500' : 
              result.score > 40 ? 'bg-yellow-500/10 text-yellow-500' : 
              'bg-red-500/10 text-red-500'
            }`}>
              {result.score > 70 ? 'VERIFIED TRUSTWORTHY' : 
               result.score > 40 ? 'CAUTION ADVISED' : 
               'HIGH FRAUD RISK'}
            </div>

            <p className="text-white/40 leading-relaxed">
              {isDuel 
                ? (result.details.bothFake 
                    ? `Forensic analysis indicates that BOTH accounts "${result.details.original}" and "${result.details.imposter}" exhibit high-risk fraudulent behavior.`
                    : `Analysis complete. Account "${result.details.original}" shows authentic patterns, while "${result.details.imposter}" displays high risk factors.`)
                : `Our AI engine has analyzed "${result.input}" and detected several patterns consistent with ${result.score < 50 ? 'suspicious' : 'authentic'} behavior.`
              }
            </p>
          </motion.div>

          {/* Right Side: Evidence Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <AlertTriangle className="text-white/20" size={24} />
              Forensic Evidence
            </h3>
            
            <div className="space-y-4">
              {result.evidence.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="glass p-6 rounded-2xl flex gap-4"
                >
                  <div className="mt-1">
                    {result.score > 70 ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertTriangle className="text-red-500" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-white/80 leading-relaxed font-medium">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {isDuel && (
              <div className="glass p-8 rounded-[2.5rem] border-white/5">
                <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-white/20">Duel Comparison</h4>
                <div className="grid grid-cols-2 gap-4">
                  {result.details.bothFake ? (
                    <>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-red-500 uppercase font-bold mb-1">Fraudulent</p>
                        <p className="font-display font-bold text-lg text-white">{result.details.original}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-red-600 uppercase font-bold mb-1">Fraudulent</p>
                        <p className="font-display font-bold text-lg text-white">{result.details.imposter}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                        <p className="text-xs text-green-500 uppercase font-bold mb-1">Original</p>
                        <p className="font-display font-bold text-lg text-white">{result.details.original}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-red-500 uppercase font-bold mb-1">Imposter</p>
                        <p className="font-display font-bold text-lg text-white">{result.details.imposter}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
