"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  FolderLock,
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  Cpu,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";
import { InvestigationListItem } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [investigations, setInvestigations] = useState<InvestigationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const loadData = () => {
    setLoading(true);
    api
      .getInvestigations()
      .then(setInvestigations)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregate metrics
  const totalEvidence = investigations.reduce(
    (acc, curr) => acc + (curr.stats?.evidence_count || 0),
    0
  );
  const totalEntities = investigations.reduce(
    (acc, curr) => acc + (curr.stats?.entity_count || 0),
    0
  );
  const totalEvents = investigations.reduce(
    (acc, curr) => acc + (curr.stats?.event_count || 0),
    0
  );
  const totalContradictions = investigations.reduce(
    (acc, curr) => acc + (curr.stats?.unresolved_contradictions || 0),
    0
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      const created = await api.createInvestigation(title, description);
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      router.push(`/investigations/${created.id}`);
    } catch (err: any) {
      alert("Failed to create investigation: " + err?.message);
    } finally {
      setCreating(false);
    }
  };

  const createSampleDemoInvestigation = async () => {
    setCreating(true);
    try {
      const created = await api.createInvestigation(
        "Operation Chimera Leak (Synthetic Demo)",
        "Investigation into reported corporate exfiltration of Project Chimera genetic sequences, encrypted Telegram coordination with shadow42, and $45K vs $55K wire discrepancies."
      );
      router.push(`/investigations/${created.id}`);
    } catch (err: any) {
      alert("Failed to create demo investigation: " + err?.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d1a] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="EvidenceOS Intelligence Operations"
          subtitle="Gemma 4 Digital Forensic Analysis"
          onNewInvestigation={() => setShowCreateModal(true)}
        />

        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Hero Banner / Primary Workflow Bar */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0e1526] via-[#121c33] to-[#091022] border border-[#1e2b48] p-6 shadow-2xl">
            <div className="pointer-events-none absolute -right-16 -top-16 w-80 h-80 bg-sky-500/10 blur-[100px] rounded-full" />
            <div className="pointer-events-none absolute left-1/3 -bottom-20 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono shadow-sm">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Powered by Google Gemma 4 Architecture</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Transform Unstructured Evidence into Grounded Intelligence
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  EvidenceOS extracts entities, timeline events, and relationship networks from digital custody files with 100% source quotation verification. Flag contradictory claims and export court-ready dossiers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={createSampleDemoInvestigation}
                  disabled={creating}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-sky-600/25 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Chimera Leak Demo</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#121c33] hover:bg-[#182442] border border-[#1e2b48] hover:border-sky-500/30 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>New Investigation</span>
                </button>
              </div>
            </div>

            {/* Workflow Step Indicators */}
            <div className="relative z-10 mt-6 pt-5 border-t border-[#1e2b48]/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="flex items-center gap-2.5 text-slate-400">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Create Case</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Upload TXT/PDF</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Analyze with Gemma 4</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-[10px]">4</span>
                <span>Explore Graph & Report</span>
              </div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#0e1526] border border-[#1e2b48] hover:border-sky-500/30 hover:bg-[#121c33]/70 transition-all shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] uppercase font-mono tracking-wider">Active Inquiries</span>
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <FolderLock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{investigations.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Managed investigations</div>
            </div>

            <div className="p-5 rounded-xl bg-[#0e1526] border border-[#1e2b48] hover:border-emerald-500/30 hover:bg-[#121c33]/70 transition-all shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] uppercase font-mono tracking-wider">Evidence Files</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{totalEvidence}</div>
              <div className="text-[11px] text-slate-400 mt-1">Parsed custody documents</div>
            </div>

            <div className="p-5 rounded-xl bg-[#0e1526] border border-[#1e2b48] hover:border-cyan-500/30 hover:bg-[#121c33]/70 transition-all shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] uppercase font-mono tracking-wider">Mapped Entities</span>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{totalEntities}</div>
              <div className="text-[11px] text-slate-400 mt-1">Persons, accounts & orgs</div>
            </div>

            <div className="p-5 rounded-xl bg-[#0e1526] border border-[#1e2b48] hover:border-amber-500/30 hover:bg-[#121c33]/70 transition-all shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] uppercase font-mono tracking-wider">Active Conflicts</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-400">{totalContradictions}</div>
              <div className="text-[11px] text-slate-400 mt-1">Contradictory claims flagged</div>
            </div>
          </div>

          {/* Recent Investigations Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Recent Investigations
                </h3>
                <p className="text-xs text-slate-400">
                  Select an inquiry to view intelligence network, timeline, and source citations.
                </p>
              </div>
              <Link
                href="/investigations"
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View all ({investigations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-mono">
                Loading intelligence records...
              </div>
            ) : investigations.length === 0 ? (
              <div className="p-12 border border-[#1e2b48] rounded-2xl bg-[#0e1526]/60 text-center space-y-3">
                <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-200">
                  No Investigations Created Yet
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Start by creating an investigation or launch the pre-packaged Operation Chimera leak demo.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={createSampleDemoInvestigation}
                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    Load Sample Demo Case
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#121c33] hover:bg-[#182442] text-slate-200 text-xs font-semibold rounded-lg border border-[#1e2b48] cursor-pointer"
                  >
                    Create Custom Case
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investigations.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/investigations/${inv.id}`}
                    className="p-5 rounded-xl bg-[#0e1526] border border-[#1e2b48] hover:border-sky-500/50 hover:bg-[#121c33] transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-sky-500/5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] text-slate-400">
                          {inv.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                            inv.status === "analyzed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                              : inv.status === "analyzing"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/25 animate-pulse"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/25"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-1">
                        {inv.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {inv.description || "No narrative overview provided."}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1e2b48]/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-3">
                        <span>{inv.stats?.evidence_count || 0} files</span>
                        <span>{inv.stats?.entity_count || 0} entities</span>
                      </div>
                      <span className="text-sky-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-sans text-xs">
                        Open <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Investigation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0e1526] border border-[#1e2b48] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100">
              Create New Investigation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Initialize an investigation workspace to hold custody documents and AI intelligence outputs.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Investigation Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Chimera Leak"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-[#1e2b48] rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Case Narrative / Scope (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of known allegations, origin, or key suspected entities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-[#1e2b48] rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2b48]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  {creating ? "Creating..." : "Create Investigation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
