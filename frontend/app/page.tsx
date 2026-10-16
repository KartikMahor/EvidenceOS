"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Sparkles, ArrowRight, Network, FileText, Cpu, CheckCircle2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically route to dashboard after 500ms if not clicked
    const t = setTimeout(() => {
      router.push("/dashboard");
    }, 600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="relative min-h-screen bg-[#080d1a] text-slate-100 flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-sky-500 selection:text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[380px] bg-sky-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-12 right-1/4 w-[450px] h-[280px] bg-cyan-500/10 blur-[110px] rounded-full" />
        <div className="absolute top-12 left-10 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Brand Header */}
      <div className="relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 ring-1 ring-sky-400/30">
            <ShieldAlert className="w-5 h-5 drop-shadow" />
          </div>
          <div>
            <div className="font-bold text-slate-100 tracking-tight text-lg">
              Evidence<span className="text-sky-400">OS</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Digital Evidence Intelligence Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-[#0e1526]/80 border border-[#1e2b48] backdrop-blur-md">
          <Cpu className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Gemma 4 Architecture</span>
        </div>
      </div>

      {/* Center Hero */}
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 my-auto py-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono backdrop-blur-md shadow-sm shadow-sky-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>Automated Forensic Intelligence Extraction</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Transform Unstructured Digital Custody Into{" "}
          <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
            Grounded Intelligence
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Extract persons, usernames, financial accounts, and chronological event timelines from forensic documents using Gemma 4. Flag contradictory claims and inspect verbatim source quotations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-sky-600/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>Enter Intelligence Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer Features */}
      <div className="relative z-10 max-w-4xl w-full mx-auto border-t border-[#1e2b48]/80 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-mono text-center">
        <div className="flex items-center justify-center gap-2.5 p-2.5 rounded-lg bg-[#0e1526]/50 border border-[#1e2b48]/60 backdrop-blur-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Verbatim Quote Grounding</span>
        </div>
        <div className="flex items-center justify-center gap-2.5 p-2.5 rounded-lg bg-[#0e1526]/50 border border-[#1e2b48]/60 backdrop-blur-sm">
          <Network className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Interactive Relationship Graph</span>
        </div>
        <div className="flex items-center justify-center gap-2.5 p-2.5 rounded-lg bg-[#0e1526]/50 border border-[#1e2b48]/60 backdrop-blur-sm">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Automated Contradiction Engine</span>
        </div>
      </div>
    </div>
  );
}
