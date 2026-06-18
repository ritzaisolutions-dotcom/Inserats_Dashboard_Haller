"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LeadCard } from "@/components/LeadCard";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { SkeletonList } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import type { Inserat, Lead } from "@/lib/types";

export default function NotificationsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inserateMap, setInserateMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const [leadsRes, inserateRes] = await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("status", "analyse_abgeschlossen")
        .is("entscheidung_at", null)
        .not("mindestanforderung_ok", "is", null)
        .order("dokumente_eingereicht_at", { ascending: false })
        .limit(50),
      supabase.from("inserate").select("is24_inserat_id, titel"),
    ]);

    if (leadsRes.error) {
      setError(leadsRes.error.message);
      setLeads([]);
    } else {
      setLeads((leadsRes.data as Lead[]) ?? []);
    }

    if (inserateRes.data) {
      const map: Record<string, string> = {};
      for (const row of inserateRes.data as Pick<Inserat, "is24_inserat_id" | "titel">[]) {
        map[row.is24_inserat_id] = row.titel;
      }
      setInserateMap(map);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const grouped = useMemo(() => {
    const map = new Map<string, Lead[]>();
    for (const lead of leads) {
      const list = map.get(lead.inserat_id) ?? [];
      list.push(lead);
      map.set(lead.inserat_id, list);
    }
    return Array.from(map.entries());
  }, [leads]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dash-text">Benachrichtigungen</h1>

      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : grouped.length === 0 ? (
        <p className="rounded border border-dash-border bg-dash-card p-8 text-center text-sm text-dash-muted">
          Keine neuen Bewerbungen zur Prüfung.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([inseratId, groupLeads]) => (
            <section key={inseratId}>
              <h2 className="mb-3 text-sm font-medium text-dash-muted">
                {inserateMap[inseratId] ?? inseratId}
              </h2>
              <div className="space-y-3">
                {groupLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDecision={() => loadData()}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
