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
      <div className="p-12 border border-[#1e2b48] rounded-2xl bg-[#0e1526]/70 text-center">
        <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Claims Extracted Yet
        </h4>
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Analyze uploaded evidence to parse stated allegations, admissions, and reported claims.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">
          Extracted Claims & Allegations ({claims.length})
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          Distinguishing reported claims from verified facts
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="p-5 rounded-2xl bg-[#0e1526] border border-[#1e2b48] hover:border-sky-500/40 hover:bg-[#121c33]/80 transition-all shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-[#121c33] text-sky-400 border border-sky-500/25">
                {claim.classification.replace("_", " ")}
              </span>

              {claim.needs_review ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                  <AlertTriangle className="w-3 h-3 text-amber-400" /> Needs Human Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded In Source
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-slate-100 leading-relaxed">
              {claim.text}
            </p>

            {claim.source_quotes && claim.source_quotes.length > 0 && (
              <div className="pt-2 border-t border-[#1e2b48]/80">
                <div className="text-xs text-sky-200/90 font-mono italic bg-[#080d1a] p-3 rounded-xl border border-[#1e2b48] leading-relaxed">
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
