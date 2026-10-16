"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { Entity } from "@/lib/types";

interface EntitiesTableProps {
  entities: Entity[];
}

export function EntitiesTable({ entities }: EntitiesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const entityTypes = Array.from(new Set(entities.map((e) => e.type)));

  const filteredEntities = entities.filter((e) => {
    const matchesSearch =
      e.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.source_quotes &&
        e.source_quotes.some((q) =>
          q.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    const matchesType = typeFilter === "all" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search entities or quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0c1220] border border-[#1e293b] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0c1220] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Entity Types ({entities.length})</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()} ({entities.filter((e) => e.type === t).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#1e293b] rounded-xl overflow-hidden bg-[#0c1220]/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#090d16] text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4">Entity Value</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Verbatim Supporting Quote</th>
                <th className="py-3 px-4">Sources</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No matching entities found.
                  </td>
                </tr>
              ) : (
                filteredEntities.map((ent) => {
                  const firstQuote = ent.source_quotes?.[0] || "No quote recorded";
                  return (
                    <tr
                      key={ent.id}
                      onClick={() => setSelectedEntity(ent)}
                      className="hover:bg-[#131c31]/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {ent.value}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-medium bg-[#131d31] text-sky-400 border border-sky-500/20">
                          {ent.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {ent.classification || "source_stated"}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-400 font-mono text-[11px] italic">
                        &quot;{firstQuote}&quot;
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {ent.source_evidence_ids?.length || 1} file(s)
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ent.needs_review ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Review Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Grounded
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Quote Inspector Modal */}
      {selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">
                  {selectedEntity.type}
                </span>
                <h3 className="text-base font-semibold text-slate-100">
                  {selectedEntity.value}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[#131c31] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Classification</span>
                  <span className="font-semibold text-slate-200 uppercase font-mono">
                    {selectedEntity.classification}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#131c31] border border-[#1e293b]">
                  <span className="text-[10px] text-slate-500 block uppercase">Verification Status</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    {selectedEntity.needs_review ? "Review Required" : "Grounded & Verified"}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Verbatim Supporting Evidence Quotes</span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedEntity.source_quotes?.map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs font-mono text-slate-200 italic leading-relaxed"
                    >
                      &quot;{quote}&quot;
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1e293b] flex justify-end">
              <button
                onClick={() => setSelectedEntity(null)}
                className="px-4 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded text-xs transition-colors"
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
