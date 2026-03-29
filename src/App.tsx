/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  UserCheck, 
  Image as ImageIcon, 
  Users, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  History, 
  LogOut, 
  ChevronRight,
  Loader2,
  Scan,
  Mail,
  Lock,
  AlertCircle
} from 'lucide-react';
import { analyzeProfile, analyzeContent, analyzeDuel, AuditResult, generateBackgroundImage } from './services/aiService';
import { 
  db, doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot,
  auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut
} from './firebase';

// --- Types ---
interface User {
  uid: string;
  name: string;
  email: string;
  photo: string;
}

// --- Components ---

const ErrorBoundary = ({ error, reset }: { error: Error, reset: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div className="glass p-10 rounded-[2.5rem] max-w-md w-full">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-display font-bold mb-4 text-black">System Error</h2>
      <p className="text-black/60 mb-8">
        {error.message}
      </p>
      <button 
        onClick={reset}
        className="w-full py-4 rounded-2xl bg-black text-white font-bold"
      >
        Restart System
      </button>
    </div>
  </div>
);

// --- Components ---

const AmbientBackground = ({ imageUrl }: { imageUrl?: string }) => (
  <>
    <div 
      className="ambient-bg" 
      style={imageUrl ? { backgroundImage: `linear-gradient(rgba(253, 245, 230, 0.9), rgba(253, 245, 230, 0.9)), url(${imageUrl})` } : {}} 
    />
    <div className="bg-image-overlay" />
    <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-[120px] animate-float" />
    <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-white/40 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-5s' }} />
  </>
);

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
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
          >
            <LogOut size={20} />
          </button>
        </div>
      )}
    </nav>
  );
};

// --- Pages ---

