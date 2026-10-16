"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Shield, Cpu, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { HealthStatus } from "@/lib/types";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNewInvestigation?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({
  title = "Intelligence Dashboard",
  subtitle,
  onNewInvestigation,
  breadcrumbs,
}: HeaderProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = () => {
    setChecking(true);
    api
      .getHealth()
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setChecking(false));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header className="h-16 border-b border-[#1e2b48] bg-[#0e1526]/85 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-600">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-sky-400 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-300 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          {title}
          {subtitle && (
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">
              — {subtitle}
            </span>
          )}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Model Indicator Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#121c33]/90 border border-[#1e2b48] text-xs font-mono text-slate-300 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span>Gemma 4</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Backend Ping Button */}
        <button
          onClick={checkHealth}
          title="Refresh backend status"
          className="p-2 rounded-lg bg-[#121c33] border border-[#1e2b48] text-slate-400 hover:text-sky-400 hover:bg-[#182442] hover:border-sky-500/30 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-sky-400" : ""}`} />
        </button>

        {/* Primary Action Button */}
        {onNewInvestigation && (
          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-medium shadow-md shadow-sky-600/25 transition-all duration-150 hover:shadow-sky-500/35 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </button>
        )}
      </div>
    </header>
  );
}
