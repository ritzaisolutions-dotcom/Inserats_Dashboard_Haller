"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { HallerLogo } from "@/components/HallerLogo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError("Ungültige Zugangsdaten");
      return;
    }

    router.push("/inserate");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded border border-dash-border bg-dash-card p-8 shadow-xl">
        <HallerLogo variant="login" />
        <p className="mb-8 text-center text-sm text-dash-muted">Verwaltungssystem — Anmeldung</p>

        {!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
          <p className="mb-4 rounded border border-dash-warning/50 bg-dash-warning/10 p-3 text-xs text-dash-warning">
            NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt in .env.local
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-dash-muted">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text outline-none focus:border-dash-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs text-dash-muted">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text outline-none focus:border-dash-accent"
            />
          </div>

          {error ? (
            <p className="text-sm text-dash-danger">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-dash-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Anmelden…" : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
