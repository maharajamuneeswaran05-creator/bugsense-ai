/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bug,
  Terminal,
  Code2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Flame,
  Zap,
  Workflow,
  ArrowRight,
  HelpCircle,
  FileText,
  Download,
  Share2,
  Star,
  Shield,
  Lock,
  Server,
  Users,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Activity,
  History,
  Trash2,
  Loader2,
  UserPlus,
  LogIn,
  Mail,
  UserCheck,
  LogOut,
} from "lucide-react";
import { DebugRequest, DebugResponse } from "./types";
import { BUG_TEMPLATES } from "./data/templates";
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  PricingSection,
  FAQsSection,
  WebsiteFooter,
} from "./components/SaaSSections";
import { getAuth, getDb, handleFirestoreError, OperationType, signUpWithEmail, signInWithEmail, signInWithGoogle, signInAsGuest } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";



export default function App() {
  // Input fields
  const [bugReport, setBugReport] = useState("");
  const [logs, setLogs] = useState("");
  const [codeContext, setCodeContext] = useState("");

  const [user, setUser] = useState<any>({ isAnonymous: true }); // Mock user
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Email/Password Workspace Auth Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DebugResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"senior-dev" | "qa" | "sys-debug" | "test-cases" | "user-report">("senior-dev");
  const [copied, setCopied] = useState(false);
  const [copiedUserReport, setCopiedUserReport] = useState(false);

  // Re-run with extra context states
  const [extraContext, setExtraContext] = useState("");
  const [showReRunPanel, setShowReRunPanel] = useState(false);

  // Interactive user state for checklists & steps
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [checkedQA, setCheckedQA] = useState<Record<number, boolean>>({});

  // Dynamic values supporting a superb website/SaaS user experience
  const [viewMode, setViewMode] = useState<"website" | "sandbox">("website");
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(1);
  const [ratingInput, setRatingInput] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  // Cycle statuses during analysis for a superb terminal debugger feeling
  const statusPhrases = [
    "Receiving dump variables & vague descriptions...",
    "Scanning logs for stack-frame signatures...",
    "Injecting QA system inspector heuristics...",
    "Executing Senior Systems Architect token mappings...",
    "Unifying root causes & generating clean fix schemas...",
    "Synthesizing terminal diff codeblocks..."
  ];

  useEffect(() => {
    // Check if Gemini API key is configured
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setApiKeyConfigured(data.configured);
      })
      .catch(() => {
        setApiKeyConfigured(false);
      });
  }, []);

  // Sync Auth listener & saved diagnostics sessions
  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        const db = getDb();
        if (!db) return;
        setIsLoadingHistory(true);
        const q = query(
          collection(db, "diagnostics"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const sessions: any[] = [];
            snapshot.forEach((doc) => {
              sessions.push({ id: doc.id, ...doc.data() });
            });
            setSavedSessions(sessions);
            setIsLoadingHistory(false);
          },
          (error) => {
            console.error("Firestore loading error:", error);
            setIsLoadingHistory(false);
          }
        );
        return () => unsubscribeSnapshot();
      } else {
        setSavedSessions([]);
        setIsLoadingHistory(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const mapAuthError = (err: any): string => {
    const msg = err?.message || String(err);
    if (msg.includes("auth/admin-restricted-operation")) {
      return "Anonymous sign-in is not enabled in your Firebase project. Go to Firebase Console -> Authentication -> Sign-in method, edit 'Anonymous', and click 'Enable'.";
    }
    if (msg.includes("auth/operation-not-allowed")) {
      return "Email/Password sign-up is not allowed yet. Go to Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', choose 'Email/Password', enable it, and click 'Save'.";
    }
    if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
      return "Invalid email address or incorrect password. If you register for the first time, make sure to click 'Sign Up' tab first!";
    }
    if (msg.includes("auth/email-already-in-use")) {
      return "This email address is already in use by another workspace developer. Please log in instead or use another email.";
    }
    return msg;
  };

  const handleGuestSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInAsGuest();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(mapAuthError(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(mapAuthError(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      setAuthError("Email and password fields are required.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signUpWithEmail(email, password);
      // Clear inputs upon success
      setEmail("");
      setPassword("");
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(mapAuthError(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setAuthError("Email and password fields are required.");
      return;
    }
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithEmail(email, password);
      // Clear inputs upon success
      setEmail("");
      setPassword("");
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(mapAuthError(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const authInstance = getAuth();
      if (authInstance) {
        await signOut(authInstance);
      }
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  const loadSavedSession = (sess: any) => {
    setBugReport(sess.bug_report || "");
    setLogs(sess.logs || "");
    setCodeContext(sess.code_context || "");
    setExtraContext(sess.extra_context || "");
    
    if (sess.result) {
      setAnalysisResult(sess.result);
    } else {
      // Reconstructed fallback
      const mockResponse: DebugResponse = {
        title: sess.title || "Loaded Session",
        severity: (sess.severity as any) || "Medium",
        reproduction_steps: sess.reproduction_steps || ["Replay runtime telemetry logs."],
        root_cause: sess.root_cause || "Saved session data snapshot.",
        fix_suggestion: sess.fix_suggestion || "Apply debug patch suggested fix.",
        fix_code: sess.fix_code || "",
        affected_components: sess.subsystem ? [sess.subsystem] : ["General"],
        qa_checklist: [],
        confidence_score: "High",
        similar_patterns: [],
        risky_areas: [],
        prevention_practices: [],
        user_friendly_report: sess.user_friendly_report || "Brief overview diagnostic report.",
      };
      setAnalysisResult(mockResponse);
    }
    setActiveTab("senior-dev");
  };

  const deleteSavedSession = async (e: any, id: string) => {
    e.stopPropagation();
    // Firestore deleted, remove from local state
    setSavedSessions(prev => prev.filter(s => s.id !== id));
  };

  const loadTemplate = (id: string) => {
    const template = BUG_TEMPLATES.find((t) => t.id === id);
    if (template) {
      setBugReport(template.bug_report);
      setLogs(template.logs);
      setCodeContext(template.code_context);
      setErrorStatus(null);
    }
  };

  const handleClear = () => {
    setBugReport("");
    setLogs("");
    setCodeContext("");
    setAnalysisResult(null);
    setErrorStatus(null);
    setCheckedSteps({});
    setCheckedQA({});
  };

  const runAnalysis = async () => {
    if (!bugReport.trim()) {
      setErrorStatus("Please provide at least a Bug Report description.");
      return;
    }

    setIsAnalyzing(true);
    setErrorStatus(null);
    setAnalysisResult(null);
    setCheckedSteps({});
    setCheckedQA({});

    // Start cycling status text
    let phraseIndex = 0;
    setStatusText(statusPhrases[0]);
    const interval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % statusPhrases.length;
      setStatusText(statusPhrases[phraseIndex]);
    }, 1800);

    try {
      const response = await fetch("/api/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bug_report: bugReport,
          logs: logs,
          code_context: codeContext,
          extra_context: extraContext.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An error occurred during log analysis.");
      }

      setAnalysisResult(data);
      setActiveTab("senior-dev");

      // Save to Firestore if user is active
      const authInstance = getAuth();
      if (authInstance?.currentUser) {
        try {
          const dbInstance = getDb();
          if (!dbInstance) throw new Error("Database not initialized");
          await addDoc(collection(dbInstance, "diagnostics"), {
            title: data.title || "Custom Diagnosis",
            bug_report: bugReport,
            logs: logs,
            code_context: codeContext,
            extra_context: extraContext || "",
            severity: data.severity || "Medium",
            subsystem: data.affected_components?.[0] || "General",
            risk_assessment: data.risky_areas?.[0] || "",
            root_cause: data.root_cause || "",
            user_friendly_report: data.user_friendly_report || "",
            createdAt: serverTimestamp(),
            userId: authInstance.currentUser.uid,
            result: data,
          });
        } catch (dbErr) {
          console.error("Firestore automatic write error:", dbErr);
          handleFirestoreError(dbErr, OperationType.CREATE, "diagnostics");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Failed to communicate with BugSense translation core.");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyUserReport = () => {
    if (!analysisResult?.user_friendly_report) return;
    navigator.clipboard.writeText(analysisResult.user_friendly_report);
    setCopiedUserReport(true);
    setTimeout(() => setCopiedUserReport(false), 2000);
  };

  const downloadUserReport = () => {
    if (!analysisResult?.user_friendly_report) return;
    const element = document.createElement("a");
    const file = new Blob([analysisResult.user_friendly_report], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `BugSense_User_Report_${analysisResult.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleQA = (idx: number) => {
    setCheckedQA((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "high":
        return "bg-amber-550/20 text-amber-300 border-amber-500/40";
      case "medium":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "low":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-700/40";
    }
  };

  if (isAuthLoading) {
    return (
      <div className="relative min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col items-center justify-center p-0 m-0 overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
        <div className="mesh-bg pointer-events-none fixed inset-0" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-sky-500/25 animate-bounce">
            <Bug className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-widest font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Connecting BugSense Symbiosis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col items-center justify-center p-4 m-0 overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
        {/* Mesh background from Frosted Glass theme */}
        <div className="mesh-bg pointer-events-none fixed inset-0" />

        {/* Central Auth Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Logo element outside the card */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-2xl flex items-center justify-center font-bold mx-auto text-slate-950 shadow-xl shadow-sky-500/20 mb-3">
              <Bug className="h-7 w-7" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-sans">
                BugSense <span className="text-sky-400 font-normal">AI</span>
              </h1>
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-450 border border-sky-500/20 uppercase tracking-widest font-mono">
                v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Leading SaaS Diagnostic Workspace
            </p>
          </div>

          {/* Core Auth Panel with curved edges & glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="glass rounded-3xl p-7 flex flex-col gap-5 border border-white/10 shadow-2xl shadow-sky-500/5 relative overflow-hidden"
          >
            {/* Header / Intro */}
            <div className="space-y-1 text-center">
              <h2 className="text-md font-bold text-slate-100 font-sans">
                {isSignUp ? "Create Developer Instance" : "Access Developer Environment"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[340px] mx-auto">
                Sign in or register to enable continuous AI-powered diagnostics with persistent secure storage.
              </p>
            </div>

            {/* Switch Tabs (Login / Register) with smooth rounded pills */}
            <div className="grid grid-cols-2 bg-black/45 p-1 rounded-full border border-white/5 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  !isSignUp 
                    ? "bg-sky-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  isSignUp 
                    ? "bg-sky-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Email Credentials Fields */}
            <div className="space-y-2.5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="Developer Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl bg-black/40 border border-white/10 pl-10 pr-3 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="Security Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl bg-black/40 border border-white/10 pl-10 pr-3 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={isSignUp ? handleEmailSignUp : handleEmailSignIn}
                disabled={isSigningIn || !email || !password}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-450 text-slate-950 font-extrabold text-xs py-3.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-sky-500/10"
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSignUp ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{isSigningIn ? "Connecting..." : isSignUp ? "Build Dev Profile Instance" : "Unlock Developer Environment"}</span>
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-3 text-[9px] uppercase tracking-wider bg-[#020617] font-bold text-slate-500 font-mono">
                  Or Sign In With Google
                </span>
              </div>

              {/* Single full-width Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold py-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-white/5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            {authError && (
              <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl leading-relaxed break-words font-medium">
                Authentication error: {authError}
              </div>
            )}

            <div className="text-[9px] text-slate-500 leading-normal text-center pt-1 border-t border-white/5 font-sans">
              Email auth requires enabling the Email provider in your project console credentials portal.
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col p-0 m-0 overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      {/* Mesh background from Frosted Glass theme */}
      <div className="mesh-bg pointer-events-none fixed inset-0" />

      {/* Primary Content Wrapper */}
      <div className="relative z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* SaaS Sticky Header Bar */}
        <header id="saas-header" className="mb-6 sticky top-4 z-50 rounded-2xl glass p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-sky-500/5 transition-all">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setViewMode("website")} 
                className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-sky-500/25 cursor-pointer hover:bg-sky-400 transition-all"
              >
                <Bug className="h-5.5 w-5.5" />
              </div>
              <div className="cursor-pointer" onClick={() => setViewMode("website")}>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-extrabold tracking-tight text-white font-sans">
                    BugSense <span className="text-sky-400 font-normal">AI</span>
                  </h1>
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-450 border border-sky-500/20 uppercase tracking-widest font-mono">
                    v2.5
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Leading SaaS Diagnostic Workspace
                </p>
              </div>
            </div>

            {/* Mobile Menu Button toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <button 
              onClick={() => { setViewMode("website"); setTimeout(() => document.getElementById("saas-header")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              className={`hover:text-sky-400 cursor-pointer transition-colors ${viewMode === "website" ? "text-sky-400 font-bold" : "text-slate-350"}`}
            >
              Showcase
            </button>
            <button 
              onClick={() => { setViewMode("website"); setTimeout(() => document.getElementById("capabilities")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              className="hover:text-sky-404 text-slate-350 hover:text-sky-400 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => { setViewMode("website"); setTimeout(() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              className="hover:text-sky-404 text-slate-350 hover:text-sky-400 transition-colors cursor-pointer"
            >
              Workflow
            </button>
            <button 
              onClick={() => { setViewMode("website"); setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              className="hover:text-sky-404 text-slate-350 hover:text-sky-400 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => { setViewMode("website"); setTimeout(() => document.getElementById("faqs")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
              className="hover:text-sky-404 text-slate-350 hover:text-sky-400 transition-colors cursor-pointer"
            >
              FAQs
            </button>
            <button 
              onClick={() => setViewMode("sandbox")}
              className={`hover:text-sky-450 cursor-pointer transition-colors ${viewMode === "sandbox" ? "text-sky-400 font-bold" : "text-slate-350"}`}
            >
              Live Sandbox
            </button>
          </div>

          {/* Right Area Controls with Toggle buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center bg-black/45 border border-white/10 rounded-full p-1 select-none shadow-inner">
              <button
                onClick={() => setViewMode("website")}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "website"
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Website Live
              </button>
              <button
                onClick={() => setViewMode("sandbox")}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "sandbox"
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Workspace Only
              </button>
            </div>

            {/* Top Sign Up / Login controls & indicator */}
            <div className="flex flex-col items-center gap-2 border-l border-white/10 pl-3">
              {user ? (
                <div className="flex flex-col items-center gap-3">
                  <div 
                    title={user.isAnonymous ? "Guest Developer" : user.email}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-sm font-black text-slate-950 uppercase shadow-md shadow-sky-500/10 border border-sky-400/20"
                  >
                    {user.email ? user.email[0] : "G"}
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-start gap-0.5">
                    <span 
                      className="text-[10px] text-slate-200 font-extrabold max-w-[110px] truncate"
                      title={user.email || "Anonymous Developer"}
                    >
                      {user.isAnonymous ? "Guest Dev" : user.email}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold tracking-wider font-mono">WORKSPACE LIVE</span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    title="Exit / Logout Workspace"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-black font-semibold text-[10px] uppercase tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setAuthError(null);
                      setIsAuthModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setAuthError(null);
                      setIsAuthModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition-all active:scale-95 shadow-md shadow-sky-500/15 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Drops Menu Navigation if open */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full md:hidden border-t border-white/5 pt-3 mt-1 flex flex-col gap-2 text-xs font-semibold"
              >
                <button
                  onClick={() => { setViewMode("website"); setMobileMenuOpen(false); setTimeout(() => document.getElementById("saas-header")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="w-full py-2 text-left hover:text-sky-400"
                >
                  Showcase Site
                </button>
                <button
                  onClick={() => { setViewMode("website"); setMobileMenuOpen(false); setTimeout(() => document.getElementById("capabilities")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="w-full py-2 text-left hover:text-sky-400"
                >
                  Key Capabilities
                </button>
                <button
                  onClick={() => { setViewMode("website"); setMobileMenuOpen(false); setTimeout(() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="w-full py-2 text-left hover:text-sky-400"
                >
                  The Workflow
                </button>
                <button
                  onClick={() => { setViewMode("website"); setMobileMenuOpen(false); setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="w-full py-2 text-left hover:text-sky-400"
                >
                  SaaS Pricing
                </button>
                <button
                  onClick={() => { setViewMode("website"); setMobileMenuOpen(false); setTimeout(() => document.getElementById("faqs")?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="w-full py-2 text-left hover:text-sky-400"
                >
                  Audit FAQs
                </button>
                <button
                  onClick={() => { setViewMode("sandbox"); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-left text-sky-400 font-bold hover:text-sky-350"
                >
                  Live Debug Box
                </button>
                <button
                  onClick={() => { setViewMode("sandbox"); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-left text-indigo-300 font-bold hover:text-indigo-250"
                >
                  Switch: Isolated Workspace Mode
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Dynamic Auth Modal Overlay */}
        <AnimatePresence>
          {isAuthModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md rounded-2xl glass p-6 relative flex flex-col gap-5 shadow-2xl shadow-sky-500/10 border border-white/10"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 bg-sky-500/15 border border-sky-500/25 rounded-2xl flex items-center justify-center mx-auto text-sky-400 font-bold mb-1">
                    <Bug className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {isSignUp ? "Create Developer Account" : "Access Developer Workspace"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Access local session logging and diagnostic tools directly in your workspace.
                  </p>
                </div>

                {/* Single full-width Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold py-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-white/5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                {/* Separator */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <span className="relative px-3 text-[10px] uppercase tracking-wider bg-[#020617] font-bold text-slate-500">
                    Or Use Keypass Credentials
                  </span>
                </div>

                {/* Auth Mode Tabs & Credentials Form */}
                <div className="space-y-4">
                  {/* Internal tabs switcher */}
                  <div className="grid grid-cols-2 bg-black/45 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setAuthError(null);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        !isSignUp 
                          ? "bg-white/10 text-slate-100 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Workspace Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setAuthError(null);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        isSignUp 
                          ? "bg-white/10 text-slate-100 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Register Account
                    </button>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="Developer Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs rounded-xl bg-black/40 border border-white/10 pl-10 pr-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        placeholder="Security Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs rounded-xl bg-black/40 border border-white/10 pl-10 pr-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                      />
                    </div>
                  </div>

                  {/* Primary submit action button */}
                  <button
                    type="button"
                    onClick={isSignUp ? handleEmailSignUp : handleEmailSignIn}
                    disabled={isSigningIn || !email || !password}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-450 text-slate-950 font-extrabold text-xs py-2.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-sky-500/10"
                  >
                    {isSigningIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSignUp ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{isSigningIn ? "Authenticating..." : isSignUp ? "Build Dev Profile Instance" : "Load Identity Environment & Sync"}</span>
                  </button>
                </div>

                {authError && (
                  <div className="text-[11px] text-rose-450 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl leading-relaxed break-words font-medium">
                    Authentication error: {authError}
                  </div>
                )}
                
                <div className="text-[10px] text-slate-500 leading-normal text-center pt-1 border-t border-white/5 font-sans">
                  Email auth requires enabling the Email provider in your project console credentials portal.
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SaaS Feature / Landing Content if View Mode matches "website" */}
        {viewMode === "website" && (
          <div className="space-y-4">
            <HeroSection 
              onScrollToSandbox={() => setViewMode("sandbox")} 
              onToggleViewMode={() => setViewMode("sandbox")} 
            />
            
            <div id="capabilities">
              <FeaturesSection />
            </div>

            <div id="how-it-works">
              <HowItWorksSection />
            </div>

            <TestimonialsSection />

            <div id="pricing">
              <PricingSection onScrollToSandbox={() => setViewMode("sandbox")} />
            </div>

            <div id="faqs">
              <FAQsSection />
            </div>

            {/* Sandbox section banner separator */}
          </div>
        )}

        {/* Workspace Grid */}
        {viewMode === "sandbox" && (
          <main className="grid gap-6 lg:grid-cols-12 flex-grow items-start">
            
            {/* LEFT COLUMN: Controls & Presets (5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Firebase Authentication & Live Sync History Deck */}
            <section id="firebase-sync-section" className="glass rounded-2xl p-5 flex flex-col gap-4">
              <header className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Firebase Workspace Sync
                </span>
                {user ? (
                  <span className="text-[9px] font-black rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 font-mono border border-emerald-500/25">
                    ● CONNECTED
                  </span>
                ) : (
                  <span className="text-[9px] font-black rounded bg-white/5 px-1.5 py-0.5 text-slate-400 font-mono">
                    OFFLINE MODE
                  </span>
                )}
              </header>

              {!user ? (
                <div className="space-y-3.5">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans font-normal">
                    Sign in or create an account to enable <strong>durable cloud persistence</strong>! Your logs, reports, and AI diagnostic results will automatically sync to your secure developer workspace.
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleGuestSignIn}
                      disabled={isSigningIn}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold py-2.5 text-slate-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Guest Dev</span>
                    </button>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs py-2.5 hover:bg-sky-400 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Google Login</span>
                    </button>
                  </div>

                  <div className="border-t border-white/5 pt-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Or Email Workspace
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setAuthError(null);
                        }}
                        className="text-[10px] text-sky-400 hover:underline cursor-pointer font-medium"
                      >
                        {isSignUp ? "Switch to Log In" : "Switch to Register"}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs rounded-xl bg-black/40 border border-white/10 pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="password"
                          placeholder="Password (min 6 characters)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full text-xs rounded-xl bg-black/40 border border-white/10 pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={isSignUp ? handleEmailSignUp : handleEmailSignIn}
                      disabled={isSigningIn || !email || !password}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold py-2.5 text-slate-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSignUp ? <UserPlus className="w-3.5 h-3.5 text-sky-400" /> : <LogIn className="w-3.5 h-3.5 text-sky-400" />}
                      <span>{isSignUp ? "Register Account" : "Log In & Sync"}</span>
                    </button>
                  </div>

                  {authError && (
                    <div className="text-[11px] text-rose-450 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg leading-relaxed break-words">
                      Error: {authError}
                    </div>
                  )}

                  <div className="text-[9px] text-slate-500 leading-normal text-center pt-1 border-t border-white/5 font-sans">
                    Enable standard email provider in your Firebase project console to use credentials login.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active user credentials header */}
                  <div className="flex items-center justify-between bg-white/3 border border-white/5 p-3 rounded-xl">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">WORKSPACE PROVIDER</span>
                      <span className="text-xs font-extrabold text-slate-200 truncate mt-0.5" title={user.email || "Anonymous Developer"}>
                        {user.isAnonymous ? "Guest Developer" : user.email}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-[10px] text-rose-400 border border-rose-500/15 py-1.5 px-2.5 rounded-lg active:scale-95 transition-all cursor-pointer font-bold uppercase tracking-wider"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Exit</span>
                    </button>
                  </div>

                  {/* Saved Sessions list container */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-sky-400" /> Saved Debug Traces ({savedSessions.length})
                      </span>
                    </div>

                    {isLoadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500">
                        <svg className="h-5 w-5 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-[10px] font-mono tracking-wider">LOADING HISTORY...</span>
                      </div>
                    ) : savedSessions.length === 0 ? (
                      <div className="text-center py-5 rounded-xl border border-dashed border-white/5 bg-black/10">
                        <p className="text-[11px] text-slate-500">
                          Auto-saves automatically upon success.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                        {savedSessions.map((sess) => (
                          <div
                            key={sess.id}
                            onClick={() => loadSavedSession(sess)}
                            className="group flex items-start justify-between rounded-xl border border-white/5 bg-black/30 p-2.5 text-left transition-all hover:border-sky-500/40 hover:bg-white/5 cursor-pointer"
                          >
                            <div className="flex-grow min-w-0 mr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-450 transition-colors truncate block">
                                  {sess.title || "Custom Diagnostic"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={ `text-[9px] px-1 py-0.5 rounded font-mono uppercase font-black ${
                                  sess.severity?.toLowerCase() === "critical" ? "bg-rose-500/10 text-rose-400" :
                                  sess.severity?.toLowerCase() === "high" ? "bg-amber-500/10 text-amber-450" :
                                  "bg-sky-500/10 text-sky-400"
                                }`}>
                                  {sess.severity || "Medium"}
                                </span>
                                <span className="text-[9px] text-slate-500 truncate max-w-[80px]" title={sess.subsystem}>
                                  {sess.subsystem || "General"}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => deleteSavedSession(e, sess.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0 self-center"
                              title="Delete archived diagnostic session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
            
            {/* Run Presets Card */}
            <section id="presets-section" className="glass rounded-2xl p-5 flex flex-col gap-3">
              <header className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Run Presets Instantly
                </span>
                <span className="text-[10px] text-slate-500">Preset deck</span>
              </header>
              <p className="text-xs text-slate-400">
                Select one of our realistic buggy code templates to experience diagnostic decomposition instantly:
              </p>
              <div className="grid gap-2">
                {BUG_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl.id)}
                    className="group flex flex-col items-start rounded-xl border border-white/5 bg-black/20 p-3 text-left transition-all hover:border-sky-500/40 hover:bg-white/5"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                        {tpl.name}
                      </span>
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] text-sky-400 border border-sky-500/15 font-mono">
                        {tpl.badge}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                      {tpl.shortDescription}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Inputs Panel */}
            <section id="inputs-deck" className="glass rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Diagnostics Input Deck
                </h2>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-250"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              <div className="space-y-4">
                {/* Bug Report */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">01. Bug Report <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-500">Vague/Symptomatic text</span>
                  </div>
                  <textarea
                    rows={4}
                    value={bugReport}
                    onChange={(e) => setBugReport(e.target.value)}
                    placeholder="Describe the application misbehavior or copy-paste client problem report..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-sky-500/50 focus:bg-black/50"
                  />
                </div>

                {/* System Logs */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-sky-400" />
                      02. Execution Logs
                    </span>
                    <span className="text-[10px] text-slate-500">Stack traces/stdout</span>
                  </div>
                  <textarea
                    rows={3}
                    value={logs}
                    onChange={(e) => setLogs(e.target.value)}
                    placeholder="[INFO] upload started... [WARN] Transaction rolled back..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-emerald-400/90 placeholder-slate-600 outline-none transition-all focus:border-sky-500/50 focus:bg-black/50"
                  />
                </div>

                {/* Code Context */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-sky-400" />
                      03. Code Snippet
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Source payload</span>
                  </div>
                  <textarea
                    rows={4}
                    value={codeContext}
                    onChange={(e) => setCodeContext(e.target.value)}
                    placeholder="async function verifyUser() { ..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300 placeholder-slate-600 outline-none transition-all focus:border-sky-500/50 focus:bg-black/50"
                  />
                </div>

                {errorStatus && (
                  <div className="rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-450 border border-rose-500/20">
                    <div className="font-bold flex items-center gap-1.5 text-rose-400 mb-1">
                      <AlertTriangle className="h-4 w-4" /> Diagnostic Failure
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{errorStatus}</p>
                  </div>
                )}

                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-sky-500 text-slate-950 accent-glow shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="uppercase tracking-wider font-extrabold">Analyzing Signal Core...</span>
                    </div>
                  ) : (
                    <>
                      <Play className="h-4 w-4 text-slate-950 fill-slate-950" />
                      <span className="uppercase tracking-wider font-extrabold">🚀 Investigate Bug</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          <div className="lg:col-span-7 flex flex-col min-h-[600px] w-full">
            <AnimatePresence mode="wait">
              {/* STATE 1: Empty landing report */}
              {!isAnalyzing && !analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex-1 flex flex-col justify-center items-center glass p-8 rounded-3xl text-center min-h-[600px] border border-white/10"
                >
                  <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20 mb-4 animate-pulse">
                    <Cpu className="w-8 h-8 text-sky-450" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Intelligence Feed Idle</h3>
                  <p className="mx-auto mt-2 max-w-sm text-xs text-slate-400 leading-relaxed">
                    Awaiting crash telemetry or diagnostics description. Load one of the presets or complete the input deck form on the left pane.
                  </p>
                  
                  {/* Process cards */}
                  <div className="mt-8 grid gap-4 max-w-lg w-full text-left sm:grid-cols-3">
                    <div className="glass-dark p-4 rounded-xl">
                      <span className="block font-bold text-sky-400 text-[10px] tracking-wide uppercase mb-1">Reproduction</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Extracts step-by-step procedures to replicate the failure state on QA rigs.
                      </p>
                    </div>
                    <div className="glass-dark p-4 rounded-xl">
                      <span className="block font-bold text-sky-400 text-[10px] tracking-wide uppercase mb-1">Root Cause</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Exposes variable mismatches and code races from a senior developer viewpoint.
                      </p>
                    </div>
                    <div className="glass-dark p-4 rounded-xl">
                      <span className="block font-bold text-sky-400 text-[10px] tracking-wide uppercase mb-1">Fix Suggestion</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Renders pristine diff overlays and target code replacements.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STATE 2: Loading feedback */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center glass rounded-3xl p-8 min-h-[600px] border border-white/10"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-sky-400" />
                  </div>

                  <span className="text-[10px] font-bold text-sky-400 font-mono tracking-widest uppercase">
                    [Diagnostic Pipeline Working]
                  </span>
                  
                  <h3 className="mt-4 text-sm font-semibold text-slate-200">
                    {statusText}
                  </h3>

                  <p className="mt-2 max-w-xs text-xs text-slate-500 text-center leading-relaxed">
                    Analyzing raw symptoms against structural codebase graphs using Gemini.
                  </p>
                </motion.div>
              )}

              {/* STATE 3: Report Content */}
              {!isAnalyzing && analysisResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex-1 flex flex-col glass rounded-3xl p-6 md:p-8 relative overflow-hidden h-full border border-white/10"
                >
                  {/* Ambient accent bubble background inside output frame */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Analysis Report Title Header */}
                  <div className="flex items-start gap-4 mb-6 relative z-10 w-full">
                    <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 shrink-0">
                      <Bug className="w-6 h-6 text-sky-400" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] tracking-widest font-extrabold text-sky-400 uppercase">Analysis Report</span>
                        <span className="text-[9px] text-slate-500 font-mono">•</span>
                        
                        {/* 📊 Confidence score badge */}
                        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-mono border border-emerald-500/20">
                          <span className="text-emerald-400">📊</span>
                          <span className="font-bold tracking-wider">CONFIDENCE: {analysisResult.confidence_score?.toUpperCase() || "HIGH"}</span>
                        </div>

                        {/* 🧠 "Similar bug found" badge */}
                        {analysisResult.similar_patterns && analysisResult.similar_patterns.length > 0 && (
                          <>
                            <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">•</span>
                            <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded text-[9px] font-mono border border-indigo-500/20">
                              <span>🧠</span>
                              <span className="font-bold tracking-wider">SIMILAR BUG FOUND: {analysisResult.similar_patterns[0]}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight mt-1.5 break-words">
                        {analysisResult.title}
                      </h2>
                    </div>
                  </div>

                  {/* Impact & Subsystems Badge Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white/3 border border-white/5 rounded-2xl px-4 py-3 mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium font-sans">Severity Impact:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(analysisResult.severity)}`}>
                        {analysisResult.severity}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.affected_components.map((comp, idx) => (
                        <div key={idx} className="bg-black/40 border border-white/5 rounded px-2 py-0.5 text-[9px] text-slate-400 font-mono">
                          {comp}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Switch Tabs Area */}
                  <div className="flex gap-2 border-b border-white/5 pb-4 mb-5">
                    <button
                      onClick={() => setActiveTab("senior-dev")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === "senior-dev"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                      Senior Developer
                    </button>
                    <button
                      onClick={() => setActiveTab("qa")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === "qa"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      QA Intelligence
                    </button>
                    <button
                      onClick={() => setActiveTab("sys-debug")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === "sys-debug"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Terminal className="h-4 w-4" />
                      Analyst Checkups
                    </button>
                    <button
                      onClick={() => setActiveTab("test-cases")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === "test-cases"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Code2 className="h-4 w-4" />
                      Test Suites
                    </button>
                    <button
                      onClick={() => setActiveTab("user-report")}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === "user-report"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      User & PM Report
                    </button>
                  </div>

                  {/* Tab Scroll Content Frame */}
                  <div className="flex-grow space-y-6 overflow-y-auto max-h-[500px] pr-2">
                    <AnimatePresence mode="wait">
                      {/* SUBTAB 1: Senior Developer view */}
                      {activeTab === "senior-dev" && (
                        <motion.div
                          key="senior-dev-tab"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          className="space-y-6"
                        >
                          {/* Interactive Flow Diagram */}
                          {analysisResult.flow_diagram && (
                            <div className="space-y-3">
                              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                                <Workflow className="h-4 w-4 text-sky-400" /> Operational System Flow Diagram
                              </h3>
                              <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl space-y-4">
                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative py-2">
                                  {analysisResult.flow_diagram.steps.map((step, idx) => {
                                    const isFailureStep = step.includes("❌") || step.toLowerCase().includes("fail") || step.toLowerCase().includes("error") || idx === (analysisResult.flow_diagram?.steps?.length || 1) - 1;
                                    return (
                                      <div key={idx} className="flex-1 flex flex-col md:flex-row items-center gap-2">
                                        <div className={`w-full p-3.5 rounded-xl border text-center transition-all ${
                                          isFailureStep 
                                            ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(239,68,68,0.1)] text-rose-200" 
                                            : "bg-black/40 border-white/5 hover:border-sky-500/20 text-slate-300"
                                        }`}>
                                          <div className="text-[9px] uppercase tracking-wider font-semibold font-mono text-slate-500 mb-1 flex items-center justify-center gap-1">
                                            <span>Step {idx + 1}</span>
                                            {isFailureStep && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                                          </div>
                                          <p className="text-[11px] leading-snug font-medium break-words">{step}</p>
                                        </div>
                                        
                                        {idx < (analysisResult.flow_diagram?.steps?.length || 1) - 1 && (
                                          <div className="flex justify-center items-center py-1 md:py-0 shrink-0">
                                            <ArrowRight className="h-4 w-4 text-slate-600 rotate-90 md:rotate-0 shrink-0" />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl px-4 py-3 flex gap-2.5 items-start text-xs text-rose-300">
                                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">Failure Point Highlight</span>
                                    <p className="leading-relaxed text-[11px] text-slate-300">{analysisResult.flow_diagram.failure_point}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Mentoring Walkthrough: Senior to Junior */}
                          {analysisResult.senior_explanation && (
                            <div className="space-y-2">
                              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-sky-450" /> Senior Architect Mentor Walkthrough
                              </h3>
                              <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/5 border border-sky-500/20 p-5 rounded-2xl relative overflow-hidden">
                                <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                                  <Cpu className="h-16 w-16 text-sky-400" />
                                </div>
                                <div className="flex gap-4 items-start relative z-10">
                                  <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0 font-bold text-sky-400 text-sm">
                                    SR
                                  </div>
                                  <div className="space-y-2">
                                    <span className="bg-sky-500/20 text-sky-300 text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded font-mono border border-sky-500/10 active-status">
                                      Mentoring Conversation (No Jargon Slop)
                                    </span>
                                    <p className="text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap italic">
                                      "{analysisResult.senior_explanation}"
                                    </p>
                                    <p className="text-[10px] text-slate-550 font-medium">
                                      💡 Practical note: Shifting your mental model towards this pattern keeps our codebase clean and robust!
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Root Cause Card */}
                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Technical Root Cause Analysis
                            </h3>
                            <div className="bg-sky-500/5 border border-sky-500/20 p-5 rounded-2xl">
                              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                                {analysisResult.root_cause}
                              </p>
                            </div>
                          </div>

                          {/* Risky Areas Alert Callouts */}
                          {analysisResult.risky_areas && analysisResult.risky_areas.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b]" /> Highlighted Risky Code Areas
                              </h3>
                              <div className="space-y-2">
                                {analysisResult.risky_areas.map((risk, idx) => (
                                  <div key={idx} className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                                    <div className="bg-[#f59e0b]/20 p-1 rounded text-[#f59e0b] mt-0.5 shrink-0">
                                      <AlertTriangle className="h-3 w-3" />
                                    </div>
                                    <p className="leading-relaxed">{risk}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Fix Suggestion card */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Fix Suggestion
                              </h3>
                              <button
                                onClick={() => copyToClipboard(analysisResult.fix_code)}
                                className="flex items-center gap-1.5 rounded bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/10"
                              >
                                {copied ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400 uppercase">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 text-slate-400" />
                                    <span className="uppercase">Copy Code Snippet</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-xs text-slate-350 leading-relaxed font-normal">
                              {analysisResult.fix_suggestion}
                            </div>

                            <div className="rounded-2xl bg-slate-950 border border-white/5 shadow-inner overflow-hidden relative">
                              <div className="flex items-center justify-between bg-white/3 px-3 py-1.5 text-[10px] text-slate-400 font-mono border-b border-white/5">
                                <span className="tracking-widest uppercase text-[9px] font-bold text-sky-500">Core Diff Solution</span>
                                <span className="rounded bg-sky-500/10 px-1 text-[9px] text-sky-400 uppercase font-mono tracking-widest">
                                  diff comparison
                                </span>
                              </div>
                              <pre className="p-4 font-mono text-[11px] text-sky-300/90 overflow-x-auto whitespace-pre leading-normal scrollbar-thin">
                                {analysisResult.fix_code}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* SUBTAB 2: QA Engineer reproduction checklist */}
                      {activeTab === "qa" && (
                        <motion.div
                          key="qa-tab"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          className="space-y-6"
                        >
                          {/* Steps with indicators */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Reproduction Steps
                            </h3>
                            <p className="text-[11px] text-slate-400 italic">
                              Interactive trace Checklist. Interact with each step below during failure state replication cycles:
                            </p>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {analysisResult.reproduction_steps.map((step, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => toggleStep(idx)}
                                  className={`glass-dark p-4 rounded-xl text-left transition-all relative overflow-hidden ${
                                    checkedSteps[idx]
                                      ? "border-sky-500/40 bg-sky-500/10 text-sky-100"
                                      : "border-white/5 hover:border-white/10 text-slate-300"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <span className="font-bold text-white text-xs block mb-1">Step {idx + 1}</span>
                                    {checkedSteps[idx] ? (
                                      <CheckSquare className="h-4 w-4 text-sky-400 shrink-0" />
                                    ) : (
                                      <Square className="h-4 w-4 text-slate-600 shrink-0" />
                                    )}
                                  </div>
                                  <p className={`text-[11px] leading-relaxed mt-1 ${checkedSteps[idx] ? "line-through text-slate-450" : ""}`}>
                                    {step}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Verification checklist tests */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> QA Verification Test Checklist
                            </h3>
                            <p className="text-[11px] text-slate-400 italic">
                              Checkmarks required to release this debugging patch to staging:
                            </p>

                            <div className="space-y-2">
                              {analysisResult.qa_checklist.map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => toggleQA(idx)}
                                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                                    checkedQA[idx]
                                      ? "border-emerald-500/30 bg-emerald-500/10 text-slate-300"
                                      : "border-white/5 bg-black/20 hover:bg-black/35 text-slate-350"
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {checkedQA[idx] ? (
                                      <div className="rounded bg-sky-500/20 p-0.5 border border-sky-500/35">
                                        <Check className="h-3 w-3 text-sky-400" />
                                      </div>
                                    ) : (
                                      <div className="rounded border border-slate-705 h-4.5 w-4.5" />
                                    )}
                                  </div>
                                  <div>
                                    <span className={checkedQA[idx] ? "line-through text-slate-450" : ""}>
                                      {item}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* SUBTAB 3: System checking info */}
                      {activeTab === "sys-debug" && (
                        <motion.div
                          key="sys-debug-tab"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          className="space-y-5"
                        >
                          <div className="glass-dark p-5 rounded-2xl space-y-3 text-slate-300 leading-relaxed">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                              <Info className="h-4 w-4" /> Advanced System Diagnostics
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              BugSense heuristics engine continuously matches file paths, error codes, and symptoms against classic design anti-patterns.
                            </p>

                            {analysisResult.classification ? (
                              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5 font-mono">
                                  <ShieldCheck className="h-4 w-4 text-sky-400" /> Enterprise Severity & Production Impact
                                </span>
                                
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                  {/* Severity block */}
                                  <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Severity</span>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border uppercase tracking-wider ${
                                      analysisResult.classification.severity?.toLowerCase() === "critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
                                      analysisResult.classification.severity?.toLowerCase() === "high" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                                      analysisResult.classification.severity?.toLowerCase() === "medium" ? "bg-sky-500/10 text-sky-400 border-sky-500/30" :
                                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    }`}>
                                      {analysisResult.classification.severity}
                                    </span>
                                  </div>

                                  {/* Priority block */}
                                  <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Priority Tier</span>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border uppercase tracking-widest ${
                                      analysisResult.classification.priority?.toLowerCase() === "p1" ? "bg-rose-500/25 text-rose-400 border-rose-500/40" :
                                      analysisResult.classification.priority?.toLowerCase() === "p2" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                                      "bg-sky-500/20 text-sky-300 border-sky-500/30"
                                    }`}>
                                      {analysisResult.classification.priority}
                                    </span>
                                  </div>

                                  {/* Target Component Subsystems */}
                                  <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Subsystems Affected</span>
                                    <span className="inline-block mt-1 font-mono text-xs font-bold text-slate-100">
                                      {analysisResult.affected_components.length} Modules Identified
                                    </span>
                                  </div>

                                  {/* Confidence Level */}
                                  <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Diagnostic Confidence</span>
                                    <span className="inline-block mt-1 font-mono text-xs font-bold text-emerald-400">
                                      {analysisResult.confidence_score || "High"} Confidence
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-black/35 border border-white/5 rounded-xl p-3.5 space-y-2">
                                  <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider block font-mono">User/Feature Impact Scope</span>
                                  <p className="text-xs text-slate-350 leading-relaxed font-sans font-normal">
                                    {analysisResult.classification.impact}
                                  </p>
                                </div>

                                <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 italic text-slate-400 text-xs leading-relaxed">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono not-italic mb-1">Classification Reason / Deep Rationale</span>
                                  "{analysisResult.classification.reason}"
                                </div>
                              </div>
                            ) : (
                              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                                <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Severity Classification</span>
                                  <div className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-sky-450 animate-pulse border border-sky-400/30" />
                                    {analysisResult.severity}
                                  </div>
                                  <p className="mt-1 text-[10px] text-slate-400 leading-normal">
                                    Recommended priority tier within your JIRA or Linear ticket.
                                  </p>
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Component Scope Area</span>
                                  <div className="text-base font-bold text-white mt-1.5">
                                    {analysisResult.affected_components.length} subsystems targeted
                                  </div>
                                  <p className="mt-1 text-[10px] text-slate-400 leading-normal">
                                    Number of specific source file modules or telemetry sections needing code replacement.
                                  </p>
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Diagnostic Confidence</span>
                                  <div className={`text-base font-bold mt-1.5 flex items-center gap-2 ${
                                    analysisResult.confidence_score?.toLowerCase() === "high" ? "text-emerald-400" :
                                    analysisResult.confidence_score?.toLowerCase() === "medium" ? "text-amber-400" : "text-rose-400"
                                  }`}>
                                    <ShieldCheck className="h-4 w-4" />
                                    {analysisResult.confidence_score || "High"}
                                  </div>
                                  <p className="mt-1 text-[10px] text-slate-400 leading-normal">
                                    Statistical rating for logic accuracy from the heuristics engine.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Similar Patterns Detected Section */}
                          {analysisResult.similar_patterns && analysisResult.similar_patterns.length > 0 && (
                            <div className="glass-dark p-5 rounded-2xl space-y-3 text-slate-350">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                                <Bug className="h-4 w-4 text-sky-400" /> Similar Pattern Match Diagnosed
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                Exposing matching failure profiles or software paradigms from our master database of recurring bugs:
                              </p>
                              <div className="space-y-2 pt-1">
                                {analysisResult.similar_patterns.map((pat, idx) => (
                                  <div key={idx} className="bg-black/30 border border-white/5 p-3 rounded-lg flex gap-2.5 items-start text-xs text-slate-300">
                                    <Layers className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                                    <span>{pat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prevention Best Practices */}
                          {analysisResult.prevention_practices && analysisResult.prevention_practices.length > 0 && (
                            <div className="glass-dark p-5 rounded-2xl space-y-3 text-slate-350">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Proactive Prevention Guidelines
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                Build defensive software barriers. Implement these long-term preventative design practices immediately to eliminate regressions:
                              </p>
                              <div className="space-y-2 pt-1">
                                {analysisResult.prevention_practices.map((practice, idx) => (
                                  <div key={idx} className="bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl flex gap-3 items-start text-xs text-slate-300">
                                    <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                                      {idx + 1}
                                    </div>
                                    <p className="leading-relaxed">{practice}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="rounded-2xl border border-sky-500/10 bg-sky-500/5 p-5">
                            <div className="flex gap-3 items-start">
                              <Sparkles className="h-5 w-5 shrink-0 text-sky-400" />
                              <div>
                                <h5 className="font-bold text-slate-100 text-xs">Senior Architect Guidance</h5>
                                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                                  Patching logical fallacies before they reach production servers reduces continuous refactoring cycles. Ensure to test the state changes with null arguments prior to commit sequences.
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* SUBTAB 4: Test Case Generator output */}
                      {activeTab === "test-cases" && (
                        <motion.div
                          key="test-cases-tab"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          className="space-y-6"
                        >
                          {/* Unit Test Code */}
                          {analysisResult.test_generator?.unit_test && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Runnable Unit Test Case
                                </h3>
                                <button
                                  onClick={() => copyToClipboard(analysisResult.test_generator?.unit_test || "")}
                                  className="flex items-center gap-1.5 rounded bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/10"
                                >
                                  {copied ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span className="text-emerald-400 uppercase">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 text-slate-400" />
                                      <span className="uppercase">Copy Code Suite</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="rounded-2xl bg-slate-950 border border-white/5 shadow-inner overflow-hidden relative">
                                <div className="flex items-center justify-between bg-white/3 px-3 py-1.5 text-[10px] text-slate-400 font-mono border-b border-white/5">
                                  <span className="tracking-widest uppercase text-[9px] font-bold text-sky-500">Unit Test Framework Boilerplate</span>
                                  <span className="rounded bg-sky-500/10 px-1 text-[9px] text-sky-400 uppercase font-mono tracking-widest font-bold">
                                    Jest / PyTest
                                  </span>
                                </div>
                                <pre className="p-4 font-mono text-[11px] text-sky-300/90 overflow-x-auto whitespace-pre leading-normal scrollbar-thin max-h-[250px]">
                                  {analysisResult.test_generator.unit_test}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Integration Test Scenario */}
                          {analysisResult.test_generator?.integration_test && (
                            <div className="space-y-2">
                              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Integration Test Scenario
                              </h3>
                              <div className="bg-sky-500/5 border border-sky-500/20 p-5 rounded-2xl">
                                <p className="text-xs text-slate-300 transform-none leading-relaxed font-normal whitespace-pre-wrap">
                                  {analysisResult.test_generator.integration_test}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Edge Cases List checklist */}
                          {analysisResult.test_generator?.edge_cases && analysisResult.test_generator.edge_cases.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Diagnostic Edge Cases Verification
                              </h3>
                              <p className="text-[11px] text-slate-400 italic font-sans font-normal">
                                Check off individual boundary conditions to ensure your code patches resist secondary side-effects or regressions:
                              </p>

                              <div className="space-y-2">
                                {analysisResult.test_generator.edge_cases.map((edgeCase, idx) => {
                                  const keyIdx = 100 + idx;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => toggleQA(keyIdx)}
                                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                                        checkedQA[keyIdx]
                                          ? "border-emerald-500/30 bg-emerald-500/10 text-slate-300"
                                          : "border-white/5 bg-black/20 hover:bg-black/35 text-slate-350"
                                      }`}
                                    >
                                      <div className="mt-0.5 shrink-0">
                                        {checkedQA[keyIdx] ? (
                                          <div className="rounded bg-sky-500/20 p-0.5 border border-sky-500/35">
                                            <Check className="h-3 w-3 text-sky-400" />
                                          </div>
                                        ) : (
                                          <div className="rounded border border-slate-700 h-4.5 w-4.5" />
                                        )}
                                      </div>
                                      <div>
                                        <span className={checkedQA[keyIdx] ? "line-through text-slate-500 font-sans font-normal" : "font-sans font-normal text-slate-300"}>
                                          {edgeCase}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* SUBTAB 5: User & PM Readable Report Section */}
                      {activeTab === "user-report" && (
                        <motion.div
                          key="user-report-tab"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          className="space-y-6"
                        >
                          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5 font-mono mb-1">
                                  <FileText className="h-4 w-4 text-sky-400" /> Human-Readable Bug Brief
                                </span>
                                <h3 className="text-sm font-bold text-slate-100">Plain-English & Stakeholder Report</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={copyUserReport}
                                  className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                                  title="Copy clean formatted report to clipboard"
                                >
                                  {copiedUserReport ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                                      <span>Copy Brief</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={downloadUserReport}
                                  className="flex items-center gap-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 text-[11px] font-bold text-sky-400 hover:bg-sky-500/20 active:scale-95 transition-all cursor-pointer"
                                  title="Download plain .txt report for archive"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download .TXT</span>
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed font-sans font-normal">
                              The report below translates deep logs and stack-frames into logical, empathetic explanations. Use this to update support tickets, slack client channels, or product backlogs directly.
                            </p>

                            <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">
                                {analysisResult.user_friendly_report || "No stakeholder report generated yet."}
                              </div>
                            </div>

                            {/* Beautiful visual note */}
                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex gap-3 items-start">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-bold text-emerald-450 text-xs">Customer Service Readiness</h5>
                                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                                  This brief follows stakeholder communication best-practices. It excludes intimidating syntax lines or pointer exceptions, focusing strictly on functional progress, user mitigation workarounds, and team assurance.
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Collapsible Re-run with more context input deck */}
                  <AnimatePresence>
                    {showReRunPanel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-white/5 mt-4 pt-4 relative z-10 w-full"
                      >
                        <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1.5">
                              <RotateCcw className="h-3.5 w-3.5" /> Refine Diagnosis Context
                            </span>
                            <span className="text-[9px] text-slate-500 italic">Adds custom telemetry, variable values, or dependencies</span>
                          </div>

                          <textarea
                            rows={3}
                            value={extraContext}
                            onChange={(e) => setExtraContext(e.target.value)}
                            placeholder="Add secondary context (e.g., node.js v20, state properties: user is null on refresh, database connection parameters)..."
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-sky-500/50"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setExtraContext("");
                                setShowReRunPanel(false);
                              }}
                              className="px-4 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-white/10"
                            >
                              Reset Context
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                runAnalysis();
                                setShowReRunPanel(false);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider hover:bg-sky-400"
                            >
                              Run Analysis Refinement
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* BOTTOM ACTIONS BAR */}
                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center relative z-10 w-full">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
                      <span>CONFIDENCE SCORE:</span>
                      <span className={`font-bold ${
                        analysisResult.confidence_score?.toLowerCase() === "high" ? "text-emerald-400" :
                        analysisResult.confidence_score?.toLowerCase() === "medium" ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {analysisResult.confidence_score || "HIGH"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setShowReRunPanel(!showReRunPanel)}
                        className={`flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          showReRunPanel 
                            ? "bg-sky-500/20 text-sky-350 border-sky-500/40"
                            : "text-slate-300 border-white/10 hover:bg-white/5"
                        }`}
                      >
                        <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                        🔁 Re-run with context
                      </button>
                      <button
                        onClick={() => copyToClipboard(analysisResult.root_cause + "\n" + (analysisResult.risky_areas?.join("\n") || "") + "\n" + analysisResult.fix_suggestion)}
                        className="px-4 py-2 rounded-xl text-[10px] font-bold text-slate-300 border border-white/10 uppercase tracking-wider hover:bg-white/5"
                      >
                        Copy Analyst Report
                      </button>
                      <button
                        onClick={() => copyToClipboard(analysisResult.fix_code)}
                        className="px-4 py-2 rounded-xl text-[10px] font-bold bg-sky-500 text-slate-950 accent-glow shadow-sky-500/20 uppercase tracking-wider hover:bg-sky-400"
                      >
                        Apply Code Patch
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      )}
      </div>

      {viewMode === "website" ? (
        <WebsiteFooter />
      ) : (
        /* Isolated Compact Footer Bar with glass border */
        <footer className="relative z-10 h-12 px-8 glass border-t border-white/5 flex items-center justify-between mt-12">
          <div className="flex gap-4 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            <span>Session Protocol: <span className="text-sky-400">DEBUG_AI_v25</span></span>
            <span className="hidden sm:inline">Engine: <span className="text-slate-300 font-medium text-slate-400">Gemini 3.5 Core</span></span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-2 uppercase tracking-wider font-mono">
            <span className="animate-pulse w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span> Monitoring Thread Health
          </div>
        </footer>
      )}
    </div>
  );
}
