"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import {
  User,
  AtSign,
  Phone,
  Mail,
  Building2,
  MapPin,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  FileText,
  X,
  ExternalLink,
  Layers,
} from "lucide-react";
import { GraphResponse, GraphNode, GraphEdge } from "@/lib/types";

// Icon & Accent Color mapping by entity type
const TYPE_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  person: {
    label: "Person",
    icon: User,
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.4)",
  },
  username: {
    label: "Username",
    icon: AtSign,
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.12)",
    border: "rgba(192, 132, 252, 0.4)",
  },
  phone: {
    label: "Phone",
    icon: Phone,
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.4)",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.4)",
  },
  organization: {
    label: "Organization",
    icon: Building2,
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.12)",
    border: "rgba(96, 165, 250, 0.4)",
  },
  location: {
    label: "Location",
    icon: MapPin,
    color: "#f87171",
    bg: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.4)",
  },
  financial: {
    label: "Financial",
    icon: CreditCard,
    color: "#2dd4bf",
    bg: "rgba(45, 212, 191, 0.12)",
    border: "rgba(45, 212, 191, 0.4)",
  },
  other: {
    label: "Entity",
    icon: HelpCircle,
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.12)",
    border: "rgba(148, 163, 184, 0.4)",
  },
};

// Custom React Flow Node Component
function CustomEntityNode({ data, selected }: NodeProps) {
  const config = TYPE_CONFIG[data.type as string] || TYPE_CONFIG.other;
  const Icon = config.icon;

  return (
    <div
      style={{
        backgroundColor: "#0d1424",
        borderColor: selected ? "#38bdf8" : config.border,
        boxShadow: selected
          ? "0 0 0 2px rgba(56, 189, 248, 0.5), 0 10px 25px rgba(0, 0, 0, 0.6)"
          : "0 4px 14px rgba(0, 0, 0, 0.4)",
      }}
      className={`px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer min-w-[150px] max-w-[220px] ${
        selected ? "scale-105" : "hover:border-slate-500"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-sky-400 !w-2 !h-2" />
      
      <div className="flex items-center gap-2 mb-1.5">
        <div
          style={{ backgroundColor: config.bg, color: config.color }}
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span
          style={{ color: config.color }}
          className="text-[10px] uppercase font-mono font-bold tracking-wider"
        >
          {config.label}
        </span>
        {data.needsReview ? (
          <span className="ml-auto" title="Requires human review">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          </span>
        ) : (
          <span className="ml-auto" title="Source Grounded">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </span>
        )}
      </div>

      <div className="font-semibold text-xs text-slate-100 truncate">
        {String(data.label || "")}
      </div>

      {data.sourceCount !== undefined && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-[#1e293b]/70 font-mono">
          <span>{Number(data.sourceCount)} source{Number(data.sourceCount) === 1 ? "" : "s"}</span>
          <span className="text-slate-400">{String(data.classification || "verified")}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-sky-400 !w-2 !h-2" />
    </div>
  );
}

interface IntelligenceGraphProps {
  graphData: GraphResponse | null;
  onRefresh?: () => void;
}

export function IntelligenceGraph({ graphData }: IntelligenceGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedItem, setSelectedItem] = useState<{
    type: "node" | "edge";
    data: any;
  } | null>(null);

  const nodeTypes = useMemo(() => ({ customEntity: CustomEntityNode }), []);

  useEffect(() => {
    if (graphData) {
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
    }
  }, [graphData, setNodes, setEdges]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedItem({ type: "node", data: node.data });
  }, []);

  const onEdgeClick = useCallback((_: any, edge: any) => {
    setSelectedItem({ type: "edge", data: edge.data || { label: edge.label } });
  }, []);

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="h-[520px] rounded-xl border border-[#1e293b] bg-[#090d16] flex flex-col items-center justify-center p-6 text-center">
        <Layers className="w-12 h-12 text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Graph Intelligence Yet
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Upload digital evidence and run Gemma 4 analysis to generate the intelligence network graph.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[620px] rounded-xl border border-[#1e293b] overflow-hidden bg-[#090d16]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-[#131c31] !border-[#1e293b]" />
        <MiniMap
          nodeColor={(n) => {
            const cfg = TYPE_CONFIG[n.data?.type as string] || TYPE_CONFIG.other;
            return cfg.color;
          }}
          maskColor="rgba(9, 13, 22, 0.8)"
          className="!bg-[#0c1220] !border-[#1e293b] !rounded-lg"
        />

        {/* Legend Panel */}
        <Panel position="top-left" className="bg-[#0f172a]/90 backdrop-blur-md p-3 rounded-lg border border-[#1e293b] shadow-xl text-xs space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Entity Legend ({graphData.nodes.length} nodes, {graphData.edges.length} edges)
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            {Object.entries(TYPE_CONFIG).slice(0, 6).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    style={{ backgroundColor: cfg.color }}
                    className="w-2 h-2 rounded-full inline-block shrink-0"
                  />
                  <span className="text-slate-300">{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </ReactFlow>

      {/* Detail Drawer Panel */}
      {selectedItem && (
        <div className="absolute top-4 right-4 bottom-4 w-80 bg-[#0f172a]/95 backdrop-blur-md border border-[#1e293b] rounded-xl shadow-2xl p-4 flex flex-col justify-between overflow-hidden z-30 animate-in slide-in-from-right-4 duration-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                {selectedItem.type === "node" ? "Entity Dossier" : "Relationship Details"}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 overflow-y-auto max-h-[460px]">
              {selectedItem.type === "node" ? (
                <>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-500">
                      Entity Value
                    </div>
                    <div className="text-base font-semibold text-slate-100">
                      {selectedItem.data.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-[#131c31] border border-[#1e293b]">
                      <span className="text-[10px] text-slate-500 block uppercase">Type</span>
                      <span className="font-semibold text-slate-200 uppercase font-mono">
                        {selectedItem.data.type}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-[#131c31] border border-[#1e293b]">
                      <span className="text-[10px] text-slate-500 block uppercase">Provenance</span>
                      <span className="font-semibold text-slate-200 uppercase font-mono">
                        {selectedItem.data.classification || "Source Stated"}
                      </span>
                    </div>
                  </div>

                  {selectedItem.data.sourceQuotes && selectedItem.data.sourceQuotes.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Verbatim Source Quotations ({selectedItem.data.sourceQuotes.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedItem.data.sourceQuotes.map((q: string, i: number) => (
                          <div
                            key={i}
                            className="p-2.5 rounded bg-[#090d16] border border-[#1e293b] text-xs font-mono text-slate-300 italic leading-relaxed"
                          >
                            &quot;{q}&quot;
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-500">
                      Relationship Type
                    </div>
                    <div className="text-sm font-semibold text-sky-400 font-mono">
                      {selectedItem.data.type || "Connection"}
                    </div>
                  </div>

                  {selectedItem.data.description && (
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-500">
                        Description
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed mt-1">
                        {selectedItem.data.description}
                      </div>
                    </div>
                  )}

                  {selectedItem.data.sourceQuotes && selectedItem.data.sourceQuotes.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Supporting Quotation</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#090d16] border border-[#1e293b] text-xs font-mono text-slate-300 italic leading-relaxed">
                        &quot;{selectedItem.data.sourceQuotes[0]}&quot;
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1e293b] text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Grounded EvidenceOS Intelligence
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
