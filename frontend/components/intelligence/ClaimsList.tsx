"use client";

import React from "react";
import { MessageSquare, ShieldCheck, AlertTriangle, FileText } from "lucide-react";
import { Claim } from "@/lib/types";

interface ClaimsListProps {
  claims: Claim[];
}

export function ClaimsList({ claims }: ClaimsListProps) {
  if (claims.length === 0) {
    return (
      <div className="p-8 border border-[#1e293b] rounded-xl bg-[#0c1220]/60 text-center">
        <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Claims Extracted Yet
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Analyze uploaded evidence to parse stated allegations, admissions, and reported claims.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">
          Extracted Claims & Allegations ({claims.length})
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          Distinguishing reported claims from verified facts
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[#131d31] text-sky-400 border border-sky-500/20">
                {claim.classification.replace("_", " ")}
              </span>

              {claim.needs_review ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" /> Needs Human Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Grounded In Source
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-slate-200 leading-relaxed">
              {claim.text}
            </p>

            {claim.source_quotes && claim.source_quotes.length > 0 && (
              <div className="pt-2 border-t border-[#1e293b]/60">
                <div className="text-[11px] text-slate-400 font-mono italic bg-[#090d16] p-2.5 rounded border border-[#1e293b]">
                  &quot;{claim.source_quotes[0]}&quot;
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
