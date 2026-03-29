"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "motion/react";
import { Shield, LogOut, Search, UserCheck, Users, ImageIcon, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0A]">
        <div className="bg-image-overlay" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center relative"
        >
          <div className="mb-10">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-white/10">
              <Shield className="text-black w-10 h-10" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Fraudent</h1>
          </div>

          <div className="glass rounded-[2.5rem] p-10">
            <h2 className="text-2xl font-display font-bold mb-4 text-white">Welcome Back</h2>
            <p className="text-white/40 mb-8">
              Logged in as <strong className="text-white">{session.user?.email}</strong>
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all shadow-lg"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="w-full py-4 rounded-2xl border border-white/10 text-white/60 font-bold text-lg hover:bg-white/5 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0A]">
      <div className="bg-image-overlay" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center relative"
      >
        <div className="mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-white/10">
            <Shield className="text-black w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Fraudent</h1>
          <p className="text-white/20 text-sm font-medium uppercase tracking-[0.2em]">Forensic Analysis Portal</p>
        </div>

        <div className="glass rounded-[2.5rem] p-10">
          <h2 className="text-2xl font-display font-bold mb-4 text-white">Secure Access</h2>
          <p className="text-white/40 mb-8">
            Please sign in with your verified Google account to access the forensic tools.
          </p>
          
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login
          </button>
        </div>
      </motion.div>
      
      <p className="mt-8 text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">
        End-to-End Encrypted • AI-Powered Forensics
      </p>
    </div>
  );
}
