"use client";

import { Trash2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import { formatDateDE, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Besichtigungsslot } from "@/lib/types";

type SlotTableProps = {
  slots: Besichtigungsslot[];
  onDeleted: () => void;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    frei: "bg-dash-success/20 text-dash-success",
    reserviert: "bg-dash-warning/20 text-dash-warning",
    confirmed: "bg-dash-accent/20 text-dash-accent",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs capitalize ${
        styles[status] ?? "bg-dash-muted/20 text-dash-muted"
      }`}
    >
      {status}
    </span>
  );
}

export function SlotTable({ slots, onDeleted }: SlotTableProps) {
  const { showToast } = useToast();

  async function handleDelete(slot: Besichtigungsslot) {
    if (slot.belegt > 0) return;
    if (!confirm("Termin wirklich löschen?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("besichtigungsslots")
      .delete()
      .eq("id", slot.id);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Termin gelöscht");
    onDeleted();
  }

  if (slots.length === 0) {
    return (
      <p className="py-4 text-sm text-dash-muted">Keine Besichtigungstermine angelegt.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dash-border text-left text-xs text-dash-muted">
            <th className="pb-2 pr-4">Datum</th>
            <th className="pb-2 pr-4">Uhrzeit</th>
            <th className="pb-2 pr-4">Dauer</th>
            <th className="pb-2 pr-4">Kapazität</th>
            <th className="pb-2 pr-4">Belegt</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id} className="border-b border-dash-border/50">
              <td className="py-2.5 pr-4">{formatDateDE(slot.datum)}</td>
              <td className="py-2.5 pr-4">{formatTime(slot.uhrzeit)}</td>
              <td className="py-2.5 pr-4">{slot.dauer_minuten} Min.</td>
              <td className="py-2.5 pr-4">{slot.kapazitaet}</td>
              <td className="py-2.5 pr-4">{slot.belegt}</td>
              <td className="py-2.5 pr-4">
                <StatusBadge status={slot.slot_status} />
              </td>
              <td className="py-2.5">
                {slot.belegt === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(slot)}
                    className="rounded p-1.5 text-dash-muted hover:bg-dash-danger/20 hover:text-dash-danger"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="text-xs text-dash-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
