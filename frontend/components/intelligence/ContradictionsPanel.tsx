"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  DollarSign,
  Calendar,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Contradiction } from "@/lib/types";
import { api } from "@/lib/api";

interface ContradictionsPanelProps {
  investigationId: string;
  contradictions: Contradiction[];
  onUpdate: () => void;
}

export function ContradictionsPanel({
  investigationId,
  contradictions,
  onUpdate,
}: ContradictionsPanelProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [activeModalId, setActiveModalId] = useState<string | null>(null);

  const unresolvedCount = contradictions.filter(
    (c) => c.status === "unresolved"
  ).length;

  const handleResolve = async (
    contradictionId: string,
    targetStatus: "resolved" | "unresolved" | "dismissed"
  ) => {
    setResolvingId(contradictionId);
    try {
      await api.resolveContradiction(
        investigationId,
        contradictionId,
        targetStatus,
        notes
      );
      setActiveModalId(null);
      setNotes("");
      onUpdate();
    } catch (err: any) {
      alert(err?.message || "Failed to update contradiction status");
    } finally {
      setResolvingId(null);
    }
  };

  if (contradictions.length === 0) {
    return (
      <div className="p-8 border border-[#1e293b] rounded-xl bg-[#0c1220]/60 text-center">
        <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Contradictions Flagged
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto">
          All analyzed claims and records are mutually corroborating, or no conflicting dates, amounts, or authorizations were detected.
        </p>
      </div>
    );
  }

  const getConflictIcon = (type: string) => {
    switch (type) {
      case "amount_conflict":
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case "date_conflict":
        return <Calendar className="w-4 h-4 text-cyan-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Metric */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#131c31] border border-[#1e293b]">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Contradiction Detection Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-correlating witness claims, intercepted logs, and financial records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {unresolvedCount} Unresolved
          </span>
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {contradictions.length - unresolvedCount} Resolved
          </span>
        </div>
      </div>

      {/* Contradiction Cards */}
      <div className="space-y-4">
        {contradictions.map((cnt) => {
          const isResolved = cnt.status === "resolved";
          return (
            <div
              key={cnt.id}
              className={`p-5 rounded-xl border transition-all ${
                isResolved
                  ? "bg-[#0b101c]/80 border-[#1e293b] opacity-75"
                  : "bg-[#0f172a] border-amber-500/30 shadow-lg shadow-amber-500/5"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#131d31] border border-[#1e293b]">
                    {getConflictIcon(cnt.contradiction_type)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wide">
                      {cnt.contradiction_type.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">
                      ID: {cnt.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isResolved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Active Conflict
                    </span>
                  )}

                  <button
                    onClick={() => setActiveModalId(cnt.id)}
                    className="px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs font-medium transition-colors"
                  >
                    {isResolved ? "Reopen / Edit Notes" : "Resolve Conflict"}
                  </button>
                </div>
              </div>

              {/* Conflict Description */}
              <p className="text-xs font-medium text-slate-200 mb-4 leading-relaxed">
                {cnt.description}
              </p>

              {/* Side-by-Side Claims Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Source 1 */}
                <div className="p-3.5 rounded-lg bg-[#090d16] border border-[#1e293b] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                    <span className="text-sky-400 font-bold">Source Record 1</span>
                    <span>{cnt.evidence_1_id || "Evidence A"}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-200 italic leading-relaxed bg-[#0c1220] p-2.5 rounded border border-[#1e293b]">
                    &quot;{cnt.claim_1_quote}&quot;
                  </div>
                </div>

                {/* Source 2 */}
                <div className="p-3.5 rounded-lg bg-[#090d16] border border-[#1e293b] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                    <span className="text-amber-400 font-bold">Source Record 2</span>
                    <span>{cnt.evidence_2_id || "Evidence B"}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-200 italic leading-relaxed bg-[#0c1220] p-2.5 rounded border border-[#1e293b]">
                    &quot;{cnt.claim_2_quote}&quot;
                  </div>
                </div>
              </div>

              {/* Reviewer Resolution Notes */}
              {cnt.resolution_notes && (
                <div className="pt-2 text-xs text-slate-400 border-t border-[#1e293b]/60 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-semibold text-emerald-400">
                    Reviewer Notes:
                  </span>
                  <span>{cnt.resolution_notes}</span>
                </div>
              )}

              {/* Modal for resolving / adding notes */}
              {activeModalId === cnt.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Investigator Conflict Adjudication
                    </h3>
                    <p className="text-xs text-slate-400">
                      Record review notes explaining why this discrepancy exists (e.g., fraudulent ledger entry vs extortion demand).
                    </p>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Resolution Notes
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={cnt.resolution_notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Cross-examined witness Marcus Baxter; verified wire authorization code was forged by third party."
                        className="w-full p-2.5 bg-[#0c1220] border border-[#1e293b] rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                      <button
                        onClick={() => setActiveModalId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleResolve(cnt.id, "unresolved")}
                        disabled={resolvingId === cnt.id}
                        className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs rounded"
                      >
                        Mark Unresolved
                      </button>
                      <button
                        onClick={() => handleResolve(cnt.id, "resolved")}
                        disabled={resolvingId === cnt.id}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-md"
                      >
                        Confirm Resolved
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
