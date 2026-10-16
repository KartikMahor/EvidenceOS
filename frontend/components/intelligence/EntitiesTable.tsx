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
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search entities or quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-[#0e1526] border border-[#1e2b48] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0e1526] border border-[#1e2b48] rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 cursor-pointer transition-all"
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
      <div className="border border-[#1e2b48] rounded-2xl overflow-hidden bg-[#0e1526] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e2b48] bg-[#080d1a] text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Entity Value</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Classification</th>
                <th className="py-3.5 px-4 font-semibold">Verbatim Supporting Quote</th>
                <th className="py-3.5 px-4 font-semibold">Sources</th>
                <th className="py-3.5 px-4 text-right font-semibold">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2b48]/60">
              {filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">
                    No matching entities found in evidence records.
                  </td>
                </tr>
              ) : (
                filteredEntities.map((ent) => {
                  const firstQuote = ent.source_quotes?.[0] || "No quote recorded";
                  return (
                    <tr
                      key={ent.id}
                      onClick={() => setSelectedEntity(ent)}
                      className="hover:bg-[#121c33] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                        {ent.value}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold bg-[#121c33] text-sky-400 border border-sky-500/25">
                          {ent.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {ent.classification || "source_stated"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-400 font-mono text-[11px] italic">
                        &quot;{firstQuote}&quot;
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {ent.source_evidence_ids?.length || 1} file(s)
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ent.needs_review ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Review Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0e1526] border border-[#1e2b48] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2b48] pb-3.5">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider">
                  {selectedEntity.type}
                </span>
                <h3 className="text-base font-semibold text-slate-100">
                  {selectedEntity.value}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#121c33] border border-[#1e2b48]">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Classification</span>
                  <span className="font-semibold text-slate-200 uppercase font-mono">
                    {selectedEntity.classification}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#121c33] border border-[#1e2b48]">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Verification Status</span>
                  <span className="font-semibold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
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
                      className="p-3 rounded-xl bg-[#080d1a] border border-[#1e2b48] text-xs font-mono text-sky-200/90 italic leading-relaxed"
                    >
                      &quot;{quote}&quot;
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-[#1e2b48] flex justify-end">
              <button
                onClick={() => setSelectedEntity(null)}
                className="px-4 py-2 bg-[#121c33] hover:bg-[#182442] border border-[#1e2b48] text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
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
