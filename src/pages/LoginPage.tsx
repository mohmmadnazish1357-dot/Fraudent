/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider 
} from '../firebase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Basic Gmail validation hint
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError("Please use a valid @gmail.com address for forensic tracking.");
      setIsLoading(false);
      return;
    }

    // Enforce 'password' as the app password
    if (password !== 'password') {
      setError("Access Denied: Invalid forensic key. The app password is 'password'.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          setSuccessMessage("Forensic account initialized. You can now sign in.");
          setIsSignUp(false);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: any) {
      console.error("Auth Error Details:", err);
      const errorCode = err.code || "";
      const errorMessage = err.message || "";
      
      let msg = "Authentication failed. Please check your connection and try again.";
      
      if (errorCode === 'auth/invalid-credential' || errorMessage.includes('auth/invalid-credential') || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        msg = "Access Denied: Invalid email or password. If you haven't initialized your forensic account yet, please switch to 'Create Account' mode below.";
      } else if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('auth/email-already-in-use')) {
        msg = "This Gmail is already registered in our database. Please sign in instead.";
      } else if (errorCode === 'auth/weak-password' || errorMessage.includes('auth/weak-password')) {
        msg = "Security Alert: Your password must be at least 6 characters long.";
      } else if (errorCode === 'auth/operation-not-allowed' || errorMessage.includes('auth/operation-not-allowed')) {
        msg = "System Alert: Email/Password login is not enabled. Please use 'Continue with Google'.";
      }
      
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-12 rounded-[3rem] text-center border border-black/5 shadow-2xl relative"
      >
        <div className="mb-10">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-black tracking-tight mb-2">Fraudent</h1>
          <p className="text-black/40 text-sm font-medium uppercase tracking-[0.2em]">Forensic Analysis Portal</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-4 px-6 rounded-2xl bg-white border border-black/5 hover:bg-black/5 transition-all flex items-center justify-center gap-4 text-black font-bold shadow-sm disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            )}
            {isGoogleLoading ? "Verifying..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-black/5" />
            <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Or use credentials</span>
            <div className="h-px flex-1 bg-black/5" />
          </div>
        </div>

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-green-500/5 border border-green-500/20 text-green-600 text-xs font-bold flex items-center gap-3"
          >
            <CheckCircle size={16} />
            {successMessage}
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-600 text-xs font-bold flex flex-col gap-2 text-left"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
            {error.includes("Access Denied") && (
              <p className="text-[10px] opacity-70 font-medium ml-7">
                Tip: If you want to use your real Google password, use the "Continue with Google" button above.
              </p>
            )}
          </motion.div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest ml-1">Gmail Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="detective@gmail.com"
                className="w-full py-4 pl-12 pr-4 rounded-2xl bg-black/[0.02] border border-black/5 focus:border-black/20 focus:outline-none transition-all text-black font-medium"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest">password</label>
              {!isSignUp && (
                <button type="button" className="text-[9px] text-black/30 hover:text-black font-bold uppercase tracking-widest transition-colors">
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full py-4 pl-12 pr-4 rounded-2xl bg-black/[0.02] border border-black/5 focus:border-black/20 focus:outline-none transition-all text-black font-medium"
                required
              />
            </div>
            <p className="text-[9px] text-black/20 font-medium ml-1">
              {isSignUp 
                ? "Create a new password for this portal." 
                : "Enter the password you created for this app."}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-4 py-4 px-6 rounded-2xl bg-black text-white font-bold text-lg shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              isSignUp ? "Initialize Account" : "Access Portal"
            )}
          </button>
          
          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-[10px] text-black/30 hover:text-black font-bold uppercase tracking-[0.2em] transition-colors"
            >
              {isSignUp ? "Already Registered? Sign In" : "New Investigator? Create Account"}
            </button>
          </div>
        </form>
      </motion.div>
      
      <p className="mt-8 text-[10px] text-black/20 font-bold uppercase tracking-[0.3em]">
        End-to-End Encrypted • AI-Powered Forensics
      </p>
    </div>
  );
};