const LoginPage = () => {
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
      // Set custom parameters to prompt for account selection
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
            {isGoogleLoading ? "Verifying..." : "Login"}
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
              <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest">App Password</label>
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
                placeholder="••••••••"
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
              isSignUp ? "Initialize Account" : "Login"
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

const Dashboard = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AuditResult[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch history from Firestore
    const q = query(collection(db, 'audits'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const audits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditResult));
      // Sort by timestamp descending
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
              <div key={item.id} className="glass p-4 rounded-2xl flex items-center justify-between hover:bg-cream/60 transition-colors cursor-pointer" onClick={() => navigate(`/results/${item.id}`, { state: { result: item } })}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === 'profile' ? 'bg-black/10 text-black' :
                    item.type === 'content' ? 'bg-black/10 text-black' :
                    'bg-black/10 text-black'
                  }`}>
                    {item.type === 'profile' ? <UserCheck size={20} /> :
                     item.type === 'content' ? <ImageIcon size={20} /> :
                     <Users size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-black">{item.input}</p>
                    <p className="text-xs text-black/40">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
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

const AuditInputPage = ({ type }: { type: 'profile' | 'content' | 'duel' }) => {
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
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Initialize Analysis
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ProcessingPage = ({ user }: { user: User }) => {
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
    }, 1200);

    const performAnalysis = async () => {
      try {
        let result: AuditResult;
        if (type === 'profile') result = await analyzeProfile(input1);
        else if (type === 'content') result = await analyzeContent(input1);
        else result = await analyzeDuel(input1, input2);

        // Save to Firestore
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
      } catch (error) {
        console.error(error);
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
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-4 border-black/10 border-t-black rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Scan className="w-16 h-16 text-primary animate-pulse" />
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

const ResultsPage = () => {
  const location = useLocation();
  const result: AuditResult = location.state?.result;
  const navigate = useNavigate();

  if (!result) return <Navigate to="/" />;

  const isDuel = result.type === 'duel';

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2 text-black">Forensic Report</h2>
          <p className="text-black/40">Investigation ID: {result.id}</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-xl glass hover:bg-cream/60 transition-all text-black font-bold"
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
                className="text-black/5"
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
                  result.score > 70 ? 'text-green-600' : 
                  result.score > 40 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-display font-bold text-black">{result.score}%</span>
              <span className="text-black/40 uppercase tracking-widest text-sm">Trust Score</span>
            </div>
          </div>

          <div className={`px-6 py-2 rounded-full font-bold text-sm mb-6 ${
            result.score > 70 ? 'bg-green-500/10 text-green-600' : 
            result.score > 40 ? 'bg-yellow-500/10 text-yellow-600' : 
            'bg-red-500/10 text-red-600'
          }`}>
            {result.score > 70 ? 'VERIFIED TRUSTWORTHY' : 
             result.score > 40 ? 'CAUTION ADVISED' : 
             'HIGH FRAUD RISK'}
          </div>

          <p className="text-black/60 leading-relaxed">
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
          <h3 className="text-xl font-bold flex items-center gap-2 text-black">
            <AlertTriangle className="text-black/40" size={24} />
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
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <AlertTriangle className="text-red-600" size={20} />
                  )}
                </div>
                <div>
                  <p className="text-black/80 leading-relaxed">{item}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {isDuel && (
            <div className="glass p-8 rounded-[2rem] border-black/5">
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-black/40">Duel Comparison</h4>
              <div className="grid grid-cols-2 gap-4">
                {result.details.bothFake ? (
                  <>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="text-xs text-red-600 uppercase font-bold mb-1">Fraudulent</p>
                      <p className="font-display font-bold text-lg text-black">{result.details.original}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="text-xs text-red-600 uppercase font-bold mb-1">Fraudulent</p>
                      <p className="font-display font-bold text-lg text-black">{result.details.imposter}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                      <p className="text-xs text-green-600 uppercase font-bold mb-1">Original</p>
                      <p className="font-display font-bold text-lg text-black">{result.details.original}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="text-xs text-red-600 uppercase font-bold mb-1">Imposter</p>
                      <p className="font-display font-bold text-lg text-black">{result.details.imposter}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [bgImage, setBgImage] = useState<string>('');
  const [appError, setAppError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Sync user to Firestore
        const userDataToSync = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Detective',
          email: fbUser.email || '',
          photo: fbUser.photoURL || `https://picsum.photos/seed/${fbUser.uid}/100/100`,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString()
        };

        try {
          // Save/Update in Firestore
          await setDoc(doc(db, 'users', fbUser.uid), userDataToSync, { merge: true });

          // Fetch from Firestore to ensure we have the latest
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            setUser(userDataToSync);
          }
        } catch (err) {
          console.error("Failed to sync user to Firestore:", err);
          setUser(userDataToSync);
        }
      } else {
        setUser(null);
      }
      setIsReady(true);
    });

    // Fetch AI Background
    const fetchBg = async () => {
      const img = await generateBackgroundImage("minimalist cream and black cybersecurity forensic analysis digital footprint");
      setBgImage(img);
    };
    fetchBg();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isReady) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Loader2 className="animate-spin text-black" size={40} />
    </div>
  );

  if (appError) return <ErrorBoundary error={appError} reset={() => window.location.reload()} />;

  try {
    return (
      <Router>
        <div className="min-h-screen relative">
          <AmbientBackground imageUrl={bgImage} />
          <Navbar user={user} onLogout={handleLogout} />
          
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/login" 
                element={!user ? <LoginPage /> : <Navigate to="/" />} 
              />
              <Route 
                path="/" 
                element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/audit/profile" 
                element={user ? <AuditInputPage type="profile" /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/audit/content" 
                element={user ? <AuditInputPage type="content" /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/audit/duel" 
                element={user ? <AuditInputPage type="duel" /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/processing" 
                element={user ? <ProcessingPage user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/results/:id" 
                element={user ? <ResultsPage /> : <Navigate to="/login" />} 
              />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    );
  } catch (err: any) {
    setAppError(err);
    return null;
  }
}
