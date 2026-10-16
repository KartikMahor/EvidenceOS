"use client";

import React, { useState } from "react";
import { FileText, FileCode, Eye, X, Copy, Check, Calendar, HardDrive } from "lucide-react";
import { EvidenceFile } from "@/lib/types";
import { api } from "@/lib/api";

interface EvidenceFileListProps {
  investigationId: string;
  files: EvidenceFile[];
  onUploadClick: () => void;
}

export function EvidenceFileList({
  investigationId,
  files,
  onUploadClick,
}: EvidenceFileListProps) {
  const [activeFile, setActiveFile] = useState<(EvidenceFile & { extracted_text?: string }) | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [copied, setCopied] = useState(false);

  const viewFullText = async (file: EvidenceFile) => {
    setActiveFile(file);
    setLoadingText(true);
    try {
      const full = await api.getEvidenceFile(investigationId, file.id);
      setActiveFile(full);
    } catch {
      // keep preview
    } finally {
      setLoadingText(false);
    }
  };

  const copyToClipboard = () => {
    if (activeFile?.extracted_text || activeFile?.extracted_text_preview) {
      navigator.clipboard.writeText(
        activeFile.extracted_text || activeFile.extracted_text_preview || ""
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (files.length === 0) {
    return (
      <div className="p-8 border border-[#1e293b] rounded-xl bg-[#0c1220]/60 text-center">
        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Evidence Files Uploaded
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Upload .txt or .pdf files to begin Gemma 4 intelligence extraction and source tracing.
        </p>
        <button
          onClick={onUploadClick}
          className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
        >
          Upload Evidence Files
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          Custody Evidence Files ({files.length})
        </h3>
        <button
          onClick={onUploadClick}
          className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          + Add more files
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-[#131c31] border border-[#1e293b] flex items-center justify-center text-sky-400 shrink-0">
                    {file.file_type === "pdf" ? (
                      <FileCode className="w-4 h-4 text-rose-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      {file.filename}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {file.id}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[#131c31] text-slate-300 border border-[#1e293b]">
                  {file.file_type}
                </span>
              </div>

              {file.extracted_text_preview && (
                <p className="text-[11px] text-slate-400 line-clamp-2 bg-[#0a0f1d] p-2 rounded border border-[#1e293b]/60 font-mono mt-2">
                  {file.extracted_text_preview}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1e293b]/60 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono">
                  <HardDrive className="w-3 h-3" />
                  {(file.file_size / 1024).toFixed(1)} KB
                </span>
                <span>{file.page_count} {file.page_count === 1 ? "page" : "pages"}</span>
              </div>
              <button
                onClick={() => viewFullText(file)}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-medium cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Text</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Extracted Text Drawer / Modal */}
      {activeFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0c1220]">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                <h4 className="text-sm font-semibold text-slate-100 truncate">
                  {activeFile.filename}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono ml-2">
                  ({activeFile.id})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg bg-[#131c31] border border-[#1e293b] text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy full text"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setActiveFile(null)}
                  className="text-slate-400 hover:text-slate-200 p-1.5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#090d16]">
              {loadingText ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Loading extracted text...
                </div>
              ) : (
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                  {activeFile.extracted_text || activeFile.extracted_text_preview}
                </pre>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#1e293b] bg-[#0c1220] flex items-center justify-between text-xs text-slate-500">
              <span>Format: {activeFile.file_type.toUpperCase()} • Pages: {activeFile.page_count}</span>
              <button
                onClick={() => setActiveFile(null)}
                className="px-3 py-1 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
