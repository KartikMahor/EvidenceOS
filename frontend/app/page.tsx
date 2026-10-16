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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-sky-500 selection:text-white">
      {/* Brand Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-100 tracking-tight text-lg">
              Evidence<span className="text-sky-400">OS</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Digital Evidence Intelligence Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span>Gemma 4 Architecture</span>
        </div>
      </div>

      {/* Center Hero */}
      <div className="max-w-3xl mx-auto text-center space-y-6 my-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Automated Forensic Intelligence Extraction</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Transform Unstructured Digital Custody Into Grounded Intelligence
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Extract persons, usernames, financial accounts, and chronological event timelines from forensic documents using Gemma 4. Flag contradictory claims and inspect verbatim source quotations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-sky-600/25 transition-all hover:scale-105"
          >
            <span>Enter Intelligence Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer Features */}
      <div className="max-w-4xl w-full mx-auto border-t border-[#1e293b]/80 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-mono text-center">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Verbatim Quote Grounding</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Network className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Interactive Relationship Graph</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Automated Contradiction Engine</span>
        </div>
      </div>
    </div>
  );
}
