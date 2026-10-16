"use client";

import React, { useState } from "react";
import { Download, FileText, Check, AlertTriangle, ShieldCheck, Printer } from "lucide-react";
import { InvestigationDetail } from "@/lib/types";
import { api } from "@/lib/api";

interface ReportViewProps {
  investigation: InvestigationDetail;
}

export function ReportView({ investigation }: ReportViewProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleDownload = async (format: "markdown" | "html") => {
    setDownloadingFormat(format);
    try {
      await api.downloadReport(investigation.id, investigation.title, format);
    } catch (err: any) {
      alert("Failed to download report: " + err?.message);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="p-6 rounded-2xl bg-[#0e1526] border border-[#1e2b48] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Investigation Intelligence Dossier</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Export a comprehensive, source-traceable intelligence report with custody logs and verbatim quotations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleDownload("markdown")}
            disabled={downloadingFormat !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121c33] hover:bg-[#182442] border border-[#1e2b48] hover:border-sky-500/30 text-xs font-medium text-slate-200 transition-all shadow-sm cursor-pointer"
          >
            {downloadingFormat === "markdown" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>Download .MD</span>
          </button>

          <button
            onClick={() => handleDownload("html")}
            disabled={downloadingFormat !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            {downloadingFormat === "html" ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-white" />
            )}
            <span>Export HTML Report</span>
          </button>
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="p-8 sm:p-10 rounded-2xl bg-[#0e1526] border border-[#1e2b48] shadow-2xl max-w-4xl mx-auto space-y-6 font-sans">
        {/* Document Header */}
        <div className="border-b border-[#1e2b48] pb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="tracking-wider">EVIDENCEOS INTELLIGENCE REPORT</span>
            <span className="text-amber-400/90 font-semibold">RESTRICTED / CONFIDENTIAL</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            {investigation.title}
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Investigation ID: <span className="font-mono text-sky-400">{investigation.id}</span> • Status: <span className="font-mono uppercase text-slate-200">{investigation.status}</span>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>LEGAL & RESPONSIBLE AI NOTICE</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            This dossier integrates automated intelligence extraction through Gemma 4. All AI-generated findings, entity relationships, and timeline sequences require independent human review and cross-verification prior to judicial or enforcement action.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#121c33] border border-[#1e2b48]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Evidence Sources</span>
            <span className="text-base font-bold text-slate-100">{investigation.evidence_files.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#121c33] border border-[#1e2b48]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Entities Mapped</span>
            <span className="text-base font-bold text-sky-400">{investigation.entities.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#121c33] border border-[#1e2b48]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Events Timeline</span>
            <span className="text-base font-bold text-cyan-400">{investigation.events.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#121c33] border border-[#1e2b48]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Flagged Conflicts</span>
            <span className="text-base font-bold text-amber-400">{investigation.contradictions.length}</span>
          </div>
        </div>

        {/* Narrative Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
            1. Narrative Overview
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed bg-[#080d1a] p-4 rounded-xl border border-[#1e2b48]">
            {investigation.description || "No narrative overview recorded."}
          </p>
        </div>

        {/* Evidence Chain */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
            2. Chain of Custody Sources ({investigation.evidence_files.length})
          </h4>
          <div className="border border-[#1e2b48] rounded-xl overflow-hidden bg-[#080d1a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1526] text-[10px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="p-3">Evidence ID</th>
                  <th className="p-3">Filename</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2b48]/60 text-slate-300">
                {investigation.evidence_files.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#121c33]/50">
                    <td className="p-3 font-mono text-sky-400 text-[11px]">{ev.id}</td>
                    <td className="p-3 font-semibold text-slate-100">{ev.filename}</td>
                    <td className="p-3 font-mono uppercase text-[10px] text-slate-400">{ev.file_type}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{(ev.file_size / 1024).toFixed(1)} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contradictions summary */}
        {investigation.contradictions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Detected Discrepancies & Contradictions</span>
            </h4>
            <div className="space-y-2.5">
              {investigation.contradictions.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-[#080d1a] border border-amber-500/25 text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 uppercase font-mono text-[11px]">
                      {c.contradiction_type.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
