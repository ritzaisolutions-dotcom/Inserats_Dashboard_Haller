"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Calendar, Home, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { HallerLogo } from "@/components/HallerLogo";
import { createClient } from "@/lib/supabase/client";

type NavProps = {
  unreadCount?: number;
};

export function Nav({ unreadCount = 0 }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/inserate", label: "Inserate", icon: Home },
    { href: "/termine", label: "Termine", icon: Calendar },
    { href: "/notifications", label: "Benachrichtigungen", icon: Bell, badge: unreadCount },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[220px] flex-col border-r border-dash-border bg-dash-card">
      <div className="border-b border-dash-border p-4">
        <HallerLogo variant="sidebar" />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-dash-accent/20 text-dash-text"
                  : "text-dash-muted hover:bg-dash-border/30 hover:text-dash-text"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-dash-danger px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-dash-border p-4">
        <p className="mb-2 truncate text-xs text-dash-muted">{email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-border/30 hover:text-dash-text"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
