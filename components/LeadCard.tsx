"use client";

import { useState } from "react";
import {
  formatDateTimeDE,
  formatRelativeDE,
} from "@/lib/format";
import type { Lead } from "@/lib/types";

type LeadCardProps = {
  lead: Lead;
  mode?: "notification" | "compact";
  onDecision?: (uuid: string) => void;
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  let color = "bg-dash-danger/20 text-dash-danger";
  if (score >= 80) color = "bg-dash-success/20 text-dash-success";
  else if (score >= 60) color = "bg-dash-warning/20 text-dash-warning";

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      Score: {score}
    </span>
  );
}

export function LeadCard({
  lead,
  mode = "notification",
  onDecision,
}: LeadCardProps) {
  const [loading, setLoading] = useState<"go" | "nogo" | null>(null);
  const [localDecided, setLocalDecided] = useState(false);
  const [localDecidedAt, setLocalDecidedAt] = useState<string | null>(null);

  const decidedAt = lead.entscheidung_at ?? localDecidedAt;
  const pending = !lead.entscheidung_at && !localDecided;

  async function handleDecision(entscheidung: "go" | "nogo") {
    setLoading(entscheidung);
    try {
      const res = await fetch(
        `/api/hitl?uuid=${encodeURIComponent(lead.uuid)}&entscheidung=${entscheidung}`,
      );
      if (!res.ok) throw new Error("Webhook fehlgeschlagen");
      setLocalDecided(true);
      setLocalDecidedAt(new Date().toISOString());
      onDecision?.(lead.uuid);
    } catch {
      alert("Entscheidung konnte nicht übermittelt werden.");
    } finally {
      setLoading(null);
    }
  }

  if (mode === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-4 border-t border-dash-border/50 py-2 text-sm">
        <span className="font-medium text-dash-text">{lead.name}</span>
        <span className="text-dash-muted">{lead.email}</span>
        <span className="text-dash-muted">{lead.telefon}</span>
        <ScoreBadge score={lead.mistral_score} />
      </div>
    );
  }

  return (
    <div
      className={`rounded border border-dash-border bg-dash-card p-4 ${
        pending ? "border-l-4 border-l-white" : ""
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold text-dash-text">{lead.name}</span>
        <span className="text-xs text-dash-muted">
          {formatRelativeDE(lead.dokumente_eingereicht_at ?? lead.created_at)}
        </span>
      </div>

      <p className="mb-2 text-sm text-dash-muted">
        {lead.email ?? "—"} · {lead.telefon ?? "—"}
      </p>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ScoreBadge score={lead.mistral_score} />
        {lead.mindestanforderung_ok ? (
          <span className="text-xs text-dash-success">✅ Vollständig</span>
        ) : (
          <span className="text-xs text-dash-warning">⚠️ Unvollständig</span>
        )}
      </div>

      {lead.mitarbeiter_notiz ? (
        <p className="mb-3 text-sm italic text-dash-muted">{lead.mitarbeiter_notiz}</p>
      ) : null}

      {pending ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => handleDecision("go")}
            className="rounded bg-dash-success/20 px-3 py-1.5 text-sm text-dash-success hover:bg-dash-success/30 disabled:opacity-50"
          >
            {loading === "go" ? "…" : "✅ GO — Termin anbieten"}
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => handleDecision("nogo")}
            className="rounded bg-dash-danger/20 px-3 py-1.5 text-sm text-dash-danger hover:bg-dash-danger/30 disabled:opacity-50"
          >
            {loading === "nogo" ? "…" : "❌ NO-GO — Ablehnen"}
          </button>
        </div>
      ) : decidedAt ? (
        <p className="text-sm text-dash-success">
          {localDecided && !lead.entscheidung_at
            ? "Entscheidung getroffen ✓"
            : `Entschieden am ${formatDateTimeDE(decidedAt)}`}
        </p>
      ) : null}
    </div>
  );
}
