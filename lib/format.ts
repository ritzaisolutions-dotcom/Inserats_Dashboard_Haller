export function formatDateDE(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export function formatDateHeaderDE(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeDE(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} Std.`;
  const diffD = Math.floor(diffH / 24);
  return `vor ${diffD} Tag${diffD === 1 ? "" : "en"}`;
}

export function formatDateTimeDE(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isWithin24Hours(datum: string, uhrzeit: string): boolean {
  const slotTime = new Date(`${datum}T${formatTime(uhrzeit)}:00`).getTime();
  const now = Date.now();
  const diff = slotTime - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

export function isTomorrow(datum: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return datum === tomorrow.toISOString().slice(0, 10);
}

export const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 18; h++) {
  for (const m of [0, 30]) {
    if (h === 18 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

export const DURATION_OPTIONS = [30, 45, 60, 90] as const;
