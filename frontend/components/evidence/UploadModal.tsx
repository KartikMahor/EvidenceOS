"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, AlertCircle, X, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { EvidenceFile } from "@/lib/types";

interface UploadModalProps {
  investigationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uploaded: EvidenceFile[]) => void;
}

export function UploadModal({
  investigationId,
  isOpen,
  onClose,
  onSuccess,
}: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one .txt or .pdf file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded = await api.uploadEvidence(investigationId, selectedFiles);
      setSelectedFiles([]);
      onSuccess(uploaded);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const loadSampleFiles = async () => {
    setUploading(true);
    setError(null);

    try {
      // Create synthetic sample files in-memory to upload directly
      const sample1 = new File(
        [
          `[SYNTHETIC DEMONSTRATION DATA - FOR INVESTIGATION SIMULATION ONLY]
EVIDENCE ID: EV-001
SOURCE: Intercepted Encrypted Communication Log
ORIGIN: Telegram Session Excerpt #7741
INVESTIGATION: Operation Chimera Leak

[2026-10-12 08:14:22 UTC] shadow42: Dr. Thorne, the Zurich drop is confirmed for October 12, 2026. The initial installment of $45,000 was wired to the escrow account as agreed.
[2026-10-12 08:16:05 UTC] Dr. Aris Thorne: Understood. The research files from Apex BioTech are packaged and encrypted. Make sure Marcus Baxter does not intercept the transmission channel.
[2026-10-12 08:17:30 UTC] shadow42: Baxter is preoccupied with the board meeting in Zurich. Contact me on the Swiss backup line +41 22 901 4400 if the server alert triggers.
[2026-10-12 08:19:12 UTC] Dr. Aris Thorne: Sending sample payload now from thorne@apex-bio.com to the staging relay.`,
        ],
        "evidence_01_chat_log.txt",
        { type: "text/plain" }
      );

      const sample2 = new File(
        [
          `[SYNTHETIC DEMONSTRATION DATA - FOR INVESTIGATION SIMULATION ONLY]
EVIDENCE ID: EV-002
SOURCE: Nexus Financial Services Internal Ledger
RECORD TYPE: Offshore Wire Transfer Record
DOCUMENT REF: NFS-TX-2026-9921

TRANSACTION DETAILS:
Transaction ID: NFS-2026-9921
Execution Date: October 14, 2026
Originating Account: ACC-88910 (Entity Alias: shadow42)
Originating Institution: Nexus Financial Services, Zurich Branch
Destination Account: ACC-33104 (Beneficiary: Dr. Aris Thorne)
Beneficiary Organization: Apex BioTech Research Affiliate
Transfer Amount: $55,000 USD
Transfer Purpose Code: CONSULT-SERVICES-INTL
Audit Note: Wire transfer notes indicate payment authorization reference attributed to Marcus Baxter, Corporate Director.
Status: Completed
Verification Stamp: Certified by Swiss Banking Compliance Officer L. Weber`,
        ],
        "evidence_02_bank_ledger.txt",
        { type: "text/plain" }
      );

      const sample3 = new File(
        [
          `[SYNTHETIC DEMONSTRATION DATA - FOR INVESTIGATION SIMULATION ONLY]
EVIDENCE ID: EV-003
ORGANIZATION: Apex BioTech Security Operations Center
DOCUMENT TYPE: Security Incident Escalation Report (IR-2026-104)
DATE OF REPORT: October 13, 2026

INCIDENT OVERVIEW:
At 22:45 UTC on October 12, 2026, anomalous data exfiltration was detected across the internal network gateway at the Geneva Facility.

KEY FINDINGS:
1. Compromised Account: Internal credentials belonging to Dr. Aris Thorne (email: thorne@apex-bio.com) were used to query the proprietary Chimera Project genetic sequence database.
2. Transfer Mechanism: Approximately 4.2 GB of proprietary archives were routed through an external proxy endpoint. Forensic analysis traced the staging relay to a known operational persona tagged as shadow42.
3. Physical Access: Keycard logs demonstrate that Marcus Baxter authorized emergency facility access override for Dr. Aris Thorne at the Geneva Facility on the evening of October 12, 2026.
4. Escalation: Incident flagged for immediate corporate compliance review and forensic preservation.
Report Filed By: Elena Rostova, CISO, Apex BioTech`,
        ],
        "evidence_03_incident_report.txt",
        { type: "text/plain" }
      );

      const sample4 = new File(
        [
          `[SYNTHETIC DEMONSTRATION DATA - FOR INVESTIGATION SIMULATION ONLY]
EVIDENCE ID: EV-004
ORGANIZATION: Swiss Federal Corporate Crime Unit / Internal Inquiries
DOCUMENT: Witness Deposition & Sworn Transcript
INTERVIEWEE: Marcus Baxter (Operations Director, Apex BioTech)
DATE OF INTERVIEW: October 16, 2026
INTERVIEWING SPECIAL AGENT: Sarah Lin
LOCATION: Geneva Judicial Police Headquarters

TRANSCRIPT EXCERPT:

Agent Lin: Mr. Baxter, we have an internal wire record indicating an authorization for $55,000 sent to Dr. Aris Thorne on October 14, 2026, bearing your director signature code. Did you authorize this transaction?

Marcus Baxter: Absolutely not. That record is forged or misrepresented. Dr. Thorne approached me on October 11, 2026, claiming an external hacker using the pseudonym shadow42 was blackmailing him and demanding $45,000 for server decryption keys. I categorically rejected corporate payout. I never authorized $55,000, nor did I approve a payment on October 14.

Agent Lin: Did Dr. Thorne provide any contact mechanism for shadow42?

Marcus Baxter: Yes. Thorne said shadow42 insisted on communication via the Swiss mobile number +41 22 901 4400 and an encrypted Telegram gateway. Thorne also warned that shadow42 had accomplices in Zurich.

Agent Lin: What about the after-hours access badge for October 12?

Marcus Baxter: Thorne requested emergency laboratory access claiming a cooling failure in the Chimera bioreactors. I approved his entry badge purely for maintenance. If he exfiltrated data that night to shadow42, he abused my trust.`,
        ],
        "evidence_04_witness_interview.txt",
        { type: "text/plain" }
      );

      const uploaded = await api.uploadEvidence(investigationId, [
        sample1,
        sample2,
        sample3,
        sample4,
      ]);
      onSuccess(uploaded);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to load sample evidence.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-slate-100 text-base">
              Upload Digital Evidence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Preload Button */}
          <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-800/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Quick Evaluation: Synthetic Demo Evidence
              </div>
              <div className="text-[11px] text-slate-400">
                Load 4 fictional documents with overlapping entities & contradictions
              </div>
            </div>
            <button
              onClick={loadSampleFiles}
              disabled={uploading}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium transition-colors shrink-0 disabled:opacity-50"
            >
              {uploading ? "Loading..." : "Load 4 Samples"}
            </button>
          </div>

          <div className="relative border-2 border-dashed border-[#1e293b] hover:border-sky-500/50 rounded-xl p-8 text-center transition-colors bg-[#0a0f1d]/60">
            <input
              type="file"
              multiple
              accept=".txt,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <FileText className="w-10 h-10 text-slate-500 mb-2" />
              <div className="text-sm font-medium text-slate-200">
                Drop .txt or .pdf files here, or{" "}
                <span className="text-sky-400">browse</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Max 10 MB per file. Text and PDF files supported.
              </p>
            </div>
          </div>

          {/* Selected File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <div className="text-xs font-medium text-slate-400">
                Ready to upload ({selectedFiles.length}):
              </div>
              {selectedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded bg-[#131c31] border border-[#1e293b] text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 truncate">{f.name}</span>
                    <span className="text-slate-500 font-mono">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-slate-400 hover:text-rose-400 transition-colors ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1e293b] bg-[#0c1220] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#131d31] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading & Parsing...</span>
              </>
            ) : (
              <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length}) Files` : ""}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
