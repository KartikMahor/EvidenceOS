"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  FolderLock,
  Network,
  Activity,
  FileText,
  Clock,
  Sparkles,
  Server,
  Layers,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { HealthStatus } from "@/lib/types";

export function Sidebar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    api
      .getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Activity },
    { label: "Investigations", href: "/investigations", icon: FolderLock },
  ];

  return (
    <aside className="w-64 bg-[#0c1220] border-r border-[#1e293b] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-100 tracking-tight text-base flex items-center gap-1.5">
                Evidence<span className="text-sky-400">OS</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                Intelligence Core
              </div>
            </div>
          </Link>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#131d31]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pt-6 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Platform Capabilities
          </div>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="px-3 py-2 rounded-md bg-[#090d16] border border-[#1e293b]/70 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Gemma 4 Structured AI</span>
            </div>
            <div className="px-3 py-2 rounded-md bg-[#090d16] border border-[#1e293b]/70 flex items-center gap-2">
              <Network className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Interactive Graph</span>
            </div>
            <div className="px-3 py-2 rounded-md bg-[#090d16] border border-[#1e293b]/70 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Event Timeline</span>
            </div>
            <div className="px-3 py-2 rounded-md bg-[#090d16] border border-[#1e293b]/70 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Contradiction Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1e293b] bg-[#080d17]/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono">
            <Server className="w-3 h-3 text-slate-500" />
            Backend
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
              health?.status === "healthy"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {health?.status === "healthy" ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 truncate font-mono">
          Model:{" "}
          <span className="text-slate-300">
            {health?.configured_model || "gemma-4-26b-a4b-it"}
          </span>
        </div>
        <div className="text-[10px] text-slate-600 mt-1 font-mono">
          Mode: {health?.mode === "live_api" ? "Live GenAI" : "Evaluation Baseline"}
        </div>
      </div>
    </aside>
  );
}
