"use client";

import { FormEvent, useState } from "react";
import { useToast } from "@/components/Toast";
import { DURATION_OPTIONS, TIME_OPTIONS, todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Inserat } from "@/lib/types";

type SlotFormProps = {
  inserat: Inserat;
  onSaved: () => void;
  onCancel: () => void;
};

export function SlotForm({ inserat, onSaved, onCancel }: SlotFormProps) {
  const { showToast } = useToast();
  const [datum, setDatum] = useState(todayISO());
  const [uhrzeit, setUhrzeit] = useState("10:00");
  const [dauerMinuten, setDauerMinuten] = useState(30);
  const [kapazitaet, setKapazitaet] = useState(1);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from("besichtigungsslots").insert({
      inserat_id: inserat.id,
      adresse: inserat.adresse,
      datum,
      uhrzeit: `${uhrzeit}:00`,
      dauer_minuten: dauerMinuten,
      kapazitaet,
    });

    setSaving(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Termin erfolgreich angelegt");
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded border border-dash-border bg-dash-bg p-4"
    >
      <p className="mb-3 text-sm font-medium text-dash-text">Neuen Termin hinzufügen</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-dash-muted">Datum</label>
          <input
            type="date"
            required
            min={todayISO()}
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="w-full rounded border border-dash-border bg-dash-card px-2 py-1.5 text-sm text-dash-text"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-dash-muted">Uhrzeit</label>
          <select
            value={uhrzeit}
            onChange={(e) => setUhrzeit(e.target.value)}
            className="w-full rounded border border-dash-border bg-dash-card px-2 py-1.5 text-sm text-dash-text"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-dash-muted">Dauer (Min.)</label>
          <select
            value={dauerMinuten}
            onChange={(e) => setDauerMinuten(Number(e.target.value))}
            className="w-full rounded border border-dash-border bg-dash-card px-2 py-1.5 text-sm text-dash-text"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} Min.
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-dash-muted">Kapazität</label>
          <input
            type="number"
            min={1}
            max={20}
            required
            value={kapazitaet}
            onChange={(e) => setKapazitaet(Number(e.target.value))}
            className="w-full rounded border border-dash-border bg-dash-card px-2 py-1.5 text-sm text-dash-text"
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-dash-accent px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Speichern…" : "Speichern"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-dash-border px-4 py-2 text-sm text-dash-muted hover:text-dash-text"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
