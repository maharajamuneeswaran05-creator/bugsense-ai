import { useState } from "react";
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
  Flame,
  Zap,
  Workflow,
  ArrowRight,
  HelpCircle,
  FileText,
  Star,
  Shield,
  Lock,
  Server,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Activity,
  ExternalLink,
} from "lucide-react";

// --- HERO SECTION ---
interface HeroProps {
  onScrollToSandbox: () => void;
  onToggleViewMode: () => void;
}

export function HeroSection({ onScrollToSandbox, onToggleViewMode }: HeroProps) {
  return (
    <section className="relative py-12 md:py-20 text-center flex flex-col items-center">
      {/* Decorative gradient overlay behind hero */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Glow Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-450 uppercase tracking-widest mb-6"
      >
        <Sparkles className="h-3.5 w-3.5 text-sky-400" />
        <span>Introducing BugSense AI v2.5</span>
      </motion.div>

      {/* Main Punchy SaaS Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.1] mb-6 font-sans"
      >
        Stop interpreting redundant <span className="text-sky-400 bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent underline decoration-sky-500/30">stack traces</span>. Start writing fixes.
      </motion.h1>

      {/* Hero Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed mb-10"
      >
        Deploy BugSense AI to instantly map stack dumps, telemetry, and dry code fragments into clean, actionable Senior Lead blueprints, automated QA reproduction checklists, and client-ready summaries.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
      >
        <button
          onClick={onScrollToSandbox}
          className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-bold bg-sky-500 text-slate-950 uppercase tracking-wider hover:bg-sky-400 active:scale-95 transition-all cursor-pointer accent-glow inline-flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4 fill-slate-950 stroke-none" />
          <span>Try Diagnostics Sandbox</span>
        </button>
        <button
          onClick={onToggleViewMode}
          className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-350 uppercase tracking-wider active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Terminal className="h-4 w-4" />
          <span>Distraction-Free Workspace</span>
        </button>
      </motion.div>

      {/* Stats Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl border border-white/5 bg-black/20 p-5 rounded-2xl glass"
      >
        <div className="p-4 text-center">
          <span className="block text-2xl font-extrabold text-white">94.8%</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Diagnostic Accuracy</span>
        </div>
        <div className="p-4 text-center border-l border-white/5">
          <span className="block text-2xl font-extrabold text-sky-400">7.2x</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Shorter MTTR</span>
        </div>
        <div className="p-4 text-center border-l border-white/5">
          <span className="block text-2xl font-extrabold text-white">12 sec</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Synthesis Time</span>
        </div>
        <div className="p-4 text-center border-l border-white/5">
          <span className="block text-2xl font-extrabold text-sky-400">90k+</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Active Dev Teams</span>
        </div>
      </motion.div>
    </section>
  );
}

// --- BENTO FEATURE MATRIX ---
export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: <Cpu className="w-5 h-5 text-sky-450" />,
      title: "Senior-Lead AI Synthesizer",
      description: "Bypasses technical slop. Restructures dense crash dumps, line trace logs, and variable registers directly into intuitive, mentoring-level architectural summaries.",
      badge: "Gemini Core"
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      title: "Interactive QA Tracing",
      description: "Generates checkable steps of how to reproduce bugs with exact boundary states. Enables QA units to tick things off as they verify patches on sandbox rigs.",
      badge: "Deterministic"
    },
    {
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      title: "Unit & Integration Test Suites",
      description: "Creates runnable, complete test script suites (Jest, JUnit, or PyTest) targeting the problematic module. Exposes edge cases to secure your release branch.",
      badge: "Exportable"
    },
    {
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      title: "Executive Jargon-Free Briefs",
      description: "Automatically compiles structured, empathetic summaries designed directly for PMs, service reps, and client notifications. Excludes confusing compiler symbols.",
      badge: "Polished"
    },
    {
      icon: <Workflow className="w-5 h-5 text-rose-400" />,
      title: "Sequential Flow Mapping",
      description: "Slices nested stack call stacks into distinct timeline steps, explicitly calling out the visual breakpoint block so you know exactly where memory dereferenced.",
      badge: "Visual"
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
      title: "Defensive Code Guardrails",
      description: "Scans the immediate patch vicinity for side-effects, resource cycles, and memory leaks. Suggests five-star prevention guidelines for staging environments.",
      badge: "Security"
    }
  ];

  return (
    <section className="py-16 border-t border-white/5 relative">
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-12">
        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest font-mono">Core Capability Matrix</span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">Why Build with BugSense AI?</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-2 leading-relaxed">
          Unlock standard senior insights across your diagnostics pipeline. Built to bridge developer diagnostics, QA telemetry, and technical stakeholders.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feat, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`glass p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              hoveredIndex === idx ? "border-sky-500/40 bg-white/5 shadow-[0_0_20px_rgba(56,189,248,0.1)]" : "border-white/5 bg-black/15"
            }`}
          >
            {/* Ambient subtle glow */}
            <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all duration-300 ${
              hoveredIndex === idx ? "bg-sky-500/10" : "bg-transparent"
            }`} />

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl shrink-0">
                {feat.icon}
              </div>
              <span className="text-[9px] uppercase font-extrabold text-sky-400 font-mono bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/15">
                {feat.badge}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100 mb-2 font-sans tracking-tight">
              {feat.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- HOW IT WORKS WORKFLOW ---
export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: "Payload Telemetry Ingestion",
      description: "Gather dry stack traces, client crash letters, or raw database transaction states. Paste them directly into our active telemetry deck without any preparation.",
      details: "Compatible with JavaScript, Node, Python, Java, Rails, and Postgres variables.",
      pill: "01. Input Stack"
    },
    {
      num: 2,
      title: "Generative Neural Token Mapping",
      description: "Gemini tokenizes files and diagnostics against canonical fault models, mapping architectural race situations and finding logical traps.",
      details: "Operates server-side securely. Zero retention of raw codebases.",
      pill: "02. Core Analysis"
    },
    {
      num: 3,
      title: "Structured Action Blueprints",
      description: "Renders pristine side-by-side diff comparisons, active QA checkmarks parameters, Jest test runners, and plain-English reports.",
      details: "Ready to copy-paste into Linear, JIRA, or customer client channels instantly.",
      pill: "03. Patch Release"
    }
  ];

  return (
    <section className="py-16 border-t border-white/5 relative">
      <div className="mb-12 text-center md:text-left">
        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest font-mono">Streamlined Diagnostics</span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">The 3-Step Processing Loop</h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-stretch">
        {/* Left Interactive Selection */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-3">
          {steps.map((step) => (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`p-5 rounded-2xl text-left border transition-all ${
                activeStep === step.num
                  ? "bg-sky-500/10 border-sky-500/30 text-white shadow-lg"
                  : "bg-black/10 border-white/5 text-slate-400 hover:bg-white/3 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                  activeStep === step.num ? "bg-sky-500 text-slate-950" : "bg-white/5 text-slate-500"
                }`}>
                  {step.num}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-sky-400">{step.pill}</span>
              </div>
              <h3 className="text-sm font-bold tracking-tight mb-1">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">{step.description}</p>
            </button>
          ))}
        </div>

        {/* Right Active Visualization */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden glass">
          <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <span className="text-[9px] font-mono uppercase bg-sky-500/20 text-sky-400 px-2 py-1 rounded inline-block font-bold">
              Visualization Terminal Frame {activeStep}.0
            </span>
            <div className="bg-black/60 border border-white/5 p-4 rounded-xl font-mono text-[11px] leading-relaxed text-slate-300">
              {activeStep === 1 && (
                <div className="space-y-1.5 text-sky-400/90 select-none">
                  <p className="text-slate-500">{"// Connecting payload port..."}</p>
                  <p>&gt; Ingesting crash logs: PID 4514</p>
                  <p>&gt; WARNING: TypeError: Cannot read properties of undefined (reading 'split')</p>
                  <p>&gt; Stacktrace scanned: at parseUserPayload (auth.ts:241:18)</p>
                  <p className="text-emerald-400">&gt; Status: Telemetry successfully mapped into buffer.</p>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-1.5 text-indigo-300 select-none">
                  <p className="text-slate-500">{"// Executing Neural Token Mappings..."}</p>
                  <p>&gt; Routing via Gemini AI Analysis nodes...</p>
                  <p>&gt; Comparing failure signatures against memory-leak & racer prototypes...</p>
                  <p>&gt; Matching affected subsystems... Auth module found.</p>
                  <p className="text-emerald-400">&gt; Diagnostics completed. Resolving fixes...</p>
                </div>
              )}
              {activeStep === 3 && (
                <div className="space-y-1.5 text-emerald-400 select-none">
                  <p className="text-slate-500">{"// Rendering solution schema..."}</p>
                  <p>&gt; Created checkable QA checklist (3 targets resolved)</p>
                  <p>&gt; Renders high-fidelity React diff suite</p>
                  <p>&gt; Compiled Jest test suites successfully</p>
                  <p className="text-sky-400">&gt; Live diagnostic output is fully interactive in sandbox pane.</p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-slate-400 italic">
              {steps[activeStep - 1].details}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Latency: <span className="text-emerald-400">0.02ms</span></span>
            <span>Security: <span className="text-slate-300">TLS 1.3 Encryption Active</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- SOCIAL PROOF & REVIEW FEED ---
export function TestimonialsSection() {
  const [ratingInput, setRatingInput] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Lead Platform Architect",
      company: "Vercel",
      stars: 5,
      quote: "Our support engineers used to burn hours compiling repro files for simple customer crashes. Now we feed dry logs into BugSense, check the reproduction steps, down write the patch, and merge. MTTR dropped by 75% overnight.",
      avatar: "AR"
    },
    {
      name: "Meera Patel",
      role: "Director of QA Assurance",
      company: "Stripe Integration",
      stars: 5,
      quote: "Automating validation checklists and boundary test-case sets is an absolute superpower. My team doesn't have to spend mental energy inventing weird edge cases; the Jest generation gives us release confidence on a silver platter.",
      avatar: "MP"
    },
    {
      name: "Jan De Vries",
      role: "Principal Developer",
      company: "Supabase Core Team",
      stars: 5,
      quote: "The senior explanation module is exceptionally beautiful. It explains complex race condition bugs directly in human, non-jargony mentoring terms. It feels like having an insanely insightful senior dev sitting next to you 24/7.",
      avatar: "JD"
    }
  ];

  const handleRate = (num: number) => {
    setRatingInput(num);
    setHasRated(true);
  };

  return (
    <section className="py-16 border-t border-white/5 relative">
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest font-mono">Feedback Metrics</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">Acclaimed by Developer Teams</h2>
        </div>
        <div className="flex items-center gap-1.5 self-center">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-slate-100">4.92 / 5</span>
          <span className="text-xs text-slate-500">(Over 4,200 audits)</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        {testimonials.map((test, index) => (
          <div key={index} className="glass p-6 rounded-2xl bg-black/10 border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-white/3 rounded-full blur-xl pointer-events-none" />
            <div>
              {/* Rating stars */}
              <div className="flex gap-1 mb-4 select-none">
                {Array.from({ length: test.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal mb-6 italic">
                "{test.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 border-t border-white/5 pt-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-bold text-sky-400 text-xs shrink-0">
                {test.avatar}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{test.name}</h4>
                <p className="text-[10px] text-slate-500">{test.role} at <span className="text-slate-400 font-medium">{test.company}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Quick Feedback Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-sky-500/5 border border-sky-500/20 max-w-xl mx-auto text-center space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 font-mono mb-1">Quick Cast Rating</h4>
          <h3 className="text-sm font-bold text-slate-100">Rate BugSense Diagnostics Core Performance</h3>
          <p className="text-[11px] text-slate-400">Help tune our heuristic loops for upcoming release drafts.</p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleRate(num)}
              disabled={hasRated}
              className={`p-2.5 rounded-lg border transition-all ${
                ratingInput && ratingInput >= num
                  ? "bg-amber-400/10 border-amber-400 text-amber-400"
                  : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
              }`}
            >
              <Star className={`w-5 h-5 ${ratingInput && ratingInput >= num ? "fill-amber-400" : ""}`} />
            </button>
          ))}
        </div>

        <AnimatePresence>
          {hasRated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-emerald-400 font-medium"
            >
              🎉 Thank you for casting a {ratingInput}-star vote! Your telemetry maps are routed successfully.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// --- TRANSPARENT SAAS PRICING MATRIX ---
interface PricingProps {
  onScrollToSandbox: () => void;
}

export function PricingSection({ onScrollToSandbox }: PricingProps) {
  return (
    <section className="py-16 border-t border-white/5 relative">
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-12 text-center">
        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest font-mono">Transparent Framework</span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">Simple Pricing Perfect for Any Tier</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
         Deploy sandbox modules immediately. Upgrade to active corporate pipelines as your diagnostic demand scale increases.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch">
        
        {/* Tier 1 */}
        <div className="glass p-6 rounded-2xl bg-black/15 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-widest font-mono">Hobby / API Keys</span>
            <h3 className="text-lg font-black text-white mt-1">Custom Core</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6">Connect custom keys to leverage fully unrestricted sandbox analysis.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-black text-white">$0</span>
              <span className="text-[10px] text-slate-500 font-mono"> / free forever</span>
            </div>

            <ul className="space-y-3.5 border-t border-white/5 pt-6 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-450 shrink-0" />
                <span>Unlimited diagnostics via personal core</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-450 shrink-0" />
                <span>All 5 analytical output tabs active</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-450 shrink-0" />
                <span>Downloadable plain stakeholder briefings</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onScrollToSandbox}
            className="w-full py-3 mt-8 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl text-xs font-bold text-slate-200 uppercase tracking-wider border border-white/5 cursor-pointer"
          >
            Launch Active Sandbox
          </button>
        </div>

        {/* Tier 2 */}
        <div className="glass p-6 rounded-2xl bg-[#09152b]/40 border-2 border-sky-500/30 flex flex-col justify-between relative shadow-[0_0_30px_rgba(56,189,248,0.05)]">
          <div className="absolute right-4 top-4 bg-sky-500/20 border border-sky-500/30 font-mono text-[8px] font-bold tracking-widest text-sky-400 uppercase px-2 py-0.5 rounded">
            Highly Selected
          </div>
          <div>
            <span className="text-[9px] uppercase font-extrabold text-sky-400 tracking-widest font-mono">Self-Managed Pipelines</span>
            <h3 className="text-lg font-black text-white mt-1">Professional Pro</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6">Fully integrated cloud nodes without providing custom backend keys.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-black text-white">$29</span>
              <span className="text-[10px] text-slate-500 font-mono"> / seat monthly</span>
            </div>

            <ul className="space-y-3.5 border-t border-white/5 pt-6 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Dedicated cloud execution runners (no key needed)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>10 parallel analysis runs capability</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-405 shrink-0" />
                <span>Unlimited prompt adjustment context depth</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onScrollToSandbox}
            className="w-full py-3 mt-8 bg-sky-500 hover:bg-sky-400 active:scale-[0.98] transition-all rounded-xl text-xs font-bold text-slate-950 uppercase tracking-wider shadow-md shadow-sky-500/10 cursor-pointer text-center"
          >
            Go Professional Sandbox
          </button>
        </div>

        {/* Tier 3 */}
        <div className="glass p-6 rounded-2xl bg-black/15 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-widest font-mono">Enterprise SLAs</span>
            <h3 className="text-lg font-black text-white mt-1">Managed Corporate</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6">Targeted security setups, custom integrations, and deep repository index loops.</p>
            
            <div className="mb-6">
              <span className="text-2xl font-black text-white">Custom Matrix</span>
              <span className="text-[10px] text-slate-500 font-mono"> / yearly contracts</span>
            </div>

            <ul className="space-y-3.5 border-t border-white/5 pt-6 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-450 shrink-0" />
                <span>Private VPC deployment configurations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-450 shrink-0" />
                <span>Dedicated technical account lead support</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-sky-450 shrink-0" />
                <span>Codebase semantic mapping & indexing</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => alert("Enterprise contact initialized! In production, this prompts standard sales pipelines.")}
            className="w-full py-3 mt-8 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all rounded-xl text-xs font-bold text-slate-200 uppercase tracking-wider border border-white/5 cursor-pointer"
          >
            Talk directly to Sales
          </button>
        </div>

      </div>
    </section>
  );
}

// --- SECURE ENTERPRISE FAQS (ACCORDION) ---
export function FAQsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How secure is my code payload and dry logs data?",
      a: "Uncompromisingly secure. BugSense AI utilizes stateless, secure SSL channels via our Express proxy middleware. Your stacktraces and code snippets are passed as local memory tokens directly to Gemini APIs and are NEVER retained on databases or used for model training sets."
    },
    {
      q: "Which application frameworks are officially supported?",
      a: "We support visual heuristics across JavaScript/TypeScript (React, NestJS, Next, Express), Python (Django, FastAPI, Flask), Java/JVM (Spring Boot), Ruby on Rails, and standard relational context logs like PostgreSQL or Redis."
    },
    {
      q: "Can we add or change our own Gemini API Keys?",
      a: "Yes! If you are in demo/api-key-free mode, simply go to your workspace settings on AI Studio, enter your API key in the Secrets settings column, and the connected badge will trigger green instantly."
    },
    {
      q: "What makes BugSense different from basic LLM prompts?",
      a: "Standard context engines often produce AI slop: generic advice, incorrect pointers, or messy code comments. BugSense applies targeted diagnostic guidelines, splitting analysis output into five deterministic categories: Root Cause, Reproducible Tracing, Correct Diffs, Jest Test suits, and plain stakeholder briefings."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 border-t border-white/5 relative">
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-12 text-center md:text-left">
        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest font-mono">Heuristic Solvers Intel</span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">Frequently Asked Audit Inquiries</h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/5 bg-black/10 overflow-hidden transition-all"
          >
            <button
              onClick={() => handleToggle(idx)}
              className="w-full flex items-center justify-between text-left p-5 text-sm font-bold text-slate-100 font-sans hover:bg-white/3 transition-colors"
            >
              <span>{faq.q}</span>
              {openIndex === idx ? (
                <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-slate-400 border-t border-white/5 p-5 leading-relaxed font-normal">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- DYNAMIC MARKETING WEBSITE FOOTER ---
export function WebsiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black/30 pt-16 pb-8 relative overflow-hidden">
      {/* Visual neon grid accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {/* Logo and value-prop */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-bold text-sky-400">
              <Bug className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-bold text-white tracking-widest uppercase">
              BugSense <span className="text-sky-400">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Automating memory tracing and senior lead code diagnostics. Synthesizing messy telemetry payloads securely in seconds under local browser sandboxes.
          </p>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-sky-400 font-mono bg-sky-500/5 border border-sky-500/10 px-3 py-1.5 rounded-lg w-fit">
            <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse shrink-0" />
            <span>Core Nodes Online Uptime: 99.98%</span>
          </div>
        </div>

        {/* Directory column: Product */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-4">Diagnostic Products</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><a href="#header-nav" className="hover:text-sky-400 transition-colors">Sandbox Solver Core</a></li>
            <li><a href="#how-it-works" className="hover:text-sky-400 transition-colors">Sequential Flow Maps</a></li>
            <li><a href="#capabilities" className="hover:text-sky-400 transition-colors">Heuristics Engine</a></li>
            <li><a href="#pricing" className="hover:text-sky-400 transition-colors">SaaS Pricing plans</a></li>
          </ul>
        </div>

        {/* Directory column: Resources */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-4">Framework Docs</h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-mono">
            <li><a href="https://vite.dev" target="_blank" rel="noreferrer" className="hover:text-sky-400 tracking-wider flex items-center gap-1.5"><span>Vite bundler docs</span><ExternalLink className="w-2.5 h-2.5" /></a></li>
            <li><a href="https://react.dev" target="_blank" rel="noreferrer" className="hover:text-sky-400 tracking-wider flex items-center gap-1.5"><span>React functional hooks</span><ExternalLink className="w-2.5 h-2.5" /></a></li>
            <li><a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 tracking-wider flex items-center gap-1.5"><span>Tailwind CSS framework</span><ExternalLink className="w-2.5 h-2.5" /></a></li>
            <li><a href="https://ai.google.dev/gemini-api" target="_blank" rel="noreferrer" className="hover:text-sky-400 tracking-wider flex items-center gap-1.5"><span>Gemini translation core</span><ExternalLink className="w-2.5 h-2.5" /></a></li>
          </ul>
        </div>

        {/* Directory column: Security */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Security & Privacy</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Our cloud pipelines are stateless and execute in secure browser sandboxes. We support standard TLS encryption and follow Zero-trust payload routing models strictly.
          </p>
          <div className="flex gap-2 text-xs">
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] text-slate-400 rounded-lg font-mono font-bold tracking-wider">TLS 1.3 Certified</span>
            <span className="bg-white/5 border border-white/5 px-2.5 py-1 text-[10px] text-slate-400 rounded-lg font-mono font-bold tracking-wider">AICPA SOC2 Ready</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[11px] text-slate-500 font-normal">
         Copyright &copy; {currentYear} BugSense AI. Open-source under Apache-2.0. All diagnostic pipelines completely secure.
        </span>
        <div className="flex items-center gap-4 text-[10px] text-slate-550 font-semibold tracking-wider font-mono">
          <span>SLA PROTOCOL: <span className="text-sky-400">DEBUG_AI_v2.5</span></span>
          <span className="hidden sm:inline">•</span>
          <span>SaaS ENGINE: <span className="text-slate-350">Gemini 3.5 Core</span></span>
        </div>
      </div>
    </footer>
  );
}
