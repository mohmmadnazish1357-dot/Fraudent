/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
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
import { 
  ClerkProvider, 
  SignIn, 
  SignUp, 
  UserButton, 
  useUser, 
  useAuth, 
  SignedIn, 
  SignedOut 
} from '@clerk/clerk-react';
import { analyzeProfile, analyzeContent, analyzeDuel, AuditResult, generateBackgroundImage } from './services/aiService';
import { 
  db, doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot
} from './firebase';

// Clerk Publishable Key
const CLERK_PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file.");
}

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

const Navbar = () => {
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
      <SignedIn>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/login" />
        </div>
      </SignedIn>
    </nav>
  );
};

// --- Pages ---

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center relative"
      >
        <div className="mb-10">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-black tracking-tight mb-2">Fraudent</h1>
          <p className="text-black/40 text-sm font-medium uppercase tracking-[0.2em]">Forensic Analysis Portal</p>
        </div>

        <div className="flex justify-center">
          <SignIn 
            routing="path" 
            path="/login" 
            signUpUrl="/signup"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "glass rounded-[2rem] border-black/5 shadow-2xl p-8",
                headerTitle: "text-black font-display font-bold",
                headerSubtitle: "text-black/40",
                socialButtonsBlockButton: "rounded-xl border-black/5 hover:bg-black/5",
                formButtonPrimary: "bg-black hover:bg-black/80 rounded-xl py-3",
                footerActionLink: "text-black hover:text-black/60 font-bold"
              }
            }}
          />
        </div>
      </motion.div>
      
      <p className="mt-8 text-[10px] text-black/20 font-bold uppercase tracking-[0.3em]">
        End-to-End Encrypted • AI-Powered Forensics
      </p>
    </div>
  );
};

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center relative"
      >
        <div className="mb-10">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-black tracking-tight mb-2">Fraudent</h1>
          <p className="text-black/40 text-sm font-medium uppercase tracking-[0.2em]">Forensic Analysis Portal</p>
        </div>

        <div className="flex justify-center">
          <SignUp 
            routing="path" 
            path="/signup" 
            signInUrl="/login"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "glass rounded-[2rem] border-black/5 shadow-2xl p-8",
                headerTitle: "text-black font-display font-bold",
                headerSubtitle: "text-black/40",
                socialButtonsBlockButton: "rounded-xl border-black/5 hover:bg-black/5",
                formButtonPrimary: "bg-black hover:bg-black/80 rounded-xl py-3",
                footerActionLink: "text-black hover:text-black/60 font-bold"
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [history, setHistory] = useState<AuditResult[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch history from Firestore
    const q = query(collection(db, 'audits'), where('uid', '==', user.id));
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

const ProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
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
          uid: user.id,
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
  const [bgImage, setBgImage] = useState<string>('');

  useEffect(() => {
    // Fetch AI Background
    const fetchBg = async () => {
      const img = await generateBackgroundImage("minimalist cream and black cybersecurity forensic analysis digital footprint");
      setBgImage(img);
    };
    fetchBg();
  }, []);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <Router>
        <div className="min-h-screen bg-cream font-sans text-black selection:bg-black selection:text-white overflow-x-hidden">
          <AmbientBackground imageUrl={bgImage} />
          <Navbar />
          
          <Routes>
            <Route path="/login/*" element={<LoginPage />} />
            <Route path="/signup/*" element={<SignUpPage />} />
            
            <Route path="/" element={
              <SignedIn>
                <Dashboard />
              </SignedIn>
            } />
            
            <Route path="/audit/:type" element={
              <SignedIn>
                <AuditInputWrapper />
              </SignedIn>
            } />
            
            <Route path="/processing" element={
              <SignedIn>
                <ProcessingPage />
              </SignedIn>
            } />
            
            <Route path="/results/:id" element={
              <SignedIn>
                <ResultsPage />
              </SignedIn>
            } />

            <Route path="*" element={
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            } />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

const AuditInputWrapper = () => {
  const { type } = useParams<{ type: string }>();
  if (type !== 'profile' && type !== 'content' && type !== 'duel') {
    return <Navigate to="/" />;
  }
  return <AuditInputPage type={type} />;
};
