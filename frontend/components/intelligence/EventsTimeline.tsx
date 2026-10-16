"use client";

import React from "react";
import { Calendar, Clock, FileText, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { Event } from "@/lib/types";

interface EventsTimelineProps {
  events: Event[];
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  const datedEvents = events
    .filter((e) => e.date && e.date.trim() !== "")
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const undatedEvents = events.filter((e) => !e.date || e.date.trim() === "");

  if (events.length === 0) {
    return (
      <div className="p-8 border border-[#1e293b] rounded-xl bg-[#0c1220]/60 text-center">
        <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Timeline Events Extracted
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Run Gemma 4 analysis on uploaded evidence files to reconstruct the chronological event sequence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dated Events Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Chronological Sequence ({datedEvents.length} events)
          </h3>
        </div>

        <div className="relative pl-6 border-l-2 border-sky-500/30 space-y-8 ml-3">
          {datedEvents.map((evt, idx) => (
            <div key={evt.id} className="relative group">
              {/* Timeline Pin Node */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0c1220] border-2 border-sky-400 group-hover:scale-125 transition-transform shadow-md shadow-sky-500/20" />

              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all shadow-sm space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {evt.date}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Event #{idx + 1}
                    </span>
                  </div>

                  {evt.needs_review ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" /> Review Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Grounded Fact
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {evt.description}
                </p>

                {evt.participant_entity_ids && evt.participant_entity_ids.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      Involved:
                    </span>
                    {evt.participant_entity_ids.map((pid, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#131c31] text-[10px] text-slate-300 font-mono border border-[#1e293b]"
                      >
                        {pid}
                      </span>
                    ))}
                  </div>
                )}

                {evt.source_quotes && evt.source_quotes.length > 0 && (
                  <div className="pt-2 border-t border-[#1e293b]/60">
                    <div className="text-[11px] text-slate-400 font-mono italic bg-[#090d16] p-2.5 rounded border border-[#1e293b]">
                      &quot;{evt.source_quotes[0]}&quot;
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Undated Events Section */}
      {undatedEvents.length > 0 && (
        <div className="pt-4 border-t border-[#1e293b]">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-300">
              Undated Occurrences ({undatedEvents.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              (Dates not explicitly cited in source evidence)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {undatedEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-[#0c1220] border border-[#1e293b] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase bg-[#131c31] px-2 py-0.5 rounded">
                    Undated Record
                  </span>
                  {evt.needs_review && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      Needs Review
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{evt.description}</p>
                {evt.source_quotes && evt.source_quotes.length > 0 && (
                  <p className="text-[10px] text-slate-400 font-mono italic bg-[#090d16] p-2 rounded border border-[#1e293b]/60">
                    &quot;{evt.source_quotes[0]}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
