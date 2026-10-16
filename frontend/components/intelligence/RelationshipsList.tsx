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
      <div className="p-8 border border-[#1e293b] rounded-xl bg-[#0c1220]/60 text-center">
        <Link2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Entity Relationships Mapped
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Run Gemma 4 analysis to connect participants, organizations, and communication links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">
          Mapped Entity Relationships ({relationships.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {relationships.map((rel) => {
          const sourceEnt = entityMap.get(rel.source_entity_id);
          const targetEnt = entityMap.get(rel.target_entity_id);

          return (
            <div
              key={rel.id}
              className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all space-y-2.5"
            >
              {/* Relationship Header: Source -> Type -> Target */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded bg-[#131c31] text-sky-400 font-semibold border border-[#1e293b]">
                    {sourceEnt ? sourceEnt.value : rel.source_entity_id}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 font-semibold uppercase text-[10px]">
                    <span className="text-sky-300">[{rel.type.replace("_", " ")}]</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#131c31] text-cyan-400 font-semibold border border-[#1e293b]">
                    {targetEnt ? targetEnt.value : rel.target_entity_id}
                  </span>
                </div>

                {rel.needs_review ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> Needs Review
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Grounded
                  </span>
                )}
              </div>

              {rel.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rel.description}
                </p>
              )}

              {rel.source_quotes && rel.source_quotes.length > 0 && (
                <div className="pt-2 border-t border-[#1e293b]/60">
                  <div className="text-[11px] text-slate-400 font-mono italic bg-[#090d16] p-2.5 rounded border border-[#1e293b]">
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
