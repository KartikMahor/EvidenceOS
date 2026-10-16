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
    <header className="h-16 border-b border-[#1e293b] bg-[#0c1220]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-600">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-200 transition-colors"
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

      <div className="flex items-center gap-3">
        {/* Model Indicator Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131c31] border border-[#1e293b] text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span>Gemma 4</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Backend Ping Button */}
        <button
          onClick={checkHealth}
          title="Refresh backend status"
          className="p-1.5 rounded-lg bg-[#131c31] border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:bg-[#1b2642] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-sky-400" : ""}`} />
        </button>

        {/* Primary Action Button */}
        {onNewInvestigation && (
          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-md shadow-sky-600/20 transition-all hover:shadow-sky-500/30 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </button>
        )}
      </div>
    </header>
  );
}
