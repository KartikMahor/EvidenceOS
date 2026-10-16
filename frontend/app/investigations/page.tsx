"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderLock,
  Plus,
  Search,
  ArrowRight,
  FileText,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";
import { InvestigationListItem } from "@/lib/types";

export default function InvestigationsPage() {
  const router = useRouter();
  const [investigations, setInvestigations] = useState<InvestigationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

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

  const filtered = investigations.filter((inv) =>
    inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d1a] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Investigations Directory"
          subtitle="Case Files & Custody Records"
          onNewInvestigation={() => setShowCreateModal(true)}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Investigations" },
          ]}
        />

        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Bar with Search & Total Count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search investigations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#0e1526] border border-[#1e2b48] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
              />
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Total Inquiries: <span className="text-slate-100 font-semibold">{investigations.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs font-mono">
              Loading investigations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 border border-[#1e2b48] rounded-2xl bg-[#0e1526]/70 text-center space-y-3">
              <FolderLock className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-200">
                No Investigations Found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                No cases match your search query or no cases have been created yet.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                Create Investigation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((inv) => (
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
        </main>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0e1526] border border-[#1e2b48] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100">
              Create New Investigation
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Investigation Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Financial Embezzlement Audit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-[#1e2b48] rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Scope / Narrative Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Description of incident or scope..."
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
