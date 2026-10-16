"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FolderLock,
  UploadCloud,
  Sparkles,
  Network,
  Users,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Link2,
  FileText,
  Printer,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UploadModal } from "@/components/evidence/UploadModal";
import { EvidenceFileList } from "@/components/evidence/EvidenceFileList";
import { IntelligenceGraph } from "@/components/intelligence/IntelligenceGraph";
import { EntitiesTable } from "@/components/intelligence/EntitiesTable";
import { EventsTimeline } from "@/components/intelligence/EventsTimeline";
import { ClaimsList } from "@/components/intelligence/ClaimsList";
import { RelationshipsList } from "@/components/intelligence/RelationshipsList";
import { ContradictionsPanel } from "@/components/intelligence/ContradictionsPanel";
import { ReportView } from "@/components/reports/ReportView";
import { api } from "@/lib/api";
import { InvestigationDetail, GraphResponse } from "@/lib/types";

function InvestigationWorkspaceContent() {
  const router = useRouter();
  const routeParams = useParams();
  const investigationId = (routeParams?.id as string) || "";

  const [investigation, setInvestigation] = useState<InvestigationDetail | null>(null);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "graph"
    | "entities"
    | "timeline"
    | "contradictions"
    | "claims"
    | "relationships"
    | "evidence"
    | "report"
  >("graph");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const loadInvestigation = async () => {
    try {
      const data = await api.getInvestigation(investigationId);
      setInvestigation(data);

      // Also load graph data
      try {
        const gData = await api.getInvestigationGraph(investigationId);
        setGraphData(gData);
      } catch {
        // graph may be empty initially
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "Failed to load investigation details.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestigation();
  }, [investigationId]);

  const handleRunAnalysis = async () => {
    if (!investigation) return;
    if (investigation.evidence_files.length === 0) {
      setShowUploadModal(true);
      setNotification({
        type: "info",
        message: "Please upload at least one evidence file before running AI analysis.",
      });
      return;
    }

    setAnalyzing(true);
    setNotification(null);

    try {
      const result = await api.analyzeInvestigation(investigationId);
      setNotification({
        type: "success",
        message: `Gemma 4 extracted ${result.entities_count} entities, ${result.events_count} events, and flagged ${result.contradictions_count} contradiction(s).`,
      });
      await loadInvestigation();
      setActiveTab("graph");
    } catch (err: any) {
      setNotification({
        type: "error",
        message: "Analysis failed: " + (err?.message || "Server error"),
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this investigation and all custody files?")) {
      return;
    }
    try {
      await api.deleteInvestigation(investigationId);
      router.push("/investigations");
    } catch (err: any) {
      alert("Failed to delete investigation: " + err?.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#080d1a] text-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-xs font-mono text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-sky-400" />
          Loading investigation workspace...
        </div>
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="flex h-screen bg-[#080d1a] text-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <FolderLock className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-200">Investigation Not Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            The requested investigation does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/investigations")}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Back to Investigations
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "graph", label: "Intelligence Graph", icon: Network, badge: investigation.entities.length },
    { id: "entities", label: "Entities", icon: Users, badge: investigation.entities.length },
    { id: "timeline", label: "Timeline", icon: Calendar, badge: investigation.events.length },
    { id: "contradictions", label: "Contradictions", icon: AlertTriangle, badge: investigation.contradictions.length, alert: investigation.stats.unresolved_contradictions > 0 },
    { id: "claims", label: "Claims", icon: MessageSquare, badge: investigation.claims.length },
    { id: "relationships", label: "Relationships", icon: Link2, badge: investigation.relationships.length },
    { id: "evidence", label: "Evidence Files", icon: FileText, badge: investigation.evidence_files.length },
    { id: "report", label: "Report Export", icon: Printer },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d1a] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={investigation.title}
          subtitle={`Case ID: ${investigation.id}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Investigations", href: "/investigations" },
            { label: investigation.title },
          ]}
        />

        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Notification Alert Banner */}
          {notification && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 backdrop-blur-md ${
                notification.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  : notification.type === "error"
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
                  : "bg-sky-500/10 border-sky-500/25 text-sky-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                {notification.type === "error" && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
                {notification.type === "info" && <Info className="w-4 h-4 shrink-0 text-sky-400" />}
                <span className="font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Investigation Action Header */}
          <div className="p-6 rounded-2xl bg-[#0e1526] border border-[#1e2b48] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-slate-300 bg-[#121c33] px-2.5 py-0.5 rounded-full border border-[#1e2b48]">
                  {investigation.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                    investigation.status === "analyzed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                      : investigation.status === "analyzing"
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/25 animate-pulse"
                      : "bg-slate-500/10 text-slate-400 border border-slate-500/25"
                  }`}
                >
                  {investigation.status}
                </span>
                {investigation.stats.unresolved_contradictions > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {investigation.stats.unresolved_contradictions} Unresolved Discrepancies
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white">
                {investigation.title}
              </h2>

              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                {investigation.description || "No narrative overview provided."}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121c33] hover:bg-[#182442] border border-[#1e2b48] hover:border-sky-500/30 text-slate-200 text-xs font-medium transition-all shadow-sm cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-sky-400" />
                <span>Upload Evidence ({investigation.evidence_files.length})</span>
              </button>

              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-sky-600/25 transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting Intelligence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{investigation.status === "analyzed" ? "Re-Analyze with Gemma 4" : "Run Gemma 4 Analysis"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDelete}
                title="Delete Investigation"
                className="p-2 rounded-xl bg-[#121c33] hover:bg-rose-500/20 border border-[#1e2b48] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-[#1e2b48] flex items-center gap-1 overflow-x-auto scrollbar-none pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-medium transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-sky-400 text-sky-400 bg-sky-500/10 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121c33]/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        tab.alert
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold"
                          : "bg-[#121c33] text-slate-400 border-[#1e2b48]"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {activeTab === "graph" && (
              <IntelligenceGraph
                graphData={graphData}
                onRefresh={loadInvestigation}
              />
            )}

            {activeTab === "entities" && (
              <EntitiesTable entities={investigation.entities} />
            )}

            {activeTab === "timeline" && (
              <EventsTimeline events={investigation.events} />
            )}

            {activeTab === "contradictions" && (
              <ContradictionsPanel
                investigationId={investigation.id}
                contradictions={investigation.contradictions}
                onUpdate={loadInvestigation}
              />
            )}

            {activeTab === "claims" && (
              <ClaimsList claims={investigation.claims} />
            )}

            {activeTab === "relationships" && (
              <RelationshipsList
                relationships={investigation.relationships}
                entities={investigation.entities}
              />
            )}

            {activeTab === "evidence" && (
              <EvidenceFileList
                investigationId={investigation.id}
                files={investigation.evidence_files}
                onUploadClick={() => setShowUploadModal(true)}
              />
            )}

            {activeTab === "report" && (
              <ReportView investigation={investigation} />
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        investigationId={investigation.id}
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          loadInvestigation();
          setNotification({
            type: "success",
            message: "Evidence files uploaded and parsed successfully. Click 'Run Gemma 4 Analysis' to extract intelligence.",
          });
        }}
      />
    </div>
  );
}

export default function InvestigationWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-[#080d1a] text-slate-100 font-sans items-center justify-center text-xs font-mono text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-sky-400" />
          Loading workspace...
        </div>
      }
    >
      <InvestigationWorkspaceContent />
    </Suspense>
  );
}
