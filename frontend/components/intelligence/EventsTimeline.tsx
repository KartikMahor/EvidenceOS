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
      <div className="p-12 border border-[#1e2b48] rounded-2xl bg-[#0e1526]/70 text-center">
        <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-200">
          No Timeline Events Extracted
        </h4>
        <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
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

        <div className="relative pl-6 border-l-2 border-sky-500/30 space-y-6 ml-3">
          {datedEvents.map((evt, idx) => (
            <div key={evt.id} className="relative group">
              {/* Timeline Pin Node */}
              <div className="absolute -left-[31px] top-2 w-4 h-4 rounded-full bg-[#080d1a] border-2 border-sky-400 group-hover:scale-125 transition-transform shadow-md shadow-sky-500/30" />

              <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#1e2b48] hover:border-sky-500/40 hover:bg-[#121c33]/90 transition-all shadow-md hover:shadow-xl hover:shadow-sky-500/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm">
                      {evt.date}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Event #{idx + 1}
                    </span>
                  </div>

                  {evt.needs_review ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                      <AlertTriangle className="w-3 h-3 text-amber-400" /> Review Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded Fact
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-100 font-medium leading-relaxed">
                  {evt.description}
                </p>

                {evt.participant_entity_ids && evt.participant_entity_ids.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      Involved:
                    </span>
                    {evt.participant_entity_ids.map((pid, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-[#121c33] text-[10px] text-slate-300 font-mono border border-[#1e2b48]"
                      >
                        {pid}
                      </span>
                    ))}
                  </div>
                )}

                {evt.source_quotes && evt.source_quotes.length > 0 && (
                  <div className="pt-2 border-t border-[#1e2b48]/80">
                    <div className="text-xs text-sky-200/90 font-mono italic bg-[#080d1a] p-3 rounded-xl border border-[#1e2b48] leading-relaxed">
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
        <div className="pt-6 border-t border-[#1e2b48]">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Undated Occurrences ({undatedEvents.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              (Dates not explicitly cited in source evidence)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {undatedEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl bg-[#0e1526] border border-[#1e2b48] hover:border-sky-500/30 transition-all space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-300 uppercase bg-[#121c33] px-2.5 py-0.5 rounded-full border border-[#1e2b48]">
                    Undated Record
                  </span>
                  {evt.needs_review && (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Needs Review
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{evt.description}</p>
                {evt.source_quotes && evt.source_quotes.length > 0 && (
                  <p className="text-xs text-sky-200/90 font-mono italic bg-[#080d1a] p-2.5 rounded-lg border border-[#1e2b48] leading-relaxed">
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
