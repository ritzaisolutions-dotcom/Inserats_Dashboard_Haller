"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LeadCard } from "@/components/LeadCard";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { SkeletonList } from "@/components/ui/Skeleton";
import {
  addDaysISO,
  formatDateHeaderDE,
  formatTime,
  isTomorrow,
  isWithin24Hours,
  todayISO,
} from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { BesichtigungsslotWithInserat, Lead, SlotStatusFilter } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    frei: "bg-dash-success/20 text-dash-success",
    reserviert: "bg-dash-warning/20 text-dash-warning",
    confirmed: "bg-dash-accent/20 text-dash-accent",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs ${styles[status] ?? "text-dash-muted"}`}
    >
      {status}
    </span>
  );
}

export default function TerminePage() {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(addDaysISO(30));
  const [statusFilter, setStatusFilter] = useState<SlotStatusFilter>("all");
  const [slots, setSlots] = useState<BesichtigungsslotWithInserat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [leadsByInserat, setLeadsByInserat] = useState<Record<string, Lead[]>>({});

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("besichtigungsslots")
      .select("*, inserate(titel, is24_inserat_id)")
      .gte("datum", from)
      .lte("datum", to)
      .order("datum", { ascending: true })
      .order("uhrzeit", { ascending: true });

    if (err) {
      setError(err.message);
      setSlots([]);
    } else {
      setSlots((data as BesichtigungsslotWithInserat[]) ?? []);
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return slots;
    return slots.filter((s) => s.slot_status === statusFilter);
  }, [slots, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, BesichtigungsslotWithInserat[]>();
    for (const slot of filtered) {
      const list = map.get(slot.datum) ?? [];
      list.push(slot);
      map.set(slot.datum, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  async function toggleExpand(slot: BesichtigungsslotWithInserat) {
    const is24Id = slot.inserate?.is24_inserat_id;
    if (!is24Id) return;

    if (expanded[slot.id]) {
      setExpanded((prev) => ({ ...prev, [slot.id]: false }));
      return;
    }

    if (!leadsByInserat[is24Id]) {
      const supabase = createClient();
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("inserat_id", is24Id)
        .in("status", ["qualifiziert", "termin_bestaetigt"]);

      setLeadsByInserat((prev) => ({
        ...prev,
        [is24Id]: (data as Lead[]) ?? [],
      }));
    }

    setExpanded((prev) => ({ ...prev, [slot.id]: true }));
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dash-text">Termine</h1>

      <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-end gap-4 rounded border border-dash-border bg-dash-card p-4">
        <div>
          <label className="mb-1 block text-xs text-dash-muted">Von</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-dash-border bg-dash-bg px-3 py-1.5 text-sm text-dash-text"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-dash-muted">Bis</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded border border-dash-border bg-dash-bg px-3 py-1.5 text-sm text-dash-text"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-dash-muted">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SlotStatusFilter)}
            className="rounded border border-dash-border bg-dash-bg px-3 py-1.5 text-sm text-dash-text"
          >
            <option value="all">Alle</option>
            <option value="frei">frei</option>
            <option value="reserviert">reserviert</option>
            <option value="confirmed">confirmed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : grouped.length === 0 ? (
        <p className="text-sm text-dash-muted">Keine Termine im gewählten Zeitraum.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([datum, daySlots]) => (
            <section key={datum}>
              <h2 className="mb-3 text-sm font-medium capitalize text-dash-muted">
                {formatDateHeaderDE(datum)}
              </h2>
              <div className="space-y-3">
                {daySlots.map((slot) => {
                  const urgent =
                    isWithin24Hours(slot.datum, slot.uhrzeit) || isTomorrow(slot.datum);
                  const pct =
                    slot.kapazitaet > 0
                      ? Math.min(100, (slot.belegt / slot.kapazitaet) * 100)
                      : 0;
                  const is24Id = slot.inserate?.is24_inserat_id ?? "";
                  const leads = leadsByInserat[is24Id] ?? [];

                  return (
                    <div
                      key={slot.id}
                      className={`rounded border border-dash-border bg-dash-card p-4 ${
                        urgent ? "border-l-4 border-l-dash-warning" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="rounded-full bg-dash-accent/20 px-3 py-1 text-xs text-dash-accent">
                          {formatTime(slot.uhrzeit)} · {slot.dauer_minuten} Min.
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <p className="font-medium text-dash-text">
                            {slot.inserate?.titel ?? "—"}
                          </p>
                          <p className="text-xs text-dash-muted">{slot.adresse}</p>
                        </div>
                        <div className="w-32">
                          <p className="mb-1 text-xs text-dash-muted">
                            {slot.belegt}/{slot.kapazitaet}
                          </p>
                          <div className="h-1.5 overflow-hidden rounded-full bg-dash-border">
                            <div
                              className="h-full bg-dash-accent"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <StatusBadge status={slot.slot_status} />
                        {urgent ? (
                          <span className="rounded bg-dash-warning/20 px-2 py-0.5 text-xs text-dash-warning">
                            ⚠ Morgen
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => toggleExpand(slot)}
                          className="rounded p-1 text-dash-muted hover:text-dash-text"
                        >
                          {expanded[slot.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {expanded[slot.id] ? (
                        <div className="mt-3 pl-2">
                          <p className="mb-2 text-xs text-dash-muted">Gebuchte Leads</p>
                          {leads.length === 0 ? (
                            <p className="text-xs text-dash-muted">Keine Leads</p>
                          ) : (
                            leads.map((lead) => (
                              <LeadCard key={lead.id} lead={lead} mode="compact" />
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
