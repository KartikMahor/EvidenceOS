"use client";

import React from "react";
import { ArrowRight, Link2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Relationship, Entity } from "@/lib/types";

interface RelationshipsListProps {
  relationships: Relationship[];
  entities: Entity[];
}

export function RelationshipsList({
  relationships,
  entities,
}: RelationshipsListProps) {
  const entityMap = new Map(entities.map((e) => [e.id, e]));

  if (relationships.length === 0) {
    return (
      <div className="p-12 border border-[#1e2b48] rounded-2xl bg-[#0e1526]/70 text-center">
        <Link2 className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Entity Relationships Mapped
        </h4>
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Run Gemma 4 analysis to connect participants, organizations, and communication links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">
          Mapped Entity Relationships ({relationships.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {relationships.map((rel) => {
          const sourceEnt = entityMap.get(rel.source_entity_id);
          const targetEnt = entityMap.get(rel.target_entity_id);

          return (
            <div
              key={rel.id}
              className="p-5 rounded-2xl bg-[#0e1526] border border-[#1e2b48] hover:border-sky-500/40 hover:bg-[#121c33]/80 transition-all shadow-sm space-y-3"
            >
              {/* Relationship Header: Source -> Type -> Target */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                  <span className="px-3 py-1 rounded-xl bg-[#121c33] text-sky-400 font-semibold border border-[#1e2b48] shadow-sm">
                    {sourceEnt ? sourceEnt.value : rel.source_entity_id}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-[#080d1a] border border-[#1e2b48] text-sky-300">
                      {rel.type.replace("_", " ")}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-[#121c33] text-cyan-400 font-semibold border border-[#1e2b48] shadow-sm">
                    {targetEnt ? targetEnt.value : rel.target_entity_id}
                  </span>
                </div>

                {rel.needs_review ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                    <AlertTriangle className="w-3 h-3 text-amber-400" /> Needs Review
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded
                  </span>
                )}
              </div>

              {rel.description && (
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {rel.description}
                </p>
              )}

              {rel.source_quotes && rel.source_quotes.length > 0 && (
                <div className="pt-2 border-t border-[#1e2b48]/80">
                  <div className="text-xs text-sky-200/90 font-mono italic bg-[#080d1a] p-3 rounded-xl border border-[#1e2b48] leading-relaxed">
                    &quot;{rel.source_quotes[0]}&quot;
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
