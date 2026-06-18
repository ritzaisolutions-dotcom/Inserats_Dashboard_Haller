"use client";

import { ExternalLink, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SlotForm } from "@/components/SlotForm";
import { SlotTable } from "@/components/SlotTable";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { SkeletonList } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import type { Besichtigungsslot, Inserat } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  const isAktiv = status === "aktiv";
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] uppercase ${
        isAktiv
          ? "bg-dash-success/20 text-dash-success"
          : "bg-dash-muted/20 text-dash-muted"
      }`}
    >
      {status}
    </span>
  );
}

export default function InserateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [inserate, setInserate] = useState<Inserat[]>([]);
  const [slots, setSlots] = useState<Besichtigungsslot[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const selected = inserate.find((i) => i.id === selectedId) ?? null;

  const loadInserate = useCallback(async () => {
    setLoadingList(true);
    setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("inserate")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
      setInserate([]);
    } else {
      setInserate((data as Inserat[]) ?? []);
    }
    setLoadingList(false);
  }, []);

  const loadSlots = useCallback(async (inseratId: string) => {
    setLoadingSlots(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("besichtigungsslots")
      .select("*")
      .eq("inserat_id", inseratId)
      .order("datum", { ascending: true })
      .order("uhrzeit", { ascending: true });

    if (err) {
      setError(err.message);
      setSlots([]);
    } else {
      setSlots((data as Besichtigungsslot[]) ?? []);
    }
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    loadInserate();
  }, [loadInserate]);

  useEffect(() => {
    if (selectedId) {
      loadSlots(selectedId);
    } else {
      setSlots([]);
    }
  }, [selectedId, loadSlots]);

  useEffect(() => {
    if (!loadingList && inserate.length > 0 && !selectedId) {
      router.replace(`/inserate?id=${inserate[0].id}`);
    }
  }, [loadingList, inserate, selectedId, router]);

  function selectInserat(id: string) {
    setShowForm(false);
    router.push(`/inserate?id=${id}`);
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-0 overflow-hidden rounded border border-dash-border">
      <aside className="w-[320px] shrink-0 overflow-y-auto border-r border-dash-border bg-dash-card">
        <div className="border-b border-dash-border p-4">
          <h1 className="text-lg font-bold text-dash-text">Inserate</h1>
        </div>
        <div className="p-3">
          {loadingList ? (
            <SkeletonList count={3} />
          ) : error && inserate.length === 0 ? (
            <ErrorCard message={error} />
          ) : inserate.length === 0 ? (
            <p className="p-4 text-sm text-dash-muted">
              Keine Inserate vorhanden. Werden automatisch von ImmoScout24 importiert.
            </p>
          ) : (
            <div className="space-y-2">
              {inserate.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectInserat(item.id)}
                  className={`w-full rounded border p-3 text-left transition-colors ${
                    selectedId === item.id
                      ? "border-l-4 border-l-dash-accent border-dash-accent/50 bg-dash-bg"
                      : "border-dash-border hover:border-dash-accent/30"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="font-bold text-dash-text">{item.titel}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mb-1 text-xs text-dash-muted">{item.adresse}</p>
                  <p className="text-xs text-dash-muted">
                    {item.zimmer} Zi. · {item.flaeche_qm}m² · {item.kaltmiete_eur}€
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto bg-dash-bg p-6">
        {!selected ? (
          <p className="text-sm text-dash-muted">Inserat auswählen…</p>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-bold text-dash-text">{selected.titel}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-dash-muted">Adresse</span>
                  <p className="text-dash-text">{selected.adresse}</p>
                </div>
                <div>
                  <span className="text-dash-muted">Zimmer</span>
                  <p className="text-dash-text">{selected.zimmer}</p>
                </div>
                <div>
                  <span className="text-dash-muted">Fläche</span>
                  <p className="text-dash-text">{selected.flaeche_qm} m²</p>
                </div>
                <div>
                  <span className="text-dash-muted">Kaltmiete</span>
                  <p className="text-dash-text">{selected.kaltmiete_eur} €</p>
                </div>
              </div>
              {selected.is24_url ? (
                <a
                  href={selected.is24_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded bg-dash-accent px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  <ExternalLink className="h-4 w-4" />
                  ImmoScout24 ansehen
                </a>
              ) : null}
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-dash-text">Besichtigungstermine</h3>
                {!showForm ? (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-1 rounded bg-dash-accent/20 px-3 py-1.5 text-sm text-dash-accent hover:bg-dash-accent/30"
                  >
                    <Plus className="h-4 w-4" />
                    Neuen Termin hinzufügen
                  </button>
                ) : null}
              </div>

              {loadingSlots ? (
                <SkeletonList count={2} />
              ) : (
                <SlotTable
                  slots={slots}
                  onDeleted={() => loadSlots(selected.id)}
                />
              )}

              {showForm ? (
                <SlotForm
                  inserat={selected}
                  onSaved={() => {
                    setShowForm(false);
                    loadSlots(selected.id);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
