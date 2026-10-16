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
      <div className="p-5 rounded-xl bg-[#0f172a] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Investigation Intelligence Dossier</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Export a comprehensive, source-traceable intelligence report with custody logs and verbatim quotations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleDownload("markdown")}
            disabled={downloadingFormat !== null}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#131c31] hover:bg-[#1b2642] border border-[#1e293b] text-xs font-medium text-slate-200 transition-colors shadow-sm"
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all active:scale-95"
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
      <div className="p-8 rounded-xl bg-[#0c1220] border border-[#1e293b] shadow-xl max-w-4xl mx-auto space-y-6 font-sans">
        {/* Document Header */}
        <div className="border-b border-[#1e293b] pb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
            <span>EVIDENCEOS INTELLIGENCE REPORT</span>
            <span>RESTRICTED / CONFIDENTIAL</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            {investigation.title}
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            Investigation ID: <span className="font-mono text-sky-400">{investigation.id}</span> • Status: <span className="font-mono uppercase text-slate-300">{investigation.status}</span>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>LEGAL & RESPONSIBLE AI NOTICE</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            This dossier integrates automated intelligence extraction through Gemma 4. All AI-generated findings, entity relationships, and timeline sequences require independent human review and cross-verification prior to judicial or enforcement action.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#131c31] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Evidence Sources</span>
            <span className="text-base font-bold text-slate-100">{investigation.evidence_files.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#131c31] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Entities Mapped</span>
            <span className="text-base font-bold text-sky-400">{investigation.entities.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#131c31] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Events Timeline</span>
            <span className="text-base font-bold text-cyan-400">{investigation.events.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#131c31] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Flagged Conflicts</span>
            <span className="text-base font-bold text-amber-400">{investigation.contradictions.length}</span>
          </div>
        </div>

        {/* Narrative Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
            1. Narrative Overview
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0f172a] p-4 rounded-lg border border-[#1e293b]">
            {investigation.description || "No narrative overview recorded."}
          </p>
        </div>

        {/* Evidence Chain */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
            2. Chain of Custody Sources ({investigation.evidence_files.length})
          </h4>
          <div className="border border-[#1e293b] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d16] text-[10px] font-mono text-slate-500 uppercase">
                <tr>
                  <th className="p-2.5">Evidence ID</th>
                  <th className="p-2.5">Filename</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 text-slate-300">
                {investigation.evidence_files.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#131c31]/50">
                    <td className="p-2.5 font-mono text-sky-400 text-[11px]">{ev.id}</td>
                    <td className="p-2.5 font-semibold text-slate-200">{ev.filename}</td>
                    <td className="p-2.5 font-mono uppercase text-[10px]">{ev.file_type}</td>
                    <td className="p-2.5 font-mono text-[11px]">{(ev.file_size / 1024).toFixed(1)} KB</td>
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
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3. Detected Discrepancies & Contradictions</span>
            </h4>
            <div className="space-y-2">
              {investigation.contradictions.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-[#0f172a] border border-amber-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 uppercase font-mono text-[11px]">
                      {c.contradiction_type.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      [{c.status.toUpperCase()}]
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
